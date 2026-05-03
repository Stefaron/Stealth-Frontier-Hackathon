"use client";

import { useState, useRef } from "react";
import { useUmbra } from "@/context/UmbraContext";
import { useToast } from "@/context/ToastContext";
import { parseCsvPayments, generateCsvTemplate } from "@/lib/csv";
import { privateSend } from "@/lib/umbra/transfers";
import { getUserAccountQuerier } from "@/lib/umbra/balance";
import { KNOWN_MINTS, SOLANA_RPC_URL } from "@/lib/constants";
import type { PaymentBatchRow } from "@/lib/types";
import type { Address } from "@solana/kit";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  PublicKey,
  Transaction,
  SystemProgram,
  TransactionInstruction,
  Connection,
} from "@solana/web3.js";

const WSOL_MINT = "So11111111111111111111111111111111111111112";

const MINT_MAP: Record<string, string> = {
  sol: WSOL_MINT,
  wsol: WSOL_MINT,
};

function resolveMint(raw: string): string {
  const lower = raw.trim().toLowerCase();
  return MINT_MAP[lower] ?? raw.trim();
}

function parseLamports(amount: string, mint: string): bigint {
  const info = KNOWN_MINTS[mint];
  const decimals = info?.decimals ?? 6;
  const [whole, frac = ""] = amount.split(".");
  const fracPadded = frac.slice(0, decimals).padEnd(decimals, "0");
  return BigInt(whole) * BigInt(10 ** decimals) + BigInt(fracPadded);
}

const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
const ASSOC_TOKEN_PROGRAM_ID = new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");
const NATIVE_MINT_PK = new PublicKey(WSOL_MINT);

