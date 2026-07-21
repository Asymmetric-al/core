import "server-only";

/**
 * The shared public-content contract package (Phase 5 (Public Website
 * Runtime Contract); epic #520, issue #522).
 *
 * One owner for the public-content rules: the published-content reader
 * interface, the allowlist serializer, the public request context, the
 * cache-tag scheme, and the checkout-handoff types. Server-only by
 * construction (the `server-only` import above fails any client bundle);
 * dependencies point INWARD — apps depend on this package, and this package
 * never imports Payload or an app (enforced by lint and the boundary test).
 *
 * See `docs/prds/sitestacker-parity/phase-05-public-website-runtime-contract.md`
 * (rulings A3–A9) and the five Phase 5 ADRs authored by the #521 docs ticket
 * (allocated as ADR-0026–0030 in PR #962).
 */

export * from "./cache-tags";
export * from "./checkout-handoff";
export * from "./context";
export * from "./reader";
export * from "./serialized";
export * from "./serializer";
