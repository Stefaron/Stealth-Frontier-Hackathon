"use client";

import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import ScrollReveal from "./ScrollReveal";

interface Primitive {
  number: string;
  name: string;
  tag: string;
  id: string;
  desc: string;
  accent: string;
  accent2: string;
  icon: ReactNode;
}

const PRIMITIVES: Primitive[] = [
  {
    number: "01",
    name: "Encrypted Token Accounts",
    tag: "Contributor balances",
    id: "ETA·x25519·ed25519",
    desc: "Per-recipient sealed balances. Owner-only decrypt.",
    accent: "#a78bfa",
    accent2: "#38bdf8",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3 10h18" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="17" cy="14.5" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    number: "02",
    name: "Mixer Pool (UTXOs)",
    tag: "Bulk transfers",
    id: "POOL·UTXO·zk-hidden",
    desc: "Anonymity set for payouts. ZK-hidden senders.",
    accent: "#38bdf8",
    accent2: "#34d399",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="8" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="16" cy="15" r="3.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M11 10.5l2 3" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    number: "03",
    name: "X25519 Compliance Grants",
    tag: "Auditor access",
    id: "GRANT·ECDH·scoped-key",
    desc: "ECDH viewing keys. Scoped, revocable, time-bound.",
    accent: "#fbbf24",
    accent2: "#f87171",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M14 12a4 4 0 1 1-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M14 12l4 4 2-2 1 1-1 1 1 1-2 2-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    number: "04",
    name: "Mixer Pool Viewing Keys",
    tag: "Audit reports",
    id: "VK·POOL·read-only",
    desc: "Read-only proofs. Verifiable without decrypting amounts.",
    accent: "#f472b6",
    accent2: "#a78bfa",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
];

function PrimCard({ p }: { p: Primitive }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, ang: 0 });

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    const ry = (x - 0.5) * 10;
    const rx = (0.5 - y) * 10;
    const ang = Math.atan2(y - 0.5, x - 0.5) * (180 / Math.PI);
    setTilt({ rx, ry, ang });
  };

  const onLeave = () => setTilt({ rx: 0, ry: 0, ang: 0 });

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="prim-card p-7 md:p-8"
      style={
        {
          "--accent-solid": p.accent,
          "--accent-solid-2": p.accent2,
          "--ang": `${tilt.ang}deg`,
          transform: `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
        } as CSSProperties
      }
    >
      <span className="prim-orb prim-orb-a" />
      <span className="prim-orb prim-orb-b" />
      <span className="prim-grid" />

      <div className="prim-content">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] text-white/22 tracking-widest">{p.number}</span>
            <span className="w-8 h-px bg-white/10" />
            <div
              className="prim-icon w-9 h-9 rounded-xl border border-white/[0.08] flex items-center justify-center"
              style={{
                color: p.accent,
                background: `radial-gradient(circle at 30% 20%, ${p.accent}22, transparent 70%)`,
              }}
            >
              {p.icon}
            </div>
          </div>
          <span
            className="prim-tag text-[8px] font-semibold tracking-widest uppercase text-white/35 border border-white/[0.08] rounded-full px-3 py-1"
            style={{ background: "rgba(255,255,255,0.015)" }}
          >
            {p.tag}
          </span>
        </div>

        <h3 className="prim-name text-xl md:text-2xl font-bold leading-tight mb-3">
          {p.name}
        </h3>

        <p className="text-[13px] text-white/45 leading-relaxed mb-5 max-w-sm">{p.desc}</p>

        <div className="prim-bar mb-4">
          <span className="prim-bar-fill" />
        </div>

        <div className="flex items-center justify-between">
          <p className="prim-id font-mono text-[10px] text-white/25">{p.id}</p>
          <span
            className="font-mono text-[10px] tracking-widest uppercase opacity-60"
            style={{ color: p.accent }}
          >
            ↗
          </span>
        </div>
      </div>
    </div>
  );
}

export default function UmbraSection() {
  return (
    <section className="bg-black py-24 md:py-32 relative overflow-hidden" id="umbra">
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(167,139,250,0.5) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(56,189,248,0.4) 0%, transparent 40%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-8 relative">
        <ScrollReveal variant="blur">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-5 h-5 rounded-md bg-white/[0.06] border border-white/[0.05] grid place-items-center">
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" stroke="rgba(255,255,255,0.4)" strokeWidth="1.4" />
                <path d="M8 5L11 6.75V10.25L8 12L5 10.25V6.75L8 5Z" fill="rgba(255,255,255,0.25)" />
              </svg>
            </div>
            <p className="text-[9px] font-semibold tracking-[0.22em] uppercase text-white/30">
              Built on Umbra SDK
            </p>
            <span className="w-6 h-px bg-white/10" />
            <span className="text-[9px] font-mono tracking-[0.18em] text-white/20">v4.0.0</span>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={80} variant="left" distance={50}>
          <h2 className="text-4xl md:text-[3.25rem] font-bold text-white leading-[1.05] tracking-tight max-w-2xl mb-16">
            Every primitive.{" "}
            <span className="font-serif-italic text-white/30" style={{ fontWeight: 400 }}>
              Fully used.
            </span>
          </h2>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-4 md:gap-5">
          {PRIMITIVES.map((p, i) => (
            <ScrollReveal
              key={p.number}
              delay={160 + i * 90}
              variant="rotate"
              distance={30}
              duration={850}
            >
              <PrimCard p={p} />
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={460}>
          <div className="mt-12 pt-8 border-t border-white/[0.06] flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-pulse-glow absolute inline-flex h-full w-full rounded-full bg-emerald-400/60" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400/80" />
              </span>
              <p className="text-white/40 text-xs">Cannot be built without Umbra.</p>
            </div>
            <a
              href="https://sdk.umbraprivacy.com/introduction"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 text-white/50 text-[10px] font-semibold tracking-widest uppercase hover:text-white transition-colors"
            >
              <span>SDK docs</span>
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
