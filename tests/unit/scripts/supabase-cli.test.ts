import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  guardReset,
  parseQueryRows,
  parseResetTarget,
} from "../../../scripts/supabase-cli.mjs";

const roots = new Set<string>();
const wrapper = path.resolve("scripts/supabase-cli.mjs");

afterEach(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true });
  roots.clear();
});

function dispatch(env: Record<string, string> = {}, args = ["db", "--help"]) {
  const root = mkdtempSync(path.join(tmpdir(), "core-supabase-dispatch-"));
  roots.add(root);
  const log = path.join(root, "commands.jsonl");
  for (const command of ["supabase", "npx"]) {
    writeFileSync(
      path.join(root, command),
      `#!${process.execPath}
const fs = require("node:fs");
const args = process.argv.slice(2);
fs.appendFileSync(process.env.TEST_COMMAND_LOG, JSON.stringify({ command: ${JSON.stringify(command)}, args }) + "\\n");
if (${JSON.stringify(command)} === "supabase" && args[0] === "--version") {
  console.log(process.env.TEST_GLOBAL_VERSION || "2.121.0");
  process.exit(Number(process.env.TEST_PROBE_STATUS || 0));
}
process.exit(Number(process.env.TEST_DISPATCH_STATUS || 0));
`,
      { mode: 0o755 },
    );
  }
  const result = spawnSync(process.execPath, [wrapper, ...args], {
    cwd: root,
    env: { PATH: root, TEST_COMMAND_LOG: log, ...env },
    encoding: "utf8",
  });
  const commands = readFileSync(log, "utf8")
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line) as { command: string; args: string[] });
  return { result, commands };
}

describe.skipIf(process.platform === "win32")("Supabase CLI dispatch", () => {
  it("uses an exact matching global CLI and preserves arguments", () => {
    const { result, commands } = dispatch();
    expect(result.status).toBe(0);
    expect(commands).toEqual([
      { command: "supabase", args: ["--version"] },
      { command: "supabase", args: ["db", "--help"] },
    ]);
  });

  it.each(["2.76.12", "2.122.0", "2.121.0-beta.1"])(
    "selects the reviewed version when global CLI reports %s",
    (version) => {
      const { result, commands } = dispatch({ TEST_GLOBAL_VERSION: version });
      expect(result.status).toBe(0);
      expect(commands[1]).toEqual({
        command: "npx",
        args: ["-y", "supabase@2.121.0", "db", "--help"],
      });
    },
  );

  it("falls back when the global version probe fails", () => {
    const { commands } = dispatch({ TEST_PROBE_STATUS: "1" });
    expect(commands[1].command).toBe("npx");
  });

  it("forced pinned dispatch skips the global probe and preserves exit status", () => {
    const { result, commands } = dispatch({
      SUPABASE_CLI_FORCE_PINNED: "1",
      TEST_DISPATCH_STATUS: "19",
    });
    expect(result.status).toBe(19);
    expect(commands).toEqual([
      {
        command: "npx",
        args: ["-y", "supabase@2.121.0", "db", "--help"],
      },
    ]);
  });

  it("honors an explicit version override without accepting another global version", () => {
    const { commands } = dispatch({ SUPABASE_CLI_VERSION: " 2.119.1 " });
    expect(commands[1].args[1]).toBe("supabase@2.119.1");
  });
});

/**
 * AL-2674 council round 1 (E1, plan 7.5): the repository's CLI wrapper resets
 * only a database marked disposable. Before any `db reset` it reads the marker
 * of the target the CLI would reset: the `--db-url` value or the local stack
 * through psql, the linked project through the CLI's own query command. An
 * unreadable marker refuses. There is no override flag.
 */
describe("parseResetTarget", () => {
  it.each<[string[], unknown]>([
    [["db", "push"], null],
    [["start"], null],
    [["db", "query", "reset"], null],
    [["db", "reset"], { kind: "local", workdir: null }],
    [["db", "reset", "--local", "--no-seed"], { kind: "local", workdir: null }],
    [
      ["--workdir", "/tmp/w", "db", "reset", "--debug"],
      { kind: "local", workdir: "/tmp/w" },
    ],
    [
      ["db", "reset", "--db-url", "postgresql://u:p@h:5432/d"],
      { kind: "db-url", url: "postgresql://u:p@h:5432/d" },
    ],
    [
      [
        "db",
        "reset",
        "--db-url=postgresql://u:p@h:5432/d",
        "--version",
        "2026",
      ],
      { kind: "db-url", url: "postgresql://u:p@h:5432/d" },
    ],
    [
      ["db", "reset", "--linked"],
      { kind: "linked", projectRef: null, workdir: null },
    ],
    [
      ["db", "--linked", "reset", "--project-ref", "abc", "--workdir=/w"],
      { kind: "linked", projectRef: "abc", workdir: "/w" },
    ],
    [["db", "reset", "--linked=false"], { kind: "local", workdir: null }],
  ])("%j -> %j", (args, target) => {
    expect(parseResetTarget(args)).toEqual(target);
  });

  it.each([
    [["db", "reset", "--local", "--linked"]],
    [["db", "reset", "--db-url", "postgresql://h/d", "--local"]],
    [["db", "reset", "--db-url", "postgresql://h/d", "--linked"]],
    [["db", "reset", "--project-ref", "abc"]],
    [["db", "reset", "--db-url"]],
  ])("refuses an ambiguous or incomplete target: %j", (args) => {
    expect(() => parseResetTarget(args)).toThrow(/^refusing to reset: /);
  });
});

