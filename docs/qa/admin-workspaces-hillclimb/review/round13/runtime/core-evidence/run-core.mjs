import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  copyFileSync,
  appendFileSync,
  readdirSync,
} from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";
import { prepareFixtureBundle } from "../../../../fixture-preflight.mjs";
import { createStates, VIEWPORTS } from "../../../../workspace-states.mjs";
import { createModuleStates } from "../../../../module-states.mjs";

const evidence = dirname(fileURLToPath(import.meta.url));
const root = resolve(evidence, "../../../../../../..");
const harness = join(root, "docs/qa/admin-workspaces-hillclimb");
const output = join(harness, "candidate-13-core");
const areas = ["crm", "contributions", "shell", "people", "support", "tools"];
const frozenDiff =
  "8e4c354259160e26be0fed1a3308ae87452b5fe6c58ea1c5448c1ffcbd143547";
const digest = (value) => createHash("sha256").update(value).digest("hex");
const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
const save = (name, value) =>
  writeFileSync(join(evidence, name), JSON.stringify(value, null, 2) + "\n");
const hashFile = (path) =>
  existsSync(path) ? digest(readFileSync(path)) : "absent";

function snapshot() {
  const listed = spawnSync(
    "git",
    [
      "ls-files",
      "-c",
      "-o",
      "--exclude-standard",
      "-z",
      "--",
      "apps",
      "packages",
      "tests",
      "scripts",
      "tooling",
    ],
    {
      cwd: root,
      encoding: "utf8",
      timeout: 30000,
      windowsHide: true,
      maxBuffer: 32 * 1024 * 1024,
    },
  );
  if (listed.error || listed.status !== 0)
    throw new Error("Read-only source inventory failed.");
  const paths = [...new Set(listed.stdout.split("\0").filter(Boolean))].sort();
  const source = paths.map((path) => ({
    path,
    sha256: hashFile(join(root, path)),
  }));
  const manifest = readJson(join(harness, "snapshots/round13-manifest.json"));
  const entries = manifest.files.map((file) => ({
    path: file.path,
    sha256: hashFile(join(root, file.path)),
  }));
  const verification = spawnSync(
    process.execPath,
    [join(harness, "freeze-checkpoint.mjs"), "--verify", "round13"],
    { cwd: root, encoding: "utf8", timeout: 30000, windowsHide: true },
  );
  const mismatches = entries.filter(
    (file, index) => file.sha256 !== manifest.files[index].sha256,
  );
  return {
    at: new Date().toISOString(),
    root,
    diffSha256: hashFile(join(harness, "snapshots/round13.diff")),
    manifestSha256: hashFile(join(harness, "snapshots/round13-manifest.json")),
    manifestEntries: entries.length,
    manifestAggregateSha256: digest(JSON.stringify(entries)),
    sourceCount: source.length,
    productSourceSha256: digest(JSON.stringify(source)),
    mismatches,
    source,
    freezeVerification: {
      exitCode: verification.status,
      stdout: verification.stdout,
      stderr: verification.stderr,
      error: verification.error?.message ?? null,
    },
  };
}

function assertFrozen(current, before) {
  if (
    current.diffSha256 !== frozenDiff ||
    current.mismatches.length ||
    current.freezeVerification.exitCode !== 0 ||
    current.manifestEntries !== 1032
  )
    throw new Error(
      "Frozen manifest/diff verification failed; stop without recapture.",
    );
  if (
    before &&
    (current.productSourceSha256 !== before.productSourceSha256 ||
      current.manifestAggregateSha256 !== before.manifestAggregateSha256 ||
      current.manifestSha256 !== before.manifestSha256)
  ) {
    const old = new Map(before.source.map((file) => [file.path, file.sha256]));
    save("source-drift.json", {
      before: before.productSourceSha256,
      after: current.productSourceSha256,
      changed: current.source.filter(
        (file) => file.sha256 !== old.get(file.path),
      ),
      deleted: before.source.filter(
        (file) => !current.source.some((next) => next.path === file.path),
      ),
    });
    throw new Error("Product source drift detected; stop without recapture.");
  }
}

