import { NextResponse } from "next/server";

import { eveKillSwitchMutationSchema, setEveKillSwitch } from "./control";
import { loadEveGovernanceAdminView } from "./store";
import { ensureJsonBody, toErrorResponse } from "../../shared/http-errors";
import { withPlatformOperation } from "../../shared/with-operation";
import { traceEveControlDecision } from "../audit/control-decision";
import { createAdminEveAuditIdentity } from "../audit/identity";
import { loadRecentEveAuditEvents } from "../audit/store";

export const GET = withPlatformOperation(
  async ({ auth, supabaseAdmin, requestId }) => {
    try {
      // The caller's own tenant's history, for a platform operator too: an
      // operator sees a tenant's data only through an ordinary membership
      // (AL-2675 WP2c, review WC1). A read across tenants belongs to the
      // operator area or to support access, not to this route.
      const [governance, auditHistory] = await Promise.all([
        loadEveGovernanceAdminView({ supabaseAdmin }),
        loadRecentEveAuditEvents({
          auth,
          supabaseAdmin,
          tenantId: auth.tenantId,
        }),
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

export const POST = withPlatformOperation(
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

export const PATCH = withPlatformOperation(
  async ({ auth, request, supabaseAdmin, requestId }) => {
    try {
      // Only a confirmed platform operator reaches this handler (the gate
      // below), and the kill switch is global.
      const mutation = await setEveKillSwitch({
        supabaseAdmin,
        identity: createAdminEveAuditIdentity(auth, { platformOperator: true }),
        ...eveKillSwitchMutationSchema.parse(await ensureJsonBody(request)),
      });
      // The switch is global; the history returned is the caller's own
      // tenant's, as on GET (review WC1).
      const [governance, auditHistory] = await Promise.all([
        loadEveGovernanceAdminView({ supabaseAdmin }),
        loadRecentEveAuditEvents({
          auth,
          supabaseAdmin,
          tenantId: auth.tenantId,
        }),
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
