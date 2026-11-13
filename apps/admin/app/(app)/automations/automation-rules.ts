import { resolveMissionControlAutomationLifecycle } from "@asym/database/mission-control-automations";

import type { MissionControlAutomationRuleDto } from "@asym/database/hooks";

export function formatTriggerKind(kind: string): string {
  return kind
    .split("_")
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

export function automationStatusLabel(status: string): string {
  return status === "Invalid" ? "Needs repair" : status;
}

/**
 * The API rejects activation without a preview, and no UI supplies one.
 * Repair advice must stay limited to adding actions or saving as paused.
 */
export function automationRepairNote(
  rule: MissionControlAutomationRuleDto,
): { problem: string; nextStep: string } | null {
  if (
    resolveMissionControlAutomationLifecycle(rule).displayStatus !== "Invalid"
  ) {
    return null;
  }
  const where =
    "Rules can't be edited in Mission Control; they are saved through the automations API.";
  if (rule.actions.length === 0) {
    return {
      problem: "Marked active but switched off, and it has no actions to run.",
      nextStep: `${where} Whoever set this rule up there needs to add an action to it.`,
    };
  }
  return {
    problem: "Marked active but switched off, so it does not run.",
    nextStep: `${where} Whoever set this rule up there needs to save it as paused.`,
  };
}

export function filterAutomationRules(
  automationRules: MissionControlAutomationRuleDto[],
  search: string,
): MissionControlAutomationRuleDto[] {
  const normalizedSearch = search.trim().toLowerCase();
  if (!normalizedSearch) {
    return automationRules;
  }

  return automationRules.filter((rule) => {
    const trigger = formatTriggerKind(rule.trigger.kind).toLowerCase();
    const displayStatus =
      resolveMissionControlAutomationLifecycle(rule).displayStatus;
    const status =
      `${displayStatus} ${automationStatusLabel(displayStatus)}`.toLowerCase();
    return (
      rule.name.toLowerCase().includes(normalizedSearch) ||
      automationRuleTitle(rule.name).toLowerCase().includes(normalizedSearch) ||
      trigger.includes(normalizedSearch) ||
      status.includes(normalizedSearch)
    );
  });
}

/**
 * A readable title for a rule. Keys like "giving.thank-you-email" read as
 * "Giving: thank you email"; names staff wrote are kept as written.
 */
export function automationRuleTitle(name: string): string {
  if (!/^[a-z0-9]+(?:[._-][a-z0-9]+)+$/.test(name) || !name.includes(".")) {
    return name;
  }
  const [area, ...rest] = name.split(".");
  const words = (part: string) =>
    part
      .split(/[-_]+/)
      .filter(Boolean)
      .map((word) => RULE_ACRONYMS[word] ?? word)
      .join(" ");
  const head = words(area!);
  const tail = rest.map(words).join(" ");
  return `${head.charAt(0).toUpperCase()}${head.slice(1)}: ${tail}`;
}

const RULE_ACRONYMS: Record<string, string> = {
  api: "API",
  crm: "CRM",
  id: "ID",
  pdf: "PDF",
  sms: "SMS",
  url: "URL",
};

export function automationRunModeLabel(
  runMode: MissionControlAutomationRuleDto["runMode"],
): string {
  return runMode === "review_first" ? "After staff review" : "Automatically";
}

function countLabel(
  count: number,
  singular: string,
  plural: string,
  none = "No",
) {
  if (count === 0) return `${none} ${plural}`;
  return count === 1 ? `1 ${singular}` : `${count} ${plural}`;
}

export function automationStepsLabel(
  rule: Pick<MissionControlAutomationRuleDto, "conditions" | "actions">,
): string {
  const conditions = countLabel(
    rule.conditions.length,
    "condition",
    "conditions",
  );
  const actions = countLabel(rule.actions.length, "action", "actions", "no");
  return `${conditions} · ${actions}`;
}

const lastFailureFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

/**
 * Whether the response carried this rule's own runs. A response without
 * them says nothing about the rule, so it must not read as "No runs".
 */
export function automationRuleActivityReported(
  rule: Pick<MissionControlAutomationRuleDto, "runs24h" | "failedRuns24h">,
): boolean {
  return (
    typeof rule.runs24h === "number" && typeof rule.failedRuns24h === "number"
  );
}

export function automationRecentRuns(
  rule: Pick<
    MissionControlAutomationRuleDto,
    "runs24h" | "failedRuns24h" | "lastFailureAt"
  >,
): { summary: string; lastFailure: string | null; failing: boolean } {
  if (!automationRuleActivityReported(rule)) {
    return { summary: "Not reported", lastFailure: null, failing: false };
  }
  const failed = rule.failedRuns24h ?? 0;
  // A failed run is a run, so the total never reads below the failures.
  const runs = Math.max(rule.runs24h ?? 0, failed);
  const lastFailureTime = rule.lastFailureAt
    ? Date.parse(rule.lastFailureAt)
    : Number.NaN;
  const lastFailure = Number.isNaN(lastFailureTime)
    ? null
    : `Last failed ${lastFailureFormatter.format(lastFailureTime)}`;
  if (failed > 0) {
    return {
      summary: `${failed} of ${runs} ${runs === 1 ? "run" : "runs"} failed`,
      lastFailure,
      failing: true,
    };
  }
  if (runs > 0) {
    return {
      summary: `${runs} ${runs === 1 ? "run" : "runs"}, none failed`,
      lastFailure: null,
      failing: false,
    };
  }
  return { summary: "No runs", lastFailure: null, failing: false };
}

export function failingAutomationRules(
  automationRules: MissionControlAutomationRuleDto[],
): MissionControlAutomationRuleDto[] {
  return automationRules.filter((rule) => (rule.failedRuns24h ?? 0) > 0);
}

function countWithVerb(count: number, singular: string, plural: string) {
  return `${count.toLocaleString("en-US")} ${count === 1 ? singular : plural}`;
}

/**
 * What the failure card says about failures no failing rule in the list
 * accounts for. It names a cause only when the data shows one: every rule
 * must report its own runs before any failure is called unlisted, and only
 * the server's count of runs with no rule on record is put down to deleted
 * rules (the server lists rules past the newest page that ran).
 */
export function automationFailureAttribution(
  automationRules: MissionControlAutomationRuleDto[],
  summary: { failedRuns24h: number; failedRunsWithoutRule24h?: number },
): { failingRules: MissionControlAutomationRuleDto[]; note: string | null } {
  const failingRules = failingAutomationRules(automationRules);
  if (!automationRules.every(automationRuleActivityReported)) {
    return {
      failingRules,
      note:
        failingRules.length === 0
          ? "The rules' own runs weren't reported, so which rules failed isn't known."
          : "Some rules didn't report their runs.",
    };
  }

  const attributed = failingRules.reduce(
    (total, rule) => total + (rule.failedRuns24h ?? 0),
    0,
  );
  const remainder = Math.max(summary.failedRuns24h - attributed, 0);
  const withoutRule =
    typeof summary.failedRunsWithoutRule24h === "number"
      ? Math.min(summary.failedRunsWithoutRule24h, remainder)
      : 0;
  const unmatched = remainder - withoutRule;

  const sentences: string[] = [];
  if (withoutRule > 0) {
    sentences.push(
      `${countWithVerb(withoutRule, "isn't", "aren't")} tied to a rule, usually because the rule was deleted.`,
    );
  }
  if (unmatched > 0) {
    sentences.push(
      `${countWithVerb(unmatched, "isn't", "aren't")} matched to a rule listed here.`,
    );
  }
  return {
    failingRules,
    note: sentences.length > 0 ? sentences.join(" ") : null,
  };
}