function audit() {
  const inventory = readJson(join(evidence, "expected-inventory.json"));
  const metrics = existsSync(join(output, "page-metrics.json"))
    ? readJson(join(output, "page-metrics.json"))
    : {};
  const checks = existsSync(join(output, "workspace-checks.json"))
    ? readJson(join(output, "workspace-checks.json"))
    : [];
  const batches = existsSync(join(evidence, "batches.json"))
    ? readJson(join(evidence, "batches.json"))
    : [];
  const captureLogPairs = [];
  const checkLogPairs = [];
  for (const batch of batches) {
    const stdout = readFileSync(join(evidence, batch.stdout), "utf8");
    if (batch.kind === "capture") {
      for (const match of stdout.matchAll(/^captured (.+) in \d+s$/gm)) {
        const state = inventory.states.find((entry) => entry.name === match[1]);
        if (state) captureLogPairs.push(...state.capturePairs);
      }
    } else
      for (const match of stdout.matchAll(/^(.+) @(desktop|mobile): axe /gm))
        checkLogPairs.push(`${match[1]}@${match[2]}`);
  }
  const captureJsonPairs = Object.entries(metrics).flatMap(([state, widths]) =>
    Object.keys(widths).map((width) => `${state}@${width}`),
  );
  const checkJsonPairs = checks.map(
    (entry) => `${entry.state}@${entry.viewport}`,
  );
  const pngs = existsSync(output)
    ? readdirSync(output).filter((name) => name.endsWith(".png"))
    : [];
  const pngRecords = pngs.map((name) => {
    const bytes = readFileSync(join(output, name));
    const match = name.match(
      /^(.+)--(desktop|intermediate|small-tablet|mobile)(-full)?\.png$/,
    );
    const viewport = inventory.captureViewports.find(
      (entry) => entry.name === match?.[2],
    );
    const width = bytes.readUInt32BE(16);
    const height = bytes.readUInt32BE(20);
    return {
      name,
      bytes: bytes.length,
      sha256: digest(bytes),
      width,
      height,
      dimensionMismatch:
        !viewport ||
        width !== viewport.width ||
        (match?.[3] ? height < viewport.height : height !== viewport.height),
    };
  });
  save("artifact-index.json", pngRecords);
  const compare = (expected, actual) => ({
    expected: expected.length,
    actual: actual.length,
    unique: new Set(actual).size,
    missing: expected.filter((pair) => !actual.includes(pair)),
    extra: actual.filter((pair) => !expected.includes(pair)),
    duplicates: actual.filter((pair, index) => actual.indexOf(pair) !== index),
  });
  const result = {
    at: new Date().toISOString(),
    captureLogs: compare(inventory.capturePairs, captureLogPairs),
    captureJson: compare(inventory.capturePairs, captureJsonPairs),
    checkLogs: compare(inventory.checkPairs, checkLogPairs),
    checkJson: compare(inventory.checkPairs, checkJsonPairs),
    pngs: compare(inventory.pngs, pngs),
    captureProblems: Object.entries(metrics).flatMap(([state, widths]) =>
      Object.entries(widths)
        .filter(
          ([, row]) =>
            row.horizontalOverflow ||
            row.dialog?.overflowX ||
            row.unexpectedRouteErrorHeadings?.length,
        )
        .map(([viewport, row]) => ({ state, viewport, ...row })),
    ),
    checkProblems: checks.filter(
      (row) =>
        row.horizontalOverflow ||
        row.axe.violations.length ||
        row.unexpectedRouteErrorHeadings?.length ||
        row.keyboard?.reachedRow === false ||
        row.keyboard?.arrowDownMovesRow === false ||
        row.dialog?.contained === false ||
        row.dialog?.internalOverflowX ||
        row.dialogFocus?.tabEscapes > 0 ||
        row.dialogFocus?.closedByEscape === false,
    ),
    incomplete: checks
      .filter((row) => row.axe.incompleteIds.length)
      .map((row) => ({
        state: row.state,
        viewport: row.viewport,
        incompleteIds: row.axe.incompleteIds,
      })),
    warnings: batches
      .map((batch) => ({
        kind: batch.kind,
        area: batch.area,
        stderr: batch.stderr,
        text: readFileSync(join(evidence, batch.stderr), "utf8"),
      }))
      .filter((batch) => batch.text.trim()),
    batches,
  };
  save("coverage-and-findings.json", result);
  console.log(
    JSON.stringify({
      capturePairs: result.captureJson.actual,
      captureMissing: result.captureJson.missing.length,
      checkPairs: result.checkJson.actual,
      checkMissing: result.checkJson.missing.length,
      pngs: result.pngs.actual,
      pngMissing: result.pngs.missing.length,
      captureProblems: result.captureProblems.length,
      checkProblems: result.checkProblems.length,
      incompletePairs: result.incomplete.length,
    }),
  );
  return result;
}

