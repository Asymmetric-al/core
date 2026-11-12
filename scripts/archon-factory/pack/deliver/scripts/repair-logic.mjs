// Repairs handed from one round to the next (brief.repair):
// { acceptance: string[], implementation: string[], reviewOnly?: true, source }.
// Acceptance items go to Ezra, implementation items to Bezalel; a review-only
// repair re-runs the reviews on the recorded head. This module is the only
// implementation: record and readiness import makeRepair and normalizeRepair.
// The legacy {kind, items} shape maps kind "acceptance" and "context-change"
// to Ezra's items, "review-again" to a review-only repair with empty lists and
// any other kind to Bezalel's items.
export const CONTEXT_CHANGE =
  "The governing issue context changed after acceptance was defined. Re-derive acceptance from the current request.";

// Bounded for the work item: at most 64 non-blank items of 2000 characters.
const ITEMS = 64;
const ITEM_LENGTH = 2000;
const LEGACY_ACCEPTANCE = new Set(["acceptance", "context-change"]);

const strings = (list) =>
  Array.isArray(list)
    ? list
        .filter((item) => typeof item === "string" && item.trim())
        .map((item) => item.slice(0, ITEM_LENGTH))
        .slice(0, ITEMS)
    : [];
const named = (source) =>
  typeof source === "string" && source ? source.slice(0, 80) : "";

const shape = ({ acceptance, implementation, reviewOnly, source }) => ({
  acceptance,
  implementation,
  ...(reviewOnly ? { reviewOnly: true } : {}),
  source,
});

// `fallbackSource` names the producing stage for a repair that carries no
// source of its own (record passes the ledger stage).
export function normalizeRepair(repair, fallbackSource) {
  if (!repair || typeof repair !== "object" || Array.isArray(repair))
    return null;
  const reviewOnly = repair.reviewOnly === true;
  if (Array.isArray(repair.acceptance) || Array.isArray(repair.implementation))
    return shape({
      acceptance: strings(repair.acceptance),
      implementation: strings(repair.implementation),
      reviewOnly,
      source: named(repair.source) || named(fallbackSource) || "unknown",
    });
  const source =
    named(repair.source) ||
    named(fallbackSource) ||
    `legacy:${String(repair.kind).slice(0, 40)}`;
  if (repair.kind === "review-again")
    return shape({
      acceptance: [],
      implementation: [],
      reviewOnly: true,
      source,
    });
  const items = strings(repair.items);
  const forEzra = LEGACY_ACCEPTANCE.has(repair.kind);
  return shape({
    acceptance: forEzra ? items : [],
    implementation: forEzra ? [] : items,
    reviewOnly,
    source,
  });
}

export function makeRepair({
  acceptance = [],
  implementation = [],
  reviewOnly = false,
  source,
}) {
  return shape({
    acceptance: strings(acceptance),
    implementation: strings(implementation),
    reviewOnly,
    source,
  });
}

export function repairFingerprint(prefix, repair) {
  const normalized = normalizeRepair(repair);
  const items = [
    ...(normalized?.acceptance ?? []),
    ...(normalized?.implementation ?? []),
  ];
  if (!items.length && normalized?.reviewOnly) return `${prefix}:review-only`;
  return `${prefix}:${items.join("|").slice(0, 400)}`;
}

export function withContextChange(repair) {
  const current =
    normalizeRepair(repair) ?? makeRepair({ source: "after-scope" });
  if (current.acceptance.includes(CONTEXT_CHANGE)) return current;
  return { ...current, acceptance: [...current.acceptance, CONTEXT_CHANGE] };
}

// Ezra has applied the acceptance part; whatever remains is Bezalel's.
export function afterAcceptance(repair) {
  const current = normalizeRepair(repair);
  if (!current || (!current.implementation.length && !current.reviewOnly))
    return null;
  return { ...current, acceptance: [] };
}

// An issue with no implementation paths has one writer, so Ezra takes every
// item. Returns null when nothing has to move.
export function allToAcceptance(repair) {
  const current = normalizeRepair(repair);
  if (!current?.implementation.length) return null;
  return makeRepair({
    acceptance: [
      ...new Set([...current.acceptance, ...current.implementation]),
    ],
    reviewOnly: current.reviewOnly,
    source: current.source,
  });
}

export function ezraCorrections(repair) {
  return normalizeRepair(repair)?.acceptance ?? [];
}

export function bezalelRepairs(repair) {
  return normalizeRepair(repair)?.implementation ?? [];
}
