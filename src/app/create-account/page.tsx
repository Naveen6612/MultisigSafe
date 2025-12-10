"use client";
import React, { useState } from "react";
import {
  ConnectButton,
  darkTheme,
  TransactionButton,
  useActiveAccount,
  useActiveWallet,
  useDisconnect,
} from "thirdweb/react";
import { client } from "../client";
import { useRouter } from "next/navigation";
import { MULTISIGWALLET } from "../constants/contract";
import {
  getContract,
  parseEventLogs,
  prepareContractCall,
  prepareEvent,
} from "thirdweb";
import { sepolia } from "thirdweb/chains";

const FACTORY_ADDRESS = MULTISIGWALLET;

export default function CreateAccountPage() {
  const wallet = useActiveWallet();
  const account = useActiveAccount();
  const { disconnect } = useDisconnect();
  const router = useRouter();

  const [signers, setSigners] = useState<string[]>([]);
  const [threshold, setThreshold] = useState<number>(1);

  const contract = getContract({
    client,
    chain: sepolia,
    address: FACTORY_ADDRESS,
  });

  const WalletCreatedEvent = prepareEvent({
    signature:
      "event WalletCreated(address indexed wallet, address indexed creator, uint256 indexed index, address[] owners, uint256 numConfirmationsRequired)",
  });

  function onAddSigner() {
    setSigners([...signers, ""]);
  }

  function onRemoveSigner(index: number) {
    const updated = [...signers];
    updated.splice(index, 1);
    setSigners(updated);

    // adjust threshold if needed
    const newCount = updated.length + 1;
    if (threshold > newCount) setThreshold(newCount);
  }

  function onSignerChange(index: number, value: string) {
    const updated = [...signers];
    updated[index] = value;
    setSigners(updated);
  }

  const ownersArray = [account?.address, ...signers].filter(
    (addr): addr is string => typeof addr === "string" && addr.length > 0,
  );
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl">
        {/* HEADER */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">
              Signers and confirmations
            </h1>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">
            Set the signer wallets of your Safe Account and how many need to
            confirm to execute a valid transaction.
          </p>
        </div>

        {/* CONNECT WALLET */}
        {!account ? (
          <div className="flex justify-center mb-6">
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
          </div>
        ) : (
          <>
            {/* SIGNER LIST */}
            <div className="mb-8">
              {/* Signer 1 (Connected Wallet) */}
              <div className="mb-4">
                <label className="text-xs text-gray-500 font-medium block mb-2">
                  Signer name
                </label>
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Signer 1</span>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-xs font-bold">
                        S
                      </div>
                      <span className="text-sm text-white font-mono">
                        sep: {account.address.slice(0, 10)}...
                        {account.address.slice(-4)}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Your connected wallet
                  </p>
                </div>
              </div>

              {/* Additional Signers */}
              {signers.map((signer, index) => (
                <div key={index} className="mb-4">
                  <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-400">
                        Signer {index + 2}
                      </span>
                      <button
                        onClick={() => onRemoveSigner(index)}
                        className="text-red-500 hover:text-red-400 text-xs font-medium"
                      >
                        Remove
                      </button>
                    </div>
                    <input
                      value={signer}
                      placeholder="Enter signer address"
                      onChange={(e) => onSignerChange(index, e.target.value)}
                      className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-red-600"
                    />
                  </div>
                </div>
              ))}

              <button
                onClick={onAddSigner}
                className="text-red-500 hover:text-red-400 text-sm font-medium flex items-center gap-1"
              >
                <span className="text-lg">+</span> Add new signer
              </button>
            </div>

            {/* THRESHOLD SELECTION */}
            <div className="mb-12">
              <label className="text-sm text-white font-medium block mb-2">
                Threshold
              </label>
              <p className="text-xs text-gray-500 mb-4">
                Any transaction requires the confirmation of:
              </p>

              <select
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-red-600 appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23999' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                  backgroundPosition: "right 0.5rem center",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "1.5em 1.5em",
                  paddingRight: "2.5rem",
                }}
              >
                {Array.from({ length: signers.length + 1 }).map((_, i) => (
                  <option key={i} value={i + 1}>
                    {i + 1} out of {signers.length + 1} signer
                    {signers.length + 1 > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* NAVIGATION BUTTONS */}
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={() => {
                  if (wallet) {
                    disconnect(wallet);
                  }
                }}
                className="px-6 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-sm font-medium text-white hover:bg-zinc-800 transition flex items-center gap-2"
              >
                <span>←</span> Back
              </button>

              <TransactionButton
                transaction={() =>
                  prepareContractCall({
                    contract,
                    method:
                      "function createWallet(address[] _owners, uint256 _numConfirmationsRequired) returns (address)",
                    params: [ownersArray, BigInt(threshold)],
                  })
                }
                onTransactionConfirmed={(receipt) => {
                  const decoded = parseEventLogs({
                    events: [WalletCreatedEvent],
                    logs: receipt.logs,
                  });

                  const evt = decoded.find(
                    (e) => e.eventName === "WalletCreated",
                  );

                  if (!evt) {
                    console.error("WalletCreated event not found");
                    return;
                  }

                  const newWalletAddress = evt.args.wallet;
                  console.log("New Wallet:", newWalletAddress);

                  router.push(`/dashboard/${newWalletAddress}`);
                }}
                style={{
                  borderRadius: "0.5rem",
                  padding: "0.75rem 2rem",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  background: "#dc2626",
                  color: "white",
                  border: "none",
                }}
              >
                Next
              </TransactionButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
