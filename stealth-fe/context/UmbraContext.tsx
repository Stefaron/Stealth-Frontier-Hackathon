"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import type { IUmbraClient } from "@umbra-privacy/sdk/interfaces";
import { createUmbraClient } from "@/lib/umbra/client";
import { createUmbraSignerFromAdapter } from "@/lib/umbra/signer";

interface UmbraContextValue {
  client: IUmbraClient | null;
  isInitializing: boolean;
  error: string | null;
  initClient: () => Promise<void>;
  clearClient: () => void;
}

const UmbraContext = createContext<UmbraContextValue>({
  client: null,
  isInitializing: false,
  error: null,
  initClient: async () => {},
  clearClient: () => {},
});

export function UmbraProvider({ children }: { children: ReactNode }) {
  const { wallet, connected, publicKey } = useWallet();
  const [client, setClient] = useState<IUmbraClient | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initClient = useCallback(async () => {
    if (!wallet?.adapter || !connected) {
      setError("Wallet not connected");
      return;
    }
    setIsInitializing(true);
    setError(null);
    try {
      const signer = createUmbraSignerFromAdapter(wallet.adapter, publicKey?.toBase58());
      const c = await createUmbraClient(signer);
      setClient(c);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to initialize Umbra client");
    } finally {
      setIsInitializing(false);
    }
  }, [wallet, connected]);

  const clearClient = useCallback(() => {
    setClient(null);
    setError(null);
  }, []);

  return (
    <UmbraContext.Provider
      value={{ client, isInitializing, error, initClient, clearClient }}
    >
      {children}
    </UmbraContext.Provider>
  );
}

export function useUmbra() {
  return useContext(UmbraContext);
}
