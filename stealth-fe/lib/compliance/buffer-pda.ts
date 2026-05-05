import { getProgramDerivedAddress, getAddressEncoder, address as kitAddress } from "@solana/kit";
import type { Address } from "@solana/kit";
import { UMBRA_PROGRAM_ADDRESS, getAccountOffsetEncoder } from "@umbra-privacy/umbra-codama";

// Seed prefix for StealthPoolDepositInputBuffer PDA.
// Source: umbra-codama/src/instructions/depositIntoStealthPoolFromSharedBalanceV11.ts:461-465
// If Umbra program is redeployed, regenerate from new codama output.
const BUFFER_SEED_PREFIX = new Uint8Array([
  59, 75, 46, 222, 191, 204, 134, 94,
  4, 7, 84, 83, 213, 76, 50, 244,
  160, 195, 187, 58, 238, 230, 165, 193,
  95, 194, 178, 220, 18, 225, 86, 183,
]);

export async function deriveBufferPda(
  depositorAddress: string,
  bufferOffset: bigint
): Promise<string> {
  const [pda] = await getProgramDerivedAddress({
    programAddress: UMBRA_PROGRAM_ADDRESS as Address,
    seeds: [
      BUFFER_SEED_PREFIX,
      getAddressEncoder().encode(kitAddress(depositorAddress) as Address),
      getAccountOffsetEncoder().encode({ first: bufferOffset }),
    ],
  });
  return pda as string;
}
