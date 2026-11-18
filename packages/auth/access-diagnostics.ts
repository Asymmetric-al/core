import {
  isProtectedDeployment,
  resolveDeploymentEnvironment,
} from "@asym/env/target-env";

import { AssignmentReaderError } from "./principal/reader";

import type { AssignmentReader } from "./principal/types";

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
 * `reader`, keeping the cause of a failed read for the `membership_query_failed`
 * diagnostic, which logs only its safe error code. The resolver and the
 * proxy's membership read both say only `reader_error`; without this the
 * cause is lost (council round 1, A5). The read and its result are unchanged.
 */
export function withReadErrorCause(reader: AssignmentReader): {
  readonly reader: AssignmentReader;
  readonly readError: () => unknown;
} {
  let readError: unknown;
  return {
    reader: {
      async listActiveAssignments() {
        try {
          return await reader.listActiveAssignments();
        } catch (error) {
          readError =
            error instanceof AssignmentReaderError && error.cause !== undefined
              ? error.cause
              : error;
          throw error;
        }
      },
    },
    readError: () => readError,
  };
}

/** Fixed preview metadata only; diagnostics never participate in authorization. */
export function reportAccessDiagnostic(
  kind: keyof typeof DIAGNOSTICS,
  error?: unknown,
): void {
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
