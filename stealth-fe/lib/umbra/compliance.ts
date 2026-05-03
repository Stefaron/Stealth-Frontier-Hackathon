import {
  getComplianceGrantIssuerFunction,
  getComplianceGrantRevokerFunction,
  assertRcEncryptionNonce,
} from "@umbra-privacy/sdk";
import type { IUmbraClient } from "@umbra-privacy/sdk/interfaces";
import type { Address } from "@solana/kit";
import { getUserAccountQuerier } from "./balance";

function generateNonceBigint(): bigint {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let n = 0n;
  for (let i = 0; i < 16; i++) {
    n |= BigInt(bytes[i]) << BigInt(8 * i);
  }
  return n;
}

export async function issueComplianceGrant(
  client: IUmbraClient,
  auditorAddress: Address
): Promise<{ signature: string; nonce: string }> {
  const queryAccount = getUserAccountQuerier(client);

  const [granterResult, auditorResult] = await Promise.all([
    queryAccount(client.signer.address as Address),
    queryAccount(auditorAddress),
  ]);

  if (granterResult.state !== "exists") {
    throw new Error("Treasurer not registered with Umbra");
  }
  if (auditorResult.state !== "exists") {
    throw new Error("Auditor address is not registered with Umbra");
  }
  if (!granterResult.data.isUserAccountX25519KeyRegistered) {
    throw new Error("Treasurer X25519 key not registered");
  }
  if (!auditorResult.data.isUserAccountX25519KeyRegistered) {
    throw new Error("Auditor X25519 key not registered");
  }

  const nonceBigint = generateNonceBigint();
  assertRcEncryptionNonce(nonceBigint);

  const issueFn = getComplianceGrantIssuerFunction({ client });
  const signature = await issueFn(
    auditorAddress,
    granterResult.data.x25519PublicKey,
    auditorResult.data.x25519PublicKey,
    nonceBigint
  );

  return { signature: signature as string, nonce: nonceBigint.toString(16) };
}

export async function revokeComplianceGrant(
  client: IUmbraClient,
  auditorAddress: Address,
  nonceHex: string
): Promise<string> {
  const queryAccount = getUserAccountQuerier(client);

  const [granterResult, auditorResult] = await Promise.all([
    queryAccount(client.signer.address as Address),
    queryAccount(auditorAddress),
  ]);

  if (granterResult.state !== "exists" || auditorResult.state !== "exists") {
    throw new Error("Account not found");
  }

  const nonceBigint = BigInt("0x" + nonceHex);
  assertRcEncryptionNonce(nonceBigint);

  const revokeFn = getComplianceGrantRevokerFunction({ client });
  const signature = await revokeFn(
    auditorAddress,
    granterResult.data.x25519PublicKey,
    auditorResult.data.x25519PublicKey,
    nonceBigint
  );

  return signature as string;
}
