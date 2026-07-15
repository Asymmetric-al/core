/**
 * Source globs shared by the Base UI static regression guards
 * (base-ui-trigger-render-nesting and base-ui-menu-item-handlers) so both
 * keep scanning the same component surface as the repo structure evolves.
 */
export const SOURCE_GLOBS = [
  "apps/*/app/**/*.tsx",
  "apps/*/features/**/*.tsx",
  "apps/*/components/**/*.tsx",
  "apps/*/src/**/*.tsx",
  "packages/*/components/**/*.tsx",
];
