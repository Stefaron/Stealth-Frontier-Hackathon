"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useUmbra } from "@/context/UmbraContext";
import { useToast } from "@/context/ToastContext";
import { issueComplianceGrant, revokeComplianceGrant } from "@/lib/umbra/compliance";
import { getMasterViewingKeyDeriver } from "@umbra-privacy/sdk";
import { saveGrant, deleteGrant, getGrantsByTreasurer } from "@/lib/grants-store";
import { deriveScopedVk } from "@/lib/compliance/tvk";
import type { VkLevel, ScanScope } from "@/lib/compliance/types";
import { VK_LEVEL_ORDER } from "@/lib/compliance/types";
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
  const [baseMvk, setBaseMvk] = useState<bigint | null>(null);
  
  const [targetLevel, setTargetLevel] = useState<VkLevel>("master");
  const [scopeMint, setScopeMint] = useState("So11111111111111111111111111111111111111112");
  const [scopeYear, setScopeYear] = useState(new Date().getUTCFullYear().toString());
  const [scopeMonth, setScopeMonth] = useState((new Date().getUTCMonth() + 1).toString());
  const [scopeDay, setScopeDay] = useState(new Date().getUTCDate().toString());

  const [isDerivingVk, setIsDerivingVk] = useState(false);
  const [isIssuing, setIsIssuing] = useState(false);
  const [isRevoking, setIsRevoking] = useState<string | null>(null);

  // Auto-derive base MVK when client is ready
  useEffect(() => {
    if (!client || baseMvk || isDerivingVk) return;
    
    let isMounted = true;
    const deriveMvk = async () => {
      setIsDerivingVk(true);
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mvk: bigint = await getMasterViewingKeyDeriver({ client: client as any })();
        if (isMounted) setBaseMvk(mvk);
      } catch (e) {
        if (isMounted) toast.error("Failed to auto-derive master key. Please refresh to try again.");
      } finally {
        if (isMounted) setIsDerivingVk(false);
      }
    };
    
    deriveMvk();
    return () => { isMounted = false; };
  }, [client, baseMvk, isDerivingVk, toast]);

  // Auto-update viewingKeyInput when scope or baseMvk changes
  useEffect(() => {
    if (!baseMvk) return;

    let isMounted = true;
    const updateScopedKey = async () => {
      try {
        let finalKey = baseMvk;
        if (targetLevel !== "master") {
          const scope: ScanScope = {
            kind: targetLevel,
            mint: scopeMint.trim(),
            year: targetLevel !== "mint" ? parseInt(scopeYear, 10) : undefined,
            month: targetLevel === "monthly" || targetLevel === "daily" || targetLevel === "hourly" || targetLevel === "minute" || targetLevel === "second" ? parseInt(scopeMonth, 10) : undefined,
            day: targetLevel === "daily" || targetLevel === "hourly" || targetLevel === "minute" || targetLevel === "second" ? parseInt(scopeDay, 10) : undefined,
            hour: 0,
            minute: 0,
            second: 0,
          };
          finalKey = await deriveScopedVk(baseMvk, targetLevel, scope);
        }
        if (isMounted) setViewingKeyInput(finalKey.toString(16));
      } catch (e) {
        console.error("Failed to derive scoped key", e);
      }
    };

    updateScopedKey();
    return () => { isMounted = false; };
  }, [baseMvk, targetLevel, scopeMint, scopeYear, scopeMonth, scopeDay]);

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

  const inputCls =
    "w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-zinc-900 text-[13px] placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors";
  const inputMonoCls =
    "w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-zinc-900 text-[12px] font-mono placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors";
  const labelCls = "text-[11px] font-semibold uppercase tracking-wider text-zinc-500 block mb-1.5";

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-8 py-10 md:py-12">
      <div className="mb-8">
        <span className="eyebrow mb-3">
          <span className="eyebrow-dot" />
          Treasurer · Auditors
        </span>
        <h1 className="mt-3 text-[1.75rem] md:text-[2rem] font-bold text-zinc-900 tracking-tight" style={{ letterSpacing: "-0.02em" }}>
          Compliance grants
        </h1>
        <p className="mt-2 text-[14px] text-zinc-500">
          Grant auditors scoped viewing access. Revocable on-chain anytime.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="card p-6">
          <h2 className="text-[15px] font-semibold text-zinc-900 mb-5 tracking-tight">Issue new grant</h2>

          <label className="block mb-4">
            <span className={labelCls}>Auditor wallet address</span>
            <input
              type="text"
              value={auditorInput}
              onChange={(e) => setAuditorInput(e.target.value)}
              placeholder="Base58 address…"
              className={inputMonoCls}
            />
          </label>

          <label className="block mb-5">
            <span className={labelCls}>Label (optional)</span>
            <input
              type="text"
              value={labelInput}
              onChange={(e) => setLabelInput(e.target.value)}
              placeholder="e.g. Deloitte Q2 2026"
              className={inputCls}
            />
          </label>

          <div className="mb-5 p-4 rounded-xl bg-zinc-50/60 border border-zinc-100">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-3">Access scope</h3>
            <label className="block mb-3">
              <span className={labelCls}>VK level</span>
              <select
                value={targetLevel}
                onChange={(e) => setTargetLevel(e.target.value as VkLevel)}
                className={inputMonoCls}
              >
                {VK_LEVEL_ORDER.slice(0, 5).map((l) => (
                  <option key={l} value={l}>
                    {l.charAt(0).toUpperCase() + l.slice(1)}
                  </option>
                ))}
              </select>
            </label>

            {targetLevel !== "master" && (
              <label className="block mb-3">
                <span className={labelCls}>Mint address</span>
                <input
                  type="text"
                  value={scopeMint}
                  onChange={(e) => setScopeMint(e.target.value)}
                  className={inputMonoCls}
                />
              </label>
            )}

            {["yearly", "monthly", "daily"].includes(targetLevel) && (
              <div className="grid grid-cols-3 gap-2">
                <label className="block">
                  <span className={labelCls}>Year</span>
                  <input
                    type="number"
                    value={scopeYear}
                    onChange={(e) => setScopeYear(e.target.value)}
                    className={inputMonoCls}
                  />
                </label>
                {["monthly", "daily"].includes(targetLevel) && (
                  <label className="block">
                    <span className={labelCls}>Month</span>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={scopeMonth}
                      onChange={(e) => setScopeMonth(e.target.value)}
                      className={inputMonoCls}
                    />
                  </label>
                )}
                {targetLevel === "daily" && (
                  <label className="block">
                    <span className={labelCls}>Day</span>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={scopeDay}
                      onChange={(e) => setScopeDay(e.target.value)}
                      className={inputMonoCls}
                    />
                  </label>
                )}
              </div>
            )}
          </div>

          <div className="mb-5">
            <div className="flex items-center justify-between mb-1.5">
              <span className={labelCls.replace("mb-1.5", "")}>Generated viewing key</span>
              {isDerivingVk && (
                <span className="text-[10.5px] font-medium text-indigo-600">
                  Deriving from wallet…
                </span>
              )}
            </div>
            <textarea
              readOnly
              value={viewingKeyInput}
              placeholder="Awaiting wallet signature to derive master key…"
              rows={2}
              className="w-full bg-zinc-50 border border-zinc-100 rounded-lg px-3.5 py-2.5 text-zinc-700 text-[11.5px] font-mono placeholder:text-zinc-400 focus:outline-none resize-none cursor-not-allowed"
            />
            <span className="text-[11px] text-zinc-400 mt-1.5 block">
              Auto-generated from the selected scope. Stored locally with grant.
            </span>
          </div>

          <button
            onClick={handleIssue}
            disabled={isIssuing || !auditorInput.trim()}
            className="btn-primary press w-full disabled:opacity-40"
          >
            {isIssuing ? "Issuing grant…" : "Issue grant"}
          </button>
        </div>

        <div className="relative card overflow-hidden p-6">
          {/* Accent line */}
          <div aria-hidden className="absolute inset-x-0 top-0 aurora-line" />
          {/* Soft halo */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -right-24 w-48 h-48 rounded-full opacity-50"
            style={{
              background: "radial-gradient(circle, rgba(99,102,241,0.10), transparent 70%)",
            }}
          />
          <div className="relative">
            <h3 className="text-[15px] font-semibold text-zinc-900 mb-5 tracking-tight">How it works</h3>
            <ol className="space-y-4">
              {[
                {
                  num: "01",
                  title: "Reencrypt",
                  desc:
                    "Your encrypted outputs are reencrypted under the auditor's X25519 key via Arcium MPC.",
                },
                {
                  num: "02",
                  title: "View",
                  desc:
                    "The auditor sees transaction history within the scoped grant — never your private key.",
                },
                {
                  num: "03",
                  title: "Revoke",
                  desc:
                    "Grants are revocable on-chain anytime. Each grant has a unique nonce — no replay.",
                },
              ].map((step) => (
                <li key={step.num} className="flex gap-3 items-start group">
                  <span className="flex-shrink-0 w-7 h-7 rounded-md bg-zinc-50 text-zinc-700 grid place-items-center text-[10.5px] font-mono font-semibold tracking-wider group-hover:bg-zinc-900 group-hover:text-white transition-colors duration-300">
                    {step.num}
                  </span>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-[13.5px] font-semibold text-zinc-900 mb-0.5">{step.title}</p>
                    <p className="text-[12.5px] text-zinc-600 leading-relaxed">{step.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-soft-pulse" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              <span className="text-[11px] font-mono text-zinc-500 tracking-wider">
                GRANT · ECDH · scoped-key
              </span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-4">
          Active grants ({grants.length})
        </h2>
        {grants.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="text-zinc-500 text-[13.5px]">No active grants yet. Issue one above.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {grants.map((grant) => (
              <div
                key={grant.nonce}
                className="card card-hover px-5 py-4 flex items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-soft-pulse" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                    </span>
                    {grant.label ? (
                      <span className="text-zinc-900 text-[13.5px] font-semibold truncate">
                        {grant.label}
                      </span>
                    ) : (
                      <span className="text-zinc-500 text-[12.5px]">Untitled grant</span>
                    )}
                  </div>
                  <p className="font-mono text-[11.5px] text-zinc-700 truncate">
                    {grant.auditorAddress}
                  </p>
                  <p className="font-mono text-[10.5px] text-zinc-400 mt-0.5">
                    {new Date(grant.issuedAt).toLocaleDateString()} · nonce {grant.nonce.slice(0, 12)}…
                  </p>
                </div>
                <button
                  onClick={() => handleRevoke(grant)}
                  disabled={isRevoking === grant.nonce}
                  className="press flex-shrink-0 text-[12px] font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40"
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
