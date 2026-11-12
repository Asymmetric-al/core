import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";

const outputRoot = path.dirname(fileURLToPath(import.meta.url));
const startedAt = new Date().toISOString();
const sources = new Map();
const readSource = (file) => {
  const text = readFileSync(file, "utf8");
  sources.set(file, createHash("sha256").update(text).digest("hex"));
  return ts.createSourceFile(
    file,
    text,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
};
const locate = (source, predicate) => {
  let result;
  const visit = (node) => {
    if (!result && predicate(node)) result = node;
    if (!result) ts.forEachChild(node, visit);
  };
  visit(source);
  assert.ok(result, `Missing source node in ${source.fileName}`);
  return result;
};
const namedVariable = (source, name) =>
  locate(
    source,
    (node) =>
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === name,
  );
const compile = (source, context) => {
  const result = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.None,
      jsx: ts.JsxEmit.React,
    },
  });
  return vm.runInNewContext(result.outputText, context, { timeout: 1000 });
};

const revertSource = readSource(
  "apps/admin/src/cms-ui/web-studio/collections/shared/document-workspace/native-revert-status.tsx",
);
const revertExpression = namedVariable(
  revertSource,
  "revert",
).initializer.getText(revertSource);
const revertResults = [];
for (const [readStatus, writeStatus] of [
  [403, 200],
  [500, 200],
  [200, 403],
]) {
  const readBody =
    readStatus === 200
      ? { id: 13, title: "Published" }
      : { errors: [{ message: `Read failed: ${readStatus}` }] };
  const writes = [];
  const events = [];
  const context = {
    setPending: (value) => events.push(["pending", value]),
    locale: "en",
    api: "/web-studio-api",
    collectionSlug: "pages",
    id: 13,
    formatAdminURL: ({ apiRoute, path: documentPath }) =>
      `${apiRoute}${documentPath}`,
    fetch: async (_url, options) => {
      if (options.method === "GET")
        return new Response(JSON.stringify(readBody), { status: readStatus });
      writes.push({ method: options.method, body: JSON.parse(options.body) });
      return new Response(
        JSON.stringify(
          writeStatus === 200
            ? { doc: { id: 13 }, message: "Updated" }
            : { errors: [{ message: "Write denied" }] },
        ),
        { status: writeStatus },
      );
    },
    reset: (value) => events.push(["reset", value]),
    toast: {
      success: (message) => events.push(["success", message]),
      error: (message) => events.push(["error", message]),
    },
    incrementVersionCount: () => events.push(["incrementVersionCount"]),
    setMostRecentVersionIsAutosaved: (value) =>
      events.push(["autosaved", value]),
    setUnpublishedVersionCount: (value) => events.push(["unpublished", value]),
    onReverted: () => events.push(["onReverted"]),
    REVERT_FAILED: "The document couldn't be reverted. Try again.",
  };
  const revert = compile(`(${revertExpression})`, context);
  await revert();
  assert.equal(writes.length, 1);
  assert.deepEqual(writes[0].body, readBody);
  assert.equal(
    events.some(([event]) => event === "onReverted"),
    writeStatus === 200,
  );
  revertResults.push({ readStatus, writeStatus, writes, events });
}

const gridSource = readSource(
  "packages/ui/components/reui/data-grid/data-grid.tsx",
);
const gridNames = [
  "DATA_GRID_UNPUBLISHED_STATE",
  "isDataGridPropNode",
  "dataGridPropsSignatureReplacer",
  "getDataGridStateInputs",
  "getDataGridCallbackInputs",
  "isSameDataGridInputs",
  "DataGridProvider",
];
const gridDeclarations = gridNames
  .map((name) => {
    const statement = gridSource.statements.find(
      (node) =>
        (ts.isFunctionDeclaration(node) && node.name?.text === name) ||
        (ts.isVariableStatement(node) &&
          node.declarationList.declarations.some(
            (declaration) => declaration.name.getText(gridSource) === name,
          )),
    );
    assert.ok(statement, `Missing grid declaration ${name}`);
    return statement.getText(gridSource);
  })
  .join("\n");
