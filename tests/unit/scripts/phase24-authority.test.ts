import { execFile, spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  readlinkSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

const repository = fileURLToPath(new URL("../../../", import.meta.url));
const cli = path.join(repository, "scripts/verify/phase24-authority.mjs");
const contracts = "docs/prds/sitestacker-parity";
const matrix = `${contracts}/phase-24-multi-site-management-traceability.md`;
const prd = `${contracts}/phase-24-multi-site-management.md`;
const decisionLog = `${contracts}/phase-24-multi-site-management-decision-log.md`;
const catalogPath = `${contracts}/phase-24-authority-contract.json`;
const change = "openspec/changes/add-multi-site-management";
const scratchDirectories: string[] = [];

type Catalog = {
  schemaVersion: number;
  contract: string;
  proofs: Array<{ id: string; owners: string[]; validationKinds: string[] }>;
  releases: Array<{ id: string; owners: string[] }>;
  authorities: Record<string, string>;
  predecessors: Array<{
    issue: number;
    excludedClauses?: string[];
    allowedClauses?: string[];
  }>;
};

type Diagnostic = {
  file: string;
  owner: string;
  token: string;
  code: string;
};

function changeCatalog(root: string, changeValue: (catalog: Catalog) => void) {
  edit(root, catalogPath, (text) => {
    const catalog = JSON.parse(text) as Catalog;
    changeValue(catalog);
    return `${JSON.stringify(catalog, null, 2)}\n`;
  });
}

function expectOwnedDiagnostic(root: string, owner: string, token: string) {
  const result = run(root);
  expect(result.error).toBeUndefined();
  expect(result.status).not.toBe(0);
  const report = JSON.parse(result.stdout) as { diagnostics: Diagnostic[] };
  expect(
    report.diagnostics.some(
      (diagnostic) =>
        diagnostic.owner === owner && diagnostic.token.includes(token),
    ),
    `expected owner ${owner} and invalid token ${token}: ${result.stdout}`,
  ).toBe(true);
  return report;
}

type Mutation = {
  name: string;
  row: string;
  column: number;
  value: string;
  token: string;
};

const mutations = JSON.parse(
  readFileSync(
    path.join(repository, "tests/fixtures/phase24-authority/mutations.json"),
    "utf8",
  ),
) as Mutation[];

// This whitelist copies only repository documentation, never env files,
// credentials, application data, dependencies, or generated runtime state.
function checkout() {
  const root = mkdtempSync(path.join(tmpdir(), "phase24-authority-"));
  scratchDirectories.push(root);
  const files = ["glossary.md", "docs/ai/document-authority.md"];
  for (const file of readdirSync(path.join(repository, contracts))) {
    if (
      /^phase-(?:02|05|12|13|16|17|20|23|24)[-.].*\.(?:md|json)$/.test(file)
    ) {
      files.push(`${contracts}/${file}`);
    }
  }
  for (const file of readdirSync(path.join(repository, "docs/adr"))) {
    if (/^(?:0013|0017|0030|0061|018[5-9]|019\d|020[0-5])-.*\.md$/.test(file)) {
      files.push(`docs/adr/${file}`);
    }
  }
  for (const relative of files) {
    const source = path.join(repository, relative);
    if (existsSync(source)) {
      mkdirSync(path.dirname(path.join(root, relative)), { recursive: true });
      cpSync(source, path.join(root, relative));
    }
  }
  for (const relative of [change, "openspec/specs"]) {
    mkdirSync(path.dirname(path.join(root, relative)), { recursive: true });
    cpSync(path.join(repository, relative), path.join(root, relative), {
      recursive: true,
    });
  }
  return root;
}

function environment(extra: Record<string, string> = {}) {
  return {
    PATH: process.env.PATH,
    LANG: "C",
    LC_ALL: "C",
    TZ: "UTC",
    ...extra,
  };
}

function run(root: string, extra: Record<string, string> = {}) {
  return spawnSync(process.execPath, [cli, "--root", root, "--json"], {
    cwd: root,
    env: environment(extra),
    encoding: "utf8",
    timeout: 20_000,
    maxBuffer: 4 * 1024 * 1024,
    shell: false,
  });
}

function runConcurrent(root: string) {
  return new Promise<{ status: number; stdout: string; stderr: string }>(
    (resolve, reject) => {
      execFile(
        process.execPath,
        [cli, "--root", root, "--json"],
        {
          cwd: root,
          env: environment(),
          timeout: 20_000,
          maxBuffer: 4 * 1024 * 1024,
          encoding: "utf8",
          shell: false,
        },
        (error, stdout, stderr) => {
          if (error && typeof error.code !== "number") {
            reject(error);
            return;
          }
          resolve({
            status: typeof error?.code === "number" ? error.code : 0,
            stdout,
            stderr,
          });
        },
      );
    },
  );
}

function edit(
  root: string,
  relative: string,
  changeText: (text: string) => string,
) {
  const filename = path.join(root, relative);
  const original = readFileSync(filename, "utf8");
  const changed = changeText(original);
  expect(changed, `fixture must change ${relative}`).not.toBe(original);
  writeFileSync(filename, changed);
}

// Cell editing is fixture construction against the documented table format;
// assertions do not reproduce or import the production parser.
function changeCell(root: string, mutation: Mutation) {
  let lineNumber = 0;
  edit(root, matrix, (text) =>
    text
      .split("\n")
      .map((line, index) => {
        if (!new RegExp(`^\\|\\s*${mutation.row}\\s*\\|`).test(line)) {
          return line;
        }
        lineNumber = index + 1;
        const cells = line.split("|");
        cells[mutation.column + 1] = ` ${mutation.value} `;
        return cells.join("|");
      })
      .join("\n"),
  );
  expect(lineNumber).toBeGreaterThan(0);
  return lineNumber;
}

function expectFailure(
  root: string,
  owner: string,
  relative: string,
  token: string,
  line?: number,
) {
  const result = run(root);
  expect(result.error).toBeUndefined();
  expect(result.signal).toBeNull();
  expect(result.status).not.toBe(0);
  const json = JSON.parse(result.stdout) as unknown;
  const diagnostics = JSON.stringify(json);
  expect(diagnostics).toContain(owner);
  expect(diagnostics).toContain(relative);
  expect(diagnostics).toContain(token);
  if (line !== undefined) {
    expect(diagnostics).toMatch(new RegExp(`\\b${line}\\b`));
  }
  expect(diagnostics).not.toContain(root);
  return result;
}

function filesystemIdentity(root: string): string[] {
  const entries: string[] = [];
  function visit(relative: string) {
    const current = path.join(root, relative);
    const stat = lstatSync(current);
    if (stat.isSymbolicLink()) {
      entries.push(`${relative}:link:${readlinkSync(current)}`);
    } else if (stat.isDirectory()) {
      entries.push(`${relative}:directory:${stat.mode}`);
      for (const name of readdirSync(current).sort()) {
        visit(path.join(relative, name));
      }
    } else {
      const digest = createHash("sha256")
        .update(readFileSync(current))
        .digest("hex");
      entries.push(`${relative}:file:${stat.mode}:${digest}`);
    }
  }
  visit("");
  return entries;
}

afterEach(() => {
  for (const root of scratchDirectories.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("Phase 24 authority through the public read-only CLI", () => {
  it("accepts the complete approved graph with a versioned JSON result", () => {
    const result = run(checkout());
    expect(result.error).toBeUndefined();
    expect(result.status, result.stderr || result.stdout).toBe(0);
    const report = JSON.parse(result.stdout) as Record<string, unknown>;
    expect(report).not.toBeNull();
    expect(Array.isArray(report)).toBe(false);
    expect(
      Object.entries(report).some(
        ([name, value]) =>
          /version/i.test(name) &&
          (typeof value === "number" || typeof value === "string"),
      ),
      "the public persisted result must identify its contract version",
    ).toBe(true);
  });

  it.each(mutations)(
    "rejects $name with the owning source location",
    (mutation) => {
      const root = checkout();
      const line = changeCell(root, mutation);
      expectFailure(root, mutation.row, matrix, mutation.token, line);
    },
  );

  it("rejects a missing story matrix row", () => {
    const root = checkout();
    edit(root, matrix, (text) => text.replace(/^\|\s*US24-119\s*\|.*\n/m, ""));
    expectFailure(root, "US24-119", matrix, "US24-119");
  });

  it("accepts the equivalent traceability matrix with CRLF line endings", () => {
    const root = checkout();
    edit(root, matrix, (text) => text.replace(/\r?\n/g, "\r\n"));
    const result = run(root);
    expect(result.status, result.stderr || result.stdout).toBe(0);
  });

  it.each([
    ["US24-001", "Release Closure Rule"],
    ["D1", "Release Closure Rule"],
    ["US24-001", "Founder Decision Matrix"],
    ["D1", "User Story Matrix"],
  ])("rejects %s moved outside its owning matrix into %s", (owner, section) => {
    const root = checkout();
    edit(root, matrix, (text) => {
      const row = text.match(
        new RegExp(`^\\|\\s*${owner}\\s*\\|.*\\n`, "m"),
      )![0];
      return text
        .replace(row, "")
        .replace(`## ${section}\n`, `## ${section}\n\n${row}`);
    });
    expectFailure(root, owner, matrix, owner);
  });

  it("rejects a missing independent PRD numbered story", () => {
    const root = checkout();
    edit(root, prd, (text) =>
      text.replace(/^119\. As a product owner,.*\n/m, ""),
    );
    expectFailure(root, "119", prd, "119");
  });

  it("rejects duplicate decision rows without normalizing them away", () => {
    const root = checkout();
    edit(root, matrix, (text) => text.replace(/^(\|\s*D1\s*\|.*)$/m, "$1\n$1"));
    expectFailure(root, "D1", matrix, "D1");
  });

  it("rejects a normative out-of-scope decision row", () => {
    const root = checkout();
    changeCell(root, {
      name: "out-of-scope decision",
      row: "D18",
      column: 0,
      value: "D56",
      token: "D56",
    });
    expectFailure(root, "D56", matrix, "D56");
  });

  it.each(["D56", "D85"])(
    "rejects an additional normative %s decision-log heading with the matrix unchanged",
    (decision) => {
      const root = checkout();
      edit(
        root,
        decisionLog,
        (text) =>
          `${text}\n## ${decision} — Additional Phase 24 founder decision\n\nThis is a controlling Phase 24 launch decision.\n`,
      );
      const result = expectFailure(root, decision, decisionLog, decision);
      const report = JSON.parse(result.stdout) as {
        diagnostics: Diagnostic[];
      };
      expect(report.diagnostics).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            file: decisionLog,
            owner: decision,
            token: decision,
          }),
        ]),
      );
    },
  );

  it("permits historical D56 prose without promoting it to decision authority", () => {
    const root = checkout();
    edit(
      root,
      decisionLog,
      (text) =>
        `${text}\nThe former D56 draft remains deferred cross-phase research, not a controlling Phase 24 decision.\n`,
    );
    const result = run(root);
    expect(result.error).toBeUndefined();
    expect(result.status, result.stdout || result.stderr).toBe(0);
    expect(JSON.parse(result.stdout).diagnostics).toEqual([]);
  });

  it("rejects an uncovered newly added OpenSpec requirement and scenario", () => {
    const root = checkout();
    const spec = `${change}/specs/multi-site-management/spec.md`;
    edit(
      root,
      spec,
      (text) =>
        `${text}\n### Requirement: Uncovered Phase 24 Obligation\n\nCore SHALL preserve the declared documentation graph.\n\n#### Scenario: An uncovered contract is introduced\n\n- **WHEN** a normative contract is introduced\n- **THEN** its trace must exist\n`,
    );
    expectFailure(
      root,
      "Uncovered Phase 24 Obligation",
      spec,
      "Uncovered Phase 24 Obligation",
    );
  });

  it("rejects duplicate task declarations", () => {
    const root = checkout();
    const tasks = `${change}/tasks.md`;
    edit(
      root,
      tasks,
      (text) => `${text}\n- [ ] 1.3 Duplicate task declaration.\n`,
    );
    expectFailure(root, "1.3", tasks, "1.3");
  });

  it("requires both ADRs in a compound authority reference", () => {
    const root = checkout();
    rmSync(
      path.join(
        root,
        "docs/adr/0017-donor-anchored-civil-date-recurring-schedules.md",
      ),
    );
    expectFailure(root, "D65", matrix, "0017");
  });

  it("produces identical ordered diagnostics on repeated and concurrent runs", async () => {
    const root = checkout();
    const line = changeCell(root, mutations[0]);
    const first = expectFailure(
      root,
      "US24-119",
      matrix,
      mutations[0].token,
      line,
    );
    const second = run(root);
    const concurrent = await Promise.all([
      runConcurrent(root),
      runConcurrent(root),
    ]);
    expect(second.status).toBe(first.status);
    expect(second.stdout).toBe(first.stdout);
    expect(second.stderr).toBe(first.stderr);
    for (const result of concurrent) {
      expect(result.status).toBe(first.status);
      expect(result.stdout).toBe(first.stdout);
      expect(result.stderr).toBe(first.stderr);
    }
  });

  it("has stable diagnostics in equivalent checkout locations", () => {
    const left = checkout();
    const right = checkout();
    changeCell(left, mutations[0]);
    changeCell(right, mutations[0]);
    const first = expectFailure(left, "US24-119", matrix, mutations[0].token);
    const second = expectFailure(right, "US24-119", matrix, mutations[0].token);
    expect(second.stdout).toBe(first.stdout);
    expect(second.stderr).toBe(first.stderr);
  });

  it("leaves source files and directory membership unchanged on success and failure", () => {
    const root = checkout();
    const beforeSuccess = filesystemIdentity(root);
    const success = run(root);
    expect(success.status, success.stderr || success.stdout).toBe(0);
    expect(filesystemIdentity(root)).toEqual(beforeSuccess);
    changeCell(root, mutations[0]);
    const beforeFailure = filesystemIdentity(root);
    expectFailure(root, "US24-119", matrix, mutations[0].token);
    expect(filesystemIdentity(root)).toEqual(beforeFailure);
  });

  it("retries cleanly after a terminated invocation without leaving state", async () => {
    const root = checkout();
    const before = filesystemIdentity(root);
    const child = spawn(process.execPath, [cli, "--root", root, "--json"], {
      cwd: root,
      env: environment(),
      stdio: "ignore",
      shell: false,
    });
    const signal = await new Promise<NodeJS.Signals | null>(
      (resolve, reject) => {
        child.once("error", reject);
        child.once("spawn", () => child.kill("SIGTERM"));
        child.once("close", (_code, interruptedBy) => resolve(interruptedBy));
      },
    );
    expect(signal).toBe("SIGTERM");
    const retry = run(root);
    const clean = run(root);
    expect(retry.status, retry.stderr || retry.stdout).toBe(0);
    expect(retry.stdout).toBe(clean.stdout);
    expect(retry.stderr).toBe(clean.stderr);
    expect(filesystemIdentity(root)).toEqual(before);
  });

  it("does not use provider credentials or locale to change evaluation", () => {
    const root = checkout();
    const clean = run(root);
    const withSyntheticEnvironment = run(root, {
      LANG: "tr_TR.UTF-8",
      TZ: "Pacific/Auckland",
      SUPABASE_SERVICE_ROLE_KEY: "synthetic-unit-only-never-a-credential",
      STRIPE_SECRET_KEY: "synthetic-unit-only-never-a-credential",
      VERCEL_TOKEN: "synthetic-unit-only-never-a-credential",
    });
    expect(clean.status, clean.stderr || clean.stdout).toBe(0);
    expect(withSyntheticEnvironment.status).toBe(0);
    expect(withSyntheticEnvironment.stdout).toBe(clean.stdout);
    expect(withSyntheticEnvironment.stderr).toBe(clean.stderr);
    expect(
      withSyntheticEnvironment.stdout + withSyntheticEnvironment.stderr,
    ).not.toContain("synthetic-unit-only-never-a-credential");
  });

  it("rejects a symlink escape without disclosing outside file contents", () => {
    const root = checkout();
    const outside = mkdtempSync(
      path.join(tmpdir(), "phase24-outside-sentinel-"),
    );
    scratchDirectories.push(outside);
    const sentinel = path.join(outside, "private-sentinel.md");
    writeFileSync(sentinel, "SYNTHETIC_PRIVATE_CONTENT_MUST_NEVER_BE_PRINTED");
    rmSync(path.join(root, matrix));
    symlinkSync(sentinel, path.join(root, matrix));
    const result = expectFailure(root, matrix, matrix, matrix);
    expect(result.stdout + result.stderr).not.toContain(
      "SYNTHETIC_PRIVATE_CONTENT_MUST_NEVER_BE_PRINTED",
    );
  });

  it("rejects a recursive symlink instead of hanging", () => {
    const root = checkout();
    const filename = path.join(root, matrix);
    rmSync(filename);
    symlinkSync(path.basename(filename), filename);
    expectFailure(root, matrix, matrix, matrix);
  });
});

