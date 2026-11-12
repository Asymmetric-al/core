import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const evidence = dirname(fileURLToPath(import.meta.url));
const root = resolve(evidence, "../../../../../../..");
const output = join(
  root,
  "docs/qa/admin-workspaces-hillclimb/candidate-13-core",
);
const readJson = (name) =>
  JSON.parse(readFileSync(join(evidence, name), "utf8"));
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
const hashFile = (path) => digest(readFileSync(path));
const inventory = readJson("expected-inventory.json");
const before = readJson("source-pre.json");
const after = readJson("source-after-capture-crm.json");
const latest = readJson("source-post.json");
const artifacts = readJson("artifact-index.json");
const batches = readJson("batches.json");
const captureMetrics = existsSync(join(output, "page-metrics.json"))
  ? JSON.parse(readFileSync(join(output, "page-metrics.json"), "utf8"))
  : null;
const checkRows = existsSync(join(output, "workspace-checks.json"))
  ? JSON.parse(readFileSync(join(output, "workspace-checks.json"), "utf8"))
  : null;
const loggedStateNames = batches
  .filter((batch) => batch.kind === "capture")
  .flatMap((batch) => [
    ...readFileSync(join(evidence, batch.stdout), "utf8").matchAll(
      /^captured (.+) in \d+s$/gm,
    ),
  ])
  .map((match) => match[1]);
const captureLogPairs = loggedStateNames.flatMap(
  (name) =>
    inventory.states.find((state) => state.name === name)?.capturePairs ?? [],
);
const checkLogPairs = batches
  .filter((batch) => batch.kind === "check")
  .flatMap((batch) => [
    ...readFileSync(join(evidence, batch.stdout), "utf8").matchAll(
      /^(.+) @(desktop|mobile): axe /gm,
    ),
  ])
  .map((match) => `${match[1]}@${match[2]}`);
const captureJsonPairs = Object.entries(captureMetrics ?? {}).flatMap(
  ([state, widths]) => Object.keys(widths).map((width) => `${state}@${width}`),
);
const checkJsonPairs = (checkRows ?? []).map(
  (row) => `${row.state}@${row.viewport}`,
);
const pngPairs = artifacts
  .filter((artifact) => !artifact.name.endsWith("-full.png"))
  .map((artifact) => artifact.name.replace("--", "@").replace(/\.png$/, ""));
