import Reveal from "./Reveal";

interface Card {
  tag: string;
  title: string;
  desc: string;
  bullets: string[];
  primary?: boolean;
}

const CARDS: Card[] = [
  {
    tag: "Public ledgers",
    title: "Every salary on Solscan. Forever.",
    desc: "Standard payroll exposes every transfer.",
    bullets: ["Anyone sees contributor pay", "Competitors learn your runway", "Talent retention takes a hit"],
  },
  {
    tag: "Anonymous mixers",
    title: "Private, but un-auditable.",
    desc: "Mixers hide everything — even from your accountant.",
    bullets: ["No way to prove totals", "Banks won't onboard you", "Regulatory risk piles up"],
  },
  {
    tag: "Stealth",
    title: "Private by default. Auditable on demand.",
    desc: "The middle ground that DAOs actually need.",
    bullets: ["Encrypted balances on-chain", "Scoped, revocable read access", "Standard audit reports"],
    primary: true,
  },
];

export default function ProblemSection() {
  return (
    <section id="why" className="cv-section relative py-24 md:py-32 px-5 md:px-8 bg-zinc-50/60 border-y border-zinc-100">
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <div className="max-w-2xl mb-12 md:mb-14">
            <span className="eyebrow">
              <span className="eyebrow-dot" />
              The problem
            </span>
            <h2
              className="mt-4 font-bold text-zinc-900 tracking-tight"
              style={{
                fontSize: "clamp(1.875rem, 3.4vw, 2.5rem)",
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
              }}
            >
              Public is broken. Anonymous is worse.
            </h2>
            <p className="mt-4 text-[14.5px] text-zinc-600 leading-relaxed">
              Most teams pick the lesser of two bad options. Stealth gives you the third.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {CARDS.map((c, i) => (
            <Reveal key={c.title} delay={i * 80} y={14}>
              <article
                className={`h-full card card-hover p-6 cursor-default ${
                  c.primary ? "border-zinc-300" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-5">
                  <span
                    className={`inline-flex text-[11px] font-semibold tracking-wide uppercase rounded-full px-2.5 py-1 ${
                      c.primary
                        ? "bg-zinc-900 text-white"
                        : "bg-zinc-100 text-zinc-600"
                    }`}
                  >
                    {c.tag}
                  </span>
                  {c.primary && (
                    <span className="text-[10.5px] font-medium text-emerald-600">
                      Recommended
                    </span>
                  )}
                </div>
                <h3 className="text-[16px] font-semibold text-zinc-900 leading-snug mb-2 tracking-tight">
                  {c.title}
                </h3>
                <p className="text-[13px] leading-relaxed text-zinc-500 mb-5">{c.desc}</p>
                <ul className="space-y-2">
                  {c.bullets.map((b) => (
                    <li
                      key={b}
                      className="flex items-start gap-2.5 text-[13px] text-zinc-700"
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 14 14"
                        fill="none"
                        className={`mt-0.5 flex-shrink-0 ${c.primary ? "text-zinc-900" : "text-zinc-400"}`}
                      >
                        {c.primary ? (
                          <path d="M3 7l3 3 5-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                        ) : (
                          <path d="M4 4l6 6M10 4l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                        )}
                      </svg>
                      {b}
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
