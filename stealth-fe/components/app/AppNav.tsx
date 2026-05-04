"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import WalletButton from "./WalletButton";

interface NavLink {
  label: string;
  href: string;
}

interface AppNavProps {
  role: "treasurer" | "contributor" | "auditor";
  links: NavLink[];
}

const ROLE_CONFIG = {
  treasurer: {
    accent: "text-violet-400",
    accentBg: "bg-violet-500/10",
    accentBorder: "border-violet-500/20",
    activeAccent: "text-violet-300",
    activeBg: "bg-violet-500/15",
    dot: "bg-violet-400",
    label: "Treasurer",
  },
  contributor: {
    accent: "text-slate-400",
    accentBg: "bg-slate-500/10",
    accentBorder: "border-slate-500/20",
    activeAccent: "text-slate-300",
    activeBg: "bg-slate-500/15",
    dot: "bg-slate-400",
    label: "Contributor",
  },
  auditor: {
    accent: "text-emerald-400",
    accentBg: "bg-emerald-500/10",
    accentBorder: "border-emerald-500/20",
    activeAccent: "text-emerald-300",
    activeBg: "bg-emerald-500/15",
    dot: "bg-emerald-400",
    label: "Auditor",
  },
} as const;

export default function AppNav({ role, links }: AppNavProps) {
  const pathname = usePathname();
  const cfg = ROLE_CONFIG[role];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0d0c0a]/90 backdrop-blur-md border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <nav className="flex items-center justify-between h-14">
          <div className="flex items-center gap-5">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-7 h-7 rounded-lg bg-white/[0.06] border border-white/[0.05] flex items-center justify-center">
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z"
                    stroke="rgba(255,255,255,0.5)"
                    strokeWidth="1.4"
                    fill="none"
                  />
                  <path d="M8 5L11 6.75V10.25L8 12L5 10.25V6.75L8 5Z" fill="rgba(255,255,255,0.4)" />
                </svg>
              </div>
              <span className="font-semibold text-[11px] tracking-tight text-white/60">Stealth</span>
            </Link>

            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${cfg.accentBg} border ${cfg.accentBorder}`}>
              <span className={`w-1 h-1 rounded-full ${cfg.dot}`} />
              <span className={`font-mono text-[8px] font-bold tracking-[0.2em] uppercase ${cfg.accent}`}>
                {cfg.label}
              </span>
            </div>

            <div className="hidden md:flex items-center gap-1">
              {links.map((link) => {
                const isActive = pathname === link.href || pathname?.startsWith(link.href + "/");
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-medium tracking-widest uppercase transition-all duration-150 ${
                      isActive
                        ? `${cfg.activeAccent} ${cfg.activeBg}`
                        : "text-white/35 hover:text-white/65 hover:bg-white/[0.04]"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 mr-3">
            {role !== "treasurer" && (
              <Link href="/treasurer" className="font-mono text-[8px] tracking-[0.15em] uppercase text-white/25 hover:text-white/50 transition-colors">
                Treasurer
              </Link>
            )}
            {role !== "contributor" && (
              <Link href="/contributor" className="font-mono text-[8px] tracking-[0.15em] uppercase text-white/25 hover:text-white/50 transition-colors">
                Contributor
              </Link>
            )}
            {role !== "auditor" && (
              <Link href="/auditor" className="font-mono text-[8px] tracking-[0.15em] uppercase text-white/25 hover:text-white/50 transition-colors">
                Auditor
              </Link>
            )}
          </div>
          <WalletButton />
        </nav>
      </div>
    </header>
  );
}
