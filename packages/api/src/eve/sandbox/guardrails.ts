import { createHash } from "node:crypto";

import type { EveGovernanceSnapshot } from "../governance/types";

export const EVE_SANDBOX_NETWORK_POLICY = {
  allow: "allow-all",
  deny: "deny-all",
} as const;

export type EveSandboxFindingKind =
  | "protected_path"
  | "sensitive_content"
  | "sensitive_path";

export interface EveSandboxFinding {
  kind: EveSandboxFindingKind;
  rule: string;
}

export interface EveSandboxScanResult {
  findings: EveSandboxFinding[];
  requiresApproval: boolean;
  safe: boolean;
}

const PROTECTED_PATH_PATTERNS: ReadonlyArray<{
  pattern: RegExp;
  rule: string;
}> = [
  { pattern: /(^|\/)AGENTS\.md$/iu, rule: "agent_instructions" },
  { pattern: /(^|\/)CLAUDE\.md$/iu, rule: "agent_instructions" },
  { pattern: /(^|\/)\.github\//iu, rule: "github_workflows" },
  {
    pattern: /(^|\/)apps\/[^/]+\/(proxy|next\.config)\./iu,
    rule: "runtime_configuration",
  },
  { pattern: /(^|\/)openspec\//iu, rule: "product_specification" },
  {
    pattern: /(^|\/)packages\/(auth|database|eve-runtime)\//iu,
    rule: "identity_data_runtime",
  },
  {
    pattern: /(^|\/)supabase\/(migrations|seed)\//iu,
    rule: "migrations_and_rls",
  },
  {
    pattern: /(^|\/)(bun\.lock|package\.json|turbo\.json)$/iu,
    rule: "packages_and_dependencies",
  },
  {
    pattern: /(^|\/)(auth|donations?|payments?|permissions?)\//iu,
    rule: "sensitive_behavior",
  },
  {
    pattern: /(^|\/)(vercel\.json|\.vercelignore)$/iu,
    rule: "production_deployment",
  },
  {
    // The sandbox governance, guardrail and audit source itself: edits here
    // change the code that decides containment, so they must pause for approval.
    pattern: /(^|\/)packages\/api\/src\/eve\//iu,
    rule: "identity_data_runtime",
  },
];

const SENSITIVE_PATH_PATTERNS: ReadonlyArray<{
  pattern: RegExp;
  rule: string;
}> = [
  { pattern: /(^|\/)\.env(?:\..*)?$/iu, rule: "environment_file" },
  {
    // Default OpenSSH private keys have no extension, so they need their own
    // alternative rather than relying on the extension branch.
    pattern:
      /(^|\/)(?:id_(?:rsa|dsa|ecdsa|ed25519)|[^/]+\.(?:key|p12|pfx|pem))$/iu,
    rule: "private_key_material",
  },
  {
    pattern: /(?:service[-_]?role|service_role_key)/iu,
    rule: "service_role_material",
  },
  {
    pattern: /(^|\/)(?:dumps?|backups?|production-data)(\/|$)/iu,
    rule: "production_data_dump",
  },
  {
    pattern:
      /(^|\/)(?:prod(?:uction)?[-_.][^/]*|[^/]*[-_.]prod(?:uction)?)[^/]*\.(?:dump|sql)$/iu,
    rule: "production_data_dump",
  },
];

const SENSITIVE_CONTENT_PATTERNS: ReadonlyArray<{
  pattern: RegExp;
  rule: string;
}> = [
  {
    pattern: /-----BEGIN (?:EC |OPENSSH |RSA )?PRIVATE KEY-----/u,
    rule: "private_key_material",
  },
  { pattern: /SUPABASE_SERVICE_ROLE_KEY\s*=/iu, rule: "service_role_material" },
  {
    pattern:
      /(?:STRIPE|RESEND|GITHUB|VERCEL|OPENAI|ANTHROPIC|AWS|SLACK|SUPABASE|CLOUDINARY|SENTRY|TURBO)_[A-Z0-9_]*(?:KEY|SECRET|TOKEN)\s*=/u,
    rule: "provider_credential",
  },
];

function normalizePath(path: string): string {
  return path
    .replaceAll("\\", "/")
    .replace(/^\/workspace\/(?:repo\/)?/u, "")
    .replace(/^\.\//u, "");
}

function uniqueFindings(findings: EveSandboxFinding[]): EveSandboxFinding[] {
  return findings.filter(
    (finding, index) =>
      findings.findIndex(
        (candidate) =>
          candidate.kind === finding.kind && candidate.rule === finding.rule,
      ) === index,
  );
}

export function scanEveSandboxPath(path: string): EveSandboxScanResult {
  const normalizedPath = normalizePath(path);
  const findings: EveSandboxFinding[] = [];

  // An absolute path that survived normalization never resolved under
  // /workspace/, so it escapes the sandbox even without any ".." traversal.
  if (
    normalizedPath.length === 0 ||
    normalizedPath.startsWith("/") ||
    normalizedPath === ".." ||
    normalizedPath.startsWith("../") ||
    normalizedPath.includes("/../")
  ) {
    findings.push({ kind: "sensitive_path", rule: "workspace_escape" });
  }

  for (const rule of SENSITIVE_PATH_PATTERNS) {
    if (rule.pattern.test(normalizedPath)) {
      findings.push({ kind: "sensitive_path", rule: rule.rule });
    }
  }

  for (const rule of PROTECTED_PATH_PATTERNS) {
    if (rule.pattern.test(normalizedPath)) {
      findings.push({ kind: "protected_path", rule: rule.rule });
    }
  }

  const unique = uniqueFindings(findings);
  return {
    findings: unique,
    requiresApproval: unique.some(
      (finding) => finding.kind === "protected_path",
    ),
    safe: unique.length === 0,
  };
}

export function scanEveSandboxWrite(input: {
  content: string;
  path: string;
}): EveSandboxScanResult {
  const pathResult = scanEveSandboxPath(input.path);
  const findings = [...pathResult.findings];

  for (const rule of SENSITIVE_CONTENT_PATTERNS) {
    if (rule.pattern.test(input.content)) {
      findings.push({ kind: "sensitive_content", rule: rule.rule });
    }
  }

  const unique = uniqueFindings(findings);
  return {
    findings: unique,
    requiresApproval: unique.some(
      (finding) => finding.kind === "protected_path",
    ),
    safe: unique.length === 0,
  };
}

export function scanEveSandboxCommand(command: string): EveSandboxScanResult {
  const findings: EveSandboxFinding[] = [];
  const tokens = command
    .split(/[\s;&|><()]+/u)
    .map((token) => token.replace(/^['"]|['"]$/gu, ""))
    .filter(Boolean);

  for (const token of tokens) {
    findings.push(...scanEveSandboxPath(token).findings);
  }

  for (const rule of SENSITIVE_CONTENT_PATTERNS) {
    if (rule.pattern.test(command)) {
      findings.push({ kind: "sensitive_content", rule: rule.rule });
    }
  }

  const unique = uniqueFindings(findings);
  return {
    findings: unique,
    requiresApproval: unique.some(
      (finding) => finding.kind === "protected_path",
    ),
    safe: unique.length === 0,
  };
}

export function hasBlockingSandboxFinding(
  result: EveSandboxScanResult,
): boolean {
  return result.findings.some((finding) => finding.kind !== "protected_path");
}

export function commandMayUseNetwork(command: string): boolean {
  return /(^|[\s;&|])(bun|curl|git|gh|npm|npx|pnpm|wget|yarn)(?=$|\s)/iu.test(
    command,
  );
}

export function fingerprintEveSandboxCommand(command: string): string {
  return createHash("sha256").update(command).digest("hex");
}

export type EveSandboxNetworkDecision =
  | {
      allowed: true;
      governanceStateVersion: number;
      networkPolicy: "allow-all";
      reason: "governance_allowed";
    }
  | {
      allowed: false;
      governanceStateVersion?: number;
      networkPolicy: "deny-all";
      reason:
        | "emergency_off"
        | "governance_unavailable"
        | "kill_switch_active"
        | "policy_not_ready"
        | "release_disabled";
    };

export function evaluateEveSandboxNetwork(
  snapshot: EveGovernanceSnapshot | null,
): EveSandboxNetworkDecision {
  if (!snapshot || snapshot.source !== "persisted") {
    return {
      allowed: false,
      networkPolicy: EVE_SANDBOX_NETWORK_POLICY.deny,
      reason: "governance_unavailable",
    };
  }

  const governanceStateVersion = snapshot.stateVersion;
  if (snapshot.emergencyOff) {
    return {
      allowed: false,
      governanceStateVersion,
      networkPolicy: EVE_SANDBOX_NETWORK_POLICY.deny,
      reason: "emergency_off",
    };
  }
  if (!snapshot.releaseEnabled) {
    return {
      allowed: false,
      governanceStateVersion,
      networkPolicy: EVE_SANDBOX_NETWORK_POLICY.deny,
      reason: "release_disabled",
    };
  }
  if (
    snapshot.killSwitchState.all_automation ||
    snapshot.killSwitchState.active_runs ||
    snapshot.killSwitchState.sandbox_networking
  ) {
    return {
      allowed: false,
      governanceStateVersion,
      networkPolicy: EVE_SANDBOX_NETWORK_POLICY.deny,
      reason: "kill_switch_active",
    };
  }
  if (snapshot.policyStatus !== "ready") {
    return {
      allowed: false,
      governanceStateVersion,
      networkPolicy: EVE_SANDBOX_NETWORK_POLICY.deny,
      reason: "policy_not_ready",
    };
  }

  return {
    allowed: true,
    governanceStateVersion,
    networkPolicy: EVE_SANDBOX_NETWORK_POLICY.allow,
    reason: "governance_allowed",
  };
}
