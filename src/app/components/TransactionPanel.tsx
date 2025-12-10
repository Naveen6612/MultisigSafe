"use client";

import { useEffect, useState } from "react";
import {
  TransactionButton,
  useActiveAccount,
  useReadContract,
} from "thirdweb/react";
import { readContract, prepareContractCall, ThirdwebContract } from "thirdweb";
import { sepolia } from "thirdweb/chains";
import { client } from "../client";
import { getWalletBalance } from "thirdweb/wallets";
import { ChevronDown, ChevronUp, CheckCircle, Clock } from "lucide-react";

type TxTuple = readonly [string, bigint, `0x${string}`, boolean, bigint];

type TransactionsPanelProps = {
  contract: ThirdwebContract;
  threshold: number;
};

export default function TransactionsPanel({
  contract,
  threshold,
}: TransactionsPanelProps) {
  const account = useActiveAccount();

  const { data: isOwner } = useReadContract({
    contract,
    method: "function isOwner(address) view returns (bool)",
    params: [account?.address || "0x0000000000000000000000000000000000000000"],
  });

  const { data: txCountData } = useReadContract({
    contract,
    method: "function getTransactionCount() view returns (uint256)",
    params: [],
  });

  const txCount = txCountData ? Number(txCountData) : 0;

  const [txs, setTxs] = useState<TxTuple[]>([]);
  const [reloadKey, setReloadKey] = useState(0);

  const [expanded, setExpanded] = useState<number | null>(null);

  const [walletBalance, setWalletBalance] = useState<bigint>(0n);

  useEffect(() => {
    async function load() {
      if (!contract?.address) return;

      try {
        const bal = await getWalletBalance({
          address: contract.address,
          client,
          chain: sepolia,
        });

        setWalletBalance(bal.value);
      } catch (err) {
        console.error("Balance error:", err);
      }

      try {
        if (txCount === 0) {
          setTxs([]);
          return;
        }

        const arr: TxTuple[] = [];
        for (let i = 0; i < txCount; i++) {
          const tx = (await readContract({
            contract,
            method:
              "function getTransaction(uint256 _txIndex) view returns (address to, uint256 value, bytes data, bool executed, uint256 numConfirmations)",
            params: [BigInt(i)],
          })) as TxTuple;

          arr.push(tx);
        }

        setTxs(arr);
      } catch (err) {
        console.error("Fetch tx error:", err);
      }
    }

    load();
  }, [contract, txCount, reloadKey, account?.address]);

  if (isOwner === false) {
    return (
      <div className="bg-black/50 p-6 rounded-xl border border-red-800 mt-10 text-center">
        <h2 className="text-xl text-white font-semibold">
          You are not a signer
        </h2>
        <p className="text-gray-400 text-sm mt-2">
          Only wallet owners can confirm or execute transactions.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#0f0f0f] p-6 rounded-2xl border border-red-900/40 shadow-md mt-10 space-y-6">
      <h2 className="text-2xl font-bold text-white">Transactions</h2>

      {txCount === 0 && (
        <p className="text-gray-400">No transactions available.</p>
      )}

      {txs.map((tx, i) => {
        const [to, value, data, executed, numConf] = tx;

        const conf = Number(numConf);
        const canExecute = conf >= threshold && !executed;
        const insufficientBalance = walletBalance < value;

        const isOpen = expanded === i;

        return (
          <div
            key={i}
            className="rounded-xl border border-red-900/30 bg-black/40 backdrop-blur-md shadow-lg transition"
          >
            {/* COLLAPSED HEADER */}
            <button
              onClick={() => setExpanded(isOpen ? null : i)}
              className="w-full flex justify-between items-center px-4 py-4 hover:bg-white/5 transition"
            >
              <div className="flex items-center gap-3">
                {executed ? (
                  <CheckCircle className="text-green-500 w-5 h-5" />
                ) : (
                  <Clock className="text-yellow-500 w-5 h-5" />
                )}

                <span className="text-white font-semibold">
                  Transaction #{i}
                </span>

                <span className="text-gray-400 text-sm">
                  {conf}/{threshold} confirmations
                </span>
              </div>

              {isOpen ? (
                <ChevronUp className="text-gray-300" />
              ) : (
                <ChevronDown className="text-gray-300" />
              )}
            </button>

            {/* EXPANDED CONTENT */}
            {isOpen && (
              <div className="p-6 border-t border-red-900/20 animate-fadeIn space-y-4">
                {/* LEFT SECTION */}
                <div className="space-y-3">
                  <p className="text-gray-400 text-sm">To:</p>
                  <p className="text-white font-mono break-all text-sm">{to}</p>

                  <p className="text-gray-400 text-sm mt-4">Value (wei):</p>
                  <p className="text-white">{value.toString()}</p>

                  <p className="text-gray-400 text-sm mt-4">Data:</p>
                  <p className="text-white font-mono text-xs break-all bg-black/30 p-2 rounded-lg border border-red-900/20">
                    {data}
                  </p>
                </div>

                {/* RIGHT SECTION STATUS */}
                <div className="bg-black/30 p-4 rounded-xl border border-red-900/30 space-y-4">
                  <h3 className="text-lg text-white font-semibold">Status</h3>

                  <div className="text-gray-300">
                    Confirmations:{" "}
                    <span className="text-white font-bold">
                      {conf}/{threshold}
                    </span>
                  </div>

                  {executed ? (
                    <p className="text-green-400 font-semibold">Executed</p>
                  ) : (
                    <>
                      {/* CONFIRM */}
                      <TransactionButton
                        transaction={() =>
                          prepareContractCall({
                            contract,
                            method:
                              "function confirmTransaction(uint256 _txIndex)",
                            params: [BigInt(i)],
                          })
                        }
                        className="bg-blue-600 px-4 py-2 rounded-lg text-white hover:bg-blue-700 transition w-full"
                        onTransactionConfirmed={() =>
                          setReloadKey((k) => k + 1)
                        }
                      >
                        Confirm
                      </TransactionButton>

                      {/* EXECUTE */}
                      {canExecute && (
                        <TransactionButton
                          transaction={() => {
                            if (insufficientBalance) {
                              return prepareContractCall({
                                contract,
                                method:
                                  "function confirmTransaction(uint256 _txIndex)",
                                params: [0n],
                              });
                            }

                            return prepareContractCall({
                              contract,
                              method:
                                "function executeTransaction(uint256 _txIndex)",
                              params: [BigInt(i)],
                            });
                          }}
                          disabled={insufficientBalance}
                          className={`px-4 py-2 rounded-lg text-white w-full ${
                            insufficientBalance
                              ? "bg-red-800 opacity-60 cursor-not-allowed"
                              : "bg-green-600 hover:bg-green-700"
                          }`}
                          onTransactionConfirmed={() =>
                            setReloadKey((k) => k + 1)
                          }
                        >
                          {insufficientBalance
                            ? "Not enough balance"
                            : "Execute"}
                        </TransactionButton>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
