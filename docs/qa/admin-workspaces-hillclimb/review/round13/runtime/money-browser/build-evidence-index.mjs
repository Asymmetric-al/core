import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  existsSync,
  readFileSync,
  readdirSync,
  realpathSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const checkout = realpathSync(process.cwd());
assert.ok(
  checkout.replaceAll("\\", "/").endsWith("/t3-5a24111d-r12"),
  "Wrong checkout",
);
const expectedRoot = join(
  checkout,
  "docs/qa/admin-workspaces-hillclimb/review/round13/runtime/money-browser",
);
assert.equal(realpathSync(root), realpathSync(expectedRoot));
const generatedAt = new Date().toISOString();
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const read = (path) => JSON.parse(readFileSync(join(root, path), "utf8"));
const write = (path, data) => {
  const target = resolve(root, path);
  const within = relative(root, target);
  assert.ok(
    within && !within.startsWith("..") && !isAbsolute(within),
    "Output escaped ownership",
  );
  writeFileSync(target, `${JSON.stringify(data, null, 2)}\n`);
};
const checks = [];
const verify = (name, passed, detail) =>
  checks.push({ name, passed: Boolean(passed), detail });
const fixtureSha256 =
  "afed848ea1dc100a2818ff77f3530987d5f8784fa324bfb3d72acda7443ad48b";
const inspection = read("regenerated-fixture-inspection.json");
const money = read("money-v5/results.json");
const reports = read("reports-v6/results.json");
const fundTop = read("fund-top-v6/results.json");
const freeze = read("post-capture-frozen-source-proof.json");
const cardRuns = [
  {
    directory: "cards-batch-v1",
    script: "cards-batch.v1.mjs",
    counts: [1, 2, 4, 5, 7],
  },
  {
    directory: "cards-batch-v2",
    script: "cards-batch.v2.mjs",
    counts: [6, 10],
  },
];
const scripts = [
  { directory: "money-v5", script: "browser-probes.v5.mjs", data: money },
  { directory: "reports-v6", script: "browser-probes.mjs", data: reports },
  { directory: "fund-top-v6", script: "browser-probes.mjs", data: fundTop },
  ...cardRuns.map((run) => ({
    ...run,
    data: read(`${run.directory}/results.json`),
  })),
].map(({ directory, script, data }) => {
  const actual = sha256(readFileSync(join(root, script)));
  verify(`${directory}: exact capture script`, actual === data.scriptSha256, {
    script,
    expected: data.scriptSha256,
    actual,
  });
  const proof = read(`${directory}/fixture-proof.json`);
  verify(
    `${directory}: prepared fixture proof`,
    proof.bundleSha256 === fixtureSha256 &&
      proof.typecheck === "passed" &&
      /all 1645 checks passed/.test(proof.verification),
    proof,
  );
  return {
    directory,
    script,
    scriptSha256: actual,
    fixtureSha256: data.fixtureSha256,
    proof: `${directory}/fixture-proof.json`,
    startedAt: data.startedAt,
    finishedAt: data.finishedAt,
  };
});

