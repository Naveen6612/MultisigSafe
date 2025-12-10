import { NextResponse } from "next/server";
import { getContract, readContract } from "thirdweb";
import { client } from "@/app/client";
import { MULTISIGWALLET } from "@/app/constants/contract";
import { sepolia } from "thirdweb/chains";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const user = searchParams.get("user");

  if (!user) return NextResponse.json({ wallet: null });

  const factory = getContract({
    client,
    chain: sepolia,
    address: MULTISIGWALLET,
  });

  try {
    const wallet = await readContract({
      contract: factory,
      method: "function getWalletByCreator(address) view returns (address)",
      params: [user],
    });

    return NextResponse.json({ wallet });
  } catch (e) {
    return NextResponse.json({ wallet: null });
  }
}
