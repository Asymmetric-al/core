import { DEMO_TENANT_ID } from "../../../packages/auth/constants";
import {
  createE2EAuthCookieValue,
  E2E_AUTH_COOKIE_NAMES,
  type E2EAuthAppSurface,
  type E2EAuthMembership,
  type E2EAuthSession,
} from "../../../packages/auth/e2e-auth";
import {
  stripTenantAddress,
  withTenantAddress,
} from "../../../packages/auth/tenant-address";
import fixtures from "../fixtures/tenant-people.json";

import type { BrowserContext, Page } from "@playwright/test";

/**
 * Signed-in pages of Mission Control and the missionary workspace live under
 * the tenant in the page address (plan 5.2; AL-2675). Suites build those
 * addresses and read them back through these helpers.
 */

export const TENANTS = fixtures.tenants;
export const DEMO_TENANT_PREFIX = `/${DEMO_TENANT_ID}`;

/** A signed-in page address in the demo organization, as the app's links build it. */
export function demoTenantPath(path: string): string {
  return withTenantAddress(DEMO_TENANT_PREFIX, path);
}

/** A signed-in page address in any tenant, with an optional sub-role suffix. */
export function tenantPath(
  tenantId: string,
  path: string,
  subRole: string | null = null,
): string {
  return withTenantAddress(
    subRole ? `/${tenantId}~${subRole}` : `/${tenantId}`,
    path,
  );
}

/** The pathname the page files see: the address without its tenant prefix. */
export function routePathname(url: string | URL): string {
  return stripTenantAddress(new URL(url).pathname);
}

export type FixturePerson = keyof typeof fixtures.people;

export function fixturePerson(name: FixturePerson) {
  return fixtures.people[name] as {
    userId: string;
    role: E2EAuthSession["role"];
    memberships: E2EAuthMembership[];
  };
}

/**
 * The Supabase stub a production build is pointed at
 * (`tests/e2e/fixtures/supabase-stub.mjs`); unset in development, where the
 * E2E bypass signs fixture people in.
 */
const STUB_URL = process.env.E2E_SUPABASE_STUB_URL ?? null;

export const signsInThroughStub = STUB_URL !== null;

/** A Supabase session cookie the stub accepts; the token is not signed. */
async function addStubSession(
  context: BrowserContext,
  baseURL: string,
  userId: string,
) {
  const expiresAt = Math.floor(Date.now() / 1000) + 6 * 3600;
  const accessToken = [
    { alg: "HS256", typ: "JWT" },
    {
      sub: userId,
      exp: expiresAt,
      aud: "authenticated",
      role: "authenticated",
    },
  ]
    .map((part) => Buffer.from(JSON.stringify(part)).toString("base64url"))
    .concat("stub-not-a-real-signature")
    .join(".");
  const session = {
    access_token: accessToken,
    refresh_token: "stub-refresh-token",
    token_type: "bearer",
    expires_in: 6 * 3600,
    expires_at: expiresAt,
    user: {
      id: userId,
      aud: "authenticated",
      role: "authenticated",
      email: `${userId}@example.test`,
      app_metadata: { provider: "email", providers: ["email"] },
      user_metadata: {},
      created_at: "2026-11-17T00:00:00.000Z",
    },
  };
  const ref = new URL(STUB_URL!).hostname.split(".")[0];
  await context.addCookies([
    {
      name: `sb-${ref}-auth-token`,
      value: `base64-${Buffer.from(JSON.stringify(session)).toString("base64url")}`,
      url: baseURL,
      sameSite: "Lax",
    },
  ]);
}

/** Signs a fixture person in to one app, replacing any earlier session. */
export async function signInAs(
  page: Page,
  surface: E2EAuthAppSurface,
  name: FixturePerson,
  baseURL: string,
) {
  const person = fixturePerson(name);
  const context = page.context();
  await context.clearCookies();
  if (signsInThroughStub) {
    await addStubSession(context, baseURL, person.userId);
    return;
  }
  const value = await createE2EAuthCookieValue({
    userId: person.userId,
    role: person.role,
    tenantId: person.memberships[0]!.tenantId,
    memberships: person.memberships,
  });
  await context.addCookies([
    {
      name: E2E_AUTH_COOKIE_NAMES[surface],
      value,
      url: baseURL,
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
}

/** The scope the page's `TenantDocument` was rendered with. */
export async function documentScope(page: Page) {
  const marker = page.locator("[data-tenant-scope]");
  return {
    prefix: await marker.getAttribute("data-tenant-scope"),
    assignment: await marker.getAttribute("data-tenant-assignment"),
  };
}

/** Counts full document loads in the main frame; a soft navigation issues none. */
export function trackDocumentLoads(page: Page): string[] {
  const documents: string[] = [];
  page.on("request", (request) => {
    if (
      request.resourceType() === "document" &&
      request.frame() === page.mainFrame()
    ) {
      documents.push(new URL(request.url()).pathname);
    }
  });
  return documents;
}

/** Pushes a soft navigation through the app's client router. */
export async function softNavigate(page: Page, href: string) {
  await page.evaluate((target) => {
    const next = (
      window as unknown as { next?: { router?: { push(href: string): void } } }
    ).next;
    if (!next?.router) throw new Error("The client router is not exposed.");
    next.router.push(target);
  }, href);
}
