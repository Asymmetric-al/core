import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";

import AxeBuilder from "@axe-core/playwright";
import {
  expect,
  test,
  type BrowserContext,
  type Page,
  type Response,
} from "@playwright/test";

import {
  AUTH_MAIL_TENANT_ID,
  adminServerLogFile,
  createConfirmedUser,
  deleteUser,
  readAuthMailEnv,
  uniqueTestEmail,
  waitForHydratedForm,
  warmUpRoutes,
  type AuthMailEnv,
} from "./helpers/auth-mail";
import { withOwner } from "./helpers/request-scope-reads";
import { totp, totpStep } from "./helpers/totp";

const env = readAuthMailEnv();
const ADMIN_PORT = Number(process.env.AUTH_MAIL_ADMIN_PORT || 3130);
const ADMIN_ORIGIN = `http://localhost:${ADMIN_PORT}`;
const UNLISTED_ORIGIN = `http://127.0.0.1:${ADMIN_PORT}`;
const PROTECTED_CACHE = "private, no-store, no-transform, max-age=0";
const AREA_ONLY = [
  "cdn-cache-control",
  "vercel-cdn-cache-control",
  "referrer-policy",
] as const;
const VERIFIED = "Your session is verified with a second factor.";
const NOT_OPERATOR = "platform: the caller is not a platform operator";
const VOLATILE_HEADERS = new Set([
  "date",
  "connection",
  "keep-alive",
  "transfer-encoding",
]);

type Person = { userId: string; email: string; password: string };

test.use({ trace: "off", screenshot: "off", video: "off" });

let operator: Person | null = null;
let keeper: Person | null = null;
let outsider: Person | null = null;

async function createPerson(stack: AuthMailEnv, label: string, staff: boolean) {
  const email = uniqueTestEmail(`wp2c2a-${label}`);
  const password = `${label}-${randomUUID()}`;
  const userId = await createConfirmedUser(stack, {
    email,
    password,
    membership: staff
      ? { role: "staff", staffRole: "finance", tenantId: AUTH_MAIL_TENANT_ID }
      : { role: "donor" },
  });
  return { userId, email, password };
}

function operatorScript(
  stack: AuthMailEnv,
  action: "add" | "remove",
  person: Person,
  reason: string,
) {
  const run = spawnSync(
    process.execPath,
    [
      "scripts/platform/operators.mjs",
      action,
      "--user",
      person.userId,
      "--actor",
      "WP2c part 2a journey",
      "--reason",
      reason,
    ],
    {
      encoding: "utf8",
      timeout: 60_000,
      env: {
        ...process.env,
        OPERATORS_DATABASE_URL: stack.dbUrl!,
        OPERATORS_SUPABASE_PROJECT_REF: "",
      },
    },
  );
  expect(run.status, run.stderr).toBe(0);
  expect(JSON.parse(run.stdout.trim())).toMatchObject({
    action,
    user_id: person.userId,
    changed: true,
  });
}

async function signIn(page: Page, person: Person) {
  const loginUrl = `${ADMIN_ORIGIN}/login?next=${encodeURIComponent("/operator")}`;
  const away = (url: URL) => !url.pathname.startsWith("/login");
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      await page.goto(loginUrl);
      await waitForHydratedForm(page);
      await page.getByLabel("Email").fill(person.email, { timeout: 60_000 });
      await page
        .getByLabel("Password", { exact: true })
        .fill(person.password, { timeout: 60_000 });
      await page
        .getByRole("button", { name: "Sign in" })
        .click({ timeout: 60_000 });
      await page.waitForURL(away, { timeout: 60_000 });
      return;
    } catch {
      if (away(new URL(page.url()))) return;
      if (attempt === 5) {
        throw new Error(`sign-in for ${person.email} did not leave /login`);
      }
    }
  }
}

async function enterCode(page: Page, label: string, code: string) {
  await page.getByRole("textbox", { name: label, exact: true }).click();
  await page.keyboard.type(code);
}

async function seriousViolations(page: Page): Promise<string[]> {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  return results.violations
    .filter((v) => v.impact === "critical" || v.impact === "serious")
    .map((v) => v.id);
}

