import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const MIGRATION = readFileSync(
  "supabase/migrations/20261127035000_wp2c_rest_operator_reads.sql",
  "utf8",
);

function downParagraph(sql: string): string {
  const lines = sql.split("\n");
  const start = lines.findIndex((line) => /^-- Down\b/.test(line));
  expect(start, "the header has a Down paragraph").toBeGreaterThan(-1);
  const out: string[] = [];
  for (const line of lines.slice(start)) {
    if (!line.startsWith("--")) break;
    out.push(line.replace(/^--\s?/, ""));
  }
  return out.join(" ").replace(/\s+/g, " ").trim();
}

describe("AL-2675 WP2c rest, F3 (review of #2855): the operator reads' Down", () => {
  it("drops the four functions and ends with the Data API's schema reload, as the newest migrations' Downs do", () => {
    const down = downParagraph(MIGRATION);
    for (const fn of [
      "public.platform_eve_history(integer)",
      "platform.eve_history(integer)",
      "public.tenant_operators(uuid)",
      "platform.tenant_operators(uuid)",
    ])
      expect(down).toContain(fn);
    expect(down).toMatch(/NOTIFY pgrst, 'reload schema';$/);
  });
});
