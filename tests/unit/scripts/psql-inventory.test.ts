import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const roots: string[] = [];
afterEach(() => {
  for (const dir of roots.splice(0))
    rmSync(dir, { recursive: true, force: true });
});

/*
 * Reviews M4 and N4, and the last check's P2 (phase 15): which files under
 * scripts/ may start psql. The rule is blunt, so that no reading of the code
 * can be fooled. In every file under scripts/ but Markdown, the letters
 * "psql", in any case, are counted wherever they stand: in code, in a string,
 * in a comment, in a name (PSQL_BIN, runPsqlQuery, "$PSQL_BIN",
 * /usr/bin/psql, an import of scripts/lib/psql.mjs). Nothing is stripped, so
 * no comment or string can hide them. A file that holds them is a listed
 * starter (PSQL_STARTERS), or is listed by name in PSQL_NAMERS with the
 * reason it needs the word and every line that holds it, trimmed and sorted
 * (phase 16, Q2: a count could not see one mention swapped for another). Any
 * other file that holds them fails, and so does a listed file whose lines
 * change: a new or changed line shows in this file's diff for a reviewer.
 *
 * What this cannot see:
 * - a program name built at run time from parts ("ps" + "ql", a character
 *   code, a decoded string) in a file that otherwise never names psql;
 * - in a listed file, a new line without the word that starts psql through a
 *   value a pinned line already holds under a name without it;
 * - a helper outside scripts/ (packages/, tests/) that starts psql for a
 *   script, or a file git does not track, which the walk skips;
 * - what a listed starter does: the tests of the three shared builders and
 *   the starters' own tests judge that.
 */
const PSQL_STARTERS = [
  // The three builders of a psql connection from an address: the shared
  // check (databaseUrlProblem) and the shared list (keptAmbientLibpqEnv).
  "scripts/lib/psql.mjs",
  "scripts/release/lib/postgres.mjs",
  "scripts/cms/lib/postgres.mjs",
  // psql, pg_dump and pg_restore inside a Docker container it starts.
  "scripts/verify/backup-restore-proof.mjs",
  // A check and a builder of its own, left as they are (review M4).
  "scripts/verify/stripe-data-pipeline.mjs",
];
const SHARED_BUILDERS = PSQL_STARTERS.slice(0, 3);

/**
 * The files that name psql and start none, each with why, and every line
 * that holds the letters (in any case, comments included), trimmed and
 * sorted as psqlLines gives them, duplicates kept.
 */
