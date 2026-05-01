import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Stealth — Private Payroll for DAOs",
  description:
    "Private by default. Auditable on demand. Stealth brings confidential payroll to Solana DAOs using the Umbra SDK — built for the Solana Frontier Hackathon 2026.",
  keywords: ["DAO", "payroll", "Solana", "Umbra", "privacy", "DeFi", "compliance"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0d0c0a] text-[#f0ede8]">
        {children}
      </body>
    </html>
  );
}
