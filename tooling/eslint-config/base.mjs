import tsEslintPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import importXPlugin from "eslint-plugin-import-x";
import unusedImportsPlugin from "eslint-plugin-unused-imports";

const tsRecommendedConfig = tsEslintPlugin.configs["flat/recommended"] ?? [];

export const baseConfig = [
  {
    ignores: [
      ".next/**",
      "**/.next/**",
      "dist/**",
      "**/dist/**",
      "build/**",
      "**/build/**",
      "*.config.mjs",
      "**/*.config.mjs",
    ],
  },
  {
    files: ["**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}"],
    plugins: {
      "@typescript-eslint": tsEslintPlugin,
      "import-x": importXPlugin,
      "unused-imports": unusedImportsPlugin,
    },
  },
  {
    files: ["**/*.{ts,tsx,mts,cts}"],
    languageOptions: {
      parser: tsParser,
    },
  },
  ...tsRecommendedConfig,
  {
    files: ["**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../../apps/*", "../../../apps/*", "../../../../apps/*"],
              message:
                "Apps cannot import from other apps. Use @asym/* packages instead.",
            },
            {
              group: ["**/apps/admin/**"],
              message:
                "Cannot import from apps/admin. Use @asym/* packages instead.",
            },
            {
              group: ["**/apps/donor/**"],
              message:
                "Cannot import from apps/donor. Use @asym/* packages instead.",
            },
            {
              group: ["**/apps/missionary/**"],
              message:
                "Cannot import from apps/missionary. Use @asym/* packages instead.",
            },
            {
              group: ["motion/react", "framer-motion"],
              message:
                "Import motion APIs from @asym/lib/motion (LazyMotion m + MotionConfig reducedMotion). See docs/ai/skills/anim/SKILL.md.",
            },
          ],
        },
      ],
      "import-x/no-duplicates": "error",
      "import-x/order": [
        "warn",
        {
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
          groups: [
            "builtin",
            "external",
            "internal",
            ["parent", "sibling", "index"],
            "object",
            "type",
          ],
        },
      ],
      "unused-imports/no-unused-imports": "warn",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    // Exception zones for the motion/react import restriction:
    // - packages/lib/motion.tsx IS the re-export module.
    // - apps/admin/src/cms-ui renders inside the Payload admin React tree,
    //   which does not mount MotionProvider/LazyMotion, so the `m`-based
    //   re-export would silently break its animations.
    // Patterns cover both repo-root and per-package eslint working dirs.
    files: ["motion.tsx", "**/packages/lib/motion.tsx"],
    rules: {
      "no-restricted-imports": "off",
    },
  },
  {
    // cms-ui relaxes ONLY the motion/react restriction; the cross-app import
    // boundaries must keep applying, so re-declare the rule without the
    // motion group instead of turning it off.
    files: ["**/src/cms-ui/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../../apps/*", "../../../apps/*", "../../../../apps/*"],
              message:
                "Apps cannot import from other apps. Use @asym/* packages instead.",
            },
            {
              group: ["**/apps/admin/**"],
              message:
                "Cannot import from apps/admin. Use @asym/* packages instead.",
            },
            {
              group: ["**/apps/donor/**"],
              message:
                "Cannot import from apps/donor. Use @asym/* packages instead.",
            },
            {
              group: ["**/apps/missionary/**"],
              message:
                "Cannot import from apps/missionary. Use @asym/* packages instead.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["**/*.{ts,tsx,mts,cts}"],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        {
          prefer: "type-imports",
          fixStyle: "inline-type-imports",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
];

export default baseConfig;