function comparableHeaders(headers: Record<string, string>) {
  return Object.entries(headers)
    .filter(([name]) => !VOLATILE_HEADERS.has(name))
    .sort(([a], [b]) => (a < b ? -1 : 1));
}

function sessionAccessToken(
  cookies: Awaited<ReturnType<BrowserContext["cookies"]>>,
): string {
  const chunks = new Map<string, Array<[number, string]>>();
  for (const cookie of cookies) {
    const match = /^(sb-.+-auth-token)(?:\.(\d+))?$/.exec(cookie.name);
    if (!match) continue;
    const parts = chunks.get(match[1]!) ?? [];
    parts.push([Number(match[2] ?? 0), cookie.value]);
    chunks.set(match[1]!, parts);
  }
  const [parts] = [...chunks.values()];
  if (!parts) throw new Error("the browser holds no Supabase session cookie");
  const joined = parts
    .sort(([a], [b]) => a - b)
    .map(([, value]) => value)
    .join("");
  const text = joined.startsWith("base64-")
    ? Buffer.from(joined.slice("base64-".length), "base64url").toString("utf8")
    : decodeURIComponent(joined);
  const session = JSON.parse(text) as { access_token?: string };
  if (!session.access_token)
    throw new Error("the session cookie holds no token");
  return session.access_token;
}

