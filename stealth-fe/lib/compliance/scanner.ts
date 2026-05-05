import { fetchIndexerUtxos } from "./indexer";
import { fetchTransactions, fetchSignaturesForAddresses } from "./rpc";
import { parseEventLogs } from "./anchor-events";
import type { ParsedEvent, AtaRecord, BufferRecord } from "./anchor-events";
import { deriveBufferPda } from "./buffer-pda";
import {
  descendToTvk,
  decryptLinkers,
  reassembleAddress,
  plaintextsLookValid,
  parseViewingKey,
} from "./tvk";
import type { ScanScope, ScanResult, ScanProgress, DecryptedUtxoTransaction, VkLevel } from "./types";
import { VK_LEVEL_ORDER } from "./types";
import { getAddressDecoder } from "@solana/kit";

// In-memory indexer cache per depositor (lives for the browser session)
const indexerCache = new Map<string, Awaited<ReturnType<typeof fetchIndexerUtxos>>>();

function getRpcUrl(): string {
  return process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? "https://api.devnet.solana.com";
}

// Check if entry.blockTime falls within the scope time window
function inScopeTime(blockTime: number, scope: ScanScope): boolean {
  const date = new Date(blockTime * 1000);
  if (scope.year !== undefined && date.getUTCFullYear() !== scope.year) return false;
  if (scope.month !== undefined && date.getUTCMonth() + 1 !== scope.month) return false;
  if (scope.day !== undefined && date.getUTCDate() !== scope.day) return false;
  if (scope.hour !== undefined && date.getUTCHours() !== scope.hour) return false;
  if (scope.minute !== undefined && date.getUTCMinutes() !== scope.minute) return false;
  if (scope.second !== undefined && date.getUTCSeconds() !== scope.second) return false;
  return true;
}

// Decode event mint bytes to base58 string
function decodeMintBytes(bytes: Readonly<Uint8Array>): string {
  try {
    return getAddressDecoder().decode(new Uint8Array(bytes)) as string;
  } catch {
    return "";
  }
}

export function validateVkLevelVsScope(vkLevel: VkLevel, scope: ScanScope): string | null {
  const vkIdx = VK_LEVEL_ORDER.indexOf(vkLevel);
  const scopeIdx = VK_LEVEL_ORDER.indexOf(scope.kind);
  if (vkIdx > scopeIdx) {
    return `VK level "${vkLevel}" is narrower than scope kind "${scope.kind}" — impossible to descend upward`;
  }
  return null;
}

