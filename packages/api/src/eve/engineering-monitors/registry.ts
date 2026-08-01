import { z } from "zod";

import {
  EVE_ENGINEERING_MONITOR_TYPES,
  type EveEngineeringMonitorConfig,
  type EveEngineeringMonitorType,
} from "./types";

export const EVE_ENGINEERING_MONITOR_SCHEDULE = "*/5 * * * *";
export const EVE_ENGINEERING_MONITOR_REPOSITORY = "Asymmetric-al/core" as const;

const monitorTypeSchema = z.enum(EVE_ENGINEERING_MONITOR_TYPES);

const defaults: Record<
  EveEngineeringMonitorType,
  Pick<
    EveEngineeringMonitorConfig,
    | "dedupeWindowSeconds"
    | "freshnessWindowSeconds"
    | "severityRules"
    | "threshold"
  >
> = {
  ci_failure: {
    dedupeWindowSeconds: 21_600,
    freshnessWindowSeconds: 86_400,
    severityRules: { failure: "high", timed_out: "medium" },
    threshold: { maxItems: 25 },
  },
  stale_pull_request: {
    dedupeWindowSeconds: 86_400,
    freshnessWindowSeconds: 604_800,
    severityRules: { blocked: "low", default: "medium" },
    threshold: { ageSeconds: 604_800, maxItems: 50 },
  },
  failing_eval: {
    dedupeWindowSeconds: 21_600,
    freshnessWindowSeconds: 86_400,
    severityRules: { default: "high" },
    threshold: { maxItems: 25 },
  },
  dependency_security_alert: {
    dedupeWindowSeconds: 86_400,
    freshnessWindowSeconds: 2_592_000,
    severityRules: {
      critical: "critical",
      high: "high",
      medium: "medium",
      low: "low",
    },
    threshold: { maxItems: 50 },
  },
  protected_area_pull_request: {
    dedupeWindowSeconds: 21_600,
    freshnessWindowSeconds: 86_400,
    severityRules: { default: "high" },
    threshold: { maxItems: 50 },
  },
  budget_rate_limit: {
    dedupeWindowSeconds: 3_600,
    freshnessWindowSeconds: 3_600,
    severityRules: { exhausted: "critical", near_limit: "high" },
    threshold: { remainingPercent: 10 },
  },
};

export function parseEveEngineeringMonitorType(
  value: string,
): EveEngineeringMonitorType {
  return monitorTypeSchema.parse(value);
}

export function createEveEngineeringMonitorDefaults(input: {
  now: string;
  policyVersion: number;
  tenantId: string;
}): EveEngineeringMonitorConfig[] {
  const tenantId = z.string().uuid().parse(input.tenantId);
  const policyVersion = z.number().int().positive().parse(input.policyVersion);
  const nextRunAt = z.string().datetime({ offset: true }).parse(input.now);

  return EVE_ENGINEERING_MONITOR_TYPES.map((type) => ({
    id: `engineering:${type}:asymmetric-al-core`,
    tenantId,
    type,
    enabled: false,
    paused: true,
    source: "schedule",
    schedule: EVE_ENGINEERING_MONITOR_SCHEDULE,
    threshold: defaults[type].threshold,
    severityRules: defaults[type].severityRules,
    destinationPolicy: { kind: "none", minimumSeverity: "high" },
    owner: "platform-engineering",
    repoOwner: "Asymmetric-al",
    repoName: "core",
    dedupeWindowSeconds: defaults[type].dedupeWindowSeconds,
    freshnessWindowSeconds: defaults[type].freshnessWindowSeconds,
    policyVersion,
    nextRunAt,
  }));
}

export function isEveProductOpportunityMonitor(value: string): boolean {
  return /product[\s_-]*(opportunity|discovery|scan)/iu.test(value);
}
