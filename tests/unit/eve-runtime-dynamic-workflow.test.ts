import { readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");
const runtime = path.join(root, "packages/eve-runtime");

describe("Eve dynamic workflow runtime", () => {
  it("enables the root-only Workflow tool with the global hard cap", async () => {
    const source = await readFile(
      path.join(runtime, "agent/tools/workflow.ts"),
      "utf8",
    );

    expect(source).toContain("experimental_workflow({ maxSubagents: 7 })");
  });

  it("requires a governed ticket before model-authored orchestration", async () => {
    const [guard, instructions] = await Promise.all([
      readFile(path.join(runtime, "agent/tools/workflow_guard.ts"), "utf8"),
      readFile(path.join(runtime, "agent/instructions.md"), "utf8"),
    ]);

    expect(guard).toContain("validateEveDynamicWorkflowPlan");
    expect(guard).toContain("executeEveRuntimePolicyConsult");
    expect(guard).toContain("hasBlockingEveSharedContextConflict");
    expect(guard).toContain("dynamic_workflow.validation");
    expect(guard).toContain("dynamic_workflow.resumed");
    expect(guard).toContain('return "user-approval"');
    expect(instructions).toContain("workflow_guard.prepare");
    expect(instructions).toContain("workflow_guard.resume");
    expect(instructions).toContain("cannot actuate it");
  });

  it("rechecks governance and budget before dispatch and every model step", async () => {
    const [hook, factory, resolver] = await Promise.all([
      readFile(path.join(runtime, "agent/hooks/subagent-audit.ts"), "utf8"),
      readFile(path.join(runtime, "agent/lib/specialist-agent.ts"), "utf8"),
      readFile(path.join(runtime, "src/specialists/runtime-policy.ts"), "utf8"),
    ]);

    expect(hook).toContain("executeEveRuntimePolicyConsult");
    const requested = hook.slice(
      hook.indexOf('async "actions.requested"'),
      hook.indexOf('"subagent.called"'),
    );
    expect(requested).toContain("await runtimeBoundary");
    expect(requested).toContain('action.kind === "subagent-call"');
    expect(requested).not.toContain(
      'action.kind === "subagent-call" &&\n          ["prepared", "running", "paused"].includes(current.status)',
    );
    expect(hook).toContain("dispatchEveDynamicWorkflowStep");
    expect(hook).toContain("classifyEveDynamicWorkflowFailure");
    expect(factory).toContain('"step.started"');
    expect(factory).toContain("engineering.dynamic_workflow.execute");
    expect(resolver).toContain("killSwitchState.dynamic_workflows");
    expect(resolver).toContain("executeEveRuntimePolicyConsult");
  });

  it("keeps the durable plan state in the root session", async () => {
    const source = await readFile(
      path.join(runtime, "agent/lib/workflow-state.ts"),
      "utf8",
    );

    expect(source).toContain("defineState<EveDynamicWorkflowRuntimeState>");
    expect(source).toContain("asym.eve.dynamic-workflow.v1");
  });
});
