"use client";

import { TransactionButton } from "thirdweb/react";
import { prepareContractCall, toHex } from "thirdweb";
import { keccak256 } from "thirdweb/utils";

export default function AddSignerModal({
  onClose,
  newSigner,
  setNewSigner,
  contract,
  walletAddress,
}: {
  onClose: () => void;
  newSigner: string;
  setNewSigner: (val: string) => void;
  contract: any;
  walletAddress: string;
}) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 p-6 rounded-xl w-full max-w-lg shadow-xl">
        <h2 className="text-xl font-semibold text-white mb-4">
          Add New Signer
        </h2>

        {/* INPUT */}
        <label className="text-sm text-gray-300">Signer Address</label>
        <input
          value={newSigner}
          onChange={(e) => setNewSigner(e.target.value)}
          placeholder="0x..."
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 w-full text-white text-sm mt-2"
        />

        {/* BUTTONS */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
          >
            Cancel
          </button>

          <TransactionButton
            transaction={async () => {
              if (!newSigner || newSigner.length !== 42)
                throw new Error("Invalid signer address");

              const selector = keccak256(toHex("addOwner(address)")).slice(
                0,
                10,
              );

              const encodedParam = toHex(newSigner, { size: 32 }).slice(2);
              const data = (selector + encodedParam) as `0x${string}`;

              return prepareContractCall({
                contract,
                method:
                  "function submitTransaction(address _to, uint256 _value, bytes _data)",
                params: [walletAddress, 0n, data],
              });
            }}
            onTransactionSent={onClose}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white"
          >
            Add Signer
          </TransactionButton>
        </div>
      </div>
    </div>
  );
}
