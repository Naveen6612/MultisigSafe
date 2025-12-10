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
import ThresholdModal from "@/app/components/ThresholdModal";

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
        <p className="text-gray-400 mb-4">
          Please Confirm and Execute your transaction in Transaction section to
          complete process
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
