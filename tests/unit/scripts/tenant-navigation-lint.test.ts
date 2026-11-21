import path from "node:path";

import { ESLint } from "eslint";
import { describe, expect, it } from "vitest";

/**
 * One way to build an address (plan 5.2; AL-2675; council round 1, A10). The
 * rule replaces the regular-expression boundary test: it runs through each
 * workspace's real ESLint configuration, across Mission Control, the
 * missionary workspace and the shared packages, with the helper modules as
 * the only exception.
 */

const root = process.cwd();
const RULE = "tenant-navigation/no-prefixless-navigation";

/** One file in each covered place, signed-in and outside pages alike. */
const COVERED = [
  ["apps/admin", "features/probe/probe.tsx"],
  ["apps/admin", "lib/admin-access-probe.tsx"],
  ["apps/admin", "app/(app)/probe/page.tsx"],
  ["apps/admin", "app/(auth)/probe/page.tsx"],
  ["apps/missionary", "app/layout-probe.tsx"],
  ["apps/missionary", "components/probe.tsx"],
  ["packages/ui", "components/app-shell/probe.tsx"],
  ["packages/lib", "probe.tsx"],
  ["packages/missionary", "components/probe.tsx"],
  ["packages/api", "src/probe.tsx"],
  ["packages/auth", "probe.tsx"],
  ["packages/database", "probe.tsx"],
] as const;

/** The helper modules: the only files where the originals are used. */
const HELPERS = [
  ["packages/auth", "tenant-navigation.tsx"],
  ["packages/auth", "tenant-server.ts"],
  ["packages/database", "document-reload.ts"],
] as const;

const OFFENDING: ReadonlyArray<[string, string]> = [
  [
    "next/link",
    'import Link from "next/link";\nexport const A = () => <Link href="/crm">x</Link>;',
  ],
  [
    "useRouter",
    'import { useRouter } from "next/navigation";\nexport { useRouter };',
  ],
  [
    "usePathname",
    'import { usePathname as p } from "next/navigation";\nexport { p };',
  ],
  [
    "redirect",
    'import { redirect } from "next/navigation";\nexport { redirect };',
  ],
  [
    "permanentRedirect",
    'import { permanentRedirect } from "next/navigation";\nexport { permanentRedirect };',
  ],
  ["import * as", 'import * as nav from "next/navigation";\nexport { nav };'],
  ["require", 'export const nav = require("next/navigation");'],
  ["dynamic import()", 'export const load = () => import("next/link");'],
  ["re-export", 'export { redirect } from "next/navigation";'],
  ["export *", 'export * from "next/navigation";'],
  ["<a href>", 'export const A = () => <a href="/crm">x</a>;'],
  [
    "<a href> template",
    "export const A = ({ id }: { id: string }) => <a href={`/donors/${id}`}>x</a>;",
  ],
  [
    "ButtonLink without render",
    'import { ButtonLink } from "@asym/ui/components/shadcn/button";\nexport const A = () => <ButtonLink href="/crm">x</ButtonLink>;',
  ],
  [
    "window.location.href write",
    'export function go() { window.location.href = "/crm"; }',
  ],
  [
    "window.location write",
    'export function go() { window.location = "/crm" as never; }',
  ],
  [
    "location.assign",
    'export function go() { window.location.assign("/crm"); }',
  ],
  ["location.replace", 'export function go() { location.replace("/crm"); }'],
  // Council round 2, AR1: a history write whose address is not the live
  // location's or the tenant helper's (the CRM list wrote the route path).
  [
    "history.replaceState with a path",
    'export function go(q: string) { window.history.replaceState(null, "", "/crm?" + q); }',
  ],
  [
    "history.pushState with the route path",
    'export function go(pathname: string, q: string) { history.pushState(null, "", `${pathname}?${q}`); }',
  ],
  // Council round 3, AR15: only the path part counts. The location may
  // supply the query or the origin, and the path still drops the prefix.
  [
    "history.replaceState with the route path and the live query",
    'import { useRoutePathname } from "@asym/auth/tenant-navigation";\nexport function useGo() { const pathname = useRoutePathname(); return () => { const query = new URLSearchParams(window.location.search); window.history.replaceState(null, "", `${pathname}?${query}`); }; }',
  ],
  [
    "history.replaceState with a path followed by the live query",
    'export function go(pathname: string) { window.history.replaceState(null, "", pathname + location.search); }',
  ],
  [
    "history.pushState with a path resolved against the live origin",
    'export function go() { window.history.pushState(null, "", new URL("/crm", window.location.origin)); }',
  ],
  [
    "a write through an alias of history",
    'export function go() { const h = window.history; h.replaceState(null, "", "/crm"); }',
  ],
  [
    "next/form",
    'import Form from "next/form";\nexport const A = () => <Form action="/search">x</Form>;',
  ],
  ["<form action>", 'export const A = () => <form action="/search">x</form>;'],
];

