"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ConnectButton, darkTheme } from "thirdweb/react";
import { client } from "@/app/client";
import { getWalletBalance } from "thirdweb/wallets";
import { sepolia } from "thirdweb/chains";
import { Copy, Menu } from "lucide-react";

function extractWalletAddress(path: string): string | null {
  return path.split("/").find((p) => p.startsWith("0x")) || null;
}

export default function Navbar({
  toggleSidebar,
}: {
  toggleSidebar: () => void;
}) {
  const pathname = usePathname();
  const walletAddress = extractWalletAddress(pathname);

  const [balance, setBalance] = useState<string>("0.0000");
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load balance
  useEffect(() => {
    async function loadBalance() {
      if (!walletAddress) return;

      try {
        const result = await getWalletBalance({
          address: walletAddress as `0x${string}`,
          client,
          chain: sepolia,
        });

        setBalance((Number(result.value) / 1e18).toFixed(4));
      } catch (err) {
        console.error("Balance fetch error:", err);
      }
    }

    loadBalance();
  }, [walletAddress]);

  // Close dropdown if clicking outside
  useEffect(() => {
    function handleClickOutside(e: any) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const copyToClipboard = () =>
    walletAddress && navigator.clipboard.writeText(walletAddress);

  return (
    <nav className="w-full bg-[#0b0b0b] text-white px-4 md:px-6 py-3 md:py-4 shadow-xl border-b border-red-900/20 flex justify-between items-center relative">
      {/* SIDEBAR TOGGLE (Mobile only) */}
      <button
        onClick={toggleSidebar}
        className="md:hidden p-2 rounded-lg bg-black/40 text-white hover:bg-black/60"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* LOGO (hidden on mobile) */}
      <h1 className="text-2xl font-bold tracking-wide text-red-500  hidden md:block">
        MultiVault
      </h1>

      {/* RIGHT SECTION */}
      <div
        className="flex items-center gap-3 md:gap-6 relative"
        ref={dropdownRef}
      >
        {/* VAULT BUTTON (Responsive) */}
        {walletAddress && (
          <button
            onClick={() => setOpen(!open)}
            className={`
              rounded-xl font-semibold transition-all border shadow-lg  backdrop-blur-md
              ${open ? "bg-red-800/40 border-gray-700" : "border-gray-700/40 bg-black"}
              px-3 py-1.5 text-xs md:text-sm md:px-5 md:py-2
            `}
          >
            Vault: <span className="text-red-400">{balance}</span> ETH
          </button>
        )}

        {/* WALLET CONNECT (Responsive) */}
        <div className="scale-90 md:scale-100">
          <ConnectButton
            client={client}
            theme={darkTheme({
              colors: { accentText: "#fff", accentButtonBg: "#ef4444" },
            })}
            connectButton={{
              label: "Connect",
              style: {
                borderRadius: "0.6rem",
                padding: "0.45rem 1rem",
                fontWeight: 700,
                background: "#1a1a1a",
                border: "1px solid #333",
                fontSize: "0.75rem",
              },
            }}
          />
        </div>

        {/* VAULT DROPDOWN */}
        {open && walletAddress && (
          <div className="absolute right-10 md:right-5 top-12 w-64 md:w-80 p-5 rounded-xl border border-black/20 bg-black backdrop-blur-3xl nimate-slideDown z-50">
            <h2 className="text-lg font-semibold mb-3 text-red-400">
              Vault Details
            </h2>

            {/* Address */}
            <p className="text-gray-400 text-sm mb-1">Wallet Address</p>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-white font-mono text-xs break-all">
                {walletAddress}
              </span>
              <button
                onClick={copyToClipboard}
                className="p-1 rounded hover:bg-red-900/40"
              >
                <Copy className="w-4 h-4 text-red-300" />
              </button>
            </div>

            {/* Balance */}
            <p className="text-gray-400 text-sm">Balance</p>
            <p className="text-2xl font-bold text-red-400">{balance} ETH</p>
          </div>
        )}
      </div>
    </nav>
  );
}
