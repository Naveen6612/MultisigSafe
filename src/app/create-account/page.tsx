"use client";
import React, { useState } from "react";
import {
  ConnectButton,
  darkTheme,
  TransactionButton,
  useActiveAccount,
  useActiveWallet,
  useDisconnect,
  useReadContract,
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

  // FACTORY CONTRACT
  const contract = getContract({
    client,
    chain: sepolia,
    address: FACTORY_ADDRESS,
  });

  // WALLET CREATED EVENT
  const WalletCreatedEvent = prepareEvent({
    signature:
      "event WalletCreated(address indexed wallet, address indexed creator, uint256 indexed index, address[] owners, uint256 numConfirmationsRequired)",
  });

  // 1) READ EXISTING USER WALLETS
  const { data: userWallets = [], isPending: walletsLoading } = useReadContract(
    {
      contract,
      method:
        "function getWalletsOf(address user) view returns ((address wallet, address creator, uint256 createdAt, bool deleted)[] result)",
      params: [
        account?.address || "0x0000000000000000000000000000000000000000",
      ],
    },
  );

  // SIGNER HANDLERS
  function onAddSigner() {
    setSigners([...signers, ""]);
  }

  function onRemoveSigner(index: number) {
    const updated = [...signers];
    updated.splice(index, 1);
    setSigners(updated);

    const newCount = updated.length + 1;
    if (threshold > newCount) setThreshold(newCount);
  }

  function onSignerChange(index: number, value: string) {
    const updated = [...signers];
    updated[index] = value;
    setSigners(updated);
  }

  const ownersArray = [account?.address, ...signers].filter(
    (addr): addr is string =>
      typeof addr === "string" && addr.startsWith("0x") && addr.length === 42,
  );

  return (
    <div className="relative min-h-screen bg-black text-white flex items-center justify-center px-4 py-10">
      {/* ----------------------------------------------
          TOP-LEFT DASHBOARD BUTTON  (RED, SMALL)
      ---------------------------------------------- */}
      {!walletsLoading && userWallets.length > 0 && (
        <button
          onClick={() => router.push(`/dashboard/${userWallets[0].wallet}`)}
          className="absolute top-6 left-6 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold px-4 py-2 rounded-md transition"
        >
          Dashboard
        </button>
      )}

      <div className="w-full max-w-2xl">
        {/* HEADER */}
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

        {/* CONNECT WALLET */}
        {!account ? (
          <div className="flex justify-center mb-6">
            <ConnectButton
              client={client}
              theme={darkTheme()}
              connectButton={{
                label: "Connect Wallet",
                style: {
                  padding: "0.75rem 2rem",
                  background: "#dc2626",
                  color: "white",
                  borderRadius: "0.5rem",
                },
              }}
            />
          </div>
        ) : (
          <>
            {/* SIGNERS */}
            <div className="mb-8">
              {/* Connected Wallet */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-4">
                <p className="text-gray-400 mb-2">Signer 1</p>
                <p className="font-mono text-white">
                  {account.address.slice(0, 10)}...{account.address.slice(-4)}
                </p>
              </div>

              {/* Additional Signers */}
              {signers.map((signer, index) => (
                <div
                  key={index}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-4"
                >
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-gray-400">Signer {index + 2}</p>
                    <button
                      onClick={() => onRemoveSigner(index)}
                      className="text-red-500 text-xs hover:text-red-400"
                    >
                      Remove
                    </button>
                  </div>

                  <input
                    value={signer}
                    onChange={(e) => onSignerChange(index, e.target.value)}
                    placeholder="Enter signer address"
                    className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-sm text-white"
                  />
                </div>
              ))}

              <button onClick={onAddSigner} className="text-red-500 text-sm">
                + Add new signer
              </button>
            </div>

            {/* THRESHOLD */}
            <div className="mb-12">
              <label>Threshold</label>
              <select
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white mt-2"
              >
                {Array.from({ length: signers.length + 1 }).map((_, i) => (
                  <option key={i} value={i + 1}>
                    {i + 1} out of {signers.length + 1} signers
                  </option>
                ))}
              </select>
            </div>

            {/* CREATE WALLET */}
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

                if (!evt) return console.error("Event not found");

                router.push(`/dashboard/${evt.args.wallet}`);
              }}
              style={{
                padding: "0.75rem 2rem",
                background: "#dc2626",
                color: "white",
                borderRadius: "0.5rem",
              }}
            >
              Create Wallet
            </TransactionButton>
          </>
        )}
      </div>
    </div>
  );
}
