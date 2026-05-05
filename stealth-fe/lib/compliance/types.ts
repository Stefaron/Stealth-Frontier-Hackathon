export type VkLevel =
  | "master"
  | "mint"
  | "yearly"
  | "monthly"
  | "daily"
  | "hourly"
  | "minute"
  | "second";

export const VK_LEVEL_ORDER: readonly VkLevel[] = [
  "master",
  "mint",
  "yearly",
  "monthly",
  "daily",
  "hourly",
  "minute",
  "second",
] as const;

export interface ScanScope {
  kind: VkLevel;
  mint: string;
  year?: number;
  month?: number;
  day?: number;
  hour?: number;
  minute?: number;
  second?: number;
}

export interface IndexerUtxoEntry {
  mint: string;
  slot: number;
  blockTime: number;
  requestTxSignature: string;
  callbackTxSignature: string;
  depositor: string;
}

export interface DecryptedUtxoTransaction {
  signature: string;
  slot: number;
  timestamp: number;
  mint: string;
  amount: bigint;
  destination: string;
  sourceVariant: "ATA" | "ETA";
}

export interface ScanProgress {
  indexerCount: number;
  inScopeCount: number;
  batchesFetched: number;
  eventsFound: number;
  decrypted: number;
  decryptionFailed: number;
  wrongMint: number;
  outOfScopeTime: number;
  looksBogus: number;
}

export interface ScanResult {
  transactions: DecryptedUtxoTransaction[];
  progress: ScanProgress;
  hasMore: boolean;
  oldestSlot?: number;
  warning?: string;
}
