import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { evidenceRoot, save, sha256 } from "./gate.mjs";

const read = (relativePath) =>
  JSON.parse(readFileSync(join(evidenceRoot, relativePath), "utf8"));
const hash = (relativePath) =>
  sha256(readFileSync(join(evidenceRoot, relativePath)));
const directories = readdirSync(evidenceRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && /^\d\d-/.test(entry.name))
  .map((entry) => entry.name)
  .sort();
const completedGates = directories.filter((name) => name !== "01-preview");
const checks = [];
const check = (name, operation) => {
  operation();
  checks.push(name);
};
const bundleSha256 =
  "afed848ea1dc100a2818ff77f3530987d5f8784fa324bfb3d72acda7443ad48b";
const proofs = [];
const intervals = [];

for (const probe of completedGates) {
  const before = read(`${probe}/before/gate.json`);
  const after = read(`${probe}/after/gate.json`);
  check(`${probe}: frozen boundary pair`, () => {
    for (const [phase, receipt] of [
      ["before", before],
      ["after", after],
    ]) {
      assert.equal(receipt.checkpoint, "round13r2");
      assert.equal(receipt.freeze.files, 1038);
      assert.deepEqual(receipt.freeze.mismatches, []);
      assert.deepEqual(receipt.freeze.extra, []);
      assert.deepEqual(receipt.inputMismatches, []);
      assert.equal(receipt.gateSourceSha256, hash("gate.mjs"));
      for (const audit of ["inputs-before.json", "inputs-after.json"]) {
        const inventory = read(`${probe}/${phase}/${audit}`);
        assert.equal(inventory.files.length, 226);
        assert.deepEqual(inventory.mismatches, []);
        assert.ok(
          inventory.files.every(
            (entry) => entry.expectedSha256 === entry.actualSha256,
          ),
        );
      }
      const commands = readdirSync(join(evidenceRoot, probe, phase)).filter(
        (name) => name.endsWith(".command.json"),
      );
      assert.equal(commands.length, receipt.commandCount);
      for (const commandFile of commands) {
        const command = read(`${probe}/${phase}/${commandFile}`);
        assert.equal(command.exitCode, 0);
        assert.equal(command.error, null);
        for (const stream of [command.stdout, command.stderr])
          assert.equal(hash(`${probe}/${phase}/${stream.path}`), stream.sha256);
      }
    }
    assert.ok(Date.parse(before.endedAtUtc) < Date.parse(after.startedAtUtc));
  });
  check(`${probe}: fresh mandatory fixture proof preserved`, () => {
    assert.equal(before.proof.bundleSha256, bundleSha256);
    assert.equal(before.proof.typecheck, "passed");
    assert.match(before.proof.verification, /all 1645 checks passed/);
    assert.equal(
      hash(`${probe}/before/fixture-proof.original.json`),
      before.preflight.originalSha256,
    );
    assert.equal(
      hash(`${probe}/before/fixture-proof.preserved.json`),
      before.preflight.preservedSha256,
    );
    assert.equal(
      before.preflight.originalSha256,
      before.preflight.preservedSha256,
    );
    assert.ok(
      Date.parse(before.proof.verifiedAt) >=
        Date.parse(before.preflight.startedAtUtc),
    );
    assert.ok(
      Date.parse(before.proof.verifiedAt) <=
        Date.parse(before.preflight.endedAtUtc),
    );
  });
  proofs.push({
    probe,
    verifiedAt: before.proof.verifiedAt,
    originalAndPreservedSha256: before.preflight.originalSha256,
    preflightElapsedMs: before.preflight.elapsedMs,
  });
  intervals.push({
    probe,
    beforeStartedAtUtc: before.startedAtUtc,
    preparedAtUtc: before.endedAtUtc,
    afterStartedAtUtc: after.startedAtUtc,
    afterEndedAtUtc: after.endedAtUtc,
    beforeElapsedMs: before.elapsedMs,
    afterElapsedMs: after.elapsedMs,
  });
}
check("fixture preflights have distinct actual verification times", () =>
  assert.equal(
    new Set(proofs.map((entry) => entry.verifiedAt)).size,
    completedGates.length,
  ),
);

const browserResults = directories
  .filter((name) => Number(name.slice(0, 2)) >= 5)
  .map((name) => read(`${name}/probe-result.json`));
