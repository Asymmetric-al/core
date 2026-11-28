import { serve, type RequestHandler } from "inngest/next";
import { NextRequest } from "next/server";

import { dispatchRecoveryScan } from "./functions/dispatch-recovery-scan";
import {
  donationSagaRecovery,
  donationSagaRecoveryScan,
} from "./functions/donation-saga-recovery";
import { inboundEmailProcessing } from "./functions/inbound-email-processing";
import { moneySchedule } from "./functions/money-schedule";
import {
  stripeEventProcessing,
  stripeEventRecoveryScan,
} from "./functions/stripe-event-processing";
import { workflowSmoke } from "./functions/workflow-smoke";
import { inngest } from "./inngest/client";
import {
  carriesReleaseProof,
  jobServePath,
  jobSyncConfigured,
  jobSyncOrigin,
} from "./sync-proof";

/**
 * Workflow function serving for the staff operations surface. The app route
 * (`apps/admin/app/api/inngest/route.ts`) re-exports these handlers and stays
 * thin per docs/guides/architecture/data-access-boundary.md.
 */
const functions = [
  workflowSmoke,
  dispatchRecoveryScan,
  donationSagaRecovery,
  donationSagaRecoveryScan,
  stripeEventProcessing,
  stripeEventRecoveryScan,
  inboundEmailProcessing,
  moneySchedule,
];

const servePath = jobServePath();
const serveOrigin = jobSyncOrigin(process.env);
const originRefused = jobSyncConfigured(process.env) && !serveOrigin;

const signed = serve({
  client: inngest,
  functions,
  servePath,
  ...(serveOrigin ? { serveOrigin } : {}),
  enableUnauthedSync: false,
});

const released = serveOrigin
  ? serve({
      client: inngest,
      functions,
      servePath,
      serveOrigin,
      enableUnauthedSync: true,
    })
  : null;

export const { GET, POST } = signed;

const unavailable = (code: string) =>
  Response.json(
    { code },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );

export const PUT: RequestHandler = async (request, context) => {
  if (originRefused) return unavailable("job_sync_origin_invalid");
  if (
    request.headers.has("x-inngest-signature") ||
    !carriesReleaseProof(request, process.env.VERCEL_AUTOMATION_BYPASS_SECRET)
  )
    return signed.PUT(request, context);
  if (!released || !serveOrigin) return unavailable("job_sync_origin_unset");
  return released.PUT(
    new NextRequest(new URL(servePath, serveOrigin), { method: "PUT" }),
    context,
  );
};
