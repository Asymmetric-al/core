import {
  hasBlockingSandboxFinding,
  recordEveSandboxAction,
  resolveEveSandboxWriteDecision,
  scanEveSandboxWrite,
} from "@asym/api/eve/sandbox";
import { defineTool } from "eve/tools";
import { writeFile } from "eve/tools/defaults";

interface WriteFileInput {
  content: string;
  filePath: string;
}

function parseWriteFileInput(input: unknown): WriteFileInput | null {
  if (
    typeof input === "object" &&
    input !== null &&
    "content" in input &&
    typeof input.content === "string" &&
    "filePath" in input &&
    typeof input.filePath === "string"
  ) {
    return { content: input.content, filePath: input.filePath };
  }
  return null;
}

export default defineTool({
  ...writeFile,
  approval({ toolInput }) {
    const input = parseWriteFileInput(toolInput);
    if (!input) {
      return { type: "denied", reason: "Invalid sandbox file input." };
    }

    const scan = scanEveSandboxWrite({
      content: input.content,
      path: input.filePath,
    });
    if (hasBlockingSandboxFinding(scan)) {
      return {
        type: "denied",
        reason:
          "Secrets, environment files, keys, and production dumps may not enter the sandbox.",
      };
    }
    return scan.requiresApproval ? "user-approval" : "not-applicable";
  },
  async execute(rawInput, ctx) {
    const input = parseWriteFileInput(rawInput);
    if (!input) {
      throw new Error("Invalid sandbox file input.");
    }

    const scan = scanEveSandboxWrite({
      content: input.content,
      path: input.filePath,
    });
    if (hasBlockingSandboxFinding(scan)) {
      throw new Error("Sandbox paused: forbidden sensitive material detected.");
    }

    // Writes are authorized by the write decision, not the egress decision: a
    // file write touches only /workspace and cannot exfiltrate on its own.
    const decision = await resolveEveSandboxWriteDecision();
    if (!decision.allowed) {
      throw new Error(`Sandbox paused: ${decision.reason}.`);
    }

    const runId = crypto.randomUUID();
    const findings = scan.findings.map(
      (finding) => `${finding.kind}:${finding.rule}`,
    );
    const auditStarted = await recordEveSandboxAction({
      action: "write_file",
      decision,
      findings,
      result: "started",
      runId,
      sessionId: ctx.session.id,
      target: input.filePath,
    });
    if (!auditStarted) {
      throw new Error("Sandbox paused: file audit is unavailable.");
    }

    try {
      const output = await writeFile.execute(rawInput, ctx);
      await recordEveSandboxAction({
        action: "write_file",
        decision,
        findings,
        result: "succeeded",
        runId,
        sessionId: ctx.session.id,
        target: input.filePath,
      });
      return output;
    } catch (error) {
      await recordEveSandboxAction({
        action: "write_file",
        decision,
        findings,
        result: "failed",
        runId,
        sessionId: ctx.session.id,
        target: input.filePath,
      });
      throw error;
    }
  },
});
