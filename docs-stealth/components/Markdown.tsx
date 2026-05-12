"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import Mermaid from "./Mermaid";
import CodeBlock from "./CodeBlock";
import type { ComponentProps, ReactElement } from "react";

interface MarkdownProps {
  source: string;
}

export default function Markdown({ source }: MarkdownProps) {
  return (
    <div className="prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            {
              behavior: "append",
              properties: { className: ["anchor-link"], "aria-label": "Anchor" },
              content: { type: "text", value: "#" },
            },
          ],
        ]}
        components={{
          pre({ children }) {
            // Pass-through — CodeBlock provides its own <pre>
            const child = Array.isArray(children) ? children[0] : children;
            if (!child || typeof child !== "object") {
              return <pre>{children}</pre>;
            }
            const el = child as ReactElement<{ className?: string; children?: unknown }>;
            const className: string = el.props?.className ?? "";
            const match = /language-(\w+)/.exec(className);
            const lang = match?.[1];
            const value = String(el.props?.children ?? "").replace(/\n$/, "");
            if (lang === "mermaid") return <Mermaid chart={value} />;
            if (lang) return <CodeBlock code={value} language={lang} />;
            return <CodeBlock code={value} />;
          },
          code({
            className,
            children,
            ...rest
          }: ComponentProps<"code"> & { inline?: boolean }) {
            // Inline code (no language class)
            if (!className) {
              return (
                <code className={className} {...rest}>
                  {children}
                </code>
              );
            }
            // Fenced code is handled by `pre` override above; this branch
            // still returns the raw <code> in case it's used directly.
            return (
              <code className={className} {...rest}>
                {children}
              </code>
            );
          },
          a({ href, children, ...rest }) {
            const isExternal = !!href && /^https?:\/\//.test(href);
            const rewritten = rewriteDocLink(href);
            return (
              <a
                href={rewritten}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                {...rest}
              >
                {children}
              </a>
            );
          },
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}

function rewriteDocLink(href?: string): string | undefined {
  if (!href) return href;
  const map: Record<string, string> = {
    "./README.md": "/",
    "./PROJECT_OVERVIEW.md": "/docs/overview",
    "./FRONTEND_ARCHITECTURE.md": "/docs/architecture",
    "./SETUP_GUIDE.md": "/docs/setup",
    "./FEATURES.md": "/docs/features",
    "./COMPONENTS.md": "/docs/components",
    "./API_AND_DATA_FLOW.md": "/docs/api-data-flow",
    "./DESIGN_SYSTEM.md": "/docs/design-system",
    "./DEVELOPMENT_NOTES.md": "/docs/development-notes",
  };
  if (map[href]) return map[href];
  if (href === "../README.md")
    return "https://github.com/Stefaron/Stealth-Frontier-Hackathon";
  if (href.startsWith("../stealth-fe/public/")) {
    return "/" + href.replace("../stealth-fe/public/", "");
  }
  return href;
}
