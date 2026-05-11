"use client";

import { useState } from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { useToast } from "@/context/ToastContext";
import { KNOWN_MINTS } from "@/lib/constants";
import type { AuditTransaction } from "@/lib/types";

function formatAmount(amountStr: string, mint: string): string {
  const amount = BigInt(amountStr);
  const info = KNOWN_MINTS[mint];
  if (!info) return `${amount}`;
  const divisor = BigInt(10 ** info.decimals);
  const whole = amount / divisor;
  const fracFull = (amount % divisor).toString().padStart(info.decimals, "0");
  const frac = fracFull.replace(/0+$/, "").padEnd(2, "0");
  return `${whole}.${frac} ${info.symbol}`;
}

export default function AuditorDecryptorPage() {
  const { publicKey } = useWallet();
  const toast = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [isDecrypting, setIsDecrypting] = useState(false);
  
  const [ipfsReports, setIpfsReports] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [decryptedData, setDecryptedData] = useState<{
    contributor: string;
    generatedAt: string;
    transactions: AuditTransaction[];
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setDecryptedData(null);
    }
  };

  const handleDecrypt = async () => {
    if (!file || !password) return;
    setIsDecrypting(true);
    const loadingId = toast.loading("Decrypting file...");
    
    try {
      const text = await file.text();
      const encryptedData = JSON.parse(text);
      
      if (encryptedData.cipher !== "AES-GCM" || !encryptedData.ciphertext || !encryptedData.iv || !encryptedData.salt) {
        throw new Error("Invalid encrypted file format.");
      }

      const fromBase64 = (b64: string) => {
        const binary = window.atob(b64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) { bytes[i] = binary.charCodeAt(i); }
        return bytes.buffer;
      };

      const ciphertext = fromBase64(encryptedData.ciphertext);
      const iv = fromBase64(encryptedData.iv);
      const salt = fromBase64(encryptedData.salt);

      const enc = new TextEncoder();
      const keyMaterial = await crypto.subtle.importKey(
        "raw", enc.encode(password), { name: "PBKDF2" }, false, ["deriveKey"]
      );
      
      const key = await crypto.subtle.deriveKey(
        { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["decrypt"]
      );

      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        ciphertext
      );

      const dec = new TextDecoder();
      const payloadString = dec.decode(decryptedBuffer);
      const payload = JSON.parse(payloadString);
      
      setDecryptedData(payload);
      toast.dismiss(loadingId);
      toast.success("File decrypted successfully!");
    } catch (e) {
      toast.dismiss(loadingId);
      toast.error("Decryption failed. Incorrect password or corrupted file.");
      console.error(e);
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleSyncIpfs = async () => {
    if (!publicKey) {
      toast.error("Please connect your auditor wallet to sync.");
      return;
    }
    setIsSyncing(true);
    const loadingId = toast.loading("Searching IPFS for your reports...");
    try {
      const res = await fetch(`/api/pinata/list?auditor=${publicKey.toBase58()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setIpfsReports(data.rows || []);
      toast.dismiss(loadingId);
      toast.success(`Found ${data.rows?.length || 0} reports assigned to your wallet.`);
    } catch (e) {
      toast.dismiss(loadingId);
      toast.error("Failed to sync from IPFS.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSelectIpfsReport = async (ipfsHash: string) => {
    const loadingId = toast.loading("Downloading report from IPFS...");
    try {
      const res = await fetch(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`);
      if (!res.ok) throw new Error("Failed to download");
      const blob = await res.blob();
      const downloadedFile = new File([blob], `ipfs-${ipfsHash}.json`, { type: "application/json" });
      setFile(downloadedFile);
      toast.dismiss(loadingId);
      toast.success("Report downloaded. Please enter the password to decrypt.");
    } catch (e) {
      toast.dismiss(loadingId);
      toast.error("Failed to download report from IPFS.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-8 py-10 md:py-12">
      <div className="mb-3">
        <Link
          href="/auditor"
          className="inline-flex items-center gap-1 text-[12.5px] font-medium text-zinc-500 hover:text-zinc-900 transition-colors press"
        >
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path d="M9 2L3 6L9 10M3 6H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          All Company Audits
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <span className="eyebrow mb-3">
            <span className="eyebrow-dot" />
            Auditor · Individual Reports
          </span>
          <h1 className="mt-3 text-[1.75rem] md:text-[2rem] font-bold text-zinc-900 tracking-tight" style={{ letterSpacing: "-0.02em" }}>
            Individual Compliance Reports
          </h1>
          <p className="font-mono text-[11.5px] text-zinc-500 max-w-xl mt-1.5">
            Sync encrypted income reports provided by individual workers and unlock them securely.
          </p>
        </div>
      </div>

      {!decryptedData ? (
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          
          {/* Column 1: Sync IPFS */}
          <div className="card p-7 md:p-9 flex flex-col h-full">
            <div className="mb-6">
              <h2 className="text-[17px] font-bold text-zinc-900 tracking-tight mb-1">1. Sync from IPFS</h2>
              <p className="text-zinc-500 text-[12.5px] leading-relaxed">
                Connect to the Pinata network to find E2E encrypted reports sent by contributors to your wallet address.
              </p>
            </div>
            
            <button
              onClick={handleSyncIpfs}
              disabled={isSyncing || !publicKey}
              className="w-full bg-zinc-900 text-white hover:bg-zinc-800 press py-3 rounded-lg text-[13px] font-semibold transition-colors disabled:opacity-50 mb-5"
            >
              {isSyncing ? "Syncing IPFS Network..." : "Sync IPFS Reports"}
            </button>

            {ipfsReports.length > 0 ? (
              <div className="flex-1 border border-zinc-200 rounded-lg overflow-hidden flex flex-col">
                <div className="bg-zinc-50 px-4 py-2 border-b border-zinc-200 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                  Available Reports ({ipfsReports.length})
                </div>
                <div className="flex-1 overflow-y-auto max-h-[250px]">
                  {ipfsReports.map((report) => {
                    const contributor = report.metadata?.keyvalues?.contributor;
                    const isSelected = file?.name === `ipfs-${report.ipfs_pin_hash}.json`;
                    return (
                      <div key={report.ipfs_pin_hash} className={`px-4 py-3 border-b border-zinc-100 last:border-0 transition-colors flex items-center justify-between ${isSelected ? 'bg-emerald-50/50' : 'hover:bg-zinc-50'}`}>
                        <div>
                          <p className="text-[12.5px] font-medium text-zinc-900 flex items-center gap-1.5 mb-0.5">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            {contributor ? `From: ${contributor.slice(0, 6)}...${contributor.slice(-4)}` : `Report: ${report.ipfs_pin_hash.slice(0, 8)}...`}
                          </p>
                          <p className="text-[11px] text-zinc-500">
                            {new Date(report.date_pinned).toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleSelectIpfsReport(report.ipfs_pin_hash)}
                          disabled={isSelected}
                          className={`text-[11px] px-3 py-1.5 rounded-md font-semibold press transition-colors ${isSelected ? 'bg-emerald-100 text-emerald-700' : 'bg-white border border-zinc-200 text-zinc-700 hover:border-zinc-400'}`}
                        >
                          {isSelected ? 'Selected' : 'Select'}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
               <div className="flex-1 border border-dashed border-zinc-200 rounded-lg flex items-center justify-center p-6 text-center bg-zinc-50/50">
                 <div>
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-300 mx-auto mb-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                   <p className="text-zinc-500 text-[12px] font-medium">No reports synced yet</p>
                   <p className="text-zinc-400 text-[11px] mt-0.5">Click sync to scan the network.</p>
                 </div>
               </div>
            )}
          </div>

          {/* Column 2: Decrypt */}
          <div className="card p-7 md:p-9 flex flex-col h-full">
            <div className="mb-6">
              <h2 className="text-[17px] font-bold tracking-tight text-zinc-900 mb-1">2. Decrypt Report</h2>
              <p className="text-zinc-500 text-[12.5px] leading-relaxed">
                Select a report from the left, enter the shared secret password, and decrypt the financial data locally.
              </p>
            </div>

            <div className="mb-6">
              <label className="block mb-2 text-[11.5px] font-semibold uppercase tracking-wider text-zinc-500">
                Selected Report
              </label>
              {file ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center justify-between">
                  <p className="text-[12.5px] font-semibold text-emerald-700 flex items-center gap-2">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    Ready: <span className="font-mono text-[11.5px] text-emerald-800">{file.name.slice(0, 20)}...</span>
                  </p>
                  <button onClick={() => setFile(null)} className="text-[11px] text-emerald-600/60 hover:text-emerald-700 font-medium transition-colors">Clear</button>
                </div>
              ) : (
                <div className="bg-zinc-50/50 border border-dashed border-zinc-200 rounded-lg p-5 text-center">
                  <p className="text-zinc-500 text-[12.5px] font-medium">No report selected</p>
                </div>
              )}
            </div>

            <div className="mb-auto">
              <label className="block mb-2 text-[11.5px] font-semibold uppercase tracking-wider text-zinc-500">
                Shared Secret (Password)
              </label>
              <input 
                type="password"
                placeholder="Enter the password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-3 text-zinc-900 text-[13.5px] font-mono placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors"
              />
            </div>

            <button
              onClick={handleDecrypt}
              disabled={!file || !password || isDecrypting}
              className="w-full btn-primary press py-3 mt-8 rounded-lg text-[13.5px] disabled:opacity-50"
            >
              {isDecrypting ? "Decrypting locally..." : "Decrypt Report"}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="card p-6 bg-emerald-50/50 border-emerald-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <p className="text-emerald-800 text-[14px] font-bold mb-1">Decryption Successful</p>
              <p className="text-emerald-700/80 text-[12.5px]">Generated: {new Date(decryptedData.generatedAt).toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-emerald-700 text-[11px] uppercase tracking-wider font-semibold mb-1">Contributor</p>
              <p className="font-mono text-[12px] text-emerald-900 bg-emerald-100 px-2 py-1 rounded-md">{decryptedData.contributor}</p>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/40">
              <div>
                <h2 className="text-[14px] font-semibold text-zinc-900 tracking-tight">Decrypted Transactions</h2>
                <p className="text-[11.5px] text-zinc-500 mt-0.5">Total: {decryptedData.transactions.length} records</p>
              </div>
              <button 
                onClick={() => setDecryptedData(null)}
                className="btn-secondary press text-[11px] px-3 py-1.5"
              >
                Clear Data
              </button>
            </div>
            
            <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-5 py-3 border-b border-zinc-100 text-[10.5px] font-semibold tracking-wider uppercase text-zinc-500">
              <span>Signature</span>
              <span>Amount</span>
              <span>Date</span>
            </div>

            {decryptedData.transactions.length === 0 ? (
              <div className="px-5 py-10 text-center text-zinc-500 text-[13.5px]">No transactions found in report.</div>
            ) : (
              <div className="max-h-[500px] overflow-y-auto">
                {decryptedData.transactions.map((tx) => (
                  <div
                    key={tx.signature}
                    className="grid grid-cols-[1fr_auto_auto] gap-4 items-center px-5 py-4 border-b border-zinc-100 last:border-0"
                  >
                    <div className="font-mono text-[12px] text-zinc-900 truncate pr-4">
                      {tx.signature.length > 20 ? (
                        <a 
                          href={`https://solscan.io/tx/${tx.signature}?cluster=devnet`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 hover:underline transition-colors flex items-center gap-1.5"
                          title="View on Solscan"
                        >
                          {tx.signature.slice(0, 16)}…{tx.signature.slice(-16)}
                          <svg width="10" height="10" viewBox="0 0 14 14" fill="none"><path d="M4 2h8v8M12 2L3 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </a>
                      ) : (
                        <span className="text-zinc-500">Index: {tx.signature}</span>
                      )}
                    </div>
                    <span className="text-zinc-900 text-[13.5px] font-medium tabular-nums">
                      {formatAmount(tx.amount as unknown as string, tx.mint)}
                    </span>
                    <span className="text-zinc-500 text-[11.5px] tabular-nums">
                      {new Date(tx.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