const layouts = [];
const keyboard = [];
for (const run of cardRuns) {
  const data = read(`${run.directory}/results.json`);
  for (const count of run.counts) {
    const result = data.results.find((candidate) => candidate.count === count);
    assert.ok(result, `Missing cardinality ${count}`);
    const inputPath = `${run.directory}/input-rows-${count}.json`;
    const input = read(inputPath);
    const inputSha256 = sha256(readFileSync(join(root, inputPath)));
    verify(
      `${run.directory}/${count}: input bytes`,
      inputSha256 === result.inputSha256,
      inputSha256,
    );
    verify(
      `${run.directory}/${count}: unchanged generated rows`,
      JSON.stringify(input) ===
        JSON.stringify(inspection.contributionRows.slice(0, count)),
      { count, actualCount: input.length },
    );
    verify(
      `${run.directory}/${count}: no guarded API or money writes`,
      result.guard.length === 0 &&
        result.moneyWrites.length === 0 &&
        result.fixtureMissing.length === 0,
      {
        guards: result.guard.length,
        moneyWrites: result.moneyWrites.length,
        missing: result.fixtureMissing.length,
      },
    );
    for (const width of result.widths) {
      const gap = Number.parseFloat(width.layout.gap);
      const rows = [];
      for (const cell of width.layout.rows) {
        let row = rows.find(
          (candidate) => Math.abs(candidate.y - cell.y) < 0.5,
        );
        if (!row) {
          row = { y: cell.y, cells: [] };
          rows.push(row);
        }
        row.cells.push(cell);
      }
      const measuredRows = rows.map((row) => {
        const cells = row.cells.sort((left, right) => left.x - right.x);
        const occupiedWidth =
          cells.reduce((total, cell) => total + cell.width, 0) +
          gap * (cells.length - 1);
        return {
          y: row.y,
          count: cells.length,
          widths: cells.map((cell) => cell.width),
          childWidths: cells.map((cell) => cell.child?.width ?? null),
          spans: cells.map((cell) => cell.span),
          occupiedWidth,
          fillRatio: occupiedWidth / width.layout.list.width,
          withinRowWidthRange:
            Math.max(...cells.map((cell) => cell.width)) -
            Math.min(...cells.map((cell) => cell.width)),
          maximumChildWidthDelta: Math.max(
            ...cells.map((cell) =>
              Math.abs(cell.width - (cell.child?.width ?? cell.width)),
            ),
          ),
        };
      });
      verify(
        `cards ${count}/${width.viewport.width}: loaded names/money/count/no page overflow`,
        width.status === "observed" &&
          width.layout.rows.length === count &&
          width.content.every((row) => row.namePresent && row.moneyPresent) &&
          !width.layout.horizontalOverflow,
        {
          pageWidth: width.layout.pageWidth,
          rowCount: width.layout.rows.length,
        },
      );
      verify(
        `cards ${count}/${width.viewport.width}: balanced occupied rows`,
        measuredRows.every(
          (row) =>
            Math.abs(row.fillRatio - 1) < 0.001 &&
            row.maximumChildWidthDelta < 0.1,
        ),
        measuredRows.map((row) => row.fillRatio),
      );
      layouts.push({
        source: `${run.directory}/results.json`,
        count,
        viewport: width.viewport,
        input: inputPath,
        inputSha256,
        screenshot: `${run.directory}/${width.screenshot}`,
        gridScreenshot: `${run.directory}/${width.gridScreenshot}`,
        pageWidth: width.layout.pageWidth,
        horizontalOverflow: width.layout.horizontalOverflow,
        list: width.layout.list,
        cssColumns: width.layout.columns,
        gap,
        rowPattern: measuredRows.map((row) => row.count),
        measuredRows,
        content: width.content,
        viewSwitchVisible: width.viewSwitchVisible,
      });
      if (width.keyboard) {
        const resultKeyboard = width.keyboard;
        verify(
          `cards ${count}/${width.viewport.width}: keyboard selection and confirmation`,
          !resultKeyboard.error &&
            resultKeyboard.checked === "true" &&
            resultKeyboard.checkedAfterClear === "false" &&
            resultKeyboard.closedByEscape &&
            resultKeyboard.receiptTriggerAvailable &&
            (!resultKeyboard.viewSwitchAvailable ||
              (resultKeyboard.tablePressed === "true" &&
                resultKeyboard.cardsPressed === "true" &&
                resultKeyboard.tableVisible)),
          resultKeyboard,
        );
        keyboard.push({
          count,
          source: `${run.directory}/results.json`,
          ...resultKeyboard,
        });
      }
    }
  }
}
verify("exact clean card matrix", layouts.length === 28, {
  layouts: layouts.length,
  counts: [1, 2, 4, 5, 6, 7, 10],
  widths: [1440, 1024, 640, 390],
});
verify("six clean keyboard cases", keyboard.length === 6, keyboard.length);

