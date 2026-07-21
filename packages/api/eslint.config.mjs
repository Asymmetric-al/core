import { libraryConfig } from "@asym/eslint-config/library.mjs";
import { restrictedImports } from "@asym/eslint-config/restricted-imports.mjs";

export { libraryConfig };

export default [
  ...libraryConfig,
  {
    // Phase 5 public-content contract package (ADR-0027): dependencies point
    // inward — the package never imports Payload. This lives HERE (not only in
    // the root eslint.config.mjs) because CI lints this package with
    // cwd=packages/api, where flat-config lookup resolves this file and never
    // the root one. Globs cover both cwds so editors and root runs agree.
    files: [
      "src/cms/public/**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}",
      "**/packages/api/src/cms/public/**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}",
    ],
    rules: {
      "no-restricted-imports": restrictedImports({
        extraPatterns: [
          {
            group: ["payload", "payload/*", "@payloadcms/*", "@payloadcms/**"],
            message:
              "The public-content contract package must not import Payload; the single Payload-touching reader implementation is co-located in apps/admin (ADR-0027).",
          },
        ],
      }),
    },
  },
];
