import { randomBytes, randomUUID } from "node:crypto";

import { createClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";

import {
  anon,
  database,
  identityKeysFixture,
  required,
  service,
  url,
  type Person,
} from "./identity-keys.postgrest-fixture";
import {
  listMissionaryTasks,
  writeMissionaryTask,
} from "../../../../packages/api/src/missionary-portal/service";
import { donorActivitySchema } from "../../../../packages/database/collections/schemas/giving";

import type * as AuthModule from "../../../../packages/auth/context";

const s = vi.hoisted(() => ({
  auth: null as unknown,
  intake: null as
    | null
    | ((input: {
        missionaryId: string;
        amountCents: number;
        currency: string;
      }) => Promise<{
        donationId: string;
        outboxId: string;
        replayed: boolean;
      }>),
}));
vi.mock("@asym/auth/context", async (orig) => ({
  ...(await orig<typeof AuthModule>()),
  getAuthContext: async () => s.auth,
}));
vi.mock("@asym/database/supabase/admin", () => {
  let client: ReturnType<typeof createClient> | undefined;
  return {
    getAdminClient: () => {
      client ??= createClient(
        process.env.WP5_IDENTITY_IT_URL ?? "http://127.0.0.1:1",
        process.env.WP5_IDENTITY_IT_SERVICE_KEY ?? "no-key",
        { auth: { persistSession: false, autoRefreshToken: false } },
      );
      return { client, error: null };
    },
  };
});
vi.mock("../../../../packages/api/src/stripe/tenant-client", () => ({
  resolveTenantStripe: async () => ({ ok: true, stripe: {} }),
}));
vi.mock("../../../../packages/api/src/donate/saga", () => ({
  processDonationSagaOutboxEvent: async () => ({ status: "completed" }),
}));
vi.mock("../../../../packages/api/src/donate/begin-gift-intake", () => ({
  beginGiftIntake: async (input: {
    missionaryId: string;
    amountCents: number;
    currency: string;
  }) => ({ ok: true, ...(await s.intake!(input)) }),
}));
vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}));

