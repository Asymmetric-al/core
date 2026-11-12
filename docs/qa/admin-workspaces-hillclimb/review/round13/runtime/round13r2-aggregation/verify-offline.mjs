import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

const helper = await import("./aggregate.mjs");
const { validateInputs } = helper;
const rejected = validateInputs({}, {}).report;
assert.equal(rejected.status, "REJECTED");
assert.ok(rejected.errors.some((error) => error.code === "INPUT_SCHEMA"));
console.log("PASS: an unspecified input contract fails closed");

const here = dirname(fileURLToPath(import.meta.url));
const scratch = mkdtempSync(join(here, ".offline-selfcheck-"));
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const json = (value) => Buffer.from(JSON.stringify(value, null, 2) + "\n");
const utc = (seconds) =>
  new Date(Date.parse("2026-01-01T00:00:00Z") + seconds * 1000).toISOString();
function write(file, bytes) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, bytes, { flag: "wx" });
  return { path: file, sha256: sha256(bytes) };
}
function record(file, value) {
  return write(file, json(value));
}
function png(width, height) {
  const crc = (bytes) => {
    let checksum = 0xffffffff;
    for (const byte of bytes) {
      checksum ^= byte;
      for (let bit = 0; bit < 8; bit++)
        checksum = (checksum >>> 1) ^ (checksum & 1 ? 0xedb88320 : 0);
    }
    return (checksum ^ 0xffffffff) >>> 0;
  };
  const chunk = (name, data) => {
    const body = Buffer.concat([Buffer.from(name), data]);
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length);
    const checksum = Buffer.alloc(4);
    checksum.writeUInt32BE(crc(body));
    return Buffer.concat([length, body, checksum]);
  };
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(Buffer.alloc((width * 4 + 1) * height))),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function syntheticCase(name) {
  const repoRoot = join(scratch, name);
  const qaRoot = join(repoRoot, "qa");
  const runtimeRoot = join(qaRoot, "runtime");
  const catalogue = {
    viewports: [
      { name: "desktop", width: 2, height: 2 },
      { name: "mobile", width: 1, height: 2 },
    ],
    states: [
      {
        name: "crm-example",
        area: "crm",
        widths: ["desktop", "mobile"],
        full: true,
        dialog: false,
        setup: false,
        routePath: "/crm",
      },
      {
        name: "studio-example",
        area: "studio",
        widths: ["desktop"],
        full: false,
        dialog: true,
        setup: true,
        routePath: "/studio",
      },
    ],
  };
  const diff = write(
    join(qaRoot, "round13r2.diff"),
    Buffer.from("synthetic source diff\n"),
  );
  const input = write(
    join(qaRoot, "catalogue-input.mjs"),
    Buffer.from("synthetic immutable input\n"),
  );
  const frozenSource = write(
    join(repoRoot, "synthetic-source"),
    Buffer.from("synthetic frozen product\n"),
  );
  const manifest = record(join(qaRoot, "round13r2-manifest.json"), {
    checkpoint: "round13r2",
    diffSha256: diff.sha256,
    files: [{ path: "synthetic-source", sha256: frozenSource.sha256 }],
  });
  const plan = record(join(qaRoot, "plan.json"), {
    viewports: catalogue.viewports,
    areas: Object.fromEntries(
      catalogue.states.map((state) => [
        state.area,
        {
          states: [{ name: state.name, widths: state.widths }],
          batches: [[state.name]],
        },
      ]),
    ),
  });
  const identity = {
    manifestSha256: manifest.sha256,
    diffSha256: diff.sha256,
    batchPlanSha256: plan.sha256,
    inputHashes: { "qa/catalogue-input.mjs": input.sha256 },
    frozenFileCount: 1,
  };
  const context = {
    repoRoot,
    qaRoot,
    runtimeRoot,
    manifestPath: manifest.path,
    diffPath: diff.path,
    planPath: plan.path,
    expectedManifestSha256: manifest.sha256,
    inputPaths: [input.path],
    catalogue,
    expectedCounts: { states: 2, pairs: 3, pngs: 5, batches: 2 },
  };
  const runtimeAttestation = record(
    join(runtimeRoot, "runtime-attestation.json"),
    {
      schemaVersion: 1,
      round: "round13r2",
      repoRoot,
      manifestSha256: manifest.sha256,
      baseUrl: "http://localhost:3031",
      buildStartCacheIdentity: "SYNTHETIC ONLY",
      evidenceNotBeforeUtc: utc(0),
      sourceUnchanged: true,
      scratchCmsExclusive: true,
      mainUnavailableData: true,
      noPrivilegedOrProviderEffects: true,
      collectionPolicy: "bounded-batches",
      allowCollectorOverlap: false,
      decision: "Synthetic offline case; not a real runtime attestation.",
    },
  );
  const inputs = {
    schemaVersion: 1,
    round: "round13r2",
    runId: `synthetic-${name}`,
    repoRoot,
    identity,
    runtimeAttestation,
    window: { startedAtUtc: utc(0), finishedAtUtc: utc(60) },
    invocations: [],
  };
  let sequence = 0;
  for (const state of catalogue.states) {
    for (const phase of ["capture", "check"]) {
      const id = `${state.area}-01-${phase}`;
      const collector = state.area === "crm" ? "core" : "studio";
      const base = join(runtimeRoot, `round13r2-${collector}`, id);
      const directory = join(base, "output");
      const start = ++sequence * 10;
      const result = record(join(base, "result.json"), {
        tag: id,
        argv: [
          join(qaRoot, `${phase}-workspaces.mjs`),
          directory,
          state.area,
          state.name,
        ],
        pid: sequence,
        startedAtUtc: utc(start),
        finishedAtUtc: utc(start + 4),
        timedOut: false,
        exitCode: 0,
      });
      const proofValue = {
        repoRoot,
        verifiedAt: utc(start + 1),
        bundleSha256: "a".repeat(64),
        typecheck: "passed",
        verification: "verify-fixtures: all 12 checks passed (synthetic)",
      };
      const proof = record(join(base, "proof.json"), proofValue);
      const seal = (stage, seconds) =>
        record(join(base, `${stage}.json`), {
          schemaVersion: 1,
          invocationId: id,
          stage,
          observedAtUtc: utc(seconds),
          originalEvidence: [
            record(join(base, `${stage}-original.json`), {
              identity,
              observedAtUtc: utc(seconds),
              synthetic: true,
            }),
          ],
          repoRoot,
          identity,
          runtimeAttestationSha256: runtimeAttestation.sha256,
          freezeExitCode: 0,
          freezeVerification: {
            name: "round13r2",
            files: 1,
            mismatches: [],
            extra: [],
          },
        });
      const before = seal("before", start - 1);
      const after = seal("after", start + 5);
      const files = {};
      const output = (name, bytes) => {
        const file = write(join(directory, name), bytes);
        files[name] = file.sha256;
      };
      output("fixture-proof.json", json(proofValue));
      const rows = state.widths.map((viewport) => ({
        state: state.name,
        viewport,
        path: state.routePath,
        horizontalOverflow: false,
        h1Count: 1,
        renderedTableRows: 0,
        renderedMobileRows: 0,
        unexpectedRouteErrorHeadings: [],
        keyboard: null,
        dialog: state.dialog
          ? {
              name: "Example",
              contained: true,
              width: 1,
              internalOverflowX: false,
            }
          : null,
        dialogFocus: state.dialog
          ? { tabEscapes: 0, escapedTo: [], closedByEscape: true }
          : null,
        axe: { violations: [], incompleteIds: [] },
      }));
      const metrics = Object.fromEntries(
        state.widths.map((viewport) => [
          viewport,
          {
            path: state.routePath,
            scrollHeight: 2,
            horizontalOverflow: false,
            focusableInMain: 1,
            h1: ["Example"],
            tables: 0,
            reuiGrids: 0,
            tableRows: 0,
            unexpectedRouteErrorHeadings: [],
            dialog: state.dialog
              ? { name: "Example", width: 1, overflowX: false }
              : null,
          },
        ]),
      );
      const dataName =
        phase === "capture" ? "page-metrics.json" : "workspace-checks.json";
      output(
        dataName,
        json(phase === "capture" ? { [state.name]: metrics } : rows),
      );
      if (phase === "capture")
        for (const viewport of state.widths) {
          const dimensions = catalogue.viewports.find(
            (entry) => entry.name === viewport,
          );
          output(
            `${state.name}--${viewport}.png`,
            png(dimensions.width, dimensions.height),
          );
          if (state.full)
            output(
              `${state.name}--${viewport}-full.png`,
              png(dimensions.width, dimensions.height),
            );
        }
      const lines =
        phase === "capture"
          ? [`captured ${state.name} in 4s`]
          : state.widths.map(
              (viewport) =>
                `${state.name} @${viewport}: axe 0, overflow false, rows 0/0${state.dialog ? `, dialog ${JSON.stringify(rows.find((row) => row.viewport === viewport).dialogFocus)}` : ""}`,
            );
      lines.push(`wrote ${join(directory, dataName)}`);
      inputs.invocations.push({
        id,
        collector,
        phase,
        states: [state.name],
        directory,
        files,
        result,
        proof,
        before,
        after,
        stdout: write(
          join(base, "stdout.log"),
          Buffer.from(lines.join("\n") + "\n"),
        ),
        stderr: write(join(base, "stderr.log"), Buffer.alloc(0)),
      });
    }
  }
  return { inputs, context };
}

