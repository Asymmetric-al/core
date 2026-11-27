import { randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  ADMIN_URL,
  ATTEMPT_SQL,
  IN_MIGRATE_JOB,
  admitHosts,
  attempt,
  attemptArgs,
  attemptGift,
  begin,
  begun,
  blockedBy,
  configFor,
  configRead,
  dualHost,
  feeFund,
  inTx,
  launch,
  pidOf,
  replica,
  role,
  said,
  seedTwoTenants,
  twoSessions,
  type Hosts,
  type Side,
} from "./wp8a-rest2a-harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "migrate supplies TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

const address = () => `198.51.100.${Math.floor(Math.random() * 250) + 1}`;

describe.skipIf(!ADMIN_URL)(
  "AL-2681 WP8a part 2 rest, PR 2b item zero 5 and 6: the limit of gift attempts and the config read told its surface (real stack)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    beforeAll(() => db.connect());
    afterAll(() => db.end());

    async function world() {
      const fx = await seedTwoTenants(db);
      const hosts = await admitHosts(db, fx.A);
      const hostsB = await admitHosts(db, fx.B);
      await feeFund(db, fx.A);
      await feeFund(db, fx.B);
      return { fx, hosts, hostsB };
    }

    async function secondSite(side: Side) {
      await role(db, null);
      const site = (
        await db.query(
          "INSERT INTO public.sites (tenant_id, name) VALUES ($1, 'Second Site') RETURNING id",
          [side.tenant],
        )
      ).rows[0].id as string;
      const host = `second-${randomUUID().slice(0, 8)}.give.example.test`;
      await db.query(
        `INSERT INTO public.site_domains (host, tenant_id, site_id, surfaces, expected_project, control_proved_at,
           attached_at, routing_proved_at, https_proved_at, sign_in_ready_at, activation_proved_at)
         VALUES ($1, $2, $3, ARRAY['website'], 'donor', now(), now(), now(), now(), now(), now())`,
        [host, side.tenant, site],
      );
      return host;
    }

    async function paidGift(side: Side, hosts: Hosts, from: string) {
      const key = randomUUID();
      const admitted = await attemptGift(db, {
        host: hosts.site,
        address: from,
        key,
      });
      const gift = begun(
        await begin(db, {
          host: hosts.site,
          key,
          lines: [{ fund: side.fund, amount: 1000 }],
        }),
      );
      await replica(
        db,
        "UPDATE public.donations SET status = 'completed' WHERE id = $1",
        [gift.donation_id],
      );
      return admitted;
    }

    const attemptRows = async (tenant: string) => {
      await role(db, null);
      return (
        await db.query(
          "SELECT count(*)::int AS n FROM private.intake_rate_attempts WHERE tenant_id = $1",
          [tenant],
        )
      ).rows[0].n as number;
    };

    describe("the address bucket: the Site with the client address, rolling ten minutes", () => {
      it("35 paid gifts from one address on one Site all pass; then 30 unpaid pass and the 31st is refused with retryAfterSeconds; another Site from the same address passes", () =>
        inTx(db, async () => {
          const { fx, hosts } = await world();
          const from = address();
          for (let i = 0; i < 35; i += 1)
            expect(await paidGift(fx.A, hosts, from)).toEqual({
              admitted: true,
              retry_after_seconds: null,
            });
          for (let i = 0; i < 30; i += 1)
            expect(
              (await attemptGift(db, { host: hosts.site, address: from }))
                .admitted,
            ).toBe(true);
          const refused = await attemptGift(db, {
            host: hosts.site,
            address: from,
          });
          expect(refused.admitted).toBe(false);
          expect(refused.retry_after_seconds).toBeGreaterThanOrEqual(1);
          expect(refused.retry_after_seconds).toBeLessThanOrEqual(600);
          const other = await secondSite(fx.A);
          expect(await attemptGift(db, { host: other, address: from })).toEqual(
            {
              admitted: true,
              retry_after_seconds: null,
            },
          );
        }));

      it("a replayed key that was admitted is free, also when the bucket is full; a key that began an intake is free", () =>
        inTx(db, async () => {
          const { fx, hosts } = await world();
          const from = address();
          const firstKey = randomUUID();
          expect(
            (
              await attemptGift(db, {
                host: hosts.site,
                address: from,
                key: firstKey,
              })
            ).admitted,
          ).toBe(true);
          for (let i = 0; i < 29; i += 1)
            await attemptGift(db, { host: hosts.site, address: from });
          expect(
            (await attemptGift(db, { host: hosts.site, address: from }))
              .admitted,
          ).toBe(false);
          const before = await attemptRows(fx.A.tenant);
          expect(
            (
              await attemptGift(db, {
                host: hosts.site,
                address: from,
                key: firstKey,
              })
            ).admitted,
          ).toBe(true);
          expect(await attemptRows(fx.A.tenant)).toBe(before);
        }));

      it("an unknown host, or a surface the host does not serve, is refused 42501 and writes nothing", () =>
        inTx(db, async () => {
          const { fx, hosts } = await world();
          const before = await attemptRows(fx.A.tenant);
          await role(db, "service_role");
          const unknown = await attempt(
            db,
            ATTEMPT_SQL,
            attemptArgs({
              host: "nowhere.give.example.test",
              address: address(),
            }),
          );
          const wrongSurface = await attempt(
            db,
            ATTEMPT_SQL,
            attemptArgs({
              host: hosts.site,
              surface: "donor_account",
              address: address(),
            }),
          );
          await role(db, null);
          expect(
            [unknown, wrongSurface].map(
              (a) => !a.ok && `${a.code} ${a.message}`,
            ),
          ).toEqual(["42501 host_not_admitted", "42501 host_not_admitted"]);
          expect(await attemptRows(fx.A.tenant)).toBe(before);
        }));

      it("no address and no key is stored: only their digests, and no API role can read the table", () =>
        inTx(db, async () => {
          const { hosts } = await world();
          const from = "203.0.113.77";
          const key = `key-${randomUUID()}`;
          await attemptGift(db, { host: hosts.site, address: from, key });
          await role(db, null);
          const raw = (
            await db.query(
              "SELECT count(*)::int AS n FROM private.intake_rate_attempts AS a WHERE to_jsonb(a)::text LIKE $1 OR to_jsonb(a)::text LIKE $2",
              [`%${from}%`, `%${key}%`],
            )
          ).rows[0].n;
          expect(raw).toBe(0);
          const grants = (
            await db.query(
              `SELECT r FROM unnest(ARRAY['anon', 'authenticated', 'service_role']) AS r
                WHERE has_table_privilege(r, 'private.intake_rate_attempts', 'SELECT')
                   OR has_table_privilege(r, 'private.intake_rate_attempts', 'INSERT')`,
            )
          ).rows;
          expect(grants).toEqual([]);
        }));
    });

    it("only service_role may take an attempt or purge; a blank address is refused 22023 and writes nothing", () =>
      inTx(db, async () => {
        const { fx, hosts } = await world();
        await role(db, null);
        const privileges = (
          await db.query(
            `SELECT r, has_function_privilege(r, 'public.take_intake_attempt(text,text,text,text,uuid)', 'EXECUTE') AS attempt,
                    has_function_privilege(r, 'public.purge_intake_attempts()', 'EXECUTE') AS purge
               FROM unnest(ARRAY['anon', 'authenticated', 'service_role']) AS r ORDER BY r`,
          )
        ).rows;
        expect(privileges).toEqual([
          { r: "anon", attempt: false, purge: false },
          { r: "authenticated", attempt: false, purge: false },
          { r: "service_role", attempt: true, purge: true },
        ]);
        const before = await attemptRows(fx.A.tenant);
        await role(db, "service_role");
        const blank = await attempt(
          db,
          ATTEMPT_SQL,
          attemptArgs({ host: hosts.site, address: "  " }),
        );
        await role(db, null);
        expect(!blank.ok && `${blank.code} ${blank.message}`).toBe(
          "22023 rate_limit_address_required",
        );
        expect(await attemptRows(fx.A.tenant)).toBe(before);
      }));

    describe("the person bucket: a signed-in gift's user, rolling ten minutes", () => {
      it("a signed-in giver's 7th unpaid attempt across seven addresses is refused, while a guest from a fresh address passes", () =>
        inTx(db, async () => {
          const { hosts } = await world();
          const user = randomUUID();
          const answers: boolean[] = [];
          for (let i = 0; i < 7; i += 1)
            answers.push(
              (
                await attemptGift(db, {
                  host: hosts.home,
                  surface: "donor_account",
                  address: `192.0.2.${10 + i}`,
                  user,
                })
              ).admitted,
            );
          expect(answers).toEqual([true, true, true, true, true, true, false]);
          expect(
            (await attemptGift(db, { host: hosts.site, address: "192.0.2.99" }))
              .admitted,
          ).toBe(true);
        }));
    });

    describe("a row older than the window", () => {
      it("is gone after one tick of the money schedule's purge, though its bucket is never called again", () =>
        inTx(db, async () => {
          const { fx, hosts } = await world();
          await attemptGift(db, { host: hosts.site, address: address() });
          await role(db, null);
          const stale = "a".repeat(64);
          await db.query(
            "INSERT INTO private.intake_rate_attempts (bucket_digest, key_digest, tenant_id, created_at) VALUES ($1, $2, $3, now() - interval '11 minutes')",
            [stale, "b".repeat(64), fx.A.tenant],
          );
          await role(db, "service_role");
          const removed = (
            await db.query("SELECT public.purge_intake_attempts() AS n")
          ).rows[0].n as number;
          await role(db, null);
          expect(removed).toBeGreaterThanOrEqual(1);
          const left = (
            await db.query(
              "SELECT bucket_digest FROM private.intake_rate_attempts WHERE tenant_id = $1",
              [fx.A.tenant],
            )
          ).rows.map((r) => r.bucket_digest);
          expect(left).not.toContain(stale);
          expect(left).toHaveLength(1);
        }));
    });

    it("two sessions at the edge of the address bucket: the second waits for the first and is refused; one more attempt in all", () =>
      twoSessions(db, ADMIN_URL, async (s1, s2, fx, hosts) => {
        const from = address();
        try {
          await db.query("BEGIN");
          await feeFund(db, fx.A);
          for (let i = 0; i < 29; i += 1)
            await attemptGift(db, { host: hosts.site, address: from });
          await db.query("COMMIT");
          const pid2 = await pidOf(s2);
          await s1.query("BEGIN");
          await s1.query("SET LOCAL ROLE service_role");
          const first = (
            await s1.query(
              ATTEMPT_SQL,
              attemptArgs({ host: hosts.site, address: from }),
            )
          ).rows[0].r;
          await s2.query("BEGIN");
          await s2.query("SET LOCAL ROLE service_role");
          const second = launch(
            s2,
            ATTEMPT_SQL,
            attemptArgs({ host: hosts.site, address: from }),
          );
          const waited = await blockedBy(db, pid2);
          await s1.query("COMMIT");
          const answer = await second;
          await s2.query("COMMIT");
          expect({ first, waited, second: said(answer) }).toMatchObject({
            first: { admitted: true },
            waited: true,
            second: "committed",
          });
          expect(answer.ok && answer.rows[0]!.r).toMatchObject({
            admitted: false,
          });
          expect(await attemptRows(fx.A.tenant)).toBe(30);
        } finally {
          await db.query("ROLLBACK").catch(() => undefined);
          await db.query(
            "DELETE FROM private.intake_rate_attempts WHERE tenant_id = ANY($1::uuid[])",
            [[fx.A.tenant, fx.B.tenant]],
          );
        }
      }));

    describe("the config read told which surface asks (review 7a)", () => {
      it("an inactive Site on a shared home gets no account for the website; the home asking as donor_account still does", () =>
        inTx(db, async () => {
          const { fx, hosts } = await world();
          const both = await dualHost(db, fx.A, hosts);
          expect(await configFor(db, both, [{ fund: fx.A.fund }])).toEqual([
            { connected_account_id: fx.A.account },
          ]);
          await role(db, null);
          await db.query(
            "UPDATE public.sites SET status = 'inactive' WHERE id = $1",
            [hosts.siteId],
          );
          expect(await configFor(db, both, [{ fund: fx.A.fund }])).toEqual([]);
          expect(
            await configFor(db, both, [{ fund: fx.A.fund }], "donor_account"),
          ).toEqual([{ connected_account_id: fx.A.account }]);
          expect(
            await configFor(
              db,
              hosts.site,
              [{ fund: fx.A.fund }],
              "donor_account",
            ),
          ).toEqual([]);
          expect(
            await configFor(db, both, [{ fund: fx.A.fund }], "elsewhere"),
          ).toEqual([]);
        }));

      it("the way back: a current Site of the host's organization answers its primary domain; another organization's Site, an inactive one, or none answers nothing", () =>
        inTx(db, async () => {
          const { fx, hosts, hostsB } = await world();
          await role(db, null);
          await db.query(
            "UPDATE public.sites SET primary_domain = $2 WHERE id = $1",
            [hosts.siteId, hosts.site],
          );
          await db.query(
            "UPDATE public.sites SET primary_domain = $2 WHERE id = $1",
            [hostsB.siteId, hostsB.site],
          );
          const wayBack = async (site: string | null) =>
            (
              await configRead(
                db,
                hosts.home,
                [{ fund: fx.A.fund }],
                "donor_account",
                site,
              )
            ).map((row) => row.way_back_host);
          expect(await wayBack(hosts.siteId)).toEqual([hosts.site]);
          expect(await wayBack(hostsB.siteId)).toEqual([null]);
          expect(await wayBack(null)).toEqual([null]);
          await role(db, null);
          await db.query(
            "UPDATE public.sites SET status = 'inactive' WHERE id = $1",
            [hosts.siteId],
          );
          expect(await wayBack(hosts.siteId)).toEqual([null]);
        }));
    });
  },
);
