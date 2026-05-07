"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useUmbra } from "@/context/UmbraContext";
import WalletModal from "./WalletModal";

// Own key — separate from wallet-adapter's "walletName" to avoid interference
const WALLET_KEY = "stealth-wallet-name";

export default function WalletButton() {
  const { connected, connecting, publicKey, connect, disconnect, wallet, select } =
    useWallet();
  const { client, isInitializing, initClient, clearClient } = useUmbra();
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingConnect, setPendingConnect] = useState(false);

  // On mount: restore previous session (replaces autoConnect={true})
  useEffect(() => {
    const stored = localStorage.getItem(WALLET_KEY);
    if (stored && !connected && !connecting) {
      select(stored as any);
      setPendingConnect(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When adapter is ready + pendingConnect is set: call connect()
  useEffect(() => {
    if (!pendingConnect || !wallet || connected || connecting) return;
    connect()
      .catch((e) => console.error("[WalletButton] connect() failed:", e))
      .finally(() => setPendingConnect(false));
  }, [pendingConnect, wallet, connected, connecting, connect]);

  const handleSelectWallet = (name: string) => {
    setModalOpen(false);
    localStorage.setItem(WALLET_KEY, name);
    select(name as any);
    setPendingConnect(true);
  };

  const handleDisconnect = async () => {
    clearClient();
    setPendingConnect(false);
    localStorage.removeItem(WALLET_KEY);
    try {
      await disconnect();
    } catch {
      // Phantom service worker errors are benign — connection is already dead
    } finally {
      select(null as any);
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

  return (
    <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-zinc-50 border border-zinc-200">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-soft-pulse" />
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
      </span>
      <span className="font-mono text-[11px] text-zinc-700 tracking-wide">
        {publicKey?.toBase58().slice(0, 6)}…{publicKey?.toBase58().slice(-4)}
      </span>
      <button
        onClick={handleDisconnect}
        className="text-zinc-400 hover:text-zinc-900 transition-colors text-[14px] leading-none"
        aria-label="Disconnect"
      >
        ×
      </button>
    </div>
  );
}
