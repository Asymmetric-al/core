import { getAdminClient } from "@asym/database/supabase/admin";
import { serverEnv } from "@asym/env";
import { NextResponse } from "next/server";

import { createSupabaseCrmSyncStore } from "../../../crm/sync/store";
import { receiveTwentyWebhook } from "../../../crm/webhooks/twenty";
import { revalidateAdminCrmCache } from "../../../shared/cache-tags";

import type { NextRequest } from "next/server";

function jsonResponse(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "cache-control": "no-store",
    },
  });
}

export async function POST(request: NextRequest) {
  const { client, error } = getAdminClient();
  if (!client) {
    return jsonResponse(
      {
        error: error || "Admin client unavailable",
      },
      503,
    );
  }

  const result = await receiveTwentyWebhook({
    env: serverEnv,
    headers: request.headers,
    rawBody: await request.text(),
    secret: serverEnv.TWENTY_WEBHOOK_SECRET,
    store: createSupabaseCrmSyncStore(client),
  });

  if (!result.ok) {
    return jsonResponse(
      {
        error: result.error,
        code: result.code,
      },
      result.status,
    );
  }

  if (result.status === "processed") {
    // Inbound Twenty changes mutate CRM projections; the webhook carries no
    // actor tenant context, so revalidate the domain-wide tags only.
    revalidateAdminCrmCache(null);
  }

  return jsonResponse({
    ok: true,
    duplicate: result.duplicate,
    eventId: result.eventId,
    status: result.status,
    ignoredReason: result.ignoredReason,
  });
}
