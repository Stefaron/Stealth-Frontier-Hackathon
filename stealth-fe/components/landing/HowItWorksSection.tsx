import Reveal from "./Reveal";

interface Step {
  num: string;
  title: string;
  desc: string;
  thumb: React.ReactNode;
}

const STEPS: Step[] = [
  {
    num: "01",
    title: "Connect",
    desc: "Sign in with the wallet you already use.",
    thumb: <ThumbConnect />,
  },
  {
    num: "02",
    title: "Upload",
    desc: "Import a CSV. Tag by team or role.",
    thumb: <ThumbUpload />,
  },
  {
    num: "03",
    title: "Send",
    desc: "Pay everyone privately in one click.",
    thumb: <ThumbSend />,
  },
  {
    num: "04",
    title: "Audit",
    desc: "Grant scoped read-only access.",
    thumb: <ThumbAudit />,
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="cv-section relative py-24 md:py-32 px-5 md:px-8">
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="max-w-xl">
              <span className="eyebrow">
                <span className="eyebrow-dot" />
                How it works
              </span>
              <h2
                className="mt-4 font-bold text-zinc-900 tracking-tight"
                style={{
                  fontSize: "clamp(1.875rem, 3.4vw, 2.5rem)",
                  lineHeight: 1.05,
                  letterSpacing: "-0.02em",
                }}
              >
                Four steps. Under a minute.
              </h2>
            </div>
            <p className="text-[14px] text-zinc-500 max-w-sm">
              From connecting your wallet to your first private payout — no setup, no
              spreadsheets, no leaks.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.num} delay={i * 70} y={12}>
              <article className="group bento-card cursor-default h-full p-5 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10.5px] font-mono text-zinc-400 tracking-wide">
                    {s.num}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-zinc-300" />
                  <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                    Step
                  </span>
                </div>
                <h3 className="text-[14.5px] font-semibold text-zinc-900 mb-1 tracking-tight">
                  {s.title}
                </h3>
                <p className="text-[12.5px] leading-relaxed text-zinc-500 mb-4">{s.desc}</p>
                <div className="mt-auto">{s.thumb}</div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function ThumbConnect() {
  return (
    <div className="card p-3 bg-white">
      <div className="flex items-center gap-2.5">
        <span className="w-7 h-7 rounded-md bg-zinc-900 grid place-items-center text-white">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="4" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
            <path d="M2 7h12" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </span>
        <div className="flex-1 min-w-0 space-y-1.5">
          <span className="block h-1.5 w-16 rounded bg-zinc-200 thumb-shimmer" style={{ animationDelay: "0s" }} />
          <span className="block h-1.5 w-10 rounded bg-zinc-100 thumb-shimmer" style={{ animationDelay: "0.4s" }} />
        </div>
        <span className="inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded thumb-ready">
          Ready
        </span>
      </div>
    </div>
  );
}

function ThumbUpload() {
  return (
    <div className="card p-3 bg-white">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-mono text-zinc-400">team.csv</span>
        <span className="text-[9px] text-zinc-400 thumb-dot inline-block">23 rows</span>
      </div>
      <div className="space-y-1.5">
        {[18, 22, 14, 20].map((w, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="h-1 w-2 rounded bg-zinc-300" />
            <span
              className="h-1 rounded bg-zinc-300 thumb-row"
              style={{ width: `${w * 4}px`, animationDelay: `${i * 0.18}s` }}
            />
            <span className="ml-auto h-1 w-6 rounded bg-zinc-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ThumbSend() {
  return (
    <div className="card p-3 bg-white">
      <div className="flex items-end justify-between mb-2">
        <div>
          <div className="text-[9px] text-zinc-400">Total</div>
          <div className="text-[14px] font-bold text-zinc-900 tabular-nums tracking-tight">
            $48,250
          </div>
        </div>
        <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-zinc-700 bg-zinc-100 px-1.5 py-0.5 rounded">
          23 paid
        </span>
      </div>
      <div className="flex items-end gap-0.5 h-6">
        {[40, 60, 35, 70, 50, 80, 65, 90, 70, 55, 88, 75].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm bg-zinc-900 thumb-bar"
            style={{ height: `${h}%`, animationDelay: `${i * 0.08}s` }}
          />
        ))}
      </div>
    </div>
  );
}

function ThumbAudit() {
  return (
    <div className="card p-3 bg-white">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-6 h-6 rounded bg-indigo-50 text-indigo-600 grid place-items-center">
          <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
            <path d="M7 1l5 2.5v3.5c0 2.5-2 4-5 5-3-1-5-2.5-5-5V3.5L7 1Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
            <path d="M5 7l1.5 1.5L9 6" className="thumb-check" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <div className="flex-1">
          <div className="text-[10px] font-medium text-zinc-900">Q1 Report</div>
          <div className="text-[9px] text-zinc-400">Read-only · Hacken</div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-[9px] text-zinc-400">PDF</span>
        <span className="w-1 h-1 rounded-full bg-zinc-300" />
        <span className="text-[9px] text-zinc-400">CSV</span>
        <span className="w-1 h-1 rounded-full bg-zinc-300" />
        <span className="text-[9px] text-emerald-600 font-medium animate-soft-pulse">Ready</span>
      </div>
    </div>
  );
}
