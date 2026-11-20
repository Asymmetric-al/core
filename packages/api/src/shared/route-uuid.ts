import { ApiHttpError } from "./api-http-error";

const routeUuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function requireRouteUuid(value: string): string {
  if (!routeUuid.test(value)) throw new ApiHttpError(404, "Not found");
  return value;
}
