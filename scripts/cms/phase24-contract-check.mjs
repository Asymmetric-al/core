import { execFileSync } from "node:child_process";
import {
  constants,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = realpathSync(fileURLToPath(new URL("../../", import.meta.url)));
const base = "docs/prds/sitestacker-parity";
const matrix = `${base}/phase-24-multi-site-management-traceability.md`;
const change = "openspec/changes/add-multi-site-management";
const executedCode = [
  "scripts/cms/run-local-e2e.mjs",
  "scripts/cms/phase24-contract-check.mjs",
  "scripts/verify/phase24-authority.mjs",
];
const scope = [
  ...executedCode,
  `${base}/phase-24-*.md`,
  `${base}/phase-24-authority-contract.json`,
  "docs/ai/document-authority.md",
  change,
];
const adverseScenario = "An unresolved P24-01 contract-check fixture scenario";

function git(args) {
  return execFileSync(
    "git",
    ["--no-optional-locks", "-c", "core.fsmonitor=false", "-C", root, ...args],
    {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      shell: false,
      // Git identity must not be redirected by caller Git configuration or credentials.
      env: {
        GIT_CONFIG_NOSYSTEM: "1",
        GIT_CONFIG_GLOBAL: process.platform === "win32" ? "NUL" : "/dev/null",
      },
    },
  );
}

function ownedPath(relative) {
  if (
    path.isAbsolute(relative) ||
    relative.split("/").some((segment) => !segment || segment === "..")
  )
    throw new Error("contract-path");
  let current = root;
  for (const segment of relative.split("/")) {
    current = path.join(current, segment);
    if (lstatSync(current).isSymbolicLink())
      throw new Error("contract-symlink");
  }
  return current;
}

function ownedFile(relative) {
  return readFileSync(ownedPath(relative), {
    encoding: "utf8",
    flag: constants.O_RDONLY | constants.O_NOFOLLOW,
  });
}

export async function runPhase24ContractCheck(args, executedRunnerUrl) {
  const manifest = {
    schemaVersion: 1,
    acceptanceRevision: "p24-01-v2",
    mode: "phase24-contract-check",
    runtimeProof: false,
    outcome: "failed",
    diagnostics: [],
  };
  const fail = (owner, token, code, correction, file = owner) =>
    manifest.diagnostics.push({
      file,
      line: 1,
      column: 1,
      owner,
      token,
      code,
      correction,
    });
  let scratch;
  try {
    if (
      realpathSync(fileURLToPath(executedRunnerUrl)) !==
      path.join(root, executedCode[0])
    )
      fail(
        "executed runner",
        executedCode[0],
        "proof-code-checkout-mismatch",
        "Execute runner, helper and validator code from the same committed checkout.",
      );
    let asserted;
    for (let i = 0; i < args.length; i++) {
      if (args[i] === "--phase24-contract-check") continue;
      if (
        args[i] === "--candidate-sha" &&
        args[i + 1] &&
        asserted === undefined
      )
        asserted = args[++i];
      else
        fail(
          "CLI",
          args[i],
          "usage",
          "Use --phase24-contract-check [--candidate-sha <full-HEAD-SHA>].",
        );
    }
    const checkout = realpathSync(git(["rev-parse", "--show-toplevel"]).trim());
    if (checkout !== root)
      fail(
        "executed checkout",
        "checkout",
        "checkout-mismatch",
        "Run the checked-in proof runner from its own repository checkout.",
      );
    const sha = git(["rev-parse", "--verify", "HEAD"]).trim();
    manifest.candidateSha = sha;
    if (
      asserted !== undefined &&
      (!/^(?:[0-9a-f]{40}|[0-9a-f]{64})$/.test(asserted) || asserted !== sha)
    )
      fail(
        "candidate SHA",
        asserted,
        "candidate-sha-mismatch",
        "Assert the actual full HEAD SHA of the checkout containing the executed runner.",
      );
    function cleanProof() {
      for (const file of executedCode) {
        try {
          ownedFile(file);
        } catch {
          fail(
            file,
            file,
            "proof-code-unavailable",
            "Restore readable repository-owned proof code with no symlink path components.",
          );
        }
        const tracked = git(["ls-files", "--", file]).trim();
        if (tracked !== file)
          fail(
            file,
            file,
            "untracked-proof-code",
            "Commit the executed proof code before binding evidence to HEAD.",
          );
      }
      let authorityPaths = [];
      try {
        const catalog = JSON.parse(
          ownedFile(`${base}/phase-24-authority-contract.json`),
        );
        authorityPaths = Object.values(catalog.authorities ?? {}).filter(
          (file) =>
            typeof file === "string" &&
            /^docs\/adr\/[a-z0-9-]+\.md$/.test(file),
        );
      } catch {
        // Actual malformed contract diagnostics come from favorable validation.
      }
      const dirty = git([
        "diff",
        "--no-ext-diff",
        "--name-only",
        "-z",
        "HEAD",
        "--",
        ...scope,
        ...authorityPaths,
      ])
        .split("\0")
        .filter(Boolean)
        .sort();
      for (const file of dirty)
        fail(
          file,
          file,
          "dirty-proof-input",
          "Commit or restore this tracked proof input/code before capturing candidate evidence.",
        );
      if (git(["rev-parse", "--verify", "HEAD"]).trim() !== sha)
        fail(
          "candidate SHA",
          sha,
          "candidate-source-changed",
          "Retry from an unchanged committed candidate.",
        );
    }
    cleanProof();
    if (!manifest.diagnostics.length) {
      const { validatePhase24 } =
        await import("../verify/phase24-authority.mjs");
      const favorable = validatePhase24(root);
      manifest.inputIdentity = favorable.inputIdentity;
      if (favorable.outcome !== "valid" || favorable.diagnostics.length)
        manifest.diagnostics.push(...favorable.diagnostics);
      else {
        // Copy only repository-owned contract documents, never runtime data or environment files.
        const catalog = JSON.parse(
          ownedFile(`${base}/phase-24-authority-contract.json`),
        );
        const files = new Set([
          `${base}/phase-24-authority-contract.json`,
          "docs/ai/document-authority.md",
          ...Object.values(catalog.authorities),
          ...["proposal", "design", "tasks"].map(
            (name) => `${change}/${name}.md`,
          ),
        ]);
        for (const name of readdirSync(ownedPath(base)).sort())
          if (/^phase-24-.*\.md$/.test(name)) files.add(`${base}/${name}`);
        for (const capability of readdirSync(
          path.join(root, `${change}/specs`),
        ).sort())
          files.add(`${change}/specs/${capability}/spec.md`);
        const temporaryBase = realpathSync(tmpdir());
        if (temporaryBase === root || temporaryBase.startsWith(root + path.sep))
          throw new Error("scratch-inside-source");
        scratch = mkdtempSync(path.join(tmpdir(), "phase24-contract-proof-"));
        for (const file of [...files].sort()) {
          const text = ownedFile(file);
          const destination = path.join(scratch, file);
          mkdirSync(path.dirname(destination), { recursive: true });
          writeFileSync(destination, text);
        }
        const original = readFileSync(path.join(scratch, matrix), "utf8");
        let changedRows = 0;
        const mutated = original
          .split("\n")
          .map((line) => {
            if (!/^\|\s*US24-119\s*\|/.test(line)) return line;
            changedRows++;
            const cells = line.split("|");
            cells[6] = ` ${adverseScenario} `;
            return cells.join("|");
          })
          .join("\n");
        if (changedRows !== 1)
          fail(
            "US24-119",
            "US24-119",
            "fixture-owner-missing",
            "Restore exactly one US24-119 matrix row.",
            matrix,
          );
        else {
          writeFileSync(path.join(scratch, matrix), mutated);
          const adverse = validatePhase24(scratch),
            second = validatePhase24(scratch);
          writeFileSync(path.join(scratch, matrix), original);
          const recovery = validatePhase24(scratch);
          manifest.evidence = {
            favorable,
            adverse,
            retry: { first: adverse, second },
            recovery,
          };
          if (
            adverse.outcome !== "invalid" ||
            !adverse.diagnostics.some(
              (d) =>
                d.owner === "US24-119" &&
                d.token === adverseScenario &&
                d.code === "scenario-owner",
            )
          )
            fail(
              "US24-119",
              adverseScenario,
              "adverse-proof-missing",
              "The isolated unresolved scenario must produce an owned failing diagnostic.",
              matrix,
            );
          if (JSON.stringify(adverse) !== JSON.stringify(second))
            fail(
              "retry",
              "US24-119",
              "retry-drift",
              "Repeat evaluation of identical adverse bytes must agree completely.",
              matrix,
            );
          if (JSON.stringify(favorable) !== JSON.stringify(recovery))
            fail(
              "recovery",
              matrix,
              "recovery-drift",
              "Restoring original fixture bytes must restore the exact favorable result.",
              matrix,
            );
          if (
            JSON.stringify(validatePhase24(root)) !== JSON.stringify(favorable)
          )
            fail(
              matrix,
              matrix,
              "source-changed",
              "Retry after contract sources stop changing.",
              matrix,
            );
          cleanProof();
          if (!manifest.diagnostics.length) manifest.outcome = "passed";
        }
      }
    }
  } catch {
    fail(
      "repository proof",
      "phase24-contract-check",
      "proof-unavailable",
      "Use a clean committed repository checkout with readable scoped contract files and Git installed.",
    );
  } finally {
    if (scratch) {
      try {
        rmSync(scratch, { recursive: true, force: true });
      } catch {
        manifest.outcome = "failed";
        fail(
          "scratch cleanup",
          "phase24-contract-check",
          "cleanup-failed",
          "Remove the isolated proof scratch directory before retrying.",
        );
      }
    }
  }
  manifest.diagnostics.sort((a, b) =>
    a.file < b.file
      ? -1
      : a.file > b.file
        ? 1
        : a.line - b.line || (a.code < b.code ? -1 : a.code > b.code ? 1 : 0),
  );
  console.log(JSON.stringify(manifest));
  return manifest.outcome === "passed" ? 0 : 1;
}
