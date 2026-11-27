import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  ADMIN_URL,
  IN_MIGRATE_JOB,
  attempt,
  feeFund,
  giftIntake,
  giftOf,
  grant,
  inTx,
  missionary,
  pay,
  role,
  seedTwoTenants,
} from "./wp8a-rest1-harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "migrate supplies TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

const SERVICE_REVIEW_GRANTS = [
  "GRANT INSERT, DELETE ON TABLE public.staged_gift_allocations TO service_role",
  "GRANT UPDATE ON TABLE public.staged_gifts TO service_role",
];

describe.skipIf(!ADMIN_URL)(
  "AL-2681 WP8a part 2 rest, PR 1: review of a paid line-based gift through both replace_staged_gift_allocations overloads (W8-R14, plan :1147, :1175; real stack, every test rolled back)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    beforeAll(() => db.connect());
    afterAll(() => db.end());

    async function feeGift() {
      const fx = await seedTwoTenants(db);
      const fee = await feeFund(db, fx.A);
      const intake = await giftIntake(db, fx.A, {
        lines: [{ amount: 7000 }, { fund: fee, fee: true, amount: 300 }],
      });
      await pay(db, intake);
      const gift = (await giftOf(db, intake.donationId))!;
      await grant(db, SERVICE_REVIEW_GRANTS);
      return { fx, fee, gift };
    }

    async function lines(giftId: string) {
      await role(db, null);
      return (
        await db.query(
          `SELECT line_number, fund_id, missionary_id, is_fee_cover, amount, legal_entity_id
             FROM public.staged_gift_allocations WHERE staged_gift_id = $1 ORDER BY line_number`,
          [giftId],
        )
      ).rows as Record<string, unknown>[];
    }

    async function replace(args: unknown[], overload: 3 | 4) {
      await role(db, "service_role");
      const sql =
        overload === 4
          ? "SELECT public.replace_staged_gift_allocations($1, $2, $3::jsonb, $4)"
          : "SELECT public.replace_staged_gift_allocations($1, $2, $3::jsonb)";
      await db.query("SAVEPOINT review");
      const r = await attempt(db, sql, args);
      if (r.ok) {
        try {
          await db.query("SET CONSTRAINTS ALL IMMEDIATE");
          await db.query("SET CONSTRAINTS ALL DEFERRED");
        } catch (error) {
          await db.query("ROLLBACK TO SAVEPOINT review");
          const e = error as { code?: string; message?: string };
          return { ok: false, code: e.code, message: e.message, rows: [] };
        }
      }
      await role(db, null);
      return r;
    }

    it("a reviewer re-splits the donor lines: the sum, the entity and the fee line stay, existing numbers stay and a new line takes the next number", () =>
      inTx(db, async () => {
        const { fx, fee, gift } = await feeGift();
        const worker = await missionary(db, fx.A);
        const r = await replace(
          [
            fx.A.tenant,
            gift.id,
            JSON.stringify([
              { fund_id: fx.A.fund, amount: 4000 },
              { missionary_id: worker, amount: 3000 },
              { fund_id: fee, amount: 300 },
            ]),
            "needs_review",
          ],
          4,
        );
        expect(r.ok).toBe(true);
        expect(await lines(gift.id as string)).toEqual([
          {
            line_number: 1,
            fund_id: fx.A.fund,
            missionary_id: null,
            is_fee_cover: false,
            amount: "4000",
            legal_entity_id: fx.A.entity,
          },
          {
            line_number: 2,
            fund_id: fee,
            missionary_id: null,
            is_fee_cover: true,
            amount: "300",
            legal_entity_id: fx.A.entity,
          },
          {
            line_number: 3,
            fund_id: null,
            missionary_id: worker,
            is_fee_cover: false,
            amount: "3000",
            legal_entity_id: fx.A.entity,
          },
        ]);
      }));

    for (const overload of [4, 3] as const)
      it(`through the ${overload}-argument overload, any change to the fee line is 23514: its amount, its removal, its move to a donor fund, a second fee line`, () =>
        inTx(db, async () => {
          const { fx, fee, gift } = await feeGift();
          const before = await lines(gift.id as string);
          for (const split of [
            [
              { fund_id: fx.A.fund, amount: 7100 },
              { fund_id: fee, amount: 200 },
            ],
            [{ fund_id: fx.A.fund, amount: 7300 }],
            [
              { fund_id: fx.A.fund, amount: 7000 },
              { fund_id: fee, amount: 300, line_number: 1 },
            ],
            [
              { fund_id: fee, amount: 7000 },
              { fund_id: fee, amount: 300 },
            ],
            [
              { fund_id: fx.A.fund, amount: 7000, line_number: 2 },
              { fund_id: fee, amount: 300 },
            ],
          ]) {
            const args = [fx.A.tenant, gift.id, JSON.stringify(split)];
            const r = await replace(
              overload === 4 ? [...args, "needs_review"] : args,
              overload,
            );
            expect([JSON.stringify(split), r.code]).toEqual([
              JSON.stringify(split),
              "23514",
            ]);
          }
          expect(await lines(gift.id as string)).toEqual(before);
        }));

    it("a split whose donor lines do not sum to the gift is refused at commit by the balance (23514)", () =>
      inTx(db, async () => {
        const { fx, fee, gift } = await feeGift();
        const r = await replace(
          [
            fx.A.tenant,
            gift.id,
            JSON.stringify([
              { fund_id: fx.A.fund, amount: 6000 },
              { fund_id: fee, amount: 300 },
            ]),
            "needs_review",
          ],
          4,
        );
        expect(r.code).toBe("23514");
      }));

    it("a legacy gift's review through both overloads is unchanged", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        await role(db, null);
        const donation = (
          await db.query(
            "INSERT INTO public.donations (tenant_id, amount, currency, status) VALUES ($1, 1000, 'usd', 'completed') RETURNING id",
            [fx.A.tenant],
          )
        ).rows[0].id as string;
        const giftId = (
          await db.query(
            "INSERT INTO public.staged_gifts (tenant_id, donation_id, amount, currency, status) VALUES ($1, $2, 1000, 'usd', 'needs_review') RETURNING id",
            [fx.A.tenant, donation],
          )
        ).rows[0].id as string;
        await grant(db, SERVICE_REVIEW_GRANTS);
        const split = JSON.stringify([
          { fund_id: fx.A.fund, amount: 600, memo: "a" },
          { fund_id: fx.A.fund, amount: 400 },
        ]);
        expect(
          (await replace([fx.A.tenant, giftId, split, "needs_review"], 4)).ok,
        ).toBe(true);
        expect((await replace([fx.A.tenant, giftId, split], 3)).ok).toBe(true);
        expect(await lines(giftId)).toEqual(
          [
            {
              line_number: null,
              fund_id: fx.A.fund,
              missionary_id: null,
              is_fee_cover: null,
              amount: "600",
              legal_entity_id: null,
            },
            {
              line_number: null,
              fund_id: fx.A.fund,
              missionary_id: null,
              is_fee_cover: null,
              amount: "400",
              legal_entity_id: null,
            },
          ]
            .sort((a, b) => Number(a.amount) - Number(b.amount))
            .reverse(),
        );
        expect(
          (await replace([fx.A.tenant, giftId, split, "ready_to_post"], 4))
            .code,
        ).toBe("40001");
      }));
  },
);
