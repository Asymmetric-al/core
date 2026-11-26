import {
  expect,
  type BrowserContext,
  type Page,
  type Request,
} from "@playwright/test";

import {
  isLoopbackDatabaseUrl,
  runPsqlQuery,
} from "../../../scripts/lib/psql.mjs";

export const TA = "00000000-0000-0000-0000-000000000001";
export const TB = "00000000-0000-0000-0000-000000000002";
export const P_EMAIL = "demo-owner@givehope.test";
export const Q_EMAIL = "member-care@givehope.test";
export const P_ID = "11111111-1111-1111-1111-111111111111";
export const NAME = "give-hope-demo.localhost";
export const SPARE_NAME = "n2-on-spare.localhost";

export const ORGANIZATION_ID =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

export function proofReady(): boolean {
  return Boolean(
    process.env.N2_ON_BASE_URL &&
    process.env.N2_ON_DB_URL &&
    process.env.N2_ON_PASSWORD,
  );
}

function dbUrl(): string {
  const url = process.env.N2_ON_DB_URL ?? "";
  if (!isLoopbackDatabaseUrl(url)) {
    throw new Error("the proof's database must be on this machine");
  }
  return url;
}

export function sql(statement: string): string {
  return runPsqlQuery({
    databaseUrl: dbUrl(),
    sql: statement,
    cwd: process.cwd(),
  }).trim();
}

export function generation(host = NAME): number {
  return Number(
    sql(`SELECT generation FROM public.site_domains WHERE host = '${host}'`),
  );
}

export function staffRow(tenant: string, staffRole: string): string {
  return sql(
    `SELECT id FROM authz.memberships WHERE user_id = '${P_ID}' AND tenant_id = '${tenant}' AND role = 'staff' AND staff_role = '${staffRole}'`,
  );
}

export function locationsOf(tenant: string): number {
  return Number(
    sql(`SELECT count(*) FROM public.locations WHERE tenant_id = '${tenant}'`),
  );
}

export interface SavedName {
  domain: string;
  homes: string;
  sites: string;
}

export function saveName(): SavedName {
  return {
    domain: sql(
      `SELECT row_to_json(d)::text FROM public.site_domains d WHERE host = '${NAME}'`,
    ),
    homes: sql(
      `SELECT coalesce(json_agg(h ORDER BY h.id)::text, '[]') FROM public.donor_portal_hosts h`,
    ),
    sites: sql(
      `SELECT coalesce(json_agg(s ORDER BY s.id)::text, '[]') FROM public.sites s`,
    ),
  };
}

const DOMAIN_COLUMNS =
  "host, tenant_id, generation, surfaces, site_id, expected_project, control_proved_at, attached_at, attached_by, routing_proved_at, https_proved_at, sign_in_ready_at, activation_proved_at, activation_proved_by";

