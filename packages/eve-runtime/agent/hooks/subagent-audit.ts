import { executeEveRuntimePolicyConsult } from "@asym/api/eve/approval-budget";
import {
  createEveAuditStore,
  createSessionEveAuditIdentity,
  traceEveAuditEvent,
} from "@asym/api/eve/audit";
import {
  cancelEveDynamicWorkflow,
  authorizeEveDynamicWorkflowSubagentRequest,
  classifyEveDynamicWorkflowFailure,
  completeEveDynamicWorkflowStep,
  dispatchEveDynamicWorkflowStep,
  evaluateEveDynamicWorkflowControl,
  failEveDynamicWorkflowStep,
} from "@asym/api/eve/dynamic-workflow";
import { loadEveGovernanceSnapshot } from "@asym/api/eve/governance";
import {
  createEveSharedContextStore,
  hasBlockingEveSharedContextConflict,
  readEveSharedContext,
} from "@asym/api/eve/shared-context";
import { EVE_SPECIALIST_CATALOG } from "@asym/api/eve/subagent-catalog";
import { defineHook } from "eve/hooks";

import {
  claimEveSpecialistSession,
  resolveEveSpecialistIdentity,
} from "../../src/specialists/identity";
import { eveDynamicWorkflowState } from "../lib/workflow-state";

import type { EveDynamicWorkflowFailureSignal } from "@asym/api/eve/dynamic-workflow";
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

async function runtimeBoundary(input: {
  rootSessionId: string;
  sessionAuth: Parameters<typeof resolveEveSpecialistIdentity>[0];
  specialistId: string;
}): Promise<{
  admin: AdminSupabaseClient;
  identity: ReturnType<typeof resolveEveSpecialistIdentity>;
}> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  ) {
    throw new Error("Dynamic workflow governance is unavailable.");
  }
  const identity = resolveEveSpecialistIdentity(input.sessionAuth);
  const { getAdminClient } = await import("@asym/database/supabase/admin");
  const admin = getAdminClient();
  if (!admin.client)
    throw new Error("Dynamic workflow governance is unavailable.");
  await claimEveSpecialistSession({
    identity,
    sessionId: input.rootSessionId,
    supabaseAdmin: admin.client,
  });
  const [governance, policy, sharedContext] = await Promise.all([
    loadEveGovernanceSnapshot({ supabaseAdmin: admin.client }),
    executeEveRuntimePolicyConsult({
      actionId: "engineering.subagent.delegate",
      identity,
      sessionId: input.rootSessionId,
      supabaseAdmin: admin.client,
      targetKey: `subagent:${input.specialistId}`,
    }),
    readEveSharedContext({
      identity,
      rootSessionId: input.rootSessionId,
      store: createEveSharedContextStore(admin.client),
    }),
  ]);
  const fieldPaths = sharedContext.conflicts.map(
    (conflict) => conflict.fieldPath,
  );
  const decision = evaluateEveDynamicWorkflowControl({
    approvalGranted: true,
    currentGovernance: governance,
    hasBlockingContextConflict: hasBlockingEveSharedContextConflict({
      conflicts: sharedContext.conflicts,
      fieldPaths,
    }),
    policy,
    preparedGovernanceStateVersion:
      eveDynamicWorkflowState.get().preparedGovernanceStateVersion,
    requiresApproval: false,
  });
  if (!decision.allowed) {
    throw new Error(`Dynamic workflow dispatch paused: ${decision.reason}.`);
  }
  return { admin: admin.client, identity };
}

async function auditSubagentEvent(input: {
  callId: string;
  childSessionId?: string;
  result: "failed" | "started" | "succeeded";
  rootSessionId: string;
  sessionAuth: Parameters<typeof resolveEveSpecialistIdentity>[0];
  specialistId: string;
  risk?: string;
}) {
  if (
    !Object.prototype.hasOwnProperty.call(
      EVE_SPECIALIST_CATALOG,
      input.specialistId,
    ) ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  ) {
    return;
  }
  const identity = resolveEveSpecialistIdentity(input.sessionAuth);
  const { getAdminClient } = await import("@asym/database/supabase/admin");
  const admin = getAdminClient();
  if (!admin.client) return;
  await claimEveSpecialistSession({
    identity,
    sessionId: input.rootSessionId,
    supabaseAdmin: admin.client,
  });
  await traceEveAuditEvent({
    store: createEveAuditStore(admin.client),
    event: {
      identity: createSessionEveAuditIdentity(identity),
      policy: { id: "engineering.subagent.delegate", status: "consulted" },
      action: "subagent.delegate",
      target: `subagent:${input.specialistId}`,
      result: input.result,
      subagentName: input.specialistId,
      modelRole: `specialist.${input.specialistId}`,
      evidence: {
        callId: input.callId,
        childSessionId: input.childSessionId,
      },
      change: `Delegation ${input.result}.`,
      decision: {
        rationale:
          "Eve recorded the declared specialist lifecycle without changing its authority.",
        risk: input.risk,
      },
    },
  });
}