try {
  const complete = syntheticCase("complete");
  const validation = validateInputs(complete.inputs, complete.context).report;
  assert.equal(
    validation.status,
    "VALIDATED",
    JSON.stringify(validation.errors),
  );
  assert.deepEqual(validation.catalogue.counts, {
    states: 2,
    pairs: 3,
    pngs: 5,
    batches: 2,
  });
  console.log("PASS: complete small catalogue is validated exactly");
  const replaceJson = (reference, change) => {
    const value = JSON.parse(readFileSync(reference.path, "utf8"));
    change(value);
    const bytes = json(value);
    writeFileSync(reference.path, bytes);
    reference.sha256 = sha256(bytes);
  };
  const replaceOutput = (invocation, name, change) => {
    const reference = {
      path: join(invocation.directory, name),
      sha256: invocation.files[name],
    };
    replaceJson(reference, change);
    invocation.files[name] = reference.sha256;
  };
  const reject = (name, code, change) => {
    const fixture = syntheticCase(name);
    change(fixture);
    const report = validateInputs(fixture.inputs, fixture.context).report;
    assert.equal(report.status, "REJECTED", name);
    assert.ok(
      report.errors.some((error) => error.code === code),
      `${name}: ${JSON.stringify(report.errors)}`,
    );
    console.log(`PASS: ${name} rejected (${code})`);
  };
  const normalized = syntheticCase("root-normalized-seals");
  for (const invocation of normalized.inputs.invocations) {
    for (const stage of ["before", "after"]) {
      invocation[stage] = write(
        join(
          normalized.context.runtimeRoot,
          "round13r2-aggregation",
          "source-seals",
          `${invocation.id}-${stage}.json`,
        ),
        readFileSync(invocation[stage].path),
      );
    }
  }
  const normalizedReport = validateInputs(
    normalized.inputs,
    normalized.context,
  ).report;
  assert.equal(
    normalizedReport.status,
    "VALIDATED",
    JSON.stringify(normalizedReport.errors),
  );
  assert.equal(
    normalizedReport.warnings.filter(
      (warning) => warning.code === "ROOT_NORMALIZED_SOURCE_SEAL",
    ).length,
    8,
  );
  console.log(
    "PASS: root-normalized source seals retain originals and explicit warnings",
  );
  reject("missing-invocation", "EXACT_SET", ({ inputs }) =>
    inputs.invocations.pop(),
  );
  reject("duplicate-directory", "DUPLICATE_DIRECTORY", ({ inputs }) =>
    inputs.invocations.push({ ...inputs.invocations[0], id: "other-capture" }),
  );
  reject("duplicate-ownership", "DUPLICATE_OWNERSHIP", ({ inputs }) => {
    const duplicate = structuredClone(inputs.invocations[0]);
    duplicate.id = "duplicate-capture";
    duplicate.directory = join(
      dirname(duplicate.directory),
      "duplicate-output",
    );
    mkdirSync(duplicate.directory);
    inputs.invocations.push(duplicate);
  });
  reject("wrong-collector", "WRONG_COLLECTOR", ({ inputs, context }) => {
    const invocation = inputs.invocations[0];
    invocation.collector = "studio";
    invocation.directory = join(
      context.runtimeRoot,
      "round13r2-studio",
      "wrong-owner",
    );
    mkdirSync(invocation.directory, { recursive: true });
  });
  reject(
    "wrong-frozen-identity",
    "SOURCE_IDENTITY",
    ({ inputs }) => (inputs.identity.manifestSha256 = "b".repeat(64)),
  );
  reject("frozen-product-drift", "FROZEN_SOURCE_DRIFT", ({ context }) =>
    writeFileSync(
      join(context.repoRoot, "synthetic-source"),
      "changed frozen product\n",
    ),
  );
  reject("stale-preflight", "FIXTURE_PROVENANCE", ({ inputs }) =>
    replaceJson(
      inputs.invocations[0].proof,
      (value) => (value.verifiedAt = utc(1)),
    ),
  );
  reject("wrong-preflight-checkout", "FIXTURE_PROVENANCE", ({ inputs }) =>
    replaceJson(
      inputs.invocations[0].proof,
      (value) => (value.repoRoot = dirname(value.repoRoot)),
    ),
  );
  reject("failed-preflight", "FIXTURE_PROVENANCE", ({ inputs }) =>
    replaceJson(
      inputs.invocations[0].proof,
      (value) => (value.typecheck = "failed"),
    ),
  );
  reject("wrong-argv", "ARGV_PROVENANCE", ({ inputs }) =>
    replaceJson(
      inputs.invocations[0].result,
      (value) =>
        (value.argv[0] = join(dirname(value.argv[0]), "old-runner.mjs")),
    ),
  );
  reject("unterminated-collector", "INVOCATION_NOT_FINISHED", ({ inputs }) =>
    replaceJson(
      inputs.invocations[0].result,
      (value) => (value.exitCode = null),
    ),
  );
  reject("timed-out-collector", "INVOCATION_NOT_FINISHED", ({ inputs }) =>
    replaceJson(
      inputs.invocations[0].result,
      (value) => (value.timedOut = true),
    ),
  );
  reject("missing-png", "EXACT_SET", ({ inputs }) =>
    unlinkSync(
      join(inputs.invocations[0].directory, "crm-example--desktop.png"),
    ),
  );
  reject("extra-png", "EXACT_SET", ({ inputs }) =>
    write(
      join(inputs.invocations[0].directory, "old-state--desktop.png"),
      png(2, 2),
    ),
  );
  reject("tampered-evidence", "HASH_MISMATCH", ({ inputs }) =>
    writeFileSync(
      join(inputs.invocations[0].directory, "crm-example--desktop.png"),
      png(3, 2),
    ),
  );
  reject("wrong-png-dimensions", "PNG_DIMENSIONS", ({ inputs }) => {
    const invocation = inputs.invocations[0];
    const bytes = png(3, 2);
    writeFileSync(
      join(invocation.directory, "crm-example--desktop.png"),
      bytes,
    );
    invocation.files["crm-example--desktop.png"] = sha256(bytes);
  });
  reject("duplicate-check-row", "DUPLICATE", ({ inputs }) =>
    replaceOutput(inputs.invocations[1], "workspace-checks.json", (rows) =>
      rows.push(rows[0]),
    ),
  );
  reject("missing-width", "EXACT_SET", ({ inputs }) =>
    replaceOutput(
      inputs.invocations[0],
      "page-metrics.json",
      (value) => delete value["crm-example"].mobile,
    ),
  );
  reject("semantic-route-error", "SEMANTIC_ROUTE_ERROR", ({ inputs }) =>
    replaceOutput(inputs.invocations[1], "workspace-checks.json", (rows) =>
      rows[0].unexpectedRouteErrorHeadings.push("Unexpected error"),
    ),
  );
  reject("semantic-dialog-not-open", "SEMANTIC_DIALOG_MISSING", ({ inputs }) =>
    replaceOutput(inputs.invocations[3], "workspace-checks.json", (rows) => {
      rows[0].dialog = null;
      rows[0].dialogFocus = null;
    }),
  );
  reject("semantic-setup-warning", "SEMANTIC_SETUP_LOG", ({ inputs }) => {
    const invocation = inputs.invocations[0];
    const bytes = Buffer.from("setup triggers not found (captured as-is)\n");
    writeFileSync(invocation.stderr.path, bytes);
    invocation.stderr.sha256 = sha256(bytes);
  });
  reject("missing-completion-log", "EXACT_SET", ({ inputs }) => {
    const invocation = inputs.invocations[0];
    const bytes = Buffer.from(
      `wrote ${join(invocation.directory, "page-metrics.json")}\n`,
    );
    writeFileSync(invocation.stdout.path, bytes);
    invocation.stdout.sha256 = sha256(bytes);
  });
  reject("wrong-source-seal", "SOURCE_PROVENANCE", ({ inputs }) =>
    replaceJson(
      inputs.invocations[0].before,
      (value) => (value.identity.diffSha256 = "c".repeat(64)),
    ),
  );
  reject("missing-original-source-record", "SOURCE_PROVENANCE", ({ inputs }) =>
    replaceJson(
      inputs.invocations[0].before,
      (value) => (value.originalEvidence = []),
    ),
  );
  reject("tampered-original-source-record", "HASH_MISMATCH", ({ inputs }) => {
    const seal = JSON.parse(
      readFileSync(inputs.invocations[0].before.path, "utf8"),
    );
    writeFileSync(
      seal.originalEvidence[0].path,
      "changed original source record\n",
    );
  });
  reject("failed-freeze-seal", "FREEZE_PROVENANCE", ({ inputs }) =>
    replaceJson(inputs.invocations[0].after, (value) =>
      value.freezeVerification.extra.push("unexpected-source"),
    ),
  );
  reject("different-fixture-bundle", "FIXTURE_BUNDLE_DRIFT", ({ inputs }) => {
    const invocation = inputs.invocations[0];
    replaceJson(
      invocation.proof,
      (value) => (value.bundleSha256 = "d".repeat(64)),
    );
    replaceOutput(
      invocation,
      "fixture-proof.json",
      (value) => (value.bundleSha256 = "d".repeat(64)),
    );
  });
  reject(
    "duplicate-proof-owner",
    "DUPLICATE_PROVENANCE",
    ({ inputs }) => (inputs.invocations[1].proof = inputs.invocations[0].proof),
  );
  reject("wrong-log-measurement", "LOG_DATA_MISMATCH", ({ inputs }) => {
    const invocation = inputs.invocations[1];
    const bytes = Buffer.from(
      readFileSync(invocation.stdout.path, "utf8").replace("axe 0", "axe 2"),
    );
    writeFileSync(invocation.stdout.path, bytes);
    invocation.stdout.sha256 = sha256(bytes);
  });
  reject("unsealed-input-drift", "SOURCE_IDENTITY", ({ context }) =>
    writeFileSync(context.inputPaths[0], "changed source input\n"),
  );
  reject("duplicate-json-property", "DUPLICATE_JSON_KEY", ({ inputs }) => {
    const invocation = inputs.invocations[0];
    const bytes = Buffer.from('{"crm-example":{},"crm-example":{}}');
    writeFileSync(join(invocation.directory, "page-metrics.json"), bytes);
    invocation.files["page-metrics.json"] = sha256(bytes);
  });
  reject("truncated-png", "PNG_INVALID", ({ inputs }) => {
    const invocation = inputs.invocations[0];
    const bytes = png(2, 2).subarray(0, 60);
    writeFileSync(
      join(invocation.directory, "crm-example--desktop.png"),
      bytes,
    );
    invocation.files["crm-example--desktop.png"] = sha256(bytes);
  });
  reject(
    "inventory-path-escape",
    "PATH_BOUNDARY",
    ({ inputs }) =>
      (inputs.invocations[0].files["../outside.png"] = "e".repeat(64)),
  );
  reject("symlink-directory", "SYMLINK", ({ inputs }) => {
    const invocation = inputs.invocations[0];
    const alias = join(dirname(invocation.directory), "junction-output");
    symlinkSync(invocation.directory, alias, "junction");
    invocation.directory = alias;
  });
  reject("stale-collection-cutoff", "STALE_COLLECTION", ({ inputs }) =>
    replaceJson(
      inputs.runtimeAttestation,
      (value) => (value.evidenceNotBeforeUtc = utc(1)),
    ),
  );
  const findings = syntheticCase("attributable-findings");
  replaceOutput(
    findings.inputs.invocations[1],
    "workspace-checks.json",
    (rows) => rows[0].axe.incompleteIds.push("color-contrast:1"),
  );
  const findingsReport = validateInputs(
    findings.inputs,
    findings.context,
  ).report;
  assert.equal(
    findingsReport.status,
    "VALIDATED",
    JSON.stringify(findingsReport.errors),
  );
  assert.ok(
    findingsReport.warnings.some(
      (warning) => warning.code === "AXE_INCOMPLETE",
    ),
  );
  console.log(
    "PASS: attributable axe findings are retained as warnings, not hidden or called a pass",
  );
  const assemblyCase = syntheticCase("assembly");
  const accepted = validateInputs(assemblyCase.inputs, assemblyCase.context);
  const destination = join(assemblyCase.context.qaRoot, "candidate-13r2");
  assert.equal(
    existsSync(destination),
    false,
    "validation must not write a candidate",
  );
  assert.throws(
    () =>
      helper.assemble(
        accepted,
        "not-authorized",
        assemblyCase.context.repoRoot,
      ),
    /authorization/i,
  );
  assert.equal(
    existsSync(destination),
    false,
    "invalid authorization must not write a candidate",
  );
  assert.throws(
    () => helper.assemble(accepted, accepted.report.validationSha256, here),
    /repository root/i,
  );
  const receipt = helper.assemble(
    accepted,
    accepted.report.validationSha256,
    assemblyCase.context.repoRoot,
  );
  assert.equal(receipt.status, "ASSEMBLED");
  assert.equal(
    sha256(readFileSync(join(destination, "crm-example--desktop.png"))),
    assemblyCase.inputs.invocations[0].files["crm-example--desktop.png"],
  );
  assert.throws(
    () =>
      helper.assemble(
        accepted,
        accepted.report.validationSha256,
        assemblyCase.context.repoRoot,
      ),
    /already exists/i,
  );
  const refusedCase = syntheticCase("drift-before-assembly");
  const refused = validateInputs(refusedCase.inputs, refusedCase.context);
  writeFileSync(
    join(
      refusedCase.inputs.invocations[0].directory,
      "crm-example--desktop.png",
    ),
    png(3, 2),
  );
  assert.throws(
    () =>
      helper.assemble(
        refused,
        refused.report.validationSha256,
        refusedCase.context.repoRoot,
      ),
    /changed before assembly/i,
  );
  assert.equal(
    existsSync(join(refusedCase.context.qaRoot, "candidate-13r2")),
    false,
    "drift must be rejected before destination creation",
  );
  console.log(
    "PASS: explicit assembly preserves bytes and refuses destination reuse",
  );
} finally {
  const actual = realpathSync(scratch);
  const child = relative(realpathSync(here), actual);
  assert.ok(
    child &&
      child !== ".." &&
      !child.startsWith(`..${sep}`) &&
      resolve(here, child) === actual,
  );
  rmSync(actual, { recursive: true });
}
