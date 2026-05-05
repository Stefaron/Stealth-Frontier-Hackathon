"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { gsap } from "@/hooks/useGsap";

interface WalletModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (name: string) => void;
}

// MetaMask = EVM only, exclude
const EXCLUDE = new Set(["MetaMask"]);

const POPULAR = ["Phantom", "Solflare", "Backpack", "OKX Wallet", "Glow"];

const INSTALL_LINKS: Record<string, string> = {
  Phantom: "https://phantom.app",
  Backpack: "https://backpack.app",
  Solflare: "https://solflare.com",
  "OKX Wallet": "https://okx.com/web3",
  Glow: "https://glow.app",
  Exodus: "https://exodus.com",
  "Trust Wallet": "https://trustwallet.com",
  Ledger: "https://ledger.com",
  Nightly: "https://nightly.app",
};

export default function WalletModal({ open, onClose, onSelect }: WalletModalProps) {
  const { wallets } = useWallet();
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  // lastHovered never clears — right pane stays stable so button is always clickable
  const [lastHovered, setLastHovered] = useState<string | null>(null);

  const backdropRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const leftRowsRef = useRef<HTMLDivElement>(null);

  const handleRowEnter = (name: string) => {
    setHovered(name);
    setLastHovered(name);
  };
  const handleRowLeave = () => setHovered(null);

  useEffect(() => {
    if (open) {
      setMounted(true);
      setClosing(false);
    } else if (mounted && !closing) {
      triggerClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!mounted) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") triggerClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  useLayoutEffect(() => {
    if (!mounted) return;
    const b = backdropRef.current, c = cardRef.current;
    if (!b || !c) return;
    gsap.fromTo(b, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" });
    gsap.fromTo(
      c,
      { opacity: 0, y: 30, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.4)" }
    );
    const rows = leftRowsRef.current?.querySelectorAll<HTMLElement>(".wallet-row");
    if (rows && rows.length) {
      gsap.fromTo(
        rows,
        { opacity: 0, x: -14 },
        { opacity: 1, x: 0, duration: 0.4, stagger: 0.045, delay: 0.18, ease: "power3.out" }
      );
    }
  }, [mounted]);

  const triggerClose = () => {
    const b = backdropRef.current, c = cardRef.current;
    if (!b || !c) {
      setMounted(false);
      onClose();
      return;
    }
    setClosing(true);
    const tl = gsap.timeline({
      onComplete: () => {
        setMounted(false);
        setClosing(false);
        onClose();
      },
    });
    tl.to(c, { opacity: 0, y: 16, scale: 0.96, duration: 0.22, ease: "power3.in" }, 0);
    tl.to(b, { opacity: 0, duration: 0.22, ease: "power2.in" }, 0.04);
  };

  if (!mounted || typeof document === "undefined") return null;

  const solanaWallets = wallets.filter((w) => !EXCLUDE.has(w.adapter.name));

  // Build display list: detected first, then popular not-installed, then rest
  const detected = solanaWallets.filter((w) => w.readyState === "Installed");
  const notInstalledPopular = solanaWallets.filter(
    (w) => w.readyState !== "Installed" && POPULAR.includes(w.adapter.name)
  );
  const notInstalledRest = solanaWallets.filter(
    (w) => w.readyState !== "Installed" && !POPULAR.includes(w.adapter.name)
  );

  const hoveredWallet = solanaWallets.find((w) => w.adapter.name === hovered);
  const displayWallet = solanaWallets.find((w) => w.adapter.name === lastHovered);

  return createPortal(
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center px-4"
      onClick={triggerClose}
    >
      <div ref={backdropRef} className="absolute inset-0 bg-black/70 backdrop-blur-md" />

      <div
        ref={cardRef}
        className="wallet-modal-card relative w-full max-w-[860px] max-h-[88vh] flex bg-[rgba(10,10,18,0.85)] border border-white/[0.08] rounded-3xl overflow-hidden"
        style={{ backdropFilter: "blur(18px)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="wallet-modal-ring" aria-hidden />

        {/* LEFT pane — wallet list */}
        <div className="relative flex flex-col w-full md:w-[360px] flex-shrink-0 border-r border-white/[0.06]">
          <div className="flex items-center justify-between px-7 pt-7 pb-5">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Connect a Wallet</h2>
              <p className="text-white/35 text-[11px] mt-1">Solana wallets only</p>
            </div>
            <button
              onClick={triggerClose}
              disabled={closing}
              className="press w-9 h-9 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/45 hover:text-white hover:bg-white/[0.08] transition-colors"
              aria-label="Close"
            >
              <svg width="11" height="11" viewBox="0 0 10 10" fill="none">
                <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div ref={leftRowsRef} className="flex-1 overflow-y-auto px-4 pb-6 space-y-5">
            {solanaWallets.length === 0 && (
              <p className="text-center text-white/40 text-sm py-10 px-4">
                No Solana wallets detected. Install one to continue.
              </p>
            )}

            {detected.length > 0 && (
              <Section label="Installed">
                {detected.map((w) => (
                  <WalletRow
                    key={w.adapter.name}
                    name={w.adapter.name}
                    icon={w.adapter.icon}
                    badge="READY"
                    badgeColor="text-emerald-400"
                    onMouseEnter={() => handleRowEnter(w.adapter.name)}
                    onMouseLeave={handleRowLeave}
                    onClick={() => onSelect(w.adapter.name)}
                  />
                ))}
              </Section>
            )}

            {notInstalledPopular.length > 0 && (
              <Section label="Popular">
                {notInstalledPopular.map((w) => {
                  const url = INSTALL_LINKS[w.adapter.name];
                  return (
                    <WalletRow
                      key={w.adapter.name}
                      name={w.adapter.name}
                      icon={w.adapter.icon}
                      badge={url ? "INSTALL →" : "N/A"}
                      badgeColor="text-white/35"
                      muted
                      href={url}
                      onMouseEnter={() => handleRowEnter(w.adapter.name)}
                      onMouseLeave={handleRowLeave}
                    />
                  );
                })}
              </Section>
            )}

            {notInstalledRest.length > 0 && (
              <Section label="More">
                {notInstalledRest.map((w) => {
                  const url = INSTALL_LINKS[w.adapter.name];
                  return (
                    <WalletRow
                      key={w.adapter.name}
                      name={w.adapter.name}
                      icon={w.adapter.icon}
                      badge={url ? "INSTALL →" : "N/A"}
                      badgeColor="text-white/30"
                      muted
                      href={url}
                      onMouseEnter={() => handleRowEnter(w.adapter.name)}
                      onMouseLeave={handleRowLeave}
                    />
                  );
                })}
              </Section>
            )}
          </div>

          <div className="border-t border-white/[0.05] px-7 py-3.5 text-center">
            <p className="text-white/25 text-[10px] tracking-wide">
              Solana wallets only · MetaMask not supported
            </p>
          </div>
        </div>

        {/* RIGHT pane — info / preview */}
        <div className="hidden md:flex relative flex-1 flex-col items-center justify-center px-10 py-10 overflow-hidden">
          <span className="wallet-modal-mesh" aria-hidden />
          <span className="wallet-modal-orb" aria-hidden />

          {displayWallet ? (
            <WalletPreview
              key={displayWallet.adapter.name}
              name={displayWallet.adapter.name}
              icon={displayWallet.adapter.icon}
              installed={displayWallet.readyState === "Installed"}
              installUrl={INSTALL_LINKS[displayWallet.adapter.name]}
              onSelect={() => onSelect(displayWallet.adapter.name)}
            />
          ) : (
            <DefaultInfo />
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/30 px-3 mb-2">
        {label}
      </p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

interface RowProps {
  name: string;
  icon?: string;
  badge: string;
  badgeColor: string;
  muted?: boolean;
  href?: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

function WalletRow({
  name,
  icon,
  badge,
  badgeColor,
  muted,
  href,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: RowProps) {
  const content = (
    <>
      <div className="relative">
        {icon ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={icon}
            alt={name}
            width={28}
            height={28}
            className={`rounded-lg flex-shrink-0 ${muted ? "opacity-50" : ""}`}
          />
        ) : (
          <div className="w-7 h-7 rounded-lg bg-white/[0.06] flex-shrink-0" />
        )}
      </div>
      <span
        className={`text-[14px] font-semibold flex-1 truncate ${
          muted ? "text-white/45" : "text-white/85 group-hover:text-white"
        }`}
      >
        {name}
      </span>
      <span className={`text-[9px] font-bold tracking-widest ${badgeColor}`}>{badge}</span>
    </>
  );

  const cls =
    "wallet-row press group relative flex items-center gap-3 w-full px-3 py-3 rounded-xl border border-transparent hover:border-white/[0.08] hover:bg-white/[0.04] transition-all duration-200 cursor-pointer";

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cls}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {content}
      </a>
    );
  }
  return (
    <button
      type="button"
      className={cls}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {content}
    </button>
  );
}

function WalletPreview({
  name,
  icon,
  installed,
  installUrl,
  onSelect,
}: {
  name: string;
  icon?: string;
  installed: boolean;
  installUrl?: string;
  onSelect: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current.querySelectorAll<HTMLElement>("[data-anim]"),
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.45, stagger: 0.06, ease: "power3.out" }
    );
  }, [name]);

  return (
    <div ref={ref} className="relative z-10 text-center max-w-xs">
      <div data-anim className="relative mx-auto w-20 h-20 rounded-3xl bg-white/[0.04] border border-white/[0.08] grid place-items-center mb-6">
        {icon && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={icon} alt={name} width={48} height={48} className="rounded-xl" />
        )}
        <span className="absolute -inset-2 rounded-3xl border border-violet-400/10 pointer-events-none" />
      </div>
      <h3 data-anim className="text-xl font-bold text-white mb-2 tracking-tight">{name}</h3>
      <p data-anim className="text-[13px] text-white/45 leading-relaxed mb-7">
        {installed
          ? `Connect with ${name} to sign transactions and manage your encrypted balance.`
          : `${name} isn't installed yet. Get it from the official site to continue.`}
      </p>
      {installed ? (
        <button
          data-anim
          onClick={onSelect}
          className="press inline-flex items-center gap-2 bg-white text-[#0d0c0a] px-5 py-3 rounded-full font-bold text-[11px] tracking-widest uppercase hover:scale-[1.02] transition-transform cursor-pointer"
        >
          Connect {name}
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path d="M2 10L10 2M10 2H4M10 2V8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      ) : installUrl ? (
        <a
          data-anim
          href={installUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="press inline-flex items-center gap-2 bg-white text-[#0d0c0a] px-5 py-3 rounded-full font-bold text-[11px] tracking-widest uppercase hover:scale-[1.02] transition-transform"
        >
          Get {name}
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path d="M2 10L10 2M10 2H4M10 2V8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </a>
      ) : null}
    </div>
  );
}

function DefaultInfo() {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current.querySelectorAll<HTMLElement>("[data-anim]"),
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, delay: 0.1, ease: "power3.out" }
    );
  }, []);
  return (
    <div ref={ref} className="relative z-10 max-w-xs">
      <h3 data-anim className="text-xl font-bold text-white mb-6 tracking-tight">
        What is a wallet?
      </h3>

      <div data-anim className="flex items-start gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-400/30 flex items-center justify-center flex-shrink-0 text-violet-300">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="2" y="5" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M2 8h14" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="12.5" cy="11.5" r="1" fill="currentColor" />
          </svg>
        </div>
        <div>
          <p className="text-white text-[13px] font-semibold mb-1">A home for your assets</p>
          <p className="text-white/40 text-[12px] leading-relaxed">
            Wallets store your tokens, sign transactions, and decrypt your balance.
          </p>
        </div>
      </div>

      <div data-anim className="flex items-start gap-3 mb-7">
        <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-400/30 flex items-center justify-center flex-shrink-0 text-sky-300">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="2" y="7" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M5 7V5a4 4 0 0 1 8 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="9" cy="11.5" r="1.25" fill="currentColor" />
          </svg>
        </div>
        <div>
          <p className="text-white text-[13px] font-semibold mb-1">A new way to log in</p>
          <p className="text-white/40 text-[12px] leading-relaxed">
            No emails, no passwords. Your wallet is your identity on Stealth.
          </p>
        </div>
      </div>

      <div data-anim className="flex flex-col gap-2">
        <a
          href="https://phantom.app"
          target="_blank"
          rel="noopener noreferrer"
          className="press inline-flex items-center justify-center gap-2 bg-white text-[#0d0c0a] py-2.5 px-4 rounded-full font-bold text-[10px] tracking-widest uppercase hover:scale-[1.02] transition-transform"
        >
          Get a Wallet
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 8L8 2M8 2H3.5M8 2v4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </a>
        <a
          href="https://solana.com/learn/wallets"
          target="_blank"
          rel="noopener noreferrer"
          className="link-fill text-center text-[10px] font-semibold tracking-widest uppercase text-white/40 hover:text-white/80 transition-colors py-1"
        >
          Learn more
        </a>
      </div>
    </div>
  );
}