function failureSignals(value: unknown): EveDynamicWorkflowFailureSignal[] {
  const serialized = JSON.stringify(value) ?? String(value);
  const text = serialized.toLocaleLowerCase("en-US");
  const signals: EveDynamicWorkflowFailureSignal[] = ["step_error"];
  if (/scope|outside.*path|workspace/iu.test(text))
    signals.push("scope_violation");
  if (/secret|credential|private key|token/iu.test(text))
    signals.push("secret_exposure");
  if (/tenant/iu.test(text)) signals.push("tenant_violation");
  if (/identity|actor|ownership|auth/iu.test(text))
    signals.push("identity_violation");
  if (/policy|governance|kill.switch/iu.test(text))
    signals.push("policy_bypass");
  if (/budget|rate.limit/iu.test(text)) signals.push("budget_exhausted");
  return signals;
}

/**
 * Governs every prepared-workflow dispatch after Eve durably records the call
 * and before downstream execution continues. Prompts and outputs never enter
 * the audit row.
 */
export default defineHook({
  events: {
    async "actions.requested"(event, context) {
      const current = eveDynamicWorkflowState.get();
      for (const action of event.data.actions) {
        if (
          action.kind === "tool-call" &&
          action.toolName === "Workflow" &&
          !["prepared", "running"].includes(current.status)
        ) {
          throw new Error(
            "Workflow requires a current app-owned workflow ticket.",
          );
        }
        if (action.kind === "subagent-call") {
          if (current.status === "paused") {
            throw new Error("Dynamic workflow is paused pending human review.");
          }
          authorizeEveDynamicWorkflowSubagentRequest({
            state: current,
            specialistId: action.subagentName,
            requestInput: action.input,
          });
          await runtimeBoundary({
            rootSessionId: context.session.id,
            sessionAuth: context.session.auth.current,
            specialistId: action.subagentName,
          });
        }
      }
    },
    async "subagent.called"(event, context) {
      const current = eveDynamicWorkflowState.get();
      if (["prepared", "running", "paused"].includes(current.status)) {
        if (current.status === "paused") {
          throw new Error("Dynamic workflow is paused pending human review.");
        }
        eveDynamicWorkflowState.update(
          (latest) =>
            dispatchEveDynamicWorkflowStep({
              state: latest,
              callId: event.data.callId,
              specialistId: event.data.name,
            }).state,
        );
      }
      await auditSubagentEvent({
        callId: event.data.callId,
        childSessionId: event.data.childSessionId,
        result: "started",
        rootSessionId: context.session.id,
        sessionAuth: context.session.auth.current,
        specialistId: event.data.name,
      });
    },
    async "subagent.completed"(event, context) {
      eveDynamicWorkflowState.update((state) =>
        completeEveDynamicWorkflowStep({
          state,
          callId: event.data.callId,
        }),
      );
      await auditSubagentEvent({
        callId: event.data.callId,
        result: "succeeded",
        rootSessionId: context.session.id,
        sessionAuth: context.session.auth.current,
        specialistId: event.data.subagentName,
      });
    },
    async "subagent.event"(event, context) {
      const childEvent = event.data.event;
      if (
        childEvent.type !== "step.failed" &&
        childEvent.type !== "turn.failed" &&
        childEvent.type !== "session.failed"
      ) {
        return;
      }
      const current = eveDynamicWorkflowState.get();
      const stepEntry = current.plan?.steps.find((step) =>
        current.steps[step.id]?.callIds.includes(event.data.callId),
      );
      const stepState = stepEntry ? current.steps[stepEntry.id] : undefined;
      if (!stepEntry || !stepState) return;
      const assessment = classifyEveDynamicWorkflowFailure({
        attempts: stepState.attempts,
        maxAttempts: stepEntry.maxAttempts,
        failurePolicy: stepEntry.failurePolicy,
        signals: failureSignals(childEvent),
      });
      eveDynamicWorkflowState.update((state) =>
        failEveDynamicWorkflowStep({
          state,
          callId: event.data.callId,
          assessment,
        }),
      );
      await auditSubagentEvent({
        callId: event.data.callId,
        result: "failed",
        rootSessionId: context.session.id,
        sessionAuth: context.session.auth.current,
        specialistId: event.data.subagentName,
        risk: assessment.risk,
      });
    },
    async "turn.cancelled"(_event, context) {
      const current = eveDynamicWorkflowState.get();
      if (["prepared", "running", "paused"].includes(current.status)) {
        eveDynamicWorkflowState.update(cancelEveDynamicWorkflow);
        if (
          process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
          process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
        ) {
          const identity = resolveEveSpecialistIdentity(
            context.session.auth.current,
          );
          const { getAdminClient } =
            await import("@asym/database/supabase/admin");
          const admin = getAdminClient();
          if (admin.client) {
            await claimEveSpecialistSession({
              identity,
              sessionId: context.session.id,
              supabaseAdmin: admin.client,
            });
            await traceEveAuditEvent({
              store: createEveAuditStore(admin.client),
              event: {
                identity: createSessionEveAuditIdentity(identity),
                policy: {
                  id: "eve-dynamic-workflow-v1",
                  status: "cancelled",
                },
                action: "dynamic_workflow.turn_cancelled",
                target: `session:${context.session.id}`,
                result: "succeeded",
                evidence: { priorStatus: current.status },
                change: "The active workflow state was cancelled.",
                decision: {
                  rationale:
                    "A durable Eve turn cancellation stopped further workflow dispatch.",
                },
              },
            });
          }
        }
      }
    },
  },
});
