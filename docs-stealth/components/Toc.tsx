"use client";

import { useEffect, useState } from "react";
import type { HeadingItem } from "@/lib/docs-meta";

interface TocProps {
  items: HeadingItem[];
}

export default function Toc({ items }: TocProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-80px 0px -70% 0px",
        threshold: [0, 1],
      }
    );
    items.forEach((it) => {
      const el = document.getElementById(it.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <aside className="docs-toc w-[220px] flex-shrink-0 sticky top-[60px] self-start h-[calc(100vh-60px)] overflow-y-auto py-10 pl-5 pr-4">
      <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-zinc-400 font-mono mb-3">
        On this page
      </p>
      <nav>
        {items.map((it) => (
          <a
            key={it.id}
            href={`#${it.id}`}
            className={`toc-link depth-${it.depth} ${activeId === it.id ? "active" : ""}`}
          >
            {it.text}
          </a>
        ))}
      </nav>
    </aside>
  );
}
