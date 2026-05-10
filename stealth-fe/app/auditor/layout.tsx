"use client";

import AppNav from "@/components/app/AppNav";
import ConnectGate from "@/components/app/ConnectGate";

const LINKS = [
  { label: "Company Audits", href: "/auditor" },
  { label: "Individual Reports", href: "/auditor/decrypt" },
];

export default function AuditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AppNav role="auditor" links={LINKS} />
      <main className="pt-[58px] min-h-svh bg-white">
        <ConnectGate role="auditor">{children}</ConnectGate>
      </main>
    </>
  );
}
