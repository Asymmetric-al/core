import {
  mutationMediaType,
  UNSUPPORTED_MUTATION_TYPE,
} from "@asym/auth/request-headers";
import config from "@payload-config";
import { GRAPHQL_POST, REST_OPTIONS } from "@payloadcms/next/routes";

import { sameOriginWrites } from "@/src/cms/web-studio-api-route";

const graphqlPost = GRAPHQL_POST(config);

// Payload's GraphQL route answers at `${routes.api}${routes.graphQL}`, now
// `/web-studio/api/graphql`. WP6 removes it (plan 6.3); until then a POST,
// which can be a mutation, must be same-origin like every other write here,
// and JSON: Payload builds its request and parses a multipart body before
// graphql-http refuses anything else, and a body can arrive untyped over
// HTTP/2 or HTTP/3, so the route refuses first, in the Studio envelope
// (AL-2677, re-check H2). No Web Studio screen calls this route.
export const POST = sameOriginWrites<unknown>(async (request) =>
  mutationMediaType(request) === "application/json"
    ? graphqlPost(request)
    : Response.json(
        { errors: [{ message: UNSUPPORTED_MUTATION_TYPE }] },
        { status: 415, headers: { "cache-control": "no-store" } },
      ),
);
export const OPTIONS = REST_OPTIONS(config);
