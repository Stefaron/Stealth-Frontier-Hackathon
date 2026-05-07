"use client";

import AppNav from "@/components/app/AppNav";
import ConnectGate from "@/components/app/ConnectGate";
import RegistrationBanner from "@/components/app/RegistrationBanner";

const LINKS = [{ label: "Balance", href: "/contributor" }];

export default function ContributorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AppNav role="contributor" links={LINKS} />
      <main className="pt-[58px] min-h-svh bg-white">
        <ConnectGate role="contributor">
          <RegistrationBanner />
          {children}
        </ConnectGate>
      </main>
    </>
  );
}