for (const result of browserResults) {
  check(
    `${result.probe}: retained browser observations and exact driver source`,
    () => {
      assert.equal(result.outcome, "completed");
      assert.deepEqual(result.failures, []);
      assert.equal(
        hash(`${result.probe}/invocation-source.mjs`),
        result.sourceSha256,
      );
      assert.ok(result.steps.every((step) => step.outcome === "completed"));
      assert.ok(
        Date.parse(result.steps[0].startedAtUtc) >=
          Date.parse(read(`${result.probe}/before/gate.json`).endedAtUtc),
      );
      for (const observation of result.observations) {
        assert.equal(
          hash(`${result.probe}/${observation.a11yPath}`),
          observation.a11ySha256,
        );
        if (observation.screenshotPath)
          assert.equal(
            hash(`${result.probe}/${observation.screenshotPath}`),
            observation.screenshotSha256,
          );
        assert.equal(observation.state.viewport.width, result.viewport.width);
        assert.equal(observation.state.viewport.height, result.viewport.height);
      }
      assert.ok(
        result.network.every(
          (request) => request.origin === "http://localhost:3031",
        ),
      );
    },
  );
}

const resultFor = (name) =>
  browserResults.find((result) => result.probe === name);
const pickerResults = [];
for (const name of ["05-picker-desktop-tab", "07-picker-mobile-tab"]) {
  const result = resultFor(name);
  const open = result.observations.find((entry) => entry.label === "01-open");
  const tabs = result.observations.filter((entry) =>
    entry.label.startsWith("02-tab-"),
  );
  check(
    `${name}: observed dismissal, not twelve open-popup focus escapes`,
    () => {
      assert.equal(open.state.picker.expanded, "true");
      assert.ok(
        open.state.roles.some(
          (role) => role.role === "dialog" && role.containsActive,
        ),
      );
      assert.equal(open.state.active.label, "Search template");
      assert.equal(tabs.length, 12);
      assert.equal(tabs[0].state.active.id, "title");
      assert.ok(
        tabs.every(
          (entry) =>
            entry.state.picker.expanded === "false" &&
            entry.state.roles.length === 0,
        ),
      );
    },
  );
  pickerResults.push({
    probe: name,
    openRole: "dialog",
    openAriaModal: open.state.roles.find((role) => role.role === "dialog")
      .ariaModal,
    firstTabActiveId: tabs[0].state.active.id,
    firstTabDismissedPopup: true,
    laterSamplesAreOpenModalEscapes: false,
    keypresses: result.observations
      .filter((entry) => /^(02|03)-/.test(entry.label))
      .map((entry) => ({
        label: entry.label,
        tag: entry.state.active.tag,
        id: entry.state.active.id,
        name: entry.state.active.label ?? entry.state.active.text,
        pickerExpanded: entry.state.picker.expanded,
      })),
  });
}
for (const name of [
  "06-picker-desktop-escape",
  "08-picker-mobile-escape",
  "11-picker-desktop-escape-repeat",
]) {
  const result = resultFor(name);
  check(`${name}: independent Escape dismissal and trigger restoration`, () => {
    const open = result.observations.find((entry) => entry.label === "01-open");
    const settled = result.observations.find(
      (entry) => entry.label === "03-escape-settled",
    );
    assert.equal(open.state.picker.expanded, "true");
    assert.ok(
      open.state.roles.some(
        (role) => role.role === "dialog" && role.containsActive,
      ),
    );
    assert.equal(settled.state.picker.expanded, "false");
    assert.equal(settled.state.roles.length, 0);
    assert.equal(settled.state.active.id, "page-template");
  });
}

