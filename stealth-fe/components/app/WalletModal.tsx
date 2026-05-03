"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useWallet } from "@solana/wallet-adapter-react";

interface WalletModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (name: string) => void;
}

// Wallets known to support Solana — MetaMask excluded (Ethereum only)
const SOLANA_WALLET_WHITELIST = new Set([
  "Phantom",
  "Backpack",
  "Solflare",
  "OKX Wallet",
  "Glow",
  "Slope",
  "Exodus",
  "Coin98",
  "Brave Wallet",
  "SafePal",
  "Trust Wallet",
  "Ledger",
  "Torus",
  "Nightly",
  "Clover",
]);

const INSTALL_LINKS: Record<string, string> = {
  Phantom: "https://phantom.app",
  Backpack: "https://backpack.app",
  Solflare: "https://solflare.com",
  "OKX Wallet": "https://okx.com/web3",
};

export default function WalletModal({ open, onClose, onSelect }: WalletModalProps) {
  const { wallets } = useWallet();

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  const solanaWallets = wallets.filter((w) =>
    SOLANA_WALLET_WHITELIST.has(w.adapter.name)
  );
  const detected = solanaWallets.filter((w) => w.readyState === "Installed");
  const notInstalled = solanaWallets.filter((w) => w.readyState !== "Installed");

  return createPortal(
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center px-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-sm max-h-[85vh] flex flex-col bg-[#141311] border border-white/[0.08] rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — fixed */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-white">Connect Wallet</h2>
            <p className="text-white/30 text-[11px] mt-0.5">Solana wallets only</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/30 hover:text-white/60 transition-colors"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">

        {solanaWallets.length === 0 || (detected.length === 0 && notInstalled.length === 0) ? (
          /* No wallets at all */
          <div className="text-center py-6">
            <p className="text-white/40 text-sm mb-1">No Solana wallets detected</p>
            <p className="text-white/20 text-xs mb-4">MetaMask is Ethereum only</p>
            <div className="space-y-2">
              {Object.entries(INSTALL_LINKS).map(([name, url]) => (
                <a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 hover:bg-white/[0.07] transition-colors"
                >
                  <span className="text-white/60 text-sm">{name}</span>
                  <span className="text-white/25 text-[10px] tracking-widest uppercase">Install →</span>
                </a>
              ))}
            </div>
          </div>
        ) : (
          <>
            {detected.length > 0 && (
              <div className="mb-4">
                <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-white/20 mb-2">
                  Detected
                </p>
                <div className="space-y-2">
                  {detected.map((w) => (
                    <button
                      key={w.adapter.name}
                      onClick={() => onSelect(w.adapter.name)}
                      className="flex items-center gap-3 w-full bg-white/[0.04] border border-white/[0.07] hover:border-violet-500/25 hover:bg-white/[0.07] rounded-xl px-4 py-3 transition-all duration-150 group"
                    >
                      {w.adapter.icon && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={w.adapter.icon} alt={w.adapter.name} width={24} height={24} className="rounded-md" />
                      )}
                      <span className="text-white/80 text-sm font-medium group-hover:text-white transition-colors">
                        {w.adapter.name}
                      </span>
                      <span className="ml-auto text-emerald-400/60 text-[9px] tracking-widest uppercase">
                        Ready
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {notInstalled.length > 0 && (
              <div>
                <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-white/20 mb-2">
                  Not installed
                </p>
                <div className="space-y-1.5">
                  {notInstalled.map((w) => {
                    const url = INSTALL_LINKS[w.adapter.name];
                    return (
                      <a
                        key={w.adapter.name}
                        href={url ?? "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 w-full bg-white/[0.02] border border-white/[0.04] rounded-xl px-4 py-2.5 hover:bg-white/[0.04] transition-colors"
                      >
                        {w.adapter.icon && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={w.adapter.icon} alt={w.adapter.name} width={20} height={20} className="rounded-md opacity-40" />
                        )}
                        <span className="text-white/30 text-sm">{w.adapter.name}</span>
                        <span className="ml-auto text-white/20 text-[9px] tracking-widest uppercase">
                          {url ? "Install →" : "N/A"}
                        </span>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        <div className="mt-5 pt-4 border-t border-white/[0.05] text-center">
          <p className="text-white/15 text-[10px]">
            Solana wallets only · MetaMask not supported
          </p>
        </div>

        </div>{/* end scrollable body */}
      </div>
    </div>,
    document.body
  );
}
