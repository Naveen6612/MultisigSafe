"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useActiveWallet, useDisconnect } from "thirdweb/react";

import {
  LayoutDashboard,
  Users,
  GitPullRequest,
  Settings,
  LogOut,
  PlusCircle,
  X,
} from "lucide-react";

export default function Sidebar({
  closeSidebar,
}: {
  closeSidebar: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const segments = pathname.split("/");
  let walletAddress: string | null = null;

  if (segments[1] === "dashboard") {
    if (segments[2]?.startsWith("0x")) walletAddress = segments[2];
    else if (segments[3]?.startsWith("0x")) walletAddress = segments[3];
  }

  const wallet = useActiveWallet();
  const { disconnect } = useDisconnect();

  const navItems = [
    {
      label: "Dashboard",
      href: `/dashboard/${walletAddress}`,
      icon: LayoutDashboard,
      match: /^\/dashboard\/0x[a-fA-F0-9]{40}$/i,
    },
    {
      label: "Members",
      href: `/dashboard/members/${walletAddress}`,
      icon: Users,
      match: /^\/dashboard\/members/,
    },
    {
      label: "Create Account",
      href: "/create-account",
      icon: PlusCircle,
      match: /^\/create-account/,
    },
    {
      label: "Transactions",
      href: `/dashboard/transaction/${walletAddress}`,
      icon: GitPullRequest,
      match: /^\/dashboard\/transaction/,
    },
    {
      label: "Settings",
      href: `/dashboard/settings/${walletAddress}`,
      icon: Settings,
      match: /^\/dashboard\/settings/,
    },
  ];

  return (
    <div className="h-full w-full bg-[#0b0b0b] text-gray-200 flex flex-col shadow-xl relative">
      {/* MOBILE CLOSE BUTTON (only visible when sidebar is open) */}
      <button
        onClick={closeSidebar}
        className="md:hidden absolute top-4 right-4 text-gray-400 hover:text-white z-50"
      >
        <X className="w-6 h-6" />
      </button>

      {/* HEADER */}
      <div className="px-6 py-6 border-b border-gray-800">
        <h1 className="text-xl font-semibold text-white tracking-wide">
          MultiSig Vault
        </h1>

        {walletAddress && (
          <p className="text-gray-500 text-xs mt-1 truncate">{walletAddress}</p>
        )}
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-3 py-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.match.test(pathname);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeSidebar}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-150
                ${
                  isActive
                    ? "bg-[#0f0f0f] text-red-400 shadow-md"
                    : "text-gray-400 hover:text-red-400 hover:bg-red-900/10"
                }
              `}
            >
              <Icon className="h-5 w-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* FOOTER */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={() => {
            if (wallet) disconnect(wallet);
            router.push("/");
            closeSidebar();
          }}
          className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-red-400 hover:text-red-300 hover:bg-red-900/20 transition"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-sm font-medium">Disconnect</span>
        </button>
      </div>
    </div>
  );
}
