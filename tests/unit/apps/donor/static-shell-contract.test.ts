import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

/**
 * Source-text guards for the donor static shell.
 *
 * Under Cache Components every public route's crawler-visible HTML depends on
 * request reads staying out of shared chrome. Each regression below produces a
 * perfectly green build while silently emptying the prerendered HTML, so a
 * build gate cannot catch them — only these assertions can.
 *
 * The `(dashboard)` assertions ride along rather than living in a separate
 * suite: the same class of silent regression applies to the Suspense boundary
 * this change added above the dashboard's auth-gated layout.
 */
const readRaw = (relativePath: string) =>
  readFileSync(
    fileURLToPath(new URL(`../../../../${relativePath}`, import.meta.url)),
    "utf8",
  );

/**
 * The files below document *why* each banned API is banned, so a naive text
 * match would trip on its own explanation. Assert against code only.
 */
const stripComments = (source: string) =>
  source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");

const read = (relativePath: string) => stripComments(readRaw(relativePath));

/**
 * The balanced `{...}` body of the function declared at or after `fromIndex`.
 *
 * Skips the parameter list first: `function Page({ params }: PageProps)` opens
 * a brace before the body does, and reading that one instead makes every
 * assertion about the body pass vacuously.
 */
const functionBodyAt = (source: string, fromIndex: number) => {
  let cursor = source.indexOf("(", fromIndex);
  if (cursor === -1) {
    return "";
  }

  let parens = 0;
  for (; cursor < source.length; cursor += 1) {
    if (source[cursor] === "(") {
      parens += 1;
    } else if (source[cursor] === ")") {
      parens -= 1;
      if (parens === 0) {
        cursor += 1;
        break;
      }
    }
  }

  const open = source.indexOf("{", cursor);
  if (open === -1) {
    return "";
  }

  let depth = 0;
  for (let i = open; i < source.length; i += 1) {
    if (source[i] === "{") {
      depth += 1;
    } else if (source[i] === "}") {
      depth -= 1;
      if (depth === 0) {
        return source.slice(open, i + 1);
      }
    }
  }

  return source.slice(open);
};

/**
 * The real invariant behind "no `connection()` on this route": the route may
 * defer one child at request time, but the page body itself must stay
 * prerenderable. `connection()` in the default export opts the whole route out
 * and empties the crawler-visible HTML; inside a `<Suspense>` child it defers
 * only that child.
 *
 * Anchored on behaviour, not on a component name: the owner is read out of the
 * source and then required to be the component the boundary renders, so a
 * rename cannot quietly make the guard vacuous.
 */
