// CI's "Verify seed counts" step (AL-2674): the expected counts live in
// supabase/seed-expectations.json, so a package that changes the seed changes
// that file and never the workflow. These tests read the tracked file without
// pinning its numbers, so such a change touches nothing here.
import { spawnSync } from "node:child_process";
import {
  chmodSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterAll, describe, expect, it } from "vitest";

import {
  EXPECTATIONS_PATH,
  checkSeedCounts,
  countSql,
  main,
  readSeedExpectations,
  validateSeedExpectations,
} from "../../../scripts/verify/seed-counts.mjs";

const scratch = mkdtempSync(path.join(tmpdir(), "seed-counts-"));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));

function rootWith(content: string) {
  const root = mkdtempSync(path.join(scratch, "root-"));
  mkdirSync(path.join(root, "supabase"));
  writeFileSync(path.join(root, EXPECTATIONS_PATH), content);
  return root;
}

describe("the tracked expectation file", () => {
  it("is valid and holds the profile count the seed must produce", () => {
    const expectations = readSeedExpectations();
    expect(Object.keys(expectations)).toContain("public.profiles");
    expect(Number.isSafeInteger(expectations["public.profiles"])).toBe(true);
  });

  it("is the step's only expectation: the workflow names the script, not a number", () => {
    const workflow = readFileSync(
      ".github/workflows/ci-integration.yml",
      "utf8",
    );
    expect(workflow).toContain(
      "      - name: Verify seed counts\n        run: node scripts/verify/seed-counts.mjs\n",
    );
    expect(workflow).not.toMatch(/SELECT COUNT\(\*\) FROM public\.profiles/i);
  });
});

describe("validateSeedExpectations", () => {
  const counts = (value: unknown) => ({ counts: value });

  it("accepts schema-qualified tables with whole counts, and a description", () => {
    expect(
      validateSeedExpectations({
        description: "x",
        counts: { "public.profiles": 3, "public.tenants": 2, "authz.x_y": 0 },
      }),
    ).toEqual({ "public.profiles": 3, "public.tenants": 2, "authz.x_y": 0 });
  });

  it.each([
    ["not an object", []],
    ["null", null],
    ["an unknown key", { counts: { "public.profiles": 1 }, extra: 1 }],
    ["no counts", { description: "x" }],
    ["counts not an object", counts([1])],
    ["no table", counts({})],
  ])("refuses %s", (_label, value) => {
    expect(() => validateSeedExpectations(value)).toThrow(EXPECTATIONS_PATH);
  });

  it.each([
    "profiles",
    "public.profiles; DROP TABLE public.donors",
    'public."profiles"',
    "Public.Profiles",
    "public.profiles.extra",
    " public.profiles",
  ])("refuses the table name %j", (table) => {
    expect(() => validateSeedExpectations(counts({ [table]: 1 }))).toThrow(
      /schema-qualified table name/,
    );
  });

  it.each([-1, 1.5, "1", null, Number.NaN, 2 ** 53])(
    "refuses the count %j",
    (value) => {
      expect(() =>
        validateSeedExpectations(counts({ "public.profiles": value })),
      ).toThrow(/whole number of rows/);
    },
  );
});

describe("countSql", () => {
  it("quotes both identifiers", () => {
    expect(countSql("public.profiles")).toBe(
      'SELECT count(*) FROM "public"."profiles";',
    );
  });
  it("refuses an unvalidated name", () => {
    expect(() => countSql("public.profiles;--")).toThrow(/not a table name/);
  });
});

describe("checkSeedCounts", () => {
  const expectations = { "public.profiles": 1, "public.tenants": 2 };

  it("passes when every count matches, and says what it verified", () => {
    const found: Record<string, string> = {
      "public.profiles": "1",
      "public.tenants": "2",
    };
    expect(
      checkSeedCounts({ expectations, count: (table) => found[table]! }),
    ).toEqual({
      ok: true,
      lines: [
        "Verified public.profiles seeded row count: 1",
        "Verified public.tenants seeded row count: 2",
      ],
    });
  });

  it("fails on a wrong count and says what it found, checking every table", () => {
    const found: Record<string, string> = {
      "public.profiles": "3",
      "public.tenants": "2",
    };
    expect(
      checkSeedCounts({ expectations, count: (table) => found[table]! }),
    ).toEqual({
      ok: false,
      lines: [
        "Expected public.profiles count to be 1 after seeding, got: 3",
        "Verified public.tenants seeded row count: 2",
      ],
    });
  });

  it("fails when the count is empty", () => {
    expect(
      checkSeedCounts({
        expectations: { "public.profiles": 1 },
        count: () => "",
      }),
    ).toEqual({
      ok: false,
      lines: ["Expected public.profiles count to be 1 after seeding, got: "],
    });
  });
});

