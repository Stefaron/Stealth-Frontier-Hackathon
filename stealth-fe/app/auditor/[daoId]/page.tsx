"use client";

import { useState, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { useToast } from "@/context/ToastContext";
import { generateAuditPdf } from "@/lib/pdf";
import { exportAuditCsv } from "@/lib/csv";
import { getGrantsByAuditor } from "@/lib/grants-store";
import { KNOWN_MINTS, USDC_DEVNET_MINT } from "@/lib/constants";
import { scanCompliance } from "@/lib/compliance/scanner";
import type { DecryptedUtxoTransaction, ScanResult, VkLevel } from "@/lib/compliance/types";
import type { AuditTransaction } from "@/lib/types";

function formatAmount(amount: bigint, mint: string): string {
  const info = KNOWN_MINTS[mint];
  if (!info) return `${amount}`;
  const divisor = BigInt(10 ** info.decimals);
  const whole = amount / divisor;
  const frac = (amount % divisor).toString().padStart(info.decimals, "0").slice(0, 2);
  return `${whole}.${frac} ${info.symbol}`;
}

const VK_LEVELS: VkLevel[] = ["master", "mint", "yearly", "monthly", "daily", "hourly", "minute", "second"];

export default function DaoAuditPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { publicKey } = useWallet();
  const toast = useToast();

  const daoId = params?.daoId as string;
  const nonce = searchParams?.get("nonce") ?? "";
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const grant = publicKey
    ? getGrantsByAuditor(publicKey.toBase58()).find(
        (g) => g.nonce === nonce && g.treasurerAddress === daoId
      )
    : undefined;
  const hasAccess = !!grant;

  // Scanner state
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [vkLevel, setVkLevel] = useState<VkLevel>("master");
  const [scopeMint, setScopeMint] = useState<string>(USDC_DEVNET_MINT);

  const auditorAddress = publicKey?.toBase58() ?? "unknown";

  // Use real scan results or empty array
  const transactions: DecryptedUtxoTransaction[] = scanResult?.transactions ?? [];
  const total = transactions.reduce((sum, t) => sum + t.amount, 0n);

  const handleScan = useCallback(async () => {
    if (!grant?.viewingKey) return;
    setIsScanning(true);
    const loadingId = toast.loading("Scanning treasury via Umbra indexer…");
    try {
      const result = await scanCompliance(
        daoId,               // depositor = treasurer
        grant.viewingKey,
        vkLevel,
        { kind: vkLevel, mint: scopeMint },
        20
      );
      setScanResult(result);
      toast.dismiss(loadingId);
      if (result.warning) {
        toast.error(result.warning);
      } else {
        toast.success(
          `Decrypted ${result.progress.decrypted} transaction${result.progress.decrypted === 1 ? "" : "s"}`
        );
      }
    } catch (e) {
      toast.dismiss(loadingId);
      toast.error(e instanceof Error ? e.message : "Scan failed");
    } finally {
      setIsScanning(false);
    }
  }, [grant, daoId, vkLevel, scopeMint, toast]);

  // For PDF/CSV export, convert to AuditTransaction shape
  const exportTxs: AuditTransaction[] = transactions.map((t) => ({
    signature: t.signature,
    timestamp: t.timestamp * 1000,
    amount: t.amount,
    mint: t.mint,
    recipient: t.destination,
    type: "send",
  }));

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    const loadingId = toast.loading("Generating PDF report…");
    try {
      const blob = generateAuditPdf({
        daoAddress: daoId,
        auditorAddress,
        transactions: exportTxs,
        generatedAt: new Date(),
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `stealth-audit-${daoId.slice(0, 8)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.dismiss(loadingId);
      toast.success("PDF exported");
    } catch (e) {
      toast.dismiss(loadingId);
      toast.error(e instanceof Error ? e.message : "PDF export failed");
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExportCsv = () => {
    try {
      const rows = exportTxs.map((t) => ({
        signature: t.signature,
        timestamp: t.timestamp,
        amount: formatAmount(t.amount, t.mint),
        mint: KNOWN_MINTS[t.mint]?.symbol ?? t.mint,
        recipient: t.recipient,
        type: t.type,
      }));
      const csv = exportAuditCsv(rows);
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `stealth-audit-${daoId.slice(0, 8)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("CSV exported");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "CSV export failed");
    }
  };

  if (!publicKey) {
    return (
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 text-center">
        <p className="text-white/40 text-sm mb-2">Wallet not connected.</p>
        <Link
          href="/auditor"
          className="text-white/30 text-[10px] font-semibold tracking-widest uppercase hover:text-white/60 transition-colors"
        >
          ← Grants
        </Link>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12">
        <div className="mb-6">
          <Link
            href="/auditor"
            className="text-white/30 text-[10px] font-semibold tracking-widest uppercase hover:text-white/60 transition-colors"
          >
            ← Grants
          </Link>
        </div>
        <div className="bg-red-500/[0.06] border border-red-500/20 rounded-2xl p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 6v4M10 14h.01M19 10A9 9 0 1 1 1 10a9 9 0 0 1 18 0Z"
                stroke="#f87171"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <p className="text-red-400 font-bold text-base mb-2">Access Denied</p>
          <p className="text-white/30 text-sm mb-1">
            The connected wallet does not have a grant for this report.
          </p>
          <p className="font-mono text-[10px] text-white/15">
            {publicKey.toBase58().slice(0, 16)}… does not have permission
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-8 py-12">
      <div className="mb-2">
        <Link
          href="/auditor"
          className="text-white/30 text-[10px] font-semibold tracking-widest uppercase hover:text-white/60 transition-colors"
        >
          ← Grants
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <p className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/25 mb-3">
            Auditor · DAO Report
          </p>
          <h1 className="text-3xl font-bold text-white mb-1">Treasury Report</h1>
          <p className="font-mono text-[10px] text-white/30 truncate max-w-sm">{daoId}</p>
          {nonce && (
            <p className="font-mono text-[9px] text-white/15 mt-0.5">
              Grant nonce: {nonce.slice(0, 16)}…
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            disabled={transactions.length === 0}
            className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/[0.08] text-white/60 text-[10px] font-bold tracking-widest uppercase px-4 py-2.5 rounded-full hover:bg-white/[0.1] transition-all duration-200 disabled:opacity-30"
          >
            Export CSV
          </button>
          <button
            onClick={handleExportPdf}
            disabled={isExportingPdf || transactions.length === 0}
            className="inline-flex items-center gap-2 bg-white text-[#0d0c0a] text-[10px] font-bold tracking-widest uppercase px-5 py-2.5 rounded-full hover:bg-white/90 transition-all duration-200 disabled:opacity-50"
          >
            {isExportingPdf ? "Generating…" : "Export PDF"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {[
          {
            label: "Total Transactions",
            value: transactions.length.toString(),
            tag: scanResult ? `${scanResult.progress.indexerCount} indexed` : "Via Umbra Mixer",
          },
          {
            label: "Total Volume",
            value: transactions.length > 0 ? formatAmount(total, scopeMint) : "—",
            tag: KNOWN_MINTS[scopeMint]?.symbol ?? "USDC",
          },
          {
            label: "Grant Status",
            value: "Active",
            tag: grant?.viewingKey ? "VK·ATTACHED" : "VK·NOT·SET",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white/[0.025] border border-white/[0.06] rounded-2xl p-5"
          >
            <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-white/20 mb-2">
              {s.label}
            </p>
            <p className="text-xl font-bold text-white">{s.value}</p>
            <p className="font-mono text-[8px] text-white/15 tracking-widest mt-1">{s.tag}</p>
          </div>
        ))}
      </div>

      {/* Scanner controls */}
      {grant?.viewingKey ? (
        <div className="bg-white/[0.025] border border-white/[0.06] rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-end gap-4">
          <div className="flex-1 grid sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-white/25 block mb-1.5">
                Mint
              </span>
              <input
                type="text"
                value={scopeMint}
                onChange={(e) => setScopeMint(e.target.value.trim())}
                placeholder="Token mint address…"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-white/70 text-[11px] font-mono placeholder:text-white/20 focus:outline-none focus:border-violet-500/40 transition-colors"
              />
            </label>
            <label className="block">
              <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-white/25 block mb-1.5">
                VK Level
              </span>
              <select
                value={vkLevel}
                onChange={(e) => setVkLevel(e.target.value as VkLevel)}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-white/70 text-[11px] font-mono focus:outline-none focus:border-violet-500/40 transition-colors appearance-none"
              >
                {VK_LEVELS.map((l) => (
                  <option key={l} value={l} className="bg-[#1a1917]">
                    {l}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button
            onClick={handleScan}
            disabled={isScanning}
            className="flex-shrink-0 bg-violet-500/20 border border-violet-500/30 text-violet-300 text-[10px] font-bold tracking-widest uppercase px-6 py-2.5 rounded-full hover:bg-violet-500/30 transition-all duration-200 disabled:opacity-40"
          >
            {isScanning ? "Scanning…" : "Load Transactions"}
          </button>
        </div>
      ) : (
        <div className="bg-white/[0.015] border border-white/[0.04] rounded-2xl p-5 mb-6 text-center">
          <p className="text-white/30 text-sm mb-1">No viewing key attached to this grant.</p>
          <p className="font-mono text-[9px] text-white/15">
            Ask the DAO treasurer to re-issue the grant with a viewing key to enable live scanning.
          </p>
        </div>
      )}

      {/* Progress counters (shown after scan) */}
      {scanResult && (
        <div className="flex flex-wrap gap-3 mb-5">
          {[
            { label: "Indexed", value: scanResult.progress.indexerCount },
            { label: "In Scope", value: scanResult.progress.inScopeCount },
            { label: "Events", value: scanResult.progress.eventsFound },
            { label: "Decrypted", value: scanResult.progress.decrypted },
            { label: "Failed", value: scanResult.progress.decryptionFailed },
            { label: "Bogus", value: scanResult.progress.looksBogus },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white/[0.02] border border-white/[0.05] rounded-xl px-3 py-1.5 flex items-center gap-2"
            >
              <span className="font-mono text-[8px] text-white/25 uppercase tracking-widest">
                {s.label}
              </span>
              <span className="font-mono text-[10px] text-white/50 font-bold">{s.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Transactions table */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3 border-b border-white/[0.05] text-[9px] font-semibold tracking-[0.15em] uppercase text-white/25">
          <span>Transaction</span>
          <span>Amount</span>
          <span>Source</span>
          <span>Date</span>
        </div>

        {transactions.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-white/20 text-sm">
              {isScanning
                ? "Scanning Umbra indexer…"
                : grant?.viewingKey
                ? 'Click "Load Transactions" to decrypt treasury activity.'
                : "Attach a viewing key to this grant to enable scanning."}
            </p>
          </div>
        ) : (
          transactions.map((tx) => (
            <div
              key={tx.signature}
              className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-5 py-4 border-b border-white/[0.04] last:border-0"
            >
              <div>
                <p className="font-mono text-[10px] text-white/50">
                  {tx.signature.slice(0, 16)}…
                </p>
                <p className="font-mono text-[9px] text-white/20 mt-0.5">
                  → {tx.destination.slice(0, 12)}…
                </p>
              </div>
              <span className="text-white/70 text-sm font-medium tabular-nums">
                {formatAmount(tx.amount, tx.mint)}
              </span>
              <span
                className={`font-mono text-[9px] tracking-widest uppercase px-2 py-0.5 rounded-full ${
                  tx.sourceVariant === "ATA"
                    ? "bg-violet-500/10 text-violet-400"
                    : "bg-blue-500/10 text-blue-400"
                }`}
              >
                {tx.sourceVariant}
              </span>
              <span className="text-white/30 text-[10px] tabular-nums">
                {new Date(tx.timestamp * 1000).toLocaleDateString()}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-white/[0.05] flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="w-1 h-1 rounded-full bg-emerald-400" />
          <span className="font-mono text-[9px] text-white/20 tracking-widest">
            Data decrypted via X25519 compliance grant · VK·POOL·read-only
          </span>
        </div>
        {grant?.viewingKey && (
          <span className="font-mono text-[8px] text-violet-400/50 tracking-widest truncate max-w-xs">
            VK: {grant.viewingKey.slice(0, 20)}…
          </span>
        )}
      </div>
    </div>
  );
}
