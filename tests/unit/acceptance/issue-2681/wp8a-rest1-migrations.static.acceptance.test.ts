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

describe("AL-2681 WP8a part 2 rest, PR 2a, the confirmation's finding 4: the Downs on a hosted database", () => {
  it.each([
    "20261127050000",
    "20261127050100",
    "20261127050200",
    "20261127050300",
    "20261127050400",
  ])(
    "%s's Down sets its lock timeout before it alters or drops a table or a column",
    (version) => {
      const text = down(file(version));
      const touch = text.search(/ALTER TABLE|DROP TABLE|DROP COLUMN/);
      if (touch < 0) return;
      expect(text.slice(0, touch)).toContain("SET LOCAL lock_timeout = '5s';");
    },
  );
});

function named(suffix: string) {
  const name = readdirSync(MIGRATIONS).find((n) => n.endsWith(`${suffix}.sql`));
  if (!name) throw new Error(`no migration ${suffix}`);
  return readFileSync(join(MIGRATIONS, name), "utf8");
}

describe("AL-2681 WP8a part 2 rest, PR 2b: its two migrations on a hosted database", () => {
  it.each(["_wp8a2_rest2b_item_zero", "_wp8a2_rest2b_limit_and_config"])(
    "%s says in its header that GUEST_GIVING_ENABLED is never turned on in a deployment whose build is older than this pull request, and its Down sets its lock timeout first",
    (suffix) => {
      const text = named(suffix);
      const header = text
        .slice(0, text.indexOf("\nBEGIN;\n"))
        .replace(/\n-- /g, " ");
      expect(header).toContain(
        "GUEST_GIVING_ENABLED is never turned on in a deployment whose build is older than this pull request",
      );
      const steps = down(text)
        .split("\n")
        .filter((line) => /^-- {3}\S/.test(line));
      expect(steps[0]).toBe("--   SET LOCAL lock_timeout = '5s';");
    },
  );

  it("the limit's Down restores what the file dropped: the rate token, its table and the two-argument config read", () => {
    const text = down(named("_wp8a2_rest2b_limit_and_config"));
    for (const restored of [
      "private.intake_rate_windows",
      "public.take_intake_rate_token",
      "public.checkout_giving_config with its ALTER",
      "public.checkout_giving_config(p_host text, p_targets jsonb)",
    ])
      expect(text).toContain(restored);
  });
});
