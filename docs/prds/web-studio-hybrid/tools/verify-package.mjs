import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  packageRoot,
  repoRoot,
  readContract,
  projections,
} from "./render-package.mjs";

const requirements = readContract("requirements.json");
const tasks = readContract("tasks.json");
const workflows = readContract("workflows.json");
const automations = readContract("automations.json");
const checkpoints = readContract("checkpoints.json");
const trace = readContract("traceability.json");
const sourceRoot = path.join(
  repoRoot,
  "docs/prds/program-roadmap/source-2026-09-22/assets/web",
);
const original = (name) =>
  JSON.parse(fs.readFileSync(path.join(sourceRoot, name), "utf8"));
const ids = (rows) => rows.map((row) => row.id);
const unique = (rows, expected, label) => {
  assert.equal(rows.length, expected, `${label} count`);
  assert.equal(new Set(ids(rows)).size, expected, `${label} unique IDs`);
};
unique(requirements, 48, "requirements");
unique(tasks, 27, "tasks");
unique(workflows, 18, "workflows");
unique(automations, 12, "native automations");
unique(
  requirements.flatMap((r) => r.scenarios),
  96,
  "paired scenarios",
);
for (const [name, rows] of [
  ["requirements.json", requirements],
  ["tasks.json", tasks],
  ["workflows.json", workflows],
  ["automations.json", automations],
]) {
  assert.deepEqual(
    ids(rows),
    ids(original(name)),
    `${name} preserves original IDs/order`,
  );
}
for (const [index, r] of requirements.entries()) {
  assert.deepEqual(
    r.scenarios,
    original("requirements.json")[index].scenarios,
    `${r.id}: every source scenario preserved`,
  );
  assert.deepEqual(ids(r.scenarios), [`${r.id}-A`, `${r.id}-B`]);
  assert.match(r.requirement, /\bSHALL\b/);
  assert.ok(
    tasks.some((t) => t.id === r.task),
    `${r.id} owns a real task`,
  );
  assert.ok(r.workflows.every((id) => ids(workflows).includes(id)));
}
for (const task of tasks) {
  assert.equal(task.packageId, `HA-${task.id}`);
  assert.equal(
    task.status,
    "not-started",
    "planning must not invent runtime completion",
  );
  assert.equal(
    task.dependencies,
    undefined,
    "ambiguous historical dependencies must not drive blockers",
  );
  assert.deepEqual(
    task.requirements,
    requirements.filter((r) => r.task === task.id).map((r) => r.id),
  );
  assert.ok(Object.keys(task.checkpointDependencies).length > 0);
}
assert.deepEqual(trace.requirements, requirements);
assert.deepEqual(trace.tasks, tasks);
assert.deepEqual(
  trace.automation_workflow_links,
  Object.fromEntries(automations.map((a) => [a.id, a.workflows])),
);
assert.deepEqual(checkpoints.nativeAutomationIds, ids(automations));
assert.deepEqual(checkpoints.editorRequestAutomationIds, ["AU01", "AU02"]);
assert.equal(checkpoints.workflowStudioEnrollmentRequired, false);
assert.equal(checkpoints.qualifiedNativeCmsRequiresHybridModule, false);
assert.equal(checkpoints.runtimeStatus, "not-implemented");
assert.deepEqual(checkpoints.releaseRequires, [
  "WEB-VISUAL",
  "WEB-SOURCE",
  "WEB-HYBRID",
]);

const graph = new Map();
for (const task of tasks)
  for (const [checkpoint, dependencies] of Object.entries(
    task.checkpointDependencies,
  )) {
    const node = `${task.packageId}@${checkpoint}`;
    assert.ok(checkpoints.releaseRequires.includes(checkpoint), node);
    graph.set(node, dependencies);
  }
const visiting = new Set();
const visited = new Set();
function visit(node) {
  assert.ok(graph.has(node), `missing dependency ${node}`);
  assert.ok(!visiting.has(node), `cycle at ${node}`);
  if (visited.has(node)) return;
  visiting.add(node);
  for (const dependency of graph.get(node)) visit(dependency);
  visiting.delete(node);
  visited.add(node);
}
for (const node of graph.keys()) visit(node);
for (const [node, dependencies] of graph) {
  if (node.endsWith("@WEB-VISUAL")) {
    assert.ok(
      !/^HA-4\./.test(node),
      `source delivery in visual foundation: ${node}`,
    );
    assert.ok(
      dependencies.every((d) => d.endsWith("@WEB-VISUAL")),
      `visual checkpoint waits for source/hybrid: ${node}`,
    );
  }
  if (node.endsWith("@WEB-SOURCE"))
    assert.ok(
      dependencies.every((d) => !d.endsWith("@WEB-HYBRID")),
      `source waits on own integration: ${node}`,
    );
}
for (const checkpoint of checkpoints.checkpoints)
  assert.ok(graph.has(checkpoint.exitTask));
assert.ok(graph.get("HA-6.4@WEB-HYBRID").includes("HA-6.4@WEB-VISUAL"));
assert.ok(graph.get("HA-6.4@WEB-HYBRID").includes("HA-6.4@WEB-SOURCE"));
for (const dependencies of Object.values(checkpoints.moduleDependencies)) {
  assert.ok(
    !dependencies.some((d) =>
      checkpoints.forbiddenFoundationDependencies.includes(d),
    ),
    "backward module dependency",
  );
}
const integrationCases = readContract("integration-scenarios.json");
unique(integrationCases, 14, "Web integration cases");
const delivery = fs.readFileSync(
  path.join(repoRoot, "docs/prds/program-roadmap/delivery-contract.md"),
  "utf8",
);
for (const [index, scenario] of integrationCases.entries()) {
  assert.equal(scenario.id, `HA-INT-${String(index + 1).padStart(2, "0")}`);
  assert.ok(
    delivery.includes(`**${scenario.id}.** ${scenario.requirement}`),
    `${scenario.id} source text drift`,
  );
  assert.equal(scenario.evidenceStatus, "not-executed");
  assert.ok(
    scenario.taskScopes.length > 0 &&
      scenario.taskScopes.every((node) => graph.has(node)),
  );
}
const normalize = (text) => text.replace(/\s+/g, " ").trim();
for (const [file, expected] of projections()) {
  const actual = fs.readFileSync(file, "utf8");
  const message = `${path.relative(repoRoot, file)} drifted from canonical JSON`;
  if (file.endsWith(".json"))
    assert.deepEqual(JSON.parse(actual), JSON.parse(expected), message);
  else assert.equal(normalize(actual), normalize(expected), message);
}
console.log(
  `PASS Web planning: 48 requirements, 96 source scenarios, 14 integration cases, 27 work packages, 18 workflows, 12 native automations; ${graph.size} acyclic checkpoint scopes. No runtime, provider, browser, database or release qualification is claimed.`,
);
