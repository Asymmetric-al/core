import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import {
  evidenceFileHash,
  findingIdentity,
  sourceContextHash,
  sourceFileHash,
} from "../../../../../../../scripts/react-doctor-ledger.mjs";

const root = process.cwd();
assert.equal(path.basename(root), "t3-5a24111d-r12");
const outputRoot = path.dirname(fileURLToPath(import.meta.url));
const relativeOutputRoot = path
  .relative(root, outputRoot)
  .replaceAll("\\", "/");
const startedAt = new Date().toISOString();
const hash = (value) => createHash("sha256").update(value).digest("hex");
const hashFile = (file) => hash(readFileSync(path.resolve(root, file)));
const readJson = (file) =>
  JSON.parse(readFileSync(path.resolve(root, file), "utf8"));
const write = (name, value) =>
  writeFileSync(
    path.join(outputRoot, name),
    JSON.stringify(value, null, 2) + "\n",
  );
const ledgerPath = "docs/qa/react-doctor/exceptions.json";
const ledgerReview = readJson(`${relativeOutputRoot}/ledger-review.json`);
assert.equal(hashFile(ledgerPath), ledgerReview.ledgerHash);
const scans = readJson(
  `${relativeOutputRoot}/audit-20261111T174004238Z/scans.json`,
);
const currentIdentities = new Set(
  scans.flatMap((scan) =>
    scan.diagnostics.map((diagnostic) =>
      findingIdentity(scan.target, diagnostic),
    ),
  ),
);
const sourceInspections = new Map();
const fullTexts = new Map();
const resolveRelative = (file, specifier) => {
  if (!specifier.startsWith(".")) return null;
  const base = path.posix.normalize(
    path.posix.join(path.posix.dirname(file), specifier),
  );
  return (
    [
      base,
      ...[".ts", ".tsx", ".js", ".mjs", ".mts", "/index.ts", "/index.tsx"].map(
        (suffix) => base + suffix,
      ),
    ].find((candidate) => existsSync(path.resolve(root, candidate))) ?? null
  );
};
const inspectFullFile = (file) => {
  if (sourceInspections.has(file)) return sourceInspections.get(file);
  const text = readFileSync(path.resolve(root, file), "utf8");
  fullTexts.set(file, text);
  const details = {
    file,
    sha256: hashFile(file),
    lines: text.split(/\r?\n/).length,
    imports: [],
    exports: [],
    mockCalls: [],
    parseErrors: [],
  };
  if (/\.(?:[cm]?ts|tsx|[cm]?js|jsx)$/.test(file)) {
    const source = ts.createSourceFile(
      file,
      text,
      ts.ScriptTarget.Latest,
      true,
      /[jt]sx$/.test(file) ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    );
    const line = (node) =>
      source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;
    const visit = (node) => {
      if (
        ts.isImportDeclaration(node) &&
        ts.isStringLiteral(node.moduleSpecifier)
      )
        details.imports.push({
          line: line(node),
          specifier: node.moduleSpecifier.text,
          resolvedRelative: resolveRelative(file, node.moduleSpecifier.text),
          text: node.getText(source),
        });
      if (
        ts.isCallExpression(node) &&
        node.expression.kind === ts.SyntaxKind.ImportKeyword &&
        node.arguments.length === 1 &&
        ts.isStringLiteral(node.arguments[0])
      )
        details.imports.push({
          line: line(node),
          specifier: node.arguments[0].text,
          resolvedRelative: resolveRelative(file, node.arguments[0].text),
          dynamic: true,
        });
      if (
        ts.isCallExpression(node) &&
        ts.isPropertyAccessExpression(node.expression) &&
        node.expression.expression.getText(source) === "vi" &&
        ["mock", "doMock", "unmock", "importActual"].includes(
          node.expression.name.text,
        ) &&
        node.arguments[0] &&
        ts.isStringLiteral(node.arguments[0])
      )
        details.mockCalls.push({
          line: line(node),
          operation: node.expression.name.text,
          specifier: node.arguments[0].text,
          resolvedRelative: resolveRelative(file, node.arguments[0].text),
        });
      if (
        node.modifiers?.some(
          (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
        )
      ) {
        if (node.name && ts.isIdentifier(node.name))
          details.exports.push({
            name: node.name.text,
            line: line(node),
            kind: ts.SyntaxKind[node.kind],
          });
        if (ts.isVariableStatement(node))
          for (const declaration of node.declarationList.declarations)
            details.exports.push({
              name: declaration.name.getText(source),
              line: line(declaration),
              kind: "VariableDeclaration",
            });
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
    details.parseErrors = source.parseDiagnostics.map((diagnostic) => ({
      code: diagnostic.code,
      message: ts.flattenDiagnosticMessageText(diagnostic.messageText, " "),
    }));
  }
  sourceInspections.set(file, details);
  return details;
};
const windowAt = (file, line) => {
  inspectFullFile(file);
  const lines = fullTexts.get(file).split(/\r?\n/);
  if (line === 0)
    return {
      line: 0,
      context:
        "Package-level dependency diagnostic; inspect the full manifest.",
    };
  if (line > lines.length)
    return {
      line,
      context:
        "The historical location is beyond the current file; it is not a current-source location.",
    };
  const first = Math.max(1, line - 3);
  const last = Math.min(lines.length, line + 4);
  return {
    line,
    first,
    last,
    context: lines
      .slice(first - 1, last)
      .map((text, index) => `${first + index}: ${text}`)
      .join("\n"),
  };
};
const nativeIndices = new Set([
  78,
  ...Array.from({ length: 16 }, (_value, index) => 82 + index),
]);
const unusedBindings = new Map([
  [
    0,
    {
      symbol: "EveModelPolicyReadiness",
      file: "tests/unit/apps/admin/app/eve-operations-workspace.test.tsx",
      binding:
        "Named runtime import at line 7; real exported component rendered at line 158.",
    },
  ],
  [
    1,
    {
      symbol: "EveGovernanceView",
      file: "tests/unit/apps/admin/app/eve-governance-page.test.tsx",
      binding:
        "Actual page-client dynamic import at line 30, export assignment at line 31 and render at line 37.",
    },
  ],
  [
    4,
    {
      symbol: "AutomationsPageView",
      file: "tests/unit/apps/admin/app/automations-page.test.tsx",
      binding:
        "Actual page-client dynamic import at line 123, export assignment at line 127 and render at line 139.",
    },
  ],
  [
    24,
    {
      symbol: "ReportsPageView",
      file: "tests/unit/apps/admin/app/reports-page.test.tsx",
      binding:
        "Actual page-client dynamic import at line 172, export assignment at line 176 and render at line 191.",
    },
  ],
  [
    137,
    {
      symbol: "PostComposerActions",
      file: "tests/unit/apps/missionary/worker-feed-composer-actions.test.tsx",
      binding:
        "Actual worker-feed-page-client dynamic import at line 103, export assignment at line 104 and render at line 143; the type-only import is not the consumer proof.",
    },
  ],
  [
    273,
    {
      symbol: "CrmViewToolbar",
      file: "tests/unit/apps/admin/app/crm-view-toolbar.test.tsx",
      binding:
        "Actual dynamic import/destructuring at lines 9-10 and render at line 13.",
    },
  ],
  [
    274,
    {
      symbol: "CrmRelationshipsFilters",
      file: "tests/unit/apps/admin/app/relationship-filter-selection.test.tsx",
      binding:
        "Actual dynamic import/destructuring at lines 9-10 and render at line 15.",
    },
  ],
]);
const sharedEdit =
  "apps/admin/src/cms-ui/web-studio/collections/shared/document-workspace/NativeCollectionEditView.tsx";
const sharedList =
  "apps/admin/src/cms-ui/web-studio/collections/shared/list-workspace/NativeCollectionListView.tsx";
const editTest =
  "tests/unit/apps/admin/web-studio-published-page-link.test.tsx";
const listTest =
  "tests/unit/apps/admin/web-studio-collection-list-drawer.test.tsx";
const frameworkFiles = [
  "apps/admin/node_modules/payload/package.json",
  "apps/admin/node_modules/@payloadcms/ui/package.json",
  "apps/admin/node_modules/payload/dist/admin/views/document.d.ts",
  "apps/admin/node_modules/payload/dist/admin/views/list.d.ts",
  "apps/admin/node_modules/@payloadcms/ui/dist/views/Edit/index.d.ts",
  "apps/admin/node_modules/@payloadcms/ui/dist/views/Edit/index.js",
  "apps/admin/node_modules/@payloadcms/ui/dist/views/List/index.d.ts",
];
const frameworkEvidenceHashes = Object.fromEntries(
  frameworkFiles.map((file) => [file, hashFile(file)]),
);
const rebindings = [];
const retirements = [];
const dispositions = [];
const ruleLimits = {
  "no-ungated-tailwind-animation":
    "Do not refresh this motion exception from matching class text alone. The changed evidence requires requalification of the current full stylesheet/import/cascade chain, animation implementation and essential-spinner contract; no motion/browser check is performed in this assignment.",
  "jsx-props-no-spreading":
    "The package-manifest evidence or owner changed. A shared export alone does not prove the current primitive/ref/event/render/ARIA forwarding contract at this exact site. This location has no proposed waiver.",
  "unused-export":
    "A changed export/evidence needs an actual runtime test or production/package/framework consumer of this exact current export, not a type-only reference or a mocked module. This location has no proposed waiver.",
  "unused-dependency":
    "The current manifest/tooling discovery and mounted shared-provider contract must be requalified together; the old policy rationale is not automatically refreshed.",
  "no-array-index-as-key":
    "The current full collection's insertion/reordering and identity/state contract has not been established as fixed identity; do not infer safety from an old static-snapshot rationale.",
  "no-prevent-default":
    "The current event owner/default behavior and cancellation contract needs exact handler/consumer evidence; a historical form or grid exception does not transfer automatically.",
  "prefer-dynamic-import":
    "The current importer, lazy/synchronous ownership and installed package API need requalification. No blanket synchronous-import or worker exception is proposed.",
  "server-sequential-independent-await":
    "The changed CMS auth/identity-sync and lockfile evidence must prove present failure-order dependence. No auth/tenant integration is run here, so the historic ordering rationale remains unresolved.",
};
for (const entry of ledgerReview.entries) {
  const record = entry.record;
  const file = path.posix.join(record.target, record.filePath);
  const source = inspectFullFile(file);
  const evidence = Object.entries(record.evidenceFileHashes).map(
    ([evidenceFile, oldHash]) => {
      const inspected = inspectFullFile(evidenceFile);
      return {
        file: evidenceFile,
        previousHash: oldHash,
        currentHash: inspected.sha256,
        changed: oldHash !== inspected.sha256,
      };
    },
  );
  const base = {
    ledgerIndex: entry.index,
    previousIdentity: entry.identity,
    previousRecordHash: hash(JSON.stringify(record)),
    file,
    oldLocation: {
      line: record.line,
      column: record.column,
      offset: record.offset,
      length: record.length,
    },
    rule: `${record.plugin}/${record.rule}`,
    staleReasons: entry.issues,
    sourceFileHash: source.sha256,
    currentEvidence: evidence,
    candidates: entry.candidates.map((candidate) => ({
      ...candidate,
      sourceWindow: windowAt(file, candidate.diagnostic.line),
    })),
  };
  if (!entry.issues.length) {
    dispositions.push({
      ...base,
      disposition: "currently-hash-valid-prior-record",
      reason:
        "Exact current identity and all canonical source/evidence hashes validate. This is retained prior evidence, not a new semantic approval or an official audit pass.",
    });
    continue;
  }
  if (!entry.candidates.length) {
    const retirement = {
      ...base,
      action: "remove-obsolete-identity-only",
      currentSourceLocationNote: windowAt(file, record.line),
      reason:
        "The complete current target inventory has no diagnostic with the same file, plugin, rule, message and severity. Remove only this unused historical identity; do not transfer its exception to a new file or claim that moved/replaced implementation is fixed.",
      reconsiderWhen:
        "A future applicable scan emits a diagnostic in this or a replacement owner. Review that new exact diagnostic from scratch.",
    };
    retirements.push(retirement);
    dispositions.push({
      ...base,
      disposition: "propose-retire-absent-identity",
      reason: retirement.reason,
    });
    continue;
  }
  if (nativeIndices.has(entry.index) || unusedBindings.has(entry.index)) {
    assert.equal(entry.candidates.length, 1);
    const candidate = entry.candidates[0];
    const diagnostic = candidate.diagnostic;
    const evidenceFiles = new Set([file]);
    let reason;
    let reconsiderWhen;
    let contract;
    if (nativeIndices.has(entry.index)) {
      const isSharedEdit = entry.index === 78;
      const isList = file.includes("/list/");
      const collection = isSharedEdit ? "pages" : file.split("/")[5];
      const collectionConfig = `apps/admin/src/cms/collections/${collection}.ts`;
      const test = isList ? listTest : editTest;
      for (const proof of [
        sharedEdit,
        sharedList,
        test,
        collectionConfig,
        "apps/admin/package.json",
        "bun.lock",
      ])
        evidenceFiles.add(proof);
      for (const proof of evidenceFiles) inspectFullFile(proof);
      if (!isSharedEdit) {
        assert.ok(
          source.imports.some(
            (item) =>
              item.resolvedRelative === (isList ? sharedList : sharedEdit),
          ),
        );
        const exported = source.exports.find(
          (item) => item.kind === "FunctionDeclaration",
        );
        assert.ok(exported);
        assert.ok(
          fullTexts.get(collectionConfig).includes(`#${exported.name}`),
        );
      }
      reason = isSharedEdit
        ? "At this exact spread, the wrapper removes only studioCollection from DocumentViewClientProps and forwards the remaining Payload framework props to DefaultEditView; explicit BeforeDocumentControls/Status/PreviewButton slots follow the spread. Preserving the installed DocumentViewClientProps/DocumentSlots API is the integration contract, not an untyped application-object shortcut. This rebind approves only the spread diagnostic, not new settings, preview, revert or permission behavior."
        : isList
          ? `The ${collection} collection registers this exact list adapter. Its Omit<NativeCollectionListViewProps, 'collectionSlug'> input is forwarded to the shared list owner, with collectionSlug (and ministry-update createHrefOverride where present) explicitly set after the spread. The shared owner keeps Payload list-drawer selection on DefaultListView and consumes query/column/access props; enumeration here would narrow the registered adapter contract.`
          : `The ${collection} collection registers this exact document adapter. The complete wrapper accepts DocumentViewClientProps and passes those framework slots to NativeCollectionEditView with studioCollection explicitly fixed after the spread. The shared owner removes that discriminator before forwarding to Payload DefaultEditView; this is the typed registration boundary, not arbitrary data propagation.`;
      reconsiderWhen =
        "Reconsider this exact identity if the Payload version/DocumentViewClientProps or shared list type, collection registration, forwarding/filtering, ref/event/render composition, explicit slot overrides or drawer fallback changes. No waiver transfers to another location or to unrelated behavior.";
      contract = {
        kind: "registered-Payload-prop-boundary",
        collection,
        frameworkEvidenceHashes,
        limits:
          "Installed contracts and current repository consumers inspected. Existing tests use mocked Payload/provider boundaries and were read, not run; no live framework/auth/tenant integration is claimed.",
      };
    } else {
      const binding = unusedBindings.get(entry.index);
      const consumer = inspectFullFile(binding.file);
      assert.ok(source.exports.some((item) => item.name === binding.symbol));
      assert.ok(
        consumer.imports.some(
          (item) =>
            item.resolvedRelative === file &&
            (!item.text?.startsWith("import type") || item.dynamic),
        ),
      );
      assert.ok(
        !consumer.mockCalls.some(
          (item) =>
            ["mock", "doMock"].includes(item.operation) &&
            item.resolvedRelative === file,
        ),
      );
      assert.ok(fullTexts.get(binding.file).includes(`<${binding.symbol}`));
      evidenceFiles.add(binding.file);
      reason = `The current ${binding.file} imports and renders the actual ${binding.symbol} export from this exact owning module, which is outside this target's analyzed project graph. ${binding.binding} The consumer does not mock the owning module. This is an unused-export scope false positive only; it does not certify behavior or test success.`;
      reconsiderWhen = `Reconsider if ${binding.file} stops importing/rendering the real ${binding.symbol}, mocks or redirects its owning module, moves to a type-only reference, or the public test seam is intentionally migrated.`;
      contract = {
        kind: "actual-external-test-consumer",
        ...binding,
        limits:
          "Current full module/test AST and mock/import ownership inspected; tests are not run and no authenticated/provider integration is claimed.",
      };
    }
    const evidenceFileHashes = Object.fromEntries(
      [...evidenceFiles]
        .sort()
        .map((evidenceFile) => [
          evidenceFile,
          evidenceFileHash(root, evidenceFile),
        ]),
    );
    const replacement = {
      ...diagnostic,
      target: record.target,
      reason,
      evidence: [
        `CURRENT SOURCE ${file}:${diagnostic.line}:${diagnostic.column}: exact ${diagnostic.plugin}/${diagnostic.rule} identity in round13 applicable and raw inventories.`,
        ...(contract.kind === "actual-external-test-consumer"
          ? [
              `CURRENT TEST SOURCE (read, not run) ${contract.file}: ${contract.binding}`,
            ]
          : [
              `CURRENT CONTRACT ${sharedEdit}:102,824,984 and ${sharedList}:36,76,186; actual collection registration and existing synthetic tests are hash-bound. Installed Payload declaration/implementation hashes are preserved separately in this proposal because node_modules is not permitted as a ledger evidence path.`,
            ]),
        `REVIEW ${relativeOutputRoot}/report.md: bounded round13 requalification; source and consumer/framework limitations remain explicit.`,
      ],
      reconsiderWhen,
      sourceContextHash: sourceContextHash(root, record.target, diagnostic),
      sourceFileHash: sourceFileHash(root, record.target, diagnostic),
      evidenceFileHashes,
    };
    assert.ok(
      currentIdentities.has(findingIdentity(record.target, replacement)),
    );
    rebindings.push({
      ledgerIndex: entry.index,
      action: "replace-one-exact-record",
      previousIdentity: entry.identity,
      previousRecordHash: base.previousRecordHash,
      currentIdentity: candidate.identity,
      location: {
        file,
        line: diagnostic.line,
        column: diagnostic.column,
        offset: diagnostic.offset,
        length: diagnostic.length,
      },
      contract,
      replacement,
    });
    dispositions.push({
      ...base,
      disposition: "propose-exact-rebinding",
      reason,
      reconsiderWhen,
    });
    continue;
  }
  const reason =
    entry.index === 11
      ? "Reject the historical real-consumer claim: contributions-page.test.tsx:87-101 mocks the entire use-admin-contributions owner, provides its own loadMockAdminContributions at line 95, and later imports/calls that mock at lines 467-482 and 1711. The actual source export at use-admin-contributions.ts:35 therefore has no demonstrated runtime consumer in this test. Do not rebind or create a consumer just for scanner cleanliness."
      : (ruleLimits[record.rule] ??
        "The current owner/context or supporting evidence changed. Full-file structural and hash inspection does not establish the previous semantic exception under present handler, lifecycle, framework or consumer contracts. Keep this exact current finding unresolved; no waiver is proposed.");
  dispositions.push({
    ...base,
    disposition:
      entry.index === 11
        ? "reject-mocked-consumer-rebinding"
        : entry.candidates.length > 1
          ? "hold-ambiguous-or-unqualified-contract"
          : "hold-unqualified-current-contract",
    reason,
    reconsiderWhen:
      "A separate exact source/consumer/framework review establishes a concrete false positive with current evidence, or the actual defect is fixed under the owning scope. Until then retain the finding as unresolved.",
  });
}

const frozenManifestPath =
  "docs/qa/admin-workspaces-hillclimb/snapshots/round13-manifest.json";
const frozenManifest = readJson(frozenManifestPath);
const sourceMismatches = frozenManifest.files.filter((entry) =>
  entry.status === "D"
    ? existsSync(path.resolve(root, entry.path))
    : !existsSync(path.resolve(root, entry.path)) ||
      hashFile(entry.path) !== entry.sha256,
);
assert.equal(sourceMismatches.length, 0);
const originalIntegrity = readJson(
  `${relativeOutputRoot}/audit-20261111T174004238Z/integrity.json`,
);
const currentAuditSourceDrift = Object.entries(
  originalIntegrity.originalHashes,
).filter(
  ([file, expected]) =>
    !existsSync(path.resolve(root, file)) || hashFile(file) !== expected,
);
assert.equal(currentAuditSourceDrift.length, 0);
const preservedReports = {};
for (const directory of [
  "audit-20261111T174004238Z",
  "raw-20261111T174004238Z",
])
  for (const file of readdirSync(path.join(outputRoot, directory))) {
    const relative = `${relativeOutputRoot}/${directory}/${file}`;
    preservedReports[relative] = hashFile(relative);
  }
const proposedIdentities = new Set(
  rebindings.map((entry) => entry.currentIdentity),
);
assert.equal(proposedIdentities.size, rebindings.length);
assert.equal(dispositions.length, ledgerReview.entries.length);
const summary = {
  ledgerRecords: dispositions.length,
  currentlyExactHashValid: dispositions.filter(
    (entry) => entry.disposition === "currently-hash-valid-prior-record",
  ).length,
  staleRecords: dispositions.filter((entry) => entry.staleReasons.length)
    .length,
  proposedExactRebindings: rebindings.length,
  proposedAbsentIdentityRetirements: retirements.length,
  unresolvedStaleRecords: dispositions.filter(
    (entry) =>
      entry.disposition.startsWith("hold-") ||
      entry.disposition.startsWith("reject-"),
  ).length,
  applicableDiagnostics: currentIdentities.size,
  currentlyUnresolvedDiagnostics:
    currentIdentities.size - ledgerReview.validEntries,
  unresolvedDiagnosticsIfOnlyTheseRebindingsAreApproved:
    currentIdentities.size - ledgerReview.validEntries - rebindings.length,
};
const proposal = {
  schemaVersion: 1,
  status: "proposal-only-not-applied-not-pass",
  createdAt: new Date().toISOString(),
  ledgerPath,
  expectedLedgerHash: ledgerReview.ledgerHash,
  expectedConfigHash: ledgerReview.configHash,
  expectedFrozenManifestHash: hashFile(frozenManifestPath),
  expectedFrozenDiffHash: hashFile(
    "docs/qa/admin-workspaces-hillclimb/snapshots/round13.diff",
  ),
  summary,
  applicationConditions: [
    "Parent must independently approve each exact replacement/removal and match previousIdentity plus previousRecordHash; ledgerIndex is informational only.",
    "Reject application after any bound source/config/ledger/evidence or installed framework contract changes; requalify first.",
    "Do not blanket-refresh hashes, copy rationales across locations, add ignores or treat retained unknown debt as exceptions.",
    "After approved application, parent must run a fresh strict all-eight-target check. This proposal leaves unresolved diagnostics and stale records, and cannot create a pass by itself.",
  ],
  rebindings,
  retirements,
};
write("proposal.json", proposal);
write("adjudication.json", {
  startedAt,
  endedAt: new Date().toISOString(),
  summary,
  method:
    "Every ledger source and supporting evidence file is read completely and structurally parsed where applicable. A current AST/import match is not semantic approval: only individually checked typed Payload adapters and actual non-mocked external runtime test consumers receive rebindings. All other changed contracts remain unapproved, with current candidates, snippets and hash deltas retained per identity.",
  dispositions,
  fullFileInspections: [...sourceInspections.values()],
});
write("preserved-audit-hashes.json", {
  capturedAt: new Date().toISOString(),
  hashes: preservedReports,
});
write("adjudication-integrity.json", {
  verifiedAt: new Date().toISOString(),
  frozenEntries: frozenManifest.files.length,
  sourceMismatches,
  auditOriginalFiles: Object.keys(originalIntegrity.originalHashes).length,
  currentAuditSourceDrift,
  ledgerUnchanged: hashFile(ledgerPath) === ledgerReview.ledgerHash,
  configUnchanged: hashFile("doctor.config.json") === ledgerReview.configHash,
  summary,
});
console.log(JSON.stringify(summary, null, 2));