const expectConnectionIsolatedInSuspenseChild = (
  source: string,
  defaultExportName: string,
) => {
  const connectionIndex = source.indexOf("await connection()");
  expect(connectionIndex).toBeGreaterThan(-1);

  // The declaration the call sits in is the last one opened before it.
  const owner = [
    ...source.slice(0, connectionIndex).matchAll(/(?:async function|const)\s+(\w+)/g),
  ].at(-1)?.[1];
  expect(owner).toBeTruthy();

  // No nested `<Suspense>` may sit between the boundary and the owner, or a
  // component under some *other* boundary would satisfy this.
  expect(source).toMatch(
    new RegExp(`<Suspense(?:(?!</?Suspense)[\\s\\S])*?<${owner}[\\s\\S]*?/>`),
  );

  // Matching `async` too matters: the search returns -1 the moment the page
  // becomes async, and an unanchored slice would pass against the exact
  // regression this guards.
  const defaultExportIndex = source.search(
    new RegExp(`export default (?:async )?function ${defaultExportName}\\b`),
  );
  expect(defaultExportIndex).toBeGreaterThan(-1);

  const body = functionBodyAt(source, defaultExportIndex);
  expect(body).toMatch(/return \(/);
  expect(body).not.toMatch(/await connection\(\)/);
};

describe("donor shell contract: public static shell + dashboard gate ordering", () => {
  it("keeps the donor root layout free of a Suspense boundary", () => {
    const source = read("apps/donor/app/layout.tsx");

    // A boundary here excludes every route below it from the static shell —
    // including siblings that never suspend — so all public HTML ends up inside
    // <div hidden> and only appears once inline JS runs.
    expect(source).not.toMatch(/<Suspense/);
    expect(source).not.toMatch(/from\s+["']react["'][\s\S]*Suspense/);
    expect(source).not.toMatch(/\bSuspense\b/);
  });

  it("keeps the public navbar free of URL reads", () => {
    const source = read("packages/ui/components/public/navbar-client.tsx");

    // usePathname() in shared chrome is request data: it blocks prerendering
    // for every public route with a dynamic param.
    expect(source).not.toMatch(/usePathname/);
    expect(source).not.toMatch(/HERO_PAGES/);
    expect(source).toMatch(/variant === "hero"/);
  });

  it("keeps the route view-transition template free of URL reads", () => {
    const source = read(
      "packages/ui/components/view-transitions/route-main-template.tsx",
    );

    // The remount key must come from template.tsx, not from the pathname.
    expect(source).not.toMatch(/usePathname/);
    expect(source).not.toMatch(/key=\{pathname\}/);
  });

  it("pins the navbar variant of each public route group", () => {
    expect(read("apps/donor/app/(public)/(hero)/layout.tsx")).toMatch(
      /variant="hero"/,
    );
    expect(read("apps/donor/app/(public)/(solid)/layout.tsx")).toMatch(
      /variant="solid"/,
    );
  });

  it("keeps every public page inside a navbar route group", () => {
    const publicRoot = fileURLToPath(
      new URL("../../../../apps/donor/app/(public)", import.meta.url),
    );
    const pages = readdirSync(publicRoot, {
      recursive: true,
      encoding: "utf8",
    })
      // readdirSync returns backslash-separated paths on Windows.
      .map((entry) => entry.replaceAll("\\", "/"))
      .filter((entry) => entry.endsWith("page.tsx"));

    // Only (hero) and (solid) pin a navbar variant. A page added directly under
    // (public) renders with no navbar at all, and nothing else would catch it.
    expect(pages.length).toBeGreaterThan(0);
    for (const page of pages) {
      expect(page).toMatch(/^\((hero|solid)\)\//);
    }
  });

  it("keeps worker profiles prerenderable", () => {
    const source = read(
      "apps/donor/app/(public)/(solid)/workers/[id]/page.tsx",
    );

    // connection() in the page body opts the whole route out of prerendering,
    // which drops the profile copy and its JSON-LD from the crawler-visible
    // HTML. Inside a Suspense-isolated child it only defers that child, which
    // is how the request-fresh giving widget stays out of the static shell.
    expectConnectionIsolatedInSuspenseChild(source, "WorkerProfilePage");

    // The JSON-LD is the crawler payload; it has to sit above every boundary.
    const jsonLdIndex = source.indexOf("<WorkerJsonLd");
    const firstSuspenseIndex = source.indexOf("<Suspense");
    expect(jsonLdIndex).toBeGreaterThan(-1);
    expect(firstSuspenseIndex).toBeGreaterThan(jsonLdIndex);
  });

  it("keeps the sign route's connection() inside its Suspense child", () => {
    const source = read(
      "apps/donor/app/(public)/(solid)/sign/[token]/page.tsx",
    );

    // connection() in the default export opts the whole route out of
    // prerendering; it only stays cheap while it is isolated in its own child.
    expectConnectionIsolatedInSuspenseChild(source, "Page");
  });

  it("keeps the home route's request read below a Suspense boundary", () => {
    const source = read("apps/donor/app/(public)/(hero)/page.tsx");

    // The CMS read is the route's only request-time work. Hoisting it into the
    // page body or into HomeHero pulls the above-the-fold shell dynamic.
    expect(source).toMatch(
      /<Suspense[\s\S]*?<LatestMinistryUpdates \/>[\s\S]*?<\/Suspense>/,
    );
    expect(source).not.toMatch(/\bheaders\b/);
    expect(source).not.toMatch(/\bconnection\b/);
  });

  it("keeps the dashboard group's Suspense boundary in place", () => {
    const source = read("apps/donor/app/(dashboard)/layout.tsx");

    // The nested donor-dashboard layout awaits getAuthContext(), and a
    // loading.tsx cannot wrap its own segment's layout, so the boundary has to
    // stay one level up. Without it that cookie read blocks the whole group.
    expect(source).toMatch(/<Suspense/);
    expect(source).toMatch(/DashboardShellSkeleton/);
  });

  it("keeps the donor dashboard role gate in the layout", () => {
    const source = read(
      "apps/donor/app/(dashboard)/donor-dashboard/layout.tsx",
    );

    // Defence in depth. It renders as a sibling of {children} so the dashboard
    // still gets a static shell, which is only safe while the edge below is the
    // primary gate — the two assertions have to move together.
    expect(source).toMatch(/hasAnyContextRole/);
    expect(source).toMatch(/redirect\("\/no-access"\)/);
  });

  it("keeps the edge as the primary role gate for the dashboard", () => {
    const source = read("apps/donor/proxy.ts");

    // A sibling gate redirects *after* children render, so a wrong-role visitor
    // must never reach the app at all. Losing any one of these silently demotes
    // the dashboard to the redirect-only gate above.
    expect(source).toMatch(/protectedRoutePrefixes:\s*\[[^\]]*"\/donor-dashboard"/);
    expect(source).toMatch(/allowedRoles:\s*\[[^\]]*"donor"/);
    expect(source).toMatch(/resolveUserRole:\s*resolveUserRoleFromDatabase/);

    // publicRoutes is checked before authentication and returns early, so an
    // entry here would cancel every check above it.
    const publicRoutes = source.match(/publicRoutes:\s*\[([\s\S]*?)\]/)?.[1];
    expect(publicRoutes).toBeTruthy();
    expect(publicRoutes).not.toMatch(/"\/donor-dashboard"/);
  });
});
