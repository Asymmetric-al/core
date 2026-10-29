import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const root = path.resolve(dir, "../../../..");
const read = (name) =>
  JSON.parse(fs.readFileSync(path.join(dir, name), "utf8"));
const digestCache = new Map();
const digest = (file) => {
  if (!digestCache.has(file))
    digestCache.set(
      file,
      crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex"),
    );
  return digestCache.get(file);
};
const errors = [];
const preserved = read("grooming-preservation.json");
for (const [name, sha] of Object.entries(preserved.files)) {
  const file = path.join(root, "docs/features/files-documents", name);
  if (!fs.existsSync(file) || digest(file) !== sha)
    errors.push(`Preserved source drift: ${name}`);
}
if (Object.keys(preserved.files).length !== 624)
  errors.push("Incomplete preserved session corpus");
const census = read("source-census.json");
const sourceRows = new Map(
  [...census.proofs, ...census.journeys].map((row) => [row.id, row]),
);
if (digest(path.join(dir, "founder-brief.txt")) !== census.founder.raw_sha256)
  errors.push("Founder brief changed");
for (const s of census.sources) {
  const file = path.join(root, s.path);
  if (!fs.existsSync(file) || digest(file) !== s.raw_sha256)
    errors.push(`Source census drift: ${s.path}`);
}
const trace = read("traceability.json"),
  ids = new Set();
for (const r of trace.requirements) {
  ids.add(r.requirement);
  ids.add(r.story);
  for (const a of r.acceptance) ids.add(a.id);
}
const proofs = new Set(),
  journeys = new Set(),
  paragraphs = new Set();
let mappings = 0;
const files = fs.readdirSync(dir).filter((x) => x.endsWith("-map.json"));
function visit(v, file) {
  if (Array.isArray(v)) {
    for (const x of v) visit(x, file);
    return;
  }
  if (!v || typeof v !== "object") return;
  const array = (value) => (Array.isArray(value) ? value : []);
  const targets = [
    ...array(v.requirement_ids ?? v.requirements),
    ...array(v.acceptance_ids),
  ].filter((x) => typeof x === "string" && /^(REQ|AC)29-/.test(x));
  for (const t of targets)
    if (!ids.has(t)) errors.push(`${file}: missing target ${t}`);
  if (targets.length) mappings++;
  if (targets.length && v.source_path && v.source_line)
    paragraphs.add(`${v.source_path}:${v.source_line}`);
  const locator = v.source_id_or_locator ?? v.source_id ?? v.source;
  if (
    typeof locator === "string" &&
    /^Q\d{2}-[PJ]\d{2,3}$/.test(locator) &&
    targets.length
  ) {
    const expected = sourceRows.get(locator);
    if (!expected) errors.push(`${file}: unknown source obligation ${locator}`);
    else {
      if (v.source_path && v.source_path !== expected.source_path)
        errors.push(`${file}: wrong source path for ${locator}`);
      if (v.source_line && v.source_line !== expected.line)
        errors.push(`${file}: wrong source line for ${locator}`);
      if (
        v.source_sha256 &&
        v.source_sha256 !== digest(path.join(root, expected.source_path))
      )
        errors.push(`${file}: wrong source digest for ${locator}`);
    }
    for (const ac of targets.filter((target) => target.startsWith("AC29-"))) {
      const parent = ac.replace(/^AC/, "REQ").replace(/-\d{2,3}$/, "");
      if (!targets.includes(parent))
        errors.push(
          `${file}: ${locator} AC ${ac} has undeclared parent ${parent}`,
        );
    }
  }
  if (
    typeof locator === "string" &&
    /^Q\d{2}-P\d{2,3}$/.test(locator) &&
    targets.length
  )
    proofs.add(locator);
  if (
    typeof locator === "string" &&
    /^Q\d{2}-J\d{2,3}$/.test(locator) &&
    targets.length
  )
    journeys.add(locator);
  if (v.source_path && v.source_sha256) {
    const source = path.join(root, v.source_path);
    if (!fs.existsSync(source) || digest(source) !== v.source_sha256)
      errors.push(`${file}: source hash mismatch ${v.source_path}`);
  }
  for (const x of Object.values(v)) visit(x, file);
}
for (const file of files) visit(read(file), file);
for (const p of census.proofs)
  if (!proofs.has(p.id)) errors.push(`Unmapped actual proof ${p.id}`);
