import {
  assertEveSessionOwnership,
  claimEveSessionOwnership,
  createServiceEveSessionIdentity,
  identityFromEveSessionAuthSnapshot,
  type EveSessionAuthSnapshot,
  type EveSessionIdentity,
} from "@asym/api/eve/session-ownership";

import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;

export function resolveEveSpecialistIdentity(
  snapshot: EveSessionAuthSnapshot | null,
): EveSessionIdentity {
  const adminIdentity = identityFromEveSessionAuthSnapshot(snapshot);
  if (adminIdentity) return adminIdentity;

  const tenantId = process.env.EVE_GITHUB_TENANT_ID?.trim();
  const serviceId =
    process.env.EVE_GITHUB_APP_SLUG?.trim() ||
    process.env.GITHUB_APP_SLUG?.trim() ||
    "eve-asymmetric[bot]";
  if (
    snapshot?.authenticator !== "github-webhook" ||
    !tenantId ||
    !UUID_PATTERN.test(tenantId)
  ) {
    throw new Error("Eve specialist identity could not be verified.");
  }
  return createServiceEveSessionIdentity({
    initiatorId: snapshot.principalId,
    initiatorType: "system",
    serviceId,
    tenantId,
  });
}

export async function assertEveSpecialistRunOwnership(input: {
  identity: EveSessionIdentity;
  rootSessionId: string;
  supabaseAdmin: AdminSupabaseClient;
}): Promise<void> {
  await assertEveSessionOwnership({
    identity: input.identity,
    sessionId: input.rootSessionId,
    supabaseAdmin: input.supabaseAdmin,
  });
}

export async function claimEveSpecialistSession(input: {
  identity: EveSessionIdentity;
  sessionId: string;
  supabaseAdmin: AdminSupabaseClient;
}): Promise<void> {
  await claimEveSessionOwnership({
    identity: input.identity,
    sessionId: input.sessionId,
    supabaseAdmin: input.supabaseAdmin,
  });
}
