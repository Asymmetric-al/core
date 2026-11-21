import config from "@payload-config";
import {
  REST_DELETE,
  REST_GET,
  REST_OPTIONS,
  REST_PATCH,
  REST_POST,
  REST_PUT,
} from "@payloadcms/next/routes";

import { sameOriginWrites } from "@/src/cms/web-studio-api-route";

// Payload's REST routes, under `/web-studio/api` (`routes.api`; plan 5.2).
// Writes must be same-origin (src/cms/web-studio-api-route.ts).
export const GET = REST_GET(config);
export const POST = sameOriginWrites(REST_POST(config));
export const DELETE = sameOriginWrites(REST_DELETE(config));
export const PATCH = sameOriginWrites(REST_PATCH(config));
export const PUT = sameOriginWrites(REST_PUT(config));
export const OPTIONS = REST_OPTIONS(config);
