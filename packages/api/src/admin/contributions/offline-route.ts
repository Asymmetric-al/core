import { NextResponse } from "next/server";

import { createOfflineEntryDependencies } from "./offline-dependencies";
import { recordOfflineContribution } from "./offline-entry";
import { offlineContributionSchema } from "../../schemas/contributions-offline";
import { ensureJsonBody, toErrorResponse } from "../../shared/http-errors";
import {
  withOperation,
  type OperationContext,
} from "../../shared/with-operation";
import { assertContributionPermission } from "../contribution-operations/permissions";

/**
 * POST /api/admin/contributions/offline — record an offline gift (Contributions Hub).
 * Source: DONOR_ANONYMITY_GUEST_GIVING_SPEC §6, §9.3.
 *
 * Thin transport around the tested pieces:
 *   1. coarse role gate (withOperation roles) + fine capability gate
 *      (`finance:manage_contributions`);
 *   2. §9.3 contract validation (`offlineContributionSchema`) — the authoritative
 *      server gate, re-checking whatever the form already validated client-side;
 *   3. the dependency-injected orchestration (`recordOfflineContribution`), which
 *      enforces the §6 invariants (unknown → no donor / null / not-receiptable;
 *      known → resolved donor; exactly one audit event).
 *
 * The DB side-effects are supplied by {@link createOfflineEntryDependencies},
 * which is the Gate-8 boundary — see offline-dependencies.ts. Until the Track B
 * §8.1 migration + enum extension land and a maintainer binds those deps, the
 * route validates + orchestrates and then surfaces a precise 501 at persistence,
 * rather than writing gift/money truth blind.
 */
export async function handleOfflineContribution(
  ctx: Pick<
    OperationContext,
    "request" | "supabaseAdmin" | "auth" | "requestId"
  >,
  createDeps: typeof createOfflineEntryDependencies = createOfflineEntryDependencies,
): Promise<NextResponse> {
  const { request, supabaseAdmin, auth, requestId } = ctx;
  try {
    assertContributionPermission(auth, "finance:manage_contributions");

    const input = offlineContributionSchema.parse(
      await ensureJsonBody(request),
    );

    const result = await recordOfflineContribution({
      input,
      actor: { tenantId: auth.tenantId, actorProfileId: auth.profileId },
      deps: createDeps(supabaseAdmin),
    });

    return NextResponse.json({ result, requestId }, { status: 201 });
  } catch (error) {
    return toErrorResponse(
      error,
      "Failed to record offline contribution.",
      requestId,
    );
  }
}

export const POST = withOperation((ctx) => handleOfflineContribution(ctx), {
  roles: ["staff", "admin", "super_admin"],
});
