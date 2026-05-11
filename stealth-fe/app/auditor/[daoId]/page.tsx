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
  const fracFull = (amount % divisor).toString().padStart(info.decimals, "0");
  const frac = fracFull.replace(/0+$/, "").padEnd(2, "0");
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
  const [scopeMint, setScopeMint] = useState<string>("So11111111111111111111111111111111111111112");

  const [searchRecipient, setSearchRecipient] = useState("");

  const auditorAddress = publicKey?.toBase58() ?? "unknown";

  // Use real scan results or empty array
  const transactions: DecryptedUtxoTransaction[] = scanResult?.transactions ?? [];
  const filteredTransactions = transactions.filter((t) =>
    t.destination.toLowerCase().includes(searchRecipient.toLowerCase())
  );
  const total = filteredTransactions.reduce((sum, t) => sum + t.amount, 0n);

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
  const exportTxs: AuditTransaction[] = filteredTransactions.map((t) => ({
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

  const backLink = (
    <Link
      href="/auditor"
      className="inline-flex items-center gap-1 text-[12.5px] font-medium text-zinc-500 hover:text-zinc-900 transition-colors press"
    >
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
        <path d="M9 2L3 6L9 10M3 6H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      All grants
    </Link>
  );

  if (!publicKey) {
    return (
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-12 text-center">
        <p className="text-zinc-500 text-[14px] mb-3">Wallet not connected.</p>
        {backLink}
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-10 md:py-12">
        <div className="mb-6">{backLink}</div>
        <div className="card p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 grid place-items-center mx-auto mb-4 text-red-600">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 6v4M10 14h.01M19 10A9 9 0 1 1 1 10a9 9 0 0 1 18 0Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-red-700 font-bold text-[15px] mb-1.5">Access denied</p>
          <p className="text-zinc-600 text-[13.5px] mb-1">
            The connected wallet does not have a grant for this report.
          </p>
          <p className="font-mono text-[11px] text-zinc-400">
            {publicKey.toBase58().slice(0, 16)}… does not have permission
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-8 py-10 md:py-12">
      <div className="mb-3">{backLink}</div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <span className="eyebrow mb-3">
            <span className="eyebrow-dot" />
            Auditor · DAO Report
          </span>
          <h1 className="mt-3 text-[1.75rem] md:text-[2rem] font-bold text-zinc-900 tracking-tight" style={{ letterSpacing: "-0.02em" }}>
            Treasury report
          </h1>
          <p className="font-mono text-[11.5px] text-zinc-500 truncate max-w-sm mt-1.5">{daoId}</p>
          {nonce && (
            <p className="font-mono text-[10.5px] text-zinc-400 mt-0.5">
              Grant nonce: {nonce.slice(0, 16)}…
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            disabled={filteredTransactions.length === 0}
            className="btn-secondary press text-[12.5px] disabled:opacity-40"
          >
            Export CSV
          </button>
          <button
            onClick={handleExportPdf}
            disabled={isExportingPdf || filteredTransactions.length === 0}
            className="btn-primary press text-[12.5px] disabled:opacity-50"
          >
            {isExportingPdf ? "Generating…" : "Export PDF"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        {[
          {
            label: "Filtered transactions",
            value: filteredTransactions.length.toString(),
            tag: scanResult ? `${transactions.length} total decrypted` : "Via Umbra mixer",
          },
          {
            label: "Filtered volume",
            value: filteredTransactions.length > 0 ? formatAmount(total, scopeMint) : "—",
            tag: KNOWN_MINTS[scopeMint]?.symbol ?? "USDC",
          },
          {
            label: "Grant status",
            value: "Active",
            tag: grant?.viewingKey ? "VK · attached" : "VK · not set",
          },
        ].map((s) => (
          <div key={s.label} className="card p-5">
            <p className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium mb-2">
              {s.label}
            </p>
            <p className="text-[18px] font-semibold text-zinc-900 tracking-tight">{s.value}</p>
            <p className="text-[11px] text-zinc-400 font-mono tracking-wide mt-1">{s.tag}</p>
          </div>
        ))}
      </div>

      {/* Scanner controls */}
      {grant?.viewingKey ? (
        <div className="card p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-end gap-4">
          <div className="flex-1 grid sm:grid-cols-2 gap-3 w-full">
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 block mb-1.5">
                Mint
              </span>
              <input
                type="text"
                value={scopeMint}
                onChange={(e) => setScopeMint(e.target.value.trim())}
                placeholder="Token mint address…"
                className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-zinc-900 text-[12px] font-mono placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors"
              />
            </label>
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 block mb-1.5">
                VK level
              </span>
              <select
                value={vkLevel}
                onChange={(e) => setVkLevel(e.target.value as VkLevel)}
                className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-zinc-900 text-[12px] font-mono focus:outline-none focus:border-zinc-400 transition-colors"
              >
                {VK_LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button
            onClick={handleScan}
            disabled={isScanning}
            className="btn-primary press flex-shrink-0 disabled:opacity-40"
          >
            {isScanning ? "Scanning…" : "Load transactions"}
          </button>
        </div>
      ) : (
        <div className="card p-5 mb-6 text-center">
          <p className="text-zinc-700 text-[13.5px] mb-1 font-medium">No viewing key attached to this grant.</p>
          <p className="text-zinc-500 text-[12px]">
            Ask the DAO treasurer to re-issue the grant with a viewing key to enable scanning.
          </p>
        </div>
      )}

      {/* Progress counters */}
      {scanResult && (
        <div className="flex flex-wrap gap-2 mb-5">
          {[
            { label: "Indexed", value: scanResult.progress.indexerCount },
            { label: "In scope", value: scanResult.progress.inScopeCount },
            { label: "Events", value: scanResult.progress.eventsFound },
            { label: "Decrypted", value: scanResult.progress.decrypted },
            { label: "Failed", value: scanResult.progress.decryptionFailed },
            { label: "Bogus", value: scanResult.progress.looksBogus },
          ].map((s) => (
            <div key={s.label} className="card px-3 py-1.5 flex items-center gap-2">
              <span className="text-[10.5px] text-zinc-500 uppercase tracking-wider font-medium">
                {s.label}
              </span>
              <span className="font-mono text-[12px] text-zinc-900 font-semibold">{s.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Transactions table */}
      <div className="card overflow-hidden">
        {scanResult && (
          <div className="px-5 py-4 border-b border-zinc-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-50/40">
            <div>
              <h2 className="text-[14px] font-semibold text-zinc-900 tracking-tight">Decrypted transactions</h2>
              <p className="text-[11.5px] text-zinc-500 mt-0.5">Filtered locally in your browser</p>
            </div>
            <div className="relative w-full sm:w-auto">
              <input
                type="text"
                value={searchRecipient}
                onChange={(e) => setSearchRecipient(e.target.value.trim())}
                placeholder="Search recipient address…"
                className="w-full sm:w-72 bg-white border border-zinc-200 rounded-lg pl-9 pr-3 py-2 text-zinc-900 text-[12px] font-mono placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
            </div>
          </div>
        )}
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3 border-b border-zinc-100 text-[10.5px] font-semibold tracking-wider uppercase text-zinc-500">
          <span>Transaction</span>
          <span>Amount</span>
          <span>Source</span>
          <span>Date</span>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-zinc-500 text-[13.5px]">
              {isScanning
                ? "Scanning Umbra indexer…"
                : grant?.viewingKey
                ? 'Click "Load transactions" to decrypt treasury activity.'
                : "Attach a viewing key to this grant to enable scanning."}
            </p>
          </div>
        ) : (
          filteredTransactions.map((tx) => (
            <div
              key={tx.signature}
              className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-5 py-4 border-b border-zinc-100 last:border-0"
            >
              <div>
                <div className="font-mono text-[12px] text-zinc-900 mb-0.5">
                  {tx.signature.length > 20 ? (
                    <a 
                      href={`https://solscan.io/tx/${tx.signature}?cluster=devnet`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 hover:underline transition-colors inline-flex items-center gap-1.5"
                      title="View on Solscan"
                    >
                      {tx.signature.slice(0, 16)}…
                      <svg width="10" height="10" viewBox="0 0 14 14" fill="none" className="shrink-0"><path d="M4 2h8v8M12 2L3 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </a>
                  ) : (
                    <span className="text-zinc-500">Index: {tx.signature}</span>
                  )}
                </div>
                <p className="font-mono text-[10.5px] text-zinc-500">
                  → {tx.destination.slice(0, 12)}…
                </p>
              </div>
              <span className="text-zinc-900 text-[13.5px] font-medium tabular-nums">
                {formatAmount(tx.amount, tx.mint)}
              </span>
              <span
                className={`text-[10.5px] tracking-wider uppercase px-2 py-0.5 rounded-full font-semibold ${
                  tx.sourceVariant === "ATA"
                    ? "bg-indigo-50 text-indigo-700"
                    : "bg-blue-50 text-blue-700"
                }`}
              >
                {tx.sourceVariant}
              </span>
              <span className="text-zinc-500 text-[11.5px] tabular-nums">
                {new Date(tx.timestamp * 1000).toLocaleDateString()}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-zinc-100 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-soft-pulse" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          <span className="text-[11.5px] text-zinc-500 font-medium">
            Data decrypted via X25519 compliance grant · read-only
          </span>
        </div>
        {grant?.viewingKey && (
          <span className="font-mono text-[10.5px] text-zinc-400 truncate max-w-xs">
            VK: {grant.viewingKey.slice(0, 20)}…
          </span>
        )}
      </div>
    </div>
  );
}
