import { expect, type Page } from "@playwright/test";

import { isLocalHostname } from "../playwright-shared";

/**
 * Helpers for e2e journeys that need a real Supabase Auth email: a local
 * Supabase stack (`supabase start`) and its mail catcher (Mailpit).
 *
 * They create and delete Auth users with the service-role key, so they refuse
 * any Supabase URL that is not on this machine.
 */
export interface AuthMailEnv {
  supabaseUrl: string;
  anonKey: string;
  serviceRoleKey: string;
  /** Mailpit's base URL, e.g. http://127.0.0.1:54324. */
  mailUrl: string;
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
  if (!supabaseUrl || !anonKey || !serviceRoleKey || !mailUrl) {
    return null;
  }

  for (const url of [supabaseUrl, mailUrl]) {
    if (!isLocalHostname(new URL(url).hostname)) {
      throw new Error(
        `Auth mail e2e runs only against a local Supabase stack, not ${new URL(url).host}.`,
      );
    }
  }

  return { supabaseUrl, anonKey, serviceRoleKey, mailUrl };
}

/** A unique address on a reserved domain, so no real mailbox is involved. */
export function uniqueTestEmail(label: string): string {
  const nonce = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `${label}-${nonce}@example.test`;
}

function serviceHeaders(env: AuthMailEnv) {
  return {
    apikey: env.serviceRoleKey,
    Authorization: `Bearer ${env.serviceRoleKey}`,
    "Content-Type": "application/json",
  };
}

/**
 * Creates a confirmed login through the Auth admin API and sets the role on
 * the profile that the sign-up trigger creates.
 */
export async function createConfirmedUser(
  env: AuthMailEnv,
  input: { email: string; password: string; profileRole: string },
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

  const profile = await fetch(
    `${env.supabaseUrl}/rest/v1/profiles?user_id=eq.${id}`,
    {
      method: "PATCH",
      headers: { ...serviceHeaders(env), Prefer: "return=representation" },
      body: JSON.stringify({ role: input.profileRole }),
    },
  );
  expect(profile.status, await profile.clone().text()).toBe(200);
  expect(await profile.json()).toHaveLength(1);
  return id;
}

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
    profileRole: "donor",
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
