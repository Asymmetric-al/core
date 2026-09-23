import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const packageRoot = fileURLToPath(new URL("..", import.meta.url));
export const repoRoot = path.resolve(packageRoot, "../../..");
export const changeRoot = path.join(
  repoRoot,
  "openspec/changes/add-web-studio-hybrid-contracts",
);
export const readContract = (name) =>
  JSON.parse(
    fs.readFileSync(path.join(packageRoot, "contracts", name), "utf8"),
  );

export function renderSpec(requirements) {
  let result =
    "## Purpose\n\nProvide visual, conventional source and mixed website authoring through one canonical CMS and its existing publication, identity and safety owners.\n\n";
  result +=
    "<!-- Generated from docs/prds/web-studio-hybrid/contracts/requirements.json. Keep IDs and all paired scenarios. -->\n\n## ADDED Requirements\n\n";
  for (const requirement of requirements) {
    result += `### Requirement: ${requirement.id} ${requirement.title}\n\n${requirement.requirement}\n\n`;
    for (const scenario of requirement.scenarios) {
      result += `#### Scenario: ${scenario.id} — ${scenario.name}\n\n`;
      for (const field of ["given", "when", "then"])
        result += `- **${field.toUpperCase()}** ${scenario[field]}\n`;
      result += "\n";
    }
  }
  return result;
}

export function renderTasks(tasks) {
  const lines = [
    "# Phase 42 implementation work packages",
    "",
    "<!-- Generated from docs/prds/web-studio-hybrid/contracts/tasks.json. -->",
    "",
    "The 27 HA package identities are preserved. Each package closes only after all assigned checkpoint scopes pass. The operative blocking graph is `checkpointDependencies`; historical `sourceDependencies` never drive execution. See the [full implementation plan](../../../docs/prds/web-studio-hybrid/implementation-plan.md) and [owner contracts](../../../docs/prds/web-studio-hybrid/owner-contracts.md).",
    "",
    "Use TDD at actual owner seams, focused tests, strict OpenSpec and delta checks, applicable Core gates, real transaction/RLS/concurrency and browser evidence, migration, operational fault/capacity, accessible staff handoff and rollback proof. No product implementation task is completed by this planning update.",
    "",
  ];
  let group;
  for (const task of tasks) {
    const nextGroup = task.id.split(".")[0];
    if (nextGroup !== group) {
      group = nextGroup;
      lines.push(`## ${group}. Work-package group ${group}`, "");
    }
    lines.push(
      `- [ ] ${task.id} ${task.title} (${task.packageId}). ${task.deliverable} Exit proof: ${task.proof} Requirements: ${task.requirements.join(", ")}. Required checkpoint scopes: ${Object.keys(task.checkpointDependencies).join(", ")}.`,
      "",
    );
  }
  return `${lines.join("\n").trimEnd()}\n`;
}

export function renderScenarios(requirements) {
  const lines = [
    '<a id="web-test-matrix"></a>',
    "# Acceptance scenarios",
    "",
    "Generated from [requirements.json](contracts/requirements.json). Implementation evidence remains open. Each requirement retains its A and B scenarios; checkpoint closure additionally obeys [the implementation plan](implementation-plan.md).",
    "",
  ];
  for (const requirement of requirements) {
    lines.push(`## ${requirement.id} — ${requirement.title}`, "");
    for (const scenario of requirement.scenarios)
      lines.push(
        `### ${scenario.id} — ${scenario.name}`,
        "",
        `- **Given:** ${scenario.given}`,
        `- **When:** ${scenario.when}`,
        `- **Then:** ${scenario.then}`,
        "",
      );
  }
  return `${lines.join("\n").trimEnd()}\n`;
}

