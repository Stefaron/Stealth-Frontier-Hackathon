import ScrollReveal from "./ScrollReveal";

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

const HACKATHON_LINKS = [
  { label: "Umbra Side Track", href: "https://superteam.fun/earn/listing/umbra-side-track", external: true },
  { label: "Umbra Privacy",    href: "https://www.umbraprivacy.com/",                        external: true },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-white/[0.06] overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 100%, rgba(167,139,250,0.7), transparent 40%), radial-gradient(circle at 80% 100%, rgba(56,189,248,0.6), transparent 40%)",
        }}
      />

      <div className="footer-rule" />

      <div className="max-w-7xl mx-auto px-6 md:px-8 py-14 md:py-20 relative">
        <div className="flex flex-col md:flex-row justify-between gap-12">
          <ScrollReveal variant="up" delay={0}>
            <div className="footer-brand md:max-w-[220px] flex flex-col">
              <div className="flex items-center gap-2.5 mb-4">
                <div
                  className="footer-brand-mark w-8 h-8 rounded-lg border flex items-center justify-center"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    borderColor: "rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" stroke="currentColor" strokeWidth="1.4" fill="none" />
                    <path d="M8 5L11 6.75V10.25L8 12L5 10.25V6.75L8 5Z" fill="currentColor" opacity="0.65" />
                  </svg>
                </div>
                <span className="font-semibold text-white/85 text-sm tracking-tight">Stealth</span>
              </div>
              <p className="text-white/35 text-xs leading-relaxed">
                Private payroll for DAOs. Built on the Umbra SDK for Solana Frontier Hackathon 2026.
              </p>
              <div className="mt-5 flex items-center gap-2">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-pulse-glow absolute inline-flex h-full w-full rounded-full bg-emerald-400/60" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400/80" />
                </span>
                <span className="text-[9px] font-mono tracking-[0.22em] uppercase text-white/40">
                  Solana devnet · live
                </span>
              </div>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-14">
            {[
              { title: "App",       links: APP_LINKS,       d: 60 },
              { title: "Resources", links: RESOURCE_LINKS,  d: 120 },
              { title: "Hackathon", links: HACKATHON_LINKS, d: 180 },
            ].map((col) => (
              <ScrollReveal key={col.title} delay={col.d} variant="up">
                <div>
                  <p className="text-[8px] font-bold tracking-[0.24em] uppercase text-white/30 mb-5">
                    {col.title}
                  </p>
                  <ul className="space-y-3">
                    {col.links.map((item) => (
                      <li key={item.label}>
                        <a
                          href={item.href}
                          target={"external" in item && item.external ? "_blank" : undefined}
                          rel={"external" in item && item.external ? "noopener noreferrer" : undefined}
                          className="footer-link text-xs text-white/45 hover:text-white"
                        >
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={240} variant="up">
            <div className="hidden md:flex flex-col items-end justify-start gap-3">
              <a
                href="#"
                className="group flex items-center gap-2 text-xs text-white/40 hover:text-white transition-colors duration-300"
              >
                <span className="inline-block transition-transform duration-400 group-hover:-translate-y-1">↑</span>
                <span>Back to top</span>
              </a>
              <span className="text-[9px] font-mono tracking-[0.22em] uppercase text-white/22">
                v0.1.0
              </span>
            </div>
          </ScrollReveal>
        </div>

        <div className="border-t border-white/[0.05] mt-12 pt-7 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <p className="text-[10px] text-white/28 tracking-wide">
            Built for Solana Frontier Hackathon 2026 · Umbra Side Track · MIT License
          </p>
          <p className="text-[10px] text-white/28 flex items-center gap-2">
            Powered by the Umbra SDK
            <span className="text-white/15">·</span>
            Deployed on Solana devnet
          </p>
        </div>
      </div>
    </footer>
  );
}
