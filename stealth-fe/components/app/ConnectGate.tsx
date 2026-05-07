"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useUmbra } from "@/context/UmbraContext";

interface ConnectGateProps {
  children: React.ReactNode;
  role: "treasurer" | "contributor" | "auditor";
}

const ROLE_HINTS: Record<string, string> = {
  treasurer: "Connect your DAO admin wallet to manage private payroll",
  contributor: "Connect your wallet to view your encrypted balance",
  auditor: "Connect your wallet to access compliance grants",
};

export default function ConnectGate({ children, role }: ConnectGateProps) {
  const { connected } = useWallet();
  const { client } = useUmbra();

  if (!connected || !client) {
    return (
      <div className="min-h-svh flex flex-col items-center justify-center px-6">
        <div className="card max-w-sm w-full text-center p-10">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 text-white grid place-items-center mx-auto mb-5">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L17 5.5V14.5L10 18L3 14.5V5.5L10 2Z" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10 6L13 7.75V11.25L10 13L7 11.25V7.75L10 6Z" fill="currentColor" />
            </svg>
          </div>
          <h2 className="text-[17px] font-bold text-zinc-900 mb-2 tracking-tight">
            {!connected ? "Connect your wallet" : "Activate Stealth"}
          </h2>
          <p className="text-zinc-500 text-[13.5px] leading-relaxed">
            {!connected ? ROLE_HINTS[role] : "Click \"Activate Stealth\" in the nav to sign and initialize your Umbra session."}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