const bulkTab = resultFor("09-bulk-tab");
const bulkEscape = resultFor("10-bulk-escape");
check("bulk: native implicit dialog role and measured Tab containment", () => {
  const open = bulkTab.observations.find((entry) => entry.label === "01-open");
  assert.equal(open.state.bulkContainer.tag, "DIALOG");
  assert.equal(open.state.bulkContainer.role, null);
  assert.equal(open.state.bulkContainer.ariaModal, "true");
  assert.match(
    readFileSync(join(evidenceRoot, "09-bulk-tab/01-open.a11y.yaml"), "utf8"),
    /^- dialog "Confirm publish":/,
  );
  const keys = bulkTab.observations.filter((entry) =>
    /^(02|03)-/.test(entry.label),
  );
  assert.equal(keys.length, 16);
  assert.ok(
    keys.every(
      (entry) =>
        entry.state.bulkContainer?.containsActive === true &&
        entry.state.bulkHeading?.visible === true,
    ),
  );
});
check(
  "bulk: independent Escape closes after transition and restores Publish focus",
  () => {
    const open = bulkEscape.observations.find(
      (entry) => entry.label === "01-open",
    );
    const settled = bulkEscape.observations.find(
      (entry) => entry.label === "03-escape-settled",
    );
    assert.equal(open.state.bulkContainer.tag, "DIALOG");
    assert.equal(settled.state.bulkContainer, null);
    assert.equal(settled.state.bulkHeading, null);
    assert.equal(settled.state.active.text, "Publish");
  },
);
for (const result of [bulkTab, bulkEscape]) {
  check(
    `${result.probe}: no confirmation activation or target/version mutation`,
    () => {
      assert.equal(result.recordPreservation.length, 6);
      assert.ok(
        result.recordPreservation.every(
          (entry) =>
            entry.unchanged &&
            entry.beforeStatus === 200 &&
            entry.afterStatus === 200,
        ),
      );
      assert.ok(
        result.network.every((entry) =>
          ["GET", "HEAD", "OPTIONS"].includes(entry.method),
        ),
      );
      assert.ok(
        result.steps.every(
          (entry) =>
            !/^(native-Enter|native-Space|activate-confirm|confirm-bulk)/.test(
              entry.name,
            ),
        ),
      );
    },
  );
}

const stages = [
  "01-created-draft",
  "02-first-publish-validation",
  "03-initial-published",
  "04-newer-autosaved-draft",
  "05-successor-published",
].map((name) => read(`03-published-lifecycle/${name}.json`));
const slug1 = "owned-r13r2-studio-live-6e543a5d-20261111-v1";
const slug2 = "owned-r13r2-studio-live-6e543a5d-20261111-v2";
const defaultRecord = (stage) =>
  stage.requests.find((entry) => entry.path === "/api/pages/108?depth=0").body;
const draftRecord = (stage) =>
  stage.requests.find(
    (entry) => entry.path === "/api/pages/108?depth=0&draft=true",
  ).body;
const liveLinks = (stage) =>
  stage.ui.links.filter((link) => link.text.startsWith("View live page"));
check(
  "installed lifecycle: real old published slug retained while saved draft changes slug",
  () => {
    assert.equal(defaultRecord(stages[0])._status, "draft");
    assert.equal(liveLinks(stages[0]).length, 0);
    assert.equal(defaultRecord(stages[2])._status, "published");
    assert.equal(defaultRecord(stages[2]).slug, slug1);
    assert.equal(defaultRecord(stages[3])._status, "published");
    assert.equal(defaultRecord(stages[3]).slug, slug1);
    assert.equal(draftRecord(stages[3])._status, "draft");
    assert.equal(draftRecord(stages[3]).slug, slug2);
    for (const stage of [stages[2], stages[3]]) {
      assert.equal(liveLinks(stage).length, 2);
      assert.ok(
        liveLinks(stage).every(
          (link) => link.href === `http://localhost:3000/${slug1}`,
        ),
      );
    }
    assert.match(stages[3].ui.text, /Older version public/);
  },
);
check(
  "installed lifecycle: supported successor publication updates both live links",
  () => {
    assert.equal(defaultRecord(stages[4])._status, "published");
    assert.equal(defaultRecord(stages[4]).slug, slug2);
    assert.equal(draftRecord(stages[4])._status, "published");
    assert.equal(liveLinks(stages[4]).length, 2);
    assert.ok(
      liveLinks(stages[4]).every(
        (link) => link.href === `http://localhost:3000/${slug2}`,
      ),
    );
    const versions = stages[4].requests.find((entry) =>
      entry.path.startsWith("/api/pages/versions?"),
    ).body.docs;
    assert.ok(
      versions.some(
        (entry) =>
          entry.id === 130 &&
          entry.version._status === "published" &&
          entry.version.slug === slug1,
      ),
    );
    assert.ok(
      versions.some(
        (entry) =>
          entry.id === 131 &&
          entry.version._status === "draft" &&
          entry.version.slug === slug2 &&
          entry.autosave === true,
      ),
    );
    assert.ok(
      versions.some(
        (entry) =>
          entry.id === 132 &&
          entry.version._status === "published" &&
          entry.version.slug === slug2,
      ),
    );
  },
);

