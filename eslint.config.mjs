import { defineConfig } from "eslint/config";
import reactHooksPlugin from "eslint-plugin-react-hooks";

import { baseConfig } from "@asym/eslint-config/base.mjs";
import { appRestrictedImports } from "@asym/eslint-config/restricted-imports.mjs";

const sourceCodeFiles = "**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}";

const tableEngineImportRestriction = [
  {
    name: "@tanstack/react-table",
    message:
      "Import table values/types from the boundary module @asym/ui/components/shadcn/data-table/tanstack (relative ./tanstack within shared UI), not @tanstack/react-table directly (ADR-3). @tanstack/react-table-devtools is allowed.",
  },
];

const eslintConfig = defineConfig([
  // Root fallback/orchestrator config.
  // Individual apps/packages should define local eslint.config.mjs files.
  ...baseConfig,
  {
    plugins: {
      "react-hooks": reactHooksPlugin,
    },
  },
  {
    files: [sourceCodeFiles],
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",
    },
  },
  {
    files: ["apps/**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}"],
    rules: {
      "no-restricted-imports": appRestrictedImports({
        extraPaths: tableEngineImportRestriction,
      }),
    },
  },
  {
    files: [
      "apps/*/components/**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}",
      "apps/*/features/**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}",
      "packages/ui/**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}",
    ],
    rules: {
      "no-restricted-imports": appRestrictedImports({
        extraPatterns: [
          {
            group: ["@supabase/*"],
            message:
              "Client-side surfaces must consume Supabase via @asym/database wrappers, not @supabase/* directly.",
          },
        ],
        extraPaths: [
          ...tableEngineImportRestriction,
          {
            name: "@asym/database/supabase/admin",
            message:
              "UI layers must not import the admin database client directly.",
          },
          {
            name: "@asym/database/supabase/server",
            message:
              "UI layers must not import the server database client directly.",
          },
        ],
      }),
    },
  },
  {
    // cms-ui exception (mirrors @asym/eslint-config/base.mjs): the Payload
    // admin tree has no MotionProvider/LazyMotion, so direct motion/react
    // imports are allowed there — but app boundaries still apply.
    files: ["**/src/cms-ui/**"],
    rules: {
      "no-restricted-imports": appRestrictedImports({
        exclude: ["motion"],
        extraPaths: tableEngineImportRestriction,
      }),
    },
  },
  {
    // ADR-3 sanctioned exceptions: the boundary module is the ONE place allowed
    // to import the engine, and types.ts augments the engine's module.
    files: [
      "packages/ui/components/shadcn/data-table/tanstack.ts",
      "packages/ui/components/shadcn/data-table/types.ts",
    ],
    rules: {
      "no-restricted-imports": appRestrictedImports(),
    },
  },
  {
    files: ["apps/*/app/api/**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}"],
    rules: {
      "no-restricted-imports": appRestrictedImports({
        extraPatterns: [
          {
            group: [
              "@asym/database/supabase",
              "@asym/database/supabase/*",
              "@asym/database/supabase/**",
            ],
            message:
              "Route handlers must not import Supabase clients directly; re-export handlers from @asym/api instead.",
          },
          {
            group: ["@supabase/*"],
            message:
              "Route handlers must not import @supabase/* directly; use @asym/api boundaries.",
          },
        ],
        extraPaths: [
          ...tableEngineImportRestriction,
          {
            name: "@asym/database/supabase",
            message:
              "Route handlers must not import @asym/database/supabase directly; re-export handlers from @asym/api instead.",
          },
          {
            name: "@asym/database/supabase/client",
            message:
              "Route handlers must not import @asym/database/supabase/client directly; re-export handlers from @asym/api instead.",
          },
          {
            name: "@asym/database/supabase/server",
            message:
              "Route handlers must not import @asym/database/supabase/server directly; re-export handlers from @asym/api instead.",
          },
          {
            name: "@asym/database/supabase/admin",
            message:
              "Route handlers must not import @asym/database/supabase/admin directly; re-export handlers from @asym/api instead.",
          },
          {
            name: "@supabase/ssr",
            message:
              "Route handlers must not import @supabase/ssr directly; use @asym/api boundaries.",
          },
          {
            name: "@supabase/supabase-js",
            message:
              "Route handlers must not import @supabase/supabase-js directly; use @asym/api boundaries.",
          },
        ],
      }),
    },
  },
  {
    // Approved exception: health routes are minimal probes; see data-access-boundary.md
    files: ["apps/*/app/api/health/route.{js,jsx,mjs,cjs,ts,tsx,mts,cts}"],
    rules: {
      "no-restricted-imports": "off",
    },
  },
  {
    ignores: [
      ".next/**",
      "**/.next/**",
      "out/**",
      "**/out/**",
      "build/**",
      "**/build/**",
      "playwright-report/**",
      "test-results/**",
      "scripts/**",
      "next-env.d.ts",
      "eslint.config.mjs",
    ],
  },
]);

export default eslintConfig;
