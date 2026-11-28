import { randomUUID } from "node:crypto";

import pg from "pg";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  ADMIN_URL,
  HOSTED_SERVICE_GRANTS,
  IN_MIGRATE_JOB,
  grant,
  inTx,
  paymentIntent,
  role,
  seedTwoTenants,
  storeEvent,
} from "./wp8a-p2r2a-harness";

import type * as AuthContext from "@asym/auth/context";

vi.mock("@asym/database/supabase/admin", () => ({ getAdminClient: vi.fn() }));
vi.mock("@asym/lib/audit/logger", () => ({
  createAuditLogger: vi.fn(() => ({
    log: vi.fn(),
    logDonation: vi.fn(),
    logPost: vi.fn(),
    logRoleChange: vi.fn(),
  })),
}));
vi.mock("@asym/auth/context", async (importOriginal) => ({
  ...(await importOriginal<typeof AuthContext>()),
  getAuthContext: vi.fn(),
  requireAuth: vi.fn(),
}));
vi.mock("../../../../packages/api/src/stripe/tenant-client", () => ({
  resolveTenantStripe: vi.fn(),
}));
vi.mock("../../../../packages/api/src/donate/saga", () => ({
  processDonationSagaOutboxEvent: vi.fn(),
}));
vi.mock("../../../../packages/api/src/money/settlement", () => ({
  resolveTenantSettlementCurrency: vi.fn(),
}));

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "migrate supplies TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(() => {
      throw new Error("a test of the live build tried to reach the network");
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe.skipIf(!ADMIN_URL)(
  "AL-2681 WP8a part 2 R2a: the live build (index section 2, Q10 (a)) and the replayed key (real stack; every test rolls back)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    beforeAll(() => db.connect());
    afterAll(() => db.end());

    const one = async (sql: string, params: unknown[] = []) =>
      (await db.query(sql, params)).rows[0] as Record<string, unknown>;

    it("E1 (guard): each live statement of index section 2 that meets a new object runs once, unchanged, is not refused and changes the row it names: fund writers and readers, the legacy staging writers, part 1's event store; service_role, anon and authenticated hold nothing on the two new tables, on the table or on any column", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        await grant(db, [
          ...HOSTED_SERVICE_GRANTS,
          "GRANT INSERT, UPDATE, DELETE ON TABLE public.staged_gifts, public.staged_gift_allocations TO service_role",
        ]);
        await role(db, null);
        const fee = await one(
          "INSERT INTO public.funds(id,tenant_id,legal_entity_id,name,system_purpose) SELECT md5(tenant_id::text||':fee'||id::text)::uuid,tenant_id,id,'Fee cover','fee_cover' FROM public.legal_entities WHERE id = $1 RETURNING id, is_reserved_fee_cover",
          [fx.A.entity],
        );
        expect(fee.is_reserved_fee_cover).toBe(true);
        const project = await one(
          `INSERT INTO public.funds (id, tenant_id, legal_entity_id, name, description, target_amount, goal_amount, current_amount, currency, is_active)
           VALUES (gen_random_uuid(), $1, $2, 'Water Project', 'Clean water', 500000, 500000, 0, 'usd', true)
           RETURNING id, is_reserved_fee_cover`,
          [fx.A.tenant, fx.A.entity],
        );
        expect(project.is_reserved_fee_cover).toBe(false);
        const entity = randomUUID();
        await db.query(
          "INSERT INTO public.legal_entities (id, tenant_id, name, country_code, currency, legal_name) VALUES ($1, $2, 'New', 'US', 'usd', 'New')",
          [entity, fx.A.tenant],
        );
        await db.query(
          "INSERT INTO public.funds (tenant_id, legal_entity_id, name, system_purpose) VALUES ($1, $2, 'Fee cover', 'fee_cover')",
          [fx.A.tenant, entity],
        );
        await role(db, "service_role");
        const listed = (
          await db.query(
            "SELECT id, name FROM public.funds WHERE tenant_id = $1 AND system_purpose IS NULL ORDER BY name",
            [fx.A.tenant],
          )
        ).rows.map((r) => r.name);
        expect(listed).toEqual(["R1a fund", "Water Project"]);

        const donation = await one(
          "INSERT INTO public.donations (tenant_id, amount, currency, status, fund_id) VALUES ($1, 2500, 'usd', 'completed', $2) RETURNING id",
          [fx.A.tenant, project.id],
        );
        const header = await one(
          `INSERT INTO public.staged_gifts (tenant_id, donation_id, fund_id, amount, currency, status, donor_match_status,
             allocation_status, receipt_status, crm_post_status, stripe_payment_intent_id, metadata)
           VALUES ($1, $2, $3, 2500, 'usd', 'received', 'matched', 'single_allocation', 'pending', 'not_required', $4, '{}'::jsonb)
           RETURNING *`,
          [fx.A.tenant, donation.id, project.id, paymentIntent()],
        );
        expect([header.intake_format, header.legal_entity_id]).toEqual([
          "legacy_header",
          null,
        ]);
        const duplicate = await db
          .query("SAVEPOINT dup")
          .then(() =>
            db.query(
              "INSERT INTO public.staged_gifts (tenant_id, donation_id, amount, currency) VALUES ($1, $2, 2500, 'usd')",
              [fx.A.tenant, donation.id],
            ),
          )
          .then(
            () => "ok",
            (e: { code?: string; constraint?: string }) =>
              `${e.code} ${e.constraint}`,
          );
        await db.query("ROLLBACK TO SAVEPOINT dup");
        expect(duplicate).toBe("23505 staged_gifts_donation_unique");
        expect(
          (
            await one(
              "SELECT * FROM public.staged_gifts WHERE donation_id = $1",
              [donation.id],
            )
          ).id,
        ).toBe(header.id);
        const initial = await one(
          `INSERT INTO public.staged_gift_allocations (tenant_id, staged_gift_id, fund_id, missionary_id, amount, is_initial)
           VALUES ($1, $2, $3, NULL, 2500, true) RETURNING intake_format, line_number, is_fee_cover, legal_entity_id`,
          [fx.A.tenant, header.id, project.id],
        );
        expect(initial).toEqual({
          intake_format: "legacy_header",
          line_number: null,
          is_fee_cover: null,
          legal_entity_id: null,
        });
        const rowsOf = async (sql: string, params: unknown[]) =>
          (await db.query(sql, params)).rows;
        expect(
          await rowsOf(
            "UPDATE public.staged_gifts SET status = 'refunded', stripe_charge_id = 'ch_r2a', metadata = '{\"latestRefund\":{}}'::jsonb, updated_at = now() WHERE id = $1 RETURNING status, stripe_charge_id, metadata",
            [header.id],
          ),
        ).toEqual([
          {
            status: "refunded",
            stripe_charge_id: "ch_r2a",
            metadata: { latestRefund: {} },
          },
        ]);
        expect(
          await rowsOf(
            "UPDATE public.staged_gifts SET status = 'ready_to_post', reviewed_at = now() WHERE id = $1 RETURNING status, reviewed_at IS NOT NULL AS reviewed",
            [header.id],
          ),
        ).toEqual([{ status: "ready_to_post", reviewed: true }]);
        expect(
          await rowsOf(
            "UPDATE public.staged_gifts SET fund_id = NULL, missionary_id = NULL, review_reason = 'staff patch' WHERE id = $1 RETURNING fund_id, missionary_id, review_reason",
            [header.id],
          ),
        ).toEqual([
          { fund_id: null, missionary_id: null, review_reason: "staff patch" },
        ]);
        expect(
          await rowsOf(
            "UPDATE public.staged_gifts SET receipt_status = 'sent' WHERE id = $1 RETURNING receipt_status",
            [header.id],
          ),
        ).toEqual([{ receipt_status: "sent" }]);
        const allocationsOf = () =>
          rowsOf(
            "SELECT intake_format, amount FROM public.staged_gift_allocations WHERE staged_gift_id = $1 ORDER BY amount",
            [header.id],
          );
        await db.query(
          "SELECT public.replace_staged_gift_allocations($1, $2, $3::jsonb)",
          [
            fx.A.tenant,
            header.id,
            JSON.stringify([
              { fund_id: project.id, amount: 1500 },
              { fund_id: project.id, amount: 1000 },
            ]),
          ],
        );
        expect(await allocationsOf()).toEqual([
          { intake_format: "legacy_header", amount: "1000" },
          { intake_format: "legacy_header", amount: "1500" },
        ]);
        await db.query(
          "SELECT public.replace_staged_gift_allocations($1, $2, $3::jsonb, 'ready_to_post')",
          [
            fx.A.tenant,
            header.id,
            JSON.stringify([{ fund_id: project.id, amount: 2500 }]),
          ],
        );
        expect(await allocationsOf()).toEqual([
          { intake_format: "legacy_header", amount: "2500" },
        ]);
        expect(
          await rowsOf(
            "DELETE FROM public.staged_gifts WHERE id = $1 RETURNING id",
            [header.id],
          ),
        ).toEqual([{ id: header.id }]);
        expect(
          await rowsOf(
            "SELECT count(*)::int AS n FROM public.staged_gifts WHERE id = $1",
            [header.id],
          ),
        ).toEqual([{ n: 0 }]);
        await role(db, null);

        const stored = await storeEvent(db, fx.A, { pi: paymentIntent() });
        expect(stored.id).toMatch(/^[0-9a-f-]{36}$/);
        const holdings = await one(
          `SELECT bool_or(has_table_privilege(r, t, 'SELECT') OR has_table_privilege(r, t, 'INSERT')
                          OR has_table_privilege(r, t, 'UPDATE') OR has_table_privilege(r, t, 'DELETE')
                          OR has_table_privilege(r, t, 'REFERENCES') OR has_table_privilege(r, t, 'TRUNCATE')
                          OR has_any_column_privilege(r, t, 'SELECT') OR has_any_column_privilege(r, t, 'INSERT')
                          OR has_any_column_privilege(r, t, 'UPDATE') OR has_any_column_privilege(r, t, 'REFERENCES')) AS any,
                  has_function_privilege('service_role', 'public.normalize_currency_code(text)', 'EXECUTE') AS service_normalize
             FROM unnest(ARRAY['service_role', 'anon', 'authenticated']) AS r,
                  unnest(ARRAY['public.donation_intake_lines', 'public.payment_observations']) AS t`,
        );
        expect(holdings).toEqual({ any: false, service_normalize: true });
      }));
  },
);
