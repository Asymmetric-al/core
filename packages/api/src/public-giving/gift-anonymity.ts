/**
 * Gift anonymity redaction projection — public-giving WIRING.
 *
 * Conrad 2026-07-04 §2.7: "Anonymous giving means anonymous to missionary/public
 * views. It does not mean anonymous to admin/finance. Admin/finance still need
 * the real donor identity for receipts, reconciliation, fraud, audit, support."
 * §2.6: receipts preserve the identity snapshot used at the time of giving.
 *
 * Data-boundary LAW (charter isolation #2): a public/missionary viewer may only
 * ever see non-identifying fields. Donor email is NEVER exposed to public or
 * missionary scopes — anonymous or not. These pure projections are the ONLY
 * supported way to build a viewer-scoped gift view: each returns an object
 * literal containing exclusively the fields that scope is allowed to see, so no
 * PII can leak even if extra columns are present on the raw input.
 */

const CENTS_PER_DOLLAR = 100;
/** Shown for a redacted (anonymous) donor — never a real name. */
const ANONYMOUS_DONOR_DISPLAY = "Anonymous";
/** Shown for a non-anonymous donor with no usable public name. */
const DEFAULT_DONOR_DISPLAY = "A generous donor";

/** Who is looking at the gift. Identity is privileged to admin/finance only. */
export type GiftViewerScope = "public" | "missionary" | "admin" | "finance";

/**
 * Raw gift row (a SUPERSET that may include donor PII). The projections below
 * drop everything the viewer scope is not allowed to see.
 */
export interface RawGiftForView {
  id: string;
  donorFirstName?: string | null;
  donorLastName?: string | null;
  donorDisplayName?: string | null;
  donorEmail?: string | null;
  isAnonymous: boolean;
  amountCents: number | null;
  currency: string;
  designationLabel?: string | null;
  createdAt: string;
}

/** Public / missionary view — non-identifying fields only. Never carries email. */
export interface PublicGiftView {
  id: string;
  donorDisplay: string;
  amount: number;
  currency: string;
  designationLabel: string | null;
  createdAt: string;
}

/** Admin / finance view — full identity, plus the anonymity flag for UI hints. */
export interface PrivilegedGiftView {
  id: string;
  donorName: string | null;
  donorEmail: string | null;
  isAnonymous: boolean;
  /** Exact integer cents — reconciliation/audit truth (never floored). */
  amountCents: number | null;
  /** Exact amount in dollars (cents / 100), not floored. */
  amount: number | null;
  currency: string;
  designationLabel: string | null;
  createdAt: string;
}

/** Identity snapshot preserved on the receipt at the time of giving (§2.6). */
export interface ReceiptIdentitySnapshot {
  name: string | null;
  email: string | null;
  /** Always true — marks this as the point-in-time identity, not a live lookup. */
  capturedAtGiving: true;
}

function nonEmpty(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

/** Whole dollars (floored) — the public-wall display convention. */
function centsToDollars(cents: number | null | undefined): number {
  if (cents == null || !Number.isFinite(cents) || cents <= 0) return 0;
  return Math.floor(cents / CENTS_PER_DOLLAR);
}

/** Exact, clamped integer cents — the reconciliation/audit truth. */
function exactCentsOrNull(cents: number | null | undefined): number | null {
  if (cents == null || !Number.isFinite(cents) || cents < 0) return null;
  return Math.trunc(cents);
}

/**
 * Whether a gift is anonymous, evaluated FAIL-CLOSED: anything that is not an
 * explicit `false` is treated as anonymous. A null/undefined flag (e.g. the
 * `is_anonymous` column absent or unmigrated) must redact, never leak a name.
 */
function isGiftAnonymous(raw: RawGiftForView): boolean {
  return raw.isAnonymous !== false;
}

/** True for scopes that may see the real donor identity (admin, finance). */
export function isIdentityPrivilegedScope(scope: GiftViewerScope): boolean {
  return scope === "admin" || scope === "finance";
}

/** Real donor name from the raw row (display name, else "First Last"), else null. */
function realDonorName(raw: RawGiftForView): string | null {
  const display = nonEmpty(raw.donorDisplayName);
  if (display) return display;
  const parts = [nonEmpty(raw.donorFirstName), nonEmpty(raw.donorLastName)]
    .filter((p): p is string => Boolean(p))
    .join(" ");
  return parts.length > 0 ? parts : null;
}

/** Public display label: "Anonymous" for anonymous gifts, else the real name / fallback. */
export function donorPublicDisplay(raw: RawGiftForView): string {
  if (isGiftAnonymous(raw)) return ANONYMOUS_DONOR_DISPLAY;
  return realDonorName(raw) ?? DEFAULT_DONOR_DISPLAY;
}

/**
 * Project a gift for a viewer scope. Public/missionary get a redacted,
 * PII-free view; admin/finance get the real identity even when the gift is
 * anonymous (anonymity is a public/missionary-only concept).
 */
export function projectGiftForViewer(
  raw: RawGiftForView,
  scope: GiftViewerScope,
): PublicGiftView | PrivilegedGiftView {
  const designationLabel = nonEmpty(raw.designationLabel);

  if (isIdentityPrivilegedScope(scope)) {
    // Finance/admin see exact money (no floor) for receipts/reconciliation/audit.
    const amountCents = exactCentsOrNull(raw.amountCents);
    return {
      id: raw.id,
      donorName: realDonorName(raw),
      donorEmail: nonEmpty(raw.donorEmail),
      isAnonymous: isGiftAnonymous(raw),
      amountCents,
      amount: amountCents == null ? null : amountCents / CENTS_PER_DOLLAR,
      currency: raw.currency,
      designationLabel,
      createdAt: raw.createdAt,
    };
  }

  // Public/missionary wall shows whole dollars only.
  return {
    id: raw.id,
    donorDisplay: donorPublicDisplay(raw),
    amount: centsToDollars(raw.amountCents),
    currency: raw.currency,
    designationLabel,
    createdAt: raw.createdAt,
  };
}

/**
 * Build the receipt identity snapshot — the real donor identity as it stood at
 * the time of giving. Anonymity NEVER redacts this: receipts, reconciliation,
 * and finance require the true identity (§2.6/§2.7).
 */
export function buildReceiptIdentitySnapshot(
  raw: RawGiftForView,
): ReceiptIdentitySnapshot {
  return {
    name: realDonorName(raw),
    email: nonEmpty(raw.donorEmail),
    capturedAtGiving: true,
  };
}