describe("Phase 24 approved catalog and source snapshot obligations", () => {
  it("rejects manual-only validation with a semantic story diagnostic", () => {
    const root = checkout();
    changeCatalog(root, (catalog) => {
      const trace = catalog.proofs.find((proof) => proof.id === "T24-TRACE");
      expect(trace?.owners).toEqual(["US24-119"]);
      trace!.validationKinds = ["manual"];
    });
    const report = expectOwnedDiagnostic(root, "US24-119", "T24-TRACE");
    expect(
      report.diagnostics.some(
        (diagnostic) =>
          diagnostic.owner === "US24-119" &&
          /deterministic|manual/.test(diagnostic.code),
      ),
      "a stale-catalog hash alone does not prove the HITL-only story rule",
    ).toBe(true);
  });

  it("accepts the approved combined automated/manual accessibility obligations", () => {
    const root = checkout();
    const catalog = JSON.parse(
      readFileSync(path.join(root, catalogPath), "utf8"),
    ) as Catalog;
    expect(
      catalog.proofs.find((proof) => proof.id === "A24-COPY")?.validationKinds,
    ).toEqual(["deterministic", "manual"]);
    const result = run(root);
    expect(result.status, result.stdout || result.stderr).toBe(0);
  });

  it.each([479, 482, 485, 486, 487])(
    "rejects omission of predecessor #%i exclusions with its issue owner",
    (issue) => {
      const root = checkout();
      changeCatalog(root, (catalog) => {
        delete catalog.predecessors.find((entry) => entry.issue === issue)!
          .excludedClauses;
      });
      expectOwnedDiagnostic(root, `#${issue}`, `#${issue}`);
    },
  );

  it.each([480, 482])(
    "rejects removal of compatible #%i declarations with its issue owner",
    (issue) => {
      const root = checkout();
      changeCatalog(root, (catalog) => {
        catalog.predecessors.find(
          (entry) => entry.issue === issue,
        )!.allowedClauses = [];
      });
      expectOwnedDiagnostic(root, `#${issue}`, `#${issue}`);
    },
  );

  it("preserves compatible #480 Money and #482 fail-closed/no-Payload authority", () => {
    const root = checkout();
    changeCell(root, {
      name: "compatible Money predecessor",
      row: "D2",
      column: 1,
      value:
        "decision log D2; #480 currency-aware integer minor-unit Money semantics",
      token: "#480",
    });
    changeCell(root, {
      name: "compatible host-boundary predecessor",
      row: "D4",
      column: 1,
      value:
        "decision log D4; #482 unknown production host fails closed; no Payload import in Giving",
      token: "#482",
    });
    const result = run(root);
    expect(result.status, result.stdout || result.stderr).toBe(0);
  });

  it("does not let a compatible #482 phrase revive its excluded host-array authority", () => {
    const root = checkout();
    const line = changeCell(root, {
      name: "mixed compatible and excluded predecessor clauses",
      row: "D4",
      column: 1,
      value:
        "decision log D4; #482 public.sites primary_domain and alias_domains resolver authority; no Payload import in Giving",
      token: "#482",
    });
    expectFailure(root, "D4", matrix, "#482", line);
  });

  it("rejects an unsupported catalog version", () => {
    const root = checkout();
    changeCatalog(root, (catalog) => {
      catalog.schemaVersion = 999;
    });
    expectOwnedDiagnostic(root, "phase24-authority-v1", "999");
  });

  it("rejects a missing required proof owner declaration", () => {
    const root = checkout();
    changeCatalog(root, (catalog) => {
      const trace = catalog.proofs.find((proof) => proof.id === "T24-TRACE")!;
      delete (trace as Partial<typeof trace>).owners;
    });
    expectOwnedDiagnostic(root, "T24-TRACE", "owners");
  });

  it("rejects an unknown catalog field with the field owner", () => {
    const root = checkout();
    changeCatalog(root, (catalog) => {
      const trace = catalog.proofs.find((proof) => proof.id === "T24-TRACE")!;
      Object.assign(trace, { guessedRuntimeAuthority: true });
    });
    expectOwnedDiagnostic(root, "T24-TRACE", "guessedRuntimeAuthority");
  });

  it("rejects a missing approved proof identifier with its story owner", () => {
    const root = checkout();
    changeCatalog(root, (catalog) => {
      catalog.proofs = catalog.proofs.filter(
        (proof) => proof.id !== "T24-TRACE",
      );
    });
    expectOwnedDiagnostic(root, "US24-119", "T24-TRACE");
  });

  it("rejects a missing approved release identifier with its story owner", () => {
    const root = checkout();
    changeCatalog(root, (catalog) => {
      catalog.releases = catalog.releases.filter(
        (release) => release.id !== "EV24-TRACE",
      );
    });
    expectOwnedDiagnostic(root, "US24-119", "EV24-TRACE");
  });

  it("rejects a proof silently remapped away from its originating story", () => {
    const root = checkout();
    changeCatalog(root, (catalog) => {
      catalog.proofs.find((proof) => proof.id === "T24-TRACE")!.owners = [
        "US24-120",
      ];
    });
    expectOwnedDiagnostic(root, "US24-119", "T24-TRACE");
  });

  it("rejects an unknown declared validation kind", () => {
    const root = checkout();
    changeCatalog(root, (catalog) => {
      catalog.proofs.find(
        (proof) => proof.id === "T24-TRACE",
      )!.validationKinds = ["guessed"];
    });
    expectOwnedDiagnostic(root, "T24-TRACE", "guessed");
  });

  it("rejects an unknown catalog owner with the proof and invalid owner token", () => {
    const root = checkout();
    changeCatalog(root, (catalog) => {
      catalog.proofs
        .find((proof) => proof.id === "T24-TRACE")!
        .owners.push("US24-999");
    });
    expectOwnedDiagnostic(root, "T24-TRACE", "US24-999");
  });

  it("identifies a duplicate catalog proof at its exact obligation owner", () => {
    const root = checkout();
    changeCatalog(root, (catalog) => {
      const trace = catalog.proofs.find((proof) => proof.id === "T24-TRACE")!;
      catalog.proofs.push({ ...trace });
    });
    expectOwnedDiagnostic(root, "T24-TRACE", "T24-TRACE");
  });

  it("identifies one missing predecessor clause even when other exclusions remain", () => {
    const root = checkout();
    const clause = "host and locale arrays on public.sites";
    changeCatalog(root, (catalog) => {
      const predecessor = catalog.predecessors.find(
        (entry) => entry.issue === 479,
      )!;
      predecessor.excludedClauses = predecessor.excludedClauses!.filter(
        (value) => value !== clause,
      );
    });
    expectOwnedDiagnostic(root, "#479", clause);
  });

  it("accepts canonical ticket boundaries and numeric ranges without a ticket graph", () => {
    const root = checkout();
    edit(
      root,
      matrix,
      (text) =>
        `${text}\n## Published ticket references\n\nP24-01 P24-09 P24-10 P24-99 P24-100 P24-126 P24-01–P24-126 P24-09-P24-10\n`,
    );
    const result = run(root);
    expect(result.status, result.stdout || result.stderr).toBe(0);
  });

  it.each([
    "P24-1",
    "P24-001",
    "P24-00",
    "P24-127",
    "P24-126–P24-01",
    "P24-01–P24-127",
    "P24-001–P24-09",
    "P24-01-STRIPE",
    "P24-01–P24-STRIPE",
  ])("rejects malformed or out-of-scope ticket reference %s", (ticket) => {
    const root = checkout();
    edit(
      root,
      matrix,
      (text) => `${text}\n## Published ticket references\n\n${ticket}\n`,
    );
    expectFailure(root, "implementation tickets", matrix, ticket);
  });

  it("rejects input bytes replaced after a real contract read and permits a clean retry", () => {
    const root = checkout();
    const filename = path.join(root, matrix);
    const original = readFileSync(filename, "utf8");
    const replacement = `${filename}.fixture-replacement`;
    const changed = `${original}\n<!-- concurrent fixture revision -->\n`;
    const marker = path.join(root, "fixture-read-observed");
    const preload = path.join(root, "fixture-filesystem-boundary.mjs");
    writeFileSync(replacement, changed);
    // Instrument only Node's public filesystem boundary in an isolated child.
    // Real opens/reads still occur; the first completed target read atomically
    // replaces real fixture bytes before returning its captured bytes. No
    // validator import, private helper, fake result, timing or atime is used.
    writeFileSync(
      preload,
      `import fs from "node:fs";
import { syncBuiltinESMExports } from "node:module";
const open = fs.openSync;
const read = fs.readFileSync;
const close = fs.closeSync;
const target = process.env.PHASE24_FIXTURE_TARGET;
const descriptors = new Set();
let replaced = false;
fs.openSync = function (filename, ...args) {
  const fd = open.call(this, filename, ...args);
  if (String(filename) === target) descriptors.add(fd);
  return fd;
};
fs.readFileSync = function (source, ...args) {
  const bytes = read.call(this, source, ...args);
  if (!replaced && (String(source) === target || descriptors.has(source))) {
    replaced = true;
    fs.renameSync(process.env.PHASE24_FIXTURE_REPLACEMENT, target);
    fs.writeFileSync(process.env.PHASE24_FIXTURE_MARKER, "read-then-replaced");
  }
  return bytes;
};
fs.closeSync = function (fd) {
  descriptors.delete(fd);
  return close.call(this, fd);
};
syncBuiltinESMExports();
`,
    );
    const result = spawnSync(
      process.execPath,
      ["--import", preload, cli, "--root", root, "--json"],
      {
        cwd: root,
        env: environment({
          PHASE24_FIXTURE_TARGET: filename,
          PHASE24_FIXTURE_REPLACEMENT: replacement,
          PHASE24_FIXTURE_MARKER: marker,
        }),
        encoding: "utf8",
        timeout: 20_000,
        maxBuffer: 4 * 1024 * 1024,
        shell: false,
      },
    );
    expect(result.error).toBeUndefined();
    expect(result.signal).toBeNull();
    expect(readFileSync(marker, "utf8")).toBe("read-then-replaced");
    expect(readFileSync(filename, "utf8")).toBe(changed);
    expect(existsSync(replacement)).toBe(false);
    expect(result.status, result.stdout || result.stderr).not.toBe(0);
    const report = JSON.parse(result.stdout) as {
      inputIdentity: string;
      diagnostics: Diagnostic[];
    };
    expect(report.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          file: matrix,
          owner: matrix,
          code: "source-changed",
        }),
      ]),
    );
    const retry = run(root);
    expect(retry.error).toBeUndefined();
    expect(retry.status, retry.stdout || retry.stderr).toBe(0);
    const recovery = JSON.parse(retry.stdout);
    expect(recovery.diagnostics).toEqual([]);
    expect(recovery.inputIdentity).not.toBe(report.inputIdentity);
    expect(readFileSync(filename, "utf8")).toBe(changed);
    expect(run(root).stdout).toBe(retry.stdout);
  });
});
