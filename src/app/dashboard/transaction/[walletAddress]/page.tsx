"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { getContract, prepareContractCall, toWei } from "thirdweb";
import { sepolia } from "thirdweb/chains";
import { client } from "@/app/client";
import { useReadContract, TransactionButton } from "thirdweb/react";
import TransactionsPanel from "@/app/components/TransactionPanel";

export default function TransactionsPage() {
  const params = useParams();
  const walletAddress = params.walletAddress as string;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [txTo, setTxTo] = useState("");
  const [txValue, setTxValue] = useState("0");
  const [txData, setTxData] = useState("0x");

  const contract = getContract({
    client,
    chain: sepolia,
    address: walletAddress,
  });

  // FETCH threshold
  const { data: thresholdData } = useReadContract({
    contract,
    method: "function numConfirmationsRequired() view returns (uint256)",
    params: [],
  });

  const threshold = thresholdData ? Number(thresholdData) : 0;

  return (
    <div className="space-y-10 mt-10">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-white">All Transactions</h1>

        {/* NEW TRANSACTION BUTTON */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
        >
          + New Transaction
        </button>
      </div>

      {/* MULTISIG TRANSACTIONS LIST */}
      <TransactionsPanel contract={contract} threshold={threshold} />

      {/* NEW TRANSACTION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 p-6 rounded-xl w-full max-w-lg shadow-xl">
            <h2 className="text-xl font-semibold text-white mb-4">
              Initiate Transaction
            </h2>

            {/* TO ADDRESS */}
            <label className="text-gray-300 text-sm">To Address</label>
            <input
              value={txTo}
              onChange={(e) => setTxTo(e.target.value)}
              placeholder="0xRecipientAddress"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white mb-4"
            />

            {/* VALUE */}
            <label className="text-gray-300 text-sm">Value (ETH)</label>
            <input
              value={txValue}
              onChange={(e) => setTxValue(e.target.value)}
              placeholder="0.0"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white mb-4"
            />

            {/* DATA */}
            <label className="text-gray-300 text-sm">Calldata (optional)</label>
            <input
              value={txData}
              onChange={(e) => setTxData(e.target.value)}
              placeholder="0x..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white mb-6"
            />

            {/* BUTTONS */}
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
              >
                Cancel
              </button>

              {/* SUBMIT TRANSACTION */}
              <TransactionButton
                transaction={() =>
                  prepareContractCall({
                    contract,
                    method:
                      "function submitTransaction(address _to, uint256 _value, bytes _data)",
                    params: [
                      txTo,
                      BigInt(toWei(txValue || "0")), // convert ETH → wei
                      txData === "" ? "0x" : (txData as `0x${string}`),
                    ],
                  })
                }
                onTransactionSent={() => {
                  setIsModalOpen(false);
                }}
                onError={(err) => console.error(err)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white"
              >
                Submit
              </TransactionButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
