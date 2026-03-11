/**
 * @deprecated Use flat config exports instead:
 * - For Next.js apps: import from "@asym/eslint-config/nextjs.mjs"
 * - For packages: import from "@asym/eslint-config/library.mjs"
 * - For base config: import from "@asym/eslint-config/base.mjs"
 *
 * This legacy CJS config is kept for backward compatibility only.
 * See tooling/eslint-config/README.md for migration guide.
 */

/**
 * Shared ESLint configuration for Asymmetric.al monorepo
 * Enforces architecture boundaries and prevents cross-app imports
 */

module.exports = {
  extends: ["next/core-web-vitals", "next/typescript"],
  rules: {
    // Enforce architecture boundaries
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: ["../../apps/*", "../../../apps/*", "../../../../apps/*"],
            message:
              "❌ Apps cannot import from other apps. Use @asym/* packages instead.",
          },
          {
            group: ["**/apps/admin/**"],
            message:
              "❌ Cannot import from apps/admin. Use @asym/* packages instead.",
          },
          {
            group: ["**/apps/donor/**"],
            message:
              "❌ Cannot import from apps/donor. Use @asym/* packages instead.",
          },
          {
            group: ["**/apps/missionary/**"],
            message:
              "❌ Cannot import from apps/missionary. Use @asym/* packages instead.",
          },
        ],
      },
    ],
    // Prevent unused variables
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      },
    ],
    // Enforce consistent type imports
    "@typescript-eslint/consistent-type-imports": [
      "warn",
      {
        prefer: "type-imports",
        fixStyle: "inline-type-imports",
      },
    ],
  },
};
