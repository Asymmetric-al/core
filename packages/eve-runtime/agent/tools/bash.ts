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

export function createEveBashTool(
  executeBash: typeof bash.execute = bash.execute,
) {
  return defineTool({
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
      // Arbitrary shell syntax can obscure filesystem targets through expansion,
      // command substitution, cwd changes, and executable behavior. Eve 0.25.1
      // has no transactional sandbox primitive that could safely resolve those
      // effects before approval, so no Bash command may skip durable review.
      return "user-approval";
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
        decision,
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
        try {
          await sandbox.setNetworkPolicy("deny-all");
        } catch {
          return blockedOutput(
            "Sandbox paused: the network could not be returned to deny-all.",
          );
        }
        return blockedOutput("Sandbox paused: command audit is unavailable.");
      }

      try {
        const output = (await executeBash(input, ctx)) as BashOutput;
        // The delegated tool is not guaranteed to return a numeric exitCode.
        // Treat a missing one as success, since a genuine failure throws and is
        // recorded by the catch below; assuming failure would mislabel the trail.
        const exitCode =
          typeof output?.exitCode === "number" ? output.exitCode : undefined;
        await recordEveSandboxAction({
          action: "command",
          decision,
          command: input.command,
          findings,
          result:
            exitCode === undefined || exitCode === 0 ? "succeeded" : "failed",
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
          decision,
          command: input.command,
          findings,
          result: "failed",
          runId,
          sessionId: ctx.session.id,
          target: commandMayUseNetwork(input.command)
            ? "sandbox-command-with-egress"
            : "sandbox-command",
        });
        throw error;
      }
    },
  });
}

export default createEveBashTool();
