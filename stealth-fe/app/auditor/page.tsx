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
        <div className="card p-12 text-center">
          <p className="text-zinc-700 text-[14px] font-medium mb-1">No compliance grants yet.</p>
          <p className="text-zinc-500 text-[13px]">
            Ask a DAO treasurer to issue a grant to your address.
          </p>
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
