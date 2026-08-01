import {
  commandMayUseNetwork,
  hasBlockingSandboxFinding,
  recordEveSandboxAction,
  resolveEveSandboxNetworkDecision,
  scanEveSandboxCommand,
} from "@asym/api/eve/sandbox";
import { defineTool } from "eve/tools";
import { bash } from "eve/tools/defaults";

interface BashInput {
  command: string;
}

interface BashOutput {
  exitCode: number;
  stderr: string;
  stdout: string;
  truncated: boolean;
}

function parseBashInput(input: unknown): BashInput | null {
  if (
    typeof input === "object" &&
    input !== null &&
    "command" in input &&
    typeof input.command === "string"
  ) {
    return { command: input.command };
  }
  return null;
}

function blockedOutput(message: string): BashOutput {
  return {
    exitCode: 126,
    stderr: message,
    stdout: "",
    truncated: false,
  };
}

export default defineTool({
  ...bash,
  approval({ toolInput }) {
    const input = parseBashInput(toolInput);
    if (!input) {
      return { type: "denied", reason: "Invalid sandbox command input." };
    }

    const scan = scanEveSandboxCommand(input.command);
    if (hasBlockingSandboxFinding(scan)) {
      return {
        type: "denied",
        reason:
          "The command references material that may never enter the sandbox.",
      };
    }
    return scan.requiresApproval ? "user-approval" : "not-applicable";
  },
  async execute(rawInput, ctx) {
    const input = parseBashInput(rawInput);
    if (!input) {
      return blockedOutput("Invalid sandbox command input.");
    }

    const scan = scanEveSandboxCommand(input.command);
    if (hasBlockingSandboxFinding(scan)) {
      return blockedOutput(
        "Sandbox paused: the command references forbidden sensitive material.",
      );
    }

    const sandbox = await ctx.getSandbox();
    const decision = await resolveEveSandboxNetworkDecision();
    if (!decision.allowed) {
      return blockedOutput(`Sandbox paused: ${decision.reason}.`);
    }
    try {
      await sandbox.setNetworkPolicy(decision.networkPolicy);
    } catch {
      return blockedOutput(
        "Sandbox paused: the governed network policy could not be applied.",
      );
    }

    const runId = crypto.randomUUID();
    const findings = scan.findings.map(
      (finding) => `${finding.kind}:${finding.rule}`,
    );
    const auditStarted = await recordEveSandboxAction({
      action: "command",
      command: input.command,
      findings,
      result: "started",
      runId,
      sessionId: ctx.session.id,
      target: commandMayUseNetwork(input.command)
        ? "sandbox-command-with-egress"
        : "sandbox-command",
    });
    if (!auditStarted) {
      await sandbox.setNetworkPolicy("deny-all").catch(() => undefined);
      return blockedOutput("Sandbox paused: command audit is unavailable.");
    }

    try {
      const output = (await bash.execute(rawInput, ctx)) as BashOutput;
      await recordEveSandboxAction({
        action: "command",
        command: input.command,
        findings,
        result: output.exitCode === 0 ? "succeeded" : "failed",
        runId,
        sessionId: ctx.session.id,
        target: commandMayUseNetwork(input.command)
          ? "sandbox-command-with-egress"
          : "sandbox-command",
      });
      return output;
    } catch (error) {
      await recordEveSandboxAction({
        action: "command",
        command: input.command,
        findings,
        result: "failed",
        runId,
        sessionId: ctx.session.id,
      });
      throw error;
    }
  },
});
