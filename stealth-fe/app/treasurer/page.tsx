"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { useUmbra } from "@/context/UmbraContext";
import { useRegistration } from "@/hooks/useRegistration";

const ACTIONS = [
  {
    href: "/treasurer/pay",
    label: "Pay contributors",
    sub: "Upload a CSV and send a private bulk payout.",
    cta: "Start payout",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M3 7h18M3 7l2 12h14l2-12M9 7V4h6v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/treasurer/auditors",
    label: "Manage auditors",
    sub: "Issue or revoke read-only access for compliance.",
    cta: "Manage access",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M14 3v5h5M9 13h6M9 17h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function TreasurerPage() {
  const { publicKey } = useWallet();
  const { client } = useUmbra();
  const { status, checkRegistration } = useRegistration(publicKey?.toBase58());

  useEffect(() => {
    if (client && publicKey) checkRegistration();
  }, [client, publicKey, checkRegistration]);

  const shortAddress = publicKey
    ? publicKey.toBase58().slice(0, 6) + "…" + publicKey.toBase58().slice(-4)
    : "—";

  const isRegistered = status === "registered";
  const isPending = status === "pending" || status === "checking" || status === "registering";

  // Onboarding steps
  const steps = [
    { label: "Wallet connected", done: !!publicKey },
    { label: "Stealth session active", done: !!client },
    { label: "Registered with Umbra", done: isRegistered, pending: isPending },
  ];

  const completedSteps = steps.filter((s) => s.done).length;
  const allDone = completedSteps === steps.length;

  return (
    <div className="max-w-5xl mx-auto px-5 md:px-8 py-10 md:py-14">
      {/* Header */}
      <div className="mb-10">
        <span className="eyebrow mb-3">
          <span className="eyebrow-dot" />
          Treasurer
        </span>
        <h1
          className="mt-3 font-bold text-zinc-900 tracking-tight"
          style={{
            fontSize: "clamp(1.875rem, 3.4vw, 2.5rem)",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
          }}
        >
          Welcome back.
        </h1>
        <p className="mt-2 text-[14.5px] text-zinc-500">
          Connected as <span className="font-mono text-zinc-700">{shortAddress}</span>
        </p>
      </div>

      {/* Onboarding / status — only when not all done */}
      {!allDone && (
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-[15px] font-semibold text-zinc-900 tracking-tight">
                Finish setup
              </h2>
              <p className="text-[13px] text-zinc-500 mt-0.5">
                {completedSteps} of {steps.length} steps complete
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-1.5">
              {steps.map((s, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    s.done ? "w-8 bg-zinc-900" : s.pending ? "w-8 bg-blue-500 animate-pulse" : "w-4 bg-zinc-200"
                  }`}
                />
              ))}
            </div>
          </div>

          <ul className="space-y-2.5">
            {steps.map((s, i) => (
              <li key={s.label} className="flex items-center gap-3">
                <span
                  className={`w-6 h-6 rounded-full grid place-items-center flex-shrink-0 transition-colors duration-300 ${
                    s.done
                      ? "bg-zinc-900 text-white"
                      : s.pending
                      ? "bg-blue-50 text-blue-600 border border-blue-200"
                      : "bg-zinc-100 text-zinc-400 border border-zinc-200"
                  }`}
                >
                  {s.done ? (
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                      <path d="M3 7l3 3 5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : s.pending ? (
                    <svg width="11" height="11" viewBox="0 0 14 14" fill="none" className="animate-spin">
                      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.3" />
                      <path d="M7 1.5A5.5 5.5 0 0 1 12.5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <span className="text-[10px] font-semibold">{i + 1}</span>
                  )}
                </span>
                <span
                  className={`text-[13.5px] ${
                    s.done ? "text-zinc-500 line-through" : "text-zinc-900 font-medium"
                  }`}
                >
                  {s.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action cards */}
      <div className="grid md:grid-cols-2 gap-3 mb-6">
        {ACTIONS.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group card card-hover p-7 flex flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <span className="w-12 h-12 rounded-xl bg-zinc-50 text-zinc-700 grid place-items-center group-hover:bg-zinc-900 group-hover:text-white transition-colors duration-300">
                {action.icon}
              </span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                className="text-zinc-300 group-hover:text-zinc-900 group-hover:translate-x-0.5 transition-all duration-300"
              >
                <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="text-[16px] font-semibold text-zinc-900 mb-1.5 tracking-tight">
              {action.label}
            </h2>
            <p className="text-[13.5px] text-zinc-500 leading-relaxed mb-5">{action.sub}</p>
            <span className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-zinc-700 group-hover:text-zinc-900 transition-colors mt-auto">
              {action.cta}
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">
                →
              </span>
            </span>
          </Link>
        ))}
      </div>

      {/* Network footer pill */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t border-zinc-100 flex-wrap">
        <div className="flex items-center gap-4 text-[12px] text-zinc-500">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-soft-pulse" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            Solana devnet
          </div>
          <span className="text-zinc-300">·</span>
          <span>Powered by Umbra SDK</span>
        </div>
        <a
          href="https://sdk.umbraprivacy.com/introduction"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[12px] font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          Learn how privacy works ↗
        </a>
      </div>
    </div>
  );
}
