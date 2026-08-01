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

    // connection() opts the whole route out of prerendering, which drops the
    // profile copy and its JSON-LD from the crawler-visible HTML.
    expect(source).not.toMatch(/^\s*import\s+\{[^}]*\bconnection\b/m);
    expect(source).not.toMatch(/await connection\(\)/);
  });

  it("keeps the sign route's connection() inside its Suspense child", () => {
    const source = read(
      "apps/donor/app/(public)/(solid)/sign/[token]/page.tsx",
    );

    // connection() in the default export opts the whole route out of
    // prerendering; it only stays cheap while it is isolated in its own child.
    expect(source).toMatch(
      /const RequestTimeMetadataBoundary = async \(\) => \{\s*await connection\(\)/,
    );
    expect(source).toMatch(/<Suspense[\s\S]*?<RequestTimeMetadataBoundary \/>/);

    // Matching `async` too matters: `indexOf("export default function Page")`
    // returns -1 the moment the page becomes async, and slice(-1) would make
    // the assertion below pass against the exact regression it guards.
    const defaultExportIndex = source.search(
      /export default (?:async )?function Page/,
    );
    expect(defaultExportIndex).toBeGreaterThan(-1);
    expect(source.slice(defaultExportIndex)).not.toMatch(
      /await connection\(\)/,
    );
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

  it("keeps the donor dashboard role gate ahead of any render", () => {
    const source = read(
      "apps/donor/app/(dashboard)/donor-dashboard/layout.tsx",
    );

    // The dashboard group boundary wraps this layout from above; the gate below
    // is the app's only role enforcement, so it must still run before children.
    expect(source).toMatch(/hasAnyContextRole/);
    expect(source).toMatch(/redirect\("\/no-access"\)/);

    const gateIndex = source.indexOf("hasAnyContextRole");
    const renderIndex = source.indexOf("return (");
    expect(gateIndex).toBeGreaterThan(-1);
    expect(renderIndex).toBeGreaterThan(gateIndex);
  });
});
