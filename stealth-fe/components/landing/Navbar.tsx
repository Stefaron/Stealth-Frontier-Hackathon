"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { label: "Problem",      href: "#problem" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "Umbra SDK",    href: "#umbra" },
  { label: "Features",     href: "#features" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      const y = window.scrollY + 200;
      let curr = "";
      for (const l of NAV_LINKS) {
        const el = document.querySelector(l.href);
        if (el && (el as HTMLElement).offsetTop <= y) curr = l.href;
      }
      setActive(curr);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-black/75 backdrop-blur-xl border-b border-white/[0.06]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <nav className="flex items-center justify-between h-16">
          <Link href="/" className="nav-logo flex items-center gap-2.5 group">
            <div className="nav-logo-mark w-8 h-8 rounded-lg flex items-center justify-center">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" stroke="currentColor" strokeWidth="1.4" fill="none" />
                <path d="M8 5L11 6.75V10.25L8 12L5 10.25V6.75L8 5Z" fill="currentColor" opacity="0.65" />
              </svg>
            </div>
            <span className="font-semibold tracking-tight text-sm text-white/85 group-hover:text-white transition-colors">
              Stealth
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((item) => {
              const isActive = active === item.href;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  className={`nav-link relative px-3.5 py-2 text-[10px] font-medium tracking-widest uppercase transition-colors duration-300 ${
                    isActive ? "text-white" : "text-white/45 hover:text-white/85"
                  }`}
                >
                  <span className="relative z-10">{item.label}</span>
                  {isActive && <span className="nav-link-dot" />}
                  <span className="nav-link-underline" />
                </a>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/treasurer"
              className="nav-cta hidden md:flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase px-5 py-2.5 rounded-full"
            >
              <span>Launch App</span>
              <svg className="nav-cta-arrow" width="10" height="10" viewBox="0 0 12 12" fill="none">
                <path d="M2 10L10 2M10 2H4M10 2V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </a>

            <button
              className="md:hidden p-2 rounded-lg hover:bg-white/[0.06] transition-colors"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              <div className="w-5 flex flex-col gap-[5px]">
                {[
                  menuOpen ? "rotate-45 translate-y-[6px]" : "",
                  menuOpen ? "opacity-0 scale-x-0" : "",
                  menuOpen ? "-rotate-45 -translate-y-[6px]" : "",
                ].map((cls, i) => (
                  <span key={i} className={`block h-px bg-white/60 transition-all duration-300 origin-center ${cls}`} />
                ))}
              </div>
            </button>
          </div>
        </nav>

        {menuOpen && (
          <div className="md:hidden pb-6 pt-4 border-t border-white/[0.06] flex flex-col gap-5 animate-fade-in">
            {NAV_LINKS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="text-sm font-medium text-white/45 hover:text-white/85 transition-colors"
              >
                {item.label}
              </a>
            ))}
            <a
              href="/treasurer"
              className="flex items-center justify-center gap-2 bg-white text-[#0d0c0a] text-[10px] font-bold tracking-widest uppercase px-5 py-3.5 rounded-full"
            >
              Launch App →
            </a>
          </div>
        )}
      </div>
    </header>
  );
}
