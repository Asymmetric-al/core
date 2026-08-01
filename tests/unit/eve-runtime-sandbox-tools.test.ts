import { describe, expect, it, vi } from "vitest";

import type { EveSandboxNetworkDecision } from "@asym/api/eve/sandbox";

const mocks = vi.hoisted(() => ({
  decision: {
    allowed: true,
    governanceStateVersion: 1,
    networkPolicy: "allow-all",
    reason: "governance_allowed",
  } as EveSandboxNetworkDecision,
}));

// Only the governance lookup is replaced; the real guardrail scanners stay in
// place so the approval assertions below still exercise production logic.
vi.mock("@asym/api/eve/sandbox", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@asym/api/eve/sandbox")>()),
  recordEveSandboxAction: async () => true,
  resolveEveSandboxNetworkDecision: async () => mocks.decision,
}));

import sandboxDefinition from "../../packages/eve-runtime/agent/sandbox";
import bashTool from "../../packages/eve-runtime/agent/tools/bash";
import writeFileTool from "../../packages/eve-runtime/agent/tools/write_file";

async function approvalFor(
  tool: typeof bashTool | typeof writeFileTool,
  toolInput: unknown,
) {
  if (typeof tool.approval !== "function") {
    throw new Error("Expected an authored approval policy.");
  }
  return tool.approval({ toolInput } as never);
}

describe("Eve sandbox authored controls", () => {
  it("declares an isolated writable sandbox with a session control hook", () => {
    expect(sandboxDefinition.description).toMatch(/no mounted credentials/i);
    expect(sandboxDefinition.onSession).toBeTypeOf("function");
  });

  it("provisions and sanitizes a public writable Core checkout without credentials", async () => {
    const commands: string[] = [];
    const policies: string[] = [];
    const sandbox = {
      async run({ command }: { command: string }) {
        commands.push(command);
        return { exitCode: 0, stderr: "", stdout: "" };
      },
      async setNetworkPolicy(policy: string) {
        policies.push(policy);
      },
    };

    if (!sandboxDefinition.bootstrap) {
      throw new Error("Expected sandbox template provisioning.");
    }
    await sandboxDefinition.bootstrap({
      use: async () => sandbox,
    } as never);

    expect(commands[0]).toMatch(
      /git clone .*https:\/\/github\.com\/Asymmetric-al\/core\.git \/workspace\/repo/u,
    );
    expect(commands[1]).toMatch(/find \/workspace\/repo .*\.env/u);
    expect(policies).toEqual(["allow-all", "deny-all"]);
  });

  it("refuses to provision or egress when governance denies the sandbox", async () => {
    mocks.decision = {
      allowed: false,
      networkPolicy: "deny-all",
      reason: "kill_switch_active",
    };
    const commands: string[] = [];
    const policies: string[] = [];
    const sandbox = {
      async run({ command }: { command: string }) {
        commands.push(command);
        return { exitCode: 0, stderr: "", stdout: "" };
      },
      async setNetworkPolicy(policy: string) {
        policies.push(policy);
      },
    };

    if (!sandboxDefinition.bootstrap) {
      throw new Error("Expected sandbox template provisioning.");
    }

    await expect(
      sandboxDefinition.bootstrap({ use: async () => sandbox } as never),
    ).rejects.toThrow(/not authorized: kill_switch_active/u);

    // The clone reaches the public internet, so nothing may run and the
    // network must never be opened when governance says no.
    expect(commands).toEqual([]);
    expect(policies).not.toContain("allow-all");

    mocks.decision = {
      allowed: true,
      governanceStateVersion: 1,
      networkPolicy: "allow-all",
      reason: "governance_allowed",
    };
  });

  it("durably pauses protected commands for user approval", async () => {
    await expect(
      approvalFor(bashTool, {
        command: "git add packages/auth/context.ts && git commit -m auth",
      }),
    ).resolves.toBe("user-approval");
  });

  it("denies commands that reference environment files", async () => {
    await expect(
      approvalFor(bashTool, { command: "cat .env.local" }),
    ).resolves.toMatchObject({ type: "denied" });
  });

  it("durably pauses protected file writes for user approval", async () => {
    await expect(
      approvalFor(writeFileTool, {
        content: "export const guarded = true;",
        filePath: "packages/eve-runtime/agent/agent.ts",
      }),
    ).resolves.toBe("user-approval");
  });

  it("denies secret-bearing file writes before execution", async () => {
    await expect(
      approvalFor(writeFileTool, {
        content: "SUPABASE_SERVICE_ROLE_KEY=never",
        filePath: "notes.txt",
      }),
    ).resolves.toMatchObject({ type: "denied" });
  });
});
