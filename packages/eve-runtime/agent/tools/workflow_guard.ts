import { executeEveRuntimePolicyConsult } from "@asym/api/eve/approval-budget";
import {
  createEveAuditStore,
  createSessionEveAuditIdentity,
  traceEveAuditEvent,
} from "@asym/api/eve/audit";
import {
  cancelEveDynamicWorkflow,
  createEveDynamicWorkflowStepInput,
  evaluateEveDynamicWorkflowControl,
  prepareEveDynamicWorkflow,
  resumeEveDynamicWorkflow,
  validateEveDynamicWorkflowPlan,
} from "@asym/api/eve/dynamic-workflow";
import { loadEveGovernanceSnapshot } from "@asym/api/eve/governance";
import {
  hasBlockingSandboxFinding,
  scanEveSandboxPath,
} from "@asym/api/eve/sandbox";
import {
  createEveSharedContextStore,
  hasBlockingEveSharedContextConflict,
  readEveSharedContext,
} from "@asym/api/eve/shared-context";
import { defineDynamic, defineTool } from "eve/tools";
import { z } from "zod";

import {
  claimEveSpecialistSession,
  resolveEveSpecialistIdentity,
} from "../../src/specialists/identity";
import { eveDynamicWorkflowState } from "../lib/workflow-state";

const workflowGuardInput = z.discriminatedUnion("operation", [
  z
    .object({
      operation: z.literal("prepare"),
      plan: z.unknown(),
    })
    .strict(),
  z
    .object({
      operation: z.literal("resume"),
      planDigest: z.string().regex(/^[a-f0-9]{64}$/u),
    })
    .strict(),
  z.object({ operation: z.literal("cancel") }).strict(),
  z.object({ operation: z.literal("status") }).strict(),
]);

async function auditGuardEvent(input: {
  action: string;
  auth: Parameters<typeof resolveEveSpecialistIdentity>[0];
  evidence: unknown;
  result: "blocked" | "failed" | "started" | "succeeded";
  rootSessionId: string;
  target: string;
}) {
  const { getAdminClient } = await import("@asym/database/supabase/admin");
  const admin = getAdminClient();
  if (!admin.client) throw new Error("Dynamic workflow audit is unavailable.");
  const identity = resolveEveSpecialistIdentity(input.auth);
  await claimEveSpecialistSession({
    identity,
    sessionId: input.rootSessionId,
    supabaseAdmin: admin.client,
  });
  await traceEveAuditEvent({
    store: createEveAuditStore(admin.client),
    event: {
      identity: createSessionEveAuditIdentity(identity),
      policy: { id: "eve-dynamic-workflow-v1", status: input.result },
      action: input.action,
      target: input.target,
      result: input.result,
      toolName: "workflow_guard",
      evidence: input.evidence,
      change: "Only durable workflow coordination state changed.",
      decision: {
        rationale:
          "The app-owned dynamic workflow boundary recorded a safe lifecycle transition.",
      },
    },
  });
}

function approvalForInput(toolInput: unknown) {
  const parsed = workflowGuardInput.safeParse(toolInput);
  if (!parsed.success) {
    return { type: "denied" as const, reason: "Invalid workflow guard input." };
  }
  if (parsed.data.operation === "resume") return "user-approval" as const;
  if (parsed.data.operation !== "prepare") return "not-applicable" as const;
  const record = parsed.data.plan;
  if (typeof record !== "object" || record === null || !("scope" in record)) {
    return { type: "denied" as const, reason: "Invalid workflow plan." };
  }
  const scope = record.scope;
  if (
    typeof scope !== "object" ||
    scope === null ||
    !("targetPaths" in scope) ||
    !Array.isArray(scope.targetPaths) ||
    !scope.targetPaths.every((path) => typeof path === "string")
  ) {
    return { type: "denied" as const, reason: "Invalid workflow scope." };
  }
  const scans = scope.targetPaths.map((path) => scanEveSandboxPath(path));
  if (scans.some(hasBlockingSandboxFinding)) {
    return {
      type: "denied" as const,
      reason: "Sensitive or out-of-workspace paths cannot enter a workflow.",
    };
  }
  const steps =
    "steps" in record && Array.isArray(record.steps) ? record.steps : [];
  const highRisk = steps.some(
    (step) =>
      typeof step === "object" &&
      step !== null &&
      "declaredRisk" in step &&
      step.declaredRisk === "high",
  );
  return scans.some((scan) => scan.requiresApproval) || highRisk
    ? ("user-approval" as const)
    : ("not-applicable" as const);
}

async function loadBoundary(input: {
  auth: Parameters<typeof resolveEveSpecialistIdentity>[0];
  rootSessionId: string;
  targetKey: string;
}) {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  ) {
    throw new Error("Dynamic workflow governance is unavailable.");
  }
  const { getAdminClient } = await import("@asym/database/supabase/admin");
  const admin = getAdminClient();
  if (!admin.client)
    throw new Error("Dynamic workflow governance is unavailable.");
  const identity = resolveEveSpecialistIdentity(input.auth);
  await claimEveSpecialistSession({
    identity,
    sessionId: input.rootSessionId,
    supabaseAdmin: admin.client,
  });
  const [governance, context, policy] = await Promise.all([
    loadEveGovernanceSnapshot({ supabaseAdmin: admin.client }),
    readEveSharedContext({
      identity,
      rootSessionId: input.rootSessionId,
      store: createEveSharedContextStore(admin.client),
    }),
    executeEveRuntimePolicyConsult({
      actionId: "engineering.dynamic_workflow.execute",
      identity,
      sessionId: input.rootSessionId,
      supabaseAdmin: admin.client,
      targetKey: input.targetKey,
    }),
  ]);
  const fieldPaths = context.conflicts.map((conflict) => conflict.fieldPath);
  return {
    governance,
    policy,
    hasBlockingContextConflict: hasBlockingEveSharedContextConflict({
      conflicts: context.conflicts,
      fieldPaths,
    }),
  };
}

