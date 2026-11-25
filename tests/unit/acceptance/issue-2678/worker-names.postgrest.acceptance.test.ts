import { randomUUID } from "node:crypto";

import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import { beforeAll, describe, expect, it, vi } from "vitest";

import {
  anon,
  database,
  identityKeysFixture,
  required,
  service,
  url,
} from "./identity-keys.postgrest-fixture";
import {
  GET as getDonations,
  POST as postDonation,
} from "../../../../packages/api/src/donations";
import { buildDonorPortalSnapshot } from "../../../../packages/api/src/donor-portal/model";
import {
  getDonorPortalSnapshot,
  getOwnedDonation,
  getOwnedStatementDonations,
  resolveDonorPortalContext,
} from "../../../../packages/api/src/donor-portal/service";
import { FEED_POST_SELECT } from "../../../../packages/api/src/posts/select";
import { postAuthorName } from "../../../../packages/database/hooks/donor-feed-posts";
import { createGraphQLHandler } from "../../../../packages/graphql/handler";
import { membershipsForRole } from "../../../fixtures/auth-memberships";

import type { AuthContext } from "../../../../packages/auth/context";
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

const FORBIDDEN = /Legal Rowan|Profile Rowan|Party Rowan|Party Xu|Profile Vale/;
const PRIVATE_WORKER_COLUMNS = [
  "phone",
  "birth_date",
  "location",
  "region",
  "timezone",
  "social_links",
  "health_status",
  "health_signals",
  "last_check_in",
  "manual_attention",
  "party_id",
  "profile_id",
  "legal_entity_id",
  "import_batch_id",
  "tagline",
];