const ALLOWED: ReadonlyArray<[string, string]> = [
  [
    "TenantLink",
    'import { TenantLink } from "@asym/auth/tenant-navigation";\nexport const A = () => <TenantLink href="/crm">x</TenantLink>;',
  ],
  [
    "TenantLink under another name",
    'import { TenantLink as Link } from "@asym/auth/tenant-navigation";\nexport const A = () => <Link href="/crm">x</Link>;',
  ],
  [
    "a link rendered through TenantLink",
    'import { TenantLink } from "@asym/auth/tenant-navigation";\nimport { ButtonLink } from "@asym/ui/components/shadcn/button";\nexport const A = () => <ButtonLink href="/crm" render={<TenantLink href="/crm" />}>x</ButtonLink>;',
  ],
  [
    "the navigation APIs that build no address",
    'import { notFound, useParams, useSearchParams } from "next/navigation";\nexport { notFound, useParams, useSearchParams };',
  ],
  [
    "the tenant helpers",
    'import { useRoutePathname, useTenantRouter } from "@asym/auth/tenant-navigation";\nimport { redirectInTenant } from "@asym/auth/tenant-server";\nexport { redirectInTenant, useRoutePathname, useTenantRouter };',
  ],
  [
    "an asset href on an element that is not a link",
    'export const A = () => <link rel="manifest" href="/manifest.webmanifest" />;',
  ],
  [
    "external, fragment and mail hrefs",
    'export const A = () => (<><a href="https://example.com/x">x</a><a href="#top">t</a><a href="mailto:a@example.com">m</a></>);',
  ],
  ["a reload", "export function go() { window.location.reload(); }"],
  [
    "a local variable named location",
    'export function f() { const location = { href: "" }; location.href = "/x"; return location; }',
  ],
  [
    "a type-only import",
    'import type { LinkProps } from "next/link";\nexport type P = LinkProps<string>;',
  ],
  [
    "a history write from the live location",
    'export function go(q: string) { window.history.replaceState(null, "", `${window.location.pathname}?${q}`); }',
  ],
  [
    "the CRM list's write: the live path, with or without a query",
    'export function go(q: string) { const address = window.location.pathname; window.history.replaceState(null, "", q ? `${address}?${q}` : address); }',
  ],
  [
    "a history write of a URL from the live location, as text",
    'export function go() { const url = new URL(window.location.href); url.searchParams.set("tab", "x"); window.history.replaceState(null, "", url.toString()); window.history.replaceState(null, "", url.href); }',
  ],
  [
    "a history write of a URL built from the live location",
    'export function go() { const url = new URL(window.location.href); url.searchParams.set("tab", "x"); window.history.pushState(window.history.state, "", url); }',
  ],
  [
    "a history write of state only, a fragment or a query",
    'export function go(q: string) { history.replaceState({ a: 1 }, ""); window.history.replaceState(null, "", "#top"); window.history.replaceState(null, "", "?" + q); }',
  ],
  [
    "a history write through the tenant helper",
    'import { useTenantHref } from "@asym/auth/tenant-navigation";\nexport function useGo() { const toHref = useTenantHref(); return () => window.history.pushState(null, "", toHref("/crm")); }',
  ],
];