async function wrapSolTx(
  walletPubkey: PublicKey,
  lamports: bigint,
  connection: Connection
): Promise<Transaction> {
  const [ata] = PublicKey.findProgramAddressSync(
    [walletPubkey.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), NATIVE_MINT_PK.toBuffer()],
    ASSOC_TOKEN_PROGRAM_ID
  );

  const createAta = new TransactionInstruction({
    keys: [
      { pubkey: walletPubkey, isSigner: true, isWritable: true },
      { pubkey: ata, isSigner: false, isWritable: true },
      { pubkey: walletPubkey, isSigner: false, isWritable: false },
      { pubkey: NATIVE_MINT_PK, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    programId: ASSOC_TOKEN_PROGRAM_ID,
    data: Buffer.from([1]), // idempotent CreateAssociatedTokenAccount
  });

  const transfer = SystemProgram.transfer({
    fromPubkey: walletPubkey,
    toPubkey: ata,
    lamports: Number(lamports),
  });

  const syncNative = new TransactionInstruction({
    keys: [{ pubkey: ata, isSigner: false, isWritable: true }],
    programId: TOKEN_PROGRAM_ID,
    data: Buffer.from([17]), // SyncNative discriminator
  });

  const { blockhash } = await connection.getLatestBlockhash();
  const tx = new Transaction({ recentBlockhash: blockhash, feePayer: walletPubkey });
  tx.add(createAta, transfer, syncNative);
  return tx;
}

export default function PayPage() {
  const { client } = useUmbra();
  const { sendTransaction, publicKey } = useWallet();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<PaymentBatchRow[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [wrapAmount, setWrapAmount] = useState("0.05");
  const [isWrapping, setIsWrapping] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setGlobalError(null);
    try {
      const parsed = await parseCsvPayments(file);
      if (!parsed.length) {
        setGlobalError("No valid rows found in CSV");
        return;
      }
      setRows(
        parsed.map((r, i) => ({
          ...r,
          index: i,
          status: { state: "pending" },
        }))
      );
    } catch {
      setGlobalError("Failed to parse CSV");
      toast.error("Failed to parse CSV file");
    }
  };

  const downloadTemplate = () => {
    const csv = generateCsvTemplate();
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "stealth-pay-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleWrapSol = async () => {
    if (!publicKey || isWrapping) return;
    const lamports = BigInt(Math.round(parseFloat(wrapAmount) * 1e9));
    if (lamports <= 0n) return;
    setIsWrapping(true);
    try {
      const connection = new Connection(SOLANA_RPC_URL, "confirmed");
      const tx = await wrapSolTx(publicKey, lamports, connection);
      const sig = await sendTransaction(tx, connection);
      await connection.confirmTransaction(sig, "confirmed");
      toast.success(`Wrapped ${wrapAmount} SOL → WSOL (${sig.slice(0, 8)}…)`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      toast.error(`Wrap failed: ${msg}`);
    } finally {
      setIsWrapping(false);
    }
  };

  const sendAll = async () => {
    if (!client || isSending) return;
    setIsSending(true);

    const updatedRows = [...rows];

    // Check sender's own account before iterating rows
    try {
      const querier = getUserAccountQuerier(client);
      const senderAcc = await querier(client.signer.address as Address);
      if (
        senderAcc.state !== "exists" ||
        !senderAcc.data?.isActiveForAnonymousUsage
      ) {
        setGlobalError(
          "Akun Umbra Anda belum aktif untuk anonymous usage. Silakan klik 'Initialize Umbra Client' lalu 'Register' di dashboard lagi dan tunggu Arcium memproses."
        );
        setIsSending(false);
        return;
      }
    } catch {
      setGlobalError("Gagal verifikasi status akun pengirim. Coba lagi.");
      setIsSending(false);
      return;
    }

    // Pre-validate: check mint support and recipient registration
    const querier = getUserAccountQuerier(client);
    for (let i = 0; i < updatedRows.length; i++) {
      const row = updatedRows[i];
      if (row.status.state === "sent") continue;

      const resolvedMint = resolveMint(row.mint || "SOL");
      if (resolvedMint !== WSOL_MINT) {
        updatedRows[i] = {
          ...row,
          status: {
            state: "error",
            error: `Token "${row.mint}" not supported on devnet — use SOL`,
          },
        };
        continue;
      }

      try {
        const acc = await querier(row.address as Address);
        const fullyRegistered =
          acc.state === "exists" &&
          acc.data?.isUserAccountX25519KeyRegistered === true &&
          acc.data?.isActiveForAnonymousUsage === true;
        if (!fullyRegistered) {
          updatedRows[i] = {
            ...row,
            status: {
              state: "error",
              error:
                acc.state !== "exists"
                  ? "Recipient not registered with Umbra"
                  : !acc.data?.isActiveForAnonymousUsage
                  ? "Recipient anonymous usage not yet active — Arcium still processing"
                  : "Recipient registration incomplete — X25519 key not yet confirmed",
            },
          };
        }
      } catch {
        updatedRows[i] = {
          ...row,
          status: { state: "error", error: "Could not verify recipient registration" },
        };
      }
    }
    setRows([...updatedRows]);

    for (let i = 0; i < updatedRows.length; i++) {
      const row = updatedRows[i];
      if (row.status.state === "sent" || row.status.state === "error") continue;

      updatedRows[i] = { ...row, status: { state: "sending" } };
      setRows([...updatedRows]);

      try {
        const mint = resolveMint(row.mint || "SOL") as Address;
        const amount = parseLamports(row.amount, mint);
        const sig = await privateSend(client, {
          recipientAddress: row.address as Address,
          mint,
          amount,
        });
        updatedRows[i] = { ...row, status: { state: "sent", signature: sig } };
      } catch (e) {
        console.error(`[Pay] Row ${i} failed:`, e);
        if (e && typeof e === "object") {
          const ex = e as Record<string, unknown>;
          if (ex.logs) console.error("[Pay] TX logs:", ex.logs);
          if (ex.cause) {
            console.error("[Pay] Cause:", ex.cause);
            const cause = ex.cause as Record<string, unknown>;
            if (cause?.cause) console.error("[Pay] Root cause:", cause.cause);
          }
        }
        let errMsg = e instanceof Error ? e.message : "Unknown error";
        if (errMsg.includes("#3012") || errMsg.includes("AccountNotInitialized")) {
          errMsg = "Token not supported on devnet — use SOL";
        } else if (errMsg.includes("insufficient funds") || errMsg.includes("0x1") ) {
          errMsg = "Insufficient SOL balance — wrap more SOL in your wallet";
        }
        updatedRows[i] = {
          ...row,
          status: { state: "error", error: errMsg },
        };
      }
      setRows([...updatedRows]);
    }

    setIsSending(false);
    const sent = updatedRows.filter((r) => r.status.state === "sent").length;
    const failed = updatedRows.filter((r) => r.status.state === "error").length;
    if (failed === 0) {
      toast.success(`${sent} payment${sent !== 1 ? "s" : ""} sent privately`);
    } else {
      toast.info(`${sent} sent, ${failed} failed — check rows for details`);
    }
  };

  const pendingCount = rows.filter((r) => r.status.state === "pending").length;
  const sentCount = rows.filter((r) => r.status.state === "sent").length;
  const errorCount = rows.filter((r) => r.status.state === "error").length;

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-8 py-12">
      <div className="mb-8">
        <p className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/25 mb-3">
          Treasurer · Pay
        </p>
        <h1 className="text-3xl font-bold text-white mb-1">Bulk Private Pay</h1>
        <p className="text-white/35 text-sm">
          Upload a CSV, preview recipients, then send privately via Umbra mixer.
        </p>
      </div>

      {/* Wrap SOL utility */}
      {publicKey && (
        <div className="mb-6 bg-amber-500/[0.06] border border-amber-500/[0.15] rounded-2xl px-5 py-4 flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-amber-400 text-[11px] font-semibold mb-0.5">Devnet: wrap SOL → WSOL sebelum kirim</p>
            <p className="text-amber-400/50 text-[10px]">Umbra devnet hanya support Wrapped SOL</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0.001"
              step="0.01"
              value={wrapAmount}
              onChange={(e) => setWrapAmount(e.target.value)}
              className="w-24 bg-white/[0.05] border border-white/[0.1] rounded-lg px-3 py-1.5 text-white text-xs text-right focus:outline-none focus:border-amber-400/40"
            />
            <span className="text-white/30 text-xs">SOL</span>
            <button
              onClick={handleWrapSol}
              disabled={isWrapping || !publicKey}
              className="bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-bold tracking-widest uppercase px-4 py-1.5 rounded-full hover:bg-amber-500/30 transition-all disabled:opacity-40"
            >
              {isWrapping ? "Wrapping…" : "Wrap SOL"}
            </button>
          </div>
        </div>
      )}

      {!rows.length ? (
        <div className="grid md:grid-cols-2 gap-6">
          <div
            className="bg-white/[0.025] border-2 border-dashed border-white/[0.08] rounded-2xl p-10 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-violet-500/30 hover:bg-white/[0.035] transition-all duration-200"
            onClick={() => fileRef.current?.click()}
          >
            <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 3v12M8 8l4-5 4 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-white font-semibold mb-1">Upload CSV</p>
              <p className="text-white/35 text-sm">address, amount, mint (SOL), note</p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <div className="bg-white/[0.025] border border-white/[0.06] rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-3">CSV Format</h3>
            <pre className="bg-white/[0.03] rounded-lg p-4 text-[10px] font-mono text-white/40 overflow-x-auto">
              {`address,amount,mint,note\n8xH3...,0.01,SOL,Q1 salary\n7yJ2...,0.05,SOL,Bounty`}
            </pre>
            <p className="mt-2 text-amber-400/60 text-[9px]">Devnet: only SOL (wrapped) is supported</p>
            <button
              onClick={downloadTemplate}
              className="mt-3 text-violet-400 text-[10px] font-semibold tracking-widest uppercase hover:text-violet-300 transition-colors"
            >
              Download template →
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-6 text-sm">
              <span className="text-white/35">
                <span className="text-white font-bold">{rows.length}</span> recipients
              </span>
              {sentCount > 0 && (
                <span className="text-emerald-400 font-mono text-[11px]">
                  ✓ {sentCount} sent
                </span>
              )}
              {errorCount > 0 && (
                <span className="text-red-400 font-mono text-[11px]">
                  ✕ {errorCount} failed
                </span>
              )}
            </div>
            <div className="flex-1" />
            <button
              onClick={() => setRows([])}
              className="text-white/25 text-[9px] tracking-widest uppercase hover:text-white/50 transition-colors"
            >
              Clear
            </button>
            <button
              onClick={sendAll}
              disabled={isSending || pendingCount === 0}
              className="inline-flex items-center gap-2 bg-white text-[#0d0c0a] text-[10px] font-bold tracking-widest uppercase px-6 py-2.5 rounded-full hover:bg-white/90 transition-all duration-200 disabled:opacity-40"
            >
              {isSending ? "Sending…" : `Send ${pendingCount} privately`}
            </button>
          </div>

          {globalError && (
            <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
              {globalError}
            </div>
          )}

          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3 border-b border-white/[0.05] text-[9px] font-semibold tracking-[0.15em] uppercase text-white/25">
              <span>Recipient</span>
              <span>Amount</span>
              <span>Token</span>
              <span>Status</span>
            </div>
            {rows.map((row) => (
              <div
                key={row.index}
                className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-5 py-3.5 border-b border-white/[0.04] last:border-0"
              >
                <div>
                  <p className="font-mono text-[11px] text-white/60">
                    {row.address.slice(0, 12)}…{row.address.slice(-6)}
                  </p>
                  {row.note && (
                    <p className="text-[10px] text-white/25 mt-0.5">{row.note}</p>
                  )}
                </div>
                <span className="text-white/70 text-sm font-medium">{row.amount}</span>
                <span className="font-mono text-[10px] text-white/40 uppercase">
                  {row.mint || "SOL"}
                </span>
                <div className="text-right">
                  {row.status.state === "pending" && (
                    <span className="text-white/25 text-[10px]">Pending</span>
                  )}
                  {row.status.state === "sending" && (
                    <span className="text-violet-400 text-[10px] animate-pulse">Proving…</span>
                  )}
                  {row.status.state === "sent" && (
                    <span className="text-emerald-400 text-[10px]">✓ Sent</span>
                  )}
                  {row.status.state === "error" && (
                    <div className="text-right">
                      <span className="text-red-400 text-[10px]">✕ Error</span>
                      <p className="text-red-400/50 text-[9px] max-w-[160px] truncate" title={row.status.error}>
                        {row.status.error}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