const PSQL_NAMERS: Record<string, { reason: string; lines: string[] }> = {
  "scripts/cms/lib/migration-target.mjs": {
    reason:
      "comments and two messages that name the CMS runner's psql and the CA file it reads",
    lines: [
      '"A hosted CMS migration address names its own CA (sslrootcert). Leave it out: Payload reads the CA from PAYLOAD_DATABASE_SSL_CA and the runner\'s psql from PGSSLROOTCERT.",',
      "\"A hosted CMS migration needs the project's CA: set PAYLOAD_DATABASE_SSL_CA to its PEM, for Payload, and PGSSLROOTCERT to a file holding the same certificate, for the runner's psql. The release job sets both from RELEASE_DATABASE_SSL_CA.\",",
      "// PGSSLROOTCERT for the runner's psql (lib/postgres.mjs), while Payload",
      "// and the runner's psql against the file PGSSLROOTCERT names.",
      "// the runner's psql (lib/postgres.mjs drops it) or Payload.",
    ],
  },
  "scripts/cms/lib/supabase.mjs": {
    reason: "imports and calls runPsqlFile from the CMS builder",
    lines: [
      "runPsqlFile(filePath);",
      "runPsqlFile(seedSqlPath);",
      "runPsqlFile,",
    ],
  },
  "scripts/cms/qualify-payload-pin.mjs": {
    reason: "imports isLoopbackDatabaseUrl from scripts/lib/psql.mjs",
    lines: ['import { isLoopbackDatabaseUrl } from "../lib/psql.mjs";'],
  },
  "scripts/cms/verify-local.mjs": {
    reason: "imports and calls runPsql from the CMS builder",
    lines: [
      'import { queryJson, runPsql } from "./lib/postgres.mjs";',
      'runPsql("select 1;");',
    ],
  },
  "scripts/lib/environment-marker.mjs": {
    reason:
      "reads the marker through runPsqlQuery, handing on psqlBin from PSQL_BIN",
    lines: [
      "function query(databaseUrl, sql, psqlBin) {",
      'import { isLoopbackDatabaseUrl, runPsqlQuery } from "./psql.mjs";',
      'psqlBin = process.env.PSQL_BIN?.trim() || "psql",',
      "psqlBin,",
      "psqlBin,",
      "psqlBin,",
      "readKind: () => readEnvironmentMarker({ databaseUrl, psqlBin }),",
      "return runPsqlQuery({ databaseUrl, sql, psqlBin }).trim();",
    ],
  },
  "scripts/lib/local-database.mjs": {
    reason:
      "the `local-database.mjs psql` entry: shell scripts run psql through spawnPsql here, and its usage and messages name it",
    lines: [
      '"usage: node scripts/lib/local-database.mjs admit|psql <ENV_VARIABLE> [psql arguments]\\n",',
      "//     psql's status.",
      "//     refuses (1) a URL the decision does not admit; otherwise runs psql on it",
      "//     through spawnPsql (the URL is the whole target, every ambient PG*",
      "//   node scripts/lib/local-database.mjs psql SUPABASE_DB_URL [psql arguments]",
      "// The repository's one local-database decision and psql runner for shell",
      "`Refusing to run psql: ${variable} does not name a database on this machine.\\n`,",
      "args: psqlArgs,",
      'const COMMANDS = new Set(["admit", "psql"]);',
      "const [command, variable, ...psqlArgs] = argv;",
      "const result = spawnPsql({",
      'import { isLoopbackDatabaseUrl, spawnPsql } from "./psql.mjs";',
      "process.stderr.write(`could not run psql: ${result.error.message}\\n`);",
    ],
  },
  "scripts/release/lib/database-target.mjs": {
    reason:
      "a comment, and the shared check's forPsql option for an address the reset guard hands psql",
    lines: [
      "// Review K1: the URL also reaches psql (the reset wrapper reads the marker",
      "// through scripts/lib/psql.mjs), so it must be one libpq reads as `URL` does,",
      "// with only the query keys psql may take.",
      "const libpqProblem = databaseUrlProblem(databaseUrl, { forPsql: true });",
    ],
  },
  "scripts/release/lib/scram.mjs": {
    reason: "a comment comparing the verifier with psql's \\password",
    lines: [
      "// reaches the server, its statement log or argv (what psql's \\password does).",
    ],
  },
  "scripts/release/release-database.mjs": {
    reason:
      "calls runPsql and requirePsqlHonoursRequireAuth, passes psqlBin, names the default-privilege inspection command in recovery advice, and comments",
    lines: [
      '"Inspect the grants with psql\'s \\\\ddp.",',
      "* (lib/postgres.mjs), the reset guard (scripts/lib/psql.mjs) and the Supabase",
      "* (scripts/lib/psql.mjs keeps an ambient PGPASSWORD). SUPABASE_CLI_FORCE_PINNED",
      "* Reviews M3 and N6: a hosted step stops, before it connects, unless the psql",
      "* from PAYLOAD_DATABASE_SSL_CA, and the runner's own psql check from the file",
      "* it starts psql on a hosted address. The release workflow installs Ubuntu's",
      "* published passwords in the psql variable :'published' (a JSON array). Only",
      "* the address names it as `sslrootcert`, which the job's own psql",
      "* the shared one in scripts/lib/psql.mjs, which each builder also runs before",
      "...(psqlBin ? { psqlBin } : {}),",
      "// command line. The job's own psql queries (lib/postgres.mjs) take the",
      "export function requirePsqlForHostedRelease({ psqlBin, run } = {}) {",
      'import { queryJson, runPsql } from "./lib/postgres.mjs";',
      'import { requirePsqlHonoursRequireAuth } from "../lib/psql.mjs";',
      "requirePsqlForHostedRelease();",
      "requirePsqlHonoursRequireAuth({",
      "run = runPsql,",
      "run = runPsql,",
      "run = runPsql,",
      "run = runPsql,",
      "run = runPsql,",
      "run = runPsql,",
    ],
  },
  "scripts/seed-demo.sh": {
    reason:
      "`require_cmd psql`, and local_psql, which runs the `local-database.mjs psql` entry",
    lines: [
      "# (spawnPsql, scripts/lib/psql.mjs): the URL is the whole target, every",
      "# Runs psql on SUPABASE_DB_URL through the repository's one psql runner",
      'local_psql -v ON_ERROR_STOP=1 -P pager=off -c "',
      'local_psql -v ON_ERROR_STOP=1 -P pager=off -c "',
      "local_psql() {",
      'node "$SCRIPT_DIR/lib/local-database.mjs" psql SUPABASE_DB_URL "$@"',
      "require_cmd psql",
    ],
  },
  "scripts/supabase-cli.mjs": {
    reason: "a comment on how the reset guard reads the marker",
    lines: [
      "// AL-2674): the `--db-url` value and the local stack through psql, a linked",
    ],
  },
  "scripts/verify/field-policy-census.mjs": {
    reason: "runs its catalog query through runPsqlQuery, handing on PSQL_BIN",
    lines: [
      "function readCatalog(manifest, { databaseUrl, psqlBin }) {",
      'import { isLoopbackDatabaseUrl, runPsqlQuery } from "../lib/psql.mjs";',
      'psqlBin = process.env.PSQL_BIN || "psql",',
      "readCatalog(manifest, { databaseUrl, psqlBin }),",
      "runPsqlQuery({ databaseUrl, sql: catalogSql(manifest), psqlBin }).trim(),",
    ],
  },
  "scripts/verify/seed-counts.mjs": {
    reason:
      "counts rows through runPsqlQuery, handing on PSQL_BIN, and a message",
    lines: [
      "* Counts rows through the shared psql runner (scripts/lib/psql.mjs), which",
      "`psql could not count ${table}: ${error instanceof Error ? error.message : error}`,",
      "count: count ?? ((table) => psqlCount({ databaseUrl, table })),",
      "export function psqlCount({",
      'import { runPsqlQuery } from "../lib/psql.mjs";',
      'psqlBin = process.env.PSQL_BIN?.trim() || "psql",',
      'return runPsqlQuery({ databaseUrl, sql, psqlBin }).replace(/\\s/g, "");',
    ],
  },
  "scripts/verify/supabase-migrations.mjs": {
    reason:
      "runs each file through spawnPsql, handing on PSQL_BIN, and its messages",
    lines: [
      "// Every psql below runs through psqlConnection: the URL is the whole target,",
      "catalogGate = runTenantRlsCatalogGate({ databaseUrl, psqlBin });",
      "console.error(`error: Failed to run psql: ${result.error.message}`);",
      'const psqlBin = process.env.PSQL_BIN?.trim() || "psql";',
      "const result = spawnPsql({",
      "function runPsql(label, args, input) {",
      'import { isLoopbackDatabaseUrl, spawnPsql } from "../lib/psql.mjs";',
      "psqlBin,",
      "runPsql(",
      'runPsql("bootstrap Supabase compatibility schemas", [',
      "runPsql(`apply ${fileName}`, args);",
      "runPsql(`apply hosted Supabase default privileges (${HOSTED_DEFAULTS})`, [",
    ],
  },
  "scripts/verify/tenant-rls-catalog.mjs": {
    reason: "runs its catalog query through runPsqlQuery, handing on psqlBin",
    lines: [
      "* Runs the catalog query through psql (the census pattern) and evaluates it",
      "* against the exception list and the anon allowlist. Throws when psql fails",
      "const stdout = runPsqlQuery({",
      'import { runPsqlQuery } from "../lib/psql.mjs";',
      'psqlBin = "psql",',
      "psqlBin,",
    ],
  },
};

