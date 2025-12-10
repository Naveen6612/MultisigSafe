"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useSigners } from "@/app/hooks/useSigner";
import SignersList from "@/app/components/SignersList";
import AddSignerModal from "@/app/components/AddSignerModal";

export default function MembersPage() {
  const params = useParams();
  const walletAddress = params.walletAddress as string;

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { owners, isLoading, contract } = useSigners(walletAddress);

  return (
    <div className="mt-10 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-white">Members</h1>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
        >
          + Add Signer
        </button>
      </div>

      {isLoading && <p className="text-gray-400">Loading owners...</p>}

      {/* USE REUSABLE SIGNERS COMPONENT */}
      <SignersList
        owners={[...owners]}
        contract={contract}
        walletAddress={walletAddress}
        allowRemove={true}
      />

      {isAddModalOpen && (
        <AddSignerModal
          onClose={() => setIsAddModalOpen(false)}
          walletAddress={walletAddress}
          contract={contract}
          newSigner={""}
          setNewSigner={function (val: string): void {
            throw new Error("Function not implemented.");
          }}
        />
      )}
    </div>
  );
}
