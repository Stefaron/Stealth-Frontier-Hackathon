"use client";

import { useEffect, useRef, useState } from "react";

interface MermaidProps {
  chart: string;
}

function cleanupOrphans(renderId?: string): void {
  if (typeof document === "undefined") return;
  try {
    document.body
      .querySelectorAll<HTMLElement>(
        ":scope > svg[aria-roledescription='error'], :scope > svg[role='graphics-document document'][aria-roledescription='error']"
      )
      .forEach((n) => n.remove());

    document
      .querySelectorAll<HTMLElement>(
        "body > svg[id^='mermaid-'], body > div[id^='dmermaid'], body > div[id^='mermaid-temp']"
      )
      .forEach((n) => n.remove());

    if (renderId) {
      document.querySelectorAll<HTMLElement>(`#${renderId}`).forEach((n) => {
        if (n.parentElement === document.body) n.remove();
      });
    }
  } catch {
    /* ignore */
  }
}

function stripInitDirective(src: string): string {
  return src.replace(/^%%\{[\s\S]*?\}%%\s*/, "").trim();
}

export default function Mermaid({ chart }: MermaidProps) {
  const idRef = useRef(`m${Math.random().toString(36).slice(2, 11)}`);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const renderId = idRef.current;

    cleanupOrphans();

    (async () => {
      try {
        const mod = await import("mermaid");
        const mermaid = mod.default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "base",
          themeVariables: {
            primaryColor: "#eef2ff",
            primaryBorderColor: "#6366f1",
            primaryTextColor: "#0b0d12",
            lineColor: "#9ca3af",
            secondaryColor: "#f4f4f6",
            tertiaryColor: "#fafafa",
            background: "#ffffff",
            mainBkg: "#ffffff",
            nodeBorder: "#d4d4d8",
            clusterBkg: "#fafafa",
            clusterBorder: "#e7e7ea",
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontSize: "13px",
          },
          flowchart: { curve: "basis", padding: 16 },
          sequence: { useMaxWidth: true },
          securityLevel: "loose",
          suppressErrorRendering: true,
        });

        const cleanChart = stripInitDirective(chart);

        const valid = await mermaid
          .parse(cleanChart, { suppressErrors: true })
          .catch(() => false);
        if (!valid) throw new Error("Mermaid syntax invalid");

        const { svg: rendered } = await mermaid.render(renderId, cleanChart);
        if (cancelled) return;
        setSvg(rendered);
        cleanupOrphans(renderId);
      } catch (e) {
        cleanupOrphans(renderId);
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Render failed");
        }
      }
    })();

    return () => {
      cancelled = true;
      cleanupOrphans(renderId);
    };
  }, [chart]);

  if (error) {
    return (
      <div
        className="mermaid-wrap"
        style={{ borderColor: "#fecaca", background: "#fef2f2" }}
      >
        <p className="text-[12.5px] text-red-700 font-mono mb-2">
          Diagram failed to render: {error}
        </p>
        <pre className="text-[11.5px] text-red-900 whitespace-pre-wrap overflow-x-auto">
          {chart}
        </pre>
      </div>
    );
  }

  return (
    <div
      className="mermaid-wrap"
      dangerouslySetInnerHTML={{
        __html:
          svg ||
          '<div style="opacity:.4;font-size:13px;padding:8px">Rendering diagram…</div>',
      }}
    />
  );
}
