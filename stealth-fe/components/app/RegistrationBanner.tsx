"use client";

import { useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useUmbra } from "@/context/UmbraContext";
import { useRegistration } from "@/hooks/useRegistration";

export default function RegistrationBanner() {
  const { publicKey } = useWallet();
  const { client } = useUmbra();
  const walletAddress = publicKey?.toBase58();
  const { status, errorMsg, checkRegistration, register, retry } =
    useRegistration(walletAddress);

  useEffect(() => {
    if (client && walletAddress) {
      checkRegistration();
    }
  }, [client, walletAddress, checkRegistration]);

  // Auto-poll every 30s while waiting for Arcium MXE to finalize X25519 key
  useEffect(() => {
    if (status !== "pending") return;
    const id = setInterval(() => { checkRegistration(); }, 30_000);
    return () => clearInterval(id);
  }, [status, checkRegistration]);

  if (
    !client ||
    status === "idle" ||
    status === "registered"
  ) {
    return null;
  }

  const isChecking = status === "checking";
  const isPending = status === "pending" || isChecking;
  const isError = status === "error";
  const isCancelled = status === "unregistered" && !!errorMsg;

  return (
    <div className="mx-6 md:mx-8 mt-4">
      <div
        className={`border rounded-2xl px-5 py-4 flex items-center gap-4 ${
          isError
            ? "bg-red-500/10 border-red-500/20"
            : isPending
            ? "bg-blue-500/10 border-blue-500/20"
            : "bg-amber-500/10 border-amber-500/20"
        }`}
      >
        <div
          className={`w-8 h-8 rounded-xl border flex items-center justify-center flex-shrink-0 ${
            isError
              ? "bg-red-500/15 border-red-500/20 text-red-400"
              : isPending
              ? "bg-blue-500/15 border-blue-500/20 text-blue-400"
              : "bg-amber-500/15 border-amber-500/20 text-amber-400"
          }`}
        >
          {isPending ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="animate-spin">
              <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.4" strokeDasharray="17" strokeDashoffset="6" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M7 1.5L12.5 11H1.5L7 1.5Z"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              <path
                d="M7 5.5v3M7 10v.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p
            className={`font-semibold text-[13px] ${
              isError ? "text-red-400" : isPending ? "text-blue-400" : "text-amber-400"
            }`}
          >
            {isError
              ? "Registration failed"
              : isPending
              ? "Confirming registration…"
              : "Not registered with Umbra"}
          </p>
          <p className="text-white/35 text-[11px] mt-0.5 truncate">
            {isPending
              ? isChecking
                ? "Re-checking on-chain status…"
                : (errorMsg ?? "Registration submitted — waiting for privacy key confirmation.")
              : isError
              ? (errorMsg ?? "Registration failed")
              : isCancelled
              ? "Signature cancelled — click to try again"
              : "Register to send or receive private payments."}
          </p>
        </div>

        {!isPending && (
          <button
            onClick={isError ? retry : register}
            disabled={status === "registering"}
            className={`flex-shrink-0 text-[9px] font-bold tracking-widest uppercase px-4 py-2 rounded-full transition-colors disabled:opacity-50 ${
              isError
                ? "bg-red-400/20 text-red-300 hover:bg-red-400/30"
                : "bg-amber-400 text-[#0d0c0a] hover:bg-amber-300"
            }`}
          >
            {status === "registering"
              ? "Registering…"
              : isError
              ? "Try Again"
              : "Register Now"}
          </button>
        )}
        {isPending && (
          <button
            onClick={checkRegistration}
            disabled={isChecking}
            className="flex-shrink-0 text-[9px] font-bold tracking-widest uppercase px-4 py-2 rounded-full bg-blue-400/15 text-blue-300 hover:bg-blue-400/25 transition-colors disabled:opacity-40"
          >
            {isChecking ? "Checking…" : "Check Status"}
          </button>
        )}
      </div>
    </div>
  );
}
