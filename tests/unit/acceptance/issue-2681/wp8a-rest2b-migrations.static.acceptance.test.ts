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
const header = (text: string) => text.slice(0, text.indexOf("\nBEGIN;\n"));

describe("AL-2681 B fix round X1 and X12.1: the limit's migration on a hosted database", () => {
  it("20261127080100 takes SHARE ROW EXCLUSIVE on public.tenants straight after its lock_timeout, and its header names that lock and what a stop there leaves", () => {
    const text = file("20261127080100");
    const statements = body(text);
    const locks = [
      ...statements.matchAll(/^LOCK TABLE ([\w.]+) IN ([A-Z ]+) MODE;$/gm),
    ].map((m) => `${m[1]} ${m[2]}`);
    expect(locks).toEqual(["public.tenants SHARE ROW EXCLUSIVE"]);
    expect(statements.slice(0, statements.indexOf("LOCK TABLE")).trim()).toBe(
      "SET LOCAL lock_timeout = '5s';",
    );
    expect(header(text)).toMatch(/SHARE ROW EXCLUSIVE on public\.tenants/);
    expect(header(text)).toMatch(/a re-run of the release completes it/);
  });

  it("take_intake_attempt takes its bucket locks one at a time in a sorted loop, not in a PERFORM ... ORDER BY", () => {
    const fn =
      /CREATE FUNCTION public\.take_intake_attempt[\s\S]*?\n\$\$;/.exec(
        file("20261127080100"),
      )![0];
    expect(fn).not.toMatch(
      /PERFORM pg_catalog\.pg_advisory_xact_lock[^;]*ORDER BY/,
    );
    expect(fn).toMatch(
      /FOREACH v_bucket IN ARRAY v_sorted LOOP\n\s+PERFORM pg_catalog\.pg_advisory_xact_lock/,
    );
  });
});