async function batch(kind, area) {
  const stdoutName = `${kind}-${area}.stdout.log`;
  const stderrName = `${kind}-${area}.stderr.log`;
  const args = [join(harness, `${kind}-workspaces.mjs`), output, area];
  const started = new Date().toISOString();
  let timedOut = false;
  writeFileSync(join(evidence, stdoutName), "");
  writeFileSync(join(evidence, stderrName), "");
  console.log(`START ${kind} ${area} ${started}`);
  const child = spawn(process.execPath, args, {
    cwd: root,
    env: { ...process.env, CAPTURE_BASE_URL: "http://localhost:3031" },
    windowsHide: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
  const timer = setTimeout(
    () => {
      timedOut = true;
      spawnSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], {
        timeout: 10000,
        windowsHide: true,
        encoding: "utf8",
      });
    },
    20 * 60 * 1000,
  );
  child.stdout.on("data", (data) => {
    appendFileSync(join(evidence, stdoutName), data);
    process.stdout.write(data);
  });
  child.stderr.on("data", (data) => {
    appendFileSync(join(evidence, stderrName), data);
    process.stderr.write(data);
  });
  const outcome = await new Promise((done) => {
    child.once("error", (error) =>
      done({ exitCode: null, error: error.message }),
    );
    child.once("close", (exitCode, signal) => done({ exitCode, signal }));
  });
  clearTimeout(timer);
  const record = {
    kind,
    area,
    command: [process.execPath, ...args],
    environment: { CAPTURE_BASE_URL: "http://localhost:3031" },
    started,
    ended: new Date().toISOString(),
    stdout: stdoutName,
    stderr: stderrName,
    timedOut,
    ...outcome,
  };
  const proof = join(output, "fixture-proof.json");
  if (existsSync(proof)) {
    copyFileSync(proof, join(evidence, `${kind}-${area}.fixture-proof.json`));
    record.proof = `${kind}-${area}.fixture-proof.json`;
    record.proofSha256 = hashFile(join(evidence, record.proof));
    record.bundleSha256 = readJson(proof).bundleSha256;
  }
  return record;
}

