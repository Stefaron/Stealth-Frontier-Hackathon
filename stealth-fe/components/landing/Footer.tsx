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
    <footer className="border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 md:py-16">
        <div className="flex flex-col md:flex-row justify-between gap-12">
          {/* Brand */}
          <div className="md:max-w-[200px]">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 rounded-lg bg-white/[0.07] border border-white/[0.06] flex items-center justify-center">
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" stroke="rgba(255,255,255,0.6)" strokeWidth="1.4" fill="none" />
                  <path d="M8 5L11 6.75V10.25L8 12L5 10.25V6.75L8 5Z" fill="rgba(255,255,255,0.45)" />
                </svg>
              </div>
              <span className="font-semibold text-white/70 text-sm tracking-tight">Stealth</span>
            </div>
            <p className="text-white/25 text-xs leading-relaxed">
              Private payroll for DAOs. Built on the Umbra SDK for Solana Frontier Hackathon 2026.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-14">
            {[
              { title: "App",       links: APP_LINKS },
              { title: "Resources", links: RESOURCE_LINKS },
              { title: "Hackathon", links: HACKATHON_LINKS },
            ].map((col) => (
              <div key={col.title}>
                <p className="text-[8px] font-bold tracking-[0.24em] uppercase text-white/22 mb-4">{col.title}</p>
                <ul className="space-y-2.5">
                  {col.links.map((item) => (
                    <li key={item.label}>
                      <a
                        href={item.href}
                        target={"external" in item && item.external ? "_blank" : undefined}
                        rel={"external" in item && item.external ? "noopener noreferrer" : undefined}
                        className="text-xs text-white/35 hover:text-white/70 transition-colors duration-150"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Back to top */}
          <div className="hidden md:flex flex-col items-end justify-start">
            <a href="#" className="text-xs text-white/22 hover:text-white/50 transition-colors duration-150">
              Back to top ↑
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.05] mt-10 pt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
          <p className="text-[10px] text-white/18 tracking-wide">
            Built for Solana Frontier Hackathon 2026 · Umbra Side Track · MIT License
          </p>
          <p className="text-[10px] text-white/18">
            Powered by the Umbra SDK · Deployed on Solana devnet
          </p>
        </div>
      </div>
    </footer>
  );
}