function eslintFor(workspace: string) {
  return new ESLint({
    cwd: path.join(root, workspace),
    overrideConfigFile: path.join(root, workspace, "eslint.config.mjs"),
    overrideConfig: {
      languageOptions: { parserOptions: { projectService: false } },
    },
  });
}

async function ruleMessages(
  eslint: ESLint,
  workspace: string,
  file: string,
  code: string,
) {
  const [result] = await eslint.lintText(code, {
    filePath: path.join(root, workspace, file),
  });
  return result!.messages.filter((message) => message.ruleId === RULE);
}

describe("the tenant navigation rule", () => {
  describe.each(COVERED)("in %s/%s", (workspace, file) => {
    const eslint = eslintFor(workspace);

    it.each(OFFENDING)("reports %s", async (_label, code) => {
      const messages = await ruleMessages(eslint, workspace, file, code);
      expect(messages.length).toBeGreaterThan(0);
      expect(messages.every((message) => message.severity === 2)).toBe(true);
    });

    it.each(ALLOWED)("allows %s", async (_label, code) => {
      expect(await ruleMessages(eslint, workspace, file, code)).toEqual([]);
    });
  });

  it.each(HELPERS)(
    "leaves the helper module %s/%s, which implements the rule, alone",
    async (workspace, file) => {
      const eslint = eslintFor(workspace);
      for (const [, code] of OFFENDING) {
        expect(await ruleMessages(eslint, workspace, file, code)).toEqual([]);
      }
    },
  );

  // Payload's Link renders through the router adapter, which is built on the
  // tenant helpers; only Mission Control, which hosts Web Studio, trusts it.
  it("trusts Payload's Link, and Web Studio's re-export of it, in Mission Control only", async () => {
    const admin = eslintFor("apps/admin");
    const payload =
      'import { Link } from "@payloadcms/ui";\nexport const A = () => <Link href="/web-studio">x</Link>;';
    const reExport =
      'import { Link } from "../routing";\nexport const A = () => <Link href="/">x</Link>;';
    const elsewhere =
      'import { Link } from "../other";\nexport const A = () => <Link href="/">x</Link>;';
    const flow = "src/cms-ui/web-studio/flows/probe.tsx";

    expect(await ruleMessages(admin, "apps/admin", flow, payload)).toEqual([]);
    expect(await ruleMessages(admin, "apps/admin", flow, reExport)).toEqual([]);
    expect(
      await ruleMessages(admin, "apps/admin", flow, elsewhere),
    ).toHaveLength(1);
    expect(
      await ruleMessages(
        eslintFor("apps/missionary"),
        "apps/missionary",
        "components/probe.tsx",
        payload,
      ),
    ).toHaveLength(1);
  });

  it("names the helper to use", async () => {
    const eslint = eslintFor("apps/admin");
    const messages = await ruleMessages(
      eslint,
      "apps/admin",
      "features/probe/probe.tsx",
      'import { useRouter, redirect } from "next/navigation";\nexport { useRouter, redirect };',
    );
    expect(messages.map((message) => message.message)).toEqual([
      expect.stringContaining(
        "use useTenantRouter from @asym/auth/tenant-navigation",
      ),
      expect.stringContaining(
        "use redirectInTenant from @asym/auth/tenant-server",
      ),
    ]);
  });

  it("applies from the root configuration too, and not to the donor portal", async () => {
    const eslint = new ESLint({
      cwd: root,
      overrideConfigFile: path.join(root, "eslint.config.mjs"),
      overrideConfig: {
        languageOptions: { parserOptions: { projectService: false } },
      },
    });
    const code = 'import Link from "next/link";\nexport { Link };';
    for (const [workspace, file] of COVERED) {
      const [result] = await eslint.lintText(code, {
        filePath: path.join(root, workspace, file),
      });
      expect(
        result!.messages.some((message) => message.ruleId === RULE),
        `${workspace}/${file}`,
      ).toBe(true);
    }
    const [donor] = await eslint.lintText(code, {
      filePath: path.join(root, "apps/donor/components/probe.tsx"),
    });
    expect(donor!.messages.some((message) => message.ruleId === RULE)).toBe(
      false,
    );
  });
});
