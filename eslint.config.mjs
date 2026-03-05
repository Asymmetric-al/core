import { defineConfig } from "eslint/config";
import reactHooksPlugin from "eslint-plugin-react-hooks";

import { baseConfig } from "@asym/eslint-config/base.mjs";

const sourceCodeFiles = "**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}";

const crossAppImportRestrictions = [
  {
    group: ["../../apps/*", "../../../apps/*", "../../../../apps/*"],
    message:
      "Apps cannot import from other apps. Use @asym/* packages instead.",
  },
  {
    group: ["**/apps/admin/**"],
    message: "Cannot import from apps/admin. Use @asym/* packages instead.",
  },
  {
    group: ["**/apps/donor/**"],
    message: "Cannot import from apps/donor. Use @asym/* packages instead.",
  },
  {
    group: ["**/apps/missionary/**"],
    message:
      "Cannot import from apps/missionary. Use @asym/* packages instead.",
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
    files: [
      "apps/*/components/**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}",
      "apps/*/features/**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}",
      "packages/ui/**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            ...crossAppImportRestrictions,
            {
              group: ["@supabase/*"],
              message:
                "Client-side surfaces must consume Supabase via @asym/database wrappers, not @supabase/* directly.",
            },
          ],
          paths: [
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
        },
      ],
    },
  },
  {
    files: ["apps/*/app/api/**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            ...crossAppImportRestrictions,
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
          paths: [
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
        },
      ],
    },
  },
  {
    // Approved exception: health routes are minimal probes; see data-access-boundary.md
    files: ["apps/*/app/api/health/route.ts"],
    rules: {
      "no-restricted-imports": "off",
    },
  },
  {
    ignores: ["out/**", "**/out/**", "next-env.d.ts"],
  },
]);

export default eslintConfig;
