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
    if (msg.includes("invalid private or public key")) {
      throw new Error(
        "Recipient's stealth key is invalid — their Umbra registration may be incomplete. Ask them to re-register."
      );
    }
    throw e;
  }
}
