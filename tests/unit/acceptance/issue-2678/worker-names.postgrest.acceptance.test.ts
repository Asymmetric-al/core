import { randomUUID } from "node:crypto";

import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import {
  anon,
  database,
  identityKeysFixture,
  required,
  service,
  url,
} from "./identity-keys.postgrest-fixture";
import { renderContributionReceiptSnapshotPdf } from "../../../../packages/api/src/admin/contribution-operations/receipt-pdf";
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
import { GET as getComments } from "../../../../packages/api/src/posts/comments";
import { GET as getFeed } from "../../../../packages/api/src/posts/index";
import { FEED_POST_SELECT } from "../../../../packages/api/src/posts/select";
import { postAuthorName } from "../../../../packages/database/hooks/donor-feed-posts";
import { createGraphQLHandler } from "../../../../packages/graphql/handler";
import { membershipsForRole } from "../../../fixtures/auth-memberships";

import type { AuthContext } from "../../../../packages/auth/context";
import type * as AuthModule from "../../../../packages/auth/context";
import type { DocRaptorClient } from "@asym/docraptor-client";

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

const FORBIDDEN =
  /Legal Rowan|Profile Rowan|Party Rowan|Party Xu|Profile Vale|Profile Xu|Profile Yew|Profile Zed|Profile Gone|Profile Orphan|Profile Fern|Profile Reed|Profile Fen|Profile Briar|Profile Moss|Profile Hazel|Party Hazel|Profile Fenn|Profile Linden/;
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
    const { TA, ids, user, token, worker, api, as, body } = fx;

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
        const createdGifts: string[] = [];
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
          createdGifts.push(inserted.rows[0].id as string);
          return {
            donationId: inserted.rows[0].id as string,
            outboxId: randomUUID(),
            replayed: false,
          };
        };
        try {
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
            PRIVATE_WORKER_COLUMNS.filter(
              (c) => c in body.donation!.missionary,
            ),
          ).toEqual([]);
          expect(JSON.stringify(body)).not.toMatch(FORBIDDEN);
        } finally {
          await fx.db!.query(
            "delete from public.donations where id = any($1::uuid[])",
            [createdGifts],
          );
        }
      });

      describe("AL-2678 r2a: commenters, an added comment's author, a stored receipt and the feed name a worker by the projection at the next request (gates a, b)", () => {
        const postV = randomUUID();
        const wMembership = randomUUID();
        const avatar = (who: string) => `https://example.test/${who}.png`;
        const publicEnv = {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL,
          key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        };
        const asMember = (
          who: string,
          assignmentId: string,
          role: "donor" | "missionary",
        ): AuthContext =>
          ({
            userId: who,
            email: null,
            tenantId: TA,
            role,
            memberships: membershipsForRole(role, TA),
            profileId: who,
            isAuthenticated: true,
            assignment: {
              userId: who,
              tenantId: TA,
              membershipRole: role,
              assignmentId,
            },
          }) as AuthContext;
        const restrictV = async () => {
          const restricted = await as(
            "admin",
            "rest/v1/rpc/restrict_worker_publication",
            {
              body: {
                p_tenant_id: TA,
                p_party_id: ids.pV,
                p_security_level: "restricted",
                p_public_alias: "Birch",
                p_do_not_publish: null,
                p_reason: "r2a: the next request",
              },
            },
          );
          expect(
            restricted.status,
            JSON.stringify(await body(restricted)),
          ).toBe(200);
        };
        const restoreV = async () => {
          const lifted = await as(
            "admin",
            "rest/v1/rpc/lift_worker_restriction",
            {
              body: {
                p_tenant_id: TA,
                p_party_id: ids.pV,
                p_security_level: "standard",
                p_clear_do_not_publish: false,
                p_reason: "r2a: restore",
              },
            },
          );
          expect(lifted.status, JSON.stringify(await body(lifted))).toBe(200);
          const cleared = await api(`rest/v1/parties?id=eq.${ids.pV}`, {
            key: service,
            bearer: service,
            method: "PATCH",
            body: { public_alias: null },
          });
          expect(cleared.status, JSON.stringify(await body(cleared))).toBe(204);
        };

        beforeAll(async () => {
          process.env.NEXT_PUBLIC_SUPABASE_URL = url;
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = anon;
          const db = fx.db!;
          await db.query("begin");
          try {
            await db.query(
              "update public.profiles set display_name = 'Profile Xu', full_name = 'Profile Xu', first_name = 'Profile', last_name = 'Xu' where id = $1",
              [worker.X],
            );
            await db.query(
              "update public.profiles set display_name = 'Donor Dee', full_name = 'Donor Dee', first_name = 'Donor', last_name = 'Dee' where id = $1",
              [user.giver],
            );
            await db.query(
              "update public.profiles set avatar_url = 'https://example.test/' || id || '.png' where id = any($1::uuid[])",
              [[...Object.values(worker), ...Object.values(user)]],
            );
            await db.query(
              "insert into authz.memberships (id, user_id, tenant_id, role) values ($1, $2, $3, 'missionary')",
              [wMembership, worker.W, TA],
            );
            await db.query(
              "insert into public.posts (id, tenant_id, missionary_id, content, visibility, status) values ($1, $2, $3, 'From V', 'public', 'published')",
              [postV, TA, worker.V],
            );
            for (const who of [worker.W, worker.V, worker.X, user.giver])
              await db.query(
                "insert into public.post_comments (post_id, user_id, content) values ($1, $2, 'r2a')",
                [postV, who],
              );
            await db.query("commit");
          } catch (error) {
            await db.query("rollback");
            throw error;
          }
        });

        afterAll(() => {
          process.env.NEXT_PUBLIC_SUPABASE_URL = publicEnv.url;
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = publicEnv.key;
        });

        it("r2a test 2: a post's commenters through rpc/post_comment_authors with a donor's token and through the comments route's own code: W as Cedar with no photo, V as Party Vale with the photo, X nameless with no photo, D as Donor Dee with the photo; no body holds a forbidden name", async () => {
          const rpc = await as("giver", "rest/v1/rpc/post_comment_authors", {
            body: { p_post_id: postV },
          });
          const rows = (await body(rpc)) as {
            user_id: string;
            display_name: string | null;
            avatar_url: string | null;
          }[];
          expect(rpc.status, JSON.stringify(rows)).toBe(200);
          expect(
            Object.fromEntries(
              rows.map((r) => [r.user_id, [r.display_name, r.avatar_url]]),
            ),
          ).toEqual({
            [worker.W]: ["Cedar", null],
            [worker.V]: ["Party Vale", avatar(worker.V)],
            [worker.X]: [null, null],
            [user.giver]: ["Donor Dee", avatar(user.giver)],
          });

          s.auth = asMember(user.giver, ids.mGiver!, "donor");
          const route = await getComments(
            new NextRequest(`http://localhost/api/posts/${postV}/comments`, {
              headers: { authorization: `Bearer ${token.giver}` },
            }),
            { params: Promise.resolve({ postId: postV }) },
          );
          const routeBody = (await route.json()) as {
            comments?: {
              user_id: string;
              user: { first_name: string; avatar_url: string | null };
            }[];
          };
          expect(route.status, JSON.stringify(routeBody)).toBe(200);
          expect(
            Object.fromEntries(
              (routeBody.comments ?? []).map((c) => [
                c.user_id,
                [c.user.first_name, c.user.avatar_url],
              ]),
            ),
          ).toEqual({
            [worker.W]: ["Cedar", null],
            [worker.V]: ["Party Vale", avatar(worker.V)],
            [worker.X]: ["", null],
            [user.giver]: ["Donor Dee", avatar(user.giver)],
          });
          expect(JSON.stringify([rows, routeBody])).not.toMatch(FORBIDDEN);
        });

        it("r2a test 3: GraphQL addComment returns its caller as the author, with the request's organization and role: a donor and a worker each get their own profile", async () => {
          for (const [who, assignmentId, role] of [
            [user.giver, ids.mGiver!, "donor"],
            [worker.W, wMembership, "missionary"],
          ] as const) {
            s.auth = asMember(who, assignmentId, role);
            const graph = await createGraphQLHandler().POST(
              new Request("http://localhost/api/graphql", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                  query: `mutation { addComment(postId: "${postV}", content: "r2a ${role}") { id postId content author { id tenantId role } } }`,
                }),
              }),
            );
            const graphBody = (await graph.json()) as {
              data?: { addComment: unknown } | null;
              errors?: unknown;
            };
            expect(
              graphBody.errors,
              `${role}: ${JSON.stringify(graphBody.errors)}`,
            ).toBeUndefined();
            expect(graphBody.data!.addComment).toMatchObject({
              postId: postV,
              content: `r2a ${role}`,
              author: { id: who, tenantId: TA, role },
            });
          }
        });

        it("r2a test 5: a stored receipt snapshot rendered again names each line's worker by the projection at the download (W Cedar, V Party Vale, then Birch once V is restricted), shows a restricted worker without an alias, a worker that is gone and a line with no worker as —, keeps every other stored field, and leaves the stored row as it was", async () => {
          const snapshotId = randomUUID();
          const gone = randomUUID();
          const line = (
            key: string,
            cents: number,
            missionaryId: string | null,
            missionaryName: string,
          ) => ({
            id: `line-${key}`,
            amountCents: cents,
            fundId: null,
            fundName: `Fund ${key}`,
            missionaryId,
            missionaryName,
            memo: `Memo ${key}`,
          });
          const content = {
            version: 1,
            donationId: ids.gW,
            donorName: "Giver Household",
            giftDate: "2026-11-01",
            currencyCode: "USD",
            effective: {
              amountCents: 3900,
              fundId: null,
              missionaryId: ids.mW,
              paymentStatus: "completed",
            },
            designationLines: [
              line("W", 1000, ids.mW!, "Profile Rowan"),
              line("V", 2000, ids.mV!, "Party Vale"),
              line("X", 500, ids.mX!, "Profile Xu"),
              line("Gone", 300, gone, "Profile Gone"),
              line("Orphan", 100, null, "Profile Orphan"),
            ],
            affectedFields: ["amount"],
            adjustmentId: null,
            generatedAt: "2026-11-02T00:00:00.000Z",
          };
          await fx.db!.query(
            "insert into public.contribution_receipt_snapshots (id, tenant_id, donation_id, kind, content) values ($1, $2, $3, 'pdf', $4)",
            [snapshotId, TA, ids.gW, JSON.stringify(content)],
          );
          const render = async () => {
            const html: string[] = [];
            const docraptorClient = {
              async renderSync(input: { html: string }) {
                html.push(input.html);
                return {
                  kind: "sync",
                  pdf: new Uint8Array([0x25, 0x50, 0x44, 0x46]),
                  contentType: "application/pdf",
                  request: {},
                };
              },
            } as unknown as DocRaptorClient;
            await renderContributionReceiptSnapshotPdf({
              supabaseAdmin: serviceClient() as never,
              tenantId: TA,
              snapshotId,
              docraptorClient,
            });
            expect(html).toHaveLength(1);
            return html[0]!;
          };
          const rowsOf = (html: string) =>
            [
              ...html.matchAll(
                /<tr><td>(.*?)<\/td><td>(.*?)<\/td><td>(.*?)<\/td><td class="amount">(.*?)<\/td><\/tr>/g,
              ),
            ].map((m) => m.slice(1));
          const expected = (vName: string) => [
            ["Fund W", "Cedar", "Memo W", "$10.00"],
            ["Fund V", vName, "Memo V", "$20.00"],
            ["Fund X", "—", "Memo X", "$5.00"],
            ["Fund Gone", "—", "Memo Gone", "$3.00"],
            ["Fund Orphan", "—", "Memo Orphan", "$1.00"],
          ];
          const frame = (html: string) => [
            html.includes("<dd>Giver Household</dd>"),
            html.includes("<dd>November 1, 2026</dd>"),
            html.includes("<dd>$39.00</dd>"),
            html.includes("This update reflects a correction to: amount."),
            html.includes(`Donation ID: ${ids.gW}`),
          ];
          try {
            const first = await render();
            expect(rowsOf(first)).toEqual(expected("Party Vale"));
            expect(frame(first)).toEqual([true, true, true, true, true]);
            await restrictV();
            const second = await render().finally(restoreV);
            expect(rowsOf(second)).toEqual(expected("Birch"));
            expect(frame(second)).toEqual([true, true, true, true, true]);
            expect(JSON.stringify([first, second])).not.toMatch(FORBIDDEN);
            const stored = await fx.db!.query(
              "select content from public.contribution_receipt_snapshots where id = $1",
              [snapshotId],
            );
            expect(stored.rows[0].content).toEqual(content);
          } finally {
            await fx.db!.query(
              "delete from public.contribution_receipt_snapshots where id = $1",
              [snapshotId],
            );
          }
        });

        it('r2a test 6, guard ("use cache" is inert under vitest, so this passes on the base; rule 2 of the contract is the red): the feed\'s GET names W Cedar, V Party Vale and X by no name, and after V is restricted through the Data API, with no handler and no revalidateTag, the next GET names V Birch', async () => {
          s.auth = asMember(user.giver, ids.mGiver!, "donor");
          const feed = async () => {
            const response = await getFeed(
              new NextRequest("http://localhost/api/posts?limit=100"),
            );
            const json = (await response.json()) as {
              posts?: { id: string; post_author_public_name: string | null }[];
            };
            expect(response.status, JSON.stringify(json)).toBe(200);
            return Object.fromEntries(
              (json.posts ?? [])
                .filter((p) => [ids.postW, ids.postX, postV].includes(p.id))
                .map((p) => [p.id, p.post_author_public_name]),
            );
          };
          expect(await feed()).toEqual({
            [ids.postW!]: "Cedar",
            [postV]: "Party Vale",
            [ids.postX!]: null,
          });
          await restrictV();
          try {
            expect(await feed()).toEqual({
              [ids.postW!]: "Cedar",
              [postV]: "Birch",
              [ids.postX!]: null,
            });
          } finally {
            await restoreV();
          }
        });
      });
    });
  },
);
