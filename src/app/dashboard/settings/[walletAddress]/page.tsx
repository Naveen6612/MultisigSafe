"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { getContract, prepareContractCall, ThirdwebContract } from "thirdweb";
import { useReadContract, TransactionButton } from "thirdweb/react";
import { client } from "@/app/client";
import { sepolia } from "thirdweb/chains";
import { Copy, Trash2, X } from "lucide-react";
import { keccak256, toHex } from "thirdweb/utils";
import { useSigners } from "@/app/hooks/useSigner";
import SignersList from "@/app/components/SignersList";
/* -------------------------------------------------- */
/* SETTINGS PAGE */
/* -------------------------------------------------- */

export default function SettingsPage() {
  const params = useParams();
  const walletAddress = params.walletAddress as string;
  const [isThresholdModalOpen, setIsThresholdModalOpen] = useState(false);
  const contract = getContract({
    client,
    chain: sepolia,
    address: walletAddress,
  });

  // READ OWNERS
  const { data: ownersData } = useReadContract({
    contract,
    method: "function getOwners() view returns (address[])",
    params: [],
  });

  const owners = (ownersData || []) as string[];

  // READ THRESHOLD
  const { data: thresholdData } = useReadContract({
    contract,
    method: "function numConfirmationsRequired() view returns (uint256)",
    params: [],
  });

  const threshold = thresholdData ? Number(thresholdData) : 0;

  return (
    <div className="space-y-12 mt-10 max-w-4xl">
      {/* -------------------------------------- */}
      {/* MANAGE SIGNERS SECTION */}
      {/* -------------------------------------- */}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Manage signers</h2>
        </div>

        {/* USE REUSABLE SIGNERS COMPONENT */}
        <SignersList
          owners={[...owners]}
          contract={contract}
          walletAddress={walletAddress}
          allowRemove={true}
        />
      </div>

      {/* -------------------------------------- */}
      {/* THRESHOLD SECTION */}
      {/* -------------------------------------- */}

      <div className="bg-[#0f0f0f] p-6 rounded-2xl shadow-xl shadow-black/40">
        <h3 className="text-2xl font-semibold text-white mb-4">
          Required Confirmations
        </h3>

        <p className="text-gray-400 mb-4">
          Specify how many signers must approve before a transaction is
          executed:
        </p>

        <div className="flex items-center justify-between">
          <p className="text-white text-xl">
            {threshold} <span className="text-gray-500">of</span>{" "}
            {owners.length} signers
          </p>

          <button
            onClick={() => setIsThresholdModalOpen(true)}
            className="bg-red-600 px-4 py-2 rounded-lg text-white hover:bg-red-700 transition shadow-md"
          >
            Change
          </button>
        </div>
      </div>

      {/* MODAL */}
      <ThresholdModal
        isOpen={isThresholdModalOpen}
        onClose={() => setIsThresholdModalOpen(false)}
        ownersCount={owners.length}
        currentThreshold={threshold}
        contract={contract}
      />
    </div>
  );
}

/* -------------------------------------------------- */
/* SIGNER CARD COMPONENT */
/* -------------------------------------------------- */

// function SignerCard({
//   owner,
//   contract,
//   walletAddress,
// }: {
//   owner: string;
//   contract: any;
//   walletAddress: string;
// }) {
//   const handleCopy = () => navigator.clipboard.writeText(owner);

//   return (
//     <div className="flex items-center justify-between bg-[#0c0c0c] p-4 rounded-lg border border-gray-700">
//       <div className="flex items-center gap-3">
//         <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500" />
//         <p className="text-white font-mono text-sm break-all">{owner}</p>
//       </div>

//       <div className="flex items-center gap-4">
//         <button onClick={handleCopy} className="text-gray-400 hover:text-white">
//           <Copy className="w-4 h-4" />
//         </button>

//         {/* REMOVE OWNER BUTTON */}
//         {/* <TransactionButton
//           transaction={() =>
//             prepareContractCall({
//               contract,
//               method: "function removeOwner(address _owner)",
//               params: [owner],
//             })
//           }
//           className="text-red-400 hover:text-red-600"
//         >
//           <Trash2 className="w-4 h-4" />
//         </TransactionButton> */}
//       </div>
//     </div>
//   );
// }

/* -------------------------------------------------- */
/* THRESHOLD MODAL */
/* -------------------------------------------------- */

type ThresholdModalProps = {
  isOpen: boolean;
  onClose: () => void;
  ownersCount: number;
  currentThreshold: number;
  contract: ThirdwebContract;
};

export function ThresholdModal({
  isOpen,
  onClose,
  ownersCount,
  currentThreshold,
  contract,
}: ThresholdModalProps) {
  const [step, setStep] = useState<"edit" | "confirm">("edit");
  const [newThreshold, setNewThreshold] = useState(currentThreshold);

  useEffect(() => {
    if (isOpen) {
      setStep("edit");
      setNewThreshold(currentThreshold);
    }
  }, [isOpen, currentThreshold]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xl bg-black/60 animate-fadeIn">
      <div className="w-full max-w-lg rounded-2xl bg-[#111] shadow-2xl shadow-black/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Update Threshold</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === "edit" && (
          <>
            <p className="text-gray-300 mb-4">
              Set required number of signatures:
            </p>

            <div className="flex items-center gap-3 mb-6">
              <select
                value={newThreshold}
                onChange={(e) => setNewThreshold(Number(e.target.value))}
                className="bg-black text-white rounded-lg px-3 py-2"
              >
                {Array.from({ length: ownersCount }, (_, i) => i + 1).map(
                  (v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ),
                )}
              </select>

              <span className="text-gray-500">of {ownersCount}</span>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-800 transition"
              >
                Cancel
              </button>

              <button
                onClick={() => setStep("confirm")}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
              >
                Continue
              </button>
            </div>
          </>
        )}

        {step === "confirm" && (
          <>
            <p className="text-gray-300 mb-6">
              You are about to update the threshold to{" "}
              <span className="text-red-400 font-semibold">
                {newThreshold} of {ownersCount}
              </span>
              .
            </p>

            <div className="flex justify-between items-center">
              <button
                onClick={() => setStep("edit")}
                className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-800 transition"
              >
                Back
              </button>

              <TransactionButton
                transaction={() => {
                  const selector = keccak256(
                    toHex("changeRequirement(uint256)"),
                  ).slice(0, 10);
                  const param = toHex(BigInt(newThreshold), { size: 32 }).slice(
                    2,
                  );
                  const data = (selector + param) as `0x${string}`;

                  return prepareContractCall({
                    contract,
                    method:
                      "function submitTransaction(address _to, uint256 _value, bytes _data)",
                    params: [contract.address, 0n, data],
                  });
                }}
                onTransactionSent={onClose}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition shadow-lg"
              >
                Submit
              </TransactionButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
