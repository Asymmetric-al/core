import { expect, type Page } from "@playwright/test";
import pg from "pg";

import { DEMO_TENANT_ID } from "../../../packages/auth/constants";
import { isLoopbackDatabaseUrl } from "../../../packages/env/src/database-url.mjs";
import { isLocalHostname } from "../playwright-shared";

/**
 * Helpers for e2e journeys that need a real Supabase Auth email: a local
 * Supabase stack (`supabase start`) and its mail catcher (Mailpit).
 *
 * They create and delete Auth users with the service-role key, so they refuse
 * any Supabase URL that is not on this machine. The database, which they
 * write memberships to through node-postgres, is judged by
 * isLoopbackDatabaseUrl, as every local-only tool judges one: node-postgres
 * follows a host in the URL's query over the one the URL shows (AL-2674).
 */
export interface AuthMailEnv {
  supabaseUrl: string;
  anonKey: string;
  serviceRoleKey: string;
  /** Mailpit's base URL, e.g. http://127.0.0.1:54324. */
  mailUrl: string;
  /**
   * The stack's database, for the memberships only it holds (authz is not on
   * the Data API). Set by `bun run test:e2e:auth-mail`.
   */
  dbUrl: string | null;
}

export function readAuthMailEnv(
  env: NodeJS.ProcessEnv = process.env,
): AuthMailEnv | null {
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = (
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )?.trim();
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const mailUrl = env.E2E_AUTH_MAIL_URL?.trim();
  const dbUrl = env.E2E_AUTH_MAIL_DB_URL?.trim() || null;
  if (!supabaseUrl || !anonKey || !serviceRoleKey || !mailUrl) {
    return null;
  }

  for (const url of [supabaseUrl, mailUrl]) assertLocalHttp(url);
  if (dbUrl) assertLocalDatabase(dbUrl);

  return { supabaseUrl, anonKey, serviceRoleKey, mailUrl, dbUrl };
}

/** Throws, naming its host, unless an HTTP address is on this machine. */
function assertLocalHttp(url: string) {
  if (!isLocalHostname(new URL(url).hostname)) {
    throw new Error(
      `Auth mail e2e runs only against a local Supabase stack, not ${new URL(url).host}.`,
    );
  }
}

/** Throws, naming no part of the URL, unless it names a database on this machine. */
function assertLocalDatabase(dbUrl: string) {
  if (!isLoopbackDatabaseUrl(dbUrl)) {
    throw new Error(
      "Auth mail e2e runs only against a local Supabase stack, and E2E_AUTH_MAIL_DB_URL does not name a database on this machine.",
    );
  }
}

/** A unique address on a reserved domain, so no real mailbox is involved. */
export function uniqueTestEmail(label: string): string {
  const nonce = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `${label}-${nonce}@example.test`;
}

/**
 * The headers of every request that carries the service-role key: the Auth
 * admin writes (createConfirmedUser, deleteUser) and the profile read. An
 * AuthMailEnv can be built by hand, so the Supabase address is checked here
 * again, as the membership write checks its database (phase 16, Q6).
 */
function serviceHeaders(env: AuthMailEnv) {
  assertLocalHttp(env.supabaseUrl);
  return {
    apikey: env.serviceRoleKey,
    Authorization: `Bearer ${env.serviceRoleKey}`,
    "Content-Type": "application/json",
  };
}

/**
 * The membership a journey's person needs: memberships are the only authority
 * since AL-2675, and each app admits one class of row. A profile role grants
 * nothing.
 */
export type AuthMailMembership =
  | { role: "donor" }
  | { role: "missionary"; tenantId: string }
  | {
      role: "staff";
      staffRole: "finance" | "mobilizer" | "development" | "hr" | "member_care";
      tenantId: string;
    };

/**
 * Creates a confirmed login as a real sign-up creates one: through the Auth
 * admin API, so the sign-up trigger gives it its profile and its donor
 * membership in the demo organization. A missionary or staff person then gets
 * that row in the database, as the seed and the membership data step give one
 * (no application command grants a staff or missionary row before plan 5.4).
 */
export async function createConfirmedUser(
  env: AuthMailEnv,
  input: {
    email: string;
    password: string;
    membership: AuthMailMembership;
    /** Rows beyond the first, as a person in several organizations holds them. */
    moreMemberships?: readonly Exclude<AuthMailMembership, { role: "donor" }>[];
  },
): Promise<string> {
  const created = await fetch(`${env.supabaseUrl}/auth/v1/admin/users`, {
    method: "POST",
    headers: serviceHeaders(env),
    body: JSON.stringify({
      email: input.email,
      password: input.password,
      email_confirm: true,
      user_metadata: { first_name: "Auth", last_name: "Mail" },
    }),
  });
  expect(created.status, await created.clone().text()).toBe(200);
  const { id } = (await created.json()) as { id: string };

  const { membership } = input;
  if (membership.role !== "donor") {
    await grantMembership(env, id, membership);
  }
  for (const more of input.moreMemberships ?? []) {
    await grantMembership(env, id, more);
  }
  return id;
}

