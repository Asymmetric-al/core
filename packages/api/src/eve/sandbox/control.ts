import {
  createServiceEveAuditIdentity,
  createEveAuditStore,
  traceEveAuditEvent,
} from "../audit";
import { loadEveGovernanceSnapshot } from "../governance";
import {
  evaluateEveSandboxNetwork,
  fingerprintEveSandboxCommand,
} from "./guardrails";

import type { EveSandboxNetworkDecision } from "./guardrails";
import type { EveAuditResult } from "../audit/types";

export async function resolveEveSandboxNetworkDecision(): Promise<EveSandboxNetworkDecision> {
  const { getAdminClient } = await import("@asym/database/supabase/admin");
  const admin = getAdminClient();
  if (!admin.client) {
    return evaluateEveSandboxNetwork(null);
  }

  try {
    const snapshot = await loadEveGovernanceSnapshot({
      supabaseAdmin: admin.client,
    });
    return evaluateEveSandboxNetwork(snapshot);
  } catch {
    return evaluateEveSandboxNetwork(null);
  }
}

export async function recordEveSandboxAction(input: {
  action: "command" | "network_policy" | "write_file";
  command?: string;
  /**
   * The decision that actually gated this action. Callers that already
   * resolved one must pass it so the audit record and the enforcement come
   * from a single governance snapshot; re-resolving here can attribute a
   * different snapshot, or an unrelated network rationale, to the record.
   */
  decision?: EveSandboxNetworkDecision;
  findings?: string[];
  result: EveAuditResult;
  runId: string;
  sessionId: string;
  target?: string;
}): Promise<boolean> {
  const { getAdminClient } = await import("@asym/database/supabase/admin");
  const admin = getAdminClient();
  if (!admin.client) {
    return false;
  }

  const decision = input.decision ?? (await resolveEveSandboxNetworkDecision());
  const commandFingerprint = input.command
    ? fingerprintEveSandboxCommand(input.command)
    : undefined;

  try {
    await traceEveAuditEvent({
      store: createEveAuditStore(admin.client),
      event: {
        action: `sandbox.${input.action}`,
        change: {
          commandFingerprint,
          findings: input.findings ?? [],
        },
        decision: {
          rationale: decision.reason,
          risk: "sandbox engineering with writable checkout and network egress",
          reversalOrFollowUp:
            "Pause the run and enable the sandbox networking kill switch.",
        },
        evidence: {
          commandFingerprint,
          sessionId: input.sessionId,
        },
        identity: createServiceEveAuditIdentity({
          initiatorId: input.sessionId,
          initiatorType: "system",
          serviceId: "eve-sandbox-worker",
        }),
        policy: {
          governanceStateVersion: decision.governanceStateVersion,
          id: "eve-sandbox-governance-v1",
          status: decision.allowed ? "ready" : decision.reason,
        },
        result: input.result,
        runId: input.runId,
        target: input.target,
        toolName: input.action === "write_file" ? "write_file" : "bash",
      },
    });
    return true;
  } catch {
    return false;
  }
}
