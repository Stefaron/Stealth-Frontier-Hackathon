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

  useEffect(() => {
    if (publicKey) {
      setGrants(getGrantsByAuditor(publicKey.toBase58()));
    }
  }, [publicKey, client]);

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-8 py-10 md:py-12">
      <div className="mb-8">
        <span className="eyebrow mb-3">
          <span className="eyebrow-dot" />
          Auditor
        </span>
        <h1 className="mt-3 text-[1.75rem] md:text-[2rem] font-bold text-zinc-900 tracking-tight" style={{ letterSpacing: "-0.02em" }}>
          Compliance dashboard
        </h1>
        <p className="mt-2 text-[14px] text-zinc-500">
          DAOs that have granted you scoped viewing access.
        </p>
      </div>

      <div className="mb-6 card px-4 py-3 flex items-center gap-3 flex-wrap">
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
        <div className="relative card overflow-hidden">
          {/* Aurora accent */}
          <div aria-hidden className="absolute inset-x-0 top-0 aurora-line" />
          {/* Soft halo */}
          <div
            aria-hidden
            className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[480px] h-[300px] rounded-full"
            style={{
              background: "radial-gradient(closest-side, rgba(99,102,241,0.10), transparent 70%)",
            }}
          />
          <div className="relative px-8 py-16 md:py-20 text-center">
            {/* Illustration */}
            <div className="relative w-20 h-20 mx-auto mb-6 ambient-float">
              <div
                aria-hidden
                className="absolute inset-0 rounded-2xl bg-zinc-50 border border-zinc-200"
              />
              <div className="absolute inset-0 grid place-items-center text-zinc-700">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  <path d="M14 3v5h5M9 13h6M9 17h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              {/* Decorative dots */}
              <span aria-hidden className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-indigo-400 animate-soft-pulse" />
              <span aria-hidden className="absolute -bottom-1 -left-1 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-soft-pulse" style={{ animationDelay: "1s" }} />
            </div>
            <p className="text-zinc-900 text-[16px] font-semibold mb-1.5 tracking-tight">
              No compliance grants yet
            </p>
            <p className="text-zinc-500 text-[13.5px] leading-relaxed max-w-sm mx-auto">
              Ask a DAO treasurer to issue a grant to your address. You&apos;ll see active grants
              show up here automatically.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-50 border border-zinc-200 text-[11.5px] text-zinc-600">
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.4" />
                <path d="M6 4v3M6 8.5h.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              <span className="font-medium">Auto-refresh on new grants</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
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
                        {grant.label ?? "DAO Treasury"}
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
