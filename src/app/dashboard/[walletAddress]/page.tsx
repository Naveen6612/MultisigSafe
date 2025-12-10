"use client";

import { client } from "@/app/client";
import { Copy, Trash2, Users, X, ShieldCheck } from "lucide-react";
import { useParams } from "next/navigation";
import { keccak256, toHex } from "thirdweb/utils";
import { useEffect, useState } from "react";
import { getContract, prepareContractCall, ThirdwebContract } from "thirdweb";
import { sepolia } from "thirdweb/chains";
import { TransactionButton, useReadContract } from "thirdweb/react";
import TransactionsPanel from "@/app/components/TransactionPanel";

export default function MembersSection() {
  const params = useParams();
  const walletAddress = params.walletAddress as string;

  const [isThresholdModalOpen, setIsThresholdModalOpen] = useState(false);

  const contract = getContract({
    client,
    chain: sepolia,
    address: walletAddress,
  });

  // FETCH OWNERS
  const { data: ownersData } = useReadContract({
    contract,
    method: "function getOwners() view returns (address[])",
    params: [],
  });
  const owners = ownersData || [];

  // FETCH THRESHOLD
  const { data: thresholdData } = useReadContract({
    contract,
    method: "function numConfirmationsRequired() view returns (uint256)",
    params: [],
  });
  const threshold = thresholdData ? Number(thresholdData) : 0;

  const onCopy = async (value: string) => {
    await navigator.clipboard.writeText(value);
  };

  return (
    <div className="space-y-10 py-6 animate-fadeIn">
      {/* HEADER */}
      <h1 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
        <ShieldCheck className="text-red-500" />
        Wallet Security Overview
      </h1>

      {/* SIGNERS SECTION */}
      <div className="bg-[#0f0f0f] p-6 rounded-2xl shadow-xl shadow-black/40">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold text-white">Signers</h3>
        </div>

        <div className="space-y-4">
          {owners.map((owner, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-black/30 backdrop-blur-sm p-4 rounded-xl hover:bg-black/40 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500/80 to-red-700/80 shadow-md" />
                <p className="text-white font-mono text-sm break-all">
                  {owner}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => onCopy(owner)}
                  className="text-gray-400 hover:text-white transition"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* THRESHOLD SECTION */}
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

          {/* <button
            onClick={() => setIsThresholdModalOpen(true)}
            className="bg-red-600 px-4 py-2 rounded-lg text-white hover:bg-red-700 transition shadow-md"
          >
            Change
          </button> */}
        </div>
      </div>

      {/* MODAL */}
      {/* <ThresholdModal
        isOpen={isThresholdModalOpen}
        onClose={() => setIsThresholdModalOpen(false)}
        ownersCount={owners.length}
        currentThreshold={threshold}
        contract={contract}
      /> */}

      {/* TRANSACTIONS PANEL */}
      <TransactionsPanel contract={contract} threshold={threshold} />
    </div>
  );
}

/* ---------------------------------------------------------- */
/*                       THRESHOLD MODAL                      */
/* ---------------------------------------------------------- */

// type ThresholdModalProps = {
//   isOpen: boolean;
//   onClose: () => void;
//   ownersCount: number;
//   currentThreshold: number;
//   contract: ThirdwebContract;
// };

// export function ThresholdModal({
//   isOpen,
//   onClose,
//   ownersCount,
//   currentThreshold,
//   contract,
// }: ThresholdModalProps) {
//   const [step, setStep] = useState<"edit" | "confirm">("edit");
//   const [newThreshold, setNewThreshold] = useState(currentThreshold);

//   useEffect(() => {
//     if (isOpen) {
//       setStep("edit");
//       setNewThreshold(currentThreshold);
//     }
//   }, [isOpen, currentThreshold]);

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xl bg-black/60 animate-fadeIn">
//       <div className="w-full max-w-lg rounded-2xl bg-[#111] shadow-2xl shadow-black/50 p-6">
//         <div className="flex items-center justify-between mb-4">
//           <h2 className="text-2xl font-bold text-white">Update Threshold</h2>
//           <button onClick={onClose} className="text-gray-400 hover:text-white">
//             <X className="w-5 h-5" />
//           </button>
//         </div>

//         {step === "edit" && (
//           <>
//             <p className="text-gray-300 mb-4">
//               Set required number of signatures:
//             </p>

//             <div className="flex items-center gap-3 mb-6">
//               <select
//                 value={newThreshold}
//                 onChange={(e) => setNewThreshold(Number(e.target.value))}
//                 className="bg-black text-white rounded-lg px-3 py-2"
//               >
//                 {Array.from({ length: ownersCount }, (_, i) => i + 1).map(
//                   (v) => (
//                     <option key={v} value={v}>
//                       {v}
//                     </option>
//                   ),
//                 )}
//               </select>

//               <span className="text-gray-500">of {ownersCount}</span>
//             </div>

//             <div className="flex justify-end gap-3">
//               <button
//                 onClick={onClose}
//                 className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-800 transition"
//               >
//                 Cancel
//               </button>

//               <button
//                 onClick={() => setStep("confirm")}
//                 className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
//               >
//                 Continue
//               </button>
//             </div>
//           </>
//         )}

//         {step === "confirm" && (
//           <>
//             <p className="text-gray-300 mb-6">
//               You are about to update the threshold to{" "}
//               <span className="text-red-400 font-semibold">
//                 {newThreshold} of {ownersCount}
//               </span>
//               .
//             </p>

//             <div className="flex justify-between items-center">
//               <button
//                 onClick={() => setStep("edit")}
//                 className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-800 transition"
//               >
//                 Back
//               </button>

//               <TransactionButton
//                 transaction={() => {
//                   const selector = keccak256(
//                     toHex("changeRequirement(uint256)"),
//                   ).slice(0, 10);
//                   const param = toHex(BigInt(newThreshold), { size: 32 }).slice(
//                     2,
//                   );
//                   const data = (selector + param) as `0x${string}`;

//                   return prepareContractCall({
//                     contract,
//                     method:
//                       "function submitTransaction(address _to, uint256 _value, bytes _data)",
//                     params: [contract.address, 0n, data],
//                   });
//                 }}
//                 onTransactionSent={onClose}
//                 className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition shadow-lg"
//               >
//                 Submit
//               </TransactionButton>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }
