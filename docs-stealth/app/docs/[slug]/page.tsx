import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getAllDocs,
  getDocBySlug,
  readDocSource,
  extractHeadings,
} from "@/lib/docs";
import Topbar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";
import Markdown from "@/components/Markdown";
import Toc from "@/components/Toc";

export function generateStaticParams() {
  return getAllDocs().map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = getDocBySlug(slug);
  if (!doc) return { title: "Not found · Stealth Docs" };
  return {
    title: `${doc.title} · Stealth Docs`,
    description: doc.description,
  };
}

export default async function DocPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = getDocBySlug(slug);
  if (!doc) notFound();

  const source = readDocSource(doc.file);
  const headings = extractHeadings(source);

  // Prev / next navigation
  const all = getAllDocs();
  const idx = all.findIndex((d) => d.slug === slug);
  const prev = idx > 0 ? all[idx - 1] : null;
  const next = idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null;

  return (
    <>
      <Topbar />

      <div className="max-w-[1400px] mx-auto px-5 md:px-8">
        <div className="flex gap-8">
          <Sidebar />

          <main className="flex-1 min-w-0 py-10 md:py-12 max-w-3xl">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-[12px] font-mono text-zinc-400 mb-5">
              <Link href="/" className="hover:text-zinc-700 transition-colors">
                Docs
              </Link>
              <span>/</span>
              <span className="text-zinc-500">{doc.group}</span>
              <span>/</span>
              <span className="text-zinc-700">{doc.title}</span>
            </div>

            {/* Content */}
            <article>
              <Markdown source={source} />
            </article>

            {/* Prev / Next */}
            <div className="mt-16 pt-8 border-t border-zinc-100 grid grid-cols-2 gap-4">
              {prev ? (
                <Link
                  href={`/docs/${prev.slug}`}
                  className="group card card-hover p-4 flex flex-col"
                >
                  <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                    ← Previous
                  </span>
                  <span className="text-[14px] font-semibold text-zinc-900 group-hover:text-indigo-600 transition-colors">
                    {prev.title}
                  </span>
                </Link>
              ) : (
                <div />
              )}
              {next ? (
                <Link
                  href={`/docs/${next.slug}`}
                  className="group card card-hover p-4 flex flex-col text-right"
                >
                  <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                    Next →
                  </span>
                  <span className="text-[14px] font-semibold text-zinc-900 group-hover:text-indigo-600 transition-colors">
                    {next.title}
                  </span>
                </Link>
              ) : (
                <div />
              )}
            </div>

            {/* Edit on GitHub */}
            <div className="mt-10 pt-6 flex items-center justify-between text-[12px] text-zinc-500">
              <span>
                Source: <code className="font-mono">docs-stealth/{doc.file}</code>
              </span>
              <a
                href={`https://github.com/Stefaron/Stealth-Frontier-Hackathon/blob/main/docs-stealth/${doc.file}`}
                target="_blank"
                rel="noopener noreferrer"
                className="press hover:text-zinc-900 transition-colors inline-flex items-center gap-1"
              >
                Edit on GitHub
                <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M4 2h8v8M12 2L3 11"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </div>
          </main>

          <Toc items={headings} />
        </div>
      </div>
    </>
  );
}
