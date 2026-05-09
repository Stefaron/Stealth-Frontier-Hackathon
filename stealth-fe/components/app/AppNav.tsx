"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import WalletButton from "./WalletButton";
import GuideTour, { type TourStep } from "./GuideTour";

interface NavLink {
  label: string;
  href: string;
}

interface AppNavProps {
  role: "treasurer" | "contributor" | "auditor";
  links: NavLink[];
}

const ROLE_LABEL: Record<AppNavProps["role"], string> = {
  treasurer: "Treasurer",
  contributor: "Contributor",
  auditor: "Auditor",
};

const ROLE_HREF: Record<AppNavProps["role"], string> = {
  treasurer: "/treasurer",
  contributor: "/contributor",
  auditor: "/auditor",
};

const GUIDE_KEY = "stealth-guide-seen";

function buildSteps(role: AppNavProps["role"]): TourStep[] {
  const common: TourStep[] = [
    {
      selector: null,
      title: "Welcome to Stealth",
      body: (
        <>
          Stealth is private payroll for modern teams — encrypted by default, auditable on demand.
          This quick tour will walk you through the essentials in under a minute.
        </>
      ),
    },
    {
      selector: "[data-tour='role-switcher']",
      title: "Switch role anytime",
      body: (
        <>
          Stealth supports three roles. Click here to jump between{" "}
          <span className="font-semibold text-zinc-900">Treasurer</span>,{" "}
          <span className="font-semibold text-zinc-900">Contributor</span>, and{" "}
          <span className="font-semibold text-zinc-900">Auditor</span>.
        </>
      ),
    },
  ];

  const tabsStep: TourStep = {
    selector: "[data-tour='page-tabs']",
    title: "Page navigation",
    body: (
      <>
        Move between sections inside your current role. Tabs only show up when there&apos;s more than
        one page available.
      </>
    ),
  };

  const walletStep: TourStep = {
    selector: "[data-tour='wallet']",
    title: "Your connected wallet",
    body: (
      <>
        Click the pill to view your address and SOL balance, copy your address, view it on Solscan,
        or disconnect.
      </>
    ),
  };

  const treasurerSpecific: TourStep[] = [
    {
      selector: "[data-tour='setup']",
      title: "Finish setup",
      body: (
        <>
          Three simple steps before you can send: connect your wallet, activate Stealth in the nav,
          and register your account. Progress shows here automatically.
        </>
      ),
    },
    {
      selector: "[data-tour='action-pay']",
      title: "Pay contributors",
      body: (
        <>
          Upload a CSV, screen against OFAC, sign once. Salaries go out encrypted via Umbra — even
          your multisig signers can&apos;t see who got paid what.
        </>
      ),
    },
    {
      selector: "[data-tour='action-auditors']",
      title: "Manage auditors",
      body: (
        <>
          Issue scoped read-only access to your auditor with X25519 viewing keys. Time-bound and
          revocable on-chain anytime.
        </>
      ),
    },
  ];

  const contributorSpecific: TourStep[] = [
    {
      selector: "[data-tour='balance']",
      title: "Encrypted balance",
      body: (
        <>
          Your earnings sit here, encrypted. Only your wallet can decrypt them — no public salary
          trail on Solscan.
        </>
      ),
    },
    {
      selector: "[data-tour='withdraw']",
      title: "Withdraw to your wallet",
      body: (
        <>
          Move funds out anytime. Pick the token, enter an amount, and Stealth handles the private
          unwrap to your public wallet.
        </>
      ),
    },
  ];

  const auditorSpecific: TourStep[] = [
    {
      selector: "[data-tour='your-address']",
      title: "Your auditor address",
      body: (
        <>
          DAOs grant compliance access by issuing a viewing key to this address. Share it with the
          treasurer to receive scoped read-only access.
        </>
      ),
    },
    {
      selector: "[data-tour='grants']",
      title: "Active grants",
      body: (
        <>
          Each grant lets you decrypt a specific scope (mint, time range) without ever holding the
          private key. Open one to view, verify, and export reports.
        </>
      ),
    },
  ];

  const closing: TourStep = {
    selector: null,
    title: "You're all set.",
    body: (
      <>
        That&apos;s the essentials. You can re-open this tour anytime from the{" "}
        <span className="font-semibold text-zinc-900">Guide</span> button in the nav. Happy
        building.
      </>
    ),
  };

  if (role === "treasurer") {
    return [...common, tabsStep, walletStep, ...treasurerSpecific, closing];
  }
  if (role === "contributor") {
    return [...common, walletStep, ...contributorSpecific, closing];
  }
  return [...common, walletStep, ...auditorSpecific, closing];
}

