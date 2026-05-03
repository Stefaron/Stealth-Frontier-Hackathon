"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { useUmbra } from "@/context/UmbraContext";
import { useRegistration } from "@/hooks/useRegistration";

const QUICK_ACTIONS = [
  {
    href: "/treasurer/pay",
    label: "Pay Contributors",
    sub: "CSV upload → bulk private send",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M2 5h14M2 5l1.5 10h11L16 5M7 5V3.5h4V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/treasurer/auditors",
    label: "Manage Auditors",
    sub: "Issue or revoke compliance grants",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M10 2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 2v5h5M6 11h4M6 14h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

const STATS = [
  { label: "Protocol", value: "Umbra SDK", tag: "ETA·UTXO" },
  { label: "Network", value: "Devnet", tag: "Solana" },
  { label: "Privacy Model", value: "ZK + MPC", tag: "Arcium" },
];

const SESSION_STATUS: Record<string, { label: string; color: string }> = {
  registered:   { label: "● Active",        color: "text-emerald-400" },
  pending:      { label: "◌ Confirming…",   color: "text-blue-400" },
  checking:     { label: "◌ Checking…",     color: "text-blue-400" },
  registering:  { label: "◌ Registering…",  color: "text-violet-400" },
  unregistered: { label: "○ Not registered", color: "text-amber-400" },
  error:        { label: "✕ Error",          color: "text-red-400" },
  idle:         { label: "○ Not connected",  color: "text-white/30" },
};

export default function TreasurerPage() {
  const { publicKey } = useWallet();
  const { client } = useUmbra();
  const { status, checkRegistration } = useRegistration(publicKey?.toBase58());

  useEffect(() => {
    if (client && publicKey) checkRegistration();
  }, [client, publicKey, checkRegistration]);

  const shortAddress = publicKey
    ? publicKey.toBase58().slice(0, 8) + "…" + publicKey.toBase58().slice(-6)
    : "—";

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-8 py-12">
      <div className="mb-10">
        <p className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/25 mb-3">
          Treasurer Dashboard
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-2">
          DAO Payroll{" "}
          <span className="font-serif-italic text-white/30" style={{ fontWeight: 400 }}>
            private.
          </span>
        </h1>
        <p className="text-white/35 text-sm">
          Address: <span className="font-mono text-white/50">{shortAddress}</span>
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-3 mb-8">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="bg-white/[0.025] border border-white/[0.06] rounded-2xl p-5"
          >
            <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-white/20 mb-2">
              {s.label}
            </p>
            <p className="text-xl font-bold text-white">{s.value}</p>
            <p className="font-mono text-[8px] text-white/15 tracking-widest mt-1">{s.tag}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {QUICK_ACTIONS.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group bg-white/[0.025] border border-white/[0.06] hover:border-violet-500/20 rounded-2xl p-6 card-lift transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-5">
              {action.icon}
            </div>
            <h2 className="text-base font-bold text-white mb-1.5 group-hover:text-white/90 transition-colors">
              {action.label}
            </h2>
            <p className="text-sm text-white/30">{action.sub}</p>
          </Link>
        ))}
      </div>

      <div className="bg-white/[0.015] border border-white/[0.05] rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-white/25">
            Umbra Session
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-white/25 text-[10px] uppercase tracking-widest mb-1">Status</p>
            {(() => {
              const s = !client ? SESSION_STATUS.idle : SESSION_STATUS[status] ?? SESSION_STATUS.idle;
              return <p className={`font-mono text-[11px] ${s.color}`}>{s.label}</p>;
            })()}
          </div>
          <div>
            <p className="text-white/25 text-[10px] uppercase tracking-widest mb-1">Mode</p>
            <p className="text-white/50 font-mono text-[11px]">Shared + MXE</p>
          </div>
        </div>
      </div>
    </div>
  );
}
