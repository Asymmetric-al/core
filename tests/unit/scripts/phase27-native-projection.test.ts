import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

import { expect, it } from "vitest";

it.each([
  ["27", "donor-development"],
  ["28", "missionary-workspace-depth"],
])(
  "checks the canonical phase %s contract projection on the native platform without rewriting it",
  (phase, capability) => {
    const projection = `openspec/changes/add-${capability}/specs/${capability}/spec.md`;
    const before = readFileSync(projection);
    const result = spawnSync(
      "bun",
      [
        `docs/prds/sitestacker-parity/phase-${phase}-${capability}/tools/render-spec.mjs`,
        "--check",
      ],
      { encoding: "utf8", timeout: 30_000, windowsHide: true },
    );

    expect(readFileSync(projection)).toEqual(before);
    expect(result.error).toBeUndefined();
    expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0);
    expect(JSON.parse(result.stdout)).toMatchObject({ mode: "check" });
  },
  35_000,
);
