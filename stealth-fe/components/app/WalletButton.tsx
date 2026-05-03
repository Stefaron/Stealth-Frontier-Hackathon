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
          className="inline-flex items-center gap-2 bg-white text-[#0d0c0a] text-[10px] font-bold tracking-widest uppercase px-5 py-2.5 rounded-full hover:bg-white/90 transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] disabled:opacity-50"
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
      <div className="flex items-center gap-3">
        <span className="font-mono text-[9px] text-white/35 tracking-widest">
          {publicKey?.toBase58().slice(0, 8)}…
        </span>
        <button
          onClick={initClient}
          disabled={isInitializing}
          className="inline-flex items-center gap-2 bg-violet-500/15 border border-violet-500/30 text-violet-300 text-[10px] font-bold tracking-widest uppercase px-4 py-2 rounded-full hover:bg-violet-500/25 transition-all duration-200 disabled:opacity-50"
        >
          {isInitializing ? "Initializing…" : "Activate Stealth"}
        </button>
        <button
          onClick={handleDisconnect}
          className="text-white/25 text-[9px] tracking-widest uppercase hover:text-white/55 transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-mono text-[9px] text-white/35 tracking-widest">
          {publicKey?.toBase58().slice(0, 8)}…
        </span>
      </div>
      <button
        onClick={handleDisconnect}
        className="text-white/25 text-[9px] tracking-widest uppercase hover:text-white/55 transition-colors"
      >
        Disconnect
      </button>
    </div>
  );
}
