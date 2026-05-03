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
    <div className="max-w-7xl mx-auto px-6 md:px-8 py-12">
      <div className="mb-8">
        <p className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/25 mb-3">
          Auditor
        </p>
        <h1 className="text-3xl font-bold text-white mb-1">
          Compliance{" "}
          <span className="font-serif-italic text-white/30" style={{ fontWeight: 400 }}>
            Dashboard
          </span>
        </h1>
        <p className="text-white/35 text-sm">
          DAOs that have granted you scoped viewing access.
        </p>
      </div>

      <div className="mb-6 bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-3 flex items-center gap-3">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        <span className="font-mono text-[10px] text-white/30">Your address:</span>
        <span className="font-mono text-[10px] text-white/50">
          {publicKey?.toBase58() ?? "Not connected"}
        </span>
      </div>

      {grants.length === 0 ? (
        <div className="bg-white/[0.015] border border-white/[0.05] rounded-2xl p-12 text-center">
          <p className="text-white/25 text-sm mb-2">No compliance grants yet.</p>
          <p className="text-white/15 text-xs">
            Ask a DAO treasurer to issue a grant to your address.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {grants.map((grant) => (
            <Link
              key={grant.nonce}
              href={`/auditor/${grant.treasurerAddress}?nonce=${grant.nonce}`}
              className="group block bg-white/[0.025] border border-white/[0.06] hover:border-emerald-500/20 rounded-2xl p-6 card-lift transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                      <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                        <path
                          d="M10 2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7L10 2Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path d="M10 2v5h5M6 11h4M6 14h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-white/90 transition-colors">
                        {grant.label ?? "DAO Treasury"}
                      </h3>
                      <p className="text-[10px] text-white/30">
                        {grant.treasurerAddress.slice(0, 12)}…{grant.treasurerAddress.slice(-6)}
                      </p>
                    </div>
                  </div>
                  <p className="font-mono text-[10px] text-white/25 truncate">
                    {grant.treasurerAddress}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-1 mb-2">
                    <span className="w-1 h-1 rounded-full bg-emerald-400" />
                    <span className="font-mono text-[8px] font-bold tracking-widest text-emerald-400 uppercase">
                      Active
                    </span>
                  </div>
                  <p className="text-[9px] text-white/20">
                    Granted {new Date(grant.issuedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/[0.04] flex items-center justify-between">
                <span className="font-mono text-[9px] text-white/15">
                  nonce: {grant.nonce.slice(0, 16)}…
                </span>
                <span className="text-[10px] text-emerald-400/60 group-hover:text-emerald-400 transition-colors uppercase tracking-widest font-semibold">
                  View Report →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