const originals = read("03-published-lifecycle/original-records.json");
const finalRecords = read("13-final-preservation-read/actual-records.json");
const preservation = originals.records.map((query, index) => ({
  path: query.path,
  beforeCount: query.body.docs.length,
  finalPath: finalRecords[index].path,
  finalCount: finalRecords[index].body.docs.length,
  records: query.body.docs.map((record) => {
    const finalRecord = finalRecords[index].body.docs.find(
      (entry) => entry.id === record.id,
    );
    return {
      id: record.id,
      title: record.title,
      beforeSha256: sha256(JSON.stringify(record)),
      finalSha256: sha256(JSON.stringify(finalRecord)),
      unchanged: JSON.stringify(record) === JSON.stringify(finalRecord),
    };
  }),
}));
check(
  "original fourteen page records unchanged in default and draft-inclusive reads",
  () => {
    assert.ok(finalRecords.every((entry) => entry.status === 200));
    for (const query of preservation) {
      assert.equal(query.beforeCount, 14);
      assert.equal(query.finalCount, 15);
      assert.ok(query.records.every((record) => record.unchanged));
    }
    for (const query of finalRecords.slice(0, 2))
      assert.deepEqual(
        query.body.docs
          .filter(
            (record) =>
              !originals.records[0].body.docs.some(
                (original) => original.id === record.id,
              ),
          )
          .map((record) => record.id),
        [108],
      );
    assert.deepEqual(finalRecords[2].body, defaultRecord(stages[4]));
    assert.equal(finalRecords[3].body.totalDocs, 5);
    assert.deepEqual(
      finalRecords[3].body.docs.map((entry) => entry.id),
      [132, 131, 130, 129, 128],
    );
  },
);

const qualification = {
  validatedAtUtc: new Date().toISOString(),
  verdict:
    "VERIFIED bounded installed-publication, picker-dismissal and bulk-confirmation keyboard claims; limitations retained",
  checks,
  checkCount: checks.length,
  frozenBoundaryPairs: completedGates.length,
  pinnedInputCount: 226,
  frozenFileCount: 1038,
  bundleSha256,
  proofs,
  intervals,
  pickerResults,
  originalRecordPreservation: preservation,
  ownedRecordRetained: {
    id: 108,
    tenant: 1,
    title: finalRecords[2].body.title,
    slug: finalRecords[2].body.slug,
    status: finalRecords[2].body._status,
    versionIds: finalRecords[3].body.docs.map((entry) => entry.id),
    deletionAttempted: false,
  },
  browserProbeSummaries: browserResults.map((result) => ({
    probe: result.probe,
    startedAtUtc: result.startedAtUtc,
    endedAtUtc: result.endedAtUtc,
    elapsedMs: result.elapsedMs,
    browserVersion: result.browserVersion,
    sourceSha256: result.sourceSha256,
    observationCount: result.observations.length,
    console: result.console,
    requestIssues: result.network.filter(
      (entry) => entry.status >= 400 || entry.failure,
    ),
    nonReadTransportMethods: result.network.filter(
      (entry) => !["GET", "HEAD", "OPTIONS"].includes(entry.method),
    ),
  })),
  qualifications: [
    "01-preview was an aborted preparation only; no completed preflight or browser probe is claimed for it.",
    "04-picker-desktop shared-preview clicks failed twice; missing downloaded attempt JSON was not reconstructed as raw browser evidence.",
    "Desktop Escape probe 06 retains a hydration warning showing caret-color attribute differences; repeat 11 retained the same keyboard result without that warning, using original caret and allowed animations.",
    "Bulk Escape immediately restored focus before its close transition fully removed the visible DOM; settled evidence follows an explicit 350ms wait.",
    "12-final-records includes ordinary installed relationship POST transports and recent-item preference POSTs; transport bodies and override headers were not captured. 13 separately re-read actual final records after the browser inspection.",
    "No outbound public-destination traversal, bulk confirmation, visual scoring, broad accessibility conformance, production or cross-browser claim.",
  ],
};
save(join(evidenceRoot, "qualification.json"), qualification);
console.log(
  JSON.stringify({
    checkCount: checks.length,
    frozenBoundaryPairs: completedGates.length,
    proofCount: proofs.length,
    originalRecordsUnchanged: preservation.every((entry) =>
      entry.records.every((record) => record.unchanged),
    ),
    ownedRecord: qualification.ownedRecordRetained,
    intervalStart: intervals[0].beforeStartedAtUtc,
    intervalEnd: intervals.at(-1).afterEndedAtUtc,
  }),
);
