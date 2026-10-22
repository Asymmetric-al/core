import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { expect, it } from "vitest";

const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));

it("compiles collection block references without generated Payload augmentation", () => {
  const scratch = mkdtempSync(
    path.join(tmpdir(), "core-payload-type-boundary-"),
  );
  const source = path.join(
    repoRoot,
    "apps/admin/src/cms/collections/missionary-giving-pages.ts",
  );
  const sourceBefore = readFileSync(source);
  try {
    const config = path.join(scratch, "tsconfig.json");
    writeFileSync(
      config,
      JSON.stringify({
        extends: path.join(repoRoot, "apps/admin/tsconfig.json"),
        include: [path.join(repoRoot, "apps/admin/next-env.d.ts"), source],
        exclude: [path.join(repoRoot, "apps/admin/payload-types.ts")],
        compilerOptions: { incremental: false },
      }),
    );
    const result = spawnSync(
      "bun",
      ["run", "--cwd", "apps/admin", "tsc", "--noEmit", "--project", config],
      { cwd: repoRoot, encoding: "utf8", shell: false, timeout: 15_000 },
    );
    expect(result.error).toBeUndefined();
    expect(result.status, `${result.stdout}${result.stderr}`).toBe(0);
    expect(readFileSync(source)).toEqual(sourceBefore);
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}, 20_000);
