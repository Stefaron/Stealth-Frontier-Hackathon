import {
  getDepositIntoStealthPoolFromPublicBalanceEventV1Decoder,
  getCreateStealthPoolDepositInputBufferEventV1Decoder,
  getDepositIntoStealthPoolFromSharedBalanceV11EventV1Decoder,
} from "@umbra-privacy/umbra-codama";
import type {
  DepositIntoStealthPoolFromPublicBalanceEventV1,
  CreateStealthPoolDepositInputBufferEventV1,
  DepositIntoStealthPoolFromSharedBalanceV11EventV1,
} from "@umbra-privacy/umbra-codama";

// Anchor event discriminators = sha256("event:<EventName>")[0:8]
// Precomputed to avoid per-log async hashing.
// Verified against: crypto.createHash('sha256').update('event:<Name>').digest().slice(0,8)
const ATA_EVENT_DISC = new Uint8Array([195, 64, 209, 156, 202, 109, 31, 122]);
const BUFFER_EVENT_DISC = new Uint8Array([130, 179, 215, 123, 55, 205, 252, 5]);
const ETA_EVENT_DISC = new Uint8Array([118, 173, 110, 113, 20, 196, 87, 139]);

function discMatches(bytes: Uint8Array, disc: Uint8Array): boolean {
  if (bytes.length < 8) return false;
  for (let i = 0; i < 8; i++) if (bytes[i] !== disc[i]) return false;
  return true;
}

export interface AtaRecord {
  kind: "ata";
  event: DepositIntoStealthPoolFromPublicBalanceEventV1;
  signature: string;
}

export interface BufferRecord {
  kind: "buffer";
  event: CreateStealthPoolDepositInputBufferEventV1;
  signature: string;
}

export interface EtaHint {
  kind: "eta_hint";
  event: DepositIntoStealthPoolFromSharedBalanceV11EventV1;
  signature: string;
}

export type ParsedEvent = AtaRecord | BufferRecord | EtaHint;

const LOG_DATA_PREFIX = "Program data: ";

export function parseEventLogs(logMessages: string[] | null, signature: string): ParsedEvent[] {
  if (!logMessages) return [];
  const results: ParsedEvent[] = [];

  for (const line of logMessages) {
    if (!line.startsWith(LOG_DATA_PREFIX)) continue;

    let bytes: Uint8Array;
    try {
      bytes = Uint8Array.from(atob(line.slice(LOG_DATA_PREFIX.length)), (c) =>
        c.charCodeAt(0)
      );
    } catch {
      continue;
    }

    if (bytes.length < 8) continue;

    // Each branch: read starting at byte 8 (skipping 8-byte discriminator)
    if (discMatches(bytes, ATA_EVENT_DISC)) {
      try {
        const [event] = getDepositIntoStealthPoolFromPublicBalanceEventV1Decoder().read(
          bytes,
          8
        );
        results.push({ kind: "ata", event, signature });
      } catch {
        // corrupt / wrong-length — skip
      }
    } else if (discMatches(bytes, BUFFER_EVENT_DISC)) {
      try {
        const [event] = getCreateStealthPoolDepositInputBufferEventV1Decoder().read(
          bytes,
          8
        );
        results.push({ kind: "buffer", event, signature });
      } catch {
        // corrupt / wrong-length — skip
      }
    } else if (discMatches(bytes, ETA_EVENT_DISC)) {
      try {
        const [event] = getDepositIntoStealthPoolFromSharedBalanceV11EventV1Decoder().read(
          bytes,
          8
        );
        results.push({ kind: "eta_hint", event, signature });
      } catch {
        // corrupt / wrong-length — skip
      }
    }
  }

  return results;
}
