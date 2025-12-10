"use client";

import { Copy, Trash2, Users } from "lucide-react";
import { TransactionButton } from "thirdweb/react";
import { prepareContractCall, toHex } from "thirdweb";
import { keccak256 } from "thirdweb/utils";
import { XMarkIcon, TrashIcon } from "@heroicons/react/20/solid";

export default function SignersList({
  owners,
  contract,
  walletAddress,
  allowRemove = false,
}: {
  owners: string[];
  contract: any;
  walletAddress: string;
  allowRemove?: boolean;
}) {
  // const copyToClipboard = async (val: string) => {
  //   await navigator.clipboard.writeText(val);
  // };
  // function createRemoveSignerTx(contract: any, signerToRemove: string) {
  //   // 1. Function selector for removeOwner(address)
  //   const selector = keccak256(toHex("removeOwner(address)")).slice(0, 10);

  //   // 2. Encode address parameter (32 bytes)
  //   const param = toHex(signerToRemove, { size: 32 }).slice(2);

  //   // 3. Final calldata
  //   const data = (selector + param) as `0x${string}`;

  //   // 4. Prepare the multisig transaction
  //   return prepareContractCall({
  //     contract,
  //     method:
  //       "function submitTransaction(address _to, uint256 _value, bytes _data)",
  //     params: [
  //       contract.address, // call the multisig wallet itself
  //       0n, // value
  //       data, // encoded removeOwner call
  //     ],
  //   });
  // }
  const onCopy = async (value: string) => {
    await navigator.clipboard.writeText(value);
  };
  return (
    <div className="bg-[#0f0f0f] p-6 rounded-2xl shadow-xl shadow-black/40">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-semibold text-white">Signers</h3>
      </div>

      <div className="space-y-4">
        {owners.map((owner, index) => (
          <div
            key={index}
            className="
            flex items-center
            bg-black/30 backdrop-blur-sm 
            p-3 md:p-4 rounded-xl 
            hover:bg-black/40 transition
          "
          >
            {/* LEFT SECTION — avatar + address */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-red-500/80 to-red-700/80 shadow-md" />

              <p
                className="
                text-white font-mono 
                text-xs md:text-sm 
                truncate flex-1
              "
              >
                {owner}
              </p>
            </div>

            {/* RIGHT — action buttons */}
            <div className="flex items-center gap-2 flex-shrink-0 ml-3">
              {/* COPY BUTTON */}
              <button
                onClick={() => onCopy(owner)}
                className="
                text-red-400 hover:text-red-300 p-1
                hover:bg-red-900/20 rounded-md transition
              "
              >
                <Copy className="w-3 h-3 md:w-4 md:h-4" />
              </button>

              {/* REMOVE BUTTON — super small */}
              {/* <TransactionButton
                transaction={() => createRemoveSignerTx(contract, owner)}
              >
                button
              </TransactionButton> */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
