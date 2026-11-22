import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../..");
const pendingPath = "tooling/quality/pending.json";
const maxBuffer = 64 * 1024 * 1024;

type Pending = {
  rule: string;
  workspace?: string;
  task: string;
  count: number;
};
type Count = { rule: string; workspace: string; scope: string; count: number };

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parsePending(value: unknown): Pending[] {
  if (!Array.isArray(value))
    throw new Error("Expected an array of pending rules");
  const scopes = new Map<string, Set<string>>();
  return value.map((item: unknown, index) => {
    if (!record(item)) throw new Error(`Invalid pending entry ${index + 1}`);
    const { rule, workspace, task, count } = item;
    if (
      Object.keys(item).some(
        (key) => !["rule", "workspace", "task", "count"].includes(key),
      ) ||
      typeof rule !== "string" ||
      !/^[a-z][\w-]*\/[a-z][\w-]*$/.test(rule) ||
      typeof task !== "string" ||
      !/^RS-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(task) ||
      typeof count !== "number" ||
      !Number.isSafeInteger(count) ||
      count <= 0 ||
      (workspace !== undefined &&
        (typeof workspace !== "string" ||
          !/^(?:\(root\)|\.?[a-z0-9][\w-]*|(?:apps|packages|tooling)\/[a-z0-9][\w-]*)$/.test(
            workspace,
          )))
    )
      throw new Error(
        `Malformed pending entry ${index + 1}: ${JSON.stringify(item)}`,
      );
    const seen = scopes.get(rule) ?? new Set<string>();
    const key = workspace ?? "*";
    if (seen.has(key) || seen.has("*") || (key === "*" && seen.size > 0))
      throw new Error(`Overlapping entry: ${rule} ${key}`);
    seen.add(key);
    scopes.set(rule, seen);
    return {
      rule,
      ...(workspace === undefined ? {} : { workspace }),
      task,
      count,
    };
  });
}

export function readPending(): Pending[] {
  try {
    return parsePending(
      JSON.parse(readFileSync(path.join(root, pendingPath), "utf8")),
    );
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT")
      return [];
    throw error;
  }
}

