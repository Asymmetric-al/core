import {
  createRequestSessionClient,
  requestCarriesSupabaseSession,
} from "./request-session-client";

/** The part of a Supabase client the check uses. */
export interface OperatorCheckClient {
  rpc(fn: string): PromiseLike<{
    data: unknown;
    error: { code?: string; message: string } | null;
  }>;
}

/**
 * The shared operator check (plan 5.4, 5.5; AL-2675 WP2c), run in the
 * database on the caller's own token: `public.platform_operator_session()`
 * passes a caller on the platform operator list whose session passed a second
 * factor (`aal2`), and refuses anyone else with 42501. Server code that acts
 * for an operator outside the database asks this first; the session's own
 * claims and the profile's role decide nothing.
 *
 * Returns false when the request carries no Supabase session, without asking
 * the database (it would arrive as `anon`, to whom the function is not
 * granted; review WC3), and when the database refuses. Returns true only when
 * the database returns the caller's own login. Any other failure throws, so a
 * broken check never admits anyone.
 */
export async function confirmPlatformOperator(input: {
  request: Request;
  userId: string;
  client?: OperatorCheckClient;
}): Promise<boolean> {
  if (!requestCarriesSupabaseSession(input.request)) return false;
  const client =
    input.client ??
    ((await createRequestSessionClient(
      input.request,
    )) as unknown as OperatorCheckClient);
  const { data, error } = await client.rpc("platform_operator_session");
  if (error) {
    if (error.code === "42501") return false;
    throw new Error(`The platform operator check failed: ${error.message}`);
  }
  const operatorId =
    data !== null && typeof data === "object" && "operator_id" in data
      ? (data as { operator_id: unknown }).operator_id
      : null;
  return typeof operatorId === "string" && operatorId === input.userId;
}
