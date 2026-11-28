import { randomInt, randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

const API = process.env.N4_SIGN_IN_IT_URL ?? "";
const ANON = process.env.N4_SIGN_IN_IT_ANON_KEY ?? "";
const SERVICE = process.env.N4_SIGN_IN_IT_SERVICE_KEY ?? "";
const DB_URL = process.env.N4_SIGN_IN_IT_DATABASE_URL ?? "";
const MAIL_URL = process.env.N4_SIGN_IN_IT_MAIL_URL ?? "";
const REQUIRED =
  process.env.N4_SIGN_IN_IT_REQUIRED === "1" ||
  process.env.GITHUB_JOB === "local-supabase";
const READY = Boolean(API && ANON && SERVICE && DB_URL && MAIL_URL);

it.runIf(REQUIRED && !READY)(
  "the local-supabase job supplies N4_SIGN_IN_IT_* (fails, never skips)",
  () => expect(READY).toBe(true),
);

const jar = vi.hoisted(() => ({ current: new Map<string, string>() }));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    getAll: () => Array.from(jar.current, ([name, value]) => ({ name, value })),
    set: (name: string, value: string, options?: { maxAge?: number }) => {
      if (!value || options?.maxAge === 0) jar.current.delete(name);
      else jar.current.set(name, value);
    },
  }),
}));

type Handler = (request: Request) => Promise<Response>;

const PASSWORD = "n4 first sign-in phrase";
const NEW_PASSWORD = "n4 second sign-in phrase";
const WRONG = "n4 not the phrase";

const nonce = () => randomUUID().slice(0, 8);
const address = () => `198.18.${randomInt(0, 256)}.${randomInt(1, 255)}`;

