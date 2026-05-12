export interface DocMeta {
  slug: string;
  file: string;
  title: string;
  description: string;
  group: string;
  order: number;
}

const DOCS: DocMeta[] = [
  {
    slug: "overview",
    file: "PROJECT_OVERVIEW.md",
    title: "Project Overview",
    description: "Background, value proposition, narrative user journey.",
    group: "Get started",
    order: 1,
  },
  {
    slug: "architecture",
    file: "FRONTEND_ARCHITECTURE.md",
    title: "Frontend Architecture",
    description: "Folder layout, routing, layouts, scanner pipeline.",
    group: "Get started",
    order: 2,
  },
  {
    slug: "setup",
    file: "SETUP_GUIDE.md",
    title: "Setup Guide",
    description: "Prerequisites, install, env, build & troubleshooting.",
    group: "Get started",
    order: 3,
  },
  {
    slug: "features",
    file: "FEATURES.md",
    title: "Features",
    description: "Each feature, its flow, the files behind it.",
    group: "Product",
    order: 4,
  },
  {
    slug: "components",
    file: "COMPONENTS.md",
    title: "Components",
    description: "Component inventory & how they relate.",
    group: "Product",
    order: 5,
  },
  {
    slug: "api-data-flow",
    file: "API_AND_DATA_FLOW.md",
    title: "API & Data Flow",
    description: "Internal API routes, external integrations, sequence diagrams.",
    group: "Engineering",
    order: 6,
  },
  {
    slug: "design-system",
    file: "DESIGN_SYSTEM.md",
    title: "Design System",
    description: "Color tokens, typography, layout, motion.",
    group: "Engineering",
    order: 7,
  },
  {
    slug: "development-notes",
    file: "DEVELOPMENT_NOTES.md",
    title: "Development Notes",
    description: "Conventions, recipes, improvement areas, known limits.",
    group: "Engineering",
    order: 8,
  },
];

export function getAllDocs(): DocMeta[] {
  return [...DOCS].sort((a, b) => a.order - b.order);
}

export function getDocBySlug(slug: string): DocMeta | undefined {
  return DOCS.find((d) => d.slug === slug);
}

export function groupedDocs(): Record<string, DocMeta[]> {
  const docs = getAllDocs();
  const groups: Record<string, DocMeta[]> = {};
  for (const d of docs) {
    if (!groups[d.group]) groups[d.group] = [];
    groups[d.group].push(d);
  }
  return groups;
}

export interface HeadingItem {
  depth: number;
  text: string;
  id: string;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function extractHeadings(markdown: string): HeadingItem[] {
  const lines = markdown.split("\n");
  const items: HeadingItem[] = [];
  let inCode = false;
  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      inCode = !inCode;
      continue;
    }
    if (inCode) continue;
    const m = /^(#{2,4})\s+(.+?)\s*$/.exec(line);
    if (m) {
      const depth = m[1].length;
      const text = m[2].replace(/[#`*_]/g, "").trim();
      items.push({ depth, text, id: slugify(text) });
    }
  }
  return items;
}
