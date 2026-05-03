"use client";

import AppNav from "@/components/app/AppNav";
import ConnectGate from "@/components/app/ConnectGate";
import RegistrationBanner from "@/components/app/RegistrationBanner";

const LINKS = [
  { label: "Dashboard", href: "/treasurer" },
  { label: "Pay", href: "/treasurer/pay" },
  { label: "Auditors", href: "/treasurer/auditors" },
];

export default function TreasurerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AppNav role="treasurer" links={LINKS} />
      <main className="pt-14 min-h-svh">
        <ConnectGate role="treasurer">
          <RegistrationBanner />
          {children}
        </ConnectGate>
      </main>
    </>
  );
}
