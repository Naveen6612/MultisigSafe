import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThirdwebProvider } from "thirdweb/react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { Analytics } from "@vercel/analytics/next";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "thirdweb SDK + Next starter",
  description:
    "Starter template for using thirdweb SDK with Next.js App router",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className=" bg-[#0b0b0b] text-white">
        <ThirdwebProvider>
          {children}
          <Analytics />
        </ThirdwebProvider>
      </body>
    </html>
  );
}
