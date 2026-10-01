import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

function runScanner(files: Record<string, string>) {
  const root = mkdtempSync(path.join(tmpdir(), "core-eve-data-boundary-"));
  try {
    const scanner = path.join(root, "scripts/verify/data-boundary-check.mjs");
    mkdirSync(path.dirname(scanner), { recursive: true });
    copyFileSync("scripts/verify/data-boundary-check.mjs", scanner);
    for (const [file, content] of Object.entries(files)) {
      const target = path.join(root, file);
      mkdirSync(path.dirname(target), { recursive: true });
      writeFileSync(target, content);
    }
    return spawnSync(process.execPath, [scanner], {
      cwd: root,
      encoding: "utf8",
    });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

describe("Eve generated output data-boundary scope", () => {
  it.each([
    "apps/admin/.eve/vercel-services/eve/.vercel/output/functions/server.func/index.mjs",
    "apps/admin/.vercel/output/functions/server.func/index.mjs",
  ])(
    "does not classify generated server output as authored app code: %s",
    (file) => {
      const result = runScanner({
        "apps/admin/app/page.tsx":
          "export default function Page() { return null; }",
        [file]:
          'import { createClient } from "@supabase/supabase-js";\nconst historicalMarker = "TWENTY_API_KEY";',
      });
      expect(result.status, result.stderr).toBe(0);
      expect(result.stdout).toContain("Data access boundary check passed");
    },
  );

  it.each([
    "apps/admin/app/example.ts",
    "apps/admin/.eve/authored.ts",
    "apps/admin/.vercel/authored.ts",
    "apps/donor/.eve/vercel-services/authored.ts",
  ])(
    "continues rejecting raw database imports outside the exact output paths: %s",
    (file) => {
      const result = runScanner({
        [file]: 'import { createClient } from "@supabase/supabase-js";',
      });
      expect(result.status).toBe(1);
      expect(result.stderr).toContain(file);
      expect(result.stderr).toContain(
        "Browser Supabase data-boundary violations",
      );
    },
  );

  it("continues rejecting retired CRM references in authored Eve runtime", () => {
    const result = runScanner({
      "apps/admin/app/page.tsx":
        "export default function Page() { return null; }",
      "packages/eve-runtime/src/authored.ts":
        'const forbidden = "TWENTY_API_KEY";',
    });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("packages/eve-runtime/src/authored.ts");
    expect(result.stderr).toContain("retired Twenty runtime reference");
  });
});
