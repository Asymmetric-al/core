import { createHash } from "node:crypto";
import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const owned = dirname(fileURLToPath(import.meta.url));
const root = resolve(owned, "../../../../../../..");
const qa = join(root, "docs/qa/admin-workspaces-hillclimb");
const plan = JSON.parse(
  readFileSync(
    join(qa, "review/round13/runtime/refreeze/bounded-batch-plan.json"),
    "utf8",
  ),
);
const { createStates } = await import(
  pathToFileURL(join(qa, "workspace-states.mjs"))
);
const catalogue = createStates({});
const read = (path) => JSON.parse(readFileSync(path, "utf8"));
const hash = (path) =>
  createHash("sha256").update(readFileSync(path)).digest("hex");
const write = (name, value) =>
  writeFileSync(join(owned, name), JSON.stringify(value, null, 2) + "\n");
const invocations = [];
const issues = [];
const focused = [];
const artifactFailures = [];
const checkedMetrics = [];
for (const entry of readdirSync(join(owned, "invocations"), {
  withFileTypes: true,
}).filter((entry) => entry.isDirectory())) {
  const directory = join(owned, "invocations", entry.name);
  if (!existsSync(join(directory, "execution.json"))) {
    invocations.push({ tag: entry.name, runningOrIncomplete: true });
    continue;
  }
  const execution = read(join(directory, "execution.json"));
  const log = existsSync(join(directory, "runner.log"))
    ? readFileSync(join(directory, "runner.log"), "utf8")
    : "";
  const phase = execution.command?.[1]?.endsWith("capture-workspaces.mjs")
    ? "capture"
    : execution.command?.[1]?.endsWith("check-workspaces.mjs")
      ? "check"
      : "focused";
  const proofPath = join(directory, "fixture-proof.json");
  const proof = existsSync(proofPath) ? read(proofPath) : null;
  const preservedProofSha256 = proof ? hash(proofPath) : null;
  if (proof && preservedProofSha256 !== execution.fixtureProofSha256)
    artifactFailures.push(relative(owned, proofPath).replaceAll("\\", "/"));
  const freshProof =
    !!proof &&
    proof.repoRoot === root &&
    proof.typecheck === "passed" &&
    /all \d+ checks passed/.test(proof.verification) &&
    Date.parse(proof.verifiedAt) >= Date.parse(execution.startedAt) &&
    Date.parse(proof.verifiedAt) <= Date.parse(execution.endedAt);
  const artifactEntries = existsSync(join(directory, "artifact-hashes.json"))
    ? read(join(directory, "artifact-hashes.json"))
    : [];
  for (const artifact of artifactEntries) {
    const path = join(directory, artifact.path);
    if (!existsSync(path) || hash(path) !== artifact.sha256)
      artifactFailures.push(relative(owned, path).replaceAll("\\", "/"));
  }
  const warnings = log
    .split(/\r?\n/)
    .filter((line) =>
      /not found|captured as-is|not settled|still unresolved|fixture missing|disabled|did not finish/i.test(
        line,
      ),
    );
  const setupFailures = log
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^(crm|contribution)[\w-]*(?:@[\w-]+)?: /.test(line));
  const record = {
    tag: entry.name,
    phase,
    startedAt: execution.startedAt,
    endedAt: execution.endedAt,
    runnerDurationMs: execution.runnerDurationMs,
    command: execution.command,
    runnerSha256: execution.runnerSha256,
    wrapperSha256: execution.wrapperSha256 ?? null,
    exitCode: execution.exitCode,
    timedOut: execution.timedOut,
    freshProof,
    preservedProofSha256,
    bundleSha256: proof?.bundleSha256,
    fixtureVerifiedAt: proof?.verifiedAt,
    fixtureProofCopiedAt: execution.fixtureProofCopiedAt ?? null,
    proofPath: `${relative(owned, directory).replaceAll("\\", "/")}/fixture-proof.json`,
    preservedProofMtime: proof ? statSync(proofPath).mtime.toISOString() : null,
    proofMtimeAfterRunnerEndMs: proof
      ? statSync(proofPath).mtimeMs - Date.parse(execution.endedAt)
      : null,
    retainedLogs: [
      "runner.log",
      "before-freeze.log",
      "after-freeze.log",
    ].filter((name) => existsSync(join(directory, name))),
    beforeFreezeOk: execution.beforeFreezeOk ?? execution.before?.ok,
    afterFreezeOk: execution.afterFreezeOk,
    expectedKeys: execution.expectedKeys ?? [],
    observedKeys: execution.observedKeys ?? [],
    missingKeys: execution.missingKeys ?? execution.expectedKeys,
    expectedPngs: execution.expectedPngs ?? null,
    missingPngs: execution.missingPngs ?? null,
    missingCompletionLines: execution.missingCompletionLines ?? null,
    pngCount: artifactEntries.filter((artifact) =>
      artifact.path.endsWith(".png"),
    ).length,
    warnings,
    setupFailures,
    directory: relative(owned, directory).replaceAll("\\", "/"),
    qualified: execution.qualified === true && freshProof,
    complete: execution.complete === true,
    artifacts: artifactEntries,
    completionKeys: (execution.observedKeys ?? []).filter((key) =>
      phase === "capture"
        ? log.includes(`captured ${key.split("--")[0]} in `)
        : phase === "check"
          ? log.includes(`${key.split("--").join(" @")}:`)
          : log.includes(`END ${key}: observed;`),
    ),
  };
  invocations.push(record);
  if (phase === "capture") {
    const path = join(directory, "artifacts/page-metrics.json");
    if (existsSync(path))
      for (const [state, widths] of Object.entries(read(path)))
        for (const [viewport, metrics] of Object.entries(widths)) {
          if (
            metrics.horizontalOverflow ||
            metrics.dialog?.overflowX ||
            metrics.dialog?.internalOverflowX ||
            metrics.unexpectedRouteErrorHeadings?.length
          )
            issues.push({
              source: entry.name,
              key: `${state}--${viewport}`,
              type: "capture-geometry-or-route",
              metrics,
            });
        }
  }
  if (phase === "check") {
    const path = join(directory, "artifacts/workspace-checks.json");
    if (existsSync(path))
      for (const metrics of read(path)) {
        checkedMetrics.push({
          source: entry.name,
          qualified: record.qualified,
          ...metrics,
        });
        if (
          metrics.horizontalOverflow ||
          metrics.dialog?.internalOverflowX ||
          metrics.dialog?.contained === false ||
          metrics.axe?.violations.length ||
          metrics.keyboard?.reachedRow === false ||
          metrics.keyboard?.arrowDownMovesRow === false ||
          metrics.dialogFocus?.closedByEscape === false ||
          metrics.dialogFocus?.tabEscapes > 0 ||
          metrics.unexpectedRouteErrorHeadings?.length
        )
          issues.push({
            source: entry.name,
            key: `${metrics.state}--${metrics.viewport}`,
            type: "check-finding",
            metrics,
          });
      }
  }
  if (phase === "focused") {
    const path = join(directory, "artifacts/results.json");
    if (existsSync(path))
      for (const [name, observation] of Object.entries(
        read(path).cases ?? {},
      )) {
        const initial = observation.initial;
        const scroll = observation.scrollPositions ?? [];
        const keyboard = observation.keyboard ?? [];
        const note = name.startsWith("note-");
        const summaryValuesVisibleInitially =
          !!initial?.summaryText.length &&
          initial.summaryText.every(
            (element) =>
              element.top >= initial.header.bottom - 1 &&
              element.bottom <=
                (initial.footer?.top ?? initial.dialog.bottom) + 1,
          );
        const focusedRecord = {
          name,
          source: entry.name,
          status: observation.status,
          error: observation.error ?? null,
          qualified: record.qualified,
          initialScrollTop: initial?.scrollTop,
          popupInitiallyFocused: initial?.active.isPopup,
          summaryClearancePx: initial?.summaryClearancePx,
          summaryOverlapPx: initial?.summaryOverlapPx,
          summaryValuesVisibleInitially,
          initialPass:
            !!initial &&
            (note ||
              (initial.active.isPopup &&
                Math.abs(initial.scrollTop) <= 1 &&
                initial.summaryOverlapPx === 0 &&
                summaryValuesVisibleInitially)),
          cachedRequests:
            observation.requestsBeforeReopen === undefined
              ? null
              : [
                  observation.requestsBeforeReopen,
                  observation.requestsAfterReopen,
                ],
          scrollGeometry: scroll.map(({ position, geometry }) => ({
            position,
            scrollTop: geometry.scrollTop,
            headerGapPx: geometry.headerGapPx,
            footerInsidePopup: geometry.footerInsidePopup,
            horizontalOverflow: geometry.horizontalOverflow,
            dialogOverflowX: geometry.dialogOverflowX,
            bodyAboveHeader: geometry.upperStripSamples.some(
              (sample) => sample.bodyAboveHeader,
            ),
          })),
          headerPinnedAllPositions:
            !!initial &&
            [initial, ...scroll.map((entry) => entry.geometry)].every(
              (geometry) =>
                Math.abs(geometry.headerGapPx) <= 1 &&
                !geometry.upperStripSamples.some(
                  (sample) => sample.bodyAboveHeader,
                ),
            ),
          keyboardStops: keyboard.length,
          keyboardContainmentFailures: keyboard
            .filter((entry) => !entry.geometry.active.contained)
            .map((entry) => ({
              key: entry.key,
              active: entry.geometry.active,
            })),
          keyboardObscuredStops: keyboard
            .filter((entry) => !entry.geometry.active.clearOfStickyEdges)
            .map((entry) => ({
              key: entry.key,
              active: entry.geometry.active,
            })),
          reasonReachedByKeyboard: observation.reasonReachedByKeyboard,
          keyboardResize: observation.keyboardResize,
          escapeDismissed: observation.escapeDismissed,
          focusRestoredToTrigger: observation.focusRestoredToTrigger,
          noteLength: initial?.noteLength,
          actualCorrectionForm: observation.actualCorrectionForm,
          moneyWriteCount: observation.moneyWrites?.length,
          unmockedBlockedCount: observation.unmockedBlocked?.length,
          consoleErrors: observation.consoleErrors,
          axe: observation.axe,
          screenshots: Object.entries(observation)
            .filter(([key]) => /Screenshot$/.test(key))
            .map(([, value]) => `${record.directory}/artifacts/${value}`),
        };
        focused.push(focusedRecord);
        if (
          !focusedRecord.initialPass ||
          !focusedRecord.headerPinnedAllPositions ||
          focusedRecord.keyboardContainmentFailures.length ||
          focusedRecord.keyboardObscuredStops.length ||
          observation.escapeDismissed === false ||
          observation.focusRestoredToTrigger === false ||
          observation.axe?.violations.length ||
          observation.status !== "observed" ||
          (name.startsWith("correction-") &&
            (!observation.actualCorrectionForm ||
              !observation.reasonReachedByKeyboard ||
              !observation.keyboardResize?.active.clearOfStickyEdges))
        )
          issues.push({ type: "focused-acceptance", ...focusedRecord });
      }
  }
}
const inventory = [];
for (const area of ["crm", "contributions"])
  for (const state of plan.areas[area].states)
    for (const viewport of state.widths) {
      const key = `${state.name}--${viewport}`;
      const capture = invocations.filter(
        (entry) =>
          entry.phase === "capture" && entry.observedKeys.includes(key),
      );
      const check = invocations.filter(
        (entry) => entry.phase === "check" && entry.observedKeys.includes(key),
      );
      const isFull = catalogue.find((entry) => entry.name === state.name)?.full;
      const expectedPngs = [
        `${key}.png`,
        ...(isFull ? [`${key}-full.png`] : []),
      ];
      const captureArtifactsRetained = capture.some(
        (entry) =>
          entry.qualified &&
          expectedPngs.every((name) =>
            entry.artifacts.some(
              (artifact) => artifact.path === `artifacts/${name}`,
            ),
          ),
      );
      const captureQualified = capture.some(
        (entry) =>
          entry.qualified &&
          entry.completionKeys.includes(key) &&
          expectedPngs.every((name) =>
            entry.artifacts.some(
              (artifact) => artifact.path === `artifacts/${name}`,
            ),
          ),
      );
      const checkQualified = check.some(
        (entry) => entry.qualified && entry.completionKeys.includes(key),
      );
      const setupFailures = [...capture, ...check].flatMap((entry) =>
        entry.setupFailures
          .filter(
            (failure) =>
              failure.startsWith(`${state.name}:`) ||
              failure.startsWith(`${state.name}@${viewport}:`),
          )
          .map((failure) => ({ invocation: entry.tag, failure })),
      );
      inventory.push({
        area,
        state: state.name,
        viewport,
        key,
        expectedPngs,
        captureArtifactsRetained,
        captureQualified,
        checkQualified,
        completePair: captureQualified && checkQualified,
        intendedSetupQualified:
          captureQualified && checkQualified && setupFailures.length === 0,
        setupFailures,
        capture: capture.map((entry) => ({
          invocation: entry.tag,
          qualified: entry.qualified,
          invocationComplete: entry.complete,
        })),
        check: check.map((entry) => ({
          invocation: entry.tag,
          qualified: entry.qualified,
          invocationComplete: entry.complete,
        })),
      });
    }
