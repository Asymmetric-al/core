// Shared composition for the no-restricted-imports boundary rule.
//
// no-restricted-imports REPLACES (never merges) earlier rule entries for a
// matching file, so any override block that re-declares the rule must carry
// the full boundary set again or a ban silently drops. These builders own
// that knowledge: compose the rule through them instead of re-typing the
// pattern groups at every declaration site.

const crossAppPatterns = [
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

const motionPatterns = [
  {
    group: ["motion/react", "framer-motion"],
    message:
      "Import motion APIs from @asym/lib/motion (LazyMotion m + MotionConfig reducedMotion). See docs/ai/skills/anim/SKILL.md.",
  },
];

const twentyClientPatterns = [
  {
    group: [
      "@asym/api/crm/client",
      "@asym/api/crm/client/*",
      "@asym/api/src/crm/client",
      "@asym/api/src/crm/client/*",
      "**/packages/api/src/crm/client",
      "**/packages/api/src/crm/client/*",
      "**/packages/api/src/crm/client/**",
    ],
    message:
      "App code must not import raw Twenty clients. Use stable @asym/api CRM contracts and route re-exports instead.",
  },
];

const GROUPS = {
  crossApp: crossAppPatterns,
  motion: motionPatterns,
  twentyClient: twentyClientPatterns,
};

function buildRule(groupNames, options = {}) {
  const { exclude = [], extraPatterns = [], extraPaths = [] } = options;
  const patterns = groupNames
    .filter((name) => !exclude.includes(name))
    .flatMap((name) => GROUPS[name]);
  const ruleOptions = { patterns: [...patterns, ...extraPatterns] };
  if (extraPaths.length > 0) {
    ruleOptions.paths = extraPaths;
  }
  return ["error", ruleOptions];
}

/**
 * Universal boundary set for all first-party source (packages and apps):
 * cross-app imports and direct motion/react usage stay banned.
 *
 * @param {{ exclude?: Array<"crossApp"|"motion">, extraPatterns?: object[], extraPaths?: object[] }} [options]
 */
export function restrictedImports(options) {
  return buildRule(["crossApp", "motion"], options);
}

/**
 * App-code boundary set: the universal set plus the raw Twenty client ban.
 *
 * @param {{ exclude?: Array<"crossApp"|"motion"|"twentyClient">, extraPatterns?: object[], extraPaths?: object[] }} [options]
 */
export function appRestrictedImports(options) {
  return buildRule(["crossApp", "twentyClient", "motion"], options);
}
