"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { label: "How it Works", href: "#how-it-works" },
  { label: "Features",     href: "#features" },
  { label: "For Auditors", href: "#auditors" },
  { label: "Built on Umbra", href: "#umbra" },
];

export default function Navbar() {
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md border-b border-[#e8e6e3] shadow-[0_1px_16px_rgba(0,0,0,0.04)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <nav className="flex items-center justify-between h-16">
          {/* ── Logo ── */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[#0d0d0d] flex items-center justify-center group-hover:bg-[#222] transition-colors duration-200">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z"
                  stroke="white"
                  strokeWidth="1.4"
                  fill="none"
                />
                <path
                  d="M8 5L11 6.75V10.25L8 12L5 10.25V6.75L8 5Z"
                  fill="white"
                  fillOpacity="0.85"
                />
              </svg>
            </div>
            <span className="font-semibold text-[#0d0d0d] tracking-tight text-sm">
              Stealth
            </span>
          </Link>

          {/* ── Desktop links ── */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-[10px] font-medium tracking-widest uppercase text-[#6b6b6b] hover:text-[#0d0d0d] transition-colors duration-150"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* ── Desktop CTA ── */}
          <div className="flex items-center gap-3">
            <a
              href="/treasurer"
              className="hidden md:flex items-center gap-2 bg-[#0d0d0d] text-white text-[10px] font-bold tracking-widest uppercase px-5 py-2.5 rounded-full hover:bg-[#222] transition-all duration-200 hover:scale-[1.03]"
            >
              Launch App
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2 10L10 2M10 2H4M10 2V8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </a>

            {/* ── Hamburger ── */}
            <button
              className="md:hidden p-1.5 rounded-lg hover:bg-[#f0eeeb] transition-colors"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              <div className="w-5 flex flex-col gap-[5px]">
                <span
                  className={`block h-px bg-[#0d0d0d] transition-all duration-200 origin-center ${
                    menuOpen ? "rotate-45 translate-y-[6px]" : ""
                  }`}
                />
                <span
                  className={`block h-px bg-[#0d0d0d] transition-all duration-200 ${
                    menuOpen ? "opacity-0 scale-x-0" : ""
                  }`}
                />
                <span
                  className={`block h-px bg-[#0d0d0d] transition-all duration-200 origin-center ${
                    menuOpen ? "-rotate-45 -translate-y-[6px]" : ""
                  }`}
                />
              </div>
            </button>
          </div>
        </nav>

        {/* ── Mobile menu ── */}
        {menuOpen && (
          <div className="md:hidden pb-6 pt-3 border-t border-[#e8e6e3] flex flex-col gap-4 animate-fade-in">
            {NAV_LINKS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="text-sm font-medium text-[#6b6b6b] hover:text-[#0d0d0d] transition-colors"
              >
                {item.label}
              </a>
            ))}
            <a
              href="/treasurer"
              className="flex items-center justify-center gap-2 bg-[#0d0d0d] text-white text-[10px] font-bold tracking-widest uppercase px-5 py-3 rounded-full"
            >
              Launch App →
            </a>
          </div>
        )}
      </div>
    </header>
  );
}
