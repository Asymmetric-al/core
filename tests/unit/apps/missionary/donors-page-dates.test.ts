import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { parseDisplayDate } from "../../../../apps/missionary/app/donors/donors-page-dates";

const repoRoot = fileURLToPath(new URL("../../../../", import.meta.url));

describe("parseDisplayDate", () => {
  it("parses timestamps as instants and Date values as copies", () => {
    expect(parseDisplayDate("2026-07-01T00:00:00.000Z").toISOString()).toBe(
      "2026-07-01T00:00:00.000Z",
    );

    const original = new Date("2026-07-01T12:00:00.000Z");
    const copied = parseDisplayDate(original);
    expect(copied.toISOString()).toBe(original.toISOString());
    expect(copied).not.toBe(original);
  });

  it("parses YYYY-MM-DD as a local calendar date in America/Los_Angeles", () => {
    const result = spawnSync(
      process.execPath,
      [
        "-e",
        `import { parseDisplayDate } from ${JSON.stringify(`${repoRoot}apps/missionary/app/donors/donors-page-dates.ts`)};
const d = parseDisplayDate("2026-07-01");
process.stdout.write(JSON.stringify({ y: d.getFullYear(), m: d.getMonth() + 1, day: d.getDate() }));`,
      ],
      {
        cwd: repoRoot,
        encoding: "utf8",
        env: { ...process.env, TZ: "America/Los_Angeles" },
      },
    );

    expect(result.status, result.stderr).toBe(0);
    expect(JSON.parse(result.stdout)).toEqual({ y: 2026, m: 7, day: 1 });
  });
});