describe.skipIf(!required && ![url, database, anon, service].some(Boolean))(
  "AL-2678 identity keys through PostgREST with real tokens",
  () => {
    const fx = identityKeysFixture();
    const { TA, ids, user, worker, api, as, body } = fx;

    describe("AL-2678 r1: a worker's name outside Mission Control (plan :1003)", () => {
      const serviceClient = () =>
        createClient(url!, service!, {
          auth: { persistSession: false, autoRefreshToken: false },
        });
      const asDonor = (): AuthContext =>
        ({
          userId: user.giver,
          email: null,
          tenantId: TA,
          role: "donor",
          memberships: membershipsForRole("donor", TA),
          profileId: user.giver,
          isAuthenticated: true,
        }) as AuthContext;

      beforeAll(async () => {
        const restricted = await as(
          "admin",
          "rest/v1/rpc/set_worker_identity",
          {
            body: {
              p_tenant_id: TA,
              p_party_id: ids.pW,
              p_legal_name: "Legal Rowan",
              p_real_country: null,
              p_precise_location: null,
              p_display_name: null,
              p_security_level: "restricted",
              p_public_alias: "Cedar",
              p_reason: "Field security",
            },
          },
        );
        expect(restricted.status, JSON.stringify(await body(restricted))).toBe(
          200,
        );
        await fx.db!.query("begin");
        try {
          await fx.db!.query(
            "alter table public.parties disable trigger parties_alias_check",
          );
          await fx.db!.query(
            "update public.parties set security_level = 'restricted', security_level_source = 'manual' where id = $1",
            [ids.pX],
          );
          await fx.db!.query(
            "alter table public.parties enable trigger parties_alias_check",
          );
          await fx.db!.query("commit");
        } catch (error) {
          await fx.db!.query("rollback");
          throw error;
        }
      });

      it("with the service key the computed columns give the alias for a restricted worker, the Party name for an unrestricted one and null for a restricted worker without an alias; a post's author the same; no body holds a forbidden name", async () => {
        const workers = await api(
          `rest/v1/missionaries?select=id,worker_public_name&id=in.(${ids.mW},${ids.mV},${ids.mX})`,
          { key: service, bearer: service },
        );
        const workerRows = await body(workers);
        expect(workers.status, JSON.stringify(workerRows)).toBe(200);
        expect(
          Object.fromEntries(
            workerRows.map(
              (r: { id: string; worker_public_name: string | null }) => [
                r.id,
                r.worker_public_name,
              ],
            ),
          ),
        ).toEqual({
          [ids.mW!]: "Cedar",
          [ids.mV!]: "Party Vale",
          [ids.mX!]: null,
        });
        const posts = await api(
          `rest/v1/posts?select=id,post_author_public_name&id=in.(${ids.postW},${ids.postX})`,
          { key: service, bearer: service },
        );
        const postRows = await body(posts);
        expect(posts.status, JSON.stringify(postRows)).toBe(200);
        expect(
          Object.fromEntries(
            postRows.map(
              (r: { id: string; post_author_public_name: string | null }) => [
                r.id,
                r.post_author_public_name,
              ],
            ),
          ),
        ).toEqual({ [ids.postW!]: "Cedar", [ids.postX!]: null });
        expect(JSON.stringify([workerRows, postRows])).not.toMatch(FORBIDDEN);
      });

      it("anonymous, a donor and a staff member reach neither computed column nor its function: as a column, and over rpc with valid row arguments that the service key's call binds and answers (B4), each is refused 42501, and no name comes back", async () => {
        const rpcCalls = (): [string, Record<string, unknown>][] => [
          ["worker_public_name", { p_worker: { id: ids.mW, tenant_id: TA } }],
          [
            "post_author_public_name",
            {
              p_post: { id: ids.postW, tenant_id: TA, missionary_id: worker.W },
            },
          ],
        ];
        for (const [fn, args] of rpcCalls()) {
          const served = await api(`rest/v1/rpc/${fn}`, {
            key: service,
            bearer: service,
            body: args,
          });
          expect(
            [served.status, await body(served)],
            `service key rpc ${fn} binds the row argument`,
          ).toEqual([200, "Cedar"]);
        }
        const callers: [
          string,
          (path: string, init?: { body?: unknown }) => Promise<Response>,
        ][] = [
          ["anon", (path, init = {}) => api(path, init)],
          ["donor", (path, init = {}) => as("giver", path, init)],
          ["staff", (path, init = {}) => as("admin", path, init)],
        ];
        for (const [label, call] of callers) {
          const workers = await call(
            `rest/v1/missionaries?select=id,worker_public_name&id=eq.${ids.mW}`,
          );
          const refused = await body(workers);
          expect(workers.status, `${label} missionaries`).toBe(
            label === "anon" ? 401 : 403,
          );
          expect(
            [refused.code, refused.message],
            `${label} missionaries`,
          ).toEqual(["42501", "permission denied for table missionaries"]);
          const posts = await call(
            `rest/v1/posts?select=id,post_author_public_name&id=eq.${ids.postW}`,
          );
          const postBody = await body(posts);
          expect(
            posts.status,
            `${label} posts ${JSON.stringify(postBody)}`,
          ).toBe(label === "anon" ? 401 : 403);
          expect([postBody.code, postBody.message], `${label} posts`).toEqual([
            "42501",
            "permission denied for function post_author_public_name",
          ]);
          for (const [fn, args] of rpcCalls()) {
            const rpc = await call(`rest/v1/rpc/${fn}`, { body: args });
            const rpcBody = await body(rpc);
            expect(rpc.status, `${label} rpc ${fn}`).toBe(
              label === "anon" ? 401 : 403,
            );
            expect(
              [rpcBody.code, rpcBody.message],
              `${label} rpc ${fn}`,
            ).toEqual(["42501", `permission denied for function ${fn}`]);
          }
          expect(JSON.stringify([refused, postBody])).not.toMatch(FORBIDDEN);
        }
      });

      it("the donor portal's own code names W by the alias and V by the Party name on gifts, recurring gifts, a receipt's gift and a statement's gifts, and a gift to X as Missionary support; no response holds a forbidden name", async () => {
        const client = serviceClient();
        const snapshot = await getDonorPortalSnapshot({
          supabaseAdmin: client as never,
          profileId: user.giver,
          tenantId: TA,
        });
        expect(
          snapshot.donations.map((g) => [
            g.id,
            g.designation.name,
            g.missionary?.name,
          ]),
        ).toEqual([
          [ids.gW, "Cedar", "Cedar"],
          [ids.gV, "Party Vale", "Party Vale"],
          [ids.gX, "Missionary support", "Missionary support"],
        ]);
        expect(
          Object.fromEntries(
            snapshot.recurringGifts.map((g) => [
              g.id,
              [g.designation.name, g.missionary?.name],
            ]),
          ),
        ).toEqual({
          [ids.plW!]: ["Cedar", "Cedar"],
          [ids.plV!]: ["Party Vale", "Party Vale"],
        });
        const context = await resolveDonorPortalContext(
          client as never,
          user.giver,
          TA,
        );
        const named = (rows: Awaited<ReturnType<typeof getOwnedDonation>>[]) =>
          buildDonorPortalSnapshot({
            profile: context.profile,
            donor: context.donor,
            donations: rows,
            pledges: [],
            feedPreferences: null,
          }).donations.map((g) => [g.id, g.designation.name]);
        const receipts = [];
        for (const [gift, name] of [
          [ids.gW!, "Cedar"],
          [ids.gV!, "Party Vale"],
        ] as const) {
          const row = await getOwnedDonation({
            supabaseAdmin: client as never,
            donationId: gift,
            donorId: ids.dGiver!,
            tenantId: TA,
          });
          expect(row.missionary?.worker_public_name).toBe(name);
          expect(named([row])).toEqual([[gift, name]]);
          receipts.push(row);
        }
        const statement = await getOwnedStatementDonations({
          supabaseAdmin: client as never,
          donorId: ids.dGiver!,
          tenantId: TA,
          year: new Date().getUTCFullYear(),
        });
        expect(
          statement.map((row) => [row.id, row.missionary?.worker_public_name]),
        ).toEqual([
          [ids.gV, "Party Vale"],
          [ids.gW, "Cedar"],
        ]);
        expect(named(statement)).toEqual([
          [ids.gV, "Party Vale"],
          [ids.gW, "Cedar"],
        ]);
        expect(JSON.stringify([snapshot, receipts, statement])).not.toMatch(
          FORBIDDEN,
        );
      });

      it("the feed's exported select names W's post Cedar and X's post Missionary; GET /api/donations gives the worker's public name and a profile of only id and avatar_url; GraphQL gives Missionary.publicName; no response holds a forbidden name", async () => {
        const client = serviceClient();
        const feed = await client
          .from("posts")
          .select(FEED_POST_SELECT)
          .in("id", [ids.postW!, ids.postX!]);
        expect(feed.error, JSON.stringify(feed.error)).toBeNull();
        expect(
          Object.fromEntries(
            (feed.data ?? []).map((post) => [
              (post as { id: string }).id,
              postAuthorName(post as never),
            ]),
          ),
        ).toEqual({ [ids.postW!]: "Cedar", [ids.postX!]: "Missionary" });
        for (const post of feed.data ?? [])
          expect(
            Object.keys((post as { author: object }).author).sort(),
          ).toEqual(["avatar_url", "id"]);

        s.auth = asDonor();
        const rest = await getDonations(
          new NextRequest("http://localhost/api/donations", { method: "GET" }),
        );
        const restBody = (await rest.json()) as {
          donations?: Array<{
            id: string;
            missionary: { worker_public_name: string | null; profile: object };
          }>;
        };
        expect(rest.status, JSON.stringify(restBody)).toBe(200);
        const byGift = Object.fromEntries(
          (restBody.donations ?? []).map((d) => [d.id, d.missionary]),
        );
        expect(byGift[ids.gW!]?.worker_public_name).toBe("Cedar");
        expect(byGift[ids.gV!]?.worker_public_name).toBe("Party Vale");
        expect(byGift[ids.gX!]?.worker_public_name).toBeNull();
        for (const missionary of Object.values(byGift))
          expect(Object.keys(missionary.profile).sort()).toEqual([
            "avatar_url",
            "id",
          ]);

        const graph = await createGraphQLHandler().POST(
          new Request("http://localhost/api/graphql", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              query:
                "{ myDonations(limit: 10) { id missionary { id publicName profile { id } } } }",
            }),
          }),
        );
        const graphBody = (await graph.json()) as {
          data?: {
            myDonations: Array<{
              id: string;
              missionary: {
                publicName: string | null;
                profile: { id: string };
              };
            }>;
          };
          errors?: unknown;
        };
        expect(
          graphBody.errors,
          JSON.stringify(graphBody.errors),
        ).toBeUndefined();
        expect(
          Object.fromEntries(
            graphBody.data!.myDonations.map((d) => [
              d.id,
              d.missionary.publicName,
            ]),
          ),
        ).toEqual({
          [ids.gW!]: "Cedar",
          [ids.gV!]: "Party Vale",
          [ids.gX!]: null,
        });
        expect(JSON.stringify([feed.data, restBody, graphBody])).not.toMatch(
          FORBIDDEN,
        );
      });

      it("a donor's GET /api/donations carries none of a restricted worker's private columns (Q4)", async () => {
        s.auth = asDonor();
        const rest = await getDonations(
          new NextRequest("http://localhost/api/donations", { method: "GET" }),
        );
        const restBody = (await rest.json()) as {
          donations?: Array<{
            id: string;
            missionary: Record<string, unknown>;
          }>;
        };
        expect(rest.status, JSON.stringify(restBody)).toBe(200);
        const worker = (restBody.donations ?? []).find(
          (d) => d.id === ids.gW,
        )!.missionary;
        expect(worker.worker_public_name).toBe("Cedar");
        for (const d of restBody.donations ?? [])
          expect(
            PRIVATE_WORKER_COLUMNS.filter((c) => c in d.missionary),
            d.id,
          ).toEqual([]);
        expect(JSON.stringify(restBody)).not.toMatch(
          /\+15555550101|1981-02-02|Another place/,
        );
      });

      it("GraphQL names a worker with no profile by its public name and a null profile, without an error (F8)", async () => {
        s.auth = asDonor();
        const graph = await createGraphQLHandler().POST(
          new Request("http://localhost/api/graphql", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              query: `{ missionary(id: "${ids.mN}") { id publicName profile { id } } }`,
            }),
          }),
        );
        const graphBody = (await graph.json()) as {
          data?: { missionary: unknown };
          errors?: unknown;
        };
        expect(
          graphBody.errors,
          JSON.stringify(graphBody.errors),
        ).toBeUndefined();
        expect(graphBody.data!.missionary).toEqual({
          id: ids.mN,
          publicName: "Party Nell",
          profile: null,
        });
      });

      it("a donor's POST /api/donations returns the gift to a restricted worker with none of its private columns (Q4)", async () => {
        s.auth = asDonor();
        s.intake = async (input) => {
          const inserted = await fx.db!.query(
            "insert into public.donations (tenant_id, donor_id, missionary_id, amount, currency, status) values ($1, $2, $3, $4, $5, 'completed') returning id",
            [
              TA,
              ids.dGiver,
              input.missionaryId,
              input.amountCents,
              input.currency,
            ],
          );
          return {
            donationId: inserted.rows[0].id as string,
            outboxId: randomUUID(),
            replayed: false,
          };
        };
        const created = await postDonation(
          new NextRequest("http://localhost/api/donations", {
            method: "POST",
            headers: {
              "content-type": "application/json",
              "idempotency-key": randomUUID(),
            },
            body: JSON.stringify({ missionaryId: ids.mW, amount: 700 }),
          }),
        );
        const body = (await created.json()) as {
          donation: { missionary: Record<string, unknown> } | null;
        };
        expect(created.status, JSON.stringify(body)).toBe(201);
        expect(body.donation!.missionary.worker_public_name).toBe("Cedar");
        expect(
          PRIVATE_WORKER_COLUMNS.filter((c) => c in body.donation!.missionary),
        ).toEqual([]);
        expect(JSON.stringify(body)).not.toMatch(FORBIDDEN);
      });
    });
  },
);