export default defineDynamic({
  events: {
    "step.started": (_event, context) => {
      const auth = context.session.auth.current;
      if (
        auth?.authenticator !== "github-webhook" ||
        auth.attributes.repository !== "Asymmetric-al/core"
      ) {
        return null;
      }
      return defineTool({
        description:
          "Prepare, inspect, resume, or cancel one governed dynamic specialist workflow. Call prepare and receive a ticket before using Workflow.",
        inputSchema: workflowGuardInput,
        approval({ toolInput }) {
          return approvalForInput(toolInput);
        },
        async execute(request, toolContext) {
          const rootSessionId = toolContext.session.id;
          if (request.operation === "status")
            return eveDynamicWorkflowState.get();
          if (request.operation === "cancel") {
            const current = eveDynamicWorkflowState.get();
            const cancelled = cancelEveDynamicWorkflow(current);
            eveDynamicWorkflowState.update(() => cancelled);
            await auditGuardEvent({
              action: "dynamic_workflow.cancelled",
              auth,
              evidence: { priorStatus: current.status },
              result: "succeeded",
              rootSessionId,
              target: `session:${rootSessionId}`,
            });
            return cancelled;
          }
          if (request.operation === "prepare") {
            let validated: ReturnType<typeof validateEveDynamicWorkflowPlan>;
            try {
              validated = validateEveDynamicWorkflowPlan({
                plan: request.plan,
                rootSessionId,
              });
            } catch (error) {
              await auditGuardEvent({
                action: "dynamic_workflow.validation",
                auth,
                evidence: {
                  reason: error instanceof Error ? error.name : "invalid_plan",
                },
                result: "blocked",
                rootSessionId,
                target: `session:${rootSessionId}`,
              });
              throw error;
            }
            const boundary = await loadBoundary({
              auth,
              rootSessionId,
              targetKey: `workflow:${validated.digest.slice(0, 48)}`,
            });
            const decision = evaluateEveDynamicWorkflowControl({
              approvalGranted: validated.requiresApproval,
              currentGovernance: boundary.governance,
              hasBlockingContextConflict: boundary.hasBlockingContextConflict,
              policy: boundary.policy,
              preparedGovernanceStateVersion:
                validated.plan.policySnapshot.governanceStateVersion,
              requiresApproval: validated.requiresApproval,
            });
            if (!decision.allowed) {
              throw new Error(`Dynamic workflow paused: ${decision.reason}.`);
            }
            const prepared = prepareEveDynamicWorkflow({
              plan: validated.plan,
              planDigest: validated.digest,
              ticketId: crypto.randomUUID(),
              expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
            });
            eveDynamicWorkflowState.update(() => prepared);
            await auditGuardEvent({
              action: "dynamic_workflow.prepared",
              auth,
              evidence: {
                planDigest: prepared.planDigest,
                stepCount: validated.plan.steps.length,
              },
              result: "succeeded",
              rootSessionId,
              target: `workflow:${validated.plan.workflowId}`,
            });
            return {
              status: prepared.status,
              ticketId: prepared.ticketId,
              planDigest: prepared.planDigest,
              expiresAt: prepared.expiresAt,
              topologicalOrder: validated.topologicalOrder,
              authorizedCalls: validated.plan.steps.map((step) => ({
                stepId: step.id,
                specialistId: step.specialistId,
                dependsOn: step.dependsOn,
                input: createEveDynamicWorkflowStepInput({
                  plan: validated.plan,
                  step,
                }),
              })),
            };
          }

          const current = eveDynamicWorkflowState.get();
          if (!current.plan || !current.planDigest) {
            throw new Error(
              "No paused dynamic workflow is available to resume.",
            );
          }
          const validated = validateEveDynamicWorkflowPlan({
            plan: current.plan,
            rootSessionId,
          });
          if (request.planDigest !== validated.digest) {
            throw new Error(
              "Dynamic workflow plan digest changed before resume.",
            );
          }
          const boundary = await loadBoundary({
            auth,
            rootSessionId,
            targetKey: `workflow:${validated.digest.slice(0, 48)}`,
          });
          const decision = evaluateEveDynamicWorkflowControl({
            approvalGranted: true,
            currentGovernance: boundary.governance,
            hasBlockingContextConflict: boundary.hasBlockingContextConflict,
            policy: boundary.policy,
            preparedGovernanceStateVersion:
              current.preparedGovernanceStateVersion,
            requiresApproval: true,
          });
          if (!decision.allowed || !boundary.governance) {
            throw new Error(
              `Dynamic workflow remains paused: ${decision.reason}.`,
            );
          }
          const resumed = resumeEveDynamicWorkflow({
            state: current,
            planDigest: request.planDigest,
            currentGovernanceStateVersion: boundary.governance.stateVersion,
          });
          eveDynamicWorkflowState.update(() => resumed);
          await auditGuardEvent({
            action: "dynamic_workflow.resumed",
            auth,
            evidence: { planDigest: request.planDigest },
            result: "succeeded",
            rootSessionId,
            target: `workflow:${validated.plan.workflowId}`,
          });
          return resumed;
        },
      });
    },
  },
});