/**
 * Every file git tracks under `dir`, whatever its extension, as `dir/...`
 * (phase 16, Q3). An untracked or ignored file, a local log say, is not read,
 * so it cannot fail this test on one machine only.
 */
function scriptsFiles(dir = "scripts", env = process.env): string[] {
  return execFileSync("git", ["ls-files", "-z"], {
    cwd: dir,
    env,
    encoding: "utf8",
  })
    .split("\0")
    .filter(Boolean)
    .map((file) => `${dir}/${file}`);
}

/** How many times `source` holds the letters psql, in any case. */
const psqlCount = (source: string) => source.match(/psql/gi)?.length ?? 0;

/** Every line of `source` that holds the letters psql, trimmed and sorted. */
const psqlLines = (source: string) =>
  source
    .split("\n")
    .filter((line) => /psql/i.test(line))
    .map((line) => line.trim())
    .sort();

/** Why a file under scripts/ breaks the rule above, or null. */
function psqlProblem(file: string, source: string): string | null {
  if (file.endsWith(".md")) return null;
  const count = psqlCount(source);
  if (count === 0 || PSQL_STARTERS.includes(file)) return null;
  const listed = PSQL_NAMERS[file];
  if (!listed)
    return `${file} names psql ${count} time(s) and is neither a listed starter nor listed in PSQL_NAMERS. A script runs psql through scripts/lib/psql.mjs, or a shell script through scripts/lib/local-database.mjs; list a file that only names it, with the reason and its lines.`;
  const lines = psqlLines(source);
  if (JSON.stringify(lines) === JSON.stringify([...listed.lines].sort()))
    return null;
  const unpinned = lines.filter((line) => !listed.lines.includes(line));
  const gone = listed.lines.filter((line) => !lines.includes(line));
  return `${file}'s lines that name psql differ from PSQL_NAMERS (not pinned: ${JSON.stringify(unpinned)}; pinned but gone: ${JSON.stringify(gone)}; ${lines.length} line(s) against ${listed.lines.length} pinned). Check that the change starts no psql, then pin the lines and update the reason.`;
}

