/**
 * #2419 acceptance (owned by Acceptance), static part: criteria C1 (no anon
 * reference in the script) and C6–C7 (service-role allowlist entry matches the
 * script's real key sites; the gate passes). Behaviour is in
 * ./script.acceptance.test.ts.
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { ROOT, SCRIPT, SCRIPT_REL } from "./harness";

const ALLOWLIST = path.join(
  ROOT,
  "docs/security/service-role-client-allowlist.json",
);
const source = () => readFileSync(SCRIPT, "utf8");

/**
 * Real key sites, by the gate's documented rule (#2253): every word-bounded
 * `SUPABASE_SERVICE_ROLE_KEY` or bare `SERVICE_ROLE_KEY` occurrence in the
 * file text, one site per occurrence, at its 1-based line.
 */
const keySiteLines = (text: string) =>
  [
    ...text.matchAll(
      /(?<![A-Za-z0-9_])(SUPABASE_)?SERVICE_ROLE_KEY(?![A-Za-z0-9_])/g,
    ),
  ].map((m) => text.slice(0, m.index).split("\n").length);

type Entry = { file: string; kind: string; count: number; lines: number[] };
const entry = () => {
  const doc = JSON.parse(readFileSync(ALLOWLIST, "utf8")) as {
    entries: Entry[];
  };
  const matches = doc.entries.filter(
    (e) => e.file === SCRIPT_REL && e.kind === "service_role_key",
  );
  expect(matches, "exactly one verify-money-units entry").toHaveLength(1);
  return matches[0]!;
};

describe("#2419 static contract", () => {
  it("C1: the script has no NEXT_PUBLIC_SUPABASE_ANON_KEY reference", () => {
    expect(
      source()
        .split("\n")
        .flatMap((l, i) =>
          l.includes("NEXT_PUBLIC_SUPABASE_ANON_KEY") ? [`${i + 1}: ${l}`] : [],
        ),
    ).toEqual([]);
  });
  it("C6 self-check: the site rule finds the three base sites in a base-shaped text", () => {
    const base = [
      "const a = process.env.NEXT_PUBLIC_SUPABASE_URL;",
      "const b = process.env.SUPABASE_SERVICE_ROLE_KEY;",
      "// MY_SUPABASE_SERVICE_ROLE_KEY_X is not a site",
      '"Set SUPABASE_SERVICE_ROLE_KEY (preferred)", SERVICE_ROLE_KEY',
    ].join("\n");
    expect(keySiteLines(base)).toEqual([2, 4, 4]);
  });
  it("C6: allowlist count is between 1 and the frozen ceiling 3", () => {
    const { count } = entry();
    expect(count >= 1 && count <= 3, `count ${count}`).toBe(true);
  });
  it("C6: allowlist count equals the script's real key-site count", () => {
    expect(entry().count).toBe(keySiteLines(source()).length);
  });
  it("C6: allowlist lines are exactly the script's real key-site lines", () => {
    expect(entry().lines).toEqual(keySiteLines(source()));
  });
  it("C7: the service-role client gate (verify:service-role-clients) passes", () => {
    const r = spawnSync(
      "node",
      ["scripts/verify/service-role-client-gate.mjs"],
      { cwd: ROOT, encoding: "utf8", timeout: 120_000 },
    );
    expect(r.error).toBeUndefined();
    expect(r.status, `${r.stdout}\n${r.stderr}`.slice(-2000)).toBe(0);
  });
});
