import { defineConfig } from "eslint/config";
import reactHooksPlugin from "eslint-plugin-react-hooks";

import { baseConfig } from "@asym/eslint-config/base.mjs";

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
    files: ["**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}"],
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",
    },
  },
  {
    files: ["apps/*/components/**", "apps/*/features/**", "packages/ui/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
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
    files: ["apps/*/app/api/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@asym/database/supabase/*"],
              message:
                "API routes must use approved wrappers instead of direct Supabase client imports.",
            },
          ],
          paths: [
            {
              name: "@supabase/ssr",
              message:
                "API routes must not import Supabase clients directly from @supabase/ssr.",
            },
            {
              name: "@supabase/supabase-js",
              message:
                "API routes must not import Supabase clients directly from @supabase/supabase-js.",
            },
          ],
        },
      ],
    },
  },
  {
    ignores: ["out/**", "**/out/**", "next-env.d.ts"],
  },
]);

export default eslintConfig;
