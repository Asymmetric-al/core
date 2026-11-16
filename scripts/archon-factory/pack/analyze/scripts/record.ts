// Validate and persist an analysis report. The analyst's result is read from
// the node-outcome listing, so a failed analyst is still recorded. Malformed or
// missing output is a failed analysis, never a healthy one. Material findings
// become attention items for Samson's triage, deduplicated by fingerprint.
import { readFileSync } from "node:fs";
import path from "node:path";

import { StateConflict, createArchon } from "../../.shared/archon.mjs";
import { factoryPaths, loadConfig } from "../../.shared/config.mjs";
import { sha256 } from "../../.shared/round.mjs";
import {
  assessAnalysis,
  nodeOutcome,
  readNodeOutcomes,
} from "./record-logic.mjs";

const config = loadConfig();
const paths = factoryPaths(config);
const archon = createArchon();
const runId = process.env.WORKFLOW_ID!;
const dir = path.posix.join(paths.runs, runId);
const request = JSON.parse(
  readFileSync(path.posix.join(dir, "analysis-request.json"), "utf8"),
);
const respond = (status: string, reason: string) => {
  process.stdout.write(JSON.stringify({ status, reason }) + "\n");
  process.exit(0);
};
if (request.analyze !== "yes") respond("skipped", request.reason);
const outcome = nodeOutcome(
  readNodeOutcomes(process.env.NODE_OUTCOMES_FILE),
  "analyst",
  runId,
);
const { status, problem, result } = assessAnalysis({
  outcome,
  ids: request.ids ?? [],
});
const findings = result?.findings ?? [];
const reportName = `core/analysis/reports/${runId}`;
const report = {
  v: 1,
  run: runId,
  scope: request.scope,
  trigger: request.trigger,
  digest: request.digest,
  status,
  problem,
  at: new Date().toISOString(),
  instructions: "analyze-v1",
  result,
};
await archon.put(reportName, report, { ifRevision: 0 }).catch(() => null);
for (let attempt = 0; attempt < 4; attempt += 1) {
  const index = await archon.get("core/analysis");
  const reports = [
    ...(index.value?.reports ?? []),
    {
      run: runId,
      scope: request.scope,
      trigger: request.trigger,
      digest: request.digest,
      status,
      at: report.at,
      findings: findings.length,
    },
  ].slice(-40);
  try {
    await archon.put(
      "core/analysis",
      { v: 1, reports },
      { ifRevision: index.revision },
    );
    break;
  } catch (error) {
    if (!(error instanceof StateConflict)) throw error;
  }
}
for (const finding of findings.filter(
  (item: { material: boolean }) => item.material,
)) {
  const fingerprint = sha256({
    scope: request.scope,
    title: finding.title.toLowerCase(),
  }).slice(0, 24);
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const attention = await archon.get("core/attention");
    const items = attention.value?.items ?? [];
    if (
      items.some(
        (item: { fingerprint: string; status: string }) =>
          item.fingerprint === fingerprint && item.status === "open",
      )
    )
      break;
    try {
      await archon.put(
        "core/attention",
        {
          v: 1,
          items: [
            ...items,
            {
              fingerprint,
              title: finding.title.slice(0, 200),
              scope: request.scope,
              report: runId,
              status: "open",
              at: report.at,
            },
          ].slice(-50),
        },
        { ifRevision: attention.revision },
      );
      break;
    } catch (error) {
      if (!(error instanceof StateConflict)) throw error;
    }
  }
}
respond(status, problem || `${findings.length} finding(s)`);
