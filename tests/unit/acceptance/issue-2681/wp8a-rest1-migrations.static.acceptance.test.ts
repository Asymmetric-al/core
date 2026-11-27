import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const MIGRATIONS = join(process.cwd(), "supabase/migrations");

function file(version: string) {
  const name = readdirSync(MIGRATIONS).find((n) => n.startsWith(`${version}_`));
  if (!name) throw new Error(`no migration ${version}`);
  return readFileSync(join(MIGRATIONS, name), "utf8");
}

const body = (text: string) => text.slice(text.indexOf("\nBEGIN;\n") + 8);

const down = (text: string) => /\n-- Down,[\s\S]*?\n\n/.exec(text)![0];

describe("AL-2681 WP8a part 2 rest, PR 1, fix round F8: the five migrations on a hosted database", () => {
  it.each([
    ["20261127030000", ["tenants", "legal_entities", "donations", "donors"]],
    [
      "20261127030100",
      [
        "tenants",
        "donations",
        "staged_gifts",
        "contribution_approval_policies",
      ],
    ],
    [
      "20261127030200",
      ["tenants", "stripe_connect_events", "donation_saga_outbox", "donations"],
    ],
  ])(
    "%s takes its table locks before anything else, the tenants first, then in the order the running commands take them",
    (version, tables) => {
      const text = body(file(version));
      const locks = [
        ...text.matchAll(/^LOCK TABLE public\.(\w+) IN [A-Z ]+ MODE;$/gm),
      ].map((m) => m[1]);
      expect(locks).toEqual(tables);
      expect(text.slice(0, text.indexOf("LOCK TABLE")).trim()).toBe(
        "SET LOCAL lock_timeout = '5s';",
      );
    },
  );

  it("M1 asserts its preconditions right after its locks and before any change: 20261126190000 applied and no line-based donation, refusing 55000 otherwise", () => {
    const text = body(file("20261127030000"));
    const afterLocks = text.slice(text.lastIndexOf(" MODE;\n") + 7).trimStart();
    expect(afterLocks.startsWith("DO $$\nBEGIN\n")).toBe(true);
    const block = afterLocks.slice(0, afterLocks.indexOf("\n$$;") + 4);
    expect(block).toContain(
      "to_regprocedure('private.refuse_sealed_truncate()')",
    );
    expect(block).toContain("intake_format = 'line_based'");
    expect(block.match(/ERRCODE = '55000'/g)).toHaveLength(2);
  });

  it("M3's recovery header names the error a second run stops on: 42P07 at CREATE TABLE public.payment_event_cases", () => {
    const text = file("20261127030200");
    expect(text).toContain(
      '(42P07, relation "payment_event_cases" already exists)',
    );
    expect(text).not.toContain("42701");
  });

  it("each Down that replaces or drops a guard-owned function does it as that owner, and M2's Down drops the truncate function M2 created", () => {
    for (const version of [
      "20261127030100",
      "20261127030200",
      "20261127030300",
    ]) {
      const d = down(file(version));
      expect([version, d.includes("SET LOCAL ROLE tenant_guard;")]).toEqual([
        version,
        true,
      ]);
      expect([version, d.includes("RESET ROLE;")]).toEqual([version, true]);
    }
    expect(down(file("20261127030100"))).toContain(
      "DROP FUNCTION private.staged_gift_holds_no_truncate()",
    );
  });
});