describe("guardReset", () => {
  const deps = (kind: string | null | Error) => {
    const seen: string[] = [];
    return {
      seen,
      deps: {
        requireUrl: ({ databaseUrl }: { databaseUrl: string }) => {
          seen.push(`url ${databaseUrl}`);
          if (kind !== "disposable") throw new Error(`refusing: ${kind}`);
        },
        localUrl: (target: { workdir: string | null }) => {
          seen.push(`local ${target.workdir}`);
          return "postgresql://postgres:postgres@127.0.0.1:54322/postgres";
        },
        readLinked: (target: { projectRef: string | null }) => {
          seen.push(`linked ${target.projectRef}`);
          if (kind instanceof Error) throw kind;
          return kind;
        },
      },
    };
  };

  it("does nothing for any other command", () => {
    const { seen, deps: d } = deps("shared");
    expect(guardReset(["db", "push", "--linked"], d)).toBeNull();
    expect(seen).toEqual([]);
  });

  it("checks the --db-url target and the local stack through requireDisposableDatabase", () => {
    const ok = deps("disposable");
    guardReset(["db", "reset", "--db-url", "postgresql://h/d"], ok.deps);
    guardReset(["db", "reset", "--workdir", "/w"], ok.deps);
    expect(ok.seen).toEqual([
      "url postgresql://h/d",
      "local /w",
      "url postgresql://postgres:postgres@127.0.0.1:54322/postgres",
    ]);
    const shared = deps("shared");
    expect(() => guardReset(["db", "reset", "--local"], shared.deps)).toThrow(
      /refusing/,
    );
  });

  it.each<[string, string | null | Error, RegExp | null]>([
    ["disposable", "disposable", null],
    ["shared", "shared", /is marked shared/],
    ["production", "production", /is marked production/],
    ["missing", null, /has no environment marker/],
    [
      "unreadable",
      new Error("the CLI printed no rows"),
      /the CLI printed no rows/,
    ],
  ])(
    "reads a linked project's marker through the CLI: %s",
    (_n, kind, refusal) => {
      const { seen, deps: d } = deps(kind);
      const run = () =>
        guardReset(["db", "reset", "--linked", "--project-ref", "abc"], d);
      if (refusal)
        expect(run).toThrow(
          new RegExp(
            `^refusing to reset the linked project abc: .*${refusal.source}`,
          ),
        );
      else expect(run()).toMatchObject({ kind: "linked" });
      expect(seen).toEqual(["linked abc"]);
    },
  );
});

describe("parseQueryRows", () => {
  it("takes the rows from the CLI's JSON output, ignoring progress lines", () => {
    expect(
      parseQueryRows(
        'Connecting to remote database...\n[\n  {\n    "kind": "disposable"\n  }\n]\n',
      ),
    ).toEqual([{ kind: "disposable" }]);
    expect(parseQueryRows('[{"kind": null}]')).toEqual([{ kind: null }]);
  });

  it.each([
    "failed to execute query: error: function platform.environment_kind() does not exist",
    "",
    '{"_tag":"Error"}',
  ])("throws on output with no rows: %j", (out) => {
    expect(() => parseQueryRows(out)).toThrow(/no rows/);
  });
});

