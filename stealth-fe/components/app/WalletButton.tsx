"use client";

import { useEffect, useRef, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { useUmbra } from "@/context/UmbraContext";
import { SOLANA_RPC_URL, SOLANA_NETWORK } from "@/lib/constants";
import WalletModal from "./WalletModal";

const WALLET_KEY = "stealth-wallet-name";

function explorerUrl(addr: string) {
  const cluster = SOLANA_NETWORK === "mainnet" ? "" : `?cluster=${SOLANA_NETWORK}`;
  return `https://solscan.io/account/${addr}${cluster}`;
}

function avatarGradient(addr: string) {
  // Hash address to deterministic hue palette
  let h = 0;
  for (let i = 0; i < addr.length; i++) h = (h * 31 + addr.charCodeAt(i)) & 0xffff;
  const a = h % 360;
  const b = (a + 60) % 360;
  return `linear-gradient(135deg, hsl(${a}, 70%, 65%), hsl(${b}, 70%, 55%))`;
}

export default function WalletButton() {
  const { connected, connecting, publicKey, connect, disconnect, wallet, select } =
    useWallet();
  const { client, isInitializing, initClient, clearClient } = useUmbra();
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingConnect, setPendingConnect] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  // Restore session
  useEffect(() => {
    const stored = localStorage.getItem(WALLET_KEY);
    if (stored && !connected && !connecting) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      select(stored as any);
      setPendingConnect(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-connect once adapter ready
  useEffect(() => {
    if (!pendingConnect || !wallet || connected || connecting) return;
    connect()
      .catch((e) => console.error("[WalletButton] connect() failed:", e))
      .finally(() => setPendingConnect(false));
  }, [pendingConnect, wallet, connected, connecting, connect]);

  // Fetch SOL balance when account popover opens
  useEffect(() => {
    if (!accountOpen || !publicKey) return;
    const conn = new Connection(SOLANA_RPC_URL, "confirmed");
    conn
      .getBalance(new PublicKey(publicKey.toBase58()))
      .then((lamports) => setBalance(lamports / 1e9))
      .catch(() => setBalance(null));
  }, [accountOpen, publicKey]);

  // Close popover on outside click + Esc
  useEffect(() => {
    if (!accountOpen) return;
    const onClick = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAccountOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [accountOpen]);

  const handleSelectWallet = (name: string) => {
    setModalOpen(false);
    localStorage.setItem(WALLET_KEY, name);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    select(name as any);
    setPendingConnect(true);
  };

  const handleDisconnect = async () => {
    setAccountOpen(false);
    clearClient();
    setPendingConnect(false);
    localStorage.removeItem(WALLET_KEY);
    try {
      await disconnect();
    } catch {
      // Phantom service worker errors are benign
    } finally {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      select(null as any);
    }
  };

  const handleCopy = async () => {
    if (!publicKey) return;
    try {
      await navigator.clipboard.writeText(publicKey.toBase58());
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* ignore */
    }
  };

  if (!connected) {
    return (
      <>
        <button
          onClick={() => setModalOpen(true)}
          disabled={connecting || pendingConnect}
          className="press inline-flex items-center gap-1.5 bg-zinc-900 text-white text-[12.5px] font-semibold px-3.5 py-1.5 rounded-lg hover:bg-zinc-800 transition-all duration-200 disabled:opacity-50"
        >
          {connecting || pendingConnect ? "Connecting…" : "Connect Wallet"}
        </button>
        <WalletModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSelect={handleSelectWallet}
        />
      </>
    );
  }

  if (!client) {
    return (
      <div className="flex items-center gap-2.5">
        <span className="font-mono text-[11px] text-zinc-500 tracking-wide">
          {publicKey?.toBase58().slice(0, 6)}…{publicKey?.toBase58().slice(-4)}
        </span>
        <button
          onClick={initClient}
          disabled={isInitializing}
          className="press inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11.5px] font-semibold px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-all duration-200 disabled:opacity-50"
        >
          {isInitializing ? "Activating…" : "Activate Stealth"}
        </button>
        <button
          onClick={handleDisconnect}
          className="text-[11px] text-zinc-400 hover:text-zinc-700 transition-colors press"
        >
          Disconnect
        </button>
      </div>
    );
  }

  const addr = publicKey?.toBase58() ?? "";
  const shortAddr = `${addr.slice(0, 6)}…${addr.slice(-4)}`;

  return (
    <div ref={accountRef} className="relative">
      <button
        onClick={() => setAccountOpen((v) => !v)}
        className="press flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-50 border border-zinc-200 hover:border-zinc-300 hover:bg-white transition-all duration-200"
        aria-haspopup="menu"
        aria-expanded={accountOpen}
      >
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-soft-pulse" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
        </span>
        <span className="font-mono text-[11px] text-zinc-700 tracking-wide">{shortAddr}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 12 12"
          fill="none"
          className={`text-zinc-400 transition-transform duration-200 ${accountOpen ? "rotate-180" : ""}`}
        >
          <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {accountOpen && (
        <div
          className="animate-fade-in-up"
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: 8,
            width: 320,
            zIndex: 60,
            background: "#ffffff",
            border: "1px solid #ececef",
            borderRadius: 16,
            boxShadow:
              "0 24px 56px -20px rgba(11,13,18,0.18), 0 4px 10px rgba(11,13,18,0.05)",
            overflow: "hidden",
          }}
        >
          {/* Top region — avatar + address + balance */}
          <div className="relative px-5 pt-6 pb-5 text-center">
            <button
              onClick={() => setAccountOpen(false)}
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-zinc-50 border border-zinc-200 grid place-items-center text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors press"
              aria-label="Close"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>

            <div className="relative w-16 h-16 mx-auto mb-4">
              <div
                aria-hidden
                className="absolute -inset-2 rounded-full opacity-50 blur-md"
                style={{ background: avatarGradient(addr) }}
              />
              <div
                className="relative w-16 h-16 rounded-full ring-2 ring-white"
                style={{ background: avatarGradient(addr) }}
              />
            </div>

            <p className="text-[16px] font-bold text-zinc-900 tracking-tight">{shortAddr}</p>
            <p className="text-[12.5px] text-zinc-500 mt-0.5 tabular-nums">
              {balance !== null ? `${balance.toFixed(4)} SOL` : "— SOL"}
            </p>
          </div>

          {/* Action buttons */}
          <div className="px-3 pb-3 grid grid-cols-2 gap-2">
            <button
              onClick={handleCopy}
              className="press flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl bg-zinc-50 border border-zinc-200 hover:bg-white hover:border-zinc-300 transition-all duration-200 group"
            >
              <span className="w-7 h-7 rounded-md bg-white border border-zinc-200 grid place-items-center text-zinc-700 group-hover:text-zinc-900 transition-colors">
                {copied ? (
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7l3 3 5-6" stroke="#059669" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                    <rect x="4" y="4" width="8" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M2 9V2.5A1.5 1.5 0 0 1 3.5 1H10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                )}
              </span>
              <span className="text-[12px] font-semibold text-zinc-900">
                {copied ? "Copied" : "Copy address"}
              </span>
            </button>

            <button
              onClick={handleDisconnect}
              className="press flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl bg-zinc-50 border border-zinc-200 hover:bg-white hover:border-zinc-300 transition-all duration-200 group"
            >
              <span className="w-7 h-7 rounded-md bg-white border border-zinc-200 grid place-items-center text-zinc-700 group-hover:text-red-600 transition-colors">
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <path d="M9 11l3-4-3-4M12 7H5M5 1H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="text-[12px] font-semibold text-zinc-900 group-hover:text-red-600 transition-colors">
                Disconnect
              </span>
            </button>
          </div>

          {/* Status row */}
          <div className="px-5 py-3 border-t border-zinc-100 flex items-center justify-between gap-2">
            <span className="text-[11px] text-zinc-500 inline-flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-soft-pulse" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              Stealth session active
            </span>
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
              {SOLANA_NETWORK}
            </span>
          </div>

          {/* Explorer link */}
          <a
            href={explorerUrl(addr)}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between gap-2 px-5 py-3 border-t border-zinc-100 hover:bg-zinc-50 transition-colors"
          >
            <span className="text-[12.5px] font-semibold text-zinc-900">View on Solscan</span>
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className="text-zinc-400 group-hover:text-zinc-900 group-hover:translate-x-0.5 transition-all duration-300">
              <path d="M4 2h8v8M12 2L3 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      )}
    </div>
  );
}
