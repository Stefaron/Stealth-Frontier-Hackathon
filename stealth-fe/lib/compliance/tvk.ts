import {
  getPoseidonHasher,
  getPoseidonDecryptor,
  assertPoseidonKey,
  assertPoseidonCiphertext,
} from "@umbra-privacy/sdk";
import { getAddressEncoder, getAddressDecoder, address as kitAddress } from "@solana/kit";
import type { Address } from "@solana/kit";
import { VK_LEVEL_ORDER } from "./types";
import type { VkLevel, ScanScope } from "./types";

function levelIndex(level: VkLevel): number {
  return VK_LEVEL_ORDER.indexOf(level);
}

// Convert hex string (with or without 0x prefix) / decimal string to bigint
export function parseViewingKey(raw: string): bigint {
  const s = raw.trim();
  if (s.startsWith("0x") || s.startsWith("0X")) return BigInt(s);
  // Check if it looks hex (all hex chars, 40+ chars)
  if (/^[0-9a-fA-F]{32,}$/.test(s)) return BigInt("0x" + s);
  // Decimal fallback
  return BigInt(s);
}

// Split a Solana address (32 bytes, base58) into two LE U128 halves
// low  = bytes[0..16] as little-endian u128
// high = bytes[16..32] as little-endian u128
function splitMintAddress(mintBase58: string): { low: bigint; high: bigint } {
  const bytes = getAddressEncoder().encode(kitAddress(mintBase58) as Address);
  let low = 0n;
  let high = 0n;
  for (let i = 0; i < 16; i++) low |= BigInt(bytes[i]) << BigInt(8 * i);
  for (let i = 0; i < 16; i++) high |= BigInt(bytes[16 + i]) << BigInt(8 * i);
  return { low, high };
}

// Reassemble destination address from decrypted [destLow, destHigh] bigints
export function reassembleAddress(destLow: bigint, destHigh: bigint): string {
  const bytes = new Uint8Array(32);
  for (let i = 0; i < 16; i++) {
    bytes[i] = Number((destLow >> BigInt(8 * i)) & 0xffn);
    bytes[16 + i] = Number((destHigh >> BigInt(8 * i)) & 0xffn);
  }
  return getAddressDecoder().decode(bytes) as string;
}

// Convert Poseidon ciphertext bytes (32-byte LE ReadonlyUint8Array) to bigint
export function ciphertextToBI(bytes: Readonly<Uint8Array>): bigint {
  let n = 0n;
  for (let i = 0; i < bytes.length; i++) n |= BigInt(bytes[i]) << BigInt(8 * i);
  return n;
}

// Descend viewing key from `vkLevel` down to second (TVK) for the given timestamp.
// CRITICAL: descend strictly BELOW starting level (< not <=) — off-by-one produces garbage TVK silently.
export async function descendToTvk(
  mvk: bigint,
  vkLevel: VkLevel,
  scope: ScanScope,
  timestampSec: bigint
): Promise<bigint> {
  const hasher = getPoseidonHasher();
  const date = new Date(Number(timestampSec) * 1000);

  // UTC time components
  const utcComponents: Record<string, bigint> = {
    yearly: BigInt(date.getUTCFullYear()),
    monthly: BigInt(date.getUTCMonth() + 1),
    daily: BigInt(date.getUTCDate()),
    hourly: BigInt(date.getUTCHours()),
    minute: BigInt(date.getUTCMinutes()),
    second: BigInt(date.getUTCSeconds()),
  };

  let currentKey = mvk;
  let startIdx = levelIndex(vkLevel);

  // master → mint: 3-input Poseidon with mint split into two U128 halves
  if (vkLevel === "master") {
    const { low, high } = splitMintAddress(scope.mint);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    currentKey = await hasher([currentKey, low, high] as any);
    startIdx = levelIndex("mint"); // re-anchor after master→mint step
  }

  // Descend strictly BELOW current level — use < to avoid re-hashing at auditor's level
  const descendOrder: Array<{ key: VkLevel; component: string }> = [
    { key: "yearly", component: "yearly" },
    { key: "monthly", component: "monthly" },
    { key: "daily", component: "daily" },
    { key: "hourly", component: "hourly" },
    { key: "minute", component: "minute" },
    { key: "second", component: "second" },
  ];

  for (const { key, component } of descendOrder) {
    const levelIdx = levelIndex(key);
    if (levelIdx > startIdx) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      currentKey = await hasher([currentKey, utcComponents[component]] as any);
    }
  }

  return currentKey;
}

const TWO_128 = 2n ** 128n;
const TWO_64 = 2n ** 64n;

// Decrypt linker ciphertexts with TVK.
// Returns null on error (wrong key, assertion failure).
// Returns plaintexts array; caller should validate with plaintextsLookValid().
export async function decryptLinkers(
  linkerBytes: Array<Readonly<Uint8Array>>,
  tvk: bigint
): Promise<bigint[] | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    assertPoseidonKey(tvk as any);
    const ciphertexts = linkerBytes.map(ciphertextToBI);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const c of ciphertexts) assertPoseidonCiphertext(c as any);
    const decryptor = getPoseidonDecryptor();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (await decryptor(ciphertexts as any, tvk as any)) as bigint[];
  } catch {
    return null;
  }
}

// Heuristic: wrong-key decrypts produce values >= 2^128 for address halves or >= 2^64 for amounts.
// No crisp auth tag — see compliance-summary.md §Step 7.
export function plaintextsLookValid(plaintexts: bigint[], isEta: boolean): boolean {
  if (plaintexts.length < 2) return false;
  const [destLow, destHigh] = plaintexts;
  if (destLow >= TWO_128 || destHigh >= TWO_128) return false;
  if (isEta && (plaintexts.length < 3 || plaintexts[2] >= TWO_64)) return false;
  return true;
}

// Derive a scoped viewing key from a master viewing key down to the target level.
export async function deriveScopedVk(
  mvk: bigint,
  targetLevel: VkLevel,
  scope: ScanScope
): Promise<bigint> {
  const hasher = getPoseidonHasher();

  let currentKey = mvk;
  let startIdx = levelIndex("master");
  const targetIdx = levelIndex(targetLevel);

  if (targetIdx > startIdx) {
    // master → mint step
    const { low, high } = splitMintAddress(scope.mint);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    currentKey = await hasher([currentKey, low, high] as any);
    startIdx = levelIndex("mint");
  }

  // Down through the time hierarchy
  const descendOrder: Array<{ key: VkLevel; component: keyof ScanScope }> = [
    { key: "yearly", component: "year" },
    { key: "monthly", component: "month" },
    { key: "daily", component: "day" },
    { key: "hourly", component: "hour" },
    { key: "minute", component: "minute" },
    { key: "second", component: "second" },
  ];

  for (const { key, component } of descendOrder) {
    const levelIdx = levelIndex(key);
    // We stop AT the target level
    if (levelIdx > startIdx && levelIdx <= targetIdx) {
      const val = scope[component];
      if (val === undefined) {
        throw new Error(`Missing scope component ${component} for target level ${targetLevel}`);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      currentKey = await hasher([currentKey, BigInt(val)] as any);
    }
  }

  return currentKey;
}
