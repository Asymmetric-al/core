import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();

const globalBoundaryFiles = [
  "apps/admin/app/global-error.tsx",
  "apps/admin/app/global-not-found.tsx",
  "apps/donor/app/global-error.tsx",
  "apps/donor/app/global-not-found.tsx",
  "apps/missionary/app/global-error.tsx",
  "apps/missionary/app/global-not-found.tsx",
];

describe("global app boundaries", () => {
  it.each(globalBoundaryFiles)(
    "%s imports local global styles and renders complete document markup",
    (filePath) => {
      const source = fs.readFileSync(path.join(repoRoot, filePath), "utf8");

      expect(source).toContain('import "./globals.css";');
      expect(source).toContain("<html");
      expect(source).toContain("<body");
    },
  );
});
