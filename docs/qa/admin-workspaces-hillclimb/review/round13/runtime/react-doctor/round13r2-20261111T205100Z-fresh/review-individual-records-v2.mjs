import { createHash } from "node:crypto";
import { existsSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const root = realpathSync(process.cwd());
const evidence = path.dirname(fileURLToPath(import.meta.url));
if (root !== "C:\\Users\\Conrad\\.t3\\worktrees\\core\\t3-5a24111d-r12")
  throw new Error("Wrong checkout.");
const require = createRequire(path.join(root, "package.json"));
const ts = require("typescript");
const {
  findingIdentity,
  sourceFileHash,
  sourceContextHash,
  evidenceFileHash,
  reviewReactDoctorFindings,
} = await import(
  pathToFileURL(path.join(root, "scripts/react-doctor-ledger.mjs")).href
);
const digest = (value) => createHash("sha256").update(value).digest("hex");
const readJson = (filename) => JSON.parse(readFileSync(filename, "utf8"));
const json = (name, value) =>
  writeFileSync(
    path.join(evidence, name),
    JSON.stringify(value, null, 2) + "\n",
    { flag: "wx" },
  );
const baseline = readJson(path.join(evidence, "binding-before.json"));
const ledger = readJson(
  path.join(root, "docs/qa/react-doctor/exceptions.json"),
);
const reviews = readJson(path.join(evidence, "v2-ledger-review.json"));
const scans = readJson(path.join(evidence, "strict/scans.json"));
const findings = readJson(
  path.join(evidence, "fresh-diagnostics.json"),
).findings;
const original = readJson(
  path.join(evidence, "strict/integrity.json"),
).originalHashes;
const configHash = digest(readFileSync(path.join(root, "doctor.config.json")));
const consumerSpecs = [
  {
    index: 0,
    symbol: "EveModelPolicyReadiness",
    test: "tests/unit/apps/admin/app/eve-operations-workspace.test.tsx",
  },
  {
    index: 1,
    symbol: "EveGovernanceView",
    test: "tests/unit/apps/admin/app/eve-governance-page.test.tsx",
  },
  {
    index: 4,
    symbol: "AutomationsPageView",
    test: "tests/unit/apps/admin/app/automations-page.test.tsx",
  },
  {
    index: 24,
    symbol: "ReportsPageView",
    test: "tests/unit/apps/admin/app/reports-page.test.tsx",
  },
  {
    index: 137,
    symbol: "PostComposerActions",
    test: "tests/unit/apps/missionary/worker-feed-composer-actions.test.tsx",
  },
  {
    index: 273,
    symbol: "CrmViewToolbar",
    test: "tests/unit/apps/admin/app/crm-view-toolbar.test.tsx",
  },
  {
    index: 274,
    symbol: "CrmRelationshipsFilters",
    test: "tests/unit/apps/admin/app/relationship-filter-selection.test.tsx",
  },
];
const inspections = new Map();
function inspect(relative) {
  if (inspections.has(relative)) return inspections.get(relative);
  const bytes = readFileSync(path.join(root, relative));
  const text = bytes.toString("utf8");
  const source = ts.createSourceFile(
    relative,
    text,
    ts.ScriptTarget.Latest,
    true,
    relative.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const lineAt = (node) =>
    source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;
  const imports = [];
  const mocks = [];
  const jsx = [];
  const properties = [];
  const exports = [];
  const stringArgument = (node) =>
    ts.isStringLiteralLike(node)
      ? node.text
      : ts.isCallExpression(node) &&
          node.expression.kind === ts.SyntaxKind.ImportKeyword &&
          node.arguments.length
        ? stringArgument(node.arguments[0])
        : null;
  function visit(node) {
    if (ts.isImportDeclaration(node))
      imports.push({
        kind: "static",
        module: node.moduleSpecifier.text,
        typeOnly: node.importClause?.isTypeOnly ?? false,
        line: lineAt(node),
        code: node.getText(source),
      });
    if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword
    ) {
      let initializer = node;
      while (
        ts.isAwaitExpression(initializer.parent) ||
        ts.isParenthesizedExpression(initializer.parent)
      )
        initializer = initializer.parent;
      const declaration =
        ts.isVariableDeclaration(initializer.parent) &&
        initializer.parent.initializer === initializer
          ? initializer.parent
          : null;
      const bindings =
        declaration && ts.isObjectBindingPattern(declaration.name)
          ? declaration.name.elements
              .filter(
                (binding) =>
                  ts.isIdentifier(binding.name) && !binding.dotDotDotToken,
              )
              .map((binding) => ({
                imported:
                  binding.propertyName?.getText(source) ?? binding.name.text,
                local: binding.name.text,
                line: lineAt(binding),
              }))
          : [];
      imports.push({
        kind: "dynamic",
        module: stringArgument(node.arguments[0]),
        typeOnly: false,
        line: lineAt(node),
        code: node.parent.getText(source).slice(0, 700),
        bindings,
      });
    }
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      ["mock", "doMock", "unstable_mockModule"].includes(
        node.expression.name.text,
      )
    )
      mocks.push({
        function: node.expression.getText(source),
        module: node.arguments.length
          ? stringArgument(node.arguments[0])
          : null,
        line: lineAt(node),
      });
    if (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node))
      jsx.push({ name: node.tagName.getText(source), line: lineAt(node) });
    if (ts.isPropertyAccessExpression(node))
      properties.push({
        name: node.name.text,
        line: lineAt(node),
        code: node.parent.getText(source).slice(0, 500),
      });
    if (
      (ts.isFunctionDeclaration(node) ||
        ts.isVariableStatement(node) ||
        ts.isClassDeclaration(node)) &&
      node.modifiers?.some(
        (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
      )
    )
      exports.push({
        line: lineAt(node),
        code: node.getText(source).slice(0, 250),
      });
    ts.forEachChild(node, visit);
  }
  visit(source);
  const result = {
    file: relative,
    sha256: digest(bytes),
    lines: text.split(/\r?\n/).length,
    parseErrors: source.parseDiagnostics.map((item) =>
      ts.flattenDiagnosticMessageText(item.messageText, "\n"),
    ),
    imports,
    mocks,
    jsx,
    properties,
    exports,
  };
  inspections.set(relative, result);
  return result;
}
function resolvesTo(test, module, owner) {
  if (typeof module !== "string" || !module.startsWith(".")) return false;
  const absolute = path.resolve(root, path.dirname(test), module);
  return [
    absolute,
    absolute + ".tsx",
    absolute + ".ts",
    path.join(absolute, "index.tsx"),
    path.join(absolute, "index.ts"),
  ].some(
    (candidate) =>
      existsSync(candidate) &&
      realpathSync(candidate) === realpathSync(path.join(root, owner)),
  );
}
const rebindings = [];
const holds = [];
for (const specification of consumerSpecs) {
  const record = ledger.exceptions[specification.index];
  const reviewed = reviews.records.find(
    (item) => item.ledgerIndex === specification.index,
  );
  const owner = `${record.target}/${record.filePath}`;
  const source = inspect(owner);
  const test = inspect(specification.test);
  const actualImports = test.imports.filter(
    (item) =>
      !item.typeOnly && resolvesTo(specification.test, item.module, owner),
  );
  const owningMocks = test.mocks.filter((item) =>
    resolvesTo(specification.test, item.module, owner),
  );
  const renders = test.jsx.filter((item) => item.name === specification.symbol);
  const assignments = test.properties.filter(
    (item) => item.name === specification.symbol,
  );
  const sourceExports = source.exports.filter((item) =>
    item.code.includes(specification.symbol),
  );
  const importHasSymbol =
    actualImports.some(
      (item) =>
        item.code.includes(specification.symbol) ||
        item.bindings?.some(
          (binding) =>
            binding.imported === specification.symbol &&
            binding.local === specification.symbol,
        ),
    ) || assignments.length > 0;
  const proof = {
    symbol: specification.symbol,
    owner,
    test: specification.test,
    ownerHash: source.sha256,
    testHash: test.sha256,
    runtimeImports: actualImports,
    symbolAssignments: assignments,
    jsxRenders: renders,
    sourceExports,
    owningMocks,
    testSourceReadNotExecuted: true,
    fullOwnerAndTestParsed:
      source.parseErrors.length === 0 && test.parseErrors.length === 0,
  };
  const guardPassed =
    reviewed.candidates.length === 1 &&
    actualImports.length > 0 &&
    importHasSymbol &&
    renders.length > 0 &&
    sourceExports.length > 0 &&
    owningMocks.length === 0 &&
    proof.fullOwnerAndTestParsed &&
    original[owner] === source.sha256 &&
    baseline.controlHashes[specification.test] === test.sha256 &&
    record.rule === "unused-export";
  if (!guardPassed) {
    holds.push({
      specification,
      proof,
      reason:
        "One or more complete actual-consumer proof conditions failed; no rebinding proposed.",
    });
    continue;
  }
  const diagnostic = reviewed.candidates[0].diagnostic;
  const replacement = {
    ...diagnostic,
    target: record.target,
    reason: `The actual ${specification.symbol} export is imported from its owning module and rendered by ${specification.test}, outside this target's analyzed project graph. The owning module is not mocked. This justifies only the exact unused-export identity; it does not establish test success or integration behavior.`,
    reconsiderWhen: `Reconsider if ${specification.test} stops importing/rendering the actual export, starts mocking the owning module, the export changes, or the scanner includes the external consumer graph.`,
    evidence: [
      `FROZEN OWNER ${owner}:${diagnostic.line}: actual exported ${specification.symbol}.`,
      `CURRENT TEST SOURCE ${specification.test}: import line(s) ${actualImports.map((item) => item.line).join(", ")}; JSX render line(s) ${renders.map((item) => item.line).join(", ")}; no owning-module mock. Tests read and parsed, not run.`,
      "Fresh strict/raw exact applicable identity parity and current source/evidence hashes retained in this evidence folder.",
    ],
    evidenceFileHashes: {
      [owner]: evidenceFileHash(root, owner),
      [specification.test]: evidenceFileHash(root, specification.test),
    },
    sourceFileHash: sourceFileHash(root, record.target, diagnostic),
    sourceContextHash: sourceContextHash(root, record.target, diagnostic),
  };
  reviewReactDoctorFindings(
    scans,
    { ...ledger, exceptions: [replacement] },
    { root, configHash },
  );
  rebindings.push({
    action: "propose-replace-one-exact-record-owner-approval-required",
    ledgerIndex: specification.index,
    previousIdentity: findingIdentity(record.target, record),
    previousRecordHash: digest(JSON.stringify(record)),
    currentIdentity: findingIdentity(record.target, diagnostic),
    location: { file: owner, line: diagnostic.line, column: diagnostic.column },
    proof,
    replacement,
    singleRecordMechanicalValidation: "passed-not-combined-ledger-acceptance",
  });
}
const retirements = reviews.records
  .filter(
    (review) =>
      !review.mechanicallyValid &&
      !review.exactFreshIdentity &&
      review.candidates.length === 0,
  )
  .map((review) => ({
    action: "propose-retire-only-this-absent-historical-identity",
    ledgerIndex: review.ledgerIndex,
    previousIdentity: review.previousIdentity,
    previousRecordHash: review.previousRecordHash,
    file: review.file,
    oldLine: review.oldLine,
    rule: review.rule,
    reason:
      "The exact historical identity and its same-target/file/plugin/rule/message/severity lookup group are absent from both complete fresh inventories; raw/applicable parity is exact. Deleting this unused stale record grants no waiver to any current finding and is not a source fix.",
    currentSameFileFindingCount: findings.filter(
      (finding) =>
        `${finding.target}/${finding.diagnostic.filePath}` === review.file,
    ).length,
    currentSourceFileHash: review.actualSourceHash,
    reconsiderWhen:
      "If a finding reappears, adjudicate its complete fresh identity separately; never transfer this old waiver by file, rule, line, index, or message alone.",
  }));
