import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * Source-text guards for the donor static shell.
 *
 * Under Cache Components every public route's crawler-visible HTML depends on
 * request reads staying out of shared chrome. Each regression below produces a
 * perfectly green build while silently emptying the prerendered HTML, so a
 * build gate cannot catch them — only these assertions can.
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
  source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");

const read = (relativePath: string) => stripComments(readRaw(relativePath));

describe("donor static shell contract", () => {
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

  it("keeps worker profiles prerenderable", () => {
    const source = read("apps/donor/app/(public)/(solid)/workers/[id]/page.tsx");

    // connection() opts the whole route out of prerendering, which drops the
    // profile copy and its JSON-LD from the crawler-visible HTML.
    expect(source).not.toMatch(/^\s*import\s+\{[^}]*\bconnection\b/m);
    expect(source).not.toMatch(/await connection\(\)/);
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
