import { randomUUID } from "node:crypto";

import type { Page, Route } from "@playwright/test";
import type pg from "pg";

import {
  GUEST_GIVING_PORTS,
  JOURNEY_PUBLISHABLE_KEY,
  TURNSTILE_TEST_KEYS,
} from "../../../scripts/e2e/run-guest-giving.mjs";

export { GUEST_GIVING_PORTS, JOURNEY_PUBLISHABLE_KEY, TURNSTILE_TEST_KEYS };

export type GivingAccounts = { A1: string; A2: string; B1: string };

export type GivingWorld = {
  tenants: { A: string; B: string };
  hosts: { siteA: string; homeA: string; siteB: string };
  sites: { siteA: string; homeA: string; siteB: string };
  funds: { A1: string; A2: string; B1: string };
  accounts: GivingAccounts;
};

const PROOFS =
  "control_proved_at, attached_at, routing_proved_at, https_proved_at, sign_in_ready_at, activation_proved_at";

const label = () => randomUUID().replaceAll("-", "").slice(0, 10);

export function journeyAccounts(): GivingAccounts {
  const account = () => `acct_e2e${label()}`;
  return { A1: account(), A2: account(), B1: account() };
}

export const origin = (host: string) =>
  `http://${host}:${GUEST_GIVING_PORTS.donor}`;

async function entityWithAccount(
  db: pg.Client,
  tenant: string,
  name: string,
  account: string,
): Promise<{ entity: string; fund: string }> {
  const entity = randomUUID();
  const intent = randomUUID();
  const fund = randomUUID();
  await db.query(
    `INSERT INTO public.legal_entities (id, tenant_id, name, country_code, currency, legal_name)
     VALUES ($1, $2, $3, 'US', 'usd', $3 || ' Inc.')`,
    [entity, tenant, name],
  );
  await db.query(
    `INSERT INTO public.payment_onboarding_intents
       (id, tenant_id, legal_entity_id, livemode, version, status, reason, created_by, assignment_id,
        provider_account_id, confirmed_at, confirmed_by_event)
     VALUES ($1, $2, $3, false, 1, 'confirmed', 'Guest giving journey', gen_random_uuid(), gen_random_uuid(),
             $4, now(), 'evt_guest_giving_journey')`,
    [intent, tenant, entity, account],
  );
  await db.query(
    `INSERT INTO public.payment_provider_accounts
       (tenant_id, legal_entity_id, provider_account_id, livemode, onboarding_intent_id, confirmed_at)
     VALUES ($1, $2, $3, false, $4, now())`,
    [tenant, entity, account, intent],
  );
  await db.query(
    `INSERT INTO public.payment_account_bindings
       (id, tenant_id, legal_entity_id, version, status, provider_account_ref, livemode,
        onboarding_intent_id, activated_at)
     VALUES (gen_random_uuid(), $1, $2, 1, 'active', $3, false, $4, now())`,
    [tenant, entity, account, intent],
  );
  await db.query(
    `INSERT INTO public.funds (id, tenant_id, legal_entity_id, name)
     VALUES ($1, $2, $3, $4 || ' fund')`,
    [fund, tenant, entity, name],
  );
  await db.query(
    `INSERT INTO public.funds (tenant_id, legal_entity_id, name, system_purpose)
     VALUES ($1, $2, 'Fee cover', 'fee_cover')`,
    [tenant, entity],
  );
  return { entity, fund };
}

async function siteWithName(
  db: pg.Client,
  tenant: string,
  host: string,
  surfaces: string[],
  isDefault: boolean,
): Promise<string> {
  const site = (
    await db.query(
      "INSERT INTO public.sites (tenant_id, name, is_default) VALUES ($1, $2, $3) RETURNING id",
      [tenant, host.split(".")[0], isDefault],
    )
  ).rows[0].id as string;
  await db.query(
    `INSERT INTO public.site_domains (host, tenant_id, site_id, surfaces, expected_project, ${PROOFS})
     VALUES ($1, $2, $3, $4::text[], 'donor', now(), now(), now(), now(), now(), now())`,
    [host, tenant, site, surfaces],
  );
  await db.query("UPDATE public.sites SET primary_domain = $2 WHERE id = $1", [
    site,
    host,
  ]);
  return site;
}