const bundleHashes = [
  ...new Set(invocations.map((entry) => entry.bundleSha256).filter(Boolean)),
];
const expectedFocusedCases = [1440, 1024, 640, 390].flatMap((width) => [
  `receipt-delayed-${width}`,
  `receipt-cached-${width}`,
  `correction-delayed-${width}`,
  `correction-cached-${width}`,
  `note-${width}`,
]);
const qualifiedChecks = checkedMetrics.filter((entry) => entry.qualified);
const checkSummary = {
  checkedPairs: qualifiedChecks.length,
  horizontalOverflow: qualifiedChecks
    .filter((entry) => entry.horizontalOverflow)
    .map((entry) => `${entry.state}--${entry.viewport}`),
  dialogCount: qualifiedChecks.filter((entry) => entry.dialog).length,
  dialogGeometryFailures: qualifiedChecks
    .filter(
      (entry) =>
        entry.dialog &&
        (!entry.dialog.contained || entry.dialog.internalOverflowX),
    )
    .map((entry) => ({
      state: entry.state,
      viewport: entry.viewport,
      dialog: entry.dialog,
    })),
  dialogFocus: qualifiedChecks
    .filter((entry) => entry.dialogFocus)
    .map((entry) => ({
      state: entry.state,
      viewport: entry.viewport,
      ...entry.dialogFocus,
    })),
  gridKeyboard: qualifiedChecks
    .filter((entry) => entry.keyboard)
    .map((entry) => ({
      state: entry.state,
      viewport: entry.viewport,
      ...entry.keyboard,
    })),
  axeViolations: qualifiedChecks
    .filter((entry) => entry.axe?.violations.length)
    .map((entry) => ({
      state: entry.state,
      viewport: entry.viewport,
      violations: entry.axe.violations,
    })),
  axeIncomplete: qualifiedChecks
    .filter((entry) => entry.axe?.incompleteIds.length)
    .map((entry) => ({
      state: entry.state,
      viewport: entry.viewport,
      incompleteIds: entry.axe.incompleteIds,
    })),
  boundary:
    "Declared axe WCAG 2A/AA and 2.1AA automated tags only; incomplete rules are unresolved, not passes; keyboard probes are finite and not screen-reader or real phone IME evidence",
};
const summary = {
  updatedAt: new Date().toISOString(),
  root,
  boundary:
    "Owned core evidence only; root composes other areas separately; no score or integration/conformance claim",
  expectedPairs: inventory.length,
  expectedPngs: inventory.reduce(
    (total, entry) => total + entry.expectedPngs.length,
    0,
  ),
  captureArtifactPairsRetained: inventory.filter(
    (entry) => entry.captureArtifactsRetained,
  ).length,
  capturedPairs: inventory.filter((entry) => entry.captureQualified).length,
  checkedPairs: inventory.filter((entry) => entry.checkQualified).length,
  completePairs: inventory.filter((entry) => entry.completePair).length,
  intendedSetupQualifiedPairs: inventory.filter(
    (entry) => entry.intendedSetupQualified,
  ).length,
  setupFailurePairs: inventory
    .filter((entry) => entry.setupFailures.length)
    .map((entry) => entry.key),
  missingCapture: inventory
    .filter((entry) => !entry.captureQualified)
    .map((entry) => entry.key),
  missingCheck: inventory
    .filter((entry) => !entry.checkQualified)
    .map((entry) => entry.key),
  invocationCount: invocations.length,
  freshProofCount: invocations.filter((entry) => entry.freshProof).length,
  bundleHashes,
  commonBundle: bundleHashes.length === 1,
  incompleteInvocations: invocations
    .filter((entry) => !entry.complete)
    .map((entry) => entry.tag),
  artifactFailures,
  focusedCaseCount: focused.length,
  expectedFocusedCases,
  missingOrPartialFocusedCases: expectedFocusedCases.filter(
    (name) =>
      !focused.some(
        (entry) =>
          entry.name === name && entry.qualified && entry.status === "observed",
      ),
  ),
  focusedInitialPasses: focused.filter((entry) => entry.initialPass).length,
  moneyWriteCount: focused.reduce(
    (total, entry) => total + (entry.moneyWriteCount ?? 0),
    0,
  ),
  axeViolationPairs: checkSummary.axeViolations.length,
  axeIncompletePairs: checkSummary.axeIncomplete.length,
};
write("pair-inventory.json", inventory);
write("invocation-inventory.json", invocations);
write("focused-summary.json", focused);
write("findings.json", issues);
write("summary.json", summary);
write("check-summary.json", checkSummary);
const filesUnder = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(path) : [path];
  });
write("evidence-hashes.json", {
  generatedAt: new Date().toISOString(),
  files: filesUnder(owned)
    .filter((path) => path !== join(owned, "evidence-hashes.json"))
    .sort()
    .map((path) => ({
      path: relative(owned, path).replaceAll("\\", "/"),
      bytes: statSync(path).size,
      sha256: hash(path),
    })),
});
console.log(JSON.stringify(summary, null, 2));
process.exit(artifactFailures.length || bundleHashes.length > 1 ? 1 : 0);