describe.skipIf(process.platform === "win32")(
  "the wrapper refuses a reset before the CLI runs",
  () => {
    /** Runs the wrapper with fake supabase, npx and psql on PATH; returns what each was asked. */
    function reset(args: string[], env: Record<string, string> = {}) {
      const root = mkdtempSync(path.join(tmpdir(), "core-supabase-reset-"));
      roots.add(root);
      const log = path.join(root, "commands.jsonl");
      writeFileSync(log, "");
      const fake = (name: string, body: string) =>
        writeFileSync(
          path.join(root, name),
          `#!${process.execPath}
const fs = require("node:fs");
const args = process.argv.slice(2);
fs.appendFileSync(process.env.TEST_COMMAND_LOG, JSON.stringify({ command: ${JSON.stringify(name)}, args, password: process.env.PGPASSWORD ?? null }) + "\\n");
${body}`,
          { mode: 0o755 },
        );
      fake(
        "supabase",
        `if (args[0] === "--version") { console.log("2.121.0"); process.exit(0); }
if (args[0] === "status") { console.log('DB_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"'); process.exit(0); }
if (args[0] === "db" && args[1] === "query") {
  const kind = process.env.TEST_LINKED_KIND;
  if (kind === "error") { console.error("failed to execute query: error: function platform.environment_kind() does not exist"); process.exit(1); }
  console.error("Connecting to remote database...");
  console.log(JSON.stringify([{ kind: kind === "null" ? null : kind }], null, 2));
  process.exit(0);
}
process.exit(0);`,
      );
      fake("npx", "process.exit(0);");
      fake(
        "psql",
        `const sql = args[args.indexOf("-c") + 1] ?? "";
if (sql.includes("to_regprocedure")) { console.log("t"); process.exit(0); }
console.log(process.env.TEST_DB_KIND || "");`,
      );
      const result = spawnSync(process.execPath, [wrapper, ...args], {
        cwd: root,
        env: {
          PATH: root,
          TEST_COMMAND_LOG: log,
          PSQL_BIN: path.join(root, "psql"),
          ...env,
        },
        encoding: "utf8",
      });
      const commands = readFileSync(log, "utf8")
        .trim()
        .split("\n")
        .filter(Boolean)
        .map(
          (line) =>
            JSON.parse(line) as {
              command: string;
              args: string[];
              password: string | null;
            },
        );
      const resets = commands.filter(
        (c) => c.command === "supabase" && c.args.includes("reset"),
      );
      return { result, commands, resets };
    }

    it.each<[string, string[], Record<string, string>]>([
      [
        "a --db-url target marked shared",
        [
          "db",
          "reset",
          "--db-url",
          "postgresql://u:s3cret@db.example:5432/postgres",
        ],
        { TEST_DB_KIND: "shared" },
      ],
      ["the local stack with no marker", ["db", "reset", "--local"], {}],
      [
        "the default (local) target marked production",
        ["db", "reset"],
        { TEST_DB_KIND: "production" },
      ],
      [
        "a linked project marked shared",
        ["db", "reset", "--linked"],
        { TEST_LINKED_KIND: "shared" },
      ],
      [
        "a linked project with no marker",
        ["db", "reset", "--linked"],
        { TEST_LINKED_KIND: "null" },
      ],
      [
        "a linked project whose marker cannot be read",
        ["db", "reset", "--linked"],
        { TEST_LINKED_KIND: "error" },
      ],
      ["an ambiguous target", ["db", "reset", "--local", "--linked"], {}],
    ])("refuses %s and never runs the reset", (_name, args, env) => {
      const { result, resets, commands } = reset(args, env);
      expect(result.status).toBe(1);
      expect(result.stderr).toMatch(/refusing to reset/);
      expect(resets).toEqual([]);
      expect(`${result.stdout}${result.stderr}`).not.toContain("s3cret");
      for (const c of commands.filter((x) => x.command === "psql"))
        expect(JSON.stringify(c.args)).not.toContain("s3cret");
    });

    it("runs the reset once the target is marked disposable, reading a linked marker through db query --linked", () => {
      const local = reset(["db", "reset", "--local"], {
        TEST_DB_KIND: "disposable",
      });
      expect(local.result.status, local.result.stderr).toBe(0);
      expect(local.resets.map((c) => c.args)).toEqual([
        ["db", "reset", "--local"],
      ]);
      expect(
        local.commands.filter((c) => c.command === "psql")[0]?.password,
      ).toBe("postgres");

      const linked = reset(
        ["db", "reset", "--linked", "--project-ref", "abc"],
        {
          TEST_LINKED_KIND: "disposable",
        },
      );
      expect(linked.result.status, linked.result.stderr).toBe(0);
      const query = linked.commands.find(
        (c) => c.command === "supabase" && c.args[1] === "query",
      );
      expect(query?.args.slice(0, 5)).toEqual([
        "db",
        "query",
        "--linked",
        "--project-ref",
        "abc",
      ]);
      expect(query?.args).toEqual(
        expect.arrayContaining(["-o", "json", "--file"]),
      );
      expect(linked.resets.map((c) => c.args)).toEqual([
        ["db", "reset", "--linked", "--project-ref", "abc"],
      ]);
    });

    it("leaves other commands alone", () => {
      const { result, commands } = reset(["db", "push", "--linked"]);
      expect(result.status).toBe(0);
      expect(commands.map((c) => [c.command, c.args[0]])).toEqual([
        ["supabase", "--version"],
        ["supabase", "db"],
      ]);
    });
  },
);
