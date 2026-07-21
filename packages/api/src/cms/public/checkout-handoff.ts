/**
 * CTA / checkout-handoff resolver types (Phase 5 (Public Website Runtime
 * Contract), ruling A8, as amended 2026-07-06 by the Phase 9 party-model
 * ruling C2).
 *
 * The handoff is a server-validated contract, never a trusted URL: checkout
 * re-resolves and validates every operational reference against the resolved
 * tenant before rendering or charging, and a preset amount is a re-validated
 * suggestion, never a trusted charge value. The resolver implementation is
 * #526; this module owns the shapes, the reserved attribution fields, the
 * opaque Phase 7 pass-through seams, and the wire parameter names.
 */

import type { PublicRequestContext } from "./context";

/** The reserved entry-method value for public-checkout gifts (Phase 2 vocabulary). */
export const PUBLIC_CHECKOUT_ENTRY_METHOD = "public_checkout";

/**
 * Party-kind hint for the Phase 7 credit model. Canonical default for the
 * guest public path is `person`; org routing is carried by `orgType` — never
 * by a `party_type` field, which must not exist anywhere in this package
 * (Phase 9 C2 amendment).
 */
export const DEFAULT_CHECKOUT_PARTY_KIND = "person";

/**
 * The single designation target carried by a giving CTA today. A giving-cart
 * multi-line seam is reserved, not built (ruling A8).
 */
export type CheckoutHandoffTarget =
  | { missionaryId: string; fundId: null }
  | { missionaryId: null; fundId: string }
  | { missionaryId: null; fundId: null };

/** Draft form of the exclusive single-designation target. */
export type CheckoutHandoffTargetDraft =
  | { missionaryId: string; fundId?: null }
  | { missionaryId?: null; fundId: string }
  | { missionaryId?: null; fundId?: null };

/**
 * Reserved attribution fields — plumbed now, populated by Phase 2 (Site,
 * Locale & Currency Foundation). `entryMethod` is intrinsic to the public
 * handoff and always set.
 */
export type CheckoutHandoffAttribution = {
  siteId: string | null;
  /** Attaches at the CTA/link level — one page may carry several codes. */
  sourceCode: string | null;
  currency: string | null;
  locale: string | null;
  entryMethod: typeof PUBLIC_CHECKOUT_ENTRY_METHOD;
};

/**
 * Opaque tribute/honor-memorial pass-through seam (Phase 7 credit model).
 * Phase 5 builds no capture UI; values stay `null` until Phase 7 populates
 * them.
 */
export type CheckoutTributeAnnotation = {
  tributeType: string | null;
  honoree: string | null;
  notifyPartyReference: string | null;
};

/**
 * Opaque giving-intent pass-through seam (Phase 7 credit model). Values are
 * uninterpreted strings on the wire; Phase 5 never reads them.
 */
export type CheckoutGivingIntentHints = {
  dafIntent: string | null;
  matchingIntent: string | null;
  employerIntent: string | null;
};

/**
 * The server-validated handoff a public "Give" CTA resolves to. Everything
 * here is re-validated server-side by checkout against the resolved tenant —
 * nothing is trusted from the URL.
 */
export type CheckoutHandoff = {
  target: CheckoutHandoffTarget;
  /** A re-validated suggestion — never a trusted charge value. */
  suggestedAmount: string | null;
  suggestedFrequency: string | null;
  attribution: CheckoutHandoffAttribution;
  tribute: CheckoutTributeAnnotation;
  intent: CheckoutGivingIntentHints;
  /** Defaults to {@link DEFAULT_CHECKOUT_PARTY_KIND}; org routing via `orgType`. */
  partyKind: string;
  orgType: string | null;
};

/** Draft input for {@link buildCheckoutHandoff}; omitted fields get safe defaults. */
export type CheckoutHandoffDraft = {
  target?: CheckoutHandoffTargetDraft;
  suggestedAmount?: string | null;
  suggestedFrequency?: string | null;
  attribution?: Partial<
    Omit<CheckoutHandoffAttribution, "entryMethod" | "siteId">
  >;
  tribute?: Partial<CheckoutTributeAnnotation>;
  intent?: Partial<CheckoutGivingIntentHints>;
  partyKind?: string;
  orgType?: string | null;
};

/**
 * Wire parameter names for the plain-query-parameter transport (ruling A8:
 * plain params that checkout re-validates server-side; a signed token is
 * redundant once the server re-resolves). The `missionary_id` / `fund_id` /
 * `amount` / `frequency` names are the shipped checkout contract; the rest
 * are the reserved names later phases populate.
 */