mkdirSync(evidence, { recursive: true });
try {
  if (process.argv[2] === "preflight") {
    if (existsSync(output))
      throw new Error("Capture output must be new and separate.");
    const before = snapshot();
    save("source-pre.json", before);
    assertFrozen(before);
    const { bundle, proof } = prepareFixtureBundle();
    save("fixture-proof-preflight.json", proof);
    save("verified-bundle.json", bundle);
    const checkerText = readFileSync(
      join(harness, "check-workspaces.mjs"),
      "utf8",
    );
    const checkViewports = runInNewContext(
      checkerText.match(/const VIEWPORTS = (\[[\s\S]*?\]);/)[1],
    );
    const states = [
      ...createStates(bundle.captureMeta),
      ...createModuleStates(),
    ]
      .filter((state) => areas.includes(state.area))
      .map((state) => ({
        area: state.area,
        name: state.name,
        route: typeof state.route === "function" ? state.route() : state.route,
        widths: state.widths,
        full: Boolean(state.full),
        dialog: Boolean(state.dialog),
        freshPerWidth: Boolean(state.freshPerWidth),
        scenario: state.scenario ?? "populated",
        capturePairs: VIEWPORTS.filter((viewport) =>
          state.widths.includes(viewport.name),
        ).map((viewport) => `${state.name}@${viewport.name}`),
        checkPairs: checkViewports
          .filter((viewport) => state.widths.includes(viewport.name))
          .map((viewport) => `${state.name}@${viewport.name}`),
      }));
    const capturePairs = states.flatMap((state) => state.capturePairs);
    const checkPairs = states.flatMap((state) => state.checkPairs);
    const pngs = states.flatMap((state) =>
      state.widths.flatMap((width) => [
        `${state.name}--${width}.png`,
        ...(state.full ? [`${state.name}--${width}-full.png`] : []),
      ]),
    );
    save("expected-inventory.json", {
      root,
      baseUrl: "http://localhost:3031",
      bundleSha256: proof.bundleSha256,
      captureViewports: VIEWPORTS,
      checkViewports,
      states,
      capturePairs,
      checkPairs,
      pngs,
    });
    const after = snapshot();
    save("source-after-preflight.json", after);
    assertFrozen(after, before);
    console.log(
      JSON.stringify(
        {
          proof,
          stateCount: states.length,
          capturePairs: capturePairs.length,
          checkPairs: checkPairs.length,
          pngs: pngs.length,
          byArea: areas.map((area) => ({
            area,
            states: states.filter((state) => state.area === area).length,
            capturePairs: states
              .filter((state) => state.area === area)
              .flatMap((state) => state.capturePairs).length,
            checkPairs: states
              .filter((state) => state.area === area)
              .flatMap((state) => state.checkPairs).length,
          })),
        },
        null,
        2,
      ),
    );
  } else if (process.argv[2] === "run") {
    const before = readJson(join(evidence, "source-pre.json"));
    const inventory = readJson(join(evidence, "expected-inventory.json"));
    const batches = existsSync(join(evidence, "batches.json"))
      ? readJson(join(evidence, "batches.json"))
      : [];
    for (const kind of ["capture", "check"])
      for (const area of areas) {
        if (batches.some((entry) => entry.kind === kind && entry.area === area))
          throw new Error(
            `Existing ${kind}/${area}; no successful batches are repeated.`,
          );
        const checkpoint = snapshot();
        save(`source-before-${kind}-${area}.json`, checkpoint);
        assertFrozen(checkpoint, before);
        const record = await batch(kind, area);
        batches.push(record);
        save("batches.json", batches);
        const after = snapshot();
        save(`source-after-${kind}-${area}.json`, after);
        assertFrozen(after, before);
        const coverage = audit();
        if (
          record.timedOut ||
          record.error ||
          record.bundleSha256 !== inventory.bundleSha256 ||
          ![0, 1].includes(record.exitCode)
        )
          throw new Error(
            `Stopped after ${kind}/${area}: runner or fixture failure.`,
          );
        const missing = (
          kind === "capture"
            ? coverage.captureJson.missing
            : coverage.checkJson.missing
        ).filter(
          (pair) =>
            inventory.states.find((state) => state.name === pair.split("@")[0])
              ?.area === area,
        );
        if (
          missing.length ||
          !readFileSync(join(evidence, record.stdout), "utf8").includes(
            "wrote ",
          )
        )
          throw new Error(
            `Stopped after incomplete ${kind}/${area}; missing ${missing.join(", ")}.`,
          );
      }
    save("completed.json", { at: new Date().toISOString(), complete: true });
  } else if (process.argv[2] === "audit") audit();
  else throw new Error("Use preflight, run, or audit.");
} catch (error) {
  save("stopped.json", { at: new Date().toISOString(), error: error.stack });
  console.error(error.stack);
  process.exitCode = 1;
} finally {
  if (existsSync(join(evidence, "source-pre.json"))) {
    const after = snapshot();
    save("source-post.json", after);
    try {
      assertFrozen(after, readJson(join(evidence, "source-pre.json")));
    } catch (error) {
      console.error(error.message);
      process.exitCode = 1;
    }
  }
}
