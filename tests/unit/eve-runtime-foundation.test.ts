import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { prepareEveRuntimeActivation } from "../../packages/eve-runtime/src/governance-boundary";

import type { EvePolicyConsultResult } from "@asym/api/eve/approval-budget/types";
import type { EveGovernanceSnapshot } from "@asym/api/eve/governance/types";
import type { EveModelResolution } from "@asym/api/eve/model-policy/types";

const repositoryRoot = path.resolve(import.meta.dirname, "../..");
const runtimeRoot = path.join(repositoryRoot, "packages/eve-runtime");

const clearedSwitches: EveGovernanceSnapshot["killSwitchState"] = {
  all_automation: false,
  active_runs: false,
  github_actions: false,
  production_writes: false,
  sandbox_networking: false,
  dynamic_workflows: false,
  model_policy_changes: false,
  force_approval: false,
};

function governance(
  overrides: Partial<EveGovernanceSnapshot> = {},
): EveGovernanceSnapshot {
  return {
    source: "persisted",
    releaseEnabled: true,
    emergencyOff: false,
    killSwitchState: clearedSwitches,
    policyStatus: "ready",
    stateVersion: 7,
    updatedAt: "2026-07-17T00:00:00.000Z",
    ...overrides,
  };
}

const allowedBudget: EvePolicyConsultResult = {
  actionId: "engineering.review_artifact.write",
  decision: "allow",
  reason: "operational_policy_allowed",
  trustZone: "engineering",
  writeClass: "operational",
};

const allowedModel: EveModelResolution = {
  allowed: true,
  budget: {
    maxInputTokens: 20_000,
    maxOutputTokens: 2_000,
    maxRequestsPerMinute: 6,
    maxUsdMicros: 500_000,
  },
  evalGate: { minimumScoreBps: 9_000, suiteId: "eve-foundation" },
  primary: { modelId: "gateway/provider-model", route: "vercel_ai_gateway" },
  reasoning: "medium",
  role: "agent",
};

async function filesUnder(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries
      .filter(
        (entry) => entry.name !== "node_modules" && !entry.name.startsWith("."),
      )
      .map(async (entry) => {
        const entryPath = path.join(directory, entry.name);
        return entry.isDirectory() ? filesUnder(entryPath) : [entryPath];
      }),
  );

  return nested.flat();
}

