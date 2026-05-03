import { createSignerFromWalletAccount } from "@umbra-privacy/sdk";
import type { IUmbraSigner } from "@umbra-privacy/sdk/interfaces";

export function createUmbraSignerFromAdapter(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: any,
  connectedAddress?: string
): IUmbraSigner {
  if (!adapter?.standard || !adapter?.wallet?.accounts?.length) {
    throw new Error(
      "Wallet must support wallet-standard with at least one account. Connect Phantom or another wallet-standard wallet."
    );
  }
  const wallet = adapter.wallet;
  // Match account to currently connected address (wallet may expose multiple accounts)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const account = (connectedAddress && wallet.accounts.length > 1)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? (wallet.accounts.find((a: any) => a.address === connectedAddress) ?? wallet.accounts[0])
    : wallet.accounts[0];
  return createSignerFromWalletAccount(wallet, account);
}
