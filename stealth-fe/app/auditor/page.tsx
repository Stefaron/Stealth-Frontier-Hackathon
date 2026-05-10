"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { useUmbra } from "@/context/UmbraContext";
import { getGrantsByAuditor } from "@/lib/grants-store";
import type { ComplianceGrant } from "@/lib/types";

export default function AuditorPage() {
  const { publicKey } = useWallet();
  const { client } = useUmbra();
  const [grants, setGrants] = useState<ComplianceGrant[]>([]);
  const [copied, setCopied] = useState(false);

  const addr = publicKey?.toBase58() ?? "";

  useEffect(() => {
    if (publicKey) {
      setGrants(getGrantsByAuditor(publicKey.toBase58()));
    }
  }, [publicKey, client]);

  const handleCopy = async () => {
    if (!addr) return;
    try {
      await navigator.clipboard.writeText(addr);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-8 py-10 md:py-12">
      <div className="mb-8">
        <span className="eyebrow mb-3">
          <span className="eyebrow-dot" />
          Auditor
        </span>
        <h1 className="mt-3 text-[1.75rem] md:text-[2rem] font-bold text-zinc-900 tracking-tight" style={{ letterSpacing: "-0.02em" }}>
          Company Audits
        </h1>
        <p className="mt-2 text-[14px] text-zinc-500">
          Companies that have granted you scoped viewing access to their payroll treasuries.
        </p>
      </div>

      <div data-tour="your-address" className="mb-6 card px-4 py-3 flex items-center gap-3 flex-wrap">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-soft-pulse" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
          Your address
        </span>
        <span className="font-mono text-[12px] text-zinc-700 truncate">
          {publicKey?.toBase58() ?? "Not connected"}
        </span>
      </div>

      {grants.length === 0 ? (
        <div data-tour="grants" className="relative card overflow-hidden">
          {/* Aurora accent */}
          <div aria-hidden className="absolute inset-x-0 top-0 aurora-line" />

          {/* Multi-tone halos */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-20 left-1/4 w-[420px] h-[320px] rounded-full ambient-drift"
            style={{
              background: "radial-gradient(closest-side, rgba(99,102,241,0.10), transparent 70%)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 right-1/4 w-[420px] h-[320px] rounded-full ambient-drift"
            style={{
              background: "radial-gradient(closest-side, rgba(16,185,129,0.10), transparent 70%)",
              animationDelay: "3s",
            }}
          />

          {/* Subtle dot grid */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-dot-grid opacity-50"
            style={{
              maskImage:
                "radial-gradient(ellipse 60% 60% at 50% 40%, black, transparent 75%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 60% 60% at 50% 40%, black, transparent 75%)",
            }}
          />

          <div className="relative px-6 md:px-10 py-14 md:py-16 text-center">
            {/* Illustration w/ orbit ring + pulses */}
            <div className="relative w-24 h-24 mx-auto mb-7 ambient-float">
              {/* Pulse rings */}
              <span
                aria-hidden
                className="absolute inset-0 rounded-3xl border-2 border-indigo-300"
                style={{ animation: "thumbRingPulse 2.4s ease-out infinite" }}
              />
              <span
                aria-hidden
                className="absolute inset-0 rounded-3xl border-2 border-indigo-200"
                style={{
                  animation: "thumbRingPulse 2.4s ease-out infinite",
                  animationDelay: "0.8s",
                }}
              />
              {/* Icon tile */}
              <div className="relative w-24 h-24 rounded-3xl bg-zinc-900 grid place-items-center text-white shadow-lg">
                <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
                  <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  <path d="M14 3v5h5M9 13h6M9 17h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              {/* Floating decorative shapes */}
              <span
                aria-hidden
                className="absolute -top-3 -right-4 w-3 h-3 rounded-full bg-indigo-500 animate-soft-pulse shadow-sm"
              />
              <span
                aria-hidden
                className="absolute -bottom-2 -left-4 w-2 h-2 rounded-full bg-emerald-500 animate-soft-pulse shadow-sm"
                style={{ animationDelay: "1s" }}
              />
              <span
                aria-hidden
                className="absolute -top-4 -left-3 w-1.5 h-1.5 rounded-full bg-amber-500 animate-soft-pulse"
                style={{ animationDelay: "1.6s" }}
              />
              <span
                aria-hidden
                className="absolute -bottom-4 right-2 w-1.5 h-1.5 rounded-full bg-sky-500 animate-soft-pulse"
                style={{ animationDelay: "0.4s" }}
              />
            </div>

            <h2 className="text-zinc-900 text-[20px] md:text-[22px] font-bold tracking-tight mb-2">
              Waiting for your first grant
            </h2>
            <p className="text-zinc-500 text-[14px] leading-relaxed max-w-md mx-auto">
              Once a DAO treasurer issues a compliance grant to your address, it&apos;ll appear
              here automatically. No refresh needed.
            </p>

            {/* 3-step mini guide */}
            <div className="mt-9 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-left">
              {[
                {
                  n: "01",
                  t: "Share your address",
                  d: "Send the address below to the DAO treasurer.",
                },
                {
                  n: "02",
                  t: "Treasurer issues grant",
                  d: "They configure scope (mint, time range) and sign.",
                },
                {
                  n: "03",
                  t: "Decrypt & verify",
                  d: "Open the grant, scan transactions, export reports.",
                },
              ].map((s) => (
                <div
                  key={s.n}
                  className="card p-4 flex flex-col gap-1.5 transition-shadow hover:shadow-md"
                >
                  <span className="text-[10.5px] font-mono text-zinc-400 tracking-wide">
                    Step · {s.n}
                  </span>
                  <p className="text-[13px] font-semibold text-zinc-900 tracking-tight">
                    {s.t}
                  </p>
                  <p className="text-[12px] text-zinc-500 leading-relaxed">{s.d}</p>
                </div>
              ))}
            </div>

            {/* Copy address CTA + status */}
            {addr && (
              <div className="mt-8 flex flex-col items-center gap-3">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-50 border border-zinc-200 max-w-full">
                  <span className="font-mono text-[12px] text-zinc-700 truncate">
                    {addr.slice(0, 16)}…{addr.slice(-8)}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="press inline-flex items-center gap-1 text-[11.5px] font-semibold text-zinc-600 hover:text-zinc-900 px-2 py-0.5 rounded-md transition-colors"
                  >
                    {copied ? (
                      <>
                        <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                          <path d="M3 7l3 3 5-6" stroke="#059669" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="text-emerald-700">Copied</span>
                      </>
                    ) : (
                      <>
                        <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                          <rect x="4" y="4" width="8" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                          <path d="M2 9V2.5A1.5 1.5 0 0 1 3.5 1H10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                        </svg>
                        Copy address
                      </>
                    )}
                  </button>
                </div>
                <div className="inline-flex items-center gap-2 text-[11.5px] text-zinc-500">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-soft-pulse" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                  </span>
                  <span className="font-medium">Auto-refresh on new grants</span>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div data-tour="grants" className="space-y-3">
          {grants.map((grant) => (
            <Link
              key={grant.nonce}
              href={`/auditor/${grant.treasurerAddress}?nonce=${grant.nonce}`}
              className="group block card card-hover p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-zinc-50 text-zinc-700 grid place-items-center flex-shrink-0 group-hover:bg-zinc-900 group-hover:text-white transition-colors duration-300">
                      <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                        <path d="M10 2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M10 2v5h5M6 11h4M6 14h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[15px] font-semibold text-zinc-900 truncate tracking-tight">
                        {grant.label ?? "Company Treasury"}
                      </h3>
                      <p className="text-[11.5px] text-zinc-500 mt-0.5">
                        {grant.treasurerAddress.slice(0, 12)}…{grant.treasurerAddress.slice(-6)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1 mb-2">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-soft-pulse" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                    </span>
                    <span className="text-[10.5px] font-semibold tracking-wider text-emerald-700 uppercase">
                      Active
                    </span>
                  </span>
                  <p className="text-[11px] text-zinc-400">
                    Granted {new Date(grant.issuedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-zinc-100 flex items-center justify-between">
                <span className="font-mono text-[10.5px] text-zinc-400">
                  nonce {grant.nonce.slice(0, 16)}…
                </span>
                <span className="text-[12.5px] font-semibold text-zinc-700 group-hover:text-zinc-900 group-hover:translate-x-0.5 transition-all duration-300 inline-flex items-center gap-1">
                  View report
                  <span aria-hidden>→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
