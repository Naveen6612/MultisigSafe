"use client";

import { useEffect } from "react";
import { ConnectButton, darkTheme, useActiveAccount } from "thirdweb/react";
import { client } from "./client";
import { useRouter } from "next/navigation";
import { getContract, readContract } from "thirdweb";
import { MULTISIGWALLET } from "./constants/contract";
import { sepolia } from "thirdweb/chains";

/**
 * FACTORY CONTRACT: must have a function like
 * function getWallets(address user) view returns (address[] memory);
 */
const FACTORY_ADDRESS = MULTISIGWALLET;

export default function Home() {
  const account = useActiveAccount();
  const router = useRouter();

  // ---------- STEP 2: AUTO-REDIRECT LOGIC ----------
  useEffect(() => {
    async function checkUserWallets() {
      if (!account) return;

      try {
        const factory = getContract({
          client,
          chain: sepolia,
          address: FACTORY_ADDRESS,
        });

        // MUST EXIST IN YOUR FACTORY
        const wallets: readonly string[] = await readContract({
          contract: factory,
          method:
            "function getWalletsOf(address user) view returns (address[])",
          params: [account.address],
        });

        if (wallets.length > 0) {
          // user already has a multisig → go to dashboard
          router.push(`/dashboard/${wallets[0]}`);
        } else {
          // no multisig yet → go to create-account
          router.push("/create-account");
        }
      } catch (err) {
        console.error("Error reading wallets:", err);
      }
    }

    checkUserWallets();
  }, [account, router]);

  // ---------- STEP 3: UI STATES ----------
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 text-center">
      {/* Info message above connect button */}
      <div className="mb-8 max-w-xl">
        <h1 className="text-xl font-semibold leading-relaxed">
          This wallet runs on the Sepolia Testnet. To try this wallet, you can
          grab free Sepolia ETH from{" "}
          <a
            href="https://cloud.google.com/application/web3/faucet"
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-500 underline hover:text-red-400"
          >
            Google Cloud Faucet
          </a>
          .
        </h1>
      </div>

      {!account ? (
        <ConnectButton
          client={client}
          theme={darkTheme()}
          connectButton={{
            label: "Connect Wallet",
            style: {
              borderRadius: "0.5rem",
              padding: "0.75rem 2rem",
              fontWeight: 600,
              fontSize: "0.875rem",
              background: "#dc2626",
              color: "white",
            },
          }}
        />
      ) : (
        <p className="text-gray-300 text-xl mt-6 animate-pulse">
          Loading your multisig wallets...
        </p>
      )}
    </div>
  );
}