const explicitReadPaths = [
  "packages/ui/components/reui/data-grid/data-grid-column-header.tsx",
  "packages/ui/components/reui/data-grid/data-grid-scroll-area.tsx",
  "packages/ui/components/reui/data-grid/data-grid.tsx",
  "packages/ui/components/shadcn/rich-text-editor/legacy-rich-text-editor.tsx",
  "apps/admin/src/cms-ui/web-studio/collections/shared/document-workspace/native-revert-status.tsx",
  "apps/admin/app/(app)/contributions/use-admin-contributions.ts",
  "tests/unit/apps/admin/app/contributions-page.test.tsx",
];
for (const relative of explicitReadPaths) inspect(relative);
const proposal = {
  schemaVersion: 1,
  status: "proposal-only-not-applied-not-approved-no-pass",
  createdAt: new Date().toISOString(),
  checkpoint: baseline.checkpoint,
  manifestSha256: baseline.manifestSha256,
  diffSha256: baseline.diffSha256,
  sourceInventorySha256: baseline.sourceInventorySha256,
  expectedWholeLedgerSha256: digest(
    readFileSync(path.join(root, "docs/qa/react-doctor/exceptions.json")),
  ),
  configHash,
  scannerVersion: "0.9.18",
  summary: {
    ledgerRecords: reviews.ledgerRecords,
    mechanicallyExactPriorRecords: reviews.mechanicallyExactPriorRecords,
    staleOrUnusedRecords: reviews.staleOrUnusedRecords,
    individuallyRequalifiedConsumerRebindings: rebindings.length,
    absentIdentityRetirements: retirements.length,
    remainingStaleRecordsWithoutNewProposal:
      reviews.staleOrUnusedRecords - rebindings.length - retirements.length,
    consumerProofHolds: holds.length,
  },
  applicationConditions: [
    "No ledger edits authorized here. Root assigns and approves each exact decision separately.",
    "Match old whole-ledger SHA plus each previousIdentity and previousRecordHash; indices are navigation only.",
    "Recheck candidate, source, context, evidence and real-consumer contracts at application; no old proposal is inherited.",
    "All other diagnostics remain unresolved. No motion, prop-spread, compiler, cleanup, accessibility, payment, or framework blanket waiver is proposed.",
    "Any authorized ledger change needs a newly declared binding, combined canonical ledger validation, and a new strict eight-target invocation with official actionable.json.",
  ],
  rebindings,
  retirements,
  holds,
};
json("v2-individual-proposals.json", {
  ...proposal,
  derivation:
    "Fresh rerun of individual consumer proofs; recognizes direct destructured awaited imports. First-attempt script, holds and artifacts retained unchanged.",
});
json("v2-source-inspections.json", {
  status:
    "current-full-file-read-and-AST-inventory-not-test-execution-or-semantic-approval-of-all-code",
  files: [...inspections.values()],
});
console.log(
  JSON.stringify(
    {
      ...proposal.summary,
      rebindings: rebindings.map((item) => ({
        index: item.ledgerIndex,
        file: item.location.file,
        line: item.location.line,
        symbol: item.proof.symbol,
        importLines: item.proof.runtimeImports.map((entry) => entry.line),
        renderLines: item.proof.jsxRenders.map((entry) => entry.line),
      })),
      holds,
    },
    null,
    2,
  ),
);
process.exitCode = holds.length ? 1 : 0;
