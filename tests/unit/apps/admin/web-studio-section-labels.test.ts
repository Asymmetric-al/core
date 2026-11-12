import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { WEB_STUDIO_COLLECTION_CONFIGS } from "../../../../apps/admin/src/cms-ui/web-studio/collections/config";

const studioDir = path.join(process.cwd(), "apps/admin/src/cms-ui/web-studio");

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    return /\.tsx?$/.test(name) ? [full] : [];
  });
}

/** Sentence case: only the first word starts with a capital letter. */
function isSentenceCase(label: string): boolean {
  return label
    .split(/\s+/)
    .slice(1)
    .every((word) => !/^[A-Z][a-z]/.test(word));
}

describe("Web Studio breadcrumb section labels", () => {
  it("are sentence case in every collection config", () => {
    for (const config of Object.values(WEB_STUDIO_COLLECTION_CONFIGS)) {
      expect(isSentenceCase(config.sectionLabel), config.sectionLabel).toBe(
        true,
      );
    }
  });

  it("are sentence case wherever a screen writes one out", () => {
    const literals = sourceFiles(studioDir).flatMap((file) =>
      [
        ...readFileSync(file, "utf8").matchAll(
          /sectionLabel=["']([^"']+)["']/g,
        ),
      ].map((match) => ({
        file: path.relative(studioDir, file),
        label: match[1]!,
      })),
    );
    expect(literals.length).toBeGreaterThan(0);
    expect(literals.filter(({ label }) => !isSentenceCase(label))).toEqual([]);
  });
});