export async function createGivingWorld(
  db: pg.Client,
  accounts: GivingAccounts,
): Promise<GivingWorld> {
  const run = label();
  const tenants = { A: randomUUID(), B: randomUUID() };
  const hosts = {
    siteA: `gg${run}-site-a.localhost`,
    homeA: `gg${run}-home-a.localhost`,
    siteB: `gg${run}-site-b.localhost`,
  };
  await db.query("BEGIN");
  try {
    for (const [side, tenant] of Object.entries(tenants))
      await db.query(
        "INSERT INTO public.tenants (id, name, slug) VALUES ($1, $2, $3)",
        [
          tenant,
          `Guest giving ${side} ${run}`,
          `gg-${run}-${side.toLowerCase()}`,
        ],
      );
    const a1 = await entityWithAccount(db, tenants.A, "Entity A1", accounts.A1);
    const a2 = await entityWithAccount(db, tenants.A, "Entity A2", accounts.A2);
    const b1 = await entityWithAccount(db, tenants.B, "Entity B1", accounts.B1);
    const homeA = await siteWithName(
      db,
      tenants.A,
      hosts.homeA,
      ["website", "donor_account"],
      true,
    );
    const siteA = await siteWithName(
      db,
      tenants.A,
      hosts.siteA,
      ["website"],
      false,
    );
    const siteB = await siteWithName(
      db,
      tenants.B,
      hosts.siteB,
      ["website"],
      true,
    );
    await db.query(
      "INSERT INTO public.donor_portal_hosts (tenant_id, primary_domain) VALUES ($1, $2)",
      [tenants.A, hosts.homeA],
    );
    await db.query(
      "INSERT INTO public.donor_account_brands (tenant_id, display_name) VALUES ($1, $2)",
      [tenants.A, `Guest giving A ${run}`],
    );
    await db.query("COMMIT");
    return {
      tenants,
      hosts,
      sites: { siteA, homeA, siteB },
      funds: { A1: a1.fund, A2: a2.fund, B1: b1.fund },
      accounts,
    };
  } catch (error) {
    await db.query("ROLLBACK");
    throw error;
  }
}

export async function removeGivingWorld(db: pg.Client, world: GivingWorld) {
  const tenants = [world.tenants.A, world.tenants.B];
  const tables = (
    await db.query(
      `SELECT pg_catalog.format('%I.%I', c.table_schema, c.table_name) AS name
         FROM information_schema.columns AS c
         JOIN information_schema.tables AS t
           ON t.table_schema = c.table_schema
          AND t.table_name = c.table_name
          AND t.table_type = 'BASE TABLE'
        WHERE c.column_name = 'tenant_id'
          AND c.table_schema IN ('public', 'private', 'authz')`,
    )
  ).rows.map((row: { name: string }) => row.name);
  await db.query("BEGIN");
  try {
    await db.query("SET LOCAL session_replication_role = replica");
    for (const table of tables)
      await db.query(`DELETE FROM ${table} WHERE tenant_id = ANY($1::uuid[])`, [
        tenants,
      ]);
    await db.query("DELETE FROM public.tenants WHERE id = ANY($1::uuid[])", [
      tenants,
    ]);
    await db.query("COMMIT");
  } catch (error) {
    await db.query("ROLLBACK");
    throw error;
  }
}

