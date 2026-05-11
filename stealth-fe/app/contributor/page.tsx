"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useUmbra } from "@/context/UmbraContext";
import { useToast } from "@/context/ToastContext";
import { queryBalances } from "@/lib/umbra/balance";
import { withdrawToPublic } from "@/lib/umbra/withdraw";
import { scanClaimableUtxos, claimReceiverUtxos } from "@/lib/umbra/claim";
import { USDC_DEVNET_MINT, KNOWN_MINTS } from "@/lib/constants";
import type { AuditTransaction } from "@/lib/types";
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
  const { publicKey, signMessage } = useWallet();
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
  const [isGeneratingProof, setIsGeneratingProof] = useState(false);
  const [sharedSecret, setSharedSecret] = useState("");
  const [auditorAddress, setAuditorAddress] = useState("");
  const [filterType, setFilterType] = useState<"all" | "year" | "month">("all");
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
  const [filterMonth, setFilterMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));

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

  const handleGenerateProof = async () => {
    if (!publicKey || pendingUtxos.length === 0) {
      toast.error("No transactions found to generate report.");
      return;
    }
    if (!sharedSecret || !auditorAddress) {
      toast.error("Please enter both the Auditor's Wallet Address and a Shared Secret.");
      return;
    }
    
    setIsGeneratingProof(true);
    const loadingId = toast.loading("Encrypting & Uploading to IPFS…");
    try {
      let txs: AuditTransaction[] = pendingUtxos.map((u) => ({
        signature: u.transactionHash ?? String(u.insertionIndex ?? "unknown"),
        timestamp: u.timestamp ? parseInt(u.timestamp, 10) * 1000 : Date.now(),
        amount: BigInt(u.amount ?? 0).toString() as any, // serialize BigInt as string for JSON
        mint: u.token ?? USDC_DEVNET_MINT,
        recipient: publicKey.toBase58(),
        type: "receive",
      }));

      if (filterType !== "all") {
        txs = txs.filter(tx => {
          const d = new Date(tx.timestamp);
          if (filterType === "year") {
            return d.getFullYear() === parseInt(filterYear);
          }
          if (filterType === "month") {
            return d.getFullYear() === parseInt(filterYear) && (d.getMonth() + 1) === parseInt(filterMonth);
          }
          return true;
        });
      }

      if (txs.length === 0) {
        toast.dismiss(loadingId);
        toast.error("No transactions found for the selected time period.");
        setIsGeneratingProof(false);
        return;
      }

      const payload = JSON.stringify({
        contributor: publicKey.toBase58(),
        generatedAt: new Date().toISOString(),
        transactions: txs
      });

      // Web Crypto API AES-GCM Encryption
      const enc = new TextEncoder();
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      const keyMaterial = await crypto.subtle.importKey(
        "raw", enc.encode(sharedSecret), { name: "PBKDF2" }, false, ["deriveKey"]
      );
      const key = await crypto.subtle.deriveKey(
        { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt"]
      );
      
      const ciphertext = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        enc.encode(payload)
      );

      const toBase64 = (buf: ArrayBuffer | Uint8Array) => {
        let binary = '';
        const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
        for (let i = 0; i < bytes.byteLength; i++) { binary += String.fromCharCode(bytes[i]); }
        return window.btoa(binary);
      };

      const encryptedData = {
        version: "1.0",
        cipher: "AES-GCM",
        ciphertext: toBase64(ciphertext),
        iv: toBase64(iv),
        salt: toBase64(salt)
      };

      const res = await fetch("/api/pinata/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          encryptedData,
          auditorAddress: auditorAddress.trim(),
          contributorAddress: publicKey.toBase58(),
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Failed to upload to IPFS");
      }

      toast.dismiss(loadingId);
      toast.success(`Report published to IPFS! CID: ${resData.ipfsHash.slice(0, 10)}...`);
      setSharedSecret("");
    } catch (e) {
      toast.dismiss(loadingId);
      toast.error(e instanceof Error ? e.message : "Failed to generate report");
    } finally {
      setIsGeneratingProof(false);
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
          <div className="h-9 bg-zinc-100 rounded-lg mb-2 w-32" />
          <div className="h-3 bg-zinc-100 rounded w-20" />
        </div>
      );
    }
    if (bal?.state === "shared") {
      return (
        <>
          <p className="text-[34px] font-bold text-zinc-900 mb-1 tabular-nums tracking-tight" style={{ lineHeight: 1 }}>
            {formatBalance(bal.balance!, mint)}
          </p>
          <p className="text-[12px] text-zinc-500">{label} · Shared mode</p>
        </>
      );
    }
    if (bal?.state === "mxe") {
      return (
        <>
          <p className="text-[28px] font-bold text-zinc-400 mb-1">••••••</p>
          <p className="text-[12px] text-zinc-500">MXE encrypted — request MPC decrypt</p>
        </>
      );
    }
    if (bal?.state === "uninitialized") {
      return (
        <>
          <p className="text-[34px] font-bold text-zinc-900 mb-1 tabular-nums tracking-tight" style={{ lineHeight: 1 }}>0.00</p>
          <p className="text-[12px] text-zinc-500">{label} · Not yet activated</p>
        </>
      );
    }
    return (
      <>
        <p className="text-zinc-500 text-[13.5px]">No encrypted balance.</p>
        <p className="text-[11px] text-zinc-400 mt-1">Ask treasurer to send payment first.</p>
      </>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-5 md:px-8 py-10 md:py-12">
      <div className="mb-8 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <span className="eyebrow mb-3">
            <span className="eyebrow-dot" />
            Contributor · Balance
          </span>
          <h1 className="mt-3 text-[1.75rem] md:text-[2rem] font-bold text-zinc-900 tracking-tight" style={{ letterSpacing: "-0.02em" }}>
            Your encrypted balance
          </h1>
          <p className="mt-2 text-[14px] text-zinc-500">
            Withdraw anytime to your public wallet.
          </p>
        </div>
        <button
          onClick={loadBalancesAndScan}
          disabled={isLoadingBalances || isScanning}
          className="press btn-secondary text-[12.5px] disabled:opacity-50"
        >
          <svg
            width="12" height="12" viewBox="0 0 16 16" fill="none"
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
          <div className="mb-6 flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 gap-4 flex-wrap">
            <div>
              <p className="text-amber-800 text-[13.5px] font-semibold">
                {isScanning ? "Scanning for pending payments…" : `${unclaimedUtxos.length} unclaimed payment${unclaimedUtxos.length === 1 ? "" : "s"} found`}
              </p>
              <p className="text-amber-700 text-[12px] mt-0.5">
                Claim to move them into your encrypted balance.
              </p>
            </div>
            {!isScanning && (
              <button
                onClick={() => handleClaim(unclaimedUtxos)}
                disabled={isClaiming}
                className="press bg-zinc-900 text-white text-[12.5px] font-semibold px-4 py-2 rounded-lg hover:bg-zinc-800 transition-all disabled:opacity-50"
              >
                {isClaiming ? "Claiming…" : "Claim now"}
              </button>
            )}
          </div>
        );
      })()}

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div data-tour="balance" className="space-y-4">
          <div className="card p-7">
            <div className="flex items-center gap-2 mb-5">
              <span className="text-[10.5px] font-semibold uppercase tracking-wider text-zinc-500">SOL Balance</span>
            </div>
            {renderBalance(solBalance, SOL_MINT, "SOL")}
          </div>
          <div className="card p-7">
            <div className="flex items-center gap-2 mb-5">
              <span className="text-[10.5px] font-semibold uppercase tracking-wider text-zinc-500">USDC Balance</span>
            </div>
            {renderBalance(usdcBalance, USDC_DEVNET_MINT, "USDC")}
          </div>
        </div>

        <div data-tour="withdraw" className="card p-7">
          <h2 className="text-[15px] font-semibold text-zinc-900 mb-5 tracking-tight">Withdraw to wallet</h2>

          <div className="flex gap-1 mb-4 p-1 rounded-full border border-zinc-200 bg-white w-fit">
            {([SOL_MINT, USDC_DEVNET_MINT] as Address[]).map((mint) => {
              const sym = KNOWN_MINTS[mint]?.symbol ?? mint.slice(0, 4);
              const isActive = withdrawMint === mint;
              return (
                <button
                  key={mint}
                  onClick={() => setWithdrawMint(mint)}
                  className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-colors ${
                    isActive
                      ? "bg-zinc-900 text-white"
                      : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  {sym}
                </button>
              );
            })}
          </div>
          <label className="block mb-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 block mb-1.5">
              Amount ({KNOWN_MINTS[withdrawMint]?.symbol ?? "Token"})
            </span>
            <input
              type="number"
              step="0.000000001"
              min="0"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2.5 text-zinc-900 text-[14px] font-mono placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors"
            />
          </label>

          <div className="mb-5 bg-zinc-50/60 border border-zinc-100 rounded-lg px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">Destination</p>
            <p className="font-mono text-[12px] text-zinc-700 truncate">
              {publicKey?.toBase58() ?? "Not connected"}
            </p>
          </div>

          {error && (
            <div className="mb-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-red-700 text-[12.5px]">
              {error}
            </div>
          )}
          {withdrawResult && (
            <div className="mb-3 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-emerald-700 text-[12px] font-mono">
              Queued: {withdrawResult.slice(0, 24)}…
            </div>
          )}

          <button
            onClick={handleWithdraw}
            disabled={isWithdrawing || !withdrawAmount || balances.get(withdrawMint)?.state !== "shared"}
            className="btn-primary press w-full disabled:opacity-40"
          >
            {isWithdrawing ? "Withdrawing…" : "Withdraw"}
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-6 flex flex-col justify-between">
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-wider text-zinc-500 mb-4">
              Privacy model
            </p>
            <div className="space-y-4">
              {[
                { label: "Balance", value: "Rescue cipher", tag: "ETA · x25519" },
                { label: "Withdraw", value: "Direct (MPC)", tag: "Arcium · MXE" },
                { label: "History", value: "Encrypted", tag: "No on-chain leak" },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center">
                  <p className="text-zinc-500 text-[12.5px] font-medium">{item.label}</p>
                  <div className="text-right">
                    <p className="text-zinc-900 text-[13px] font-semibold">{item.value}</p>
                    <p className="font-mono text-[10px] text-zinc-400 mt-0.5">{item.tag}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div data-tour="compliance" className="relative card overflow-hidden p-6 flex flex-col justify-between">
          {/* Aurora line accent */}
          <div aria-hidden className="absolute inset-x-0 top-0 aurora-line" />

          {/* Halo */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(16,185,129,0.10), transparent 70%)",
            }}
          />

          <div className="relative">
            {/* Eyebrow + headline */}
            <div className="flex items-center gap-2 mb-3">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-soft-pulse" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              <span className="text-[10.5px] font-semibold uppercase tracking-wider text-emerald-700">
                Self-Sovereign Compliance
              </span>
            </div>
            <h3 className="text-[18px] font-semibold text-zinc-900 mb-2 tracking-tight">
              End-to-end encrypted report
            </h3>
            <p className="text-zinc-500 text-[13px] leading-relaxed mb-5 max-w-md">
              Decrypt your data locally, re-encrypt with a shared password, and publish to IPFS
              addressed to your auditor. Only they can read it.
            </p>

            {/* 3-step badges */}
            <div className="flex items-center gap-1.5 mb-6 text-[11px] font-medium">
              {[
                { n: "1", t: "Decrypt" },
                { n: "2", t: "Encrypt" },
                { n: "3", t: "Publish" },
              ].map((s, i) => (
                <span key={s.n} className="contents">
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-50 border border-zinc-200 text-zinc-700">
                    <span className="w-4 h-4 rounded-full bg-zinc-900 text-white text-[9px] grid place-items-center font-semibold">
                      {s.n}
                    </span>
                    {s.t}
                  </span>
                  {i < 2 && (
                    <span aria-hidden className="text-zinc-300">
                      →
                    </span>
                  )}
                </span>
              ))}
            </div>

            {/* Time range — segmented switcher */}
            <label className="block mb-4">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 block mb-1.5">
                Time range
              </span>
              <div className="flex items-center gap-1 p-1 rounded-lg bg-zinc-50 border border-zinc-200 w-fit">
                {[
                  { v: "all", l: "All time" },
                  { v: "year", l: "Year" },
                  { v: "month", l: "Month" },
                ].map((opt) => {
                  const active = filterType === opt.v;
                  return (
                    <button
                      key={opt.v}
                      type="button"
                      onClick={() => setFilterType(opt.v as "all" | "year" | "month")}
                      className={`press text-[12px] font-semibold px-3 py-1.5 rounded-md transition-all ${
                        active
                          ? "bg-white text-zinc-900 shadow-sm"
                          : "text-zinc-500 hover:text-zinc-900"
                      }`}
                    >
                      {opt.l}
                    </button>
                  );
                })}
              </div>
            </label>

            {filterType === "year" && (
              <label className="block mb-4">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 block mb-1.5">
                  Year
                </span>
                <input
                  type="number"
                  min="2020"
                  max="2030"
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="w-32 bg-white border border-zinc-200 rounded-lg px-3.5 py-2.5 text-zinc-900 text-[13px] font-mono focus:outline-none focus:border-zinc-400 transition-colors"
                />
              </label>
            )}

            {filterType === "month" && (
              <label className="block mb-4">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 block mb-1.5">
                  Month
                </span>
                <input
                  type="month"
                  value={`${filterYear}-${filterMonth}`}
                  onChange={(e) => {
                    const [y, m] = e.target.value.split("-");
                    if (y && m) {
                      setFilterYear(y);
                      setFilterMonth(m);
                    }
                  }}
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2.5 text-zinc-900 text-[13px] font-mono focus:outline-none focus:border-zinc-400 transition-colors"
                />
              </label>
            )}

            {/* Auditor address */}
            <label className="block mb-4">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 block mb-1.5">
                Auditor wallet address
              </span>
              <input
                type="text"
                placeholder="Base58 address…"
                value={auditorAddress}
                onChange={(e) => setAuditorAddress(e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2.5 text-zinc-900 text-[13px] font-mono placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors"
              />
            </label>

            {/* Shared secret */}
            <label className="block mb-6">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 block mb-1.5">
                Shared secret
              </span>
              <input
                type="password"
                placeholder="Type a strong password…"
                value={sharedSecret}
                onChange={(e) => setSharedSecret(e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded-lg px-3.5 py-2.5 text-zinc-900 text-[13px] placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors"
              />
              <span className="block mt-1.5 text-[11px] text-zinc-400 leading-relaxed">
                Share this with your auditor through a secure channel. Without it, the report is unreadable.
              </span>
            </label>
          </div>

          {/* CTA */}
          <button
            onClick={handleGenerateProof}
            disabled={isGeneratingProof || pendingUtxos.length === 0 || !sharedSecret || !auditorAddress}
            className="group press w-full bg-zinc-900 text-white hover:bg-zinc-800 font-semibold text-[13.5px] py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_8px_20px_-10px_rgba(11,13,18,0.45)]"
          >
            {isGeneratingProof ? (
              <>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="animate-spin">
                  <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.3" />
                  <path d="M7 1.5A5.5 5.5 0 0 1 12.5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Publishing to IPFS…
              </>
            ) : (
              <>
                Encrypt &amp; Publish
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  <path d="M2 12L12 2M12 2H5M12 2V9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
