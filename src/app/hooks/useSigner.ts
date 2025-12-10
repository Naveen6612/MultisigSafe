"use client";

import { useMemo } from "react";
import { getContract } from "thirdweb";
import { useReadContract } from "thirdweb/react";
import { sepolia } from "thirdweb/chains";
import { client } from "@/app/client";

export function useSigners(walletAddress: string | null) {
  // Contract must always exist (or be null), but hook must always run
  const contract = useMemo(() => {
    if (!walletAddress) return null;
    return getContract({
      client,
      chain: sepolia,
      address: walletAddress,
    });
  }, [walletAddress]);

  // Hook MUST run every render, but contract may be null
  const { data, isLoading } = useReadContract(
    walletAddress
      ? {
          contract,
          method: "function getOwners() view returns (address[])",
          params: [],
        }
      : {
          // Dummy config so hook order stays consistent
          contract: null as any,
          method: "function getOwners() view returns (address[])",
          params: [],
        },
  );

  return {
    owners: walletAddress ? data || [] : [],
    isLoading: walletAddress ? isLoading : false,
    contract,
  };
}
