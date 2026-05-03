import type { IUmbraSigner } from "@umbra-privacy/sdk/interfaces";
import { getTransactionEncoder, getTransactionDecoder } from "@solana/kit";
import { VersionedTransaction } from "@solana/web3.js";

// Signs via the wallet adapter's native signTransaction (v1 VersionedTransaction path).
// This avoids potential inconsistencies in the wallet-standard bridge when passing
// @solana/kit v2 wire bytes directly to wallet features.
export function createUmbraSignerFromAdapter(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: any,
  connectedAddress?: string
): IUmbraSigner {
  if (!adapter?.wallet?.accounts?.length) {
    throw new Error("Wallet must be connected and expose at least one account.");
  }
  if (typeof adapter.signTransaction !== "function") {
    throw new Error(
      "Wallet adapter must support signTransaction. Connect Phantom or Solflare."
    );
  }

  const wallet = adapter.wallet;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const account = (connectedAddress && wallet.accounts.length > 1)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? (wallet.accounts.find((a: any) => a.address === connectedAddress) ?? wallet.accounts[0])
    : wallet.accounts[0];

  const address = (connectedAddress ?? account.address) as string;
  const encoder = getTransactionEncoder();
  const decoder = getTransactionDecoder();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const signOne = async (transaction: any): Promise<any> => {
    const wireBytes = encoder.encode(transaction);
    // Deserialize into @solana/web3.js v1 VersionedTransaction
    const v1Tx = VersionedTransaction.deserialize(new Uint8Array(wireBytes));
    // Sign via the adapter's proven pathway (uses the adapter's internal account)
    const signedV1Tx = await adapter.signTransaction(v1Tx);
    // Convert signed v1 bytes back to @solana/kit v2 format
    const signedWireBytes = signedV1Tx.serialize();
    const decoded = decoder.decode(signedWireBytes);
    // Return with decoded.messageBytes so the RPC receives exactly what was signed
    return {
      ...transaction,
      messageBytes: decoded.messageBytes,
      signatures: { ...transaction.signatures, ...decoded.signatures },
    };
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const signMsgFeature = (wallet.features as any)?.["solana:signMessage"];

  return {
    address,
    signTransaction: signOne,
    signTransactions: (transactions: any[]) => Promise.all(transactions.map(signOne)),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    signMessage: async (message: any): Promise<any> => {
      if (!signMsgFeature) throw new Error("Wallet does not support signMessage");
      const [output] = await signMsgFeature.signMessage({ account, message });
      return { message, signature: output.signature, signer: address };
    },
  } as unknown as IUmbraSigner;
}
