"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "@/hooks/useGsap";

type RoleId = "treasurer" | "contributor" | "auditor";

interface Role {
  id: RoleId;
  label: string;
  href: string;
  title: string;
  desc: string;
  features: string[];
  cta: string;
  icon: ReactNode;
}

const ROLES: Role[] = [
  {
    id: "treasurer",
    label: "Treasurer",
    href: "/treasurer",
    title: "Pay your team privately",
    desc:
      "Upload a CSV, tag recipients, screen against OFAC, sign once. Salaries stay encrypted — even your multisig members can't see who got paid what.",
    features: [
      "Encrypted token accounts",
      "OFAC screening on broadcast",
      "Multisig + single-sig flow",
      "Bulk transfers via mixer pool",
    ],
    cta: "Open Treasurer",
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
    title: "Receive privately. Withdraw anytime.",
    desc:
      "Your earnings sit in an encrypted balance only your wallet can decrypt. No salary leaks on Solscan, no doxing your rate. Withdraw when you want.",
    features: [
      "Owner-only decrypt",
      "Withdraw to any address",
      "No on-chain salary trail",
      "Wallet-native identity",
    ],
    cta: "Open Contributor",
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
    title: "Audit with scope. Export with proof.",
    desc:
      "DAOs grant scoped read-only viewing keys — time-bound and revocable. Verify totals, generate signed PDF reports, export CSV for the bookkeeper.",
    features: [
      "Scoped, revocable grants",
      "Signed PDF + CSV export",
      "Verifiable without decrypting",
      "ECDH viewing keys",
    ],
    cta: "Open Auditor",
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
      gsap.set(navRef.current, { opacity: 0, y: -8 });
      tl.to(navRef.current, { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" });
    }
    if (titleRef.current) {
      const lines = titleRef.current.querySelectorAll<HTMLElement>(".welcome-line");
      gsap.set(lines, { opacity: 0, y: 16 });
      tl.to(lines, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: "power3.out" }, "-=0.2");
    }
    if (subRef.current) {
      gsap.set(subRef.current, { opacity: 0, y: 10 });
      tl.to(subRef.current, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }, "-=0.4");
    }
    if (segmentsRef.current) {
      gsap.set(segmentsRef.current, { opacity: 0, y: 10 });
      tl.to(segmentsRef.current, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, "-=0.3");
    }
    if (cardRef.current) {
      gsap.set(cardRef.current, { opacity: 0, y: 20, scale: 0.98 });
      tl.to(cardRef.current, { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: "power3.out" }, "-=0.3");
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
      gsap.to(ind, { x, width: w, duration: 0.4, ease: "power3.out" });
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
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.45, stagger: 0.05, ease: "power3.out" }
    );
  }, [active]);

  return (
    <main className="relative min-h-svh bg-white">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, rgba(99,102,241,0.06), transparent 60%)",
        }}
      />

      {/* Top nav */}
      <header
        ref={navRef}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-zinc-100"
      >
        <div className="max-w-5xl mx-auto px-5 md:px-8 h-[58px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group press">
            <Image
              src="/stealth_logo.png"
              alt="Stealth"
              width={28}
              height={28}
              className="rounded-[8px]"
            />
            <span className="font-semibold tracking-tight text-[14.5px] text-zinc-900">Stealth</span>
          </Link>

          <Link
            href="/"
            className="press inline-flex items-center gap-1.5 text-[13px] font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M9 2L3 6L9 10M3 6H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back home
          </Link>
        </div>
      </header>

      <div className="relative pt-32 md:pt-36 pb-20 px-5 md:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1
            ref={titleRef}
            className="font-bold text-zinc-900 tracking-tight"
            style={{
              fontSize: "clamp(2.25rem, 4.6vw, 3.5rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.025em",
            }}
          >
            <span className="welcome-line block">Welcome to Stealth.</span>
            <span className="welcome-line block font-serif-italic text-zinc-400" style={{ fontWeight: 400 }}>
              Pick your role.
            </span>
          </h1>
          <p
            ref={subRef}
            className="mt-5 text-[14.5px] text-zinc-500 max-w-md mx-auto"
          >
            Three roles, one private payroll. Choose what you came to do — you can switch any time.
          </p>
        </div>

        {/* Segmented control */}
        <div className="mt-10 flex justify-center">
          <div
            ref={segmentsRef}
            className="relative inline-flex items-center gap-1 p-1 rounded-full border border-zinc-200 bg-white"
          >
            <div
              ref={indicatorRef}
              className="absolute top-1 h-[calc(100%-8px)] rounded-full bg-zinc-900 pointer-events-none z-0"
              style={{ left: 0, width: 0, opacity: 0 }}
            />
            {ROLES.map((r) => {
              const isActive = r.id === active;
              return (
                <button
                  key={r.id}
                  ref={(el) => { segBtnsRef.current[r.id] = el; }}
                  onClick={() => setActive(r.id)}
                  className="relative z-10 flex items-center gap-2 px-4 md:px-5 py-2 rounded-full transition-colors duration-300 press"
                  style={{ color: isActive ? "#fff" : "#5b606a" }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    {r.id === "treasurer" && (
                      <path d="M3 7h18M3 7l2 12h14l2-12M9 7V4h6v3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                    )}
                    {r.id === "contributor" && (
                      <>
                        <circle cx="12" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.7" />
                        <path d="M5 19c0-3.4 3.1-6 7-6s7 2.6 7 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                      </>
                    )}
                    {r.id === "auditor" && (
                      <>
                        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                        <path d="M14 3v5h5M9 13h6M9 17h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                      </>
                    )}
                  </svg>
                  <span className="text-[13px] font-semibold">{r.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detail card */}
        <div className="mt-10 max-w-2xl mx-auto">
          <div
            ref={cardRef}
            className="relative card overflow-hidden"
            style={{ boxShadow: "0 24px 60px -32px rgba(11,13,18,0.18)" }}
          >
            <div ref={cardBodyRef} className="p-7 md:p-10">
              <div className="welcome-anim flex items-center gap-3 mb-5">
                <span className="w-12 h-12 rounded-xl bg-zinc-900 text-white grid place-items-center">
                  {role.icon}
                </span>
                <div>
                  <span className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-zinc-500">
                    <span className="w-1 h-1 rounded-full bg-zinc-300" />
                    Role
                  </span>
                  <div className="text-[14.5px] font-semibold text-zinc-900 mt-0.5">
                    {role.label}
                  </div>
                </div>
              </div>

              <h2 className="welcome-anim text-2xl md:text-[1.75rem] font-bold text-zinc-900 tracking-tight leading-snug mb-3">
                {role.title}
              </h2>

              <p className="welcome-anim text-[14px] text-zinc-500 leading-relaxed mb-7">
                {role.desc}
              </p>

              <div className="welcome-anim grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 mb-8">
                {role.features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-[13px] text-zinc-700">
                    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className="flex-shrink-0 text-zinc-900">
                      <path d="M3 7l3 3 5-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              <Link
                href={role.href}
                className="welcome-anim btn-primary press w-full justify-between text-[13.5px]"
              >
                <span>{role.cta}</span>
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <path d="M2 12L12 2M12 2H5M12 2V9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        <p className="text-center text-[12px] text-zinc-400 mt-7">
          All flows happen on Solana devnet · No mainnet funds at risk
        </p>
      </div>
    </main>
  );
}
