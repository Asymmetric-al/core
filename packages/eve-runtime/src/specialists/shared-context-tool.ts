import { executeEveRuntimePolicyConsult } from "@asym/api/eve/approval-budget";
import { createEveAuditStore } from "@asym/api/eve/audit";
import {
  createEveSharedContextStore,
  eveSharedContextResolutionSchema,
  eveSharedContextWriteSchema,
  readEveSharedContext,
  resolveEveSharedContextConflict,
  writeEveSharedContext,
} from "@asym/api/eve/shared-context";
import { defineTool } from "eve/tools";
import { z } from "zod";

import {
  claimEveSpecialistSession,
  resolveEveSpecialistIdentity,
} from "./identity";

import type { EveSpecialistId } from "@asym/api/eve/subagent-catalog";

const sharedContextInput = z.discriminatedUnion("operation", [
  z.object({ operation: z.literal("read") }).strict(),
  z
    .object({
      operation: z.literal("write"),
      write: eveSharedContextWriteSchema,
    })
    .strict(),
  z
    .object({
      operation: z.literal("resolve"),
      resolution: eveSharedContextResolutionSchema,
    })
    .strict(),
]);

/**
 * Creates the one app-owned collaboration tool available to every specialist.
 * Tenant, actor, run, session, and writer identity are intentionally absent
 * from its input schema and derived only from verified Eve runtime context.
 */
export function createEveSharedContextTool(specialistId: EveSpecialistId) {
  return defineTool({
    description:
      "Read, append safe attributed claims, or resolve a recorded disagreement in the current governed run context. Never include secrets, credentials, PII, payment data, raw production records, or unredacted logs.",
    inputSchema: sharedContextInput,
    async execute(request, context) {
      const rootSessionId =
        context.session.parent?.rootSessionId ?? context.session.id;
      const { getAdminClient } = await import("@asym/database/supabase/admin");
      const admin = getAdminClient();
      if (!admin.client) {
        throw new Error("Eve's shared-context store is unavailable.");
      }
      const identity = resolveEveSpecialistIdentity(
        context.session.auth.current,
      );
      await claimEveSpecialistSession({
        identity,
        sessionId: rootSessionId,
        supabaseAdmin: admin.client,
      });
      await claimEveSpecialistSession({
        identity,
        sessionId: context.session.id,
        supabaseAdmin: admin.client,
      });
      const store = createEveSharedContextStore(admin.client);
      if (request.operation === "read") {
        return readEveSharedContext({ identity, rootSessionId, store });
      }
      if (request.operation === "resolve") {
        return resolveEveSharedContextConflict({
          accountableRunId: rootSessionId,
          auditStore: createEveAuditStore(admin.client),
          authorize: ({ targetKey }) =>
            executeEveRuntimePolicyConsult({
              actionId: "engineering.shared_context.resolve",
              identity,
              sessionId: context.session.id,
              supabaseAdmin: admin.client!,
              targetKey,
            }),
          identity,
          resolution: request.resolution,
          store,
        });
      }
      return writeEveSharedContext({
        accountableRunId: rootSessionId,
        auditStore: createEveAuditStore(admin.client),
        authorize: ({ targetKey }) =>
          executeEveRuntimePolicyConsult({
            actionId: "engineering.shared_context.write",
            identity,
            sessionId: context.session.id,
            supabaseAdmin: admin.client!,
            targetKey,
          }),
        identity,
        rootSessionId,
        sessionId: context.session.id,
        store,
        write: request.write,
        writerSubagentId: specialistId,
      });
    },
  });
}
