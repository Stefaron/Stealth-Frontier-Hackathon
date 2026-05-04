"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useUmbra } from "@/context/UmbraContext";
import { useToast } from "@/context/ToastContext";
import { queryBalances } from "@/lib/umbra/balance";
import { withdrawToPublic } from "@/lib/umbra/withdraw";
import { scanClaimableUtxos, claimReceiverUtxos } from "@/lib/umbra/claim";
import { USDC_DEVNET_MINT, KNOWN_MINTS } from "@/lib/constants";
import type { Address } from "@solana/kit";

const SOL_MINT = "So11111111111111111111111111111111111111112" as Address;
const SUPPORTED_MINTS = [USDC_DEVNET_MINT, SOL_MINT] as Address[];

function formatBalance(amount: bigint, mint: string): string {
  const info = KNOWN_MINTS[mint];
  if (!info) return `${amount} raw`;
  const divisor = BigInt(10 ** info.decimals);
  const whole = amount / divisor;
  const fracFull = (amount % divisor).toString().padStart(info.decimals, "0");
  // Show enough decimals to represent the value (min 2, max 6, trim trailing zeros)
  const trimmed = fracFull.replace(/0+$/, "").slice(0, 6) || "00";
  const frac = trimmed.length < 2 ? trimmed.padEnd(2, "0") : trimmed;
  return `${whole}.${frac}`;
}

