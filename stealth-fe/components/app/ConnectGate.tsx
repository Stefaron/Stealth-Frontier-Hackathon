"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { useUmbra } from "@/context/UmbraContext";
import { useToast } from "@/context/ToastContext";
import { FlowButton } from "@/components/ui/flow-button";
import { RetroTvError } from "@/components/ui/404-error-page";
import WalletModal from "./WalletModal";

const WALLET_KEY = "stealth-wallet-name";

interface ConnectGateProps {
  children: React.ReactNode;
  role: "treasurer" | "contributor" | "auditor";
}

const ROLE_HINTS: Record<string, string> = {
  treasurer: "Connect your DAO admin wallet to manage private payroll.",
  contributor: "Connect your wallet to view your encrypted balance.",
  auditor: "Connect your wallet to access compliance grants.",
};

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.43, 0.13, 0.23, 0.96] as const,
      delayChildren: 0.1,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] as const },
  },
};

const iconVariants: Variants = {
  hidden: { scale: 0.8, opacity: 0, y: 15, rotate: -5 },
  visible: {
    scale: 1,
    opacity: 1,
    y: 0,
    rotate: 0,
    transition: { duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] as const },
  },
  hover: {
    scale: 1.08,
    y: -8,
    rotate: [0, -4, 4, -4, 0],
    transition: {
      duration: 0.8,
      ease: "easeInOut",
      rotate: {
        duration: 2,
        ease: "linear",
        repeat: Infinity,
        repeatType: "reverse" as const,
      },
    },
  },
  floating: {
    y: [-4, 4],
    transition: {
      y: {
        duration: 2,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "reverse" as const,
      },
    },
  },
};

export default function ConnectGate({ children, role }: ConnectGateProps) {
  const { connected, wallet, connect, connecting, select } = useWallet();
  const { client, isInitializing, initClient } = useUmbra();
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingConnect, setPendingConnect] = useState(false);

  useEffect(() => {
    if (!pendingConnect || !wallet || connected || connecting) return;
    
    // Slight delay to allow adapter to initialize fully after select()
    const timer = setTimeout(() => {
      connect()
        .catch((e) => {
          console.error("[ConnectGate] connect() failed:", e);
          toast.error(e.message || "Failed to connect to wallet. Please try again.");
        })
        .finally(() => setPendingConnect(false));
    }, 100);
    
    return () => clearTimeout(timer);
  }, [pendingConnect, wallet, connected, connecting, connect, toast]);

  if (connected && client) {
    return <>{children}</>;
  }

  const showActivate = connected && !client;
  const headline = showActivate ? "Almost there." : "Connect your wallet.";
  const sub = showActivate
    ? "One more step — activate your private session to start using Stealth."
    : ROLE_HINTS[role];
  const ctaText = showActivate
    ? isInitializing
      ? "Activating…"
      : "Activate Stealth"
    : "Open wallet menu";

  const handleSelectWallet = (name: string) => {
    setModalOpen(false);
    localStorage.setItem(WALLET_KEY, name);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    select(name as any);
    setPendingConnect(true);
  };

  const handleCta = () => {
    if (showActivate) {
      initClient();
    } else {
      setModalOpen(true);
    }
  };

  return (
    <div className="min-h-svh flex flex-col items-center justify-center bg-white px-4 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          className="text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <motion.div
            className="flex items-center justify-center -mb-2 md:-mb-4"
            variants={iconVariants}
            whileHover="hover"
            animate={["visible", "floating"]}
          >
            <RetroTvError
              errorCode={showActivate ? "STBY" : "OFFL"}
              errorMessage="STEALTH"
            />
          </motion.div>

          <motion.h1
            className="text-3xl md:text-5xl font-bold text-zinc-900 mb-3 md:mb-4 tracking-tight select-none"
            style={{ letterSpacing: "-0.025em" }}
            variants={itemVariants}
          >
            {headline}
          </motion.h1>

          <motion.p
            className="text-base md:text-lg text-zinc-500 mb-7 md:mb-9 max-w-md mx-auto leading-relaxed select-none"
            variants={itemVariants}
          >
            {sub}
          </motion.p>

          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.04 }}
            transition={{ duration: 0.3, ease: [0.43, 0.13, 0.23, 0.96] as const }}
            className="flex justify-center"
          >
            <FlowButton
              text={ctaText}
              onClick={handleCta}
              disabled={showActivate ? isInitializing : connecting || pendingConnect}
            />
          </motion.div>

          <motion.div className="mt-10" variants={itemVariants}>
            <a
              href="https://solana.com/learn/wallets"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 hover:text-zinc-900 transition-opacity underline-offset-4 hover:underline text-[13px] select-none"
            >
              What is a wallet?
            </a>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <WalletModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelect={handleSelectWallet}
      />
    </div>
  );
}
