import { randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  ADMIN_URL,
  HOSTED_SERVICE_GRANTS,
  IN_MIGRATE_JOB,
  attempt,
  enterAs,
  feeFund,
  grant,
  inTx,
  lineIntake,
  missionary,
  paymentIntent,
  recordReference,
  role,
  seedTwoTenants,
  storeEvent,
  type Fixture,
  type LineIntake,
} from "./wp8a-p2r2a-harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "migrate supplies TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

const STAGING_BALANCE =
  "public.staged_gifts_allocations_balance, public.staged_gift_allocations_balance, public.staged_gift_allocations_delete_balance";

describe.skipIf(!ADMIN_URL)(
  "AL-2681 WP8a part 2 R2a: the staging generation and the observations (index sections 3.3 and 3.4; real stack; every test rolls back)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    beforeAll(() => db.connect());
    afterAll(() => db.end());

    const short = (r: { ok: boolean; code?: string; message?: string }) =>
      r.ok
        ? "ok"
        : `${r.code} ${(r.message ?? "").replace(/^.*"(\w+)".*$/, "$1")}`;

    const as = async (
      who: "tenant_guard" | "service_role" | "postgres",
      fx: Fixture,
      sql: string,
      params: unknown[] = [],
    ) => {
      if (who === "tenant_guard")
        await enterAs(db, "tenant_guard", fx.A.tenant);
      else await role(db, who === "postgres" ? null : who);
      const r = await attempt(db, sql, params);
      await role(db, null);
      return r;
    };

    const atCommit = async (...steps: (() => Promise<unknown>)[]) => {
      await db.query("SAVEPOINT r2a_commit");
      for (const step of steps) {
        try {
          await step();
          await role(db, null);
        } catch (error) {
          await db.query("ROLLBACK TO SAVEPOINT r2a_commit");
          throw error;
        }
        try {
          await db.query(`SET CONSTRAINTS ${STAGING_BALANCE} IMMEDIATE`);
        } catch (error) {
          await db.query("ROLLBACK TO SAVEPOINT r2a_commit");
          await db.query(`SET CONSTRAINTS ${STAGING_BALANCE} DEFERRED`);
          const e = error as { code?: string; message?: string };
          return `${e.code} ${(e.message ?? "").replace(/^(\w+).*$/, "$1")}`;
        }
        await db.query(`SET CONSTRAINTS ${STAGING_BALANCE} DEFERRED`);
      }
      await db.query("RELEASE SAVEPOINT r2a_commit");
      return "ok";
    };

    const GIFT = `INSERT INTO public.staged_gifts
      (tenant_id, donation_id, legal_entity_id, amount, currency, status, donor_match_status, allocation_status)
      VALUES ($1, $2, $3, $4, $5, 'needs_review', 'needs_review', 'split') RETURNING id`;
    const ALLOCATION = `INSERT INTO public.staged_gift_allocations
      (tenant_id, staged_gift_id, legal_entity_id, line_number, fund_id, missionary_id, is_fee_cover, amount)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`;

    async function stage(fx: Fixture, intake: LineIntake) {
      const g = await as("tenant_guard", fx, GIFT, [
        fx.A.tenant,
        intake.donationId,
        fx.A.entity,
        intake.amount,
        "usd",
      ]);
      if (!g.ok) throw new Error(`stage refused: ${g.code} ${g.message}`);
      const giftId = g.rows[0]!.id as string;
      for (const [i, line] of intake.lines.entries()) {
        const r = await as("tenant_guard", fx, ALLOCATION, [
          fx.A.tenant,
          giftId,
          fx.A.entity,
          i + 1,
          line.missionary ? null : (line.fund ?? fx.A.fund),
          line.missionary ?? null,
          line.fee ?? false,
          line.amount,
        ]);
        if (!r.ok)
          throw new Error(`allocation refused: ${r.code} ${r.message}`);
      }
      return giftId;
    }

    it("A3: service_role staging a line-based intake, or the guard staging a legacy one, is 42501; a staged gift one cent off or in the other entity is 23503; an allocation whose gift is invisible, or whose supplied format differs, is 42501", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        await grant(db, [
          ...HOSTED_SERVICE_GRANTS,
          "GRANT INSERT, UPDATE, DELETE ON TABLE public.staged_gifts, public.staged_gift_allocations TO service_role",
        ]);
        const intake = await lineIntake(db, fx.A);
        await role(db, "service_role");
        const legacy = (
          await db.query(
            "INSERT INTO public.donations (tenant_id, amount, currency) VALUES ($1, 500, 'usd') RETURNING id",
            [fx.A.tenant],
          )
        ).rows[0].id as string;
        const legacyGift = (
          await db.query(
            "INSERT INTO public.staged_gifts (tenant_id, donation_id, amount, currency) VALUES ($1, $2, 500, 'usd') RETURNING id, intake_format",
            [fx.A.tenant, legacy],
          )
        ).rows[0] as { id: string; intake_format: string };
        await role(db, null);
        expect(legacyGift.intake_format).toBe("legacy_header");
        const got = [
          short(
            await as(
              "service_role",
              fx,
              "INSERT INTO public.staged_gifts (tenant_id, donation_id, amount, currency, legal_entity_id) VALUES ($1, $2, $3, 'usd', $4)",
              [fx.A.tenant, intake.donationId, intake.amount, fx.A.entity],
            ),
          ),
          short(
            await as("tenant_guard", fx, GIFT, [
              fx.A.tenant,
              legacy,
              null,
              500,
              "usd",
            ]),
          ),
          short(
            await as(
              "postgres",
              fx,
              "INSERT INTO public.staged_gifts (tenant_id, donation_id, amount, currency, intake_format) VALUES ($1, $2, 500, 'usd', 'line_based')",
              [fx.A.tenant, legacy],
            ),
          ),
          short(
            await as("tenant_guard", fx, GIFT, [
              fx.A.tenant,
              intake.donationId,
              fx.A.entity,
              intake.amount - 1,
              "usd",
            ]),
          ),
          short(
            await as("tenant_guard", fx, GIFT, [
              fx.A.tenant,
              intake.donationId,
              fx.A.otherEntity,
              intake.amount,
              "usd",
            ]),
          ),
          short(
            await as("tenant_guard", fx, ALLOCATION, [
              fx.A.tenant,
              legacyGift.id,
              fx.A.entity,
              1,
              fx.A.fund,
              null,
              false,
              500,
            ]),
          ),
          short(
            await as(
              "service_role",
              fx,
              "INSERT INTO public.staged_gift_allocations (tenant_id, staged_gift_id, fund_id, amount, intake_format) VALUES ($1, $2, $3, 500, 'line_based')",
              [fx.A.tenant, legacyGift.id, fx.A.fund],
            ),
          ),
          short(
            await as(
              "service_role",
              fx,
              "INSERT INTO public.staged_gift_allocations (tenant_id, staged_gift_id, fund_id, amount) VALUES ($1, $2, $3, 500)",
              [fx.B.tenant, legacyGift.id, fx.A.fund],
            ),
          ),
        ];
        expect(got).toEqual([
          "42501 staged_gift_generation_owner",
          "42501 staged_gift_generation_owner",
          "42501 staged_gift_generation_owner",
          "23503 staged_gifts_intake_fk",
          "23503 staged_gifts_intake_fk",
          "42501 staged_gift_allocation_generation_owner",
          "42501 staged_gift_allocation_generation_owner",
          "42501 staged_gift_allocation_generation_owner",
        ]);
      }));

    it("A3: at commit, allocations one cent off, a changed or removed fee allocation, a fee allocation the intake has not, a donor allocation deleted, or no donor allocation is 23514; each change runs after the staged gift's own balance has fired (review finding 2), so the allocations' UPDATE and DELETE triggers are the ones that refuse; a sealed column of a line-based gift or allocation, a changed format and a deleted line-based gift are 23514", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        await grant(db, [
          "GRANT UPDATE, DELETE ON TABLE public.staged_gifts, public.staged_gift_allocations TO tenant_guard",
        ]);
        const fee = await feeFund(db, fx.A);
        const lines = [
          { amount: 600 },
          { amount: 400 },
          { fund: fee, fee: true, amount: 50 },
        ];
        const verdicts: string[] = [];
        const tryCommit = async (
          label: string,
          make: (giftId: string) => Promise<unknown>,
          intakeLines = lines,
        ) => {
          let giftId = "";
          verdicts.push(
            `${label}: ${await atCommit(
              async () => {
                const intake = await lineIntake(db, fx.A, {
                  lines: intakeLines,
                });
                giftId = await stage(fx, intake);
              },
              () => make(giftId),
            )}`,
          );
        };
        const update = (sql: string) => async (giftId: string) => {
          await role(db, null);
          expect((await db.query(sql, [giftId])).rowCount).toBeGreaterThan(0);
        };
        await tryCommit("as copied", async () => {});
        await tryCommit(
          "one cent off",
          update(
            "UPDATE public.staged_gift_allocations SET amount = amount - 1 WHERE staged_gift_id = $1 AND line_number = 1",
          ),
        );
        await tryCommit(
          "fee changed",
          update(
            "UPDATE public.staged_gift_allocations SET amount = amount + CASE WHEN is_fee_cover THEN 1 ELSE 0 END - CASE WHEN line_number = 1 THEN 1 ELSE 0 END WHERE staged_gift_id = $1",
          ),
        );
        await tryCommit(
          "fee removed",
          update(
            "WITH gone AS (DELETE FROM public.staged_gift_allocations WHERE staged_gift_id = $1 AND is_fee_cover RETURNING amount) UPDATE public.staged_gift_allocations SET amount = amount + (SELECT amount FROM gone) WHERE staged_gift_id = $1 AND line_number = 1",
          ),
        );
        await tryCommit(
          "fee the intake has not",
          async (giftId) => {
            await update(
              "UPDATE public.staged_gift_allocations SET amount = amount - 50 WHERE staged_gift_id = $1 AND line_number = 1",
            )(giftId);
            const r = await as("tenant_guard", fx, ALLOCATION, [
              fx.A.tenant,
              giftId,
              fx.A.entity,
              9,
              fee,
              null,
              true,
              50,
            ]);
            if (!r.ok)
              throw Object.assign(new Error(r.message), { code: r.code });
          },
          [{ amount: 600 }, { amount: 400 }],
        );
        await tryCommit(
          "a donor allocation deleted",
          update(
            "DELETE FROM public.staged_gift_allocations WHERE staged_gift_id = $1 AND line_number = 2",
          ),
        );
        await tryCommit(
          "no donor allocation",
          update(
            "UPDATE public.staged_gift_allocations SET fund_id = fund_id WHERE staged_gift_id = $1",
          ),
          [{ fund: fee, fee: true, amount: 50 }],
        );
        await tryCommit(
          "review moves a donor amount (W8-R14)",
          update(
            "UPDATE public.staged_gift_allocations SET amount = amount + CASE line_number WHEN 1 THEN 100 WHEN 2 THEN -100 ELSE 0 END WHERE staged_gift_id = $1",
          ),
        );
        expect(verdicts).toEqual([
          "as copied: ok",
          "one cent off: 23514 staged_gift_allocations_unbalanced",
          "fee changed: 23514 staged_gift_allocations_unbalanced",
          "fee removed: 23514 staged_gift_allocations_unbalanced",
          "fee the intake has not: 23514 staged_gift_allocations_unbalanced",
          "a donor allocation deleted: 23514 staged_gift_allocations_unbalanced",
          "no donor allocation: 23514 staged_gift_allocations_unbalanced",
          "review moves a donor amount (W8-R14): ok",
        ]);

        const intake = await lineIntake(db, fx.A, { lines });
        const giftId = await stage(fx, intake);
        const sealed: string[] = [];
        for (const who of ["postgres", "tenant_guard"] as const)
          for (const set of [
            "amount = amount + 1",
            "currency = 'eur'",
            "legal_entity_id = '" + fx.A.otherEntity + "'",
            "donation_id = '" + randomUUID() + "'",
            "intake_format = 'legacy_header'",
          ])
            sealed.push(
              short(
                await as(
                  who,
                  fx,
                  `UPDATE public.staged_gifts SET ${set} WHERE id = $1`,
                  [giftId],
                ),
              ),
            );
        sealed.push(
          short(
            await as(
              "postgres",
              fx,
              "DELETE FROM public.staged_gifts WHERE id = $1",
              [giftId],
            ),
          ),
        );
        for (const set of [
          "line_number = 7",
          "is_fee_cover = NOT is_fee_cover",
          "legal_entity_id = '" + fx.A.otherEntity + "'",
          "intake_format = 'legacy_header'",
          "tenant_id = '" + fx.B.tenant + "'",
        ])
          sealed.push(
            short(
              await as(
                "postgres",
                fx,
                `UPDATE public.staged_gift_allocations SET ${set} WHERE staged_gift_id = $1 AND line_number = 1`,
                [giftId],
              ),
            ),
          );
        const msg = (s: string) => s.replace(/^(\d{5}) .*$/, "$1");
        expect(sealed.map(msg)).toEqual(Array(16).fill("23514"));
        await role(db, null);
        expect(
          (
            await db.query(
              "SELECT count(*)::int AS n FROM public.staged_gift_allocations WHERE staged_gift_id = $1",
              [giftId],
            )
          ).rows[0].n,
        ).toBe(3);
      }));

    it("A3 (guard; W8-R14): service_role, the review writer's role, may still change a donor allocation's target and amount on a line-based gift when the gift balances at commit", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        await grant(db, [
          "GRANT INSERT, UPDATE, DELETE ON TABLE public.staged_gift_allocations TO service_role",
        ]);
        const worker = await missionary(db, fx.A);
        const verdict = await atCommit(async () => {
          const intake = await lineIntake(db, fx.A, {
            lines: [{ amount: 600 }, { amount: 400 }],
          });
          const giftId = await stage(fx, intake);
          const r = await as(
            "service_role",
            fx,
            "UPDATE public.staged_gift_allocations SET fund_id = NULL, missionary_id = $2, amount = amount + 50 WHERE staged_gift_id = $1 AND line_number = 1 RETURNING line_number, fund_id, missionary_id, amount",
            [giftId, worker],
          );
          const s = await as(
            "service_role",
            fx,
            "UPDATE public.staged_gift_allocations SET amount = amount - 50 WHERE staged_gift_id = $1 AND line_number = 2 RETURNING line_number, fund_id, missionary_id, amount",
            [giftId],
          );
          expect([r.rows, s.rows]).toEqual([
            [
              {
                line_number: 1,
                fund_id: null,
                missionary_id: worker,
                amount: "650",
              },
            ],
            [
              {
                line_number: 2,
                fund_id: fx.A.fund,
                missionary_id: null,
                amount: "350",
              },
            ],
          ]);
        });
        expect(verdict).toBe("ok");
      }));

    it("A3 (bot round B1): an allocation never moves into a gift of another generation or organization: as service_role, a legacy allocation moved onto a line-based gift of its organization is 42501 staged_gift_allocation_generation_owner and that gift still balances, a move into another organization's gift is 42501, and a legacy allocation still moves between two legacy gifts; a gift's own UPDATE re-parents nothing: its format is frozen (23514) and its id is held by its allocations' keys (23503)", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        await grant(db, [
          ...HOSTED_SERVICE_GRANTS,
          "GRANT INSERT, UPDATE, DELETE ON TABLE public.staged_gifts, public.staged_gift_allocations TO service_role",
        ]);
        const legacyGift = async (tenant: string, fund: string) => {
          await role(db, "service_role");
          const donation = (
            await db.query(
              "INSERT INTO public.donations (tenant_id, amount, currency) VALUES ($1, 500, 'usd') RETURNING id",
              [tenant],
            )
          ).rows[0].id as string;
          const gift = (
            await db.query(
              "INSERT INTO public.staged_gifts (tenant_id, donation_id, amount, currency) VALUES ($1, $2, 500, 'usd') RETURNING id",
              [tenant, donation],
            )
          ).rows[0].id as string;
          const allocation = (
            await db.query(
              "INSERT INTO public.staged_gift_allocations (tenant_id, staged_gift_id, fund_id, amount) VALUES ($1, $2, $3, 200) RETURNING id",
              [tenant, gift, fund],
            )
          ).rows[0].id as string;
          await role(db, null);
          return { gift, allocation };
        };
        const first = await legacyGift(fx.A.tenant, fx.A.fund);
        const second = await legacyGift(fx.A.tenant, fx.A.fund);
        const theirs = await legacyGift(fx.B.tenant, fx.B.fund);
        const intake = await lineIntake(db, fx.A, {
          lines: [{ amount: 600 }, { amount: 400 }],
        });
        const lineGift = await stage(fx, intake);
        await role(db, null);
        await db.query(`SET CONSTRAINTS ${STAGING_BALANCE} IMMEDIATE`);
        await db.query(`SET CONSTRAINTS ${STAGING_BALANCE} DEFERRED`);

        const move = (allocation: string, gift: string) =>
          as(
            "service_role",
            fx,
            "UPDATE public.staged_gift_allocations SET staged_gift_id = $2 WHERE id = $1 RETURNING staged_gift_id, intake_format",
            [allocation, gift],
          );
        const onto = await move(first.allocation, lineGift);
        const across = await move(first.allocation, theirs.gift);
        const between = await move(first.allocation, second.gift);
        expect([short(onto), short(across)]).toEqual([
          "42501 staged_gift_allocation_generation_owner",
          "42501 staged_gift_allocation_generation_owner",
        ]);
        expect(between.rows).toEqual([
          { staged_gift_id: second.gift, intake_format: "legacy_header" },
        ]);
        expect(
          (
            await db.query(
              `SELECT count(*)::int AS allocations, sum(amount)::text AS cents,
                      bool_and(intake_format = 'line_based') AS line_based
                 FROM public.staged_gift_allocations WHERE staged_gift_id = $1`,
              [lineGift],
            )
          ).rows,
        ).toEqual([{ allocations: 2, cents: "1000", line_based: true }]);

        const gift = (sql: string, id: string) =>
          as("postgres", fx, sql, [id]).then((r) =>
            r.ok ? "ok" : `${r.code}`,
          );
        expect([
          await gift(
            "UPDATE public.staged_gifts SET intake_format = 'line_based' WHERE id = $1",
            second.gift,
          ),
          await gift(
            "UPDATE public.staged_gifts SET intake_format = 'legacy_header' WHERE id = $1",
            lineGift,
          ),
          await gift(
            "UPDATE public.staged_gifts SET id = gen_random_uuid() WHERE id = $1",
            second.gift,
          ),
          await gift(
            "UPDATE public.staged_gifts SET id = gen_random_uuid() WHERE id = $1",
            lineGift,
          ),
        ]).toEqual(["23514", "23514", "23503", "23503"]);
      }));

    it("A4: an observation updated or deleted is 23514; a second terminal effect for one PaymentIntent is 23505; an event of the other tenant, or a payment that is not the intake's, is 23503", () =>
      inTx(db, async () => {
        const fx = await seedTwoTenants(db);
        const intake = await lineIntake(db, fx.A);
        const pi = paymentIntent();
        await recordReference(db, intake.donationId, pi);
        const mine = await storeEvent(db, fx.A, { pi });
        const again = await storeEvent(db, fx.A, {
          pi,
          type: "payment_intent.canceled",
        });
        const theirs = await storeEvent(db, fx.B, { pi });
        const observe = (eventId: string, effect: string, object = pi) =>
          as(
            "tenant_guard",
            fx,
            `INSERT INTO public.payment_observations
               (tenant_id, donation_id, event_id, provider_account_ref, livemode, payment_object_id,
                effect_kind, provider_created_at, amount, currency)
             VALUES ($1, $2, $3, $4, false, $5, $6, now(), 10300, 'usd')`,
            [
              fx.A.tenant,
              intake.donationId,
              eventId,
              fx.A.account,
              object,
              effect,
            ],
          );
        expect(short(await observe(mine.id, "succeeded"))).toBe("ok");
        const got = [
          short(await observe(again.id, "canceled")),
          short(await observe(theirs.id, "processing")),
          short(await observe(again.id, "processing", paymentIntent())),
          short(
            await as(
              "postgres",
              fx,
              "UPDATE public.payment_observations SET amount = 1 WHERE event_id = $1",
              [mine.id],
            ),
          ),
          short(
            await as(
              "postgres",
              fx,
              "DELETE FROM public.payment_observations WHERE event_id = $1",
              [mine.id],
            ),
          ),
        ];
        expect(
          got.map((g) => g.replace(/^(\d{5}) (?:.* )?(\w+)$/, "$1 $2")),
        ).toEqual([
          "23505 payment_observations_terminal_key",
          "23503 payment_observations_event_fk",
          "23503 payment_observations_intake_fk",
          "23514 payment_observation_sealed",
          "23514 payment_observation_sealed",
        ]);
      }));
  },
);
