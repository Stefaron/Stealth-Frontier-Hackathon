import "server-only";
import fs from "fs";
import path from "path";

export function readDocSource(file: string): string {
  const fp = path.join(process.cwd(), file);
  return fs.readFileSync(fp, "utf-8");
}

export * from "./docs-meta";
