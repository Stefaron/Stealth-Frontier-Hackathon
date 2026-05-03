export const SOLANA_NETWORK =
  (process.env.NEXT_PUBLIC_SOLANA_NETWORK as "devnet" | "mainnet" | "localnet" | undefined) ?? "devnet";

export const SOLANA_RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ??
  "https://api.devnet.solana.com";

export const SOLANA_WS_URL =
  process.env.NEXT_PUBLIC_SOLANA_WS_URL ??
  "wss://api.devnet.solana.com";

export const UMBRA_RELAYER_URL =
  process.env.NEXT_PUBLIC_UMBRA_RELAYER_URL ??
  "https://relayer-dev.umbraprivacy.com";

export const UMBRA_INDEXER_URL =
  process.env.NEXT_PUBLIC_UMBRA_INDEXER_URL ??
  "https://indexer-dev.umbraprivacy.com";

// USDC devnet mint
export const USDC_DEVNET_MINT =
  "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU" as const;

// Well-known mints for display
export const KNOWN_MINTS: Record<string, { symbol: string; decimals: number }> = {
  [USDC_DEVNET_MINT]: { symbol: "USDC", decimals: 6 },
  So11111111111111111111111111111111111111112: { symbol: "SOL", decimals: 9 },
};
