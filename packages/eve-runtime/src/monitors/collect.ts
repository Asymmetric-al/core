import { detectEveGithubProtectedAreas } from "@asym/api/eve/github-review";

import type {
  EveEngineeringFindingSeverity,
  EveEngineeringMonitorConfig,
  EveEngineeringMonitorEvidence,
} from "@asym/api/eve/engineering-monitors";

export interface EveMonitorGithubReader {
  <T>(path: string): Promise<T>;
}

function limit(config: EveEngineeringMonitorConfig): number {
  const value = config.threshold.maxItems;
  return typeof value === "number" && Number.isSafeInteger(value)
    ? Math.min(Math.max(value, 1), 100)
    : 25;
}

function safeSeverity(value: unknown): EveEngineeringFindingSeverity {
  return value === "critical" ||
    value === "high" ||
    value === "medium" ||
    value === "low"
    ? value
    : "medium";
}

async function collectCiFailures(
  config: EveEngineeringMonitorConfig,
  github: EveMonitorGithubReader,
): Promise<EveEngineeringMonitorEvidence[]> {
  const response = await github<{
    workflow_runs?: Array<{
      conclusion?: string;
      head_sha?: string;
      html_url?: string;
      id?: number;
      name?: string;
      updated_at?: string;
    }>;
  }>(
    `/repos/Asymmetric-al/core/actions/runs?status=completed&per_page=${limit(config)}`,
  );
  const conclusions = new Set([
    "failure",
    "timed_out",
    "cancelled",
    "action_required",
  ]);
  return (response.workflow_runs ?? []).flatMap((run) => {
    if (
      !run.id ||
      !run.head_sha ||
      !run.html_url ||
      !run.updated_at ||
      !run.name ||
      !run.conclusion ||
      !conclusions.has(run.conclusion)
    ) {
      return [];
    }
    return [
      {
        type: "ci_failure",
        checkId: String(run.id),
        conclusion: run.conclusion as
          | "action_required"
          | "cancelled"
          | "failure"
          | "timed_out",
        observedAt: run.updated_at,
        repository: "Asymmetric-al/core",
        safeUrl: run.html_url,
        targetId: `workflow-run:${run.id}`,
        targetRevision: run.head_sha,
        workflowName: run.name,
      } satisfies EveEngineeringMonitorEvidence,
    ];
  });
}

async function collectStalePullRequests(
  config: EveEngineeringMonitorConfig,
  github: EveMonitorGithubReader,
  now: Date,
): Promise<EveEngineeringMonitorEvidence[]> {
  const pulls = await github<
    Array<{
      draft?: boolean;
      head?: { sha?: string };
      html_url?: string;
      labels?: Array<{ name?: string }>;
      number?: number;
      updated_at?: string;
    }>
  >(`/repos/Asymmetric-al/core/pulls?state=open&per_page=${limit(config)}`);
  const configured = config.threshold.ageSeconds;
  const thresholdSeconds =
    typeof configured === "number" && configured >= 3_600
      ? configured
      : 604_800;
  return pulls.flatMap((pull) => {
    if (
      !pull.number ||
      !pull.head?.sha ||
      !pull.html_url ||
      !pull.updated_at ||
      now.getTime() - Date.parse(pull.updated_at) < thresholdSeconds * 1_000
    ) {
      return [];
    }
    const labels = (pull.labels ?? []).flatMap((label) =>
      label.name ? [label.name.toLowerCase()] : [],
    );
    return [
      {
        type: "stale_pull_request",
        blocked: labels.some((label) =>
          /blocked|on-hold|waiting|do-not-merge/u.test(label),
        ),
        draft: pull.draft === true,
        lastActivityAt: pull.updated_at,
        observedAt: now.toISOString(),
        pullRequestNumber: pull.number,
        repository: "Asymmetric-al/core",
        safeUrl: pull.html_url,
        targetId: `pull-request:${pull.number}`,
        targetRevision: pull.head.sha,
        thresholdSeconds,
      } satisfies EveEngineeringMonitorEvidence,
    ];
  });
}

async function collectFailingEvals(
  config: EveEngineeringMonitorConfig,
  github: EveMonitorGithubReader,
): Promise<EveEngineeringMonitorEvidence[]> {
  const failures = await collectCiFailures(config, github);
  return failures.flatMap((failure) => {
    if (
      failure.type !== "ci_failure" ||
      !/\b(eval|evaluation|eve runtime)\b/iu.test(failure.workflowName)
    ) {
      return [];
    }
    return [
      {
        type: "failing_eval",
        caseId: failure.checkId,
        deterministicStatus: "failed",
        judgeStatus: "not_used",
        observedAt: failure.observedAt,
        repository: failure.repository,
        safeUrl: failure.safeUrl,
        suite: failure.workflowName,
        targetId: `eval-run:${failure.checkId}`,
        targetRevision: failure.targetRevision,
      } satisfies EveEngineeringMonitorEvidence,
    ];
  });
}