const receipts = money.results
  .filter((record) => record.name.startsWith("receipt-"))
  .map((record) => {
    const state = record.cachedReopen ?? record.firstOpen;
    return {
      name: record.name,
      screenshot: `money-v5/${record.screenshot}`,
      scrollTop: state.scrollTop,
      headingBottom: state.heading.bottom,
      summaryTop: state.summary.top,
      summaryContainerOverlapPx: state.heading.bottom - state.summary.top,
      summaryFullyBelowHeading: state.summaryFullyBelowHeading,
      summaryTextFullyBelowHeading: state.summaryTextFullyBelowHeading,
      requestsBeforeReopen: record.requestsBeforeReopen,
      requestsAfterReopen: record.requestsAfterReopen,
      guardCount: record.guard.length,
      moneyWriteCount: record.moneyWrites.length,
    };
  });
const fund = money.results
  .filter((record) => record.name.startsWith("eligible-fund-"))
  .map((record) => ({
    name: record.name,
    anchor: record.anchor,
    menuTriggerLabel: record.menuTriggerLabel,
    menuScreenshot: `money-v5/${record.menuScreenshot}`,
    screenshot: `money-v5/${record.screenshot}`,
    naturalOpen: record.form,
    fields: record.fields,
    moneyWriteCount: record.moneyWrites.length,
  }));
const sourceResults = [
  ...money.results,
  ...reports.results,
  ...fundTop.results,
];
verify(
  "authoritative priority scenarios reached controls",
  sourceResults.every(
    (record) =>
      record.status === "observed" &&
      record.guard.length === 0 &&
      record.missing.length === 0 &&
      (record.moneyWrites?.length ?? 0) === 0,
  ),
  sourceResults.map((record) => ({ name: record.name, status: record.status })),
);

const review = [];
const actualSearch = read("cards-batch-v2/results.json").results.find(
  (record) => record.count === 10,
).actualSearch;
const reviewed = (path, finding, readiness = "reviewed") => {
  verify(
    `reviewed image exists: ${path}`,
    existsSync(join(root, path)),
    readiness,
  );
  review.push({ path, readiness, finding });
};
for (const layout of layouts) {
  const affected =
    (layout.count === 7 && [640, 390].includes(layout.viewport.width)) ||
    (layout.count === 10 && [640, 390].includes(layout.viewport.width));
  reviewed(
    layout.gridScreenshot,
    affected
      ? "Loaded layout reviewed; element screenshot auto-scroll leaves sticky header occlusion. Use paired viewport image and measurements; not missing DOM data."
      : "Loaded names, money, receipt/payment context and occupied row balance reviewed; no visual score.",
    affected ? "reviewed-with-capture-occlusion" : "reviewed-loaded-grid",
  );
}
for (const receipt of receipts)
  reviewed(
    receipt.screenshot,
    "Resend summary text readable, but summary container starts 8px under the sticky heading; scrollTop 0.",
  );
