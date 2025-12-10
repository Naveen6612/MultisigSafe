"use client";

import { useEffect, useMemo, useState } from "react";
import { getContract, readContract } from "thirdweb";
import { client } from "../client";
import { sepolia } from "thirdweb/chains";
import { FACTORY_ABI_EVENTS } from "../constants/factoryABI";
import { MULTISIGWALLET } from "../constants/contract";

export function useUserWallet(userAddress?: string) {
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Factory contract (NOT user wallet)
  const factory = useMemo(() => {
    return getContract({
      client,
      chain: sepolia,
      address: MULTISIGWALLET,
      // Cast to any to avoid all the Abi typing drama
      abi: FACTORY_ABI_EVENTS as any,
    });
  }, []);

  useEffect(() => {
    if (!userAddress) return;

    async function fetchUserWallets() {
      try {
        setLoading(true);

        const result = await readContract({
          contract: factory,
          // we know this exists on the ABI, TS is just being picky
          method: "getWalletsOf" as any,
          params: [userAddress],
        } as any);

        setWallets([...(result ?? [])]);
      } catch (err: any) {
        console.error("Failed fetching multisig wallet:", err);
        setError(err.message ?? "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchUserWallets();
  }, [userAddress, factory]);

  return { wallets, loading, error };
}
