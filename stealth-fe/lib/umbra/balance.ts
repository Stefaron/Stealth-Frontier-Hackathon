import {
  getEncryptedBalanceQuerierFunction,
  getUserAccountQuerierFunction,
} from "@umbra-privacy/sdk";
import type { IUmbraClient } from "@umbra-privacy/sdk/interfaces";
import type {
  QueryEncryptedBalanceFunction,
  QueryUserAccountFunction,
} from "@umbra-privacy/sdk/interfaces";
import type { Address } from "@solana/kit";

export function getBalanceQuerier(
  client: IUmbraClient
): QueryEncryptedBalanceFunction {
  return getEncryptedBalanceQuerierFunction({ client });
}

export function getUserAccountQuerier(
  client: IUmbraClient
): QueryUserAccountFunction {
  return getUserAccountQuerierFunction({ client });
}

export async function queryBalances(
  client: IUmbraClient,
  mints: Address[]
): Promise<Map<string, { state: string; balance?: bigint }>> {
  const querier = getBalanceQuerier(client);
  const result = await querier(mints);
  const normalized = new Map<string, { state: string; balance?: bigint }>();
  for (const [mint, r] of result.entries()) {
    if (r.state === "shared") {
      normalized.set(mint, { state: "shared", balance: r.balance as bigint });
    } else {
      normalized.set(mint, { state: r.state });
    }
  }
  return normalized;
}