for (const width of [1440, 390]) {
  reviewed(
    `money-v5/eligible-fund-${width}.png`,
    width === 390
      ? "Genuine form, natural scrollTop 439 with Reason focused; current summary/destination above viewport; body bleeds into top padding."
      : "Genuine fund correction form with warnings, destination, receipt choices and reason; not submitted.",
  );
  reviewed(
    `money-v5/gift-menu-${width}.png`,
    "Actual gift-specific menu including Correct fund designation, opens upward within viewport.",
  );
  reviewed(
    `money-v5/long-note-${width}-top.png`,
    "Long note and pinned context reviewed; Linked record is Not set, not a linked donor.",
  );
  reviewed(
    `money-v5/long-note-${width}-bottom.png`,
    "Internal scrolling retains context/footer; body text bleeds through top padding strip above pinned heading.",
  );
}
reviewed(
  "fund-top-v6/eligible-fund-390-top.png",
  "Manually scrolled top, not initial state; heading bottom172, summary top164.",
);
for (const width of [1440, 390]) {
  reviewed(
    `reports-v6/reports-${width}-donors-90d.png`,
    "Loaded controls/totals with chart skeleton; not a fully settled report image.",
    "partial-chart-readiness",
  );
  reviewed(
    `reports-v6/reports-${width}-missionaries-30d.png`,
    width === 390
      ? "Loading view, not loaded report evidence."
      : "Chart panels not settled; later full image contains bars/table.",
    "partial-loading",
  );
  reviewed(
    `reports-v6/reports-${width}-missionaries-30d-full.png`,
    width === 390
      ? "Controls/totals loaded, chart skeleton and incomplete page capture remain."
      : "Bars and table loaded; fixture labels remain static fund names despite missionary grouping.",
    width === 390 ? "partial-chart-readiness" : "reviewed-static-fixture-data",
  );
  reviewed(
    `reports-v6/reports-${width}-funds-30d-full.png`,
    "Loaded Funds list precedes compact unavailable monthly trend; existing fixture date bounds null.",
  );
  reviewed(
    `reports-v6/reports-${width}-trend-unavailable.png`,
    "Compact unavailable notice and retry control, not a loaded server trend.",
  );
}
reviewed(
  "reports-v6/reports-390-after-jump.png",
  "Funds heading lands at y16 beneath48px sticky application header; title hidden after Jump to funds.",
);
for (const path of [
  "cards-batch-v2/cards-10-390.png",
  "cards-batch-v2/cards-10-640.png",
])
  reviewed(
    path,
    "Actual viewport image: first card name/money/receipt visible; launcher can obscure lower-right content.",
  );
for (const path of [
  "cards-batch-v2/cards-6-1440-selection.png",
  "cards-batch-v2/cards-6-1024-selection.png",
  "cards-batch-v2/cards-6-1440-receipt-confirmation.png",
  "cards-batch-v2/cards-10-390-selection.png",
  "cards-batch-v2/cards-10-390-receipt-confirmation.png",
  `cards-batch-v2/${actualSearch.screenshot}`,
]) {
  reviewed(
    path,
    path.includes("search")
      ? "Actual Theodore search narrows the ten-row fixture to one visible row."
      : "Selection or receipt confirmation reviewed; no receipt submission.",
  );
}
write("visual-review.json", {
  generatedAt,
  method:
    "Human visual inspection of native saved PNGs during this evidence task, preserved across the context handoff; not automated DOM inference. No new browser capture after freeze drift.",
  images: review,
});

const reportRows = reports.results.map((record) => ({
  name: record.name,
  states: Object.fromEntries(
    ["initial", "reload", "selected", "selectedReload", "fundsSelected"].map(
      (key) => {
        const state = record[key];
        return [
          key,
          {
            url: state.url,
            params: state.params,
            group: state.group,
            period: state.period,
            historyLength: state.history,
            horizontalOverflow: state.metrics.horizontalOverflow,
            requests: state.requests,
          },
        ];
      },
    ),
  ),
  fundsTrendOrder: { ...record.fundsTrendOrder, text: undefined },
  mobileJump: record.mobileJump,
  backToReports: record.backToReports,
  forward: record.forward,
}));
write("evidence-summary.json", {
  generatedAt,
  evidenceOnly: true,
  base: "http://localhost:3031",
  fixtureSha256,
  scripts,
  freeze: {
    ...freeze,
    interpretation:
      "Saved post-capture preflight failure, not a fresh check. Successful runs passed their startup frozen check; no independent end-of-run frozen proof retained. No further browser run after this failure.",
  },
  receipts,
  fund,
  phoneFundManualTop: fundTop.results[0].manuallyScrolledTop,
  longNotes: money.results
    .filter((record) => record.name.startsWith("long-note-"))
    .map((record) => ({
      name: record.name,
      top: record.top,
      bottom: record.bottom,
      createdOnlyInMemory: record.createdNotes,
    })),
  reports: reportRows,
  layouts: layouts.sort(
    (left, right) =>
      left.count - right.count || right.viewport.width - left.viewport.width,
  ),
  keyboard,
  actualSearch,
  committedCapture: read("committed-capture-execution.json"),
  committedCheck: read("committed-check-focused-execution.json"),
  axe: read("committed-check-focused/workspace-checks.json"),
  limitations: [
    "No visual score, WCAG conformance, provider-success, auth/tenant integration, live trend or money mutation claim.",
    "Static Reports fixture does not establish date filtering or donor/missionary aggregation.",
    "Subset cardinalities are unmodified current fixture rows, not every product filter pathway.",
    "Older failed/partial probes remain preserved and are excluded from the clean card matrix.",
    "Supplemental full-page capture stopped on three frozen-file mismatches before browser launch.",
  ],
});

