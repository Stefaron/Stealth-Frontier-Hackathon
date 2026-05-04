import { getPublicBalanceToReceiverClaimableUtxoCreatorFunction } from "@umbra-privacy/sdk";
import type { IUmbraClient } from "@umbra-privacy/sdk/interfaces";
import type { Address } from "@solana/kit";
import { getReceiverUtxoFromPublicProver } from "./prover";

export interface PrivateSendArgs {
  recipientAddress: Address;
  mint: Address;
  amount: bigint;
}

export async function privateSend(
  client: IUmbraClient,
  args: PrivateSendArgs
): Promise<string> {
  const sendFn = getPublicBalanceToReceiverClaimableUtxoCreatorFunction(
    { client },
    { zkProver: getReceiverUtxoFromPublicProver() }
  );

  try {
    const result = await sendFn({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      amount: args.amount as any,
      destinationAddress: args.recipientAddress,
      mint: args.mint,
    });
    return result.createUtxoSignature as string;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const causeStr = JSON.stringify(e).toLowerCase();
    if (
      msg.toLowerCase().includes("already been processed") ||
      msg.toLowerCase().includes("already processed") ||
      causeStr.includes("already been processed") ||
      causeStr.includes("already processed")
    ) {
      // TX confirmed on-chain — SDK failed on confirmation retry, not on send
      return "confirmed-on-chain";
    }
    if (msg.includes("invalid private or public key")) {
      throw new Error(
        "Recipient's stealth key is invalid — their Umbra registration may be incomplete. Ask them to re-register."
      );
    }
    throw e;
  }
}
