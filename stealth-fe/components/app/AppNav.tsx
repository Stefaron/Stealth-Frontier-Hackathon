"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
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

export default function AppNav({ role, links }: AppNavProps) {
  const pathname = usePathname();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const roleMenuRef = useRef<HTMLDivElement>(null);

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

  return (
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
            <div className="hidden md:flex items-center gap-0.5 absolute left-1/2 -translate-x-1/2">
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

          {/* RIGHT: wallet */}
          <div className="flex items-center gap-2">
            <WalletButton />
          </div>
        </nav>
      </div>
    </header>
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
