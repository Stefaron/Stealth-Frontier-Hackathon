"use client";

import { useState, useCallback } from "react";
import { useUmbra } from "@/context/UmbraContext";
import { getUserAccountQuerier } from "@/lib/umbra/balance";
import { registerUser } from "@/lib/umbra/registration";
import type { Address } from "@solana/kit";

export type RegStatus =
  | "idle"
  | "checking"
  | "registered"
  | "unregistered"
  | "registering"
  | "pending"
  | "error";

function containsMessage(err: unknown, needle: string): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as Record<string, unknown>;
  if (typeof e.message === "string" && e.message.toLowerCase().includes(needle)) return true;
  return containsMessage(e.cause, needle);
}

export function useRegistration(walletAddress?: string) {
  const { client } = useUmbra();
  const [status, setStatus] = useState<RegStatus>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const checkRegistration = useCallback(async () => {
    if (!client || !walletAddress) return;
    setStatus("checking");
    setErrorMsg(null);
    try {
      const querier = getUserAccountQuerier(client);
      const result = await querier(walletAddress as Address);
      const x25519Done = result.state === "exists" && result.data?.isUserAccountX25519KeyRegistered === true;
      const anonymousDone = result.state === "exists" && result.data?.isActiveForAnonymousUsage === true;
      const fullyRegistered = x25519Done && anonymousDone;
      if (fullyRegistered) {
        setStatus("registered");
      } else if (result.state === "exists") {
        // Account exists but Arcium MPC callback not yet finalized
        setStatus("pending");
        setErrorMsg(
          x25519Done && !anonymousDone
            ? "X25519 key confirmed — waiting for Arcium to activate anonymous usage."
            : "Registration submitted — waiting for privacy key confirmation."
        );
      } else {
        setStatus("unregistered");
      }
    } catch (e) {
      setStatus("error");
      setErrorMsg(e instanceof Error ? e.message : "Registration check failed");
    }
  }, [client, walletAddress]);

  const register = useCallback(async () => {
    if (!client || !walletAddress) return;
    setStatus("registering");
    setErrorMsg(null);
    try {
      await registerUser(client);
      // Re-check actual on-chain state — SDK may resolve before Arcium callback
      const querier = getUserAccountQuerier(client);
      const result = await querier(walletAddress as Address);
      const x25519Done = result.state === "exists" && result.data?.isUserAccountX25519KeyRegistered === true;
      const anonymousDone = result.state === "exists" && result.data?.isActiveForAnonymousUsage === true;
      if (x25519Done && anonymousDone) {
        setStatus("registered");
      } else {
        setStatus("pending");
        setErrorMsg(
          x25519Done && !anonymousDone
            ? "X25519 key confirmed — waiting for Arcium to activate anonymous usage. Check again in 30s."
            : "Registration is on-chain — waiting for privacy key to be confirmed. Check again in a few seconds."
        );
      }
    } catch (e) {
      console.error("[Umbra] Registration failed:", e);
      if (e && typeof e === "object") {
        const extra = e as Record<string, unknown>;
        if (extra.logs) console.error("[Umbra] TX logs:", extra.logs);
        if (extra.cause) console.error("[Umbra] Cause:", extra.cause);
      }
      const msg = e instanceof Error ? e.message : "Registration failed";

      // TX already on-chain OR Arcium TTL timeout → re-check actual status
      const isAlreadyProcessed =
        containsMessage(e, "already been processed") ||
        containsMessage(e, "already processed") ||
        containsMessage(e, "transaction was already");
      const isArciumTimeout =
        containsMessage(e, "expired") ||
        containsMessage(e, "ttl") ||
        containsMessage(e, "timeout") ||
        containsMessage(e, "computation") ||
        containsMessage(e, "slot") ||
        containsMessage(e, "arcium");
      if (isAlreadyProcessed || isArciumTimeout) {
        try {
          const querier = getUserAccountQuerier(client);
          const result = await querier(walletAddress as Address);
          const x25519Done2 = result.state === "exists" && result.data?.isUserAccountX25519KeyRegistered === true;
          const anonymousDone2 = result.state === "exists" && result.data?.isActiveForAnonymousUsage === true;
          if (x25519Done2 && anonymousDone2) {
            setStatus("registered");
          } else {
            setStatus("pending");
            setErrorMsg(
              x25519Done2 && !anonymousDone2
                ? "X25519 key confirmed — Arcium MPC is processing (devnet can take several minutes). Check again shortly."
                : "Registration is on-chain — waiting for Arcium privacy key confirmation. Check again shortly."
            );
          }
        } catch {
          setStatus("pending");
          setErrorMsg("Registration submitted. Waiting for Arcium MPC confirmation — check again in 30s.");
        }
        return;
      }

      // User cancelled wallet popup → show button again
      const isRejection =
        msg.toLowerCase().includes("user rejected") ||
        msg.toLowerCase().includes("rejected the request") ||
        msg.toLowerCase().includes("user cancelled") ||
        msg.toLowerCase().includes("user denied");
      if (isRejection) {
        setStatus("unregistered");
        setErrorMsg("Signature cancelled — click to try again");
      } else {
        setStatus("error");
        setErrorMsg(msg);
      }
    }
  }, [client, walletAddress]);

  const retry = useCallback(() => {
    setStatus("unregistered");
    setErrorMsg(null);
  }, []);

  return { status, errorMsg, checkRegistration, register, retry };
}
