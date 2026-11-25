/**
 * Query keys shared across Eve operations panels.
 *
 * The governance key lives here because several panels mutate the same
 * `eve_governance_state` row and must invalidate each other's cached view.
 */
export const EVE_GOVERNANCE_QUERY_KEY = ["admin", "eve", "governance"] as const;
