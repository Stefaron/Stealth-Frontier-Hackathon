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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-black/88 backdrop-blur-md border-b border-white/[0.06]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <nav className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-white/[0.07] border border-white/[0.06] flex items-center justify-center group-hover:bg-white/[0.12] transition-colors duration-200">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" stroke="rgba(255,255,255,0.75)" strokeWidth="1.4" fill="none" />
                <path d="M8 5L11 6.75V10.25L8 12L5 10.25V6.75L8 5Z" fill="rgba(255,255,255,0.6)" />
              </svg>
            </div>
            <span className="font-semibold tracking-tight text-sm text-white/80">Stealth</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="nav-link-light text-[10px] font-medium tracking-widest uppercase transition-colors duration-200"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* CTA + Hamburger */}
          <div className="flex items-center gap-3">
            <a
              href="/treasurer"
              className="hidden md:flex items-center gap-2 bg-white text-[#0d0c0a] text-[10px] font-bold tracking-widest uppercase px-5 py-2.5 rounded-full hover:bg-white/90 transition-all duration-200 hover:scale-[1.03]"
            >
              Launch App
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
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
                  <span key={i} className={`block h-px bg-white/60 transition-all duration-200 origin-center ${cls}`} />
                ))}
              </div>
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
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
