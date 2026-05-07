import Link from "next/link";
import Reveal from "./Reveal";

export default function CtaSection() {
  return (
    <section className="cv-section relative py-24 md:py-32 px-5 md:px-8">
      <div className="max-w-4xl mx-auto">
        <Reveal y={16}>
          <div
            className="relative overflow-hidden rounded-[20px] border border-zinc-200 bg-white text-center px-7 py-14 md:px-12 md:py-16"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full"
              style={{
                background:
                  "radial-gradient(closest-side, rgba(99,102,241,0.10), transparent 70%)",
              }}
            />
            <div className="relative">
              <h2
                className="font-bold text-zinc-900 tracking-tight"
                style={{
                  fontSize: "clamp(2rem, 3.8vw, 2.75rem)",
                  lineHeight: 1.02,
                  letterSpacing: "-0.025em",
                }}
              >
                Start paying privately.
              </h2>
              <p className="mt-4 text-[14.5px] text-zinc-500 max-w-md mx-auto">
                Connect, upload, send. Setup takes under a minute. Free on devnet.
              </p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
                <Link href="/welcome" className="btn-primary press">
                  Launch app
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                    <path d="M2 12L12 2M12 2H5M12 2V9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                  </svg>
                </Link>
                <a href="#how-it-works" className="btn-secondary press">
                  How it works
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
