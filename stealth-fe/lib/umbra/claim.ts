import {
  getClaimableUtxoScannerFunction,
  getReceiverClaimableUtxoToEncryptedBalanceClaimerFunction,
  getUmbraRelayer,
} from "@umbra-privacy/sdk";
import type { IUmbraClient } from "@umbra-privacy/sdk/interfaces";
import { getClaimReceiverIntoEncryptedProver } from "./prover";
import { UMBRA_RELAYER_URL } from "@/lib/constants";

export interface ScannedResult {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  received: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selfBurnable: any[];
  total: number;
}

export async function scanClaimableUtxos(client: IUmbraClient): Promise<ScannedResult> {
  const scanner = getClaimableUtxoScannerFunction({ client });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await scanner(0n as any, 0n as any, 10000n as any);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = result as any;
  // Combine all received variants — publicReceived = sent from public balance (our case)
  const received = [
    ...(Array.isArray(r.received) ? r.received : []),
    ...(Array.isArray(r.publicReceived) ? r.publicReceived : []),
    ...(Array.isArray(r.receiver) ? r.receiver : []),
  ];
  const selfBurnable = [
    ...(Array.isArray(r.selfBurnable) ? r.selfBurnable : []),
    ...(Array.isArray(r.publicSelfBurnable) ? r.publicSelfBurnable : []),
    ...(Array.isArray(r.ephemeral) ? r.ephemeral : []),
  ];
  console.log("[Claim] Received:", received.length, "Self:", selfBurnable.length);
  return { received, selfBurnable, total: received.length + selfBurnable.length };
}

export interface ClaimResult {
  claimedIndices: string[];
  alreadyClaimedIndices: string[];
  failedIndices: string[];
}

// Claim one at a time — batch fails entirely if any UTXO already spent (per Umbra devs)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function claimReceiverUtxos(client: IUmbraClient, utxos: readonly any[]): Promise<ClaimResult> {
  const relayer = getUmbraRelayer({ apiEndpoint: UMBRA_RELAYER_URL });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fetchBatchMerkleProof = (client as any).fetchBatchMerkleProof;
  const claimFn = getReceiverClaimableUtxoToEncryptedBalanceClaimerFunction(
    { client },
    {
      zkProver: getClaimReceiverIntoEncryptedProver(),
      relayer,
      fetchBatchMerkleProof,
    }
  );

  const result: ClaimResult = { claimedIndices: [], alreadyClaimedIndices: [], failedIndices: [] };

  for (const utxo of utxos) {
    const idx = String(utxo.insertionIndex);
    try {
      await claimFn([utxo]);
      result.claimedIndices.push(idx);
    } catch (e) {
      const msg = (e instanceof Error ? e.message : String(e)).toLowerCase();
      const causeStr = JSON.stringify(e).toLowerCase();
      const isAlready =
        msg.includes("already") || msg.includes("processed") ||
        causeStr.includes("already") || causeStr.includes("processed") ||
        (msg.includes("cannot read properties") && msg.includes("payload"));
      if (isAlready) {
        result.alreadyClaimedIndices.push(idx);
      } else {
        console.error(`[Claim] UTXO ${idx} failed:`, e);
        result.failedIndices.push(idx);
      }
    }
  }

  return result;
}
