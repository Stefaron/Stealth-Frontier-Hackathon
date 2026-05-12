import Link from "next/link";
import Image from "next/image";
import Topbar from "@/components/Topbar";
import { groupedDocs, getAllDocs } from "@/lib/docs-meta";

export default function Home() {
  const groups = groupedDocs();
  const docs = getAllDocs();

  return (
    <>
      <Topbar />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-zinc-100">
        <div aria-hidden className="absolute inset-0 -z-10 hero-gradient" />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-dot-grid opacity-40"
          style={{
            maskImage:
              "radial-gradient(ellipse 70% 80% at 50% 0%, black, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 70% 80% at 50% 0%, black, transparent 75%)",
          }}
        />
        <div className="max-w-[1100px] mx-auto px-5 md:px-8 pt-24 pb-16 md:pt-32 md:pb-24">
          <div className="flex items-center gap-2 mb-6">
            <span className="eyebrow">
              <span className="eyebrow-dot" />
              Documentation · v1.0
            </span>
            <span className="text-[11.5px] text-zinc-500 hidden sm:inline">
              Updated 2026-05-12
            </span>
          </div>

          <div className="flex items-center gap-4 mb-3">
            <Image
              src="/stealth_logo.png"
              alt="Stealth"
              width={56}
              height={56}
              className="rounded-2xl"
            />
            <h1
              className="font-bold text-zinc-900 tracking-tight"
              style={{
                fontSize: "clamp(2.25rem, 5vw, 3.75rem)",
                lineHeight: 1.02,
                letterSpacing: "-0.028em",
              }}
            >
              Stealth Docs
            </h1>
          </div>

          <p
            className="font-serif italic text-zinc-500 mt-2 mb-7"
            style={{ fontSize: "clamp(1.05rem, 2vw, 1.4rem)", lineHeight: 1.35 }}
          >
            Encrypted by default. Auditable on demand.
          </p>

          <p className="max-w-2xl text-[15.5px] md:text-[17px] text-zinc-600 leading-relaxed">
            The official documentation for{" "}
            <strong className="text-zinc-900">Stealth</strong> — private payroll
            for modern DAOs on Solana, built on the{" "}
            <a
              href="https://sdk.umbraprivacy.com/introduction"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-700 underline decoration-indigo-300 underline-offset-4"
            >
              Umbra SDK
            </a>
            . Every page is grounded in the live source code — no feature appears
            here that doesn&apos;t exist in the codebase.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/docs/overview"
              className="press inline-flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white text-[13.5px] font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              Start with Overview
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path
                  d="M2 12L12 2M12 2H5M12 2V9"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <Link
              href="/docs/setup"
              className="press inline-flex items-center gap-2 bg-white hover:bg-zinc-50 text-zinc-900 text-[13.5px] font-semibold px-5 py-2.5 rounded-xl border border-zinc-200 transition-colors"
            >
              Setup Guide
            </Link>
            <a
              href="https://github.com/Stefaron/Stealth-Frontier-Hackathon"
              target="_blank"
              rel="noopener noreferrer"
              className="press inline-flex items-center gap-2 text-[13px] font-medium text-zinc-500 hover:text-zinc-900 px-3 py-2.5 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
              </svg>
              Repository
            </a>
          </div>

          {/* badges */}
          <div className="mt-10 flex flex-wrap items-center gap-2">
            <Badge label="Next.js 16.2.4" />
            <Badge label="React 19" />
            <Badge label="Tailwind v4" />
            <Badge label="TypeScript strict" />
            <Badge label="Solana devnet" />
            <Badge label="Umbra SDK v4" />
          </div>
        </div>
      </section>

      {/* ── Stats / quick facts ──────────────────────────────── */}
      <section className="border-b border-zinc-100">
        <div className="max-w-[1100px] mx-auto px-5 md:px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          <Fact value={`${docs.length}`} label="Documents" />
          <Fact value="3" label="User roles" />
          <Fact value="6" label="Diagrams" />
          <Fact value="0" label="App database" />
        </div>
      </section>

      {/* ── Docs grouped ─────────────────────────────────────── */}
      <section className="max-w-[1100px] mx-auto px-5 md:px-8 py-16 md:py-20">
        <div className="mb-10">
          <span className="eyebrow mb-3">
            <span className="eyebrow-dot" />
            Sections
          </span>
          <h2
            className="mt-3 text-3xl md:text-4xl font-bold text-zinc-900 tracking-tight"
            style={{ letterSpacing: "-0.02em" }}
          >
            Explore the documentation
          </h2>
          <p className="mt-2 text-[14.5px] text-zinc-500 max-w-xl">
            Organized in three tracks — start here, dive into product, then move
            into engineering detail.
          </p>
        </div>

        {Object.entries(groups).map(([groupName, items]) => (
          <div key={groupName} className="mb-12 last:mb-0">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-400 font-mono mb-4">
              {groupName}
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((d) => (
                <Link
                  key={d.slug}
                  href={`/docs/${d.slug}`}
                  className="group card card-hover p-5 flex flex-col"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-9 h-9 rounded-xl bg-zinc-50 group-hover:bg-zinc-900 group-hover:text-white text-zinc-700 grid place-items-center transition-colors duration-300">
                      <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                        <path
                          d="M10 2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7L10 2Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M10 2v5h5M6 11h4M6 13h6"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      className="text-zinc-300 group-hover:text-zinc-900 group-hover:translate-x-1 transition-all duration-300"
                    >
                      <path
                        d="M5 3l4 4-4 4"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <h4 className="text-[15px] font-semibold text-zinc-900 tracking-tight mb-1">
                    {d.title}
                  </h4>
                  <p className="text-[12.5px] text-zinc-500 leading-relaxed">
                    {d.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-zinc-100 mt-0">
        <div className="max-w-[1100px] mx-auto px-5 md:px-8 py-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Image
              src="/stealth_logo.png"
              alt="Stealth"
              width={20}
              height={20}
              className="rounded-[6px]"
            />
            <span className="text-[12.5px] text-zinc-500">
              Stealth · Private by default · Auditable on demand
            </span>
          </div>
          <div className="flex items-center gap-4 text-[12px] text-zinc-500">
            <a
              href="https://sdk.umbraprivacy.com/introduction"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-900 transition-colors"
            >
              Umbra SDK
            </a>
            <a
              href="https://solana.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-900 transition-colors"
            >
              Solana
            </a>
            <a
              href="https://github.com/Stefaron/Stealth-Frontier-Hackathon"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-900 transition-colors"
            >
              Repository
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-white border border-zinc-200 text-[11.5px] font-mono text-zinc-600">
      {label}
    </span>
  );
}

function Fact({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-3xl md:text-4xl font-bold text-zinc-900 tracking-tight tabular-nums">
        {value}
      </div>
      <div className="text-[12.5px] font-mono uppercase tracking-wider text-zinc-500 mt-1">
        {label}
      </div>
    </div>
  );
}
