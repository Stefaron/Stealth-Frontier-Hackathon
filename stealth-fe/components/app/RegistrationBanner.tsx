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
    <div className="max-w-7xl mx-auto px-5 md:px-8 mt-4">
      <div
        className={`border rounded-xl px-5 py-4 flex items-center gap-4 ${
          isError
            ? "bg-red-50 border-red-200"
            : isPending
            ? "bg-blue-50 border-blue-200"
            : "bg-amber-50 border-amber-200"
        }`}
      >
        <div
          className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${
            isError
              ? "bg-white border-red-200 text-red-600"
              : isPending
              ? "bg-white border-blue-200 text-blue-600"
              : "bg-white border-amber-200 text-amber-600"
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
            className={`font-semibold text-[13.5px] ${
              isError ? "text-red-700" : isPending ? "text-blue-700" : "text-amber-700"
            }`}
          >
            {isError
              ? "Registration failed"
              : isPending
              ? "Confirming registration…"
              : "Not registered with Umbra"}
          </p>
          <p className="text-zinc-600 text-[12px] mt-0.5 truncate">
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
            className={`press flex-shrink-0 text-[12px] font-semibold px-3.5 py-2 rounded-lg transition-colors disabled:opacity-50 ${
              isError
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-zinc-900 text-white hover:bg-zinc-800"
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
            className="press flex-shrink-0 text-[12px] font-semibold px-3.5 py-2 rounded-lg bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors disabled:opacity-40"
          >
            {isChecking ? "Checking…" : "Check Status"}
          </button>
        )}
      </div>
    </div>
  );
}