for (const p of census.decision_paragraphs)
  if (!paragraphs.has(`${p.source_path}:${p.line}`))
    errors.push(
      `Unmapped decision paragraph Q${p.question} ${p.source_path}:${p.line}`,
    );
for (const j of census.journeys)
  if (!journeys.has(j.id)) errors.push(`Unmapped source journey ${j.id}`);
const unknown = [...proofs].filter(
  (x) => !census.proofs.some((p) => p.id === x),
);
if (unknown.length) errors.push(`Non-source proof IDs: ${unknown.join(", ")}`);
// Inspect the current proof rows themselves, not a count based on phase labels.
const sourceLines = new Map();
for (const p of census.proofs) {
  if (!sourceLines.has(p.source_path))
    sourceLines.set(
      p.source_path,
      fs.readFileSync(path.join(root, p.source_path), "utf8").split(/\r?\n/),
    );
  const lines = sourceLines.get(p.source_path);
  if (!lines[p.line - 1]?.includes(p.cells[0]))
    errors.push(`Proof locator changed: ${p.id}`);
}
for (const q of Object.keys(trace.decisions))
  if (!trace.decisions[q].length) errors.push(`Unmapped decision ${q}`);
const d = read("custody-source-map.json");
if (d.existing_consumers.length !== 23 || d.future_consumers.length !== 11)
  errors.push("Incomplete consumer census");
const taskPath = path.join(
  root,
  "openspec/changes/add-files-documents/tasks.md",
);
if (!fs.existsSync(taskPath))
  errors.push("Missing implementation task checklist");
const tasks = fs.existsSync(taskPath) ? fs.readFileSync(taskPath, "utf8") : "";
if (/^- \[[xX]\]/m.test(tasks))
  errors.push("Implementation task falsely checked complete");
const taskHeaders = [...tasks.matchAll(/^- \[ \] (\d+\.\d+) .+$/gm)];
const taskGraph = new Map(),
  taskRequirements = new Set();
for (let n = 0; n < taskHeaders.length; n++) {
  const h = taskHeaders[n];
  if (taskGraph.has(h[1])) errors.push(`Duplicate task ${h[1]}`);
  const body = tasks.slice(h.index, taskHeaders[n + 1]?.index ?? tasks.length);
  for (const m of body.matchAll(
    /\b(?:REQ|AC)29-[A-Z]\d{2,3}(?:-\d{2,3})?\b/g,
  )) {
    if (!ids.has(m[0])) errors.push(`Task ${h[1]} has unknown target ${m[0]}`);
    if (m[0].startsWith("REQ")) taskRequirements.add(m[0]);
  }
  const dependencies = body.match(/\*\*Dependencies:\*\* ([^\n]+)/)?.[1];
  if (
    !dependencies ||
    !body.includes("**Verification:**") ||
    !body.includes("**AC slice:**")
  )
    errors.push(
      `Task ${h[1]} lacks dependency, acceptance or verification detail`,
    );
  taskGraph.set(
    h[1],
    [...(dependencies ?? "").matchAll(/\d+\.\d+/g)].map((m) => m[0]),
  );
}
for (const r of trace.requirements)
  if (!taskRequirements.has(r.requirement))
    errors.push(`Requirement has no task: ${r.requirement}`);
const visited = new Set(),
  active = new Set();
function visitTask(id) {
  if (active.has(id)) {
    errors.push(`Task dependency cycle at ${id}`);
    return;
  }
  if (visited.has(id)) return;
  if (!taskGraph.has(id)) {
    errors.push(`Missing task dependency ${id}`);
    return;
  }
  active.add(id);
  for (const dependency of taskGraph.get(id)) visitTask(dependency);
  active.delete(id);
  visited.add(id);
}
for (const id of taskGraph.keys()) visitTask(id);
if (errors.length) {
  for (const error of [...new Set(errors)]) console.error(error);
  process.exitCode = 1;
} else
  console.log(
    JSON.stringify({
      preservedSources: 624,
      decisions: 67,
      actualProofs: proofs.size,
      mappedJourneys: journeys.size,
      consumerRows: 34,
      uncheckedTasks: taskGraph.size,
      mappings,
      qualification: "documentation only",
    }),
  );
