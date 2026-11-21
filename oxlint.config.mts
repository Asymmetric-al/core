import { defineConfig } from "oxlint";
import antiSlop from "ultracite/oxlint/anti-slop";
import core from "ultracite/oxlint/core";

const jsSyntaxRules = new Set([
  "typescript/ban-ts-comment",
  "typescript/ban-tslint-comment",
  "typescript/class-literal-property-style",
  "typescript/no-dynamic-delete",
  "typescript/no-extraneous-class",
  "typescript/no-require-imports",
  "typescript/no-this-alias",
  "typescript/no-useless-empty-export",
  "typescript/no-var-requires",
  "typescript/prefer-for-of",
  "typescript/prefer-ts-expect-error",
  "typescript/triple-slash-reference",
]);
const jsRules: Record<string, "off"> = {};
for (const rule of Object.keys({ ...core.rules, ...antiSlop.rules })) {
  if (rule.startsWith("typescript/") && !jsSyntaxRules.has(rule))
    jsRules[rule] = "off";
}
for (const rule of [
  "no-chained-type-assertions",
  "no-known-value-widening",
  "no-object-parameters",
  "no-unknown-parameters",
  "no-unknown-returns",
  "no-unknown-type-aliases",
  "no-unsafe-dictionary-type",
  "no-widen-then-assert",
  "require-safety-comment-for-type-assertion",
])
  jsRules[`anti-slop/${rule}`] = "off";

export default defineConfig({
  extends: [core, antiSlop],
  env: { ...core.env },
  options: { respectEslintDisableDirectives: false },
  ignorePatterns: [
    ...core.ignorePatterns, // Upstream build outputs, dependency trees and generated-source conventions.
    "apps/admin/app/(payload)/**/importMap.js", // Payload regenerates its admin import map.
    "apps/admin/payload-types.ts", // Generated CMS types.
    "**/public/maplibre/**", // Worker bundles copied from the MapLibre package.
    "**/.eve/**", // Local Eve SDK service output.
    "playwright-report/**", // Generated browser report.
    "test-results/**", // Local test artifacts.
    ".agents/**", // Installed and mirrored agent skills.
    ".claude/**", // Managed Claude assets.
    ".cursor/**", // Managed Cursor assets.
    ".next-docs/**", // Mirrored framework documentation.
    "docs/**", // Documentation, evidence and vendored skill sources.
    "scripts/archon-factory/pack/**", // Released factory pack: a change is a new pack release under its own review.
    "vendor/react-pdf-packages/**", // Unpacked third-party PDF distributions.
    "apps/*/bones/registry.ts", // Generated Boneyard component registries.
    // Only these nine ReUI registry files are vendored; new grid components stay linted.
    ...[
      "data-grid",
      "data-grid-column-filter",
      "data-grid-column-header",
      "data-grid-column-visibility",
      "data-grid-i18n",
      "data-grid-pagination",
      "data-grid-scroll-area",
      "data-grid-table",
      "data-grid-table-virtual",
    ].map((name) => `packages/ui/components/reui/data-grid/${name}.tsx`),
  ],
  overrides: [{ files: ["**/*.{js,mjs,cjs,jsx}"], rules: jsRules }],
});
