import { NextResponse } from "next/server";

import { eveKillSwitchMutationSchema, setEveKillSwitch } from "./control";
import { loadEveGovernanceAdminView } from "./store";
import { toErrorResponse } from "../../shared/http-errors";
import { withOperation } from "../../shared/with-operation";
import { createAdminEveAuditIdentity } from "../audit/identity";
import { traceEveAuditEvent } from "../audit/record";
import { createEveAuditStore, loadRecentEveAuditEvents } from "../audit/store";

export const GET = withOperation(
  async ({ supabaseAdmin, requestId }) => {
    try {
      const [governance, auditHistory] = await Promise.all([
        loadEveGovernanceAdminView({ supabaseAdmin }),
        loadRecentEveAuditEvents({ supabaseAdmin }),
      ]);
      return NextResponse.json({ ...governance, auditHistory, requestId });
    } catch (error) {
      return toErrorResponse(
        error,
        "Failed to load Eve governance state.",
        requestId,
      );
    }
  },
  { roles: ["admin", "super_admin"] },
);

export const POST = withOperation(
  async ({ auth, supabaseAdmin, requestId }) => {
    try {
      const governance = await loadEveGovernanceAdminView({ supabaseAdmin });
      const auditEvent = await traceEveAuditEvent({
        store: createEveAuditStore(supabaseAdmin),
        event: {
          identity: createAdminEveAuditIdentity(auth),
          policy: {
            id: "eve-governance-kernel",
            status: governance.system.policyStatus,
            governanceStateVersion: governance.system.stateVersion,
          },
          action: "audit.tracer.verify",
          target: "eve:global",
          result: "succeeded",
          modelRole: "not_used",
          evidence: {
            emergencyOff: governance.system.emergencyOff,
            policyStatus: governance.system.policyStatus,
            releaseEnabled: governance.system.releaseEnabled,
          },
          change: { stateChanged: false },
          decision: {
            rationale:
              "An authorized admin explicitly verified the Eve audit tracer.",
            risk: "Read-only inspection; no operational state changed.",
            reversalOrFollowUp:
              "No reversal is required. Investigate any unsafe status before enabling autonomy.",
          },
          debug: {
            requestId,
            source: "admin_eve_audit_tracer_route",
          },
        },
      });
      return NextResponse.json({ auditEvent, requestId }, { status: 201 });
    } catch (error) {
      return toErrorResponse(
        error,
        "Failed to verify the Eve audit tracer.",
        requestId,
      );
    }
  },
  { roles: ["admin", "super_admin"] },
);

export const PATCH = withOperation(
  async ({ auth, request, supabaseAdmin, requestId }) => {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Request body must be valid JSON.", requestId },
        { status: 400 },
      );
    }

    const parsed = eveKillSwitchMutationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid Eve kill-switch request.", requestId },
        { status: 400 },
      );
    }

    try {
      const mutation = await setEveKillSwitch({
        supabaseAdmin,
        identity: createAdminEveAuditIdentity(auth),
        ...parsed.data,
      });
      const [governance, auditHistory] = await Promise.all([
        loadEveGovernanceAdminView({ supabaseAdmin }),
        loadRecentEveAuditEvents({ supabaseAdmin }),
      ]);

      return NextResponse.json({
        ...governance,
        auditHistory,
        mutation,
        requestId,
      });
    } catch (error) {
      return toErrorResponse(
        error,
        "Failed to update the Eve kill switch.",
        requestId,
      );
    }
  },
  { roles: ["admin", "super_admin"] },
);