export default function AppNav({ role, links }: AppNavProps) {
  const pathname = usePathname();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const roleMenuRef = useRef<HTMLDivElement>(null);

  // Auto-open tour on first visit per role
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const seen = localStorage.getItem(`${GUIDE_KEY}-${role}`);
      if (!seen) {
        const t = setTimeout(() => setTourOpen(true), 600);
        return () => clearTimeout(t);
      }
    } catch {
      /* ignore */
    }
  }, [role]);

  useEffect(() => {
    if (!roleMenuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target as Node)) {
        setRoleMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setRoleMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [roleMenuOpen]);

  const otherRoles = (Object.keys(ROLE_LABEL) as AppNavProps["role"][]).filter((r) => r !== role);

  const markSeen = () => {
    try {
      localStorage.setItem(`${GUIDE_KEY}-${role}`, "1");
    } catch {
      /* ignore */
    }
  };
  const closeTour = () => {
    markSeen();
    setTourOpen(false);
  };
  const completeTour = () => {
    markSeen();
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-xl border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <nav className="flex items-center justify-between h-[58px]">
            {/* LEFT: brand + role switcher */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2 group press">
                <Image
                  src="/stealth_logo.png"
                  alt="Stealth"
                  width={26}
                  height={26}
                  className="rounded-[7px]"
                />
                <span className="font-semibold tracking-tight text-[14px] text-zinc-900">Stealth</span>
              </Link>

              <span className="text-zinc-300 select-none">/</span>

              <div ref={roleMenuRef} className="relative">
                <button
                  data-tour="role-switcher"
                  onClick={() => setRoleMenuOpen((v) => !v)}
                  className="press inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[13px] font-semibold text-zinc-900 hover:bg-zinc-100 transition-colors"
                  aria-haspopup="menu"
                  aria-expanded={roleMenuOpen}
                >
                  {ROLE_LABEL[role]}
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 12 12"
                    fill="none"
                    className={`text-zinc-400 transition-transform duration-200 ${roleMenuOpen ? "rotate-180" : ""}`}
                  >
                    <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {roleMenuOpen && (
                  <div
                    className="w-52 p-1.5 animate-fade-in-up"
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      marginTop: 8,
                      zIndex: 60,
                      background: "#ffffff",
                      border: "1px solid #ececef",
                      borderRadius: 14,
                      boxShadow:
                        "0 16px 40px -16px rgba(11,13,18,0.18), 0 2px 6px rgba(11,13,18,0.06)",
                    }}
                  >
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400 px-2.5 py-1.5">
                      Switch role
                    </p>
                    {otherRoles.map((r) => (
                      <Link
                        key={r}
                        href={ROLE_HREF[r]}
                        onClick={() => setRoleMenuOpen(false)}
                        className="flex items-center gap-2.5 px-2 py-2 rounded-md text-[13px] font-medium text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
                      >
                        <RoleIcon role={r} />
                        {ROLE_LABEL[r]}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* CENTER: tabs — only when multiple */}
            {links.length > 1 && (
              <div
                data-tour="page-tabs"
                className="hidden md:flex items-center gap-0.5 absolute left-1/2 -translate-x-1/2"
              >
                {links.map((link) => {
                  const isActive = pathname === link.href || (link.href !== ROLE_HREF[role] && pathname?.startsWith(link.href + "/"));
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="nav-link"
                      data-active={isActive ? "true" : "false"}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            )}

            {/* RIGHT: guide + wallet */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTourOpen(true)}
                className="press inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12.5px] font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                aria-label="Open guide"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M6.2 6.2c0-1 .8-1.7 1.8-1.7s1.8.7 1.8 1.7c0 .7-.4 1.1-1 1.5-.5.3-.8.6-.8 1.1V9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  <circle cx="8" cy="11.2" r="0.7" fill="currentColor" />
                </svg>
                Guide
              </button>
              <div data-tour="wallet">
                <WalletButton />
              </div>
            </div>
          </nav>
        </div>
      </header>

      <GuideTour
        open={tourOpen}
        steps={buildSteps(role)}
        onClose={closeTour}
        onComplete={completeTour}
      />
    </>
  );
}

function RoleIcon({ role }: { role: AppNavProps["role"] }) {
  return (
    <span className="w-7 h-7 rounded-md bg-zinc-50 text-zinc-700 grid place-items-center flex-shrink-0">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
        {role === "treasurer" && (
          <path d="M3 7h18M3 7l2 12h14l2-12M9 7V4h6v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        )}
        {role === "contributor" && (
          <>
            <circle cx="12" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.6" />
            <path d="M5 19c0-3.4 3.1-6 7-6s7 2.6 7 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </>
        )}
        {role === "auditor" && (
          <>
            <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            <path d="M14 3v5h5M9 13h6M9 17h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </>
        )}
      </svg>
    </span>
  );
}