async function operatorSessionCheck(stack: AuthMailEnv, token: string) {
  const response = await fetch(
    `${stack.supabaseUrl}/rest/v1/rpc/platform_operator_session`,
    {
      method: "POST",
      headers: {
        apikey: stack.anonKey,
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: "{}",
    },
  );
  return {
    status: response.status,
    json: (await response.json()) as Record<string, unknown>,
  };
}

async function storageSnapshot(page: Page): Promise<string> {
  const inPage = await page.evaluate(async () => {
    const entries = (storage: Storage) => {
      const out: Array<[string, string | null]> = [];
      for (let i = 0; i < storage.length; i += 1) {
        const key = storage.key(i);
        if (key !== null) out.push([key, storage.getItem(key)]);
      }
      return out;
    };
    const databases: unknown[] = [];
    if (typeof indexedDB.databases === "function") {
      for (const info of await indexedDB.databases()) {
        if (!info.name) continue;
        databases.push(
          await new Promise<unknown>((resolve) => {
            const opened = indexedDB.open(info.name!);
            opened.onerror = () => resolve({ name: info.name, error: true });
            opened.onsuccess = () => {
              const db = opened.result;
              const stores = Array.from(db.objectStoreNames);
              if (stores.length === 0) {
                db.close();
                resolve({ name: info.name, stores: [] });
                return;
              }
              const tx = db.transaction(stores, "readonly");
              const result: Record<string, unknown> = {};
              let remaining = stores.length;
              for (const store of stores) {
                const all = tx.objectStore(store).getAll();
                const done = () => {
                  remaining -= 1;
                  if (remaining === 0) {
                    db.close();
                    resolve({ name: info.name, result });
                  }
                };
                all.onsuccess = () => {
                  result[store] = all.result;
                  done();
                };
                all.onerror = done;
              }
            };
          }),
        );
      }
    }
    return JSON.stringify({
      local: entries(window.localStorage),
      session: entries(window.sessionStorage),
      cookie: document.cookie,
      databases,
    });
  });
  const cookies = JSON.stringify(await page.context().cookies());
  return `${inPage}\n${cookies}`;
}

async function ownerTextScan(stack: AuthMailEnv) {
  return withOwner(stack, async (db) => {
    await db.query(`
      create or replace function pg_temp.operator_area_text_scan()
      returns table (place text, value text, unreadable boolean)
      language plpgsql
      as $scan$
      declare
        c record;
      begin
        for c in
          select n.nspname as schema_name, cl.relname as table_name, a.attname as column_name
          from pg_catalog.pg_attribute a
          join pg_catalog.pg_class cl on cl.oid = a.attrelid
          join pg_catalog.pg_namespace n on n.oid = cl.relnamespace
          where n.nspname in ('public', 'authz', 'private', 'platform')
            and cl.relkind in ('r', 'p')
            and a.attnum > 0
            and not a.attisdropped
            and a.atttypid in ('text'::regtype, 'varchar'::regtype, 'json'::regtype, 'jsonb'::regtype)
        loop
          begin
            return query execute format(
              'select %L::text, %I::text, false from %I.%I where %I::text ~* %L',
              c.schema_name || '.' || c.table_name || '.' || c.column_name,
              c.column_name, c.schema_name, c.table_name, c.column_name,
              '[a-z2-7]{16}'
            );
          exception when insufficient_privilege then
            return query select c.schema_name || '.' || c.table_name || '.' || c.column_name, null::text, true;
          end;
        end loop;
      end
      $scan$;
    `);
    const columns = await db.query<{ count: number }>(`
      select count(*)::int as count
      from pg_catalog.pg_attribute a
      join pg_catalog.pg_class cl on cl.oid = a.attrelid
      join pg_catalog.pg_namespace n on n.oid = cl.relnamespace
      where n.nspname in ('public', 'authz', 'private', 'platform')
        and cl.relkind in ('r', 'p')
        and a.attnum > 0
        and not a.attisdropped
        and a.atttypid in ('text'::regtype, 'varchar'::regtype, 'json'::regtype, 'jsonb'::regtype)
    `);
    const rows = await db.query<{
      place: string;
      value: string | null;
      unreadable: boolean;
    }>(
      "select place, value, unreadable from pg_temp.operator_area_text_scan()",
    );
    return { columns: columns.rows[0]?.count ?? 0, rows: rows.rows };
  });
}

function holds(text: string, secret: string, uri: string): boolean {
  return (
    text.toUpperCase().includes(secret.toUpperCase()) ||
    text.includes(uri) ||
    text.includes(encodeURIComponent(uri))
  );
}

test.describe("AL-2675 WP2c part 2a, T6: the operator area in the browser", () => {
  test.beforeAll(async ({}, testInfo) => {
    test.skip(
      testInfo.project.name !== "auth-mail-admin",
      "runs once, on the admin project",
    );
    test.skip(
      !env?.dbUrl,
      "requires a local Supabase stack (bun run test:e2e:auth-mail)",
    );
    const stack = env!;
    operator = await createPerson(stack, "operator", false);
    keeper = await createPerson(stack, "keeper", false);
    outsider = await createPerson(stack, "outsider", true);
    operatorScript(
      stack,
      "add",
      keeper,
      "WP2c part 2a journey: keeps the list non-empty",
    );
    operatorScript(
      stack,
      "add",
      operator,
      "WP2c part 2a journey: the operator",
    );
    await warmUpRoutes(ADMIN_ORIGIN, ["/login"]);
  });

  test.afterAll(async () => {
    const stack = env;
    if (!stack?.dbUrl) return;
    const people = [operator, keeper, outsider].filter(
      (person): person is Person => person !== null,
    );
    const ids = people.map((person) => person.userId);
    await withOwner(stack, async (db) => {
      await db.query(
        "delete from authz.platform_operators where user_id = any($1::uuid[])",
        [ids],
      );
      await db.query(
        "delete from public.audit_logs where resource_type = 'platform_operator' and resource_id = any($1::text[])",
        [ids],
      );
      await db.query(
        "delete from authz.memberships where user_id = any($1::uuid[])",
        [ids],
      );
    });
    for (const person of people) await deleteUser(stack, person.userId);
  });

  test("J3: a fresh visitor on the operations address is sent to sign-in, privately", async ({
    browser,
  }) => {
    const response = await fetch(`${ADMIN_ORIGIN}/operator`, {
      redirect: "manual",
    });
    expect(response.status).toBe(307);
    const location = new URL(response.headers.get("location")!, ADMIN_ORIGIN);
    expect(location.origin).toBe(ADMIN_ORIGIN);
    expect(`${location.pathname}${location.search}`).toBe(
      "/login?next=%2Foperator",
    );
    expect(response.headers.get("cache-control")).toBe(PROTECTED_CACHE);
    const context = await browser.newContext();
    try {
      const page = await context.newPage();
      await page.goto(`${ADMIN_ORIGIN}/operator`);
      await page.waitForURL(
        (url) =>
          url.pathname === "/login" &&
          url.searchParams.get("next") === "/operator",
      );
    } finally {
      await context.close();
    }
  });

  test("J5 and J8: an unlisted name of the same server answers 404 before sign-in, with none of the area's headers", async () => {
    for (const path of ["/operator", "/operator/zzz"]) {
      const response = await fetch(`${UNLISTED_ORIGIN}${path}`, {
        redirect: "manual",
      });
      expect(response.status, path).toBe(404);
      expect(await response.text(), path).toBe("");
      expect(response.headers.get("cache-control"), path).toBe("no-store");
      for (const name of AREA_ONLY) {
        expect(response.headers.get(name), `${path} ${name}`).toBeNull();
      }
    }
  });

  test("J2 and J8: a signed-in person who is not on the list gets the same empty 404 as any unknown area path, and Mission Control as before", async ({
    page,
  }) => {
    await signIn(page, outsider!);
    const area = await page.request.get(`${ADMIN_ORIGIN}/operator`, {
      maxRedirects: 0,
    });
    const unknown = await page.request.get(`${ADMIN_ORIGIN}/operator/zzz`, {
      maxRedirects: 0,
    });
    expect(area.status()).toBe(404);
    expect(await area.text()).toBe("");
    expect(area.headers()["cache-control"]).toBe("no-store");
    for (const name of AREA_ONLY) expect(area.headers()[name]).toBeUndefined();
    expect(unknown.status()).toBe(404);
    expect(await unknown.text()).toBe("");
    expect(comparableHeaders(area.headers())).toEqual(
      comparableHeaders(unknown.headers()),
    );
    const home = await page.request.get(`${ADMIN_ORIGIN}/`, {
      maxRedirects: 0,
    });
    expect(home.status()).toBe(307);
    expect(new URL(home.headers()["location"]!, ADMIN_ORIGIN).pathname).toBe(
      `/${AUTH_MAIL_TENANT_ID}`,
    );
  });

  test("J1, J4, J6 (auth.mfa_factors, Auth's own store, excluded), J7 and J8: an operator enrols, is challenged later, and the key appears nowhere else", async ({
    page,
  }) => {
    const stack = env!;
    const logFile = adminServerLogFile();
    expect(existsSync(logFile), "the admin server's log file exists").toBe(
      true,
    );
    const logAtStart = readFileSync(logFile, "utf8");
    expect(logAtStart.split("\n").filter(Boolean).length).toBeGreaterThan(0);
    const logSizeAtStart = statSync(logFile).size;

    const adminResponses: Array<Promise<{ where: string; text: string }>> = [];
    const areaResponses: Array<{
      status: number;
      headers: Record<string, string>;
    }> = [];
    const consoleLines: string[] = [];
    let enrolUri = "";

    page.on("console", (message) => consoleLines.push(message.text()));
    page.context().on("response", (response: Response) => {
      const url = new URL(response.url());
      if (url.origin === ADMIN_ORIGIN) {
        adminResponses.push(
          (async () => {
            const headers = JSON.stringify(await response.allHeaders());
            let body = "";
            try {
              body = (await response.body()).toString("utf8");
            } catch {
              body = "";
            }
            return { where: `${url.pathname}`, text: `${headers}\n${body}` };
          })(),
        );
        if (url.pathname === "/operator" && response.status() === 200) {
          void response
            .allHeaders()
            .then((headers) =>
              areaResponses.push({ status: response.status(), headers }),
            );
        }
      }
      if (
        url.origin === new URL(stack.supabaseUrl).origin &&
        url.pathname === "/auth/v1/factors" &&
        response.request().method() === "POST"
      ) {
        void response
          .json()
          .then((json: { totp?: { uri?: string } }) => {
            enrolUri = json.totp?.uri ?? enrolUri;
          })
          .catch(() => undefined);
      }
    });

    await signIn(page, operator!);
    await page.waitForURL(`${ADMIN_ORIGIN}/operator`);
    await waitForHydratedForm(page);
    await expect(
      page.getByRole("heading", { level: 1, name: "Operator area" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Set up an authenticator" }).click();
    await expect(
      page.getByRole("img", { name: "QR code for your authenticator app" }),
    ).toBeVisible();
    const shownKey =
      (await page.getByLabel("Key", { exact: true }).textContent()) ?? "";
    const secret = shownKey.replace(/\s/g, "");
    expect(/^[A-Z2-7]{16,}$/.test(secret), "the page shows a base32 key").toBe(
      true,
    );
    await expect.poll(() => enrolUri.startsWith("otpauth://")).toBe(true);
    const uri = enrolUri;
    expect(await seriousViolations(page), "axe on enrolment").toEqual([]);
    const storageWhileEnrolling = await storageSnapshot(page);

    await enterCode(page, "Enter the 6-digit code from the app", totp(secret));
    const enrolledStep = totpStep();
    await page.getByRole("button", { name: "Verify and continue" }).click();
    await expect(page.getByText(VERIFIED)).toBeVisible();
    expect(await seriousViolations(page), "axe on the area").toEqual([]);

    await page.reload();
    await expect(page.getByText(VERIFIED)).toBeVisible();

    await page.getByRole("button", { name: "Sign out" }).click();
    await page.waitForURL((url) => url.pathname === "/login");

    await signIn(page, operator!);
    await page.waitForURL(`${ADMIN_ORIGIN}/operator`);
    await waitForHydratedForm(page);
    await expect(page.getByText("Enter your code")).toBeVisible();
    expect(await seriousViolations(page), "axe on the challenge").toEqual([]);
    await expect
      .poll(() => totpStep(), { timeout: 45_000, intervals: [500] })
      .toBeGreaterThan(enrolledStep);
    await enterCode(page, "Enter your code", totp(secret));
    await page.getByRole("button", { name: "Verify", exact: true }).click();
    await expect(page.getByText(VERIFIED)).toBeVisible();

    const token = sessionAccessToken(await page.context().cookies());
    const confirmed = await operatorSessionCheck(stack, token);
    expect(confirmed.status).toBe(200);
    expect(confirmed.json).toEqual({ operator_id: operator!.userId });

    expect(areaResponses.length).toBeGreaterThan(0);
    for (const { headers } of areaResponses) {
      expect(headers["cache-control"]).toContain("no-store");
      expect(headers["cdn-cache-control"]).toBe("no-store");
      expect(headers["vercel-cdn-cache-control"]).toBe("no-store");
      expect(headers["referrer-policy"]).toBe("no-referrer");
    }

    operatorScript(stack, "remove", operator!, "WP2c part 2a journey: J4");
    const afterRemoval = await page.reload();
    expect(afterRemoval?.status()).toBe(404);
    const refused = await operatorSessionCheck(stack, token);
    expect(refused.status).toBe(403);
    expect(refused.json).toMatchObject({
      code: "42501",
      message: NOT_OPERATOR,
    });

    const storageAtEnd = await storageSnapshot(page);
    const responses = await Promise.all(adminResponses);
    expect(responses.length).toBeGreaterThan(0);
    const leakedResponses = responses
      .filter(({ text }) => holds(text, secret, uri))
      .map(({ where }) => where);
    expect(leakedResponses, "admin-origin responses holding the key").toEqual(
      [],
    );
    expect(
      holds(storageWhileEnrolling, secret, uri),
      "browser storage while enrolling holds the key",
    ).toBe(false);
    expect(
      holds(storageAtEnd, secret, uri),
      "browser storage at the end holds the key",
    ).toBe(false);
    expect(
      holds(consoleLines.join("\n"), secret, uri),
      "a console message holds the key",
    ).toBe(false);
    const log = readFileSync(logFile, "utf8");
    expect(statSync(logFile).size).toBeGreaterThan(logSizeAtStart);
    expect(
      holds(log, secret, uri),
      "the admin server's log holds the key",
    ).toBe(false);
    const scan = await ownerTextScan(stack);
    expect(scan.columns).toBeGreaterThan(0);
    expect(
      scan.rows.filter((row) => row.unreadable).map((row) => row.place),
      "columns the owner could not read",
    ).toEqual([]);
    expect(
      scan.rows
        .filter((row) => row.value !== null && holds(row.value, secret, uri))
        .map((row) => row.place),
      "database columns holding the key",
    ).toEqual([]);
  });
});
