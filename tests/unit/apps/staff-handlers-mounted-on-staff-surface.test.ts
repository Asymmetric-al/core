import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { globSync } from "glob";
import { describe, expect, it } from "vitest";

import {
  CAPABILITY_BUNDLES,
  ROLE_DEFAULT_BUNDLES,
} from "../../../packages/auth/capabilities";

/**
 * Council round 1 on WP2a, F9: a handler is mounted where someone can pass
 * its check.
 *
 * Each app's proxy fixes the role class of every request (plan 5.1): staff in
 * Mission Control, donor in the donor app, missionary in the missionary
 * workspace. A capability comes only from the row the request acts under:
 * donor rows hold none (the registry's `member:donor` grants no bundle), and
 * missionary rows hold `missionary_partners` (`partners.add`, AL-2678), which no
 * staff subject holds; the tenant-administrator flag lives
 * only on a staff row. So a route whose handler requires a capability its
 * app's class cannot hold, or the flag outside Mission Control, can never be
 * used: the outbox catch-up for stuck donation saga work was such a route,
 * mounted only in the donor app.
 *
 * For every route file of the three product apps, this reads the route and
 * the modules it imports (two levels, through re-exports and package
 * exports) for capability and administrator checks, and compares them with
 * what the app's class can hold, computed from the registry.
 */

const root = fileURLToPath(new URL("../../../", import.meta.url));
const APPS = ["admin", "donor", "missionary"] as const;
type App = (typeof APPS)[number];
type RoleClass = "staff" | "donor" | "missionary";
const EXT = [".ts", ".tsx", ".js", ".mjs"];

/**
 * Routes left as they are, with the reason. GraphQL in the donor app: its
 * staff and missionary branches are unreachable from the donor surface, and
 * the package that owns each surface moves or deletes them (record section 9,
 * "WP2c, WP3"); `updateUserRole` was one too, and WP2c (AL-2675) deleted it.
 * Nothing else may be listed. The last case below keeps GraphQL in the donor
 * app and nowhere else (PR #2720 review).
 */
const LEFT_UNTIL_WP2C = new Set(["apps/donor/app/api/graphql/route.ts"]);

const CROSS_SURFACE_MEDIA_ROUTES = new Set([
  "apps/donor/app/api/media/[assetId]/route.ts",
  "apps/missionary/app/api/media/[assetId]/route.ts",
]);