export function restoreName(saved: SavedName): void {
  const domain = saved.domain.replace(/'/g, "''");
  const homes = saved.homes.replace(/'/g, "''");
  const sites = saved.sites.replace(/'/g, "''");
  sql(`BEGIN;
    UPDATE public.donor_portal_hosts SET primary_domain = NULL WHERE primary_domain IN ('${NAME}', '${SPARE_NAME}');
    UPDATE public.sites SET primary_domain = NULL WHERE primary_domain IN ('${NAME}', '${SPARE_NAME}');
    DELETE FROM public.site_domains WHERE host IN ('${NAME}', '${SPARE_NAME}');
    INSERT INTO public.site_domains (${DOMAIN_COLUMNS}) OVERRIDING SYSTEM VALUE
      SELECT ${DOMAIN_COLUMNS} FROM json_populate_record(NULL::public.site_domains, '${domain}'::json);
    UPDATE public.donor_portal_hosts h SET primary_domain = saved.primary_domain
      FROM json_populate_recordset(NULL::public.donor_portal_hosts, '${homes}'::json) AS saved
      WHERE saved.id = h.id;
    UPDATE public.sites s SET primary_domain = saved.primary_domain
      FROM json_populate_recordset(NULL::public.sites, '${sites}'::json) AS saved
      WHERE saved.id = s.id;
    COMMIT;`);
}

export function bumpGeneration(): number {
  sql(
    `UPDATE public.site_domains SET generation = DEFAULT WHERE host = '${NAME}'`,
  );
  return generation();
}

export function moveNameToB(): void {
  sql(`BEGIN;
    INSERT INTO public.site_domains (host, tenant_id, site_id, surfaces, expected_project, control_proved_at, attached_at, routing_proved_at, https_proved_at, sign_in_ready_at, activation_proved_at)
      VALUES ('${SPARE_NAME}', '${TA}', NULL, ARRAY['staff'], 'donor', now(), now(), now(), now(), now(), now());
    UPDATE public.donor_portal_hosts SET primary_domain = '${SPARE_NAME}' WHERE tenant_id = '${TA}';
    UPDATE public.sites SET primary_domain = NULL WHERE primary_domain = '${NAME}';
    DELETE FROM public.site_domains WHERE host = '${NAME}';
    INSERT INTO public.site_domains (host, tenant_id, site_id, surfaces, expected_project, control_proved_at, attached_at, routing_proved_at, https_proved_at, sign_in_ready_at, activation_proved_at)
      VALUES ('${NAME}', '${TB}', NULL, ARRAY['staff', 'missionary'], 'donor', now(), now(), now(), now(), now(), now());
    UPDATE public.donor_portal_hosts SET primary_domain = '${NAME}' WHERE tenant_id = '${TB}';
    COMMIT;`);
}

export function dropHome(): void {
  sql(`BEGIN;
    INSERT INTO public.site_domains (host, tenant_id, site_id, surfaces, expected_project, control_proved_at, attached_at, routing_proved_at, https_proved_at, sign_in_ready_at, activation_proved_at)
      VALUES ('${SPARE_NAME}', '${TA}', NULL, ARRAY['staff'], 'donor', now(), now(), now(), now(), now(), now());
    UPDATE public.donor_portal_hosts SET primary_domain = '${SPARE_NAME}' WHERE tenant_id = '${TA}';
    COMMIT;`);
}

export function revokeRow(id: string): void {
  sql(
    `UPDATE authz.memberships SET is_active = false, revoked_at = now() WHERE id = '${id}'`,
  );
}

export function restoreRow(id: string): void {
  sql(
    `UPDATE authz.memberships SET is_active = true, revoked_at = NULL WHERE id = '${id}'`,
  );
}

export async function signIn(page: Page, email: string): Promise<void> {
  await page.context().clearCookies();
  await page.goto("/admin/login");
  const button = page.getByRole("button", { name: /^Sign in$/ });
  await expect(button).toBeVisible();
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.locator("#password").fill(process.env.N2_ON_PASSWORD ?? "");
  await button.click();
  await page.waitForURL((url) => !url.pathname.endsWith("/login"));
}

export interface OwnApiCall {
  url: string;
  method: string;
  headers: Record<string, string>;
  status: number | null;
  refused: string | null;
}

export function recordOwnApi(page: Page): OwnApiCall[] {
  const calls: OwnApiCall[] = [];
  const byRequest = new Map<Request, OwnApiCall>();
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (!url.pathname.startsWith("/admin/api/")) return;
    const call: OwnApiCall = {
      url: url.pathname + url.search,
      method: request.method(),
      headers: request.headers(),
      status: null,
      refused: null,
    };
    calls.push(call);
    byRequest.set(request, call);
  });
  page.on("response", (response) => {
    const call = byRequest.get(response.request());
    if (!call) return;
    call.status = response.status();
    call.refused = response.headers()["x-asym-scope-refused"] ?? null;
  });
  return calls;
}

export async function documentScope(
  page: Page,
): Promise<{ prefix: string | null; assignment: string | null }> {
  const marker = page.locator("[data-tenant-scope]").first();
  await expect(marker).toBeAttached();
  return {
    prefix: await marker.getAttribute("data-tenant-scope"),
    assignment: await marker.getAttribute("data-tenant-assignment"),
  };
}

export interface Answer {
  status: number;
  refused: string | null;
  cacheControl: string | null;
}

export async function sendAs(
  page: Page,
  path: string,
  claims: Record<string, string>,
  init: { method?: string; body?: unknown } = {},
): Promise<Answer> {
  return page.evaluate(
    async ({ path: target, claims: headers, method, body }) => {
      const response = await fetch(target, {
        method: method ?? "GET",
        credentials: "same-origin",
        cache: "no-store",
        headers: {
          ...headers,
          "x-n2-on-proof": "replay",
          ...(body === undefined ? {} : { "content-type": "application/json" }),
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
      return {
        status: response.status,
        refused: response.headers.get("x-asym-scope-refused"),
        cacheControl: response.headers.get("cache-control"),
      };
    },
    { path, claims, method: init.method, body: init.body },
  );
}

export function claimsOf(call: OwnApiCall): Record<string, string> {
  const claims: Record<string, string> = {};
  for (const name of [
    "x-asym-tenant",
    "x-asym-assignment",
    "x-asym-scope-generation",
  ]) {
    const value = call.headers[name];
    if (value !== undefined) claims[name] = value;
  }
  return claims;
}

export const LOCATION = {
  title: "N2 on proof",
  lat: 1,
  lng: 1,
  type: "custom",
  status: "draft",
};

export async function recordReloadNotices(context: BrowserContext) {
  await context.addInitScript(() => {
    const mark = () => {
      if (document.querySelector("[data-scope-reload-notice]")) {
        const seen = Number(sessionStorage.getItem("n2-on:notice") ?? "0");
        sessionStorage.setItem("n2-on:notice", String(seen + 1));
        observer.disconnect();
      }
    };
    const observer = new MutationObserver(mark);
    document.addEventListener("DOMContentLoaded", () => {
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
      });
      mark();
    });
  });
}

export async function reloadNoticesSeen(page: Page): Promise<number> {
  return page.evaluate(() =>
    Number(sessionStorage.getItem("n2-on:notice") ?? "0"),
  );
}

export function addressCarriesNoScope(address: string): boolean {
  const url = new URL(address);
  return (
    !ORGANIZATION_ID.test(url.pathname + url.search) &&
    !url.pathname.includes("~")
  );
}