async function collectSecurityAlerts(
  config: EveEngineeringMonitorConfig,
  github: EveMonitorGithubReader,
): Promise<EveEngineeringMonitorEvidence[]> {
  const [dependabot, codeScanning] = await Promise.all([
    github<
      Array<{
        created_at?: string;
        dependency?: { package?: { name?: string }; scope?: string };
        html_url?: string;
        number?: number;
        security_advisory?: { ghsa_id?: string; severity?: string };
      }>
    >(
      `/repos/Asymmetric-al/core/dependabot/alerts?state=open&per_page=${limit(config)}`,
    ),
    github<
      Array<{
        created_at?: string;
        html_url?: string;
        most_recent_instance?: { ref?: string };
        number?: number;
        rule?: { security_severity_level?: string; tags?: string[] };
      }>
    >(
      `/repos/Asymmetric-al/core/code-scanning/alerts?state=open&per_page=${limit(config)}`,
    ),
  ]);
  const dependencyEvidence = dependabot.flatMap((alert) => {
    const advisory = alert.security_advisory;
    if (
      !alert.number ||
      !alert.created_at ||
      !alert.html_url ||
      !advisory?.ghsa_id ||
      !alert.dependency?.package?.name
    ) {
      return [];
    }
    return [
      {
        type: "dependency_security_alert",
        advisoryId: advisory.ghsa_id,
        advisorySeverity: safeSeverity(advisory.severity),
        affectedScope: `${alert.dependency.package.name}:${alert.dependency.scope ?? "runtime"}`,
        alertSource: "dependabot",
        observedAt: alert.created_at,
        repository: "Asymmetric-al/core",
        safeUrl: alert.html_url,
        targetId: `dependabot-alert:${alert.number}`,
        targetRevision: advisory.ghsa_id,
      } satisfies EveEngineeringMonitorEvidence,
    ];
  });
  const scanningEvidence = codeScanning.flatMap((alert) => {
    const severity = alert.rule?.security_severity_level;
    if (!alert.number || !alert.created_at || !alert.html_url || !severity) {
      return [];
    }
    return [
      {
        type: "dependency_security_alert",
        advisoryId: `code-scanning:${alert.number}`,
        advisorySeverity: safeSeverity(severity),
        affectedScope:
          (alert.rule?.tags ?? []).slice(0, 5).join(",") || "repository",
        alertSource: "code_scanning",
        observedAt: alert.created_at,
        repository: "Asymmetric-al/core",
        safeUrl: alert.html_url,
        targetId: `code-scanning-alert:${alert.number}`,
        targetRevision: alert.most_recent_instance?.ref ?? "repository",
      } satisfies EveEngineeringMonitorEvidence,
    ];
  });
  return [...dependencyEvidence, ...scanningEvidence];
}

async function collectProtectedPullRequests(
  config: EveEngineeringMonitorConfig,
  github: EveMonitorGithubReader,
  now: Date,
): Promise<EveEngineeringMonitorEvidence[]> {
  const pulls = await github<
    Array<{
      head?: { sha?: string };
      html_url?: string;
      number?: number;
      requested_reviewers?: unknown[];
    }>
  >(`/repos/Asymmetric-al/core/pulls?state=open&per_page=${limit(config)}`);
  const findings: EveEngineeringMonitorEvidence[] = [];
  for (const pull of pulls) {
    if (!pull.number || !pull.head?.sha || !pull.html_url) continue;
    const files = await github<Array<{ filename?: string }>>(
      `/repos/Asymmetric-al/core/pulls/${pull.number}/files?per_page=100`,
    );
    const protectedAreas = detectEveGithubProtectedAreas(
      files.flatMap((file) => (file.filename ? [file.filename] : [])),
    );
    if (protectedAreas.length === 0) continue;
    findings.push({
      type: "protected_area_pull_request",
      matchedRules: [...new Set(protectedAreas.flatMap((area) => area.rules))],
      observedAt: now.toISOString(),
      pullRequestNumber: pull.number,
      repository: "Asymmetric-al/core",
      reviewState:
        (pull.requested_reviewers?.length ?? 0) > 0
          ? "review_requested"
          : "unreviewed",
      safeUrl: pull.html_url,
      targetId: `pull-request:${pull.number}`,
      targetRevision: pull.head.sha,
    });
  }
  return findings;
}

async function collectRateLimit(
  config: EveEngineeringMonitorConfig,
  github: EveMonitorGithubReader,
  now: Date,
): Promise<EveEngineeringMonitorEvidence[]> {
  const response = await github<{
    resources?: {
      core?: { limit?: number; remaining?: number; reset?: number };
      graphql?: { limit?: number; remaining?: number; reset?: number };
    };
  }>("/rate_limit");
  const configured = config.threshold.remainingPercent;
  const threshold = typeof configured === "number" ? configured : 10;
  return Object.entries(response.resources ?? {}).flatMap(([scope, value]) => {
    const total = value?.limit;
    const remaining = value?.remaining;
    const reset = value?.reset;
    if (
      !total ||
      remaining === undefined ||
      !reset ||
      (remaining / total) * 100 > threshold
    ) {
      return [];
    }
    return [
      {
        type: "budget_rate_limit",
        observedAt: now.toISOString(),
        remaining,
        repository: "Asymmetric-al/core",
        resetAt: new Date(reset * 1_000).toISOString(),
        safeUrl: "https://github.com/settings/apps",
        scope,
        status: remaining === 0 ? "exhausted" : "near_limit",
        targetId: `github-rate-limit:${scope}`,
        targetRevision: String(reset),
        total,
      } satisfies EveEngineeringMonitorEvidence,
    ];
  });
}

export async function collectEveEngineeringMonitorEvidence(input: {
  config: EveEngineeringMonitorConfig;
  github: EveMonitorGithubReader;
  now: Date;
}): Promise<EveEngineeringMonitorEvidence[]> {
  switch (input.config.type) {
    case "ci_failure":
      return collectCiFailures(input.config, input.github);
    case "stale_pull_request":
      return collectStalePullRequests(input.config, input.github, input.now);
    case "failing_eval":
      return collectFailingEvals(input.config, input.github);
    case "dependency_security_alert":
      return collectSecurityAlerts(input.config, input.github);
    case "protected_area_pull_request":
      return collectProtectedPullRequests(
        input.config,
        input.github,
        input.now,
      );
    case "budget_rate_limit":
      return collectRateLimit(input.config, input.github, input.now);
  }
}
