import playwright from "eslint-plugin-playwright";
import {
  defineConfig,
  type DummyRule,
  type DummyRuleMap,
  type OxlintOverride,
} from "oxlint";
import antiSlop from "ultracite/oxlint/anti-slop";
import core from "ultracite/oxlint/core";
import next from "ultracite/oxlint/next";
import react from "ultracite/oxlint/react";
import vitest from "ultracite/oxlint/vitest";

import { readPending } from "./scripts/verify/lint-pending.mts";
import fixtureProgram from "./tests/fixtures/base-ui-compliance/tsconfig.json" with { type: "json" };
import parity from "./tooling/quality/eslint-parity.json" with { type: "json" };

const source = "**/*.{ts,tsx,mts,cts,js,jsx,mjs,cjs}";
const typescript = "**/*.{ts,tsx,mts,cts}";
const apps = ["admin", "donor", "factory-console", "missionary"].map(
  (app) => `apps/${app}`,
);
const e2e = [
  "tests/e2e",
  "tests/fixtures/base-ui-compliance/specs",
  "apps/factory-console/tests/e2e",
].map((dir) => `${dir}/**/*.{spec,test}.{ts,tsx,js,jsx,mts,cts,mjs,cjs}`);
const tests = ["**/tests/**", "**/__tests__/**", "**/*.{test,spec}.*"];
const framework = ["apps", "packages", "tests"];
const configName = (rule: string) => rule.replace(/^eslint\//, "");
const fullName = (rule: string) =>
  rule.includes("/") ? rule : `eslint/${rule}`;
const off = (names: Iterable<string>) =>
  Object.fromEntries(
    Array.from(names, (name): [string, "off"] => [configName(name), "off"]),
  );

const adaptations: DummyRuleMap = {
  ...off([
    // These rewrites change observable behavior without establishing a defect.
    "require-await",
    "typescript/promise-function-async",
    "no-await-in-loop",
    "require-unicode-regexp",
    "unicorn/no-array-sort",
    "unicorn/no-array-reverse",
    "unicorn/prefer-dom-node-dataset",
    "jsx-a11y/prefer-tag-over-role",
    "unicorn/prefer-number-coercion",
    // Preserve Core's existing declaration, naming, comment and module conventions.
    "func-style",
    "unicorn/filename-case",
    "no-inline-comments",
    "no-warning-comments",
    "prefer-named-capture-group",
    "oxc/no-barrel-file",
    "typescript/consistent-type-definitions",
    "typescript/non-nullable-type-assertion-style",
    // Numeric limits and stylistic rewrites are not defect checks.
    "complexity",
    "class-methods-use-this",
    "prefer-destructuring",
    "no-plusplus",
    "no-bitwise",
    "unicorn/no-await-expression-member",
    "unicorn/consistent-function-scoping",
    "promise/avoid-new",
    "unicorn/no-array-for-each",
    "react/jsx-handler-names",
    "react/todo",
    "vitest/require-mock-type-parameters",
    // Keep exact intent in assertions, fixtures, mock imports and test organization.
    "vitest/prefer-to-be-truthy",
    "vitest/prefer-to-be-falsy",
    "vitest/prefer-strict-equal",
    "vitest/max-expects",
    "vitest/require-top-level-describe",
    "vitest/prefer-import-in-mock",
    "vitest/prefer-describe-function-title",
  ]),
  "no-use-before-define": ["error", { variables: false, classes: false }],
  eqeqeq: ["error", "always", { null: "ignore" }],
  "typescript/strict-boolean-expressions": [
    "error",
    {
      allowNullableBoolean: true,
      allowNullableString: true,
      allowNullableNumber: false,
    },
  ],
  "typescript/prefer-nullish-coalescing": ["error", { ignorePrimitives: true }],
  "typescript/no-confusing-void-expression": [
    "error",
    { ignoreArrowShorthand: true },
  ],
  "typescript/no-floating-promises": ["error", { ignoreVoid: false }],
  "typescript/return-await": ["error", "always"],
  "object-shorthand": ["error", "always", { ignoreConstructors: true }],
};

const parityOptions: Record<string, DummyRule> = {
  "typescript/ban-ts-comment": [
    "error",
    {
      "ts-check": false,
      "ts-expect-error": "allow-with-description",
      "ts-ignore": true,
      "ts-nocheck": true,
    },
  ],
  "prefer-const": [
    "error",
    { destructuring: "any", ignoreReadBeforeAssign: false },
  ],
  "no-unused-expressions": [
    "error",
    {
      allowShortCircuit: false,
      allowTaggedTemplates: false,
      allowTernary: false,
    },
  ],
};
export const parityRules = new Set<string>();
const parityGroups = new Map<string, OxlintOverride>();
for (const entry of parity.rules) {
  const { kind, name } = entry.mapping;
  if (kind !== "oxlint" || !name) continue;
  parityRules.add(name);
  if (name === "eslint/no-restricted-imports") continue;
  const files = [
    ...new Set(
      Object.values(entry.scopes)
        .flat()
        .filter((file): file is string => typeof file === "string"),
    ),
  ].sort();
  const key = files.join("\n");
  const group = parityGroups.get(key) ?? {
    files,
    excludeFiles: ["**/*.config.mjs"],
    rules: {},
  };
  const id = configName(name);
  group.rules = { ...group.rules, [id]: parityOptions[id] ?? "error" };
  parityGroups.set(key, group);
}

const vendoredGrid = [
  "data-grid",
  "data-grid-column-filter",
  "data-grid-column-header",
  "data-grid-column-visibility",
  "data-grid-i18n",
  "data-grid-pagination",
  "data-grid-scroll-area",
  "data-grid-table",
  "data-grid-table-virtual",
].map((name) => `packages/ui/components/reui/data-grid/${name}.tsx`);

// Design 4.3: the four import tiers, ported from eslint.config.mjs, tooling/eslint-config/{base,restricted-imports}.mjs
// and packages/api/eslint.config.mjs (the union of every config that lints a path). A later setting of this rule
// replaces an earlier one, so each block carries every ban for its paths, widest first. ESLint's gitignore matching
// also bans what lies below a matched path; Oxlint matches the exact depth only, so each group adds its `/**` form.
type Restriction = {
  patterns: { group: string[]; message: string }[];
  paths: { name: string; message: string }[];
};

const banned = (message: string, ...globs: string[]) => ({
  message,
  group: [
    ...new Set(
      globs.flatMap((glob) =>
        glob.endsWith("/**") ? [glob] : [glob, `${glob}/**`],
      ),
    ),
  ],
});

const restriction = (
  ...parts: Partial<Restriction>[]
): ["error", Restriction] => [
  "error",
  {
    patterns: parts.flatMap((part) => part.patterns ?? []),
    paths: parts.flatMap((part) => part.paths ?? []),
  },
];

const crossApp = {
  patterns: [
    banned(
      "Apps cannot import from other apps. Use @asym/* packages instead.",
      "../../apps/*",
      "../../../apps/*",
      "../../../../apps/*",
    ),
    ...["admin", "donor", "missionary", "factory-console"].map((app) =>
      banned(
        `Cannot import from apps/${app}. Use @asym/* packages instead.`,
        `**/apps/${app}/**`,
      ),
    ),
  ],
};

const motion = {
  patterns: [
    banned(
      "Import motion APIs from @asym/lib/motion (LazyMotion m + MotionConfig reducedMotion). See docs/ai/skills/anim/SKILL.md.",
      "motion/react",
      "framer-motion",
    ),
  ],
};

const twentyClient = {
  patterns: [
    banned(
      "App code must not import raw Twenty clients. Use stable @asym/api CRM contracts and route re-exports instead.",
      "@asym/api/crm/client",
      "@asym/api/crm/client/*",
      "@asym/api/src/crm/client",
      "@asym/api/src/crm/client/*",
      "**/packages/api/src/crm/client",
      "**/packages/api/src/crm/client/*",
      "**/packages/api/src/crm/client/**",
    ),
  ],
};

const tableEngine = {
  paths: [
    {
      name: "@tanstack/react-table",
      message:
        "Import table values/types from the boundary module @asym/ui/components/shadcn/data-table/tanstack (relative ./tanstack within shared UI), not @tanstack/react-table directly (ADR-3). @tanstack/react-table-devtools is allowed.",
    },
  ],
};

const uiClients = {
  patterns: [
    banned(
      "Client-side surfaces must consume Supabase via @asym/database wrappers, not @supabase/* directly.",
      "@supabase/*",
    ),
  ],
  paths: ["admin", "server"].map((client) => ({
    name: `@asym/database/supabase/${client}`,
    message: `UI layers must not import the ${client} database client directly.`,
  })),
};

const routeClients = {
  patterns: [
    banned(
      "Route handlers must not import Supabase clients directly; re-export handlers from @asym/api instead.",
      "@asym/database/supabase",
      "@asym/database/supabase/*",
      "@asym/database/supabase/**",
    ),
    banned(
      "Route handlers must not import @supabase/* directly; use @asym/api boundaries.",
      "@supabase/*",
    ),
  ],
  paths: [
    ...["", "/client", "/server", "/admin"].map((entry) => ({
      name: `@asym/database/supabase${entry}`,
      message: `Route handlers must not import @asym/database/supabase${entry} directly; re-export handlers from @asym/api instead.`,
    })),
    ...["@supabase/ssr", "@supabase/supabase-js"].map((name) => ({
      name,
      message: `Route handlers must not import ${name} directly; use @asym/api boundaries.`,
    })),
  ],
};

const publicContract = {
  patterns: [
    banned(
      "The public-content contract package must not import Payload; the single Payload-touching reader implementation is co-located in apps/admin (ADR-0027).",
      "payload",
      "payload/*",
      "@payloadcms/*",
      "@payloadcms/**",
    ),
  ],
};

const firstParty = ["apps", "packages", "tooling"];

const uiLayer = [
  "apps/*/components",
  "apps/*/features",
  "apps/*/src/components",
  "apps/*/src/features",
  "packages/ui",
];

const routeHandlers = ["apps/*/app/api", "apps/*/src/app/api"];

const tableBoundary = [
  "packages/ui/components/shadcn/data-table/tanstack.ts",
  "packages/ui/components/shadcn/data-table/types.ts",
  "packages/ui/components/data-grid-panel/data-grid-engine.ts",
];

const appTier = [crossApp, twentyClient, motion, tableEngine];

const importTiers: OxlintOverride[] = [
  {
    files: firstParty.map((area) => `${area}/${source}`),
    rules: { "no-restricted-imports": restriction(crossApp, motion) },
  }, // Tier 0: first-party code never imports an app and reaches motion only through @asym/lib/motion.
  {
    files: ["packages/lib/motion.ts", "packages/lib/motion-provider.tsx"],
    rules: { "no-restricted-imports": restriction(crossApp) },
  }, // The motion re-export and the provider that mounts LazyMotion and MotionConfig.
  {
    files: [`apps/${source}`],
    rules: { "no-restricted-imports": restriction(...appTier) },
  }, // Tier 1: app-wide.
  {
    files: uiLayer.map((dir) => `${dir}/${source}`),
    rules: { "no-restricted-imports": restriction(...appTier, uiClients) },
  }, // Tier 2: the UI layer.
  {
    files: firstParty.map((area) => `${area}/**/src/cms-ui/**`),
    rules: {
      "no-restricted-imports": restriction(crossApp, twentyClient, tableEngine),
    },
  }, // Payload's admin React tree mounts no MotionProvider or LazyMotion, so direct motion/react stays allowed.
  {
    files: [...tableBoundary, ...vendoredGrid],
    rules: {
      "no-restricted-imports": restriction(
        crossApp,
        twentyClient,
        motion,
        uiClients,
      ),
    },
  }, // ADR-3: the table boundary modules, the engine's module augmentation and the vendored ReUI grid import the engine.
  {
    files: [`packages/api/src/cms/public/${source}`],
    rules: {
      "no-restricted-imports": restriction(
        crossApp,
        twentyClient,
        motion,
        publicContract,
      ),
    },
  }, // ADR-0027: the public-content contract never imports Payload.
  {
    files: routeHandlers.map((dir) => `${dir}/${source}`),
    rules: { "no-restricted-imports": restriction(...appTier, routeClients) },
  }, // Tier 3: route handlers re-export @asym/api handlers.
  {
    files: routeHandlers.map(
      (dir) => `${dir}/health/route.{ts,tsx,mts,cts,js,jsx,mjs,cjs}`,
    ),
    rules: { "no-restricted-imports": restriction(...appTier) },
  }, // The health probe is excepted from tier 3 only (data-access-boundary.md).
];

const jsxRule = (name: string) =>
  /^(jsx-a11y\/|react-perf\/|react\/(?:jsx-|button-has-type|checked-requires-onchange-or-readonly|forbid-(?:component-props|dom-props|elements)|iframe-missing-sandbox|no-(?:danger|children-prop|string-refs|unescaped-entities|unknown-property)|self-closing-comp|style-prop-object|void-dom-elements))/.test(
    name,
  );
const queryRules: DummyRuleMap = Object.fromEntries(
  [
    "exhaustive-deps",
    "no-unstable-deps",
    "stable-query-client",
    "infinite-query-property-order",
    "mutation-property-order",
  ].map((rule) => [`query/${rule}`, "error"]),
);
const playwrightRules: DummyRuleMap = {
  ...Object.fromEntries(
    Object.entries(playwright.configs["flat/recommended"].rules ?? {})
      .filter(
        ([name, value]) => name.startsWith("playwright/") && value !== "off",
      )
      .map(([name]) => [name, "error"]),
  ),
  "playwright/missing-playwright-await": [
    "error",
    { includePageLocatorMethods: true },
  ],
  "playwright/no-skipped-test": ["error", { allowConditional: true }],
};
const vitestRules = vitest.overrides[0]?.rules ?? {};
const profiles: DummyRuleMap[] = [
  { ...core.rules, ...antiSlop.rules },
  {
    ...react.rules,
    "react/no-danger": "error",
    "react/incompatible-library": "error",
  },
  next.rules,
  vitestRules,
  queryRules,
  playwrightRules,
];
export const policyRules = new Set([
  ...parityRules,
  ...profiles.flatMap((profile) =>
    Object.entries({ ...profile, ...adaptations })
      .filter(
        ([, value]) =>
          value && (Array.isArray(value) ? value[0] : value) !== "off",
      )
      .map(([name]) => fullName(name)),
  ),
]);

const fixtureDirectory = "tests/fixtures/base-ui-compliance";
const typedRules = [
  "await-thenable",
  "consistent-return",
  "consistent-type-exports",
  "dot-notation",
  "no-array-delete",
  "no-base-to-string",
  "no-confusing-void-expression",
  "no-deprecated",
  "no-duplicate-type-constituents",
  "no-floating-promises",
  "no-for-in-array",
  "no-generated-empty-object-type",
  "no-implied-eval",
  "no-meaningless-void-operator",
  "no-misused-promises",
  "no-misused-spread",
  "no-mixed-enums",
  "no-redundant-type-constituents",
  "no-unnecessary-boolean-literal-compare",
  "no-unnecessary-condition",
  "no-unnecessary-qualifier",
  "no-unnecessary-template-expression",
  "no-unnecessary-type-arguments",
  "no-unnecessary-type-assertion",
  "no-unnecessary-type-conversion",
  "no-unnecessary-type-parameters",
  "no-unsafe-argument",
  "no-unsafe-assignment",
  "no-unsafe-call",
  "no-unsafe-enum-assignment",
  "no-unsafe-enum-comparison",
  "no-unsafe-member-access",
  "no-unsafe-return",
  "no-unsafe-type-assertion",
  "no-unsafe-unary-minus",
  "no-useless-default-assignment",
  "non-nullable-type-assertion-style",
  "only-throw-error",
  "prefer-find",
  "prefer-includes",
  "prefer-nullish-coalescing",
  "prefer-optional-chain",
  "prefer-promise-reject-errors",
  "prefer-readonly",
  "prefer-readonly-parameter-types",
  "prefer-reduce-type-parameter",
  "prefer-regexp-exec",
  "prefer-return-this-type",
  "prefer-string-starts-ends-with",
  "promise-function-async",
  "related-getter-setter-pairs",
  "require-array-sort-compare",
  "require-await",
  "restrict-plus-operands",
  "restrict-template-expressions",
  "return-await",
  "strict-boolean-expressions",
  "strict-void-return",
  "switch-exhaustiveness-check",
  "unbound-method",
  "use-unknown-in-catch-callback-variable",
].map((name) => `typescript/${name}`);

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
  "no-runtime-typeof",
  "no-unknown-parameters",
  "no-unknown-returns",
  "no-unknown-type-aliases",
  "no-unsafe-dictionary-type",
  "no-widen-then-assert",
  "require-safety-comment-for-type-assertion",
])
  jsRules[`anti-slop/${rule}`] = "off";