const hookState = [];
let hookCursor = 0;
const useRef = (value) => {
  const position = hookCursor++;
  return (hookState[position] ??= { current: value });
};
const useMemo = (factory, dependencies) => {
  const position = hookCursor++;
  const previous = hookState[position];
  if (
    !previous ||
    previous.dependencies.length !== dependencies.length ||
    dependencies.some(
      (value, index) => !Object.is(value, previous.dependencies[index]),
    )
  ) {
    hookState[position] = { dependencies, value: factory() };
  }
  return hookState[position].value;
};
const provider = compile(`${gridDeclarations}\nDataGridProvider`, {
  useRef,
  useMemo,
  useId: () => "grid-source-probe",
  useEffect: () => {},
  useLayoutEffect: () => {},
  mergeDataGridI18n: (labels) => labels,
  createDataGridAutoSizeController: () => ({}),
  React: {
    createElement: (type, props, ...children) => ({ type, props, children }),
  },
  DataGridContext: { Provider: "provider" },
});
const store = {};
const committedTable = {
  state: { pagination: { pageIndex: 0, pageSize: 10 } },
  options: { data: [], columns: [] },
  atoms: {},
  store,
};
hookCursor = 0;
const committedValue = provider({
  table: committedTable,
  recordCount: 1,
  isLoading: false,
  i18n: { marker: "committed" },
}).props.value;
const uncommittedTable = {
  ...committedTable,
  options: { ...committedTable.options, data: [{ id: "not-committed" }] },
};
hookCursor = 0;
provider({
  table: uncommittedTable,
  recordCount: 5,
  isLoading: true,
  i18n: { marker: "not-committed" },
});
const gridResult = {
  previouslyPublishedTableChangedWithoutCommit:
    committedValue.table === uncommittedTable,
  previouslyPublishedPropsLoadingWithoutCommit: committedValue.props.isLoading,
  previouslyPublishedLabelsWithoutCommit: committedValue.i18n.marker,
  committedLoadingScalar: committedValue.isLoading,
  committedRecordCountScalar: committedValue.recordCount,
};
assert.equal(gridResult.previouslyPublishedTableChangedWithoutCommit, true);
assert.equal(gridResult.previouslyPublishedPropsLoadingWithoutCommit, true);
assert.equal(gridResult.committedLoadingScalar, false);
assert.equal(gridResult.committedRecordCountScalar, 1);

const eveSource = readSource(
  "apps/admin/app/(app)/admin/eve/workspace-shell.tsx",
);
const callbackExpression = (name) =>
  namedVariable(eveSource, name).initializer.arguments[0].getText(eveSource);
let scheduledFrames = 0;
const scrollToSection = compile(`(${callbackExpression("scrollToSection")})`, {
  window: {
    requestAnimationFrame: () => {
      scheduledFrames++;
    },
  },
});
const openSection = compile(`(${callbackExpression("openSection")})`, {
  tabForSection: () => "overview",
  writeTabToUrl: () => {},
  pendingSection: { current: null },
  scrollToSection,
  setTabState: (updater) => {
    updater("overview");
    updater("overview");
  },
});
openSection("overview-section");
assert.equal(scheduledFrames, 2);

const report = {
  command:
    "node docs/qa/admin-workspaces-hillclimb/review/round13/runtime/react-doctor/source-probes.mjs",
  startedAt,
  endedAt: new Date().toISOString(),
  exitCode: 0,
  sourceFileHashes: Object.fromEntries(sources),
  method:
    "TypeScript AST extracts actual frozen handler/provider declarations; isolated VM callbacks replace framework hooks, effects, network and DOM. No actual network request, React renderer, server, browser, provider or authenticated integration is exercised.",
  revertResults,
  gridResult,
  eveResult: { sameStateUpdaterInvocations: 2, scheduledFrames },
  limits: [
    "Synthetic source-level probes, not new product tests or a real concurrent React renderer.",
    "No assertion that a live Payload server accepts the synthetic PATCH body or that data loss occurred.",
    "The Eve probe deliberately invokes the updater twice; it establishes impurity, not browser scroll behavior.",
  ],
};
writeFileSync(
  path.join(outputRoot, "source-probes.json"),
  JSON.stringify(report, null, 2) + "\n",
);
console.log(
  JSON.stringify(
    {
      exitCode: report.exitCode,
      revertReadFailuresForwardedToPatch: revertResults
        .slice(0, 2)
        .map((result) => result.readStatus),
      gridResult,
      eveResult: report.eveResult,
    },
    null,
    2,
  ),
);
