import type { ComplianceGrant } from "./types";

const STORAGE_KEY = "stealth:compliance-grants";

function load(): ComplianceGrant[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function persist(grants: ComplianceGrant[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(grants));
}

export function saveGrant(grant: ComplianceGrant): void {
  const grants = load();
  const existing = grants.findIndex((g) => g.nonce === grant.nonce);
  if (existing >= 0) {
    grants[existing] = grant;
  } else {
    grants.unshift(grant);
  }
  persist(grants);
}

export function deleteGrant(nonce: string): void {
  persist(load().filter((g) => g.nonce !== nonce));
}

export function getGrantsByTreasurer(treasurerAddress: string): ComplianceGrant[] {
  return load().filter((g) => g.treasurerAddress === treasurerAddress);
}

export function getGrantsByAuditor(auditorAddress: string): ComplianceGrant[] {
  return load().filter((g) => g.auditorAddress === auditorAddress);
}
