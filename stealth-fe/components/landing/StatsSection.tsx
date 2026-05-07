import Reveal from "./Reveal";

const ITEMS = [
  { v: "Encrypted", l: "by default" },
  { v: "1-click",   l: "bulk payouts" },
  { v: "Scoped",    l: "auditor access" },
  { v: "Solana",    l: "native chain" },
];

export default function StatsSection() {
  return (
    <section className="relative">
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <div className="section-divider" />
        <div className="grid grid-cols-2 md:grid-cols-4">
          {ITEMS.map((s, i) => (
            <Reveal key={s.v} delay={i * 80} y={10}>
              <div
                className={`py-7 md:py-9 text-center ${
                  i > 0 ? "border-l border-zinc-100" : ""
                }`}
              >
                <div className="text-[15px] md:text-[16px] font-semibold text-zinc-900 tracking-tight">
                  {s.v}
                </div>
                <div className="text-[12px] text-zinc-500 mt-1">{s.l}</div>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="section-divider" />
      </div>
    </section>
  );
}
