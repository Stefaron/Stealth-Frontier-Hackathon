"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useUmbra } from "@/context/UmbraContext";
import { useToast } from "@/context/ToastContext";
import { queryBalances } from "@/lib/umbra/balance";
import { withdrawToPublic } from "@/lib/umbra/withdraw";
import { USDC_DEVNET_MINT, KNOWN_MINTS } from "@/lib/constants";
import type { Address } from "@solana/kit";

const SUPPORTED_MINTS = [USDC_DEVNET_MINT] as Address[];

function formatBalance(amount: bigint, mint: string): string {
  const info = KNOWN_MINTS[mint];
  if (!info) return `${amount} raw`;
  const divisor = BigInt(10 ** info.decimals);
  const whole = amount / divisor;
  const frac = (amount % divisor).toString().padStart(info.decimals, "0").slice(0, 2);
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
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawResult, setWithdrawResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!client) return;
    const load = async () => {
      setIsLoadingBalances(true);
      try {
        const result = await queryBalances(client, SUPPORTED_MINTS);
        setBalances(result);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load balances";
        setError(msg);
        toast.error(msg);
      } finally {
        setIsLoadingBalances(false);
      }
    };
    load();
  }, [client]);

  const handleWithdraw = async () => {
    if (!client || !publicKey || !withdrawAmount) return;
    setIsWithdrawing(true);
    setError(null);
    setWithdrawResult(null);
    try {
      const mint = USDC_DEVNET_MINT as Address;
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
      toast.success(`Queued · ${result.queueSignature.slice(0, 16)}…`);
      setWithdrawResult(result.queueSignature);
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

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white/[0.025] border border-white/[0.06] rounded-2xl p-7">
          <div className="flex items-center gap-2 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-white/30">
              USDC Balance
            </span>
          </div>

          {isLoadingBalances ? (
            <div className="animate-pulse">
              <div className="h-10 bg-white/[0.04] rounded-lg mb-2 w-32" />
              <div className="h-3 bg-white/[0.02] rounded w-20" />
            </div>
          ) : usdcBalance?.state === "shared" ? (
            <>
              <p className="text-4xl font-bold text-white mb-1 tabular-nums">
                {formatBalance(usdcBalance.balance!, USDC_DEVNET_MINT)}
              </p>
              <p className="font-mono text-[10px] text-white/25">USDC · Shared mode</p>
            </>
          ) : usdcBalance?.state === "mxe" ? (
            <>
              <p className="text-2xl font-bold text-white/40 mb-1">••••••</p>
              <p className="font-mono text-[10px] text-white/25">
                MXE encrypted — request MPC decrypt
              </p>
            </>
          ) : usdcBalance?.state === "uninitialized" ? (
            <>
              <p className="text-4xl font-bold text-white mb-1">0.00</p>
              <p className="font-mono text-[10px] text-white/25">USDC · Not yet activated</p>
            </>
          ) : (
            <>
              <p className="text-white/25 text-sm">No encrypted account found.</p>
              <p className="font-mono text-[9px] text-white/15 mt-1">
                Ask your treasurer to send payment first.
              </p>
            </>
          )}
        </div>

        <div className="bg-white/[0.025] border border-white/[0.06] rounded-2xl p-7">
          <h2 className="text-sm font-bold text-white mb-5">Withdraw to Wallet</h2>

          <label className="block mb-4">
            <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-white/30 block mb-1.5">
              Amount (USDC)
            </span>
            <input
              type="number"
              step="0.01"
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
            disabled={isWithdrawing || !withdrawAmount || usdcBalance?.state !== "shared"}
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
