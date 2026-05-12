"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { groupedDocs } from "@/lib/docs-meta";

type IconName =
  | "home"
  | "compass"
  | "layers"
  | "terminal"
  | "sparkles"
  | "blocks"
  | "share"
  | "palette"
  | "wrench";

const SLUG_ICON: Record<string, IconName> = {
  overview: "compass",
  architecture: "layers",
  setup: "terminal",
  features: "sparkles",
  components: "blocks",
  "api-data-flow": "share",
  "design-system": "palette",
  "development-notes": "wrench",
};

const GROUP_ICON: Record<string, IconName> = {
  "Get started": "compass",
  Product: "sparkles",
  Engineering: "wrench",
};

function Icon({ name, className }: { name: IconName; className?: string }) {
  const s = 14;
  const common = {
    width: s,
    height: s,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
  };
  switch (name) {
    case "home":
      return (
        <svg {...common}>
          <path d="M3 11l9-8 9 8" />
          <path d="M5 10v10h14V10" />
        </svg>
      );
    case "compass":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M15.5 8.5l-2 5.5-5.5 2 2-5.5z" />
        </svg>
      );
    case "layers":
      return (
        <svg {...common}>
          <path d="M12 3l9 5-9 5-9-5z" />
          <path d="M3 13l9 5 9-5" />
          <path d="M3 17l9 5 9-5" />
        </svg>
      );
    case "terminal":
      return (
        <svg {...common}>
          <path d="M4 17l5-5-5-5" />
          <path d="M11 19h9" />
        </svg>
      );
    case "sparkles":
      return (
        <svg {...common}>
          <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z" />
          <path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z" />
        </svg>
      );
    case "blocks":
      return (
        <svg {...common}>
          <rect x="4" y="4" width="7" height="7" rx="1.2" />
          <rect x="13" y="4" width="7" height="7" rx="1.2" />
          <rect x="4" y="13" width="7" height="7" rx="1.2" />
          <rect x="13" y="13" width="7" height="7" rx="1.2" />
        </svg>
      );
    case "share":
      return (
        <svg {...common}>
          <circle cx="6" cy="12" r="2.5" />
          <circle cx="18" cy="5" r="2.5" />
          <circle cx="18" cy="19" r="2.5" />
          <path d="M8.2 10.8l7.6-4.6M8.2 13.2l7.6 4.6" />
        </svg>
      );
    case "palette":
      return (
        <svg {...common}>
          <path d="M12 3a9 9 0 1 0 0 18c1.1 0 2-.9 2-2 0-.6-.2-1.1-.6-1.5-.4-.4-.6-.9-.6-1.5 0-1.1.9-2 2-2H17a4 4 0 0 0 4-4c0-3.9-4-7-9-7z" />
          <circle cx="7.5" cy="10.5" r="1" />
          <circle cx="11" cy="7" r="1" />
          <circle cx="15.5" cy="9" r="1" />
        </svg>
      );
    case "wrench":
      return (
        <svg {...common}>
          <path d="M14.7 6.3a4 4 0 0 0-4.7 5.3L3.4 18.2a2 2 0 0 0 2.8 2.8l6.6-6.6a4 4 0 0 0 5.3-4.7l-2.5 2.5-2.8-2.8z" />
        </svg>
      );
  }
}

export default function Sidebar() {
  const pathname = usePathname();
  const groups = groupedDocs();
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const matches = (text: string) => !q || text.toLowerCase().includes(q);

  return (
    <aside className="docs-sidebar w-[268px] flex-shrink-0 sticky top-[60px] self-start h-[calc(100vh-60px)] overflow-y-auto py-7 pr-4">
      {/* ── Search ──────────────────────────────────────── */}
      <div className="relative mb-6 px-1">
        <svg
          aria-hidden
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter pages…"
          className="w-full bg-zinc-50/70 hover:bg-zinc-100/70 focus:bg-white border border-zinc-200 focus:border-indigo-300 rounded-lg pl-8 pr-7 py-2 text-[12.5px] text-zinc-900 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-indigo-100 transition"
        />
        <kbd className="hidden md:inline-flex absolute right-2.5 top-1/2 -translate-y-1/2 text-[9.5px] font-mono font-semibold text-zinc-400 bg-white border border-zinc-200 rounded-md px-1.5 py-0.5 pointer-events-none">
          /
        </kbd>
      </div>

      {/* ── Home ────────────────────────────────────────── */}
      <Link
        href="/"
        className={`nav-link ${pathname === "/" ? "active" : ""}`}
      >
        <span className="nav-icon">
          <Icon name="home" />
        </span>
        <span>Home</span>
      </Link>

      {/* ── Groups ──────────────────────────────────────── */}
      {Object.entries(groups).map(([groupName, docs]) => {
        const visible = docs.filter((d) =>
          matches(d.title) || matches(d.description) || matches(groupName)
        );
        if (visible.length === 0) return null;
        return (
          <section key={groupName} className="nav-section">
            <div className="nav-group">
              <span className="nav-group-icon">
                <Icon name={GROUP_ICON[groupName] ?? "compass"} />
              </span>
              <span className="nav-group-text">{groupName}</span>
              <span className="nav-group-count">{visible.length}</span>
            </div>
            <div className="nav-section-items">
              {visible.map((d) => {
                const href = `/docs/${d.slug}`;
                const active = pathname === href;
                return (
                  <Link
                    key={d.slug}
                    href={href}
                    className={`nav-link ${active ? "active" : ""}`}
                  >
                    <span className="nav-icon">
                      <Icon name={SLUG_ICON[d.slug] ?? "compass"} />
                    </span>
                    <span className="nav-link-text">
                      <span className="nav-link-title">{d.title}</span>
                    </span>
                    {active && (
                      <span aria-hidden className="nav-active-dot" />
                    )}
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* ── Footer block ────────────────────────────────── */}
      <div className="mt-8 mx-1">
        <div className="rounded-xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-white p-3.5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-soft-pulse" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-zinc-500">
              Devnet · v1.0
            </span>
          </div>
          <p className="text-[11.5px] text-zinc-500 leading-relaxed">
            Private by default.
            <br />
            Auditable on demand.
          </p>
          <a
            href="https://github.com/Stefaron/Stealth-Frontier-Hackathon"
            target="_blank"
            rel="noopener noreferrer"
            className="press mt-3 inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-zinc-700 hover:text-indigo-600 transition-colors"
          >
            View on GitHub
            <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
              <path
                d="M4 2h8v8M12 2L3 11"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </div>
    </aside>
  );
}