async function grantMembership(
  env: AuthMailEnv,
  userId: string,
  membership: Exclude<AuthMailMembership, { role: "donor" }>,
) {
  if (!env.dbUrl) {
    throw new Error(
      "A missionary or staff journey needs the stack's database: run it with `bun run test:e2e:auth-mail`.",
    );
  }
  // An AuthMailEnv can be built by hand, so the write checks again.
  assertLocalDatabase(env.dbUrl);
  const db = new pg.Client({ connectionString: env.dbUrl });
  await db.connect();
  try {
    const { rowCount } = await db.query(
      `insert into authz.memberships (user_id, tenant_id, role, staff_role)
       values ($1, $2, $3, $4)`,
      [
        userId,
        membership.tenantId,
        membership.role,
        membership.role === "staff" ? membership.staffRole : null,
      ],
    );
    expect(rowCount).toBe(1);
  } finally {
    await db.end();
  }
}

/** The demo organization the local stack's seed creates. */
export const AUTH_MAIL_TENANT_ID = DEMO_TENANT_ID;

/** The seed's second organization (supabase/seed.sql, Harbor Light Mission). */
export const AUTH_MAIL_SECOND_TENANT_ID =
  "00000000-0000-0000-0000-000000000002";

/** The login behind an address, through the profile the sign-up trigger made. */
export async function findUserIdByEmail(
  env: AuthMailEnv,
  email: string,
): Promise<string | null> {
  const response = await fetch(
    `${env.supabaseUrl}/rest/v1/profiles?select=user_id&email=eq.${encodeURIComponent(email)}`,
    { headers: serviceHeaders(env) },
  );
  expect(response.status, await response.clone().text()).toBe(200);
  const rows = (await response.json()) as Array<{ user_id: string }>;
  return rows[0]?.user_id ?? null;
}

/**
 * Waits until the dev server has stopped sending the page's code, so the form
 * is hydrated. Text typed into a server-rendered field before hydration is
 * dropped when React takes the field over, which on a slow first compile sent
 * a form with an empty field.
 */
export async function waitForHydratedForm(page: Page) {
  await page.waitForLoadState("networkidle");
}

/**
 * Requests each route once over HTTP, so a dev server compiles it before a
 * browser opens it. With the browser already on a page, a cold dev server
 * that compiled routes on demand reloaded that page every second or so for
 * minutes; the same journeys on a warm server ran without a reload.
 */
export async function warmUpRoutes(baseURL: string, paths: readonly string[]) {
  // The servers listen on 127.0.0.1; Node may resolve localhost to ::1.
  const origin = new URL(baseURL);
  origin.hostname = "127.0.0.1";
  for (const path of paths) {
    const response = await fetch(new URL(path, origin), {
      redirect: "manual",
      signal: AbortSignal.timeout(300_000),
    });
    expect(response.status, `warm-up ${path}`).toBeLessThan(500);
  }
}

export async function deleteUser(env: AuthMailEnv, userId: string) {
  await fetch(`${env.supabaseUrl}/auth/v1/admin/users/${userId}`, {
    method: "DELETE",
    headers: serviceHeaders(env),
  });
}

/** Status of a password sign-in through the Auth API. */
export async function passwordSignInStatus(
  env: AuthMailEnv,
  email: string,
  password: string,
): Promise<number> {
  const response = await fetch(
    `${env.supabaseUrl}/auth/v1/token?grant_type=password`,
    {
      method: "POST",
      headers: { apikey: env.anonKey, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    },
  );
  return response.status;
}

/**
 * Sends one recovery email through the Auth API to a throwaway login. The
 * first message a freshly started local stack sends can outlast Auth's
 * 10-second request deadline while the mail connection is set up, which
 * would fail whichever journey happened to send first.
 */
export async function warmUpAuthMailer(env: AuthMailEnv) {
  const email = uniqueTestEmail("auth-mail-warm-up");
  const userId = await createConfirmedUser(env, {
    email,
    password: "warm up phrase",
    membership: { role: "donor" },
  });
  try {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const response = await fetch(`${env.supabaseUrl}/auth/v1/recover`, {
        method: "POST",
        headers: { apikey: env.anonKey, "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (response.ok) return;
    }
    throw new Error("The local Auth mailer did not send a message.");
  } finally {
    await deleteUser(env, userId);
  }
}

interface MailpitSummary {
  ID: string;
  Subject: string;
}

/**
 * Waits for the newest message to `to` whose subject matches, and returns
 * the Supabase Auth link in it (`…/auth/v1/verify?…`).
 */
export async function waitForAuthEmailLink(
  env: AuthMailEnv,
  input: { to: string; subject: RegExp },
): Promise<URL> {
  let messageId: string | null = null;
  await expect
    .poll(
      async () => {
        const response = await fetch(
          `${env.mailUrl}/api/v1/search?query=${encodeURIComponent(`to:"${input.to}"`)}`,
        );
        if (!response.ok) return null;
        const { messages } = (await response.json()) as {
          messages: MailpitSummary[];
        };
        messageId =
          messages.find((message) => input.subject.test(message.Subject))?.ID ??
          null;
        return messageId;
      },
      {
        message: `an email to ${input.to} with subject ${input.subject}`,
        timeout: 30_000,
      },
    )
    .not.toBeNull();

  const response = await fetch(`${env.mailUrl}/api/v1/message/${messageId}`);
  const { HTML, Text } = (await response.json()) as {
    HTML?: string;
    Text?: string;
  };
  const href = `${HTML ?? ""}\n${Text ?? ""}`.match(
    /https?:\/\/[^\s"'<>]+\/auth\/v1\/verify\?[^\s"'<>]+/,
  )?.[0];
  expect(href, "the email carries a Supabase Auth link").toBeTruthy();
  return new URL(href!.replaceAll("&amp;", "&"));
}
