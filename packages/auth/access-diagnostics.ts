import {
  isProtectedDeployment,
  resolveDeploymentEnvironment,
} from "@asym/env/target-env";

const DIAGNOSTICS = {
  no_role_class: { stage: "surface", outcome: "no_role_class" },
  membership_query_failed: {
    stage: "membership_read",
    outcome: "query_failed",
  },
  no_assignment: { stage: "membership_read", outcome: "no_assignment" },
  resolver_exception: { stage: "resolver", outcome: "exception" },
  role_denied: { stage: "role_gate", outcome: "role_denied" },
} as const;

const SAFE_ERROR_CODES = [
  "42501",
  "42P01",
  "42883",
  "PGRST106",
  "PGRST116",
  "PGRST202",
  "PGRST301",
] as const;

function safeErrorCode(error: unknown) {
  try {
    const code =
      error && typeof error === "object" && "code" in error
        ? error.code
        : undefined;
    return SAFE_ERROR_CODES.find((allowed) => allowed === code) ?? "other";
  } catch {
    // Even an unreadable error property must not affect access resolution.
    return "other";
  }
}

/**
 * The database codes a failed membership read logs as they are, each with
 * its class. Any other code is logged as `other`; nothing else of the error
 * is read for the log but its code and, when it has none, its name and
 * message, compared with the fixed strings the client and the runtime use.
 */
const READ_FAILURE_CLASSES: Readonly<Record<string, ReadFailureClass>> = {
  // PostgREST cannot reach the database, or the database refuses the
  // connection.
  PGRST000: "connection",
  PGRST001: "connection",
  PGRST003: "connection",
  "08000": "connection",
  "08001": "connection",
  "08003": "connection",
  "08004": "connection",
  "08006": "connection",
  "53300": "connection",
  "57P01": "connection",
  "57P03": "connection",
  // The schema cache: still loading, or without the function or schema.
  PGRST002: "schema_cache",
  PGRST106: "schema_cache",
  PGRST202: "schema_cache",
  // A statement timeout.
  "57014": "timeout",
  // The session's grants and token.
  "42501": "permission",
  PGRST300: "jwt",
  PGRST301: "jwt",
  PGRST302: "jwt",
  PGRST303: "jwt",
  // A table or function the read needs is missing.
  "42P01": "missing_object",
  "42883": "missing_object",
  // The result's shape.
  PGRST116: "result",
};

type ReadFailureClass =
  | "connection"
  | "schema_cache"
  | "timeout"
  | "permission"
  | "jwt"
  | "missing_object"
  | "result"
  | "other";

/**
 * The class of a failure with no database code, from the fixed names the
 * runtime gives a failed or aborted fetch: thrown (`TypeError: fetch
 * failed`, `AbortError`, `TimeoutError`), or as the Supabase client reports
 * it, with the name at the start of the message and an empty code.
 */
function uncodedFailureClass(error: object): ReadFailureClass {
  const name = "name" in error ? error.name : undefined;
  const message = "message" in error ? error.message : undefined;
  if (name === "AbortError" || name === "TimeoutError") return "timeout";
  if (name === "TypeError" && message === "fetch failed") return "connection";
  if (typeof message !== "string") return "other";
  if (
    message.startsWith("AbortError: ") ||
    message.startsWith("TimeoutError: ")
  ) {
    return "timeout";
  }
  return message === "TypeError: fetch failed" ? "connection" : "other";
}

/**
 * One server line for a failed membership read, in every environment: the
 * person is refused and lands on /no-access, and this is the cause (council
 * round 2, AR6). Literal fields only: the reason, the database's own code
 * when it is one of the known codes above (`other` for any other code,
 * `null` for none) and its class. No message, no identity, no row; the error
 * is never serialized.
 */
function reportMembershipReadFailure(error: unknown): void {
  let code: string | null = "other";
  let errorClass: ReadFailureClass = "other";
  try {
    const raw =
      error && typeof error === "object" && "code" in error
        ? error.code
        : undefined;
    if (raw === undefined || raw === null || raw === "") {
      code = null;
      errorClass =
        error && typeof error === "object"
          ? uncodedFailureClass(error)
          : "other";
    } else if (
      typeof raw === "string" &&
      Object.hasOwn(READ_FAILURE_CLASSES, raw)
    ) {
      code = raw;
      errorClass = READ_FAILURE_CLASSES[raw]!;
    }
  } catch {
    // An unreadable error is logged as `other`.
    code = "other";
    errorClass = "other";
  }
  try {
    console.error({
      event: "auth_membership_read_failed",
      reason: "membership_query_failed",
      code,
      class: errorClass,
    });
  } catch {
    // A failing log sink must preserve the caller's original auth result.
  }
}

/**
 * Fixed preview metadata only; diagnostics never participate in
 * authorization. A failed membership read is also logged in every
 * environment (`reportMembershipReadFailure`).
 */
export function reportAccessDiagnostic(
  kind: keyof typeof DIAGNOSTICS,
  error?: unknown,
): void {
  if (kind === "membership_query_failed") reportMembershipReadFailure(error);
  try {
    const environment = {
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_TARGET_ENV: process.env.VERCEL_TARGET_ENV,
    };
    if (
      resolveDeploymentEnvironment(environment) !== "preview" ||
      isProtectedDeployment(environment) ||
      !Object.hasOwn(DIAGNOSTICS, kind)
    ) {
      return;
    }

    const diagnostic = DIAGNOSTICS[kind];
    console.warn({
      event: "auth_access_diagnostic",
      stage: diagnostic.stage,
      outcome: diagnostic.outcome,
      code:
        diagnostic.outcome === "query_failed" ||
        diagnostic.outcome === "exception"
          ? safeErrorCode(error)
          : null,
    });
  } catch {
    // A failing log sink must preserve the caller's original auth result.
  }
}
