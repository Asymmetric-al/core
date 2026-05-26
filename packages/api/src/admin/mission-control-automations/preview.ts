import { evaluateAutomationRule } from "./evaluator";

import type { AutomationRecord, AutomationRule } from "./types";

export async function createAutomationPreview(input: {
  rule: AutomationRule;
  fetchCandidates: () => Promise<AutomationRecord[]>;
}) {
  const candidates = await input.fetchCandidates();
  const matchedRecords: Array<{ id: string }> = [];
  const proposedChanges: Array<{
    recordId: string;
    action: string;
    details: Record<string, unknown>;
  }> = [];
  const skippedRecords: Array<{ id: string; reason: string }> = [];

  for (const record of candidates) {
    const evaluation = evaluateAutomationRule({
      rule: { ...input.rule, enabled: true },
      record,
    });

    if (!evaluation.matches) {
      skippedRecords.push({ id: record.id, reason: "conditions_not_met" });
      continue;
    }

    matchedRecords.push({ id: record.id });
    for (const action of evaluation.plannedActions) {
      proposedChanges.push({
        recordId: record.id,
        action: action.kind,
        details: action,
      });
    }
  }

  return {
    matchedRecords,
    proposedChanges,
    skippedRecords,
    totalCandidates: candidates.length,
  };
}

export function ensureActivationReady(input: {
  hasFreshPreview: boolean;
  hasSuccessfulTestRun: boolean;
  activityLogConfigured: boolean;
}) {
  if (!input.hasFreshPreview) {
    throw new Error("Automation activation requires a fresh preview.");
  }
  if (!input.hasSuccessfulTestRun) {
    throw new Error("Automation activation requires a successful test run.");
  }
  if (!input.activityLogConfigured) {
    throw new Error("Automation activation requires activity log setup.");
  }
}