describe.skipIf(!READY)(
  "AL-2671 N4 PR 1: sign-in through Core against the installed provider (local stack)",
  () => {
    let signIn: Handler;
    let changePassword: Handler;
    let signInAccountKey: (email: string) => string;
    let createClient: (scope: null) => Promise<{
      auth: {
        resetPasswordForEmail(
          email: string,
          options: { redirectTo: string },
        ): Promise<{ error: unknown }>;
        exchangeCodeForSession(code: string): Promise<{ error: unknown }>;
      };
    }>;
    let db: pg.Client;
    const created: string[] = [];

    beforeAll(async () => {
      vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", API);
      vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", ANON);
      vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", ANON);
      vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", SERVICE);
      vi.stubEnv("CORE_SERVE_UNDER_PATHS", "");
      ({ POST: signIn } =
        await import("../../../../packages/api/src/auth/sign-in"));
      ({ POST: changePassword } =
        await import("../../../../packages/api/src/auth/password"));
      ({ signInAccountKey } =
        await import("../../../../packages/api/src/auth/sign-in-answers"));
      ({ createClient } =
        (await import("../../../../packages/database/supabase/server")) as unknown as {
          createClient: typeof createClient;
        });
      db = new pg.Client({ connectionString: DB_URL });
      await db.connect();
    });

    afterAll(async () => {
      for (const id of created) await adminDelete(id);
      await db?.end();
      vi.unstubAllEnvs();
    });

    const service = {
      apikey: SERVICE,
      Authorization: `Bearer ${SERVICE}`,
      "Content-Type": "application/json",
    };

    async function adminCreate(email: string, confirmed = true) {
      const response = await fetch(`${API}/auth/v1/admin/users`, {
        method: "POST",
        headers: service,
        body: JSON.stringify({
          email,
          password: PASSWORD,
          email_confirm: confirmed,
        }),
      });
      expect(response.status, "create a login").toBe(200);
      const { id } = (await response.json()) as { id: string };
      created.push(id);
      return id;
    }

    async function adminDelete(id: string) {
      await fetch(`${API}/auth/v1/admin/users/${id}`, {
        method: "DELETE",
        headers: service,
      });
    }

    function post(handler: Handler, path: string, body: unknown, from: string) {
      return handler(
        new Request(`http://localhost:3000${path}`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-forwarded-for": from,
          },
          body: JSON.stringify(body),
        }),
      );
    }

    async function inFreshBrowser<T>(work: () => Promise<T>): Promise<T> {
      const previous = jar.current;
      jar.current = new Map();
      try {
        return await work();
      } finally {
        jar.current = previous;
      }
    }

    async function answer(response: Response) {
      return { status: response.status, body: await response.text() };
    }

    const tryPassword = (email: string, password: string, from = address()) =>
      inFreshBrowser(async () =>
        answer(
          await post(signIn, "/api/auth/sign-in", { email, password }, from),
        ),
      );

    async function liveSessions(userId: string) {
      const { rows } = await db.query(
        "SELECT count(*)::int AS n FROM auth.sessions WHERE user_id = $1",
        [userId],
      );
      return rows[0].n as number;
    }

    it("keys an account by the installed provider's own normalisation: it folds ASCII case, and it refuses an address with a non-ASCII capital, which then answers as an unknown one", async () => {
      const spelled = `N4-Mixed-${nonce()}@Example.TEST`;
      const create = await fetch(`${API}/auth/v1/admin/users`, {
        method: "POST",
        headers: service,
        body: JSON.stringify({
          email: spelled,
          password: PASSWORD,
          email_confirm: true,
        }),
      });
      expect(create.status).toBe(200);
      const stored = (await create.json()) as { id: string; email: string };
      created.push(stored.id);
      expect(stored.email).toBe(spelled.toLowerCase());
      for (const variant of [
        spelled,
        spelled.toLowerCase(),
        spelled.toUpperCase(),
      ]) {
        expect((await tryPassword(variant, PASSWORD)).status, variant).toBe(
          200,
        );
        expect(signInAccountKey(variant), variant).toBe(stored.email);
      }

      const accented = `n4-École-${nonce()}@example.test`;
      const refused = await fetch(`${API}/auth/v1/admin/users`, {
        method: "POST",
        headers: service,
        body: JSON.stringify({
          email: accented,
          password: PASSWORD,
          email_confirm: true,
        }),
      });
      expect(refused.status).toBe(400);
      const unknown = await tryPassword(
        `n4-nobody-${nonce()}@example.test`,
        PASSWORD,
      );
      expect(await tryPassword(accented.toUpperCase(), PASSWORD)).toEqual(
        unknown,
      );
      expect(signInAccountKey(accented.toUpperCase())).toBe(
        accented.toLowerCase(),
      );
    });

    it("answers an unknown address, a wrong password, an unconfirmed address and a limited account alike", async () => {
      const known = `n4-known-${nonce()}@example.test`;
      const unconfirmed = `n4-unconfirmed-${nonce()}@example.test`;
      const limited = `n4-limited-${nonce()}@example.test`;
      await adminCreate(known);
      await adminCreate(unconfirmed, false);
      await adminCreate(limited);
      for (let i = 0; i < 10; i += 1) await tryPassword(limited, WRONG);

      const unknown = await tryPassword(
        `n4-nobody-${nonce()}@example.test`,
        WRONG,
      );
      expect(unknown.status).toBe(401);
      expect(await tryPassword(known, WRONG)).toEqual(unknown);
      expect(await tryPassword(unconfirmed, PASSWORD)).toEqual(unknown);
      expect(await tryPassword(limited, PASSWORD)).toEqual(unknown);
      expect(unknown.body).not.toMatch(
        /invalid login credentials|not confirmed/i,
      );
    });

    it("limits one account from every address after ten refused passwords from several, while another account signs in from those same addresses", async () => {
      const target = `n4-target-${nonce()}@example.test`;
      const other = `n4-other-${nonce()}@example.test`;
      await adminCreate(target);
      await adminCreate(other);
      const addresses = [address(), address(), address()];
      for (let i = 0; i < 10; i += 1)
        await tryPassword(target, WRONG, addresses[i % 3]);

      expect((await tryPassword(target, PASSWORD, address())).status).toBe(401);
      for (const from of addresses)
        expect((await tryPassword(other, PASSWORD, from)).status, from).toBe(
          200,
        );
    });

    it("limits one address after thirty refused passwords across accounts, while the same account signs in from another address", async () => {
      const person = `n4-person-${nonce()}@example.test`;
      await adminCreate(person);
      const noisy = address();
      for (let i = 0; i < 30; i += 1)
        await tryPassword(`n4-guess-${nonce()}@example.test`, WRONG, noisy);

      expect((await tryPassword(person, PASSWORD, noisy)).status).toBe(401);
      expect((await tryPassword(person, PASSWORD, address())).status).toBe(200);
    });

    it("refuses the limiter's functions to the publishable key", async () => {
      for (const [name, body] of [
        [
          "take_sign_in_attempt",
          { p_account: "a@example.test", p_address: "198.18.0.1" },
        ],
        [
          "record_sign_in_failure",
          { p_account: "a@example.test", p_address: "198.18.0.1" },
        ],
      ] as const) {
        const response = await fetch(`${API}/rest/v1/rpc/${name}`, {
          method: "POST",
          headers: {
            apikey: ANON,
            Authorization: `Bearer ${ANON}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });
        expect(response.status, name).toBeGreaterThanOrEqual(400);
      }
    });

    it("changes a password only by the right current one, and the check leaves no extra live session", async () => {
      const email = `n4-change-${nonce()}@example.test`;
      const userId = await adminCreate(email);
      const from = address();
      jar.current = new Map();
      expect(
        (
          await post(
            signIn,
            "/api/auth/sign-in",
            { email, password: PASSWORD },
            from,
          )
        ).status,
      ).toBe(200);
      const before = await liveSessions(userId);

      const wrong = await post(
        changePassword,
        "/api/auth/password",
        { currentPassword: WRONG, newPassword: NEW_PASSWORD },
        from,
      );
      expect(wrong.status).toBe(403);
      expect(await liveSessions(userId)).toBe(before);
      expect((await tryPassword(email, PASSWORD)).status).toBe(200);
      const withAnotherBrowser = await liveSessions(userId);

      const right = await post(
        changePassword,
        "/api/auth/password",
        { currentPassword: PASSWORD, newPassword: NEW_PASSWORD },
        from,
      );
      expect(right.status).toBe(200);
      expect(await liveSessions(userId)).toBeLessThanOrEqual(
        withAnotherBrowser,
      );
      expect((await tryPassword(email, PASSWORD)).status).toBe(401);
      expect((await tryPassword(email, NEW_PASSWORD)).status).toBe(200);
    });

    async function recoveryLink(email: string): Promise<string> {
      for (let attempt = 0; attempt < 60; attempt += 1) {
        const search = await fetch(
          `${MAIL_URL}/api/v1/search?query=${encodeURIComponent(`to:"${email}"`)}`,
        );
        const { messages } = (await search.json()) as {
          messages?: Array<{ ID: string }>;
        };
        const id = messages?.[0]?.ID;
        if (id) {
          const message = (await (
            await fetch(`${MAIL_URL}/api/v1/message/${id}`)
          ).json()) as { HTML?: string; Text?: string };
          const href = `${message.HTML ?? ""}\n${message.Text ?? ""}`.match(
            /https?:\/\/[^\s"'<>]+\/auth\/v1\/verify\?[^\s"'<>]+/,
          )?.[0];
          if (href) return href.replaceAll("&amp;", "&");
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
      throw new Error(
        `no recovery mail reached the local catcher for ${email}`,
      );
    }

    it("saves a new password without the current one only on a recovery session, which a limited account still reaches", async () => {
      const email = `n4-recover-${nonce()}@example.test`;
      await adminCreate(email);
      for (let i = 0; i < 10; i += 1) await tryPassword(email, WRONG);
      expect((await tryPassword(email, PASSWORD)).status).toBe(401);

      jar.current = new Map();
      const supabase = await createClient(null);
      const requested = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "http://localhost:3000/forgot-password/callback",
      });
      expect(requested.error).toBeNull();
      const followed = await fetch(await recoveryLink(email), {
        redirect: "manual",
      });
      const code = new URL(
        followed.headers.get("location") ?? "",
      ).searchParams.get("code");
      expect(code).toBeTruthy();
      expect(
        (await supabase.auth.exchangeCodeForSession(code!)).error,
      ).toBeNull();

      const saved = await post(
        changePassword,
        "/api/auth/password",
        { newPassword: NEW_PASSWORD },
        address(),
      );
      expect(saved.status).toBe(200);
      const provider = await fetch(`${API}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: { apikey: ANON, "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: NEW_PASSWORD }),
      });
      expect(provider.status).toBe(200);

      const ordinary = `n4-ordinary-${nonce()}@example.test`;
      await adminCreate(ordinary);
      jar.current = new Map();
      expect(
        (
          await post(
            signIn,
            "/api/auth/sign-in",
            { email: ordinary, password: PASSWORD },
            address(),
          )
        ).status,
      ).toBe(200);
      expect(
        (
          await post(
            changePassword,
            "/api/auth/password",
            { newPassword: NEW_PASSWORD },
            address(),
          )
        ).status,
      ).toBe(403);
    });
  },
);
