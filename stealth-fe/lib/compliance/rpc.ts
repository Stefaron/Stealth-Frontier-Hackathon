const CONCURRENCY = 5;
const RETRY_DELAYS = [400, 1200, 3000];

export interface TransactionResult {
  meta: { logMessages: string[] | null } | null;
  slot: number;
  blockTime: number | null;
}

async function rpcCall(
  rpcUrl: string,
  method: string,
  params: unknown[]
): Promise<unknown> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt++) {
    const res = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      // Detect Helius free-tier batch rejection — not applicable for single calls but guard anyway
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

// Fetch up to `signatures.length` transactions with limited concurrency
export async function fetchTransactions(
  rpcUrl: string,
  signatures: string[]
): Promise<Map<string, TransactionResult>> {
  const results = new Map<string, TransactionResult>();
  for (let i = 0; i < signatures.length; i += CONCURRENCY) {
    const batch = signatures.slice(i, i + CONCURRENCY);
    await Promise.all(
      batch.map(async (sig) => {
        try {
          const tx = await rpcCall(rpcUrl, "getTransaction", [
            sig,
            { encoding: "json", maxSupportedTransactionVersion: 0 },
          ]);
          if (tx) results.set(sig, tx as TransactionResult);
        } catch {
          // skip failed fetches — they show up as missing in the map
        }
      })
    );
  }
  return results;
}

// Fetch recent signatures for an address (used for closed buffer PDAs)
export async function fetchSignaturesForAddress(
  rpcUrl: string,
  address: string,
  limit = 5
): Promise<string[]> {
  try {
    const sigs = (await rpcCall(rpcUrl, "getSignaturesForAddress", [
      address,
      { limit },
    ])) as Array<{ signature: string }> | null;
    return (sigs ?? []).map((s) => s.signature);
  } catch {
    return [];
  }
}

// Fetch signatures for multiple addresses with limited concurrency
export async function fetchSignaturesForAddresses(
  rpcUrl: string,
  addresses: string[],
  limit = 5
): Promise<Map<string, string[]>> {
  const results = new Map<string, string[]>();
  for (let i = 0; i < addresses.length; i += CONCURRENCY) {
    const batch = addresses.slice(i, i + CONCURRENCY);
    await Promise.all(
      batch.map(async (addr) => {
        const sigs = await fetchSignaturesForAddress(rpcUrl, addr, limit);
        results.set(addr, sigs);
      })
    );
  }
  return results;
}
