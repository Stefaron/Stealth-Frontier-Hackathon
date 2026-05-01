const APP_LINKS = [
  { label: "Treasurer", href: "/treasurer" },
  { label: "Contributor", href: "/contributor" },
  { label: "Auditor",    href: "/auditor" },
];

const RESOURCE_LINKS = [
  { label: "Umbra SDK",  href: "https://sdk.umbraprivacy.com/introduction", external: true },
  { label: "Umbra Docs", href: "https://docs.umbraprivacy.com",             external: true },
  { label: "GitHub",     href: "https://github.com/Stefaron/Stealth-Frontier-Hackathon", external: true },
];

const HACKATHON_LINKS = [
  { label: "Umbra Side Track", href: "https://superteam.fun/earn/listing/umbra-side-track", external: true },
  { label: "Umbra Privacy",   href: "https://www.umbraprivacy.com/",                         external: true },
];

export default function Footer() {
  return (
    <footer className="border-t border-[#e8e6e3] py-12 md:py-14">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="flex flex-col md:flex-row justify-between gap-12">
          {/* Logo + tagline */}
          <div className="md:max-w-[220px]">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 rounded-lg bg-[#0d0d0d] flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" stroke="white" strokeWidth="1.4" fill="none" />
                  <path d="M8 5L11 6.75V10.25L8 12L5 10.25V6.75L8 5Z" fill="white" fillOpacity="0.85" />
                </svg>
              </div>
              <span className="font-semibold text-[#0d0d0d] text-sm tracking-tight">Stealth</span>
            </div>
            <p className="text-[#9ca3af] text-xs leading-relaxed">
              Private payroll for DAOs. Built on the Umbra SDK for the Solana Frontier Hackathon 2026.
            </p>
          </div>

          {/* Nav columns */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
            {/* App */}
            <div>
              <p className="text-[8px] font-bold tracking-[0.22em] uppercase text-[#9ca3af] mb-3.5">App</p>
              <ul className="space-y-2.5">
                {APP_LINKS.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="text-xs text-[#6b6b6b] hover:text-[#0d0d0d] transition-colors duration-150"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <p className="text-[8px] font-bold tracking-[0.22em] uppercase text-[#9ca3af] mb-3.5">Resources</p>
              <ul className="space-y-2.5">
                {RESOURCE_LINKS.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#6b6b6b] hover:text-[#0d0d0d] transition-colors duration-150"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Hackathon */}
            <div>
              <p className="text-[8px] font-bold tracking-[0.22em] uppercase text-[#9ca3af] mb-3.5">Hackathon</p>
              <ul className="space-y-2.5">
                {HACKATHON_LINKS.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#6b6b6b] hover:text-[#0d0d0d] transition-colors duration-150"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Back to top */}
          <div className="hidden md:flex flex-col items-end justify-start">
            <a
              href="#"
              className="text-xs text-[#9ca3af] hover:text-[#0d0d0d] transition-colors duration-150"
            >
              Back to top ↑
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#e8e6e3] mt-10 pt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
          <p className="text-[10px] text-[#9ca3af] tracking-wide">
            Built for the Solana Frontier Hackathon 2026 · Umbra Side Track · MIT License
          </p>
          <p className="text-[10px] text-[#9ca3af]">
            Powered by the Umbra SDK · Deployed on Solana devnet
          </p>
        </div>
      </div>
    </footer>
  );
}