export async function scanCompliance(
  depositorAddress: string,
  viewingKeyRaw: string,
  vkLevel: VkLevel,
  scope: ScanScope,
  eventLimit = 10,
  beforeSlot?: number
): Promise<ScanResult> {
  const rpcUrl = getRpcUrl();
  const mvk = parseViewingKey(viewingKeyRaw);
  const progress: ScanProgress = {
    indexerCount: 0,
    inScopeCount: 0,
    batchesFetched: 0,
    eventsFound: 0,
    decrypted: 0,
    decryptionFailed: 0,
    wrongMint: 0,
    outOfScopeTime: 0,
    looksBogus: 0,
  };

  // ── Step 1: Enumerate UTXOs via data-indexer (cached) ──────────────────────
  let allEntries = indexerCache.get(depositorAddress);
  if (!allEntries) {
    allEntries = await fetchIndexerUtxos(depositorAddress);
    indexerCache.set(depositorAddress, allEntries);
  }
  progress.indexerCount = allEntries.length;

  // ── Step 2: In-memory pre-filter ────────────────────────────────────────────
  const inScope = allEntries.filter((e) => {
    if (beforeSlot !== undefined && e.slot >= beforeSlot) return false;
    if (e.mint && e.mint !== scope.mint) {
      progress.wrongMint++;
      return false;
    }
    if (!inScopeTime(e.blockTime, scope)) {
      progress.outOfScopeTime++;
      return false;
    }
    return true;
  });
  progress.inScopeCount = inScope.length;

  if (inScope.length === 0) {
    return { transactions: [], progress, hasMore: false };
  }

  // Work with a slice to avoid decrypting far more than needed
  const workSet = inScope.slice(0, eventLimit * 4);

  // ── Step 3: Batch-fetch request transactions ─────────────────────────────────
  const requestSigs = [...new Set(workSet.map((e) => e.requestTxSignature).filter(Boolean))];
  const txMap = await fetchTransactions(rpcUrl, requestSigs);
  progress.batchesFetched++;

  // ── Step 4: Decode Anchor event logs ─────────────────────────────────────────
  const ataRecords: AtaRecord[] = [];
  const etaHints: Array<{
    sig: string;
    depositor: string;
    bufferOffset: bigint;
    insertionTimestamp: bigint;
    mint: string;
    slot: number;
    blockTime: number;
  }> = [];

  for (const entry of workSet) {
    const tx = txMap.get(entry.requestTxSignature);
    if (!tx?.meta?.logMessages) continue;

    const events = parseEventLogs(tx.meta.logMessages, entry.requestTxSignature);
    progress.eventsFound += events.length;

    for (const ev of events) {
      if (ev.kind === "ata") {
        ataRecords.push(ev);
      } else if (ev.kind === "eta_hint") {
        etaHints.push({
          sig: ev.signature,
          depositor: decodeMintBytes(new Uint8Array(ev.event.depositor as Uint8Array)),
          bufferOffset: ev.event.stealthPoolDepositInputBufferOffset.first,
          insertionTimestamp: ev.event.insertionTimestamp.first,
          mint: decodeMintBytes(new Uint8Array(ev.event.mint as Uint8Array)),
          slot: entry.slot,
          blockTime: entry.blockTime,
        });
      }
    }
  }

  // ── Step 5: ETA fallback — derive buffer PDAs and fetch create-buffer txs ────
  const bufferRecords: BufferRecord[] = [];
  if (etaHints.length > 0) {
    // 5a: derive buffer PDAs
    const pdasToHints = new Map<
      string,
      (typeof etaHints)[0]
    >();
    for (const hint of etaHints) {
      try {
        const pda = await deriveBufferPda(hint.depositor || depositorAddress, hint.bufferOffset);
        pdasToHints.set(pda, hint);
      } catch {
        progress.decryptionFailed++;
      }
    }

    // 5b: batch signature list for each PDA
    if (pdasToHints.size > 0) {
      const sigMap = await fetchSignaturesForAddresses(rpcUrl, [...pdasToHints.keys()], 5);
      progress.batchesFetched++;

      // 5c: collect candidate txs (exclude already-fetched requestTxSignatures)
      const knownSigs = new Set(requestSigs);
      const candidateSigs: string[] = [];
      for (const sigs of sigMap.values()) {
        for (const s of sigs) {
          if (!knownSigs.has(s) && !candidateSigs.includes(s)) {
            candidateSigs.push(s);
          }
        }
      }

      if (candidateSigs.length > 0) {
        const candidateTxMap = await fetchTransactions(rpcUrl, candidateSigs);
        progress.batchesFetched++;

        // Build joinKey → buffer record map
        const joinKeyToBuffer = new Map<string, BufferRecord>();
        for (const [sig, tx] of candidateTxMap) {
          if (!tx?.meta?.logMessages) continue;
          const events = parseEventLogs(tx.meta.logMessages, sig);
          for (const ev of events) {
            if (ev.kind !== "buffer") continue;
            const depAddr = decodeMintBytes(new Uint8Array(ev.event.depositor as Uint8Array));
            const offset = ev.event.offset.first;
            const joinKey = `${depAddr}:${offset.toString()}`;
            joinKeyToBuffer.set(joinKey, ev);
          }
        }

        // 5d: match hints → buffer records
        for (const [pda, hint] of pdasToHints) {
          const joinKey = `${hint.depositor || depositorAddress}:${hint.bufferOffset.toString()}`;
          const bufferRecord = joinKeyToBuffer.get(joinKey);
          if (bufferRecord) {
            bufferRecords.push(bufferRecord);
          } else {
            progress.decryptionFailed++;
          }
          void pda; // used above for sigMap lookup
        }
      }
    }
  }

  // ── Step 6-7: TVK descent + decrypt + validate for each record ───────────────
  const transactions: DecryptedUtxoTransaction[] = [];
  let looksBogusCount = 0;

  // Helper: process one record
  async function processRecord(
    record: AtaRecord | BufferRecord,
    entrySlot: number,
    entryBlockTime: number
  ): Promise<DecryptedUtxoTransaction | null> {
    const isEta = record.kind === "buffer";
    const ev = record.event;

    const insertionTimestamp = ev.insertionTimestamp.first;

    // Collect linker bytes
    const linkerBytes: Array<Readonly<Uint8Array>> = [
      new Uint8Array(ev.linkerEncryption0.first as Uint8Array),
      new Uint8Array(ev.linkerEncryption1.first as Uint8Array),
    ];
    if (isEta && "linkerEncryption2" in ev) {
      linkerBytes.push(new Uint8Array(ev.linkerEncryption2.first as Uint8Array));
    }

    // Descend TVK
    let tvk: bigint;
    try {
      tvk = await descendToTvk(mvk, vkLevel, scope, insertionTimestamp);
    } catch {
      progress.decryptionFailed++;
      return null;
    }

    // Decrypt
    const plaintexts = await decryptLinkers(linkerBytes, tvk);
    if (!plaintexts) {
      progress.decryptionFailed++;
      return null;
    }

    // Validate (heuristic wrong-key detection)
    if (!plaintextsLookValid(plaintexts, isEta)) {
      looksBogusCount++;
      progress.looksBogus++;
      return null;
    }

    progress.decrypted++;

    const [destLow, destHigh] = plaintexts;
    const destination = reassembleAddress(destLow, destHigh);

    // Amount: ATA = plaintext transferAmount; ETA = decrypted third linker
    let amount: bigint;
    if (!isEta) {
      amount = (ev as AtaRecord["event"]).transferAmount.first;
    } else {
      amount = plaintexts[2];
    }

    // Mint: prefer chain mint from event, fallback to scope.mint
    let mint = scope.mint;
    if (!isEta && "mint" in ev) {
      const evMint = decodeMintBytes(new Uint8Array(ev.mint as Uint8Array));
      if (evMint) mint = evMint;
    }

    return {
      signature: record.signature,
      slot: entrySlot,
      timestamp: Number(insertionTimestamp),
      mint,
      amount,
      destination,
      sourceVariant: isEta ? "ETA" : "ATA",
    };
  }

  // Build a slot/blockTime lookup from workSet
  const sigToEntry = new Map(workSet.map((e) => [e.requestTxSignature, e]));

  // Process ATA records
  for (const record of ataRecords) {
    if (transactions.length >= eventLimit) break;
    const entry = sigToEntry.get(record.signature);
    const result = await processRecord(record, entry?.slot ?? 0, entry?.blockTime ?? 0);
    if (result) transactions.push(result);
  }

  // Process matched buffer records
  for (const record of bufferRecords) {
    if (transactions.length >= eventLimit) break;
    const result = await processRecord(record, 0, 0);
    if (result) transactions.push(result);
  }

  // Determine oldest slot
  const slots = transactions.map((t) => t.slot).filter((s) => s > 0);
  const oldestSlot = slots.length > 0 ? Math.min(...slots) : undefined;
  const hasMore = inScope.length > workSet.length || transactions.length >= eventLimit;

  // Surface "wrong VK likely" warning when >50% of attempts look bogus
  const totalAttempts = progress.decrypted + looksBogusCount;
  const warning =
    totalAttempts >= 3 && looksBogusCount / totalAttempts > 0.5
      ? "More than 50% of decrypted outputs look invalid — viewing key may be wrong or from a different scope."
      : undefined;

  return { transactions, progress, hasMore, oldestSlot, warning };
}

// Clear cached indexer data for a depositor (call after revoke or manual refresh)
export function clearIndexerCache(depositorAddress?: string): void {
  if (depositorAddress) {
    indexerCache.delete(depositorAddress);
  } else {
    indexerCache.clear();
  }
}
