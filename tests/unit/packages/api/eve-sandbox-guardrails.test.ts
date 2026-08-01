import { describe, expect, it } from "vitest";

import {
  commandMayUseNetwork,
  evaluateEveSandboxNetwork,
  fingerprintEveSandboxCommand,
  hasBlockingSandboxFinding,
  scanEveSandboxCommand,
  scanEveSandboxPath,
  scanEveSandboxWrite,
} from "../../../../packages/api/src/eve/sandbox/guardrails";

import type { EveGovernanceSnapshot } from "@asym/api/eve/governance/types";

function readyGovernance(): EveGovernanceSnapshot {
  return {
    emergencyOff: false,
    killSwitchState: {
      active_runs: false,
      all_automation: false,
      dynamic_workflows: false,
      force_approval: false,
      github_actions: false,
      model_policy_changes: false,
      production_writes: false,
      sandbox_networking: false,
    },
    policyStatus: "ready",
    releaseEnabled: true,
    source: "persisted",
    stateVersion: 7,
    updatedAt: "2026-07-17T00:00:00.000Z",
  };
}

describe("Eve sandbox file guardrails", () => {
  it("allows ordinary source files", () => {
    const result = scanEveSandboxWrite({
      content: "export const answer = 42;",
      path: "/workspace/repo/packages/lib/src/answer.ts",
    });

    expect(result).toEqual({
      findings: [],
      requiresApproval: false,
      safe: true,
    });
  });

  it.each([
    "/workspace/repo/.env",
    "/workspace/repo/apps/admin/.env.local",
    "/workspace/repo/keys/service-role.pem",
    "/workspace/repo/production-data/customer.dump",
    "../host-secret.txt",
    // Absolute paths outside /workspace/ escape the sandbox without any ".."
    "/etc/hosts",
    "/etc/passwd",
    "/var/run/docker.sock",
    "/home/runner/.ssh/id_rsa",
    // Default OpenSSH key names carry no extension
    ".ssh/id_rsa",
    ".ssh/id_ed25519",
    "keys/id_ecdsa",
  ])("blocks sensitive or escaping path %s", (path) => {
    const result = scanEveSandboxPath(path);

    expect(result.safe).toBe(false);
    expect(hasBlockingSandboxFinding(result)).toBe(true);
  });

  it("blocks credential content even in an ordinary filename", () => {
    const result = scanEveSandboxWrite({
      content: "SUPABASE_SERVICE_ROLE_KEY=never-enters-the-sandbox",
      path: "/workspace/repo/notes.txt",
    });

    expect(result.findings).toContainEqual({
      kind: "sensitive_content",
      rule: "service_role_material",
    });
    expect(hasBlockingSandboxFinding(result)).toBe(true);
  });

  it.each([
    "AGENTS.md",
    ".github/workflows/ci.yml",
    "packages/auth/context.ts",
    "packages/eve-runtime/agent/agent.ts",
    "packages/api/src/eve/sandbox/guardrails.ts",
    "packages/api/src/eve/governance/control.ts",
    "supabase/migrations/20260717000000_change.sql",
    "bun.lock",
  ])("pauses protected path %s for durable approval", (path) => {
    const result = scanEveSandboxPath(path);

    expect(result.safe).toBe(false);
    expect(result.requiresApproval).toBe(true);
    expect(hasBlockingSandboxFinding(result)).toBe(false);
  });

  it("detects protected paths in shell commands", () => {
    const result = scanEveSandboxCommand(
      "git add packages/auth/context.ts && git commit -m auth",
    );

    expect(result.requiresApproval).toBe(true);
  });
});

describe("Eve sandbox command audit classification", () => {
  it.each([
    "git fetch origin",
    "curl https://example.test",
    "bun install",
    "gh pr view 1",
  ])("classifies potential egress command %s", (command) => {
    expect(commandMayUseNetwork(command)).toBe(true);
  });

  it("stores a stable fingerprint instead of raw command text", () => {
    const command = "git status --short";
    const fingerprint = fingerprintEveSandboxCommand(command);

    expect(fingerprint).toHaveLength(64);
    expect(fingerprint).not.toContain(command);
    expect(fingerprintEveSandboxCommand(command)).toBe(fingerprint);
  });
});

describe("Eve sandbox network kill switch", () => {
  it("allows networking only for persisted, released, ready governance", () => {
    expect(evaluateEveSandboxNetwork(readyGovernance())).toEqual({
      allowed: true,
      governanceStateVersion: 7,
      networkPolicy: "allow-all",
      reason: "governance_allowed",
    });
  });

  it.each([
    {
      mutate: (state: EveGovernanceSnapshot) => {
        state.releaseEnabled = false;
      },
      reason: "release_disabled",
    },
    {
      mutate: (state: EveGovernanceSnapshot) => {
        state.emergencyOff = true;
      },
      reason: "emergency_off",
    },
    {
      mutate: (state: EveGovernanceSnapshot) => {
        state.killSwitchState.sandbox_networking = true;
      },
      reason: "kill_switch_active",
    },
    {
      mutate: (state: EveGovernanceSnapshot) => {
        state.policyStatus = "not_configured";
      },
      reason: "policy_not_ready",
    },
    {
      mutate: (state: EveGovernanceSnapshot) => {
        state.killSwitchState.all_automation = true;
      },
      reason: "kill_switch_active",
    },
    {
      mutate: (state: EveGovernanceSnapshot) => {
        state.killSwitchState.active_runs = true;
      },
      reason: "kill_switch_active",
    },
    {
      mutate: (state: EveGovernanceSnapshot) => {
        state.source = "missing";
      },
      reason: "governance_unavailable",
    },
  ])("fails closed with $reason", ({ mutate, reason }) => {
    const governance = readyGovernance();
    mutate(governance);

    expect(evaluateEveSandboxNetwork(governance)).toMatchObject({
      allowed: false,
      networkPolicy: "deny-all",
      reason,
    });
  });

  it("fails closed when persisted governance cannot be loaded", () => {
    expect(evaluateEveSandboxNetwork(null)).toEqual({
      allowed: false,
      networkPolicy: "deny-all",
      reason: "governance_unavailable",
    });
  });
});
