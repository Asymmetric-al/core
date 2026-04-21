/**
 * Curated package entrypoint for `@asym/ui`.
 * Deep imports like `@asym/ui/components/shadcn/*` and
 * `@asym/ui/components/primitives/*` remain supported and are not deprecated.
 *
 * Keep the flat package barrel intentionally small to avoid accidental
 * name collisions between canonical shadcn exports and first-party
 * compositions that live in `components/primitives`.
 */
export * from "./components/shadcn";
export * from "./components/auth";
export * from "./hooks";
export * from "./lib/utils";
