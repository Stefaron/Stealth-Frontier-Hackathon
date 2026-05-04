"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";
import Link from "next/link";
import { gsap } from "@/hooks/useGsap";

type RoleId = "treasurer" | "contributor" | "auditor";

interface Role {
  id: RoleId;
  label: string;
  href: string;
  badges: string[];
  title: string;
  desc: string;
  features: string[];
  cta: string;
  accent: string;
  accent2: string;
  icon: ReactNode;
}

const ROLES: Role[] = [
  {
    id: "treasurer",
    label: "Treasurer",
    href: "/treasurer",
    badges: ["Multisig", "Bulk Pay", "OFAC"],
    title: "Pay your DAO privately",
    desc:
      "Upload a CSV, tag recipients, screen against OFAC, sign once. Salaries are encrypted client-side via the Umbra SDK — nobody sees who got paid what, including the DAO multisig.",
    features: [
      "Encrypted token accounts",
      "OFAC screening on broadcast",
      "Multisig + single-sig flow",
      "Bulk transfers via mixer pool",
    ],
    cta: "Open Treasurer",
    accent: "#a78bfa",
    accent2: "#7c3aed",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M3 7h18M3 7l2 12h14l2-12M9 7V4h6v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "contributor",
    label: "Contributor",
    href: "/contributor",
    badges: ["Encrypted", "Wallet Native", "Owner-only"],
    title: "Receive privately. Withdraw anytime.",
    desc:
      "Your earnings sit in an encrypted token account only your wallet can decrypt. No salary leaks on Solscan, no doxing your rate. Withdraw when you want, where you want.",
    features: [
      "Owner-only decrypt",
      "Withdraw to any address",
      "No on-chain salary trail",
      "Wallet-native identity",
    ],
    cta: "Open Contributor",
    accent: "#38bdf8",
    accent2: "#0ea5e9",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.6" />
        <path d="M5 19c0-3.4 3.1-6 7-6s7 2.6 7 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "auditor",
    label: "Auditor",
    href: "/auditor",
    badges: ["Scoped Grants", "PDF Export", "ECDH"],
    title: "Audit with scope. Export with proof.",
    desc:
      "DAOs grant scoped X25519 viewing keys — read-only, time-bound, revocable. Verify totals, generate signed PDF reports, export CSV for the bookkeeper. No raw chain access required.",
    features: [
      "X25519 ECDH viewing keys",
      "Scoped + revocable grants",
      "Signed PDF + CSV export",
      "Verifiable without decrypting",
    ],
    cta: "Open Auditor",
    accent: "#34d399",
    accent2: "#10b981",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M14 3v5h5M9 13h6M9 17h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function WelcomePage() {
  const [active, setActive] = useState<RoleId>("treasurer");
  const role = ROLES.find((r) => r.id === active)!;

  const navRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const cardBodyRef = useRef<HTMLDivElement>(null);
  const segmentsRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const segBtnsRef = useRef<Record<RoleId, HTMLButtonElement | null>>({
    treasurer: null, contributor: null, auditor: null,
  });
  const firstSwitch = useRef(true);
  const firstSeg = useRef(true);

  // Mount timeline
  useLayoutEffect(() => {
    const tl = gsap.timeline({ delay: 0.05 });
    if (navRef.current) {
      gsap.set(navRef.current, { opacity: 0, y: -10 });
      tl.to(navRef.current, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" });
    }
    if (titleRef.current) {
      const lines = titleRef.current.querySelectorAll<HTMLElement>(".welcome-line");
      gsap.set(lines, { opacity: 0, y: 22 });
      tl.to(lines, { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: "power3.out" }, "-=0.25");
    }
    if (subRef.current) {
      gsap.set(subRef.current, { opacity: 0, y: 12 });
      tl.to(subRef.current, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, "-=0.45");
    }
    if (segmentsRef.current) {
      gsap.set(segmentsRef.current, { opacity: 0, y: 14, scale: 0.96 });
      tl.to(
        segmentsRef.current,
        { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: "back.out(1.4)" },
        "-=0.35"
      );
    }
    if (cardRef.current) {
      gsap.set(cardRef.current, { opacity: 0, y: 32, scale: 0.97 });
      tl.to(
        cardRef.current,
        { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: "back.out(1.2)" },
        "-=0.35"
      );
    }
  }, []);

  // Indicator pill slide
  useLayoutEffect(() => {
    const btn = segBtnsRef.current[active];
    const ind = indicatorRef.current;
    const cont = segmentsRef.current;
    if (!btn || !ind || !cont) return;
    const cr = cont.getBoundingClientRect();
    const br = btn.getBoundingClientRect();
    const x = br.left - cr.left;
    const w = br.width;
    if (firstSeg.current) {
      gsap.set(ind, { x, width: w, opacity: 1 });
      firstSeg.current = false;
    } else {
      gsap.to(ind, { x, width: w, duration: 0.45, ease: "power3.out" });
    }
  }, [active]);

  // Card body re-stagger on switch
  useLayoutEffect(() => {
    if (firstSwitch.current) {
      firstSwitch.current = false;
      return;
    }
    const el = cardBodyRef.current;
    if (!el) return;
    const targets = el.querySelectorAll<HTMLElement>(".welcome-anim");
    if (!targets.length) return;
    gsap.fromTo(
      targets,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: "power3.out" }
    );
  }, [active]);

  // Indicator border + glow tween
  useEffect(() => {
    const ind = indicatorRef.current;
    if (!ind) return;
    gsap.to(ind, {
      borderColor: `${role.accent}66`,
      boxShadow: `0 0 0 1px ${role.accent}22, 0 8px 24px -6px ${role.accent}77`,
      duration: 0.45,
      ease: "power2.out",
    });
  }, [role.accent]);

  return (
    <main className="welcome-root relative min-h-svh overflow-hidden">
      {/* Ambient blobs */}
      <div
        className="welcome-blob welcome-blob-a"
        style={{ background: role.accent }}
      />
      <div
        className="welcome-blob welcome-blob-b"
        style={{ background: role.accent2 }}
      />

      {/* Top nav */}
      <header
        ref={navRef}
        className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/[0.05]"
      >
        <div className="max-w-6xl mx-auto px-6 md:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/75 group-hover:text-white transition-colors">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" stroke="currentColor" strokeWidth="1.4" />
                <path d="M8 5L11 6.75V10.25L8 12L5 10.25V6.75L8 5Z" fill="currentColor" opacity="0.65" />
              </svg>
            </div>
            <span className="font-semibold tracking-tight text-sm text-white/85">Stealth</span>
          </Link>

          <Link
            href="/"
            className="press flex items-center gap-2 text-[10px] font-semibold tracking-widest uppercase text-white/45 hover:text-white transition-colors"
          >
            <span>← Back</span>
          </Link>
        </div>
      </header>

      {/* Body */}
      <div className="relative pt-32 pb-20 px-6 md:px-8 flex flex-col items-center">
        <div className="max-w-3xl w-full text-center mb-12">
          <h1
            ref={titleRef}
            className="font-bold text-white leading-[1.05] tracking-tight"
            style={{ fontSize: "clamp(2.5rem, 5.5vw, 4.5rem)" }}
          >
            <span className="welcome-line block">Welcome to</span>
            <span className="welcome-line block">
              <span className="font-serif-italic text-white/40" style={{ fontWeight: 400 }}>
                Stealth.
              </span>
            </span>
          </h1>
          <p ref={subRef} className="mt-6 text-sm text-white/40 max-w-md mx-auto">
            Three roles. One private payroll.{" "}
            <span className="font-serif-italic text-white/55" style={{ fontWeight: 400 }}>
              Pick yours below.
            </span>
          </p>
        </div>

        {/* Segmented control */}
        <div
          ref={segmentsRef}
          className="welcome-segments relative inline-flex items-center p-1.5 rounded-full border border-white/[0.08] mb-12"
          style={{ background: "rgba(10, 10, 18, 0.55)", backdropFilter: "blur(14px)" }}
        >
          <div
            ref={indicatorRef}
            className="absolute top-1.5 h-[calc(100%-12px)] rounded-full pointer-events-none z-0"
            style={{ left: 0, width: 0, background: "rgba(255,255,255,0.08)", opacity: 0, border: `1px solid ${role.accent}55` }}
          />
          {ROLES.map((r) => {
            const isActive = r.id === active;
            return (
              <button
                key={r.id}
                ref={(el) => { segBtnsRef.current[r.id] = el; }}
                onClick={() => setActive(r.id)}
                className="relative z-10 flex items-center gap-2.5 px-5 md:px-6 py-2.5 rounded-full press transition-colors duration-300"
                style={{ color: isActive ? r.accent : "rgba(255,255,255,0.45)" }}
              >
                <span style={{ width: 16, height: 16, display: "inline-flex" }}>
                  {/* shrink icon */}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    {r.id === "treasurer" && (
                      <path d="M3 7h18M3 7l2 12h14l2-12M9 7V4h6v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    )}
                    {r.id === "contributor" && (
                      <>
                        <circle cx="12" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.6" />
                        <path d="M5 19c0-3.4 3.1-6 7-6s7 2.6 7 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                      </>
                    )}
                    {r.id === "auditor" && (
                      <>
                        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                        <path d="M14 3v5h5M9 13h6M9 17h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                      </>
                    )}
                  </svg>
                </span>
                <span className="text-[10px] md:text-[11px] font-bold tracking-[0.2em] uppercase">
                  {r.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Detail card */}
        <div
          ref={cardRef}
          className="welcome-card relative w-full max-w-2xl rounded-3xl overflow-hidden"
          style={
            {
              "--accent": role.accent,
              "--accent2": role.accent2,
              background: "rgba(10, 10, 18, 0.65)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.08)",
            } as CSSProperties
          }
        >
          {/* Conic spin border */}
          <span className="welcome-card-ring" aria-hidden />
          {/* Mesh */}
          <span className="welcome-card-mesh" aria-hidden />
          {/* Top accent rule */}
          <span
            className="absolute inset-x-0 top-0 h-px pointer-events-none transition-all duration-500"
            style={{
              background: `linear-gradient(90deg, transparent, ${role.accent}aa, transparent)`,
              boxShadow: `0 0 14px ${role.accent}`,
            }}
          />

          <div ref={cardBodyRef} className="relative p-8 md:p-10">
            <div className="welcome-anim flex flex-wrap items-center gap-2 mb-6">
              <span
                className="text-[9px] font-bold tracking-[0.22em] uppercase rounded-full px-3 py-1.5 inline-flex items-center gap-2 border"
                style={{
                  background: `${role.accent}14`,
                  color: role.accent,
                  borderColor: `${role.accent}40`,
                }}
              >
                <span
                  className="relative flex h-1.5 w-1.5"
                >
                  <span
                    className="absolute inline-flex h-full w-full rounded-full"
                    style={{ background: role.accent, opacity: 0.55, animation: "pulseGlow 2s ease-in-out infinite" }}
                  />
                  <span
                    className="relative inline-flex rounded-full h-1.5 w-1.5"
                    style={{ background: role.accent }}
                  />
                </span>
                {role.label}
              </span>
              {role.badges.map((b) => (
                <span
                  key={b}
                  className="text-[9px] font-bold tracking-[0.18em] uppercase rounded-full px-3 py-1.5 border"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    color: "rgba(255,255,255,0.5)",
                    borderColor: "rgba(255,255,255,0.08)",
                  }}
                >
                  {b}
                </span>
              ))}
            </div>

            <h2 className="welcome-anim text-3xl md:text-[2.5rem] font-bold text-white tracking-tight leading-[1.05] mb-4">
              {role.title}
            </h2>

            <p className="welcome-anim text-sm md:text-[15px] text-white/55 leading-relaxed max-w-xl mb-8">
              {role.desc}
            </p>

            <div className="welcome-anim grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mb-9">
              {role.features.map((f) => (
                <div key={f} className="flex items-center gap-2.5 text-[13px] text-white/60">
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className="flex-shrink-0">
                    <circle cx="7" cy="7" r="6" stroke={role.accent} strokeWidth="1.2" opacity="0.5" />
                    <path d="M4 7l2 2 4-4" stroke={role.accent} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>{f}</span>
                </div>
              ))}
            </div>

            <Link
              href={role.href}
              className="welcome-anim welcome-cta press group flex items-center justify-between gap-3 w-full bg-white text-[#0d0c0a] py-4 px-6 rounded-2xl"
              style={{
                boxShadow: `0 14px 40px -20px ${role.accent}aa`,
              }}
            >
              <span className="text-[12px] font-bold tracking-[0.22em] uppercase">
                {role.cta}
              </span>
              <span
                className="welcome-cta-icon w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: role.accent2 }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  className="transition-transform duration-300 group-hover:translate-x-[2px] group-hover:-translate-y-[2px]"
                >
                  <path d="M2 12L12 2M12 2H5M12 2V9" stroke="white" strokeWidth="1.7" strokeLinecap="round" />
                </svg>
              </span>
            </Link>
          </div>
        </div>

        <p className="text-center text-[11px] text-white/30 mt-8 tracking-wide">
          All flows happen on Solana devnet · No mainnet funds at risk
        </p>
      </div>
    </main>
  );
}
