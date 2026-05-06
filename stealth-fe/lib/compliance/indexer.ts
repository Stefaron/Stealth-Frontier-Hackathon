import type { IndexerUtxoEntry } from "./types";

const RETRY_DELAYS = [400, 1200, 3000];

async function rpcCall(rpcUrl: string, method: string, params: unknown[]): Promise<unknown> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt++) {
    const res = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      lastErr = new Error(`RPC HTTP ${res.status}: ${JSON.stringify(json).slice(0, 200)}`);
      if (attempt < RETRY_DELAYS.length) {
        await new Promise((r) => setTimeout(r, RETRY_DELAYS[attempt]));
        continue;
      }
      throw lastErr;
    }
    if (json?.error) throw new Error(`RPC ${json.error.code}: ${json.error.message}`);
    return json?.result ?? null;
  }
  throw lastErr;
}

// Fetch recent transactions for a depositor address via Solana RPC.
// The Umbra indexer API uses protobuf binary responses and only supports
// index-range pagination — no per-depositor filter exists. We use
// getSignaturesForAddress instead to get the treasurer's on-chain tx history,
// then parse Anchor event logs in the scanner to find Umbra mixer events.
export async function fetchIndexerUtxos(depositorAddress: string): Promise<IndexerUtxoEntry[]> {
  const rpcUrl =
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? "https://api.devnet.solana.com";

  const sigs = (await rpcCall(rpcUrl, "getSignaturesForAddress", [
    depositorAddress,
    { limit: 1000, commitment: "confirmed" },
  ])) as Array<{
    signature: string;
    slot: number;
    blockTime: number | null;
    err: unknown;
  }> | null;

  return (sigs ?? [])
    .filter((s) => s.signature && !s.err)
    .map((s) => ({
      mint: "",
      slot: s.slot,
      blockTime: s.blockTime ?? 0,
      requestTxSignature: s.signature,
      callbackTxSignature: "",
      depositor: depositorAddress,
    }));
}
