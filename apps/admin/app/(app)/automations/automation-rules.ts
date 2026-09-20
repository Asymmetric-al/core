import { resolveMissionControlAutomationLifecycle } from "@asym/database/mission-control-automations";

import type { MissionControlAutomationRuleDto } from "@asym/database/hooks";

export function formatTriggerKind(kind: string): string {
  return kind
    .split("_")
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
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
    const status =
      resolveMissionControlAutomationLifecycle(
        rule,
      ).displayStatus.toLowerCase();
    return (
      rule.name.toLowerCase().includes(normalizedSearch) ||
      trigger.includes(normalizedSearch) ||
      status.includes(normalizedSearch)
    );
  });
}
