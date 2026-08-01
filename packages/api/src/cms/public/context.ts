/**
 * The unified public request context — the result of resolving a public
 * request from the platform-trusted host (Phase 5 (Public Website Runtime
 * Contract), ruling A6).
 *
 * Every reader, serializer, cache, and checkout-handoff signature accepts
 * this context so Phase 2 (Site, Locale & Currency Foundation) can populate
 * the reserved site dimension (issues #479 / #482 / #485) without changing
 * any caller.
 */
export type PublicRequestContext = {
  /**
   * Operational tenant id (`public` schema) — used for funds, missionaries,
   * and the checkout handoff.
   */
  operationalTenantId: string;
  /**
   * CMS tenant document id (`cms` schema) — used for content reads. Payload
   * document ids may be numeric or string depending on the collection setup.
   */
  cmsTenantId: string | number;
  /**
   * Reserved Phase 2 seam. Today every tenant has exactly one implicit site,
   * so this stays `null` until Phase 2 introduces the `sites` primitive
   * (#479), the host→site→tenant resolver (#482), and CMS site-scoping
   * (#485).
   */
  siteId: string | null;
};

/**
 * Fail-closed resolution result produced by the host→tenant/site resolver
 * (#524). An unknown or disabled host never yields an unfiltered context —
 * it yields `site-not-found`, and the public runtime renders the neutral
 * "site not found" page.
 */
export type PublicRequestResolution =
  | { status: "resolved"; context: PublicRequestContext }
  | { status: "site-not-found" };

/**
 * Narrowing guard for the resolved arm of {@link PublicRequestResolution}.
 * Callers must treat anything else as "serve nothing".
 */
export function isResolvedPublicRequest(
  resolution: PublicRequestResolution,
): resolution is { status: "resolved"; context: PublicRequestContext } {
  return resolution.status === "resolved";
}
