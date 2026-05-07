import Link from "next/link";
import Image from "next/image";

const APP_LINKS = [
  { label: "Treasurer",   href: "/treasurer" },
  { label: "Contributor", href: "/contributor" },
  { label: "Auditor",     href: "/auditor" },
];

const RESOURCE_LINKS = [
  { label: "Umbra SDK",  href: "https://sdk.umbraprivacy.com/introduction", external: true },
  { label: "Umbra Docs", href: "https://docs.umbraprivacy.com",             external: true },
  { label: "GitHub",     href: "https://github.com/Stefaron/Stealth-Frontier-Hackathon", external: true },
];

const LEARN_LINKS = [
  { label: "How it works",   href: "#how-it-works" },
  { label: "Features",       href: "#features" },
  { label: "Umbra SDK",      href: "#umbra" },
];

export default function Footer() {
  return (
    <footer className="border-t border-zinc-100">
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-14 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-[1.6fr_1fr_1fr_1fr] gap-10">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <Image
                src="/stealth_logo.png"
                alt="Stealth"
                width={28}
                height={28}
                className="rounded-lg"
              />
              <span className="font-semibold text-[15px] text-zinc-900 tracking-tight">Stealth</span>
            </Link>
            <p className="mt-4 text-[13.5px] text-zinc-500 leading-relaxed max-w-xs">
              Private payroll for modern teams.
            </p>
          </div>

          <FooterCol title="App"       links={APP_LINKS} />
          <FooterCol title="Resources" links={RESOURCE_LINKS} />
          <FooterCol title="Learn"     links={LEARN_LINKS} />
        </div>

        <div className="mt-12 pt-7 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <p className="text-[12.5px] text-zinc-500">
            © 2026 Stealth · MIT License
          </p>
          <p className="text-[12.5px] text-zinc-500">
            Built on Umbra · Solana devnet
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string; external?: boolean }[];
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold tracking-wider uppercase text-zinc-400 mb-4">
        {title}
      </p>
      <ul className="space-y-2.5">
        {links.map((item) => (
          <li key={item.label}>
            <a
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              className="text-[13.5px] text-zinc-600 hover:text-zinc-900 transition-colors duration-200"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
