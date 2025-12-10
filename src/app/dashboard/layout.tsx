"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/app/components/Sidebar";
import Navbar from "@/app/components/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Detect screen size
  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div className="relative min-h-screen bg-zinc-950 overflow-hidden">
      {/* HAMBURGER BUTTON — only when sidebar is CLOSED */}
      {isMobile && !sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-2 z-[100] p-2 rounded-lg bg-black/50 backdrop-blur text-white"
        >
          <svg
            width="28"
            height="28"
            stroke="currentColor"
            fill="none"
            strokeWidth="2"
          >
            <path d="M4 6h20M4 12h20M4 18h20" />
          </svg>
        </button>
      )}

      {/* DARK OVERLAY WHEN SIDEBAR OPEN */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60]"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 z-[70]
          transform transition-transform duration-300 ease-in-out
          bg-gray-900 shadow-xl

          ${
            isMobile
              ? sidebarOpen
                ? "translate-x-0"
                : "-translate-x-full"
              : "translate-x-0"
          }
        `}
      >
        {/* NOTE: Sidebar must NOT render background blue when mobile closed */}
        <Sidebar closeSidebar={() => setSidebarOpen(false)} />
      </aside>

      {/* MAIN CONTENT */}
      <main
        className={`
          min-h-screen flex flex-col transition-all duration-300
          ${isMobile ? "ml-0" : "ml-64"}
        `}
      >
        {/* NAVBAR */}
        <div
          className={`
            fixed top-0 right-0 z-20 h-16 bg-gray-950 border-b border-gray-800
            transition-all duration-300
            ${isMobile ? "left-0" : "left-64"}
          `}
        >
          {/* NAVBAR ALSO GETS toggleSidebar PROP */}
          <Navbar toggleSidebar={() => setSidebarOpen(true)} />
        </div>

        {/* CONTENT */}
        <div className="pt-20 p-6 flex-1 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}