/** The forms the last check (phase 15, P2) found passing the patterns. */
const REVIEWER_FORMS: Array<[string, string, string]> = [
  [
    "execSync with a command string and no import",
    "scripts/x/exec-sync.mjs",
    'import { execSync } from "node:child_process";\nexecSync("psql -c \'select 1\'");\n',
  ],
  [
    "exec with a command string and no import",
    "scripts/x/exec.mjs",
    'import { exec } from "node:child_process";\nexec("psql -c \'select 1\'");\n',
  ],
  [
    "a full path",
    "scripts/x/full-path.mjs",
    'import { spawnSync } from "node:child_process";\nspawnSync("/usr/bin/psql", ["-c", "select 1"]);\n',
  ],
  [
    "a shell",
    "scripts/x/shell.mjs",
    'import { spawnSync } from "node:child_process";\nspawnSync("sh", ["-c", "psql -c \'select 1\'"]);\n',
  ],
  [
    "a computed program name beside an import of psql.mjs",
    "scripts/x/computed.mjs",
    'import { runPsqlQuery } from "../lib/psql.mjs";\nimport { spawnSync } from "node:child_process";\nconst bin = ["ps", "ql"].join("");\nspawnSync(bin, ["-c", "select 1"]);\n',
  ],
  [
    "Bun.spawn beside an import of psql.mjs",
    "scripts/x/bun-spawn.mjs",
    'import { isLoopbackDatabaseUrl } from "../lib/psql.mjs";\nBun.spawn(["psql", "-c", "select 1"]);\n',
  ],
  [
    'a local helper called as run("psql") beside an import of psql.mjs',
    "scripts/x/helper.mjs",
    'import { isLoopbackDatabaseUrl } from "../lib/psql.mjs";\nimport { spawnSync } from "node:child_process";\nconst run = (bin) => spawnSync(bin, ["-c", "select 1"]);\nrun("psql");\n',
  ],
  [
    "a .mts file",
    "scripts/x/start.mts",
    'import { spawnSync } from "node:child_process";\nspawnSync("psql", ["-c", "select 1"]);\n',
  ],
  [
    "a .cts file",
    "scripts/x/start.cts",
    'const { spawnSync } = require("node:child_process");\nspawnSync("psql", ["-c", "select 1"]);\n',
  ],
  [
    "a .bash file",
    "scripts/x/start.bash",
    '#!/usr/bin/env bash\npsql -c "select 1"\n',
  ],
  [
    "a .py file",
    "scripts/x/start.py",
    'import subprocess\nsubprocess.run(["psql", "-c", "select 1"])\n',
  ],
  [
    "a file with no extension",
    "scripts/x/start",
    '#!/bin/sh\npsql -c "select 1"\n',
  ],
  ["if before psql", "scripts/x/if.sh", 'if psql -c "select 1"; then :; fi\n'],
  [
    "while before psql",
    "scripts/x/while.sh",
    'while psql -c "select 1"; do break; done\n',
  ],
  [
    "until before psql",
    "scripts/x/until.sh",
    'until psql -c "select 1"; do sleep 1; done\n',
  ],
  [
    "elif before psql",
    "scripts/x/elif.sh",
    'if false; then :\nelif psql -c "select 1"; then :; fi\n',
  ],
  ["! before psql", "scripts/x/not.sh", '! psql -c "select 1"\n'],
  ["sudo -u x psql", "scripts/x/sudo.sh", 'sudo -u x psql -c "select 1"\n'],
  ["timeout 5 psql", "scripts/x/timeout.sh", 'timeout 5 psql -c "select 1"\n'],
  ["nohup psql", "scripts/x/nohup.sh", 'nohup psql -c "select 1"\n'],
  [
    "xargs -r psql",
    "scripts/x/xargs.sh",
    'echo "select 1" | xargs -r psql -c\n',
  ],
  ["env -i psql", "scripts/x/env-i.sh", 'env -i psql -c "select 1"\n'],
  ['"$PSQL_BIN"', "scripts/x/bin.sh", '"$PSQL_BIN" -c "select 1"\n'],
  [
    "code after a string that holds //",
    "scripts/x/slashes.mjs",
    'import { execSync } from "node:child_process";\nconst note = "see a // b"; execSync("psql -c \'select 1\'");\n',
  ],
  [
    "code between strings that hold /* and */",
    "scripts/x/stars.mjs",
    'import { execSync } from "node:child_process";\nconst open = "/*"; execSync("psql -c \'select 1\'"); const close = "*/";\n',
  ],
];