const compare = (expected, observed) => ({
  expected: expected.length,
  observed: observed.length,
  uniqueObserved: new Set(observed).size,
  missing: expected.filter((item) => !observed.includes(item)),
  extra: observed.filter((item) => !expected.includes(item)),
  duplicates: observed.filter(
    (item, index) => observed.indexOf(item) !== index,
  ),
});
const beforeMap = new Map(
  before.source.map((file) => [file.path, file.sha256]),
);
const afterMap = new Map(after.source.map((file) => [file.path, file.sha256]));
const sourceDelta = {
  added: after.source.filter((file) => !beforeMap.has(file.path)),
  changed: after.source.filter(
    (file) =>
      beforeMap.has(file.path) && beforeMap.get(file.path) !== file.sha256,
  ),
  deleted: before.source.filter((file) => !afterMap.has(file.path)),
};
const latestMap = new Map(
  latest.source.map((file) => [file.path, file.sha256]),
);
const latestSourceDelta = {
  added: latest.source.filter((file) => !beforeMap.has(file.path)),
  changed: latest.source.filter(
    (file) =>
      beforeMap.has(file.path) && beforeMap.get(file.path) !== file.sha256,
  ),
  deleted: before.source.filter((file) => !latestMap.has(file.path)),
};
const changedAfterStop = latest.source.filter(
  (file) => afterMap.get(file.path) !== file.sha256,
);
const observedFixtureProofs = [
  "fixture-proof-preflight.json",
  ...batches.map((batch) => batch.proof).filter(Boolean),
].map((name) => ({
  file: name,
  fileSha256: hashFile(join(evidence, name)),
  ...readJson(name),
}));
const states = inventory.states.map((state) => ({
  ...state,
  captureCompletionLogged: loggedStateNames.includes(state.name),
  capture: state.widths.map((viewport) => ({
    viewport,
    freshCompletionLog: captureLogPairs.includes(`${state.name}@${viewport}`),
    viewportPng: pngPairs.includes(`${state.name}@${viewport}`),
    fullPagePng: state.full
      ? artifacts.some(
          (artifact) => artifact.name === `${state.name}--${viewport}-full.png`,
        )
      : null,
    savedMetrics: captureJsonPairs.includes(`${state.name}@${viewport}`),
  })),
  checks: state.checkPairs.map((pair) => ({
    pair,
    freshLog: checkLogPairs.includes(pair),
    savedResult: checkJsonPairs.includes(pair),
    result: checkJsonPairs.includes(pair) ? "recorded" : "not run",
  })),
  setupWarning:
    state.name === "crm-gift-row-menu"
      ? "desktop: exact /^More gift actions$/ trigger missing; saved PNG shows record sheet, not open action menu"
      : null,
}));
const result = {
  auditedAt: new Date().toISOString(),
  status: "stopped: runner time limit and post-batch frozen-source drift",
  baseUrl: inventory.baseUrl,
  sourceBefore: {
    file: "source-pre.json",
    at: before.at,
    sourceCount: before.sourceCount,
    productSourceSha256: before.productSourceSha256,
    manifestAggregateSha256: before.manifestAggregateSha256,
    freezeVerification: before.freezeVerification,
  },
  sourceAfter: {
    file: "source-after-capture-crm.json",
    at: after.at,
    sourceCount: after.sourceCount,
    productSourceSha256: after.productSourceSha256,
    manifestAggregateSha256: after.manifestAggregateSha256,
    freezeVerification: after.freezeVerification,
  },
  latestSourceSnapshot: {
    file: "source-post.json",
    at: latest.at,
    sameAsPostBatch: latest.productSourceSha256 === after.productSourceSha256,
    productSourceSha256: latest.productSourceSha256,
    manifestAggregateSha256: latest.manifestAggregateSha256,
    freezeVerification: latest.freezeVerification,
  },
  sourceDelta,
  latestSourceDelta,
  changedAfterStop,
  manifestSha256: before.manifestSha256,
  diffSha256: before.diffSha256,
  observedFixtureProofs,
  batchOutcomes: batches,
  coverage: {
    captureFreshLogs: compare(inventory.capturePairs, captureLogPairs),
    captureViewportPngs: compare(inventory.capturePairs, pngPairs),
    captureSavedMetrics: compare(inventory.capturePairs, captureJsonPairs),
    checkFreshLogs: compare(inventory.checkPairs, checkLogPairs),
    checkSavedResults: compare(inventory.checkPairs, checkJsonPairs),
    pngFiles: compare(
      inventory.pngs,
      artifacts.map((artifact) => artifact.name),
    ),
    dimensionMismatches: artifacts.filter(
      (artifact) => artifact.dimensionMismatch,
    ),
    pngPairsWithoutCompletionLog: pngPairs.filter(
      (pair) => !captureLogPairs.includes(pair),
    ),
    completionLogPairsWithoutPng: captureLogPairs.filter(
      (pair) => !pngPairs.includes(pair),
    ),
  },
  areaCounts: [...new Set(states.map((state) => state.area))].map((area) => {
    const selected = states.filter((state) => state.area === area);
    const expectedCapture = selected.flatMap((state) => state.capturePairs);
    const expectedChecks = selected.flatMap((state) => state.checkPairs);
    return {
      area,
      expectedStates: selected.length,
      loggedStates: selected.filter((state) => state.captureCompletionLogged)
        .length,
      expectedCapturePairs: expectedCapture.length,
      loggedCapturePairs: captureLogPairs.filter((pair) =>
        expectedCapture.includes(pair),
      ).length,
      viewportPngPairs: pngPairs.filter((pair) =>
        expectedCapture.includes(pair),
      ).length,
      savedMetricPairs: captureJsonPairs.filter((pair) =>
        expectedCapture.includes(pair),
      ).length,
      expectedCheckPairs: expectedChecks.length,
      savedCheckPairs: checkJsonPairs.filter((pair) =>
        expectedChecks.includes(pair),
      ).length,
    };
  }),
  states,
  notEstablished: [
    "All axe violations and contrast-incomplete outcomes: no check rows exist",
    "Keyboard reachability, ArrowDown, dialog Tab containment and Escape closure",
    "Measured page/dialog horizontal overflow and viewport containment",
    "Structured route-error heading inventories: capture metrics never flushed",
    "All-width capture/check coverage for remaining states, including Reports, Email Studio and PDF Studio narrow widths",
    "Real authentication, tenant/permission integration, providers and money mutations",
    "Visual quality scores or WCAG conformance",
  ],
};
writeFileSync(
  join(evidence, "partial-state-inventory.json"),
  JSON.stringify(result, null, 2) + "\n",
);
writeFileSync(
  join(evidence, "source-drift.json"),
  JSON.stringify(
    {
      before: result.sourceBefore,
      postBatch: result.sourceAfter,
      latest: result.latestSourceSnapshot,
      postBatchDelta: sourceDelta,
      latestDelta: latestSourceDelta,
      changedAfterStop,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  JSON.stringify(
    {
      statesLogged: loggedStateNames.length,
      captureLogPairs: captureLogPairs.length,
      viewportPngPairs: pngPairs.length,
      savedMetricPairs: captureJsonPairs.length,
      savedCheckPairs: checkJsonPairs.length,
      pngFiles: artifacts.length,
      sourceDelta,
    },
    null,
    2,
  ),
);