describe.skipIf(!required && ![url, database, anon, service].some(Boolean))(
  "AL-2678 identity keys through PostgREST with real tokens",
  () => {
    const fx = identityKeysFixture();
    const { TA, TB, ids, user, token, api, as, body } = fx;

    it("the running build's task statements work on the new keys: the donor embed resolves through missionary_tasks_donor_id_fkey, and integer and fractional sort keys come back as JSON numbers", async () => {
      const client = createClient(url!, service!, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const scope = {
        supabaseAdmin: client as never,
        profileId: user.missionary,
        tenantId: TA,
        assignmentId: ids.mMissionary!,
      };
      await writeMissionaryTask(scope, "create", null, {
        title: "Call the donor",
        donor_id: ids.dDonor,
        sort_key: 100,
      });
      await writeMissionaryTask(scope, "create", null, {
        title: "Pray",
        sort_key: 15.5,
      });
      const listed = await listMissionaryTasks(scope);
      expect(listed.map((t) => [t.title, t.sort_key])).toEqual([
        ["Pray", 15.5],
        ["Call the donor", 100],
      ]);
      const raw = await api(
        `rest/v1/rpc/missionary_owned_tasks?${new URLSearchParams({ select: "id,sort_key,donor_id,donor:donors!missionary_tasks_donor_id_fkey(id,name,email,avatar_url,giving_preferences)", order: "sort_key.asc" })}`,
        {
          key: service,
          bearer: service,
          body: {
            p_profile_id: user.missionary,
            p_tenant_id: TA,
            p_assignment_id: ids.mMissionary,
          },
        },
      );
      const rows = await body(raw);
      expect(raw.status, JSON.stringify(rows)).toBe(200);
      expect(rows.map((r: { sort_key: unknown }) => typeof r.sort_key)).toEqual(
        ["number", "number"],
      );
      expect(
        rows.map((r: { donor: { id: string } | null }) => r.donor?.id ?? null),
      ).toEqual([null, ids.dDonor]);
    });

    it("the running build's follower-request embed by a column hint on donor_id still resolves, so the follower key keeps its single column in part 1", async () => {
      const response = await api(
        `rest/v1/rpc/missionary_follower_requests?${new URLSearchParams({ select: "id,donor_id,status,donor:donors!donor_id(id,name,avatar_url,status,total_given,last_gift_date)" })}`,
        {
          key: service,
          bearer: service,
          body: {
            p_profile_id: user.missionary,
            p_tenant_id: TA,
            p_assignment_id: ids.mMissionary,
          },
        },
      );
      const rows = await body(response);
      expect(response.status, JSON.stringify(rows)).toBe(200);
      expect(rows.map((r: { donor: { id: string } }) => r.donor.id)).toEqual([
        ids.dDonor,
      ]);
    });

    it("the old activity read parses with the running build's schema", async () => {
      const response = await api("rest/v1/rpc/missionary_activities", {
        key: service,
        bearer: service,
        body: {
          p_profile_id: user.missionary,
          p_tenant_id: TA,
          p_assignment_id: ids.mMissionary,
          p_donor_ids: [ids.dDonor],
        },
      });
      const rows = await body(response);
      expect(response.status, JSON.stringify(rows)).toBe(200);
      expect(rows).toHaveLength(1);
      expect(donorActivitySchema.parse(rows[0]).id).toBe(ids.aDonor);
    });

    it("a backfilled donor and a claimed donor whose donor record names no profile each read their own gifts and activities, and nobody else's", async () => {
      for (const [who, gift, activity, donor] of [
        ["donor", ids.gDonor, ids.aDonor, ids.dDonor],
        ["claimed", ids.gClaimed, ids.aClaimed, ids.dClaimed],
      ] as [Person, string, string, string][]) {
        for (const [table, expected] of [
          ["donations", gift],
          ["donor_activities", activity],
          ["donors", donor],
        ] as const) {
          const response = await as(
            who,
            `rest/v1/${table}?select=id&tenant_id=eq.${TA}`,
          );
          expect(response.status).toBe(200);
          expect(
            (await body(response)).map((r: { id: string }) => r.id),
          ).toEqual([expected]);
        }
      }
      const missionaryGifts = await as(
        "missionary",
        `rest/v1/donations?select=id&tenant_id=eq.${TA}&order=amount.asc`,
      );
      expect(
        (await body(missionaryGifts)).map((r: { id: string }) => r.id),
      ).toEqual([ids.gDonor, ids.gClaimed]);
      const otherTenant = await as(
        "staffB",
        `rest/v1/donations?select=id&tenant_id=eq.${TA}`,
      );
      expect(await body(otherTenant)).toEqual([]);
    });

    it("the running build's caller-token statements still answer a backfilled donor: the donor record by profile, the profile by id and by user_id, and the feed-preference read and upsert", async () => {
      const byProfile = await as(
        "donor",
        `rest/v1/donors?select=id&profile_id=eq.${user.donor}`,
      );
      expect(await body(byProfile)).toEqual([{ id: ids.dDonor }]);
      for (const column of ["id", "user_id"]) {
        const profile = await api(
          `rest/v1/profiles?select=id&${column}=eq.${user.donor}`,
          { bearer: token.donor },
        );
        expect(await body(profile)).toEqual([{ id: user.donor }]);
      }
      const lookup = await as(
        "donor",
        `rest/v1/donors?select=id&tenant_id=eq.${TA}&profile_id=in.(${user.donor})&limit=2`,
      );
      expect(await body(lookup)).toEqual([{ id: ids.dDonor }]);
      const upsert = await as(
        "donor",
        "rest/v1/donor_feed_preferences?on_conflict=donor_id,tenant_id&select=*",
        {
          body: {
            donor_id: ids.dDonor,
            tenant_id: TA,
            updated_at: new Date().toISOString(),
            show_org_posts: false,
          },
          headers: {
            Prefer: "resolution=merge-duplicates,return=representation",
            Accept: "application/vnd.pgrst.object+json",
          },
        },
      );
      const saved = await body(upsert);
      expect(upsert.status, JSON.stringify(saved)).toBeLessThan(300);
      expect(saved).toMatchObject({
        donor_id: ids.dDonor,
        show_org_posts: false,
      });
      const read = await as(
        "donor",
        `rest/v1/donor_feed_preferences?select=*&donor_id=eq.${ids.dDonor}&tenant_id=eq.${TA}`,
      );
      expect(
        (await body(read)).map((r: { donor_id: string }) => r.donor_id),
      ).toEqual([ids.dDonor]);
      const foreign = await as(
        "claimed",
        "rest/v1/donor_feed_preferences?on_conflict=donor_id,tenant_id",
        {
          body: { donor_id: ids.dDonor, tenant_id: TA, show_org_posts: true },
          headers: { Prefer: "resolution=merge-duplicates" },
        },
      );
      expect([401, 403]).toContain(foreign.status);
    });

    it("party_restricted is not on the Data API; staff of the tenant read a worker's legal name through the read function; a donor, a missionary and another tenant's staff do not; direct writes of the safety fields are refused and the commands set them", async () => {
      const set = await as("admin", "rest/v1/rpc/set_worker_identity", {
        body: {
          p_tenant_id: TA,
          p_party_id: ids.pMissionary,
          p_legal_name: "Legal Worker",
          p_real_country: "Country",
          p_precise_location: "Place",
          p_display_name: null,
          p_security_level: "restricted",
          p_public_alias: "Shepherd",
          p_reason: "Field security",
        },
      });
      expect(set.status, JSON.stringify(await body(set))).toBe(200);
      for (const who of ["admin", "donor", "missionary"] as Person[]) {
        const direct = await as(who, "rest/v1/party_restricted?select=*", {
          headers: { "Accept-Profile": "private" },
        });
        expect(direct.status).not.toBe(200);
        const exposed = await as(who, "rest/v1/party_restricted?select=*");
        expect(exposed.status).not.toBe(200);
      }
      const read = (who: Person) =>
        as(who, "rest/v1/rpc/read_party_restricted", {
          body: { p_party_id: ids.pMissionary },
        });
      expect(await body(await read("admin"))).toMatchObject([
        { party_id: ids.pMissionary, legal_name: "Legal Worker" },
      ]);
      for (const who of ["donor", "missionary", "staffB"] as Person[])
        expect(await body(await read(who))).toEqual([]);
      for (const [method, path, payload] of [
        [
          "PATCH",
          `rest/v1/parties?id=eq.${ids.pMissionary}`,
          { security_level: "standard" },
        ],
        [
          "PATCH",
          `rest/v1/parties?id=eq.${ids.pMissionary}`,
          { public_alias: "Other" },
        ],
        [
          "PATCH",
          `rest/v1/parties?id=eq.${ids.pMissionary}`,
          { do_not_publish: true },
        ],
        [
          "POST",
          "rest/v1/parties",
          {
            tenant_id: TA,
            display_name: "x",
            security_level: "high_risk",
            public_alias: "y",
          },
        ],
      ] as const) {
        const response = await as("admin", path, { method, body: payload });
        const error = await body(response);
        expect(response.status, `${method} ${JSON.stringify(payload)}`).toBe(
          403,
        );
        expect(error.code).toBe("42501");
        expect(error.message, `${method} ${JSON.stringify(payload)}`).toBe(
          "permission denied for table parties",
        );
      }
      const restricted = await as(
        "admin",
        "rest/v1/rpc/restrict_worker_publication",
        {
          body: {
            p_tenant_id: TA,
            p_party_id: ids.pMissionary,
            p_security_level: "high_risk",
            p_public_alias: null,
            p_do_not_publish: true,
            p_reason: "Escalated",
          },
        },
      );
      expect(await body(restricted)).toMatchObject({
        security_level: "high_risk",
        security_level_source: "manual",
        do_not_publish: true,
      });
      const projected = await as(
        "donor",
        "rest/v1/rpc/worker_public_display_name",
        {
          body: {
            p_public_alias: "Shepherd",
            p_approved_profile_display_name: null,
            p_party_display_name: "Worker",
          },
        },
      );
      expect(await body(projected)).toBe("Shepherd");
    });

    it("an unmatched claim start, a random-token redemption, a direct read and a status read through the Data API: the wiring of the claim entries (the four-way equality of matched and unmatched starts is proved in account-claims.realstack)", async () => {
      const inA = { "x-asym-tenant": TA };
      const started = await api("rest/v1/rpc/start_account_claim", {
        bearer: token.staffB,
        body: { p_tenant_id: TA },
        headers: inA,
      });
      expect(started.status).toBe(200);
      expect(await body(started)).toEqual({ status: "received" });
      const redeemed = await api("rest/v1/rpc/redeem_account_claim", {
        bearer: token.staffB,
        body: { p_tenant_id: TA, p_token: randomUUID() },
        headers: inA,
      });
      expect(await body(redeemed)).toEqual({ status: "refused" });
      const direct = await api(`rest/v1/account_claim_requests?select=*`, {
        bearer: token.staffB,
        headers: inA,
      });
      expect(await body(direct)).toEqual([]);
      const status = await api("rest/v1/rpc/account_claim_status", {
        bearer: token.staffB,
        body: { p_tenant_id: TA },
        headers: inA,
      });
      expect(await body(status)).toEqual([]);
    });

    it("each claim entry binds the organization it names to the request's header through the Data API (finding B3; confirmation half B: the lane's exact message, blank and malformed headers, and a caller who holds a redeemed request): start and redeem answer 403 (42501) to a missing, blank, malformed or other organization's header, and the status read answers the redeemed request only under the right header", async () => {
      const mail = `wp5-c-${ids.dClaimed}@example.test`;
      await fx.db!.query(
        `insert into public.account_claim_requests (tenant_id, donor_id, email, requested_by, status, token_sha256, token_expires_at, token_redeemed_at, donor_email_at_issue, resolved_at)
         values ($1, $2, $3, $4, 'verified', $5, now() + interval '1 hour', now(), $3, now())`,
        [TA, ids.dClaimed, mail, user.claimed, randomBytes(32)],
      );
      const statusAs = (headers: Record<string, string>) =>
        api("rest/v1/rpc/account_claim_status", {
          bearer: token.claimed,
          body: { p_tenant_id: TA },
          headers,
        });
      const right = await statusAs({ "x-asym-tenant": TA });
      expect(right.status).toBe(200);
      const rows = await body(right);
      expect(rows).toHaveLength(1);
      expect(Object.keys(rows[0]).sort()).toEqual([
        "created_at",
        "resolved_at",
        "status",
        "updated_at",
      ]);
      expect(rows[0].status).toBe("verified");
      for (const headers of [
        {},
        { "x-asym-tenant": "" },
        { "x-asym-tenant": "not-a-uuid" },
        { "x-asym-tenant": TB },
      ]) {
        for (const [path, payload] of [
          ["rest/v1/rpc/start_account_claim", { p_tenant_id: TA }],
          [
            "rest/v1/rpc/redeem_account_claim",
            { p_tenant_id: TA, p_token: randomUUID() },
          ],
        ] as const) {
          const refused = await api(path, {
            bearer: token.staffB,
            body: payload,
            headers,
          });
          expect(refused.status, `${path} ${JSON.stringify(headers)}`).toBe(
            403,
          );
          const error = await body(refused);
          expect(error.code).toBe("42501");
          expect(error.message, `${path} ${JSON.stringify(headers)}`).toBe(
            "tenant_guard: request tenant scope is required and must match command tenant",
          );
        }
        const status = await statusAs(headers);
        expect(status.status, JSON.stringify(headers)).toBe(200);
        expect(await body(status), JSON.stringify(headers)).toEqual([]);
      }
    });
  },
);
