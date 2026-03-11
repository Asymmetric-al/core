import { createGraphQLHandler } from "@asym/graphql";

const handler = createGraphQLHandler();

export const GET = handler.GET;
export const POST = handler.POST;
export const OPTIONS = handler.OPTIONS;