const pendingGroups = new Map<string, OxlintOverride>();
for (const { rule, workspace } of process.env.CORE_LINT_AUDIT_PENDING === "1"
  ? []
  : readPending()) {
  if (!policyRules.has(rule) || parityRules.has(rule))
    throw new Error(`Refusing to disable non-policy or parity rule: ${rule}`);
  const key = workspace ?? "*";
  const group = pendingGroups.get(key) ?? {
    files: [workspace && workspace !== "(root)" ? `${workspace}/**` : source],
    ...(workspace === "(root)" ? { excludeFiles: ["*/**"] } : {}),
  };
  group.rules = { ...group.rules, [configName(rule)]: "off" };
  pendingGroups.set(key, group);
}

export default defineConfig({
  extends: [core, antiSlop],
  categories: { correctness: "off" },
  plugins: [...core.plugins, ...react.plugins, ...next.plugins, "vitest"],
  jsPlugins: [
    ...antiSlop.jsPlugins,
    { name: "query", specifier: "@tanstack/eslint-plugin-query" },
    { name: "playwright", specifier: "eslint-plugin-playwright" },
  ],
  settings: {
    next: { rootDir: apps },
    playwright: { globalAliases: { test: ["test"], expect: ["expect"] } },
  },
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
    "tests/fixtures/skills/**", // Mirrored upstream skill samples, not authored test helpers.
    "tests/fixtures/capability-registry/**", // The negative compiler suite asserts the unmodified native diagnostics.
    "scripts/archon-factory/pack/**", // Released factory pack: a change is a new pack release under its own review.
    "vendor/react-pdf-packages/**", // Unpacked third-party PDF distributions.
    "apps/*/bones/registry.ts", // Generated Boneyard component registries.
  ],
  overrides: [
    {
      files: framework.map((area) => `${area}/**/*.{tsx,jsx}`),
      rules: {
        ...Object.fromEntries(
          Object.entries(react.rules).filter(([name]) => jsxRule(name)),
        ),
        "react/no-danger": "error",
      },
    },
    {
      files: framework.map((area) => `${area}/${typescript}`),
      rules: {
        ...Object.fromEntries(
          Object.entries(react.rules).filter(([name]) => !jsxRule(name)),
        ),
        "react/incompatible-library": "error",
      },
    },
    { files: apps.map((dir) => `${dir}/${source}`), rules: next.rules },
    {
      files: [
        "tests/unit/**/*.test.{ts,tsx}",
        "packages/api/tests/unit/**/*.test.{ts,tsx}",
        "packages/auth/**/*.test.ts",
        "apps/factory-console/tests/**/*.test.ts",
      ],
      excludeFiles: e2e,
      rules: vitestRules,
    },
    { files: e2e, rules: playwrightRules },
    { files: [typescript], rules: queryRules },
    { files: [source], rules: { ...adaptations, ...off(parityRules) } },
    { files: ["**/*.{js,mjs,cjs,jsx}"], rules: jsRules },
    {
      files: [`${fixtureDirectory}/*.{ts,tsx}`],
      excludeFiles: fixtureProgram.include.map(
        (glob) => `${fixtureDirectory}/${glob}`,
      ),
      rules: off(typedRules),
    }, // TS-3: these Vite fixtures have no TypeScript program; syntax and framework rules still apply.
    { files: tests, rules: { "anti-slop/no-unknown-parameters": "off" } }, // Negative-test helpers deliberately accept invalid boundary input.
    {
      files: ["scripts/**", "tooling/**"],
      excludeFiles: tests,
      rules: { "anti-slop/no-unknown-parameters": "off" },
    }, // Validators for CLI, filesystem and subprocess input cannot assume a trusted caller.
    ...parityGroups.values(),
    ...importTiers,
    {
      files: apps.map((dir) => `${dir}/**/*.{ts,tsx,mts,cts,js,jsx,mjs}`),
      excludeFiles: ["**/*.config.mjs"],
      rules: { "react/no-unsafe": ["error", { checkAliases: true }] },
    },
    {
      files: vendoredGrid,
      rules: {
        ...off([...policyRules].filter((rule) => !parityRules.has(rule))),
        "react/exhaustive-deps": "off",
      },
    }, // Preserve incumbent checks except the nine upstream hook lists; no new policy on vendored bytes.
    ...pendingGroups.values(),
  ],
});
