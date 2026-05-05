"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useUmbra } from "@/context/UmbraContext";
import { useToast } from "@/context/ToastContext";
import { issueComplianceGrant, revokeComplianceGrant } from "@/lib/umbra/compliance";
import { getMasterViewingKeyDeriver } from "@umbra-privacy/sdk";
import { saveGrant, deleteGrant, getGrantsByTreasurer } from "@/lib/grants-store";
import type { ComplianceGrant } from "@/lib/types";
import type { Address } from "@solana/kit";

export default function AuditorsPage() {
  const { client } = useUmbra();
  const { publicKey } = useWallet();
  const toast = useToast();

  const [grants, setGrants] = useState<ComplianceGrant[]>([]);
  const [auditorInput, setAuditorInput] = useState("");
  const [labelInput, setLabelInput] = useState("");
  const [viewingKeyInput, setViewingKeyInput] = useState("");
  const [isDerivingVk, setIsDerivingVk] = useState(false);
  const [isIssuing, setIsIssuing] = useState(false);
  const [isRevoking, setIsRevoking] = useState<string | null>(null);

  useEffect(() => {
    if (publicKey) {
      setGrants(getGrantsByTreasurer(publicKey.toBase58()));
    }
  }, [publicKey]);

  const handleIssue = async () => {
    if (!client || !publicKey || !auditorInput.trim()) return;
    setIsIssuing(true);
    const loadingId = toast.loading("Issuing compliance grant…");
    try {
      const { signature, nonce } = await issueComplianceGrant(
        client,
        auditorInput.trim() as Address
      );
      const grant: ComplianceGrant = {
        auditorAddress: auditorInput.trim(),
        treasurerAddress: publicKey.toBase58(),
        nonce,
        issuedAt: Date.now(),
        label: labelInput.trim() || undefined,
        viewingKey: viewingKeyInput.trim() || undefined,
      };
      saveGrant(grant);
      setGrants(getGrantsByTreasurer(publicKey.toBase58()));
      setAuditorInput("");
      setLabelInput("");
      setViewingKeyInput("");
      toast.dismiss(loadingId);
      toast.success(`Grant issued · ${signature.slice(0, 16)}…`);
    } catch (e) {
      toast.dismiss(loadingId);
      toast.error(e instanceof Error ? e.message : "Failed to issue grant");
    } finally {
      setIsIssuing(false);
    }
  };

  const handleDeriveVk = async () => {
    if (!client) return;
    setIsDerivingVk(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mvk: bigint = await getMasterViewingKeyDeriver({ client: client as any })();
      const hex = mvk.toString(16);
      setViewingKeyInput(hex);
      await navigator.clipboard.writeText(hex).catch(() => {});
      toast.success("Viewing key derived and copied to clipboard");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to derive viewing key");
    } finally {
      setIsDerivingVk(false);
    }
  };

  const handleRevoke = async (grant: ComplianceGrant) => {
    if (!client || isRevoking) return;
    setIsRevoking(grant.nonce);
    const loadingId = toast.loading("Revoking grant…");
    try {
      const sig = await revokeComplianceGrant(
        client,
        grant.auditorAddress as Address,
        grant.nonce
      );
      deleteGrant(grant.nonce);
      setGrants((prev) => prev.filter((g) => g.nonce !== grant.nonce));
      toast.dismiss(loadingId);
      toast.success(`Grant revoked · ${sig.slice(0, 16)}…`);
    } catch (e) {
      toast.dismiss(loadingId);
      toast.error(e instanceof Error ? e.message : "Failed to revoke grant");
    } finally {
      setIsRevoking(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-8 py-12">
      <div className="mb-8">
        <p className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/25 mb-3">
          Treasurer · Auditors
        </p>
        <h1 className="text-3xl font-bold text-white mb-1">Compliance Grants</h1>
        <p className="text-white/35 text-sm">
          Grant auditors scoped viewing access via X25519 compliance grants.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white/[0.025] border border-white/[0.06] rounded-2xl p-6">
          <h2 className="text-sm font-bold text-white mb-5">Issue New Grant</h2>

          <label className="block mb-3">
            <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-white/30 block mb-1.5">
              Auditor Wallet Address
            </span>
            <input
              type="text"
              value={auditorInput}
              onChange={(e) => setAuditorInput(e.target.value)}
              placeholder="Base58 address…"
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white/70 text-sm font-mono placeholder:text-white/20 focus:outline-none focus:border-violet-500/40 transition-colors"
            />
          </label>

          <label className="block mb-4">
            <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-white/30 block mb-1.5">
              Label (optional)
            </span>
            <input
              type="text"
              value={labelInput}
              onChange={(e) => setLabelInput(e.target.value)}
              placeholder="e.g. Deloitte Q2 2025"
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white/70 text-sm placeholder:text-white/20 focus:outline-none focus:border-violet-500/40 transition-colors"
            />
          </label>

          <div className="block mb-5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-white/30">
                Viewing Key{" "}
                <span className="text-white/15 normal-case tracking-normal">(optional)</span>
              </span>
              <button
                type="button"
                onClick={handleDeriveVk}
                disabled={isDerivingVk || !client}
                className="font-mono text-[8px] text-violet-400/70 tracking-widest uppercase hover:text-violet-400 transition-colors disabled:opacity-30"
              >
                {isDerivingVk ? "Deriving…" : "Derive from wallet ↗"}
              </button>
            </div>
            <textarea
              value={viewingKeyInput}
              onChange={(e) => setViewingKeyInput(e.target.value)}
              placeholder="Paste hex master viewing key, or click 'Derive from wallet'…"
              rows={2}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white/70 text-[11px] font-mono placeholder:text-white/20 focus:outline-none focus:border-violet-500/40 transition-colors resize-none"
            />
            <span className="font-mono text-[8px] text-white/15 mt-1 block">
              Stored locally with grant · enables auditor compliance scanner
            </span>
          </div>

          <button
            onClick={handleIssue}
            disabled={isIssuing || !auditorInput.trim()}
            className="w-full bg-white text-[#0d0c0a] text-[10px] font-bold tracking-widest uppercase px-6 py-3 rounded-full hover:bg-white/90 transition-all duration-200 disabled:opacity-40"
          >
            {isIssuing ? "Issuing Grant…" : "Issue Grant"}
          </button>
        </div>

        <div className="bg-white/[0.015] border border-white/[0.05] rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white mb-2">How it works</h3>
          <div className="space-y-3 text-sm text-white/35 leading-relaxed">
            <p>
              A compliance grant reencrypts your encrypted outputs under the
              auditor&apos;s X25519 key using Arcium MPC.
            </p>
            <p>
              The auditor can then view your transaction history within the
              scoped grant without accessing your private key.
            </p>
            <p>
              Grants are revocable on-chain at any time. Each grant has a unique
              nonce to prevent replay.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-white/[0.05]">
            <span className="font-mono text-[9px] text-white/15 tracking-widest">
              GRANT·ECDH·scoped-key
            </span>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-bold text-white/60 mb-4 uppercase tracking-widest">
          Active Grants ({grants.length})
        </h2>
        {grants.length === 0 ? (
          <div className="bg-white/[0.015] border border-white/[0.05] rounded-2xl p-8 text-center">
            <p className="text-white/25 text-sm">No active grants. Issue one above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {grants.map((grant) => (
              <div
                key={grant.nonce}
                className="bg-white/[0.025] border border-white/[0.06] rounded-2xl px-5 py-4 flex items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {grant.label && (
                      <span className="text-white/60 text-sm font-medium truncate">
                        {grant.label}
                      </span>
                    )}
                  </div>
                  <p className="font-mono text-[10px] text-white/35 truncate">
                    {grant.auditorAddress}
                  </p>
                  <p className="font-mono text-[9px] text-white/20 mt-0.5">
                    {new Date(grant.issuedAt).toLocaleDateString()} · nonce:{" "}
                    {grant.nonce.slice(0, 12)}…
                  </p>
                </div>
                <button
                  onClick={() => handleRevoke(grant)}
                  disabled={isRevoking === grant.nonce}
                  className="flex-shrink-0 text-red-400/60 text-[9px] font-semibold tracking-widest uppercase hover:text-red-400 transition-colors disabled:opacity-40"
                >
                  {isRevoking === grant.nonce ? "Revoking…" : "Revoke"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
