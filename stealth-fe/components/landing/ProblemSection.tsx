import ScrollReveal from "./ScrollReveal";

const OPTIONS = [
  {
    status: "Public",
    statusColor: "text-red-500",
    statusBg: "bg-red-50 border-red-100",
    dot: "bg-red-400",
    name: "Realms / Squads",
    issue: "Every salary on Solscan. Forever.",
  },
  {
    status: "Anonymous",
    statusColor: "text-amber-600",
    statusBg: "bg-amber-50 border-amber-100",
    dot: "bg-amber-400",
    name: "Tornado-style",
    issue: "Private, but zero auditability.",
  },
];

export default function ProblemSection() {
  return (
    <section className="bg-[#eceae4] py-24 md:py-32" id="problem">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <ScrollReveal>
          <p className="text-[9px] font-semibold tracking-[0.22em] uppercase text-[#a09d98] mb-4">
            The Problem
          </p>
        </ScrollReveal>
        <ScrollReveal delay={80}>
          <h2 className="text-4xl md:text-[3.25rem] font-bold text-[#0c0b09] leading-[1.05] tracking-tight max-w-2xl mb-14">
            <span className="font-serif-italic" style={{ fontWeight: 400 }}>Two broken options.</span>{" "}
            One missing middle.
          </h2>
        </ScrollReveal>

        {/* Comparison rows */}
        <div className="border-t border-[#d9d5cc] mb-6">
          {OPTIONS.map((opt, i) => (
            <ScrollReveal key={opt.name} delay={120 + i * 70}>
              <div className="row-hover grid grid-cols-1 md:grid-cols-[140px_1fr_auto] items-center gap-4 md:gap-8 border-b border-[#e6e2da] py-6 px-3 -mx-3 rounded-xl cursor-default">
                <span className={`inline-flex items-center gap-1.5 border rounded-full px-3 py-1.5 w-fit text-[9px] font-bold tracking-widest uppercase ${opt.statusBg} ${opt.statusColor}`}>
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${opt.dot}`} />
                  {opt.status}
                </span>
                <h3 className="text-lg font-bold text-[#0c0b09]">{opt.name}</h3>
                <p className="text-sm text-[#a09d98] md:text-right">{opt.issue}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Solution bridge */}
        <ScrollReveal delay={300}>
          <div className="bg-[#0c0b09] rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-1.5 bg-white/8 border border-white/8 rounded-full px-3 py-1.5 mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-white/40 text-[9px] font-bold tracking-widest uppercase">Stealth</span>
              </span>
              <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                Private by default.{" "}
                <span className="font-serif-italic text-white/40" style={{ fontWeight: 400 }}>
                  Auditable on demand.
                </span>
              </h3>
            </div>
            <a
              href="#how-it-works"
              className="flex-shrink-0 bg-white text-[#0c0b09] text-[10px] font-bold tracking-widest uppercase px-6 py-3 rounded-full hover:bg-white/90 transition-all hover:scale-[1.03] whitespace-nowrap"
            >
              See how →
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