describe("main", () => {
  const capture = () => {
    const out: string[] = [];
    const err: string[] = [];
    return {
      out,
      err,
      print: (line: string) => out.push(line),
      printError: (line: string) => err.push(line),
    };
  };
  const root = () => rootWith('{"counts": {"public.profiles": 1}}\n');

  it("exits 0 when the counts match", () => {
    const io = capture();
    expect(main({ root: root(), count: () => "1", ...io })).toBe(0);
    expect(io.out).toEqual(["Verified public.profiles seeded row count: 1"]);
    expect(io.err).toEqual([]);
  });

  it("exits 1 on a wrong count, on standard error", () => {
    const io = capture();
    expect(main({ root: root(), count: () => "3", ...io })).toBe(1);
    expect(io.err).toEqual([
      "Expected public.profiles count to be 1 after seeding, got: 3",
    ]);
  });

  it("exits 1 without DATABASE_URL", () => {
    const io = capture();
    expect(main({ root: root(), env: {}, ...io })).toBe(1);
    expect(io.err.join("\n")).toMatch(/Set DATABASE_URL/);
  });

  it("exits 1 on a malformed expectation file, before counting", () => {
    const io = capture();
    let counted = false;
    const bad = rootWith('{"counts": {"profiles": 1}}\n');
    expect(
      main({
        root: bad,
        count: () => {
          counted = true;
          return "1";
        },
        ...io,
      }),
    ).toBe(1);
    expect(counted).toBe(false);
    expect(io.err.join("\n")).toMatch(/schema-qualified table name/);
  });
});

// The script as the step runs it, against a fake psql that answers from the
// tracked expectations (or wrongly, or fails), and records what it was given.
describe.runIf(process.platform !== "win32")(
  "node scripts/verify/seed-counts.mjs",
  () => {
    const expectations = readSeedExpectations();
    const databaseUrl =
      "postgresql://postgres:postgres@127.0.0.1:5432/seed_counts_fixture";

    function fakePsql(body: string) {
      const dir = mkdtempSync(path.join(scratch, "psql-"));
      const bin = path.join(dir, "psql");
      writeFileSync(
        bin,
        `#!/usr/bin/env bash\nprintf '%s\\n' "$@" >> "${dir}/args"\n${body}\n`,
      );
      chmodSync(bin, 0o755);
      return { bin, args: () => readFileSync(path.join(dir, "args"), "utf8") };
    }
    const run = (bin: string, env: NodeJS.ProcessEnv = {}) =>
      spawnSync(process.execPath, ["scripts/verify/seed-counts.mjs"], {
        encoding: "utf8",
        env: {
          ...process.env,
          PSQL_BIN: bin,
          DATABASE_URL: databaseUrl,
          ...env,
        },
      });

    it("exits 0 when the database holds the expected counts", () => {
      const cases = Object.entries(expectations)
        .map(([table, count]) => {
          const [schema, name] = table.split(".");
          return `  *'"${schema}"."${name}"'*) echo " ${count} " ;;`;
        })
        .join("\n");
      const psql = fakePsql(
        `sql="\${@: -1}"\ncase "$sql" in\n${cases}\n  *) exit 3 ;;\nesac`,
      );
      const result = run(psql.bin);
      expect(result.status, result.stderr).toBe(0);
      for (const [table, count] of Object.entries(expectations))
        expect(result.stdout).toContain(
          `Verified ${table} seeded row count: ${count}`,
        );
      // The URL goes to psql's -d, and nowhere else on the command line.
      const args = psql.args().split("\n");
      expect(args[args.indexOf("-d") + 1]).toBe(databaseUrl);
      expect(args.filter((arg) => arg === databaseUrl)).toHaveLength(
        Object.keys(expectations).length,
      );
    });

    it("exits 1 on a wrong count and reports it", () => {
      const result = run(fakePsql("echo -1").bin);
      expect(result.status).toBe(1);
      expect(result.stderr).toContain(
        `Expected public.profiles count to be ${expectations["public.profiles"]} after seeding, got: -1`,
      );
    });

    it("exits 1 when psql fails, and says so", () => {
      const result = run(fakePsql('echo "connection refused" >&2; exit 2').bin);
      expect(result.status).toBe(1);
      expect(result.stderr).toMatch(
        /psql could not count public\.profiles: connection refused/,
      );
    });

    it("exits 1 without DATABASE_URL", () => {
      const result = run(fakePsql("echo 1").bin, { DATABASE_URL: "" });
      expect(result.status).toBe(1);
      expect(result.stderr).toMatch(/Set DATABASE_URL/);
    });
  },
);
