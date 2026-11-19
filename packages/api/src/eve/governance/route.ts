import { NextResponse } from "next/server";

import { eveKillSwitchMutationSchema, setEveKillSwitch } from "./control";
import { loadEveGovernanceAdminView } from "./store";
import { ensureJsonBody, toErrorResponse } from "../../shared/http-errors";
import { withOperation } from "../../shared/with-operation";
import { traceEveControlDecision } from "../audit/control-decision";
import { createAdminEveAuditIdentity } from "../audit/identity";
import { loadRecentEveAuditEvents } from "../audit/store";

export const GET = withOperation(
  async ({ auth, supabaseAdmin, requestId, isPlatformOperator }) => {
    try {
      // A platform operator sees every tenant's audit history (AL-2675 WP2c:
      // the shared operator check, not the super_admin role name).
      const operator = await isPlatformOperator();
      const [governance, auditHistory] = await Promise.all([
        loadEveGovernanceAdminView({ supabaseAdmin }),
        loadRecentEveAuditEvents(
          operator
            ? { supabaseAdmin, tenantId: null }
            : { auth, supabaseAdmin, tenantId: auth.tenantId },
        ),
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
  { tenantAdministrator: true },
);

export const POST = withOperation(
  async ({ auth, supabaseAdmin, requestId }) => {
    try {
      const governance = await loadEveGovernanceAdminView({ supabaseAdmin });
      const auditEvent = await traceEveControlDecision({
        supabaseAdmin,
        identity: createAdminEveAuditIdentity(auth),
        policy: {
          id: "eve-governance-kernel",
          status: governance.system.policyStatus,
          governanceStateVersion: governance.system.stateVersion,
        },
        action: "audit.tracer.verify",
        target: "eve:global",
        result: "succeeded",
        evidence: {
          emergencyOff: governance.system.emergencyOff,
          policyStatus: governance.system.policyStatus,
          releaseEnabled: governance.system.releaseEnabled,
        },
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
  { tenantAdministrator: true },
);

export const PATCH = withOperation(
  async ({ auth, request, supabaseAdmin, requestId }) => {
    try {
      // Only a confirmed platform operator reaches this handler (the gate
      // below), and the kill switch is global.
      const mutation = await setEveKillSwitch({
        supabaseAdmin,
        identity: createAdminEveAuditIdentity(auth, { platformOperator: true }),
        ...eveKillSwitchMutationSchema.parse(await ensureJsonBody(request)),
      });
      const [governance, auditHistory] = await Promise.all([
        loadEveGovernanceAdminView({ supabaseAdmin }),
        loadRecentEveAuditEvents({ supabaseAdmin, tenantId: null }),
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
  { platformOperator: true },
);
