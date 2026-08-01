import {
  createEveAuditStore,
  createSessionEveAuditIdentity,
  traceEveAuditEvent,
} from "@asym/api/eve/audit";
import { EVE_SPECIALIST_CATALOG } from "@asym/api/eve/subagent-catalog";
import { defineHook } from "eve/hooks";

import {
  claimEveSpecialistSession,
  resolveEveSpecialistIdentity,
} from "../../src/specialists/identity";

async function auditSubagentEvent(input: {
  callId: string;
  childSessionId?: string;
  result: "started" | "succeeded";
  rootSessionId: string;
  sessionAuth: Parameters<typeof resolveEveSpecialistIdentity>[0];
  specialistId: string;
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
      runId: input.rootSessionId,
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
      },
    },
  });
}

/**
 * Audits root-to-specialist lifecycle events after Eve durably records them.
 * The hook intentionally omits child prompts and outputs from the audit row.
 */
export default defineHook({
  events: {
    async "subagent.called"(event, context) {
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
      await auditSubagentEvent({
        callId: event.data.callId,
        result: "succeeded",
        rootSessionId: context.session.id,
        sessionAuth: context.session.auth.current,
        specialistId: event.data.subagentName,
      });
    },
  },
});