export function countFindings(report: unknown): Count[] {
  if (
    !record(report) ||
    typeof report.number_of_files !== "number" ||
    report.number_of_files < 1 ||
    !Array.isArray(report.diagnostics)
  )
    throw new Error("Expected a nonempty Oxlint JSON audit");
  const counts = new Map<string, Count>();
  for (const item of report.diagnostics) {
    if (
      !record(item) ||
      typeof item.code !== "string" ||
      typeof item.filename !== "string"
    )
      throw new Error(
        `Unclassified Oxlint diagnostic: ${JSON.stringify(item)}`,
      );
    const native =
      typeof item.url === "string" &&
      /^https:\/\/oxc\.rs\/docs\/guide\/usage\/linter\/rules\/([\w-]+)\/([\w-]+)\.html$/.exec(
        item.url,
      );
    const names = native || /^([\w-]+)\(([\w-]+)\)$/.exec(item.code);
    if (!names?.[1] || !names[2])
      throw new Error(`Unclassified Oxlint rule: ${item.code}`);
    const rule = `${names[1].replaceAll("_", "-")}/${names[2]}`;
    const file = item.filename.replaceAll("\\", "/").replace(/^\.\//, "");
    const [first, second] = file.split("/");
    if (
      !first ||
      path.posix.isAbsolute(file) ||
      /^(?:[a-z]:|\.\.(?:\/|$))/i.test(file)
    )
      throw new Error(`Expected repository-relative path: ${file}`);
    const workspace = !second
      ? "(root)"
      : ["apps", "packages", "tooling"].includes(first)
        ? `${first}/${second}`
        : first;
    const scope = /(?:^|\/)(?:tests|__tests__)\/|\.(?:test|spec)\./.test(file)
      ? "tests"
      : first === "apps" || first === "packages"
        ? "product"
        : "scripts";
    const key = `${rule}\t${workspace}\t${scope}`;
    const row = counts.get(key) ?? { rule, workspace, scope, count: 0 };
    row.count += 1;
    counts.set(key, row);
  }
  return [...counts]
    .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
    .map(([, row]) => row);
}

export function pendingProblems(
  entries: Pending[],
  policy: ReadonlySet<string>,
  parity: ReadonlySet<string>,
  counts: Count[],
  base?: Pending[],
): string[] {
  const problems: string[] = [];
  for (const entry of entries) {
    const label = `${entry.rule} (${entry.workspace ?? "all workspaces"})`;
    if (parity.has(entry.rule))
      problems.push(`Parity rule cannot be pending: ${label}`);
    else if (!policy.has(entry.rule))
      problems.push(`Rule not in the policy: ${label}`);
    else if (
      !counts.some(
        (row) =>
          row.rule === entry.rule &&
          (!entry.workspace || row.workspace === entry.workspace),
      )
    )
      problems.push(`Delete clean pending entry: ${label}`);
    if (
      base &&
      !base.some(
        (old) =>
          old.rule === entry.rule &&
          (!old.workspace || old.workspace === entry.workspace),
      )
    )
      problems.push(`Pending entry added or widened: ${label}`);
  }
  return problems;
}

function git(...args: string[]): string {
  return execFileSync("git", args, {
    cwd: root,
    encoding: "utf8",
    maxBuffer,
    shell: false,
  }).trim();
}

function baseline(ref: string) {
  const revision = git(
    "merge-base",
    "HEAD",
    git("rev-parse", "--verify", "--end-of-options", `${ref}^{commit}`),
  );
  if (git("ls-tree", "--name-only", revision, "--", pendingPath))
    return parsePending(JSON.parse(git("show", `${revision}:${pendingPath}`)));
  return git("log", "-1", "--format=%H", revision, "--", pendingPath)
    ? []
    : undefined;
}

async function main(args: string[]) {
  const snapshot = args.length === 1 && args[0] === "--counts";
  if (
    args.length &&
    !snapshot &&
    !(args.length === 2 && args[0] === "--base" && args[1])
  )
    throw new Error(
      "Run: node scripts/verify/lint-pending.mts [--base <ref> | --counts]",
    );
  process.env.CORE_LINT_AUDIT_PENDING = "1";
  const { policyRules, parityRules } = await import("../../oxlint.config.mts");
  const entries = readPending();
  const base = snapshot
    ? undefined
    : baseline(
        args[1] ??
          (process.env.GITHUB_BASE_REF
            ? `origin/${process.env.GITHUB_BASE_REF}`
            : "origin/develop"),
      );
  const command = ["tooling/quality/lint.mts", "--typed", "--format", "json"];
  const audit = spawnSync(process.execPath, command, {
    cwd: root,
    encoding: "utf8",
    maxBuffer,
    shell: false,
  });
  if (audit.error) throw audit.error;
  if (audit.status !== 0 && audit.status !== 1)
    throw new Error(
      `Typed lint audit failed (${audit.signal ?? audit.status}): ${audit.stderr || audit.stdout.slice(0, 2000)}`,
    );
  const counts = countFindings(JSON.parse(audit.stdout));
  if ((audit.status === 1) !== counts.length > 0)
    throw new Error(
      "Inconsistent typed lint audit status and diagnostic count",
    );
  if (snapshot) {
    console.log(
      JSON.stringify(
        {
          command: `CORE_LINT_AUDIT_PENDING=1 node ${command.join(" ")}`,
          revision: git("rev-parse", "HEAD"),
          counts,
        },
        null,
        2,
      ),
    );
    return 0;
  }
  const problems = pendingProblems(
    entries,
    policyRules,
    parityRules,
    counts,
    base,
  );
  if (problems.length) {
    console.error(problems.join("\n"));
    return 1;
  }
  console.log(`${entries.length} pending scopes verified against typed lint`);
  return 0;
}

if (import.meta.main) {
  main(process.argv.slice(2)).then(
    (status) => {
      process.exitCode = status;
    },
    (error: unknown) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 2;
    },
  );
}