const collect = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? collect(path) : entry.isFile() ? [path] : [];
  });
const excluded = new Set([
  "artifact-index.json",
  "offline-verification.json",
  "offline-index.log",
]);
const files = collect(root)
  .filter((path) => !excluded.has(relative(root, path).replaceAll("\\", "/")))
  .sort()
  .map((path) => {
    const bytes = readFileSync(path);
    const name = relative(root, path).replaceAll("\\", "/");
    const png = name.endsWith(".png");
    if (png)
      assert.equal(
        bytes.subarray(0, 8).toString("hex"),
        "89504e470d0a1a0a",
        name,
      );
    return {
      path: name,
      bytes: bytes.length,
      sha256: sha256(bytes),
      ...(png
        ? { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) }
        : {}),
      modifiedAt: statSync(path).mtime.toISOString(),
    };
  });
write("artifact-index.json", {
  generatedAt,
  ownershipRoot: root.replaceAll("\\", "/"),
  excludes: [...excluded],
  reason:
    "Index excludes itself, its post-write verification and the active console log to avoid recursive or changing hashes.",
  fileCount: files.length,
  pngCount: files.filter((file) => file.width).length,
  files,
});

const reportPath = join(root, "report.md");
verify("report exists", existsSync(reportPath));
if (existsSync(reportPath)) {
  const reportText = readFileSync(reportPath, "utf8");
  const links = [...reportText.matchAll(/\]\((?:<([^>]+)>|([^\n)]+))\)/g)].map(
    (match) => match[1] ?? match[2],
  );
  for (const link of links) {
    if (/^https?:/.test(link)) continue;
    const withoutLine = link
      .replace(/:\d+(?::\d+)?$/, "")
      .replace(/#L\d+(?:C\d+)?$/, "");
    const target = isAbsolute(withoutLine)
      ? withoutLine
      : resolve(root, withoutLine);
    const generatedAfterChecks =
      resolve(target) === resolve(root, "offline-verification.json");
    verify(
      `report link: ${link}`,
      existsSync(target) || generatedAfterChecks,
      generatedAfterChecks
        ? "Generated immediately after the link checks"
        : undefined,
    );
  }
}
const index = read("artifact-index.json");
verify(
  "indexed bytes independently rehashed",
  index.files.every(
    (file) => sha256(readFileSync(join(root, file.path))) === file.sha256,
  ),
);
const failed = checks.filter((check) => !check.passed);
write("offline-verification.json", {
  generatedAt,
  mode: "Offline artifact/structure verification only; no browser, service, fixture regeneration or product mutation.",
  checks: checks.length,
  passed: checks.length - failed.length,
  failed,
  artifactIndexSha256: sha256(readFileSync(join(root, "artifact-index.json"))),
});
console.log(
  JSON.stringify(
    {
      checks: checks.length,
      failed,
      cleanCardLayouts: layouts.length,
      keyboardCases: keyboard.length,
      reviewedImages: review.length,
      indexedFiles: index.fileCount,
      indexedPngs: index.pngCount,
    },
    null,
    2,
  ),
);
if (failed.length) process.exitCode = 1;
