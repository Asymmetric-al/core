import config from "@payload-config";
import { GRAPHQL_POST, REST_OPTIONS } from "@payloadcms/next/routes";

import { sameOriginWrites } from "@/src/cms/web-studio-api-route";

// Payload's GraphQL route answers at `${routes.api}${routes.graphQL}`, now
// `/web-studio/api/graphql`. WP6 removes it (plan 6.3); until then a POST,
// which can be a mutation, must be same-origin like every other write here.
export const POST = sameOriginWrites(GRAPHQL_POST(config));
export const OPTIONS = REST_OPTIONS(config);
