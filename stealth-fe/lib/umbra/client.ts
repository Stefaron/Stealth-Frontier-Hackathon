import { getUmbraClient, getUmbraRelayer } from "@umbra-privacy/sdk";
import type { IUmbraClient, IUmbraSigner } from "@umbra-privacy/sdk/interfaces";
import { SOLANA_RPC_URL, SOLANA_WS_URL, UMBRA_RELAYER_URL, UMBRA_INDEXER_URL } from "@/lib/constants";

export type { IUmbraClient };

export async function createUmbraClient(
  signer: IUmbraSigner
): Promise<IUmbraClient> {
  const network = (process.env.NEXT_PUBLIC_UMBRA_NETWORK ?? "devnet") as
    | "devnet"
    | "mainnet"
    | "localnet";
  return getUmbraClient({
    signer,
    network,
    rpcUrl: SOLANA_RPC_URL,
    rpcSubscriptionsUrl: SOLANA_WS_URL,
    indexerApiEndpoint: UMBRA_INDEXER_URL,
    deferMasterSeedSignature: false,
  });
}

export function createRelayer() {
  return getUmbraRelayer({ apiEndpoint: UMBRA_RELAYER_URL });
}
