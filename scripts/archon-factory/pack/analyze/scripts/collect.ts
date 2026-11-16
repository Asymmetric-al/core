// Trusted collector: freeze a bounded, sanitized evidence packet. Enforces
// coalescing, cooldown and daily budgets before any model call.
import {
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
  existsSync,
} from "node:fs";
import path from "node:path";

import { createArchon } from "../../.shared/archon.mjs";
import { factoryPaths, loadConfig } from "../../.shared/config.mjs";
import { ensureInitialRunIdentity } from "../../.shared/identity.mjs";
import { sha256 } from "../../.shared/round.mjs";
import { boundPacket, redact } from "./collect-logic.mjs";

const LIMITS = {
  packetChars: 48_000,
  excerpts: 32,
  autoPerDay: 4,
  incidentCooldownMs: 30 * 60_000,
};
const config = loadConfig();
const paths = factoryPaths(config);
const archon = createArchon();
const runId = process.env.WORKFLOW_ID!;
await ensureInitialRunIdentity({ config, runId });
const trigger = String(process.env.INPUTS_TRIGGER ?? "operator");
const scope = String(process.env.INPUTS_SCOPE ?? "factory");
const out = (
  analyze: string,
  assignment: string,
  reason: string,
  extra: Record<string, unknown> = {},
) => {
  const dir = path.posix.join(paths.runs, runId);
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    path.posix.join(dir, "analysis-request.json"),
    JSON.stringify({ analyze, reason, trigger, scope, ...extra }, null, 2),
  );
  process.stdout.write(JSON.stringify({ analyze, assignment, reason }) + "\n");
  process.exit(0);
};
if (!["operator", "incident", "daily", "retrospective"].includes(trigger))
  out("no", "", "Unknown trigger");
if (scope !== "factory" && !/^issue:\d+$/.test(scope))
  out("no", "", "Unknown scope");

const index = await archon.get("core/analysis");
const reports = index.value?.reports ?? [];
const today = new Date().toISOString().slice(0, 10);
if (trigger !== "operator") {
  const automatic = reports.filter(
    (report: { trigger: string; at: string }) =>
      report.trigger !== "operator" && report.at.startsWith(today),
  ).length;
  if (automatic >= LIMITS.autoPerDay)
    out(
      "no",
      "",
      `Automatic analysis budget for ${today} is used (${LIMITS.autoPerDay})`,
    );
  const last = reports
    .filter(
      (report: { scope: string; trigger: string }) =>
        report.scope === scope && report.trigger === trigger,
    )
    .at(-1);
  if (
    trigger === "incident" &&
    last &&
    Date.now() - Date.parse(last.at) < LIMITS.incidentCooldownMs
  )
    out("no", "", "Incident analysis is cooling down for this scope");
}

const evidence: { id: string; kind: string; source: string; text: string }[] =
  [];
const add = (kind: string, source: string, value: unknown) => {
  if (evidence.length >= LIMITS.excerpts) return;
  const text = redact(
    typeof value === "string" ? value : JSON.stringify(value),
  ).slice(0, 3000);
  evidence.push({ id: `E${evidence.length + 1}`, kind, source, text });
};
const issues = await archon.list("core/issues/", { values: true });
for (const entry of issues.documents ?? []) {
  if (!/^core\/issues\/\d+$/.test(entry.name)) continue;
  const value = entry.value;
  if (scope !== "factory" && `issue:${value.issue}` !== scope) continue;
  add("work-item", entry.name, {
    issue: value.issue,
    status: value.status,
    control: value.control,
    round: value.round,
    route: value.route,
    blocker: value.blocker,
    reviews: value.reviews,
    final: value.final?.decision,
    pr: value.pr?.url,
    history: value.history,
  });
}
add("factory", "core/factory", (await archon.get("core/factory")).value);
add(
  "selection",
  "core/selection",
  (await archon.get("core/selection")).value?.decisions?.slice(-8),
);
const runsDir = paths.runs;
const recent = existsSync(runsDir)
  ? readdirSync(runsDir)
      .map((name) => ({
        name,
        file: path.posix.join(runsDir, name, "guard.jsonl"),
      }))
      .filter((entry) => existsSync(entry.file))
      .slice(-6)
  : [];
for (const entry of recent) {
  const lines = readFileSync(entry.file, "utf8")
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));
  const denied = lines.filter((line) => line.decision === "deny");
  add("guard", `runs/${entry.name}/guard.jsonl`, {
    calls: lines.length,
    denied: denied.length,
    examples: denied.slice(0, 5),
  });
}
// Whole excerpts only: dropped ones are named as omissions and cannot be cited.
const { packet, kept, dropped } = boundPacket(evidence, LIMITS.packetChars);
const digest = sha256({
  scope,
  packet: kept.map((item) => [item.source, item.text]),
});
const previous = reports
  .filter((report: { scope: string }) => report.scope === scope)
  .at(-1);
if (previous?.digest === digest && trigger !== "operator")
  out("no", "", "Evidence unchanged since the last report for this scope");
mkdirSync(path.posix.join(paths.runs, runId), { recursive: true });
writeFileSync(
  path.posix.join(paths.runs, runId, "analysis-packet.json"),
  JSON.stringify({ digest, scope, trigger, evidence: kept, dropped }, null, 2),
);
const omitted = [
  "worker transcripts",
  "unsealed reviews",
  "credentials",
  ...(dropped.length
    ? [
        `excerpts ${dropped.join(", ")} (packet budget ${LIMITS.packetChars} characters)`,
      ]
    : []),
];
const assignment = [
  `# Evidence packet (${scope}, trigger ${trigger}, digest ${digest.slice(0, 16)})`,
  "",
  `Observed at ${new Date().toISOString()}. ${kept.length} excerpts; omitted: ${omitted.join("; ")}.`,
  "",
  "```json",
  packet,
  "```",
].join("\n");
out(
  "yes",
  assignment,
  `Packet ${digest.slice(0, 12)} with ${kept.length} excerpts${dropped.length ? `, ${dropped.length} dropped` : ""}`,
  { digest, ids: kept.map((item) => item.id), dropped },
);
