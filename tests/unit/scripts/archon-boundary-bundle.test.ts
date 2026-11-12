// Archon runs the pack's trusted scripts with bun. A syntax error in a shared
// module breaks every script that imports it (executor.mjs once broke
// claim.ts and record.ts this way), so every script must bundle.
import { execFileSync, spawnSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  readdirSync,
  realpathSync,
  rmSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, expect, it } from "vitest";

const pack = fileURLToPath(
  new URL("../../../scripts/archon-factory/pack", import.meta.url),
);
const bun =
  process.platform === "win32"
    ? execFileSync("where.exe", ["bun"], { encoding: "utf8" })
        .trim()
        .split(/\r?\n/)[0]
    : execFileSync("which", ["bun"], { encoding: "utf8" }).trim();

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0))
    rmSync(root, { recursive: true, force: true });
});

const scripts = () =>
  readdirSync(pack, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .flatMap((workflow) => {
      const dir = path.join(pack, workflow.name, "scripts");
      return existsSync(dir)
        ? readdirSync(dir)
            .filter((name) => name.endsWith(".ts"))
            .map((name) => `${workflow.name}/scripts/${name}`)
        : [];
    })
    .sort();

it("bundles every trusted pack script with bun, including claim, record, freeze and context", () => {
  const out = realpathSync(
    mkdtempSync(path.join(os.tmpdir(), "archon-boundary-bundle-")),
  );
  roots.push(out);
  const entries = scripts();

  const built = spawnSync(
    bun,
    [
      "build",
      "--target=bun",
      `--outdir=${out}`,
      "--root",
      pack,
      ...entries.map((entry) => path.join(pack, entry)),
    ],
    { encoding: "utf8", timeout: 60_000 },
  );

  expect({
    status: built.status,
    stderr: built.status === 0 ? "" : built.stderr,
    named: [
      "deliver/scripts/claim.ts",
      "deliver/scripts/record.ts",
      "deliver/scripts/freeze.ts",
      "deliver/scripts/context.ts",
    ].every((entry) => entries.includes(entry)),
    missing: entries.filter(
      (entry) => !existsSync(path.join(out, entry.replace(/\.ts$/, ".js"))),
    ),
  }).toEqual({ status: 0, stderr: "", named: true, missing: [] });
});
