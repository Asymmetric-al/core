import config from "@payload-config";
import {
  REST_DELETE,
  REST_GET,
  REST_OPTIONS,
  REST_PATCH,
  REST_POST,
  REST_PUT,
} from "@payloadcms/next/routes";

import {
  claimedCallsOnly,
  sameOriginWrites,
} from "@/src/cms/web-studio-api-route";

// Payload's REST routes, under `/web-studio/api` (`routes.api`; plan 5.2).
// Writes must be same-origin (src/cms/web-studio-api-route.ts).
export const GET = claimedCallsOnly(REST_GET(config));
export const POST = claimedCallsOnly(sameOriginWrites(REST_POST(config)));
export const DELETE = claimedCallsOnly(sameOriginWrites(REST_DELETE(config)));
export const PATCH = claimedCallsOnly(sameOriginWrites(REST_PATCH(config)));
export const PUT = claimedCallsOnly(sameOriginWrites(REST_PUT(config)));
export const OPTIONS = claimedCallsOnly(REST_OPTIONS(config));
