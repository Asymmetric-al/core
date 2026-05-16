/** Substrings seen in Next / Payload error surfaces when Postgres is unreachable. */
export const PAYLOAD_DB_FAILURE_MARKERS = [
  "cannot connect to Postgres",
  "payloadInitError",
  "ECONNREFUSED",
  "ENETUNREACH",
  "Payload database configuration",
] as const;

export function textMatchesPayloadDbFailure(text: string): boolean {
  return PAYLOAD_DB_FAILURE_MARKERS.some((m) => text.includes(m));
}
