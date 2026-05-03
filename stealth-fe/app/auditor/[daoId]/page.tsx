"use client";

import { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { useToast } from "@/context/ToastContext";
import { generateAuditPdf } from "@/lib/pdf";
import { exportAuditCsv } from "@/lib/csv";
import type { AuditTransaction } from "@/lib/types";
import { KNOWN_MINTS, USDC_DEVNET_MINT } from "@/lib/constants";

// Mock transaction data — in production, fetched from Umbra indexer using grant nonce
const MOCK_TXS: AuditTransaction[] = [
  {
    signature: "5xH3kJLmV9aQ2WNrYz4XUPD7k8vM3jBnA1cR5pTqW2Yjm8BnK9pQ",
    timestamp: Date.now() - 86400000 * 2,
    amount: 100_000_000n,
    mint: USDC_DEVNET_MINT,
    recipient: "8xH3kJLmV9aQ2WNrYz4XUPD7k8vM3jBnA1cR5pTqW2Y",
    type: "send",
  },
  {
    signature: "3aB7cDe2fGhI5jKlMnOpQrStUvWxYz1A2B3C4D5E6F7GhIjKlMnOp",
    timestamp: Date.now() - 86400000,
    amount: 250_000_000n,
    mint: USDC_DEVNET_MINT,
    recipient: "7yJ2mKpR8nTqV4sXwZ6bCdEfGhIjKlMn3opQrStUvWxY",
    type: "send",
  },
  {
    signature: "9kL4mNo7pQrS2tUv6wXy8zA1BC3DE5FG7HI9JK0LMN2OPQRSTUVWxyz",
    timestamp: Date.now() - 3600000,
    amount: 75_000_000n,
    mint: USDC_DEVNET_MINT,
    recipient: "3cE8fHiJkLmNoP6qRsTuVwXyZaBCD4EF1GH2IJ5KLMNO",
    type: "send",
  },
];

function formatAmount(amount: bigint, mint: string): string {
  const info = KNOWN_MINTS[mint];
  if (!info) return `${amount}`;
  const divisor = BigInt(10 ** info.decimals);
  const whole = amount / divisor;
  const frac = (amount % divisor).toString().padStart(info.decimals, "0").slice(0, 2);
  return `${whole}.${frac} ${info.symbol}`;
}

export default function DaoAuditPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { publicKey } = useWallet();
  const toast = useToast();

  const daoId = params?.daoId as string;
  const nonce = searchParams?.get("nonce") ?? "";
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const total = MOCK_TXS.reduce((sum, t) => sum + t.amount, 0n);
  const auditorAddress = publicKey?.toBase58() ?? "unknown";

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    const loadingId = toast.loading("Generating PDF report…");
    try {
      const blob = generateAuditPdf({
        daoAddress: daoId,
        auditorAddress,
        transactions: MOCK_TXS,
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
      const rows = MOCK_TXS.map((t) => ({
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
          <h1 className="text-3xl font-bold text-white mb-1">
            Treasury Report
          </h1>
          <p className="font-mono text-[10px] text-white/30 truncate max-w-sm">
            {daoId}
          </p>
          {nonce && (
            <p className="font-mono text-[9px] text-white/15 mt-0.5">
              Grant nonce: {nonce.slice(0, 16)}…
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/[0.08] text-white/60 text-[10px] font-bold tracking-widest uppercase px-4 py-2.5 rounded-full hover:bg-white/[0.1] transition-all duration-200"
          >
            Export CSV
          </button>
          <button
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="inline-flex items-center gap-2 bg-white text-[#0d0c0a] text-[10px] font-bold tracking-widest uppercase px-5 py-2.5 rounded-full hover:bg-white/90 transition-all duration-200 disabled:opacity-50"
          >
            {isExportingPdf ? "Generating…" : "Export PDF"}
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Transactions", value: MOCK_TXS.length.toString(), tag: "Via Umbra Mixer" },
          { label: "Total Volume", value: formatAmount(total, USDC_DEVNET_MINT), tag: "USDC" },
          { label: "Grant Status", value: "Active", tag: "GRANT·ECDH·scoped-key" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white/[0.025] border border-white/[0.06] rounded-2xl p-5"
          >
            <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-white/20 mb-2">
              {s.label}
            </p>
            <p className="text-xl font-bold text-white">{s.value}</p>
            <p className="font-mono text-[8px] text-white/15 tracking-widest mt-1">
              {s.tag}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3 border-b border-white/[0.05] text-[9px] font-semibold tracking-[0.15em] uppercase text-white/25">
          <span>Transaction</span>
          <span>Amount</span>
          <span>Type</span>
          <span>Date</span>
        </div>
        {MOCK_TXS.map((tx) => (
          <div
            key={tx.signature}
            className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-5 py-4 border-b border-white/[0.04] last:border-0"
          >
            <div>
              <p className="font-mono text-[10px] text-white/50">
                {tx.signature.slice(0, 16)}…
              </p>
              <p className="font-mono text-[9px] text-white/20 mt-0.5">
                → {tx.recipient.slice(0, 12)}…
              </p>
            </div>
            <span className="text-white/70 text-sm font-medium tabular-nums">
              {formatAmount(tx.amount, tx.mint)}
            </span>
            <span
              className={`font-mono text-[9px] tracking-widest uppercase px-2 py-0.5 rounded-full ${
                tx.type === "send"
                  ? "bg-violet-500/10 text-violet-400"
                  : "bg-emerald-500/10 text-emerald-400"
              }`}
            >
              {tx.type}
            </span>
            <span className="text-white/30 text-[10px] tabular-nums">
              {new Date(tx.timestamp).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-white/[0.05] flex items-center gap-2">
        <span className="w-1 h-1 rounded-full bg-emerald-400" />
        <span className="font-mono text-[9px] text-white/20 tracking-widest">
          Data decrypted via X25519 compliance grant · VK·POOL·read-only
        </span>
      </div>
    </div>
  );
}
