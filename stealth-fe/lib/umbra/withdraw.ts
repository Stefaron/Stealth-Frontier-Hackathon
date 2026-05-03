import { getEncryptedBalanceToPublicBalanceDirectWithdrawerFunction } from "@umbra-privacy/sdk";
import type { IUmbraClient } from "@umbra-privacy/sdk/interfaces";
import type { Address } from "@solana/kit";

export interface WithdrawResult {
  queueSignature: string;
  callbackStatus?: "finalized" | "pruned" | "timed-out";
}

export async function withdrawToPublic(
  client: IUmbraClient,
  destinationAddress: Address,
  mint: Address,
  amount: bigint
): Promise<WithdrawResult> {
  const withdrawFn = getEncryptedBalanceToPublicBalanceDirectWithdrawerFunction(
    { client }
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await withdrawFn(destinationAddress, mint, amount as any);
  return {
    queueSignature: result.queueSignature as string,
    callbackStatus: result.callbackStatus,
  };
}
