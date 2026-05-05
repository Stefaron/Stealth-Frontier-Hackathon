import type { IndexerUtxoEntry } from "./types";

async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  let lastErr: unknown;
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (res.status === 429 || res.status >= 500) {
        if (i < retries - 1) {
          await new Promise((r) => setTimeout(r, 600 * 2 ** i));
          continue;
        }
      }
      return res;
    } catch (e) {
      lastErr = e;
      if (i < retries - 1) await new Promise((r) => setTimeout(r, 600 * 2 ** i));
    }
  }
  throw lastErr ?? new Error("fetchWithRetry exhausted");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeEntry(raw: Record<string, any>): IndexerUtxoEntry {
  return {
    mint: String(raw.mint ?? ""),
    slot: Number(raw.slot ?? 0),
    blockTime: Number(raw.blockTime ?? raw.block_time ?? 0),
    requestTxSignature: String(raw.requestTxSignature ?? raw.request_tx_signature ?? ""),
    callbackTxSignature: String(raw.callbackTxSignature ?? raw.callback_tx_signature ?? ""),
    depositor: String(raw.depositor ?? ""),
  };
}

export async function fetchIndexerUtxos(depositorAddress: string): Promise<IndexerUtxoEntry[]> {
  const url = `/proxy/data-indexer/utxo?user=${encodeURIComponent(depositorAddress)}&limit=1000`;
  const res = await fetchWithRetry(url);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Indexer ${res.status}: ${body.slice(0, 200)}`);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await res.json();
  const entries: unknown[] = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
  return (entries as Record<string, unknown>[]).map(normalizeEntry);
}