export function renderPlan(tasks) {
  const lines = [
    '<a id="web-tasks"></a>',
    "# Implementation plan and checkpoint graph",
    "",
    "Generated from [tasks.json](contracts/tasks.json), with [checkpoints.json](contracts/checkpoints.json). The 27 original HA package IDs, deliverables, proofs and requirement assignments remain intact. `sourceDependencies` records the old research graph only; it MUST NOT drive implementation blocking. `checkpointDependencies` is the operative graph. A node such as `HA-5.3@WEB-VISUAL` is a checkpoint scope of the same package, not a renamed package or extra phase.",
    "",
    "WEB-VISUAL closes the complete standard-renderer product with Git credentials/build services absent. WEB-SOURCE closes conventional source delivery; WEB-HYBRID closes the integrated redesign/handoff. Common saving, preview, publication, operations, convergence, migration and usability must pass their visual scope independently of custom-source completion. The entire phase requires all three; a limited outline pilot is not WEB-VISUAL.",
    "",
    "All implementation remains unchecked. Use TDD at the actual owner seam, restricted-role database and transaction/race proof, pinned browser/adapter/SSR tests, real source isolation and custody tests, representative staff evidence and production-shaped load/fault evidence. Scope-specific owner dependencies are in [owner-contracts.md](owner-contracts.md); all [integration cases](integration-scenarios.md) remain cumulative.",
    "",
  ];
  for (const task of tasks) {
    lines.push(
      `## ${task.packageId} — ${task.title}`,
      "",
      `**Owner:** ${task.owner}`,
      "",
      `**Deliverable:** ${task.deliverable}`,
      "",
      `**Exit proof:** ${task.proof}`,
      "",
      `**Requirements:** ${task.requirements.join(", ")}`,
      "",
    );
    for (const [checkpoint, dependencies] of Object.entries(
      task.checkpointDependencies,
    )) {
      lines.push(
        `- [ ] ${task.packageId}@${checkpoint}: ${task.checkpointScope[checkpoint]} Dependencies: ${dependencies.length ? dependencies.map((d) => "`" + d + "`").join(", ") : "none"}.`,
      );
    }
    lines.push("", task.closure, "");
  }
  return `${lines.join("\n").trimEnd()}\n`;
}

export function projections() {
  const requirements = readContract("requirements.json");
  const tasks = readContract("tasks.json");
  const spec = renderSpec(requirements);
  const automations = readContract("automations.json");
  const evidence = JSON.parse(
    fs.readFileSync(
      path.join(
        repoRoot,
        "docs/prds/program-roadmap/source-2026-09-22/assets/web/research/sources.json",
      ),
      "utf8",
    ),
  );
  const traceability = {
    change_id: "add-web-studio-hybrid-contracts",
    phase: 42,
    requirements,
    tasks,
    automation_workflow_links: Object.fromEntries(
      automations.map((a) => [a.id, a.workflows]),
    ),
    evidence_ids: evidence.map((s) => s.id),
  };
  return new Map([
    [path.join(changeRoot, "specs/web-studio-hybrid-authoring/spec.md"), spec],
    [path.join(changeRoot, "tasks.md"), renderTasks(tasks)],
    [path.join(packageRoot, "implementation-plan.md"), renderPlan(tasks)],
    [
      path.join(packageRoot, "contracts/traceability.json"),
      JSON.stringify(traceability, null, 2) + "\n",
    ],
    [
      path.join(packageRoot, "acceptance-scenarios.md"),
      renderScenarios(requirements),
    ],
    [
      path.join(packageRoot, "requirements.md"),
      '<a id="web-requirements"></a>\n\n# Phase 42 requirements\n\nCanonical authoring source: [requirements.json](contracts/requirements.json). The [OpenSpec projection](../../../openspec/changes/add-web-studio-hybrid-contracts/specs/web-studio-hybrid-authoring/spec.md) carries every full requirement and all 96 Given/When/Then scenarios. No source scenario is discharged by structural validation.\n\n' +
        spec,
    ],
  ]);
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  if (process.argv.length !== 3 || process.argv[2] !== "--write")
    throw new Error(
      "Explicit --write required to regenerate declared planning projections.",
    );
  for (const [file, content] of projections()) fs.writeFileSync(file, content);
  console.log(
    "Regenerated six Web planning projections; no product/runtime evidence is claimed.",
  );
}
