"use client";

import { useMemo, useState } from "react";
import hljs from "highlight.js";

interface Props {
  code: string;
  language?: string;
}

const LABEL_MAP: Record<string, string> = {
  ts: "TypeScript",
  tsx: "TSX",
  typescript: "TypeScript",
  js: "JavaScript",
  jsx: "JSX",
  javascript: "JavaScript",
  bash: "Bash",
  sh: "Shell",
  shell: "Shell",
  zsh: "Zsh",
  json: "JSON",
  css: "CSS",
  scss: "SCSS",
  html: "HTML",
  env: "ENV",
  md: "Markdown",
  markdown: "Markdown",
  yaml: "YAML",
  yml: "YAML",
  toml: "TOML",
  text: "Text",
  txt: "Text",
  rust: "Rust",
  go: "Go",
  py: "Python",
  python: "Python",
  sql: "SQL",
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export default function CodeBlock({ code, language }: Props) {
  const [copied, setCopied] = useState(false);
  const label = language ? LABEL_MAP[language] ?? language.toUpperCase() : "TEXT";

  const lines = useMemo(() => {
    const raw = code.replace(/\n$/, "");
    const split = raw.split("\n");
    const langKnown = language && hljs.getLanguage(language) ? language : null;
    return split.map((line) => {
      if (!langKnown) return escapeHtml(line);
      try {
        return hljs.highlight(line, { language: langKnown, ignoreIllegals: true }).value;
      } catch {
        return escapeHtml(line);
      }
    });
  }, [code, language]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="code-block group">
      <header className="code-block-header">
        <div className="code-dots" aria-hidden>
          <span style={{ background: "#ff5f57" }} />
          <span style={{ background: "#febc2e" }} />
          <span style={{ background: "#28c840" }} />
        </div>
        <span className="code-lang">{label}</span>
        <button
          onClick={handleCopy}
          className="code-copy press"
          aria-label="Copy code"
          type="button"
        >
          {copied ? (
            <>
              <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                <path
                  d="M3 7l3 3 5-6"
                  stroke="#34d399"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span style={{ color: "#34d399" }}>Copied</span>
            </>
          ) : (
            <>
              <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                <rect
                  x="4"
                  y="4"
                  width="8"
                  height="9"
                  rx="1.5"
                  stroke="currentColor"
                  strokeWidth="1.3"
                />
                <path
                  d="M2 9V2.5A1.5 1.5 0 0 1 3.5 1H10"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
              </svg>
              Copy
            </>
          )}
        </button>
      </header>

      <div className="code-block-body">
        <pre>
          <code className={`hljs language-${language ?? "text"}`}>
            {lines.map((html, i) => (
              <span key={i} className="code-line">
                <span className="code-line-num" aria-hidden>
                  {i + 1}
                </span>
                <span
                  className="code-line-content"
                  dangerouslySetInnerHTML={{ __html: html === "" ? "&nbsp;" : html }}
                />
              </span>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}