export default function ContributorPage() {
  const { publicKey } = useWallet();
  const { client } = useUmbra();

  const toast = useToast();
  const [balances, setBalances] = useState<
    Map<string, { state: string; balance?: bigint }>
  >(new Map());
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMint, setWithdrawMint] = useState<Address>(SOL_MINT);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawResult, setWithdrawResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pendingUtxos, setPendingUtxos] = useState<any[]>([]);
  const [claimedIndices, setClaimedIndices] = useState<Set<string>>(new Set());
  const [isClaiming, setIsClaiming] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const lsKey = publicKey ? `umbra_claimed_${publicKey.toBase58()}` : null;

  // Load persisted claimed indices on wallet connect
  useEffect(() => {
    if (!lsKey) return;
    try {
      const raw = localStorage.getItem(lsKey);
      if (raw) setClaimedIndices(new Set(JSON.parse(raw) as string[]));
    } catch { /* ignore */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lsKey]);

  const persistClaimed = (next: Set<string>) => {
    if (!lsKey) return;
    try { localStorage.setItem(lsKey, JSON.stringify([...next])); } catch { /* ignore */ }
  };

  const loadBalancesAndScan = async () => {
    if (!client) return;
    setIsLoadingBalances(true);
    setIsScanning(true);
    try {
      const [bals, scanned] = await Promise.all([
        queryBalances(client, SUPPORTED_MINTS),
        scanClaimableUtxos(client),
      ]);
      setBalances(bals);
      setPendingUtxos(scanned.received);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load balances";
      setError(msg);
    } finally {
      setIsLoadingBalances(false);
      setIsScanning(false);
    }
  };

  useEffect(() => {
    if (!client) return;
    loadBalancesAndScan();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleClaim = async (utxosToClain?: any[]) => {
    const utxos = utxosToClain ?? pendingUtxos.filter(u => !claimedIndices.has(String(u.insertionIndex)));
    if (!client || utxos.length === 0) return;
    setIsClaiming(true);
    setError(null);
    const loadingId = toast.loading(`Claiming ${utxos.length} payment(s)…`);
    try {
      // Claim one-by-one — batch fails if any UTXO already spent (Umbra SDK behavior)
      const result = await claimReceiverUtxos(client, utxos);
      toast.dismiss(loadingId);

      const nowClaimed = new Set(claimedIndices);
      [...result.claimedIndices, ...result.alreadyClaimedIndices].forEach(i => nowClaimed.add(i));
      setClaimedIndices(nowClaimed);
      persistClaimed(nowClaimed);

      if (result.claimedIndices.length > 0) {
        toast.success(`${result.claimedIndices.length} payment(s) claimed — refreshing balance…`);
        // Balance updates within seconds per Umbra devs
        await new Promise(r => setTimeout(r, 3000));
      } else if (result.alreadyClaimedIndices.length > 0) {
        toast.success("Payments already claimed — balance is up to date");
      }
      if (result.failedIndices.length > 0) {
        toast.error(`${result.failedIndices.length} payment(s) failed to claim`);
      }
      await loadBalancesAndScan();
    } catch (e) {
      toast.dismiss(loadingId);
      const msg = e instanceof Error ? e.message : "Claim failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsClaiming(false);
    }
  };

  const handleWithdraw = async () => {
    if (!client || !publicKey || !withdrawAmount) return;
    setIsWithdrawing(true);
    setError(null);
    setWithdrawResult(null);
    try {
      const mint = withdrawMint;
      const info = KNOWN_MINTS[mint]!;
      const [whole, frac = ""] = withdrawAmount.split(".");
      const fracPadded = frac.slice(0, info.decimals).padEnd(info.decimals, "0");
      const amount = BigInt(whole) * BigInt(10 ** info.decimals) + BigInt(fracPadded);

      const loadingId = toast.loading("Withdrawing to public wallet…");
      const result = await withdrawToPublic(
        client,
        publicKey.toBase58() as Address,
        mint,
        amount
      );
      toast.dismiss(loadingId);
      const status = result.callbackStatus;
      if (status === "finalized") {
        toast.success("Withdraw finalized — refreshing balance…");
        await new Promise(r => setTimeout(r, 2000));
        await loadBalancesAndScan();
      } else if (status === "timed-out" || status === "pruned") {
        toast.error(`Arcium MPC ${status} — withdraw may still process. Check wallet in a few minutes.`);
      } else {
        toast.success(`Queued · ${result.queueSignature.slice(0, 16)}… — waiting for Arcium MPC`);
      }
      setWithdrawResult(`${result.queueSignature} (${status ?? "pending"})`);
      setWithdrawAmount("");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Withdraw failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsWithdrawing(false);
    }
  };

  const usdcBalance = balances.get(USDC_DEVNET_MINT);
  const solBalance = balances.get(SOL_MINT);

  function renderBalance(
    bal: { state: string; balance?: bigint } | undefined,
    mint: string,
    label: string
  ) {
    if (isLoadingBalances) {
      return (
        <div className="animate-pulse">
          <div className="h-10 bg-white/[0.04] rounded-lg mb-2 w-32" />
          <div className="h-3 bg-white/[0.02] rounded w-20" />
        </div>
      );
    }
    if (bal?.state === "shared") {
      return (
        <>
          <p className="text-4xl font-bold text-white mb-1 tabular-nums">
            {formatBalance(bal.balance!, mint)}
          </p>
          <p className="font-mono text-[10px] text-white/25">{label} · Shared mode</p>
        </>
      );
    }
    if (bal?.state === "mxe") {
      return (
        <>
          <p className="text-2xl font-bold text-white/40 mb-1">••••••</p>
          <p className="font-mono text-[10px] text-white/25">MXE encrypted — request MPC decrypt</p>
        </>
      );
    }
    if (bal?.state === "uninitialized") {
      return (
        <>
          <p className="text-4xl font-bold text-white mb-1">0.00</p>
          <p className="font-mono text-[10px] text-white/25">{label} · Not yet activated</p>
        </>
      );
    }
    return (
      <>
        <p className="text-white/25 text-sm">No encrypted balance.</p>
        <p className="font-mono text-[9px] text-white/15 mt-1">Ask treasurer to send payment first.</p>
      </>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 md:px-8 py-12">
      <div className="mb-8">
        <p className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/25 mb-3">
          Contributor · Balance
        </p>
        <h1 className="text-3xl font-bold text-white mb-1">
          Your Encrypted{" "}
          <span className="font-serif-italic text-white/30" style={{ fontWeight: 400 }}>
            Balance
          </span>
        </h1>
        <p className="text-white/35 text-sm">
          Withdraw anytime to your public wallet.
        </p>
      </div>

      <div className="flex justify-end mb-4">
        <button
          onClick={loadBalancesAndScan}
          disabled={isLoadingBalances || isScanning}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono tracking-widest uppercase text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all disabled:opacity-30"
        >
          <svg
            width="11" height="11" viewBox="0 0 16 16" fill="none"
            className={isLoadingBalances || isScanning ? "animate-spin" : ""}
          >
            <path d="M13.5 8A5.5 5.5 0 1 1 8 2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M13.5 2.5v3h-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {isLoadingBalances || isScanning ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {(() => {
        const unclaimedUtxos = pendingUtxos.filter(u => !claimedIndices.has(String(u.insertionIndex)));
        if (!isScanning && unclaimedUtxos.length === 0) return null;
        return (
          <div className="mb-6 flex items-center justify-between bg-amber-500/10 border border-amber-500/20 rounded-2xl px-6 py-4">
            <div>
              <p className="text-amber-400 text-sm font-medium">
                {isScanning ? "Scanning for pending payments…" : `${unclaimedUtxos.length} unclaimed payment(s) found`}
              </p>
              <p className="text-amber-400/60 text-xs mt-0.5">
                Claim to move into your encrypted balance
              </p>
            </div>
            {!isScanning && (
              <button
                onClick={() => handleClaim(unclaimedUtxos)}
                disabled={isClaiming}
                className="bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-bold tracking-widest uppercase px-5 py-2.5 rounded-full transition-all duration-200 disabled:opacity-50"
              >
                {isClaiming ? "Claiming…" : "Claim Now"}
              </button>
            )}
          </div>
        );
      })()}

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-4">
          <div className="bg-white/[0.025] border border-white/[0.06] rounded-2xl p-7">
            <div className="flex items-center gap-2 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-white/30">SOL Balance</span>
            </div>
            {renderBalance(solBalance, SOL_MINT, "SOL")}
          </div>
          <div className="bg-white/[0.025] border border-white/[0.06] rounded-2xl p-7">
            <div className="flex items-center gap-2 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-white/30">USDC Balance</span>
            </div>
            {renderBalance(usdcBalance, USDC_DEVNET_MINT, "USDC")}
          </div>
        </div>

        <div className="bg-white/[0.025] border border-white/[0.06] rounded-2xl p-7">
          <h2 className="text-sm font-bold text-white mb-5">Withdraw to Wallet</h2>

          <div className="flex gap-2 mb-4">
            {([SOL_MINT, USDC_DEVNET_MINT] as Address[]).map((mint) => {
              const sym = KNOWN_MINTS[mint]?.symbol ?? mint.slice(0, 4);
              return (
                <button
                  key={mint}
                  onClick={() => setWithdrawMint(mint)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all ${
                    withdrawMint === mint
                      ? "bg-white/10 text-white"
                      : "text-white/30 hover:text-white/60"
                  }`}
                >
                  {sym}
                </button>
              );
            })}
          </div>
          <label className="block mb-4">
            <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-white/30 block mb-1.5">
              Amount ({KNOWN_MINTS[withdrawMint]?.symbol ?? "Token"})
            </span>
            <input
              type="number"
              step="0.000000001"
              min="0"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white/70 text-sm font-mono placeholder:text-white/20 focus:outline-none focus:border-slate-500/40 transition-colors"
            />
          </label>

          <div className="mb-5 bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-3">
            <p className="font-mono text-[9px] text-white/30 mb-1">Destination</p>
            <p className="font-mono text-[11px] text-white/50 truncate">
              {publicKey?.toBase58() ?? "Not connected"}
            </p>
          </div>

          {error && (
            <div className="mb-3 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 text-red-400 text-xs">
              {error}
            </div>
          )}
          {withdrawResult && (
            <div className="mb-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2 text-emerald-400 text-xs font-mono">
              Queued: {withdrawResult.slice(0, 24)}…
            </div>
          )}

          <button
            onClick={handleWithdraw}
            disabled={isWithdrawing || !withdrawAmount || balances.get(withdrawMint)?.state !== "shared"}
            className="w-full bg-white text-[#0d0c0a] text-[10px] font-bold tracking-widest uppercase px-6 py-3 rounded-full hover:bg-white/90 transition-all duration-200 disabled:opacity-40"
          >
            {isWithdrawing ? "Withdrawing…" : "Withdraw"}
          </button>
        </div>
      </div>

      <div className="bg-white/[0.015] border border-white/[0.05] rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-white/20">
            Privacy Model
          </span>
        </div>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          {[
            { label: "Balance", value: "Rescue cipher", tag: "ETA·x25519" },
            { label: "Withdraw", value: "Direct (MPC)", tag: "Arcium·MXE" },
            { label: "History", value: "Encrypted", tag: "No on-chain leak" },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-white/25 text-[10px] uppercase tracking-widest mb-1">
                {item.label}
              </p>
              <p className="text-white/55 font-medium">{item.value}</p>
              <p className="font-mono text-[9px] text-white/15 mt-0.5">{item.tag}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
