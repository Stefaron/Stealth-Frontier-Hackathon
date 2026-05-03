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
        <div className="max-w-sm w-full text-center">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto mb-6">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 2L17 5.5V14.5L10 18L3 14.5V5.5L10 2Z"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="1.4"
                fill="none"
              />
              <path d="M10 6L13 7.75V11.25L10 13L7 11.25V7.75L10 6Z" fill="rgba(255,255,255,0.2)" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-white mb-2">
            {!connected ? "Connect your wallet" : "Activate Stealth"}
          </h2>
          <p className="text-white/35 text-sm leading-relaxed">
            {!connected ? ROLE_HINTS[role] : "Click \"Activate Stealth\" in the nav to sign and initialize your Umbra session."}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