describe("the files under scripts/ that start psql (review M4)", () => {
  it("every file that names psql is a listed starter, or is listed by name with its lines", () => {
    const lines = new Map<string, string[]>();
    for (const file of scriptsFiles()) {
      const source = readFileSync(file, "utf8");
      expect(psqlProblem(file, source)).toBeNull();
      lines.set(file, psqlLines(source));
    }
    // No entry outlives its file, or the need for the word.
    for (const [file, entry] of Object.entries(PSQL_NAMERS)) {
      expect(lines.get(file), file).toEqual(entry.lines);
      expect(entry.lines, file).toEqual([...entry.lines].sort());
      expect(entry.reason.length, file).toBeGreaterThan(20);
    }
    for (const file of PSQL_STARTERS)
      expect(lines.get(file)?.length, file).toBeGreaterThan(0);
  });

  // Review N4: the rule holds on code, not on what a comment says.
  it.each([
    [
      "a comment that names the runner, and a direct start",
      "scripts/x/comment.mjs",
      '// goes through scripts/lib/psql.mjs\nimport { spawnSync } from "node:child_process";\nspawnSync("psql", ["-c", "select 1"]);\n',
    ],
    [
      "a real import, and a direct start beside it",
      "scripts/x/both.mjs",
      'import { runPsqlQuery } from "../lib/psql.mjs";\nimport { spawnSync } from "node:child_process";\nspawnSync(process.env.PSQL_BIN || "psql", ["-c", "select 1"]);\n',
    ],
    [
      "a shell psql after &&",
      "scripts/x/and.sh",
      '#!/usr/bin/env bash\ncd /tmp && psql -c "select 1"\n',
    ],
    [
      "a shell psql in a command substitution",
      "scripts/x/sub.sh",
      '#!/usr/bin/env bash\ncount=$(psql -tAc "select 1")\n',
    ],
    [
      "a shell psql after an assignment",
      "scripts/x/env.sh",
      '#!/usr/bin/env bash\nPGHOST=elsewhere psql -c "select 1"\n',
    ],
  ])("refuses %s", (_case, file, source) => {
    expect(psqlProblem(file, source)).not.toBeNull();
  });

  // The last check's P2 (phase 15): every form the reviewer found that
  // passed the earlier patterns, planted as a file that is not listed.
  it.each(REVIEWER_FORMS)("refuses %s", (_case, file, source) => {
    expect(psqlProblem(file, source)).not.toBeNull();
  });

  // Phase 16, Q3: the walk reads what git tracks, whatever its extension, so
  // a local log or an ignored file under scripts/ fails no one's run.
  it("walks every file git tracks under scripts/, whatever its extension, and nothing else", () => {
    const root = mkdtempSync(path.join(os.tmpdir(), "q3-walk-"));
    roots.push(root);
    const foreignIndex = path.join(root, "caller-index");
    const inherited = { ...process.env, GIT_INDEX_FILE: foreignIndex };
    const env: NodeJS.ProcessEnv = { ...inherited };
    for (const key of execFileSync("git", ["rev-parse", "--local-env-vars"], {
      encoding: "utf8",
    })
      .trim()
      .split(/\r?\n/))
      delete env[key];
    const git = (...args: string[]) =>
      execFileSync("git", args, { cwd: root, stdio: "pipe", env });
    git("init", "-q");
    const scripts = path.join(root, "scripts");
    mkdirSync(path.join(scripts, "cache"), { recursive: true });
    mkdirSync(path.join(scripts, "node_modules"));
    const tracked = ["a.mts", "b.cts", "c.bash", "d.py", "run", "e.md"];
    for (const name of tracked)
      writeFileSync(path.join(scripts, name), "psql\n");
    writeFileSync(path.join(root, ".gitignore"), "scripts/cache/\n");
    writeFileSync(path.join(scripts, "cache", "ignored.log"), "psql\n");
    writeFileSync(path.join(scripts, "untracked.log"), "psql\n");
    writeFileSync(path.join(scripts, "node_modules", "dep.js"), "psql\n");
    git("add", "--", ...tracked.map((name) => `scripts/${name}`));
    expect(existsSync(foreignIndex)).toBe(false);
    expect(
      scriptsFiles(scripts, env)
        .map((file) => path.basename(file))
        .sort(),
    ).toEqual([...tracked].sort());
  });

  // A new file that names psql is listed by name, even when it only hands
  // psql to the runner: the list is what a reviewer reads.
  it.each([
    [
      "an unlisted import that hands psql to the runner",
      "scripts/x/ok.mjs",
      'import { runPsqlQuery } from "../lib/psql.mjs";\nconst psqlBin = process.env.PSQL_BIN?.trim() || "psql";\nrunPsqlQuery({ databaseUrl, sql: "select 1", psqlBin });\n',
    ],
    [
      "an unlisted shell script that goes through the local-database helper",
      "scripts/x/ok.sh",
      '#!/usr/bin/env bash\nrequire_cmd psql\nlocal_psql() {\n  node "$SCRIPT_DIR/lib/local-database.mjs" psql SUPABASE_DB_URL "$@"\n}\nlocal_psql -c "select 1"\n',
    ],
    [
      "an unlisted file that names psql in a comment only",
      "scripts/x/comment-only.mjs",
      "// psql is never started here.\nexport const answer = 42;\n",
    ],
  ])("refuses %s, until it is listed", (_case, file, source) => {
    expect(psqlProblem(file, source)).toMatch(/not.*listed|neither/);
  });

  // Phase 16, Q2: a count cannot see a swap. Reword the one comment that
  // names psql in a listed file, add a direct start, and the count is the
  // same; the pinned lines are not.
  it("refuses a listed file whose comment loses the word while a start gains it", () => {
    const file = "scripts/release/lib/scram.mjs";
    const original = readFileSync(file, "utf8");
    expect(psqlCount(original)).toBe(1);
    const swapped = `${original.replace(/psql's/i, "the client's")}\nspawnSync("psql", ["-c", "select 1"]);\n`;
    expect(psqlCount(swapped)).toBe(1);
    expect(psqlProblem(file, swapped)).toMatch(
      /not pinned: \["spawnSync\(\\"psql\\".*pinned but gone: \["\/\/ reaches the server/,
    );
  });

  it("refuses a listed file with one more line that names psql", () => {
    const file = "scripts/lib/environment-marker.mjs";
    const source = `${readFileSync(file, "utf8")}\nspawnSync(psqlBin, ["-c", "select 1"]);\n`;
    expect(psqlProblem(file, source)).toMatch(
      /not pinned: \["spawnSync\(psqlBin.*9 line\(s\) against 8 pinned/,
    );
  });

  it("refuses a listed file with the same line once more", () => {
    const file = "scripts/lib/environment-marker.mjs";
    const source = `${readFileSync(file, "utf8")}\n    psqlBin,\n`;
    expect(psqlProblem(file, source)).toMatch(/9 line\(s\) against 8 pinned/);
  });

  // The same lines and the same number of them, but one repeated line traded
  // for another: still a change.
  it("refuses a listed file that trades one repeated line for another", () => {
    const file = "scripts/lib/environment-marker.mjs";
    const source = readFileSync(file, "utf8").replace(
      /^\s*psqlBin,$/m,
      "function query(databaseUrl, sql, psqlBin) {",
    );
    const lines = psqlLines(source);
    expect(new Set(lines)).toEqual(new Set(PSQL_NAMERS[file]!.lines));
    expect(lines.length).toBe(PSQL_NAMERS[file]!.lines.length);
    expect(psqlProblem(file, source)).not.toBeNull();
  });

  it.each([
    [
      "a file that never names psql",
      "scripts/x/plain.mjs",
      'import { spawnSync } from "node:child_process";\nspawnSync("ls", ["-l"]);\n',
    ],
    [
      "Markdown",
      "scripts/x/README.md",
      "Run `psql` through `scripts/lib/psql.mjs`.\n",
    ],
    [
      "a listed starter",
      "scripts/verify/backup-restore-proof.mjs",
      'spawnSync("docker", ["exec", "db", "psql", "-c", "select 1"]);\n',
    ],
  ])("accepts %s", (_case, file, source) => {
    expect(psqlProblem(file, source)).toBeNull();
  });

  it("the three shared builders call the one check and keep the one list", () => {
    for (const file of SHARED_BUILDERS) {
      const source = readFileSync(file, "utf8");
      expect(source, file).toMatch(/\bdatabaseUrlProblem\(/);
      expect(source, file).toMatch(/\bkeptAmbientLibpqEnv\(/);
    }
    expect(
      readFileSync("scripts/verify/stripe-data-pipeline.mjs", "utf8"),
    ).not.toMatch(/databaseUrlProblem|keptAmbientLibpqEnv/);
  });

  it.each(["scripts/AGENTS.md", "scripts/lib/psql.mjs"])(
    "%s names every starter, and the document gate that starts none",
    (file) => {
      const text = readFileSync(file, "utf8");
      for (const starter of PSQL_STARTERS)
        expect(text, starter).toContain(starter);
      expect(text).toContain(
        "scripts/document-cutover/assess-document-cutover.ts",
      );
      expect(text).toContain("KEPT_AMBIENT_LIBPQ_ENV");
      expect(text).not.toMatch(/\bthree files start `?psql/i);
    },
  );
});

// Review N2: the two outliers keep their own checks for now, so the documents
// an operator reads say the check is weaker than the release job's and what
// to set by hand on a hosted address.
describe("the outliers' operator documents (review N2)", () => {
  it.each([
    ["docs/guides/operations/stripe-data-pipeline.md", /sslrootcert=/],
    ["docs/ops/document-cutover/reset-rebuild.md", /NODE_EXTRA_CA_CERTS/],
    [
      "docs/ops/document-cutover/rollback-before-first-canonical-write.md",
      /NODE_EXTRA_CA_CERTS/,
    ],
  ])("%s warns, and says what to set", (file, ca) => {
    const text = readFileSync(file, "utf8");
    expect(text).toMatch(/weaker than the release job's/);
    expect(text).toContain("release-job.md");
    expect(text).toContain("sslmode=verify-full");
    expect(text).toMatch(ca);
  });

  // The gate pins each procedure's version and digest; an edit must move both.
  it("leaves the document gate's pinned procedures equal to the committed documents", async () => {
    const { createHash } = await import("node:crypto");
    const gate = readFileSync(
      "scripts/document-cutover/assess-document-cutover.ts",
      "utf8",
    );
    for (const [name, file] of [
      ["RESET_PROCEDURE", "docs/ops/document-cutover/reset-rebuild.md"],
      [
        "ROLLBACK_PROCEDURE",
        "docs/ops/document-cutover/rollback-before-first-canonical-write.md",
      ],
    ]) {
      const block = gate.slice(
        gate.indexOf(`const ${name} = {`),
        gate.indexOf("};", gate.indexOf(`const ${name} = {`)),
      );
      const text = readFileSync(file, "utf8");
      const digest = createHash("sha256")
        .update(JSON.stringify(text), "utf8")
        .digest("hex");
      expect(block, name).toContain(`"${digest}"`);
      const version = /\*\*Procedure version:\*\* (\d+)/.exec(text)?.[1];
      expect(block, name).toContain(`pinnedVersion: "${version}"`);
    }
  });
});
