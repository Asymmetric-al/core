import { readFileSync } from "node:fs";
import path from "node:path";

import {
  fixturePerson,
  organizationLabel,
  signInAs,
  signsInThroughStub,
} from "./tenant-address";

import type { FixturePerson } from "./tenant-address";
import type { APIResponse, BrowserContext, Page } from "@playwright/test";

/**
 * Web Studio under its tenant cookie (plan 5.2; AL-2675, WP2b slice C).
 * Suites sign fixture people in as the tenant-address suites do: in
 * development through signed E2E bypass cookies, on a production build
 * through the Supabase stub (`E2E_SUPABASE_STUB_URL`).
 */

const STUB_URL = process.env.E2E_SUPABASE_STUB_URL ?? null;

export const WEB_STUDIO_COOKIE = "asym_web_studio_tenant";

function stubAccessToken(userId: string, expiresAt: number) {
  return [
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
}

/**
 * A stub session whose access token has already expired. With a refresh
 * token that names the person, the admin proxy refreshes it; with one the
 * stub does not know, the session has ended.
 */
export async function addExpiredStubSession(
  context: BrowserContext,
  baseURL: string,
  person: FixturePerson,
  { refreshable }: { refreshable: boolean },
) {
  const { userId } = fixturePerson(person);
  const expiresAt = Math.floor(Date.now() / 1000) - 3600;
  const session = {
    access_token: stubAccessToken(userId, expiresAt),
    refresh_token: refreshable
      ? `stub-refresh:${userId}`
      : "stub-revoked-refresh-token",
    token_type: "bearer",
    expires_in: 3600,
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

/** Changes the rows the stub serves, as revoking a membership changes the live rows. */
export async function stubControl(
  route: "reset" | "revoke",
  body: object = {},
) {
  const response = await fetch(new URL(`/__stub/${route}`, STUB_URL!), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`stub ${route}: ${response.status}`);
}

export { fixturePerson, signInAs, signsInThroughStub };

/** The organization a Web Studio page was rendered for: its document scope. */
export async function webStudioScope(page: Page) {
  const marker = page.locator("[data-web-studio-scope]").first();
  return {
    tenant: await marker.getAttribute("data-web-studio-scope"),
    assignment: await marker.getAttribute("data-web-studio-assignment"),
  };
}

/** What a Web Studio document sends on a REST write: same-origin, and its scope. */
export async function writeHeaders(page: Page, origin: string) {
  const scope = await webStudioScope(page);
  return {
    origin: new URL(origin).origin,
    "x-asym-tenant": scope.tenant ?? "",
    "x-asym-assignment": scope.assignment ?? "",
  };
}

/** Picks an organization on the Web Studio chooser. */
export async function chooseOrganization(page: Page, tenantId: string) {
  const name = organizationLabel(tenantId);
  await page
    .getByRole("button", {
      // Named once, as every chooser option is (slice A, council A13).
      name: new RegExp(`^Open ${escape(name)}$`),
    })
    .click();
}

function escape(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Goes to the Web Studio chooser and picks an organization; lands on `next`. */
export async function switchOrganization(
  page: Page,
  baseURL: string,
  tenantId: string,
  next = "/web-studio",
) {
  await page.goto(
    `${baseURL}/web-studio/organization?next=${encodeURIComponent(next)}`,
  );
  await chooseOrganization(page, tenantId);
  await page.waitForURL((url) => url.pathname === next);
}

const EMPTY_RICH_TEXT = {
  root: {
    type: "root",
    children: [],
    direction: null,
    format: "",
    indent: 0,
    version: 1,
  },
};

async function json(response: APIResponse) {
  if (!response.ok()) {
    throw new Error(`${response.status()} ${await response.text()}`);
  }
  return response.json();
}

/** Creates a draft page through Payload's REST routes, as the page's own document would. */
export async function createDraftPage(
  page: Page,
  baseURL: string,
  title: string,
) {
  const created = await json(
    await page.request.post(`${baseURL}/web-studio/api/pages?draft=true`, {
      headers: await writeHeaders(page, baseURL),
      data: {
        title,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        pageType: "standard",
        _status: "draft",
        content: EMPTY_RICH_TEXT,
      },
    }),
  );
  return String(created.doc.id);
}

const TEST_IMAGE = readFileSync(
  path.join(__dirname, "..", "fixtures", "test-image.png"),
);

/** Uploads an image to the media library through Payload's REST routes. */
export async function uploadMedia(page: Page, baseURL: string, alt: string) {
  const created = await json(
    await page.request.post(`${baseURL}/web-studio/api/media`, {
      headers: await writeHeaders(page, baseURL),
      multipart: {
        file: { name: `${alt}.png`, mimeType: "image/png", buffer: TEST_IMAGE },
        _payload: JSON.stringify({ alt }),
      },
    }),
  );
  return String(created.doc.id);
}

/** What a REST read returns now, for the documents whose field contains `stamp`. */
export async function restTitles(
  page: Page,
  baseURL: string,
  collection: "pages" | "media",
  stamp: string,
) {
  const field = collection === "pages" ? "title" : "alt";
  const response = await page.request.get(
    `${baseURL}/web-studio/api/${collection}?draft=true&depth=0&limit=50&where[${field}][like]=${encodeURIComponent(stamp)}`,
  );
  const body = (await json(response)) as {
    docs: Array<Record<string, string>>;
  };
  return body.docs.map((doc) => doc[field]).sort();
}

export async function deleteDocument(
  page: Page,
  baseURL: string,
  collection: "pages" | "media",
  id: string,
) {
  return page.request.delete(`${baseURL}/web-studio/api/${collection}/${id}`, {
    headers: await writeHeaders(page, baseURL),
  });
}