export const CHECKOUT_HANDOFF_PARAM_NAMES = {
  missionaryId: "missionary_id",
  fundId: "fund_id",
  suggestedAmount: "amount",
  suggestedFrequency: "frequency",
  siteId: "site_id",
  sourceCode: "source_code",
  currency: "currency",
  locale: "locale",
  entryMethod: "entry_method",
  tributeType: "tribute_type",
  honoree: "honoree",
  notifyPartyReference: "notify_party_ref",
  dafIntent: "daf_intent",
  matchingIntent: "matching_intent",
  employerIntent: "employer_intent",
  partyKind: "party_kind",
  orgType: "org_type",
} as const;

/**
 * Builds a complete handoff from trusted request context and a draft, applying
 * safe defaults and rejecting ambiguous designations.
 */
export function buildCheckoutHandoff(
  context: PublicRequestContext,
  draft: CheckoutHandoffDraft = {},
): CheckoutHandoff {
  return {
    target: buildCheckoutHandoffTarget(draft.target),
    suggestedAmount: draft.suggestedAmount ?? null,
    suggestedFrequency: draft.suggestedFrequency ?? null,
    attribution: {
      siteId: context.siteId,
      sourceCode: draft.attribution?.sourceCode ?? null,
      currency: draft.attribution?.currency ?? null,
      locale: draft.attribution?.locale ?? null,
      entryMethod: PUBLIC_CHECKOUT_ENTRY_METHOD,
    },
    tribute: {
      tributeType: draft.tribute?.tributeType ?? null,
      honoree: draft.tribute?.honoree ?? null,
      notifyPartyReference: draft.tribute?.notifyPartyReference ?? null,
    },
    intent: {
      dafIntent: draft.intent?.dafIntent ?? null,
      matchingIntent: draft.intent?.matchingIntent ?? null,
      employerIntent: draft.intent?.employerIntent ?? null,
    },
    partyKind: draft.partyKind ?? DEFAULT_CHECKOUT_PARTY_KIND,
    orgType: draft.orgType ?? null,
  };
}

function buildCheckoutHandoffTarget(
  draft: CheckoutHandoffTargetDraft | undefined,
): CheckoutHandoffTarget {
  const missionaryId = draft?.missionaryId ?? null;
  const fundId = draft?.fundId ?? null;

  if (missionaryId !== null && fundId !== null) {
    throw new Error(
      "Checkout handoff must have at most one designation target",
    );
  }

  if (missionaryId !== null) {
    return { missionaryId, fundId: null };
  }

  if (fundId !== null) {
    return { missionaryId: null, fundId };
  }

  return { missionaryId: null, fundId: null };
}

/**
 * Serializes a handoff to its wire query parameters. `null` values are
 * omitted, so until Phase 2/7 populate the reserved seams the emitted params
 * match the shipped checkout contract (target + suggestion + entry_method +
 * party_kind).
 */
export function checkoutHandoffSearchParams(
  handoff: CheckoutHandoff,
): URLSearchParams {
  const params = new URLSearchParams();
  const names = CHECKOUT_HANDOFF_PARAM_NAMES;

  setParam(params, names.missionaryId, handoff.target.missionaryId);
  setParam(params, names.fundId, handoff.target.fundId);
  setParam(params, names.suggestedAmount, handoff.suggestedAmount);
  setParam(params, names.suggestedFrequency, handoff.suggestedFrequency);
  setParam(params, names.siteId, handoff.attribution.siteId);
  setParam(params, names.sourceCode, handoff.attribution.sourceCode);
  setParam(params, names.currency, handoff.attribution.currency);
  setParam(params, names.locale, handoff.attribution.locale);
  setParam(params, names.entryMethod, handoff.attribution.entryMethod);
  setParam(params, names.tributeType, handoff.tribute.tributeType);
  setParam(params, names.honoree, handoff.tribute.honoree);
  setParam(
    params,
    names.notifyPartyReference,
    handoff.tribute.notifyPartyReference,
  );
  setParam(params, names.dafIntent, handoff.intent.dafIntent);
  setParam(params, names.matchingIntent, handoff.intent.matchingIntent);
  setParam(params, names.employerIntent, handoff.intent.employerIntent);
  setParam(params, names.partyKind, handoff.partyKind);
  setParam(params, names.orgType, handoff.orgType);

  return params;
}

function setParam(
  params: URLSearchParams,
  name: string,
  value: string | null,
): void {
  if (value === null || value === "") {
    return;
  }

  params.set(name, value);
}
