import Reveal from "./Reveal";

interface Item {
  v: string;
  l: string;
  icon: React.ReactNode;
  accent: string;
}

const ITEMS: Item[] = [
  {
    v: "Encrypted",
    l: "by default",
    accent: "rgba(99,102,241,0.14)",
    icon: (
      <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
        <rect x="3" y="8" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
        <path d="M5.5 8V5a3.5 3.5 0 0 1 7 0v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="9" cy="12" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    v: "1-click",
    l: "bulk payouts",
    accent: "rgba(245,158,11,0.14)",
    icon: (
      <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
        <path d="M7 2v3M7 11v3M2 7h3M11 7h3M3.2 3.2l2.1 2.1M11.2 11.2l2.1 2.1M3.2 11.2l2.1-2.1M11.2 3.2l-2.1 2.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M7 7l9 4-3.5 1L11 16l-4-9Z" fill="currentColor" stroke="currentColor" strokeWidth="0.6" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    v: "Scoped",
    l: "auditor access",
    accent: "rgba(16,185,129,0.14)",
    icon: (
      <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="9" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="9" cy="9" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    v: "Solana",
    l: "native chain",
    accent: "rgba(139,92,246,0.14)",
    icon: (
      <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
        <path d="M3 5l3-3h9l-3 3H3ZM3 9l3-3h9l-3 3H3ZM3 13l3-3h9l-3 3H3Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function StatsSection() {
  return (
    <section className="relative">
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-10 md:py-12">
          {ITEMS.map((s, i) => (
            <Reveal key={s.v} delay={i * 70} y={10}>
              <div
                className="group relative h-full card card-hover p-5 flex items-start gap-3 cursor-default overflow-hidden"
              >
                {/* Soft halo on hover */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500"
                  style={{ background: s.accent }}
                />
                <span className="relative w-9 h-9 rounded-lg bg-zinc-50 text-zinc-700 grid place-items-center flex-shrink-0 group-hover:bg-zinc-900 group-hover:text-white transition-colors duration-300 icon-wiggle">
                  {s.icon}
                </span>
                <div className="relative">
                  <div className="text-[15px] md:text-[16px] font-semibold text-zinc-900 tracking-tight">
                    {s.v}
                  </div>
                  <div className="text-[12px] text-zinc-500 mt-0.5">{s.l}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