describe("Eve runtime foundation", () => {
  it("stays isolated from all three Next.js applications", async () => {
    const runtimeFiles = (await filesUnder(runtimeRoot)).filter((file) =>
      /\.(?:ts|tsx|js|jsx|mjs|cjs)$/u.test(file),
    );
    const appFiles = (
      await Promise.all(
        ["admin", "donor", "missionary"].map((app) =>
          filesUnder(path.join(repositoryRoot, "apps", app)),
        ),
      )
    )
      .flat()
      .filter((file) => /\.(?:ts|tsx|js|jsx|mjs|cjs)$/u.test(file));

    const runtimeSource = await Promise.all(
      runtimeFiles.map((file) => readFile(file, "utf8")),
    );
    const appSource = await Promise.all(
      appFiles.map((file) => readFile(file, "utf8")),
    );

    expect(runtimeSource.join("\n")).not.toMatch(
      /(?:from|import\s*\()[\s\S]{0,80}(?:apps\/(?:admin|donor|missionary)|@asym\/(?:admin|donor|missionary))/,
    );
    expect(appSource.join("\n")).not.toMatch(/@asym\/eve-runtime/);
  });

  it("keeps authority-bearing defaults disabled or behind authored guardrails", async () => {
    const docs = await readFile(
      path.join(runtimeRoot, "docs/installed-eve-0.25.1.md"),
      "utf8",
    );
    const toolFiles = await readdir(path.join(runtimeRoot, "agent/tools"));
    const scheduleFiles = await readdir(
      path.join(runtimeRoot, "agent/schedules"),
    );

    expect(docs).toContain("Installed Eve 0.25.1 review");
    expect(toolFiles.sort()).toEqual(
      [
        "agent.ts",
        "ask_question.ts",
        "bash.ts",
        "github_operator.ts",
        "github_strict_auto_merge.ts",
        "todo.ts",
        "web_fetch.ts",
        "web_search.ts",
        "workflow.ts",
        "workflow_guard.ts",
        "write_file.ts",
      ].sort(),
    );
    expect(scheduleFiles.sort()).toEqual([
      "engineering-health.ts",
      "launch-canary-watchdog.ts",
      "operator-notifications.ts",
    ]);

    const bash = await readFile(
      path.join(runtimeRoot, "agent/tools/bash.ts"),
      "utf8",
    );
    const writeFile = await readFile(
      path.join(runtimeRoot, "agent/tools/write_file.ts"),
      "utf8",
    );
    const githubOperator = await readFile(
      path.join(runtimeRoot, "agent/tools/github_operator.ts"),
      "utf8",
    );
    const strictAutoMerge = await readFile(
      path.join(runtimeRoot, "agent/tools/github_strict_auto_merge.ts"),
      "utf8",
    );

    // Assert the call form, not the bare name: a substring match also passes
    // for an unused import or a mention in a comment, which would hide a
    // guardrail that is wired up but never actually invoked.
    expect(bash).toMatch(/scanEveSandboxCommand\(/u);
    expect(bash).toMatch(/recordEveSandboxAction\(/u);
    expect(writeFile).toMatch(/scanEveSandboxWrite\(/u);
    expect(writeFile).toMatch(/recordEveSandboxAction\(/u);
    expect(githubOperator).toMatch(/defineDynamic\(/u);
    expect(githubOperator).toMatch(/scanEveSandboxPath\(/u);
    expect(strictAutoMerge).toMatch(/defineDynamic\(/u);
    // expectedHeadSha is a property name rather than a call, so the substring
    // check is the right assertion for it.
    expect(strictAutoMerge).toContain("expectedHeadSha");

    const engineeringHealthSchedule = await readFile(
      path.join(runtimeRoot, "agent/schedules/engineering-health.ts"),
      "utf8",
    );
    expect(engineeringHealthSchedule).toContain('cron: "*/5 * * * *"');
    expect(engineeringHealthSchedule).toContain(
      "runEveEngineeringMonitorSweep",
    );
    const notificationSchedule = await readFile(
      path.join(runtimeRoot, "agent/schedules/operator-notifications.ts"),
      "utf8",
    );
    expect(notificationSchedule).toContain('cron: "* * * * *"');
    expect(notificationSchedule).toContain("runEveNotificationSweep");
    const launchWatchdogSchedule = await readFile(
      path.join(runtimeRoot, "agent/schedules/launch-canary-watchdog.ts"),
      "utf8",
    );
    expect(launchWatchdogSchedule).toContain('cron: "* * * * *"');
    expect(launchWatchdogSchedule).toContain("runEveLaunchCanaryWatchdog");
  });

  it("keeps the runtime off when persisted release is disabled", () => {
    expect(
      prepareEveRuntimeActivation({
        approvalBudget: allowedBudget,
        governance: governance({ releaseEnabled: false }),
        modelResolution: allowedModel,
      }),
    ).toEqual({ enabled: false, reason: "release_disabled" });
  });

  it.each([
    ["missing persisted state", { source: "missing" as const }],
    ["emergency off", { emergencyOff: true }],
    ["policy blocked", { policyStatus: "blocked" as const }],
    [
      "global kill switch",
      { killSwitchState: { ...clearedSwitches, all_automation: true } },
    ],
    [
      "active-runs kill switch",
      { killSwitchState: { ...clearedSwitches, active_runs: true } },
    ],
  ])("fails closed when governance reports %s", (_label, overrides) => {
    expect(
      prepareEveRuntimeActivation({
        approvalBudget: allowedBudget,
        governance: governance(overrides),
        modelResolution: allowedModel,
      }),
    ).toEqual({ enabled: false, reason: "governance_blocked" });
  });

  it("binds governance to the approved action's kill-switch domain", () => {
    expect(
      prepareEveRuntimeActivation({
        approvalBudget: allowedBudget,
        governance: governance({
          killSwitchState: {
            ...clearedSwitches,
            production_writes: true,
          },
        }),
        modelResolution: allowedModel,
      }),
    ).toEqual({ enabled: false, reason: "governance_blocked" });
  });

  it("fails closed when the approved action is not catalogued", () => {
    expect(
      prepareEveRuntimeActivation({
        approvalBudget: { ...allowedBudget, actionId: "unknown" },
        governance: governance(),
        modelResolution: allowedModel,
      }),
    ).toEqual({ enabled: false, reason: "governance_blocked" });
  });

  it("refuses a blocked model-policy result", () => {
    expect(
      prepareEveRuntimeActivation({
        approvalBudget: allowedBudget,
        governance: governance(),
        modelResolution: { allowed: false, reason: "budget_exhausted" },
      }),
    ).toEqual({ enabled: false, reason: "model_policy_blocked" });
  });

  it("refuses a non-allow approval or budget decision", () => {
    expect(
      prepareEveRuntimeActivation({
        approvalBudget: {
          ...allowedBudget,
          decision: "pause",
          reason: "budget_exhausted",
        },
        governance: governance(),
        modelResolution: allowedModel,
      }),
    ).toEqual({ enabled: false, reason: "approval_budget_blocked" });
  });

  it("refuses malformed model-policy output", () => {
    expect(
      prepareEveRuntimeActivation({
        approvalBudget: allowedBudget,
        governance: governance(),
        modelResolution: {
          ...allowedModel,
          primary: { ...allowedModel.primary, modelId: "" },
        },
      }),
    ).toEqual({ enabled: false, reason: "invalid_model_policy" });
  });

  it("returns only the Gateway-primary, policy-bounded activation plan", () => {
    expect(
      prepareEveRuntimeActivation({
        approvalBudget: allowedBudget,
        governance: governance(),
        modelResolution: allowedModel,
      }),
    ).toEqual({
      enabled: true,
      limits: {
        maxInputTokensPerSession: 20_000,
        maxOutputTokensPerSession: 2_000,
        maxRequestsPerMinute: 6,
        maxUsdMicros: 500_000,
      },
      model: "gateway/provider-model",
      reasoning: "medium",
      role: "agent",
      route: "vercel_ai_gateway",
    });
  });
});