export async function givingCounts(db: pg.Client, tenant: string) {
  return (
    await db.query(
      `SELECT (SELECT count(*)::int FROM public.donations WHERE tenant_id = $1 AND intake_format = 'line_based') AS gifts,
              (SELECT count(*)::int FROM public.donation_intake_requests WHERE tenant_id = $1) AS keys,
              (SELECT count(*)::int FROM public.donation_saga_outbox WHERE tenant_id = $1 AND kind = 'provider_request') AS requests`,
      [tenant],
    )
  ).rows[0] as { gifts: number; keys: number; requests: number };
}

export async function givingReadback(db: pg.Client, world: GivingWorld) {
  return (
    await db.query(
      `SELECT d.tenant_id, d.status, d.amount::int, d.currency, d.site_id, d.entry_surface,
              d.provider_account_ref, d.livemode, d.payment_method, d.donor_id IS NOT NULL AS has_donor
         FROM public.donations AS d
        WHERE d.tenant_id = ANY($1::uuid[]) AND d.intake_format = 'line_based'
        ORDER BY d.created_at`,
      [[world.tenants.A, world.tenants.B]],
    )
  ).rows as Record<string, unknown>[];
}

export const STRIPE_JS_STUB = `(() => {
  const log = (window.__stripeStub = window.__stripeStub || { loads: [], elements: [], confirms: [], retrieves: 0 });
  const plan = () => window.__stripeStubPlan || {
    confirm: { paymentIntent: { status: "succeeded" } },
    retrieve: { paymentIntent: { status: "succeeded" } },
  };
  function Stripe(key, options) {
    log.loads.push({ key, options: options || {} });
    return {
      _registerWrapper() {},
      registerAppInfo() {},
      createToken() { return Promise.resolve({ error: { message: "stub" } }); },
      createPaymentMethod() { return Promise.resolve({ error: { message: "stub" } }); },
      confirmCardPayment() { return Promise.resolve({ error: { message: "stub" } }); },
      elements(options) {
        log.elements.push(options || {});
        return {
          create(type) {
            const handlers = {};
            return {
              mount(node) {
                const target = typeof node === "string" ? document.querySelector(node) : node;
                const box = document.createElement("div");
                box.setAttribute("data-testid", "stripe-stub-" + type);
                box.textContent = "Card details (Stripe.js stub)";
                if (target) target.appendChild(box);
                setTimeout(() => (handlers.ready || []).forEach((cb) => cb({ elementType: type })), 0);
              },
              on(event, cb) { (handlers[event] = handlers[event] || []).push(cb); return this; },
              off(event, cb) { handlers[event] = (handlers[event] || []).filter((x) => x !== cb); return this; },
              update() {}, unmount() {}, destroy() {}, focus() {}, blur() {}, clear() {},
            };
          },
          getElement() { return null; },
          update(options) { log.elements.push({ update: options }); },
          submit() { return Promise.resolve({}); },
          fetchUpdates() { return Promise.resolve({}); },
        };
      },
      confirmPayment(args) {
        log.confirms.push({ confirmParams: args && args.confirmParams, redirect: args && args.redirect });
        return Promise.resolve(plan().confirm);
      },
      retrievePaymentIntent() {
        log.retrieves += 1;
        return Promise.resolve(plan().retrieve);
      },
    };
  }
  Stripe.version = "endive";
  window.Stripe = Stripe;
})();`;

const STRIPE_HOSTS =
  /(^|\.)stripe\.(com|network)$|(^|\.)stripecdn\.com$|(^|\.)hcaptcha\.com$/;

export async function stubStripeAtTheNetwork(page: Page): Promise<string[]> {
  const escaped: string[] = [];
  await page.context().route(
    (url) => STRIPE_HOSTS.test(url.hostname),
    async (route: Route) => {
      const url = new URL(route.request().url());
      if (
        url.hostname === "js.stripe.com" &&
        url.pathname.endsWith("/stripe.js")
      )
        return route.fulfill({
          status: 200,
          contentType: "application/javascript",
          body: STRIPE_JS_STUB,
        });
      escaped.push(`${url.hostname}${url.pathname}`);
      return route.abort();
    },
  );
  return escaped;
}
