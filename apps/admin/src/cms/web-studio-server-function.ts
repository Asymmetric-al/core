import { headers } from "next/headers";

import {
  WEB_STUDIO_CLAIM_ASSIGNMENT_HEADER,
  WEB_STUDIO_CLAIM_GENERATION_HEADER,
  WEB_STUDIO_CLAIM_TENANT_HEADER,
  WEB_STUDIO_REFUSAL_MESSAGES,
  webStudioRefusalDigest,
  type WebStudioRefusal,
} from "./auth/web-studio-refusal";
import { readWebStudioSelection } from "./web-studio-access";

import type { WebStudioSelectionState } from "./web-studio-access";

/**
 * Payload's server functions in Web Studio (plan 5.2: "A save, upload or
 * publish whose tenant differs from the current cookie is refused with a
 * prompt to reload, so switching organization in another tab never
 * retargets an open form"; council on the joined release, JC2).
 *
 * They are server actions posted to the page's own address, which
 * authenticate without a REST request, so Payload's strategy never compared
 * them with the document. Some write: in Payload 4.0.0-beta.9
 * `schedule-publish` queues and deletes jobs and `copy-data-from-locale`
 * updates a document, and the rest render lists, documents and form state
 * in whatever organization the cookie selects. The Payload layout runs each
 * one through this check first: the claims the document's fetch hook sent
 * (its tenant and row) must name the row the Web Studio cookie selects now.
 * A mismatch, or a missing pair, is refused before any of Payload's handlers
 * runs, with the REST path's refusal: its message, and its name in the
 * error's digest, which the document reads to ask the person to reload.
 */

/** A refused server function: Next keeps the digest, which names the refusal. */
export class WebStudioServerFunctionRefusal extends Error {
  readonly digest: string;

  constructor(readonly refusal: WebStudioRefusal) {
    super(WEB_STUDIO_REFUSAL_MESSAGES[refusal]);
    this.name = "WebStudioServerFunctionRefusal";
    this.digest = webStudioRefusalDigest(refusal);
  }
}

/**
 * The person's rows could not be read: an ordinary failure, with no refusal
 * in its digest, so the document asks nobody to choose again and the person
 * can retry (JR2's rule; last read of the first release, L3).
 */
export class WebStudioServerFunctionUnavailable extends Error {
  constructor() {
    super(
      "Web Studio could not check your organization just now. Please try again.",
    );
    this.name = "WebStudioServerFunctionUnavailable";
  }
}

/** Why a server function with these claims may not run, or `null` when it may. */
export function webStudioServerFunctionRefusal(
  claims: Headers,
  selection: Exclude<WebStudioSelectionState, { kind: "unavailable" }>,
): WebStudioRefusal | null {
  if (selection.kind === "signed_out") return "no_session";
  if (selection.kind === "none") return "no_selection";
  const tenantId = claims.get(WEB_STUDIO_CLAIM_TENANT_HEADER)?.trim();
  const assignmentId = claims.get(WEB_STUDIO_CLAIM_ASSIGNMENT_HEADER)?.trim();
  const generationHolds =
    selection.generation === undefined ||
    claims.get(WEB_STUDIO_CLAIM_GENERATION_HEADER) ===
      String(selection.generation);
  return tenantId === selection.tenantId &&
    assignmentId === selection.assignmentId &&
    generationHolds
    ? null
    : "scope_mismatch";
}

/**
 * Runs one of Payload's server functions for the Web Studio document that
 * posted it, or refuses it before it runs.
 */
export async function runForWebStudioDocument<T>(
  run: () => Promise<T>,
): Promise<T> {
  const selection = await readWebStudioSelection();
  if (selection.kind === "unavailable") {
    throw new WebStudioServerFunctionUnavailable();
  }
  const refusal = webStudioServerFunctionRefusal(await headers(), selection);
  if (refusal) throw new WebStudioServerFunctionRefusal(refusal);
  return run();
}
