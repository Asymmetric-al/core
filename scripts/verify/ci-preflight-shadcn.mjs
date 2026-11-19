// Which root manifest and lock changes select the shadcn upstream review in
// the fast pre-push profile (scripts/verify/ci-preflight.mjs). The review
// itself (shadcn-diff.mjs) stays free of imports: it runs on its own.
import { parseBunLock } from "./bun-lock-drift.mjs";

const UI_DIRECTORY = "packages/ui";

// Root manifest keys that cannot change what the shadcn CLI resolves. The
// CLI reads the root manifest for the package manager (packageManager,
// devEngines) and the workspaces; Bun resolves the CLI's own dependency tree
// from the shadcn entry and any resolution setting (overrides, patches).
// Any other key is compared, so an unknown one counts as a change.
const IRRELEVANT_MANIFEST_KEYS = new Set([
  "name",
  "version",
  "private",
  "license",
  "description",
  "keywords",
  "author",
  "repository",
  "homepage",
  "bugs",
  "scripts",
  "lint-staged",
  "engines",
]);
const DEPENDENCY_GROUPS = [
  "dependencies",
  "devDependencies",
  "peerDependencies",
  "optionalDependencies",
];

function plainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : null;
}

function manifestProjection(text) {
  const manifest = plainObject(JSON.parse(text));
  if (!manifest) throw new Error("not a manifest");
  const projection = {};
  for (const [key, value] of Object.entries(manifest)) {
    if (IRRELEVANT_MANIFEST_KEYS.has(key)) continue;
    projection[key] = DEPENDENCY_GROUPS.includes(key)
      ? (plainObject(value)?.shadcn ?? null)
      : value;
  }
  return projection;
}

// A bun.lock package key names a chain of packages ("shadcn/cn" is the cn
// that shadcn depends on); scoped names keep their "@scope/" part.
function lockKeyNames(key) {
  const parts = key.split("/");
  const names = [];
  for (let index = 0; index < parts.length; index += 1)
    names.push(
      parts[index].startsWith("@") && index + 1 < parts.length
        ? `${parts[index]}/${parts[++index]}`
        : parts[index],
    );
  return names;
}

// Bun's lookup: the dependency nested under the package, then under each
// ancestor, then hoisted.
function lockDependencyKey(packages, from, name) {
  for (let scope = lockKeyNames(from); scope.length > 0; scope.pop()) {
    const candidate = `${scope.join("/")}/${name}`;
    if (Object.hasOwn(packages, candidate)) return candidate;
  }
  return Object.hasOwn(packages, name) ? name : null;
}

function lockProjection(text) {
  const lock = plainObject(parseBunLock(text));
  const packages = plainObject(lock?.packages);
  const workspaces = plainObject(lock?.workspaces);
  if (!packages || !workspaces || !Object.hasOwn(packages, "shadcn"))
    throw new Error("no shadcn entry");
  // The CLI's own dependency tree, as Bun resolves it.
  const tree = new Set();
  const pending = ["shadcn"];
  while (pending.length > 0) {
    const key = pending.pop();
    if (tree.has(key)) continue;
    tree.add(key);
    const entry = packages[key];
    if (!Array.isArray(entry)) throw new Error(`unreadable entry ${key}`);
    const meta = entry.find((part) => plainObject(part)) ?? {};
    for (const group of [
      "dependencies",
      "optionalDependencies",
      "peerDependencies",
    ])
      for (const name of Object.keys(plainObject(meta[group]) ?? {})) {
        const dependency = lockDependencyKey(packages, key, name);
        if (dependency !== null) pending.push(dependency);
      }
  }
  const { workspaces: _workspaces, packages: _packages, ...settings } = lock;
  return {
    settings,
    rootShadcn: DEPENDENCY_GROUPS.map(
      (group) => plainObject(workspaces[""]?.[group])?.shadcn ?? null,
    ),
    ui: workspaces[UI_DIRECTORY] ?? null,
    tree: [...tree].sort().map((key) => [key, packages[key]]),
  };
}

// Root files the CLI reads only through what they resolve; a change to one
// selects the review only when shadcnResolutionChanged says so.
export const SHADCN_RESOLUTION_FILES = Object.freeze([
  "package.json",
  "bun.lock",
]);

/**
 * Whether a change to the root package.json or bun.lock can change what the
 * shadcn CLI resolves: the shadcn version and its dependency tree, the UI
 * workspace's dependency entries, the package manager, the workspaces and
 * resolution settings. `before` and `after` are the file's text (null when
 * absent). Any other file, an absent side or unreadable text answers true:
 * when it cannot tell, the review runs.
 */
export function shadcnResolutionChanged(file, before, after) {
  const project =
    file === "package.json"
      ? manifestProjection
      : file === "bun.lock"
        ? lockProjection
        : null;
  if (!project || typeof before !== "string" || typeof after !== "string")
    return true;
  try {
    return JSON.stringify(project(before)) !== JSON.stringify(project(after));
  } catch {
    return true;
  }
}