function proxyClass(app: App): RoleClass {
  const text = readFileSync(join(root, `apps/${app}/proxy.ts`), "utf8");
  const match = text.match(/roleClass:\s*["'](staff|donor|missionary)["']/);
  if (!match) throw new Error(`apps/${app}/proxy.ts names no role class`);
  return match[1] as RoleClass;
}

/** Capabilities a row of the class can hold, from the registry. */
function holdable(roleClass: RoleClass): Set<string> {
  const subjects = Object.keys(ROLE_DEFAULT_BUNDLES).filter((subject) =>
    roleClass === "staff"
      ? subject.startsWith("staff:") || subject === "tenant_admin"
      : subject === `member:${roleClass}`,
  );
  const capabilities = new Set<string>();
  for (const subject of subjects)
    for (const bundle of ROLE_DEFAULT_BUNDLES[
      subject as keyof typeof ROLE_DEFAULT_BUNDLES
    ])
      for (const capability of CAPABILITY_BUNDLES[bundle])
        capabilities.add(capability);
  return capabilities;
}

function exportTarget(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const conditions = value as Record<string, unknown>;
    for (const key of ["import", "default", "require", "types"]) {
      const target = exportTarget(conditions[key]);
      if (target) return target;
    }
  }
  return null;
}

const packages = new Map<
  string,
  { dir: string; exports: Map<string, string> }
>();
for (const manifest of globSync("packages/*/package.json", { cwd: root })) {
  const json = JSON.parse(readFileSync(join(root, manifest), "utf8")) as {
    name?: string;
    exports?: Record<string, unknown> | string;
  };
  if (!json.name) continue;
  const exports = new Map<string, string>();
  if (typeof json.exports === "string") exports.set(".", json.exports);
  else
    for (const [key, value] of Object.entries(json.exports ?? {})) {
      const target = exportTarget(value);
      if (target) exports.set(key, target);
    }
  packages.set(json.name, { dir: dirname(manifest), exports });
}

function resolveFile(base: string): string | null {
  for (const candidate of [
    base,
    ...EXT.map((e) => base + e),
    ...EXT.map((e) => join(base, "index" + e)),
  ])
    if (
      EXT.some((e) => candidate.endsWith(e)) &&
      existsSync(join(root, candidate))
    )
      return candidate.replaceAll("\\", "/");
  return null;
}

function resolveImport(from: string, specifier: string): string | null {
  if (specifier.startsWith("."))
    return resolveFile(join(dirname(from), specifier));
  if (specifier.startsWith("@/")) {
    const app = from.match(/^apps\/([^/]+)\//)?.[1];
    return app ? resolveFile(join("apps", app, specifier.slice(2))) : null;
  }
  const parts = specifier.split("/");
  const name = specifier.startsWith("@")
    ? parts.slice(0, 2).join("/")
    : parts[0]!;
  const pkg = packages.get(name);
  if (!pkg) return null;
  const target = pkg.exports.get("." + specifier.slice(name.length));
  return target ? resolveFile(join(pkg.dir, target)) : null;
}

function importsOf(file: string): string[] {
  const text = readFileSync(join(root, file), "utf8");
  return [...text.matchAll(/(?:import|export)\s[^;]*?from\s+["']([^"']+)["']/g)]
    .filter((m) => !/^(?:import|export)\s+type\s/.test(m[0]))
    .map((m) => resolveImport(file, m[1]!))
    .filter((target): target is string => target !== null);
}

/** The route and what it imports, two levels deep. */
function handlerSources(route: string): string[] {
  const seen = new Set([route]);
  let level = [route];
  for (let depth = 0; depth < 2; depth++) {
    level = level.flatMap(importsOf).filter((f) => !seen.has(f));
    for (const f of level) seen.add(f);
  }
  return [...seen];
}

/**
 * The checks the files make. `packages/auth` defines the checks and requires
 * nothing itself, and `withOperation` applies only the options each caller
 * passes, which are read at the call site; neither is read. A definition
 * elsewhere is not a call.
 */
const DEFINES_CHECKS = (file: string) =>
  file.startsWith("packages/auth/") ||
  file === "packages/api/src/shared/with-operation.ts";

function requirements(files: string[]) {
  const capabilities = new Set<string>();
  let administrator = false;
  for (const file of files) {
    if (DEFINES_CHECKS(file)) continue;
    const text = readFileSync(join(root, file), "utf8").replace(
      /function\s+(?:requireTenantAdministrator|isTenantAdministrator|requireCapability|hasContextCapability)\s*\(/g,
      "function definition(",
    );
    for (const m of text.matchAll(
      /(?:requireCapability|hasContextCapability)\(\s*[\w.]+\s*,\s*["']([^"']+)["']/g,
    ))
      capabilities.add(m[1]!);
    for (const m of text.matchAll(/\bcapability:\s*["']([^"']+)["']/g))
      capabilities.add(m[1]!);
    if (
      /requireTenantAdministrator\(|isTenantAdministrator\(|tenantAdministrator:\s*true/.test(
        text,
      )
    )
      administrator = true;
  }
  return { capabilities, administrator };
}

function unreachableChecks() {
  const findings: string[] = [];
  for (const app of APPS) {
    const roleClass = proxyClass(app);
    const canHold = holdable(roleClass);
    for (const route of globSync(`apps/${app}/app/**/route.{ts,tsx}`, {
      cwd: root,
    }).map((p) => p.replaceAll("\\", "/"))) {
      if (LEFT_UNTIL_WP2C.has(route)) continue;
      const { capabilities, administrator } = requirements(
        handlerSources(route),
      );
      if (
        CROSS_SURFACE_MEDIA_ROUTES.has(route) &&
        !administrator &&
        capabilities.size === 1 &&
        capabilities.has("web_studio.edit")
      )
        continue;
      const beyond = [...capabilities].filter((c) => !canHold.has(c));
      if (beyond.length > 0)
        findings.push(
          `${route} (${roleClass}) requires ${beyond.sort().join(", ")}`,
        );
      if (administrator && roleClass !== "staff")
        findings.push(
          `${route} (${roleClass}) requires the tenant-administrator flag`,
        );
    }
  }
  return findings.sort();
}

describe("staff handlers are mounted on the staff surface (AL-2675 F9)", () => {
  it("reads each app's role class from its proxy and the classes' capabilities from the registry (D-18, AL-2678 WP5 rest: a missionary holds partners.add alone)", () => {
    expect(APPS.map(proxyClass)).toEqual(["staff", "donor", "missionary"]);
    expect(holdable("staff").has("admin.gifts.manage")).toBe(true);
    expect(holdable("donor").size).toBe(0);
    expect([...holdable("missionary")]).toEqual(["partners.add"]);
  });

  it("mounts no handler where the app's class cannot pass its capability or administrator check", () => {
    expect(unreachableChecks()).toEqual([]);
  });

  it("mounts the donation saga outbox catch-up in Mission Control, with its capability", () => {
    const route = "apps/admin/app/api/donate/outbox/route.ts";
    expect(existsSync(join(root, route))).toBe(true);
    expect([...requirements(handlerSources(route)).capabilities]).toContain(
      "admin.gifts.manage",
    );
    expect(
      existsSync(join(root, "apps/donor/app/api/donate/outbox/route.ts")),
    ).toBe(false);
  });

  // PR #2720 review (AL-2675): GraphQL's `updateUserRole` ran
  // `atomic_update_user_role_with_audit`, which changed `profiles.role` and
  // nothing else; since WP2a that grants and revokes no application access.
  // No person could run it only because GraphQL is mounted in the donor app,
  // whose proxy fixes the donor class. WP2c (AL-2675) deleted the mutation and
  // the function and built plan 5.4's membership commands
  // (tests/unit/apps/donor/graphql-update-user-role-unreachable.test.ts). The
  // staff branches GraphQL keeps are still unreachable only from the donor
  // surface, so every route of every app that reaches the handler stays
  // listed here.
  it("mounts GraphQL in the donor app and nowhere else, until WP2c", () => {
    const graphql = new Set([
      "packages/graphql/index.ts",
      "packages/graphql/handler.ts",
    ]);
    const routes = globSync("apps/*/app/**/route.{ts,tsx,js,mjs}", {
      cwd: root,
    }).map((p) => p.replaceAll("\\", "/"));
    expect(routes.length).toBeGreaterThan(100);
    expect(
      routes
        .filter((route) => handlerSources(route).some((f) => graphql.has(f)))
        .sort(),
    ).toEqual(["apps/donor/app/api/graphql/route.ts"]);
  });

  it.each(["route.ts", "[requestId]/route.ts"])(
    "mounts follower decisions only in the missionary workspace: %s",
    (file) => {
      expect(
        existsSync(
          join(root, "apps/missionary/app/api/follower-requests", file),
        ),
      ).toBe(true);
      expect(
        existsSync(join(root, "apps/donor/app/api/follower-requests", file)),
      ).toBe(false);
    },
  );

  // Rewritten by AL-2675 (WP2c, part 1; record D-18). The role mutation, the
  // branch that needed `people.manage_members`, is deleted. GraphQL keeps its
  // staff branches (`admin.dashboard.access`), which the donor class cannot
  // reach, so the exemption stays real and its whole requirement is pinned;
  // the package that owns each surface moves or deletes those branches
  // (record section 9, "WP2c, WP3").
  it("leaves only GraphQL in the donor app, whose remaining exemption is its staff branches", () => {
    expect([...LEFT_UNTIL_WP2C]).toEqual([
      "apps/donor/app/api/graphql/route.ts",
    ]);
    for (const route of LEFT_UNTIL_WP2C) {
      expect(existsSync(join(root, route))).toBe(true);
      // The exemption is real: read like any other route, it would fail.
      const { capabilities } = requirements(handlerSources(route));
      expect([...capabilities].sort()).toEqual(["admin.dashboard.access"]);
      expect(capabilities.has("people.manage_members")).toBe(false);
    }
  });

  it("pins the cross-surface signed-in media mounts in donor and missionary to web_studio.edit with explicit staff context (AL-2679, plan 6.6 line 359, W6-R4)", () => {
    expect([...CROSS_SURFACE_MEDIA_ROUTES].sort()).toEqual([
      "apps/donor/app/api/media/[assetId]/route.ts",
      "apps/missionary/app/api/media/[assetId]/route.ts",
    ]);
    expect(
      existsSync(join(root, "apps/admin/app/api/media/[assetId]/route.ts")),
    ).toBe(true);
    for (const route of CROSS_SURFACE_MEDIA_ROUTES) {
      expect(existsSync(join(root, route))).toBe(true);
      const sources = handlerSources(route);
      const { capabilities, administrator } = requirements(sources);
      expect([...capabilities].sort()).toEqual(["web_studio.edit"]);
      expect(administrator).toBe(false);
      expect(
        sources.some((file) =>
          /getAuthContext\([\s\S]*?roleClass:\s*["']staff["']/.test(
            readFileSync(join(root, file), "utf8"),
          ),
        ),
      ).toBe(true);
    }
  });
});
