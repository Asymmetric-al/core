import { randomUUID } from "node:crypto";

import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { BLANK_ALIASES, REAL_ALIAS, codePoints } from "./blank-aliases";
import {
  absent,
  anon,
  as,
  cleanupWorkerRecordStack,
  database,
  id,
  NOT_PERMITTED,
  onAuth,
  provisionWorkerRecordStack,
  REFUSAL_TEXT,
  required,
  rpc,
  service,
  TA,
  TB,
  token,
  url,
  user,
} from "./worker-record.postgrest-fixture";
import { renderContributionReceiptSnapshotPdf } from "../../../../packages/api/src/admin/contribution-operations/receipt-pdf";
import {
  readWorkerRows,
  rpcClient,
} from "../../../../packages/api/src/admin/workers/contract";
import { GET as getDonations } from "../../../../packages/api/src/donations";
import { GET as getDonorPortal } from "../../../../packages/api/src/donor-portal";
import * as partners from "../../../../packages/api/src/missionary-portal/donors";
import { GET as getComments } from "../../../../packages/api/src/posts/comments";
import { GET as getFeed } from "../../../../packages/api/src/posts/index";
import { postAuthorName } from "../../../../packages/database/hooks/donor-feed-posts";
import { createGraphQLHandler } from "../../../../packages/graphql/handler";

import type { Person } from "./worker-record.postgrest-fixture";
import type * as AuthModule from "../../../../packages/auth/context";
import type * as EnvModule from "../../../../packages/env";
import type { DocRaptorClient } from "@asym/docraptor-client";
import type pg from "pg";

const s = vi.hoisted(() => ({ auth: null as unknown }));
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
vi.mock("@asym/env", async (orig) => {
  const real = await orig<typeof EnvModule>();
  return {
    ...real,
    serverEnv: new Proxy(real.serverEnv, {
      get: (target, key) =>
        key === "NEXT_PUBLIC_SUPABASE_URL"
          ? (process.env.WP5_IDENTITY_IT_URL ?? "http://127.0.0.1:1")
          : key === "NEXT_PUBLIC_SUPABASE_ANON_KEY"
            ? (process.env.WP5_IDENTITY_IT_ANON_KEY ?? "no-key")
            : Reflect.get(target, key),
    }),
  };
});
vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}));

onAuth((auth) => {
  s.auth = auth;
});

function request(
  who: Person | null,
  method: string,
  path: string,
  body?: unknown,
  type = "application/json",
) {
  return new NextRequest(`http://localhost${path}`, {
    method,
    headers: {
      ...(who ? { authorization: `Bearer ${token[who]}` } : {}),
      ...(body === undefined ? {} : { "content-type": type }),
    },
    ...(body === undefined
      ? {}
      : { body: typeof body === "string" ? body : JSON.stringify(body) }),
  });
}

const seen: unknown[] = [];
async function answer(response: Response, status: number) {
  const body = (await response.json()) as Record<string, unknown>;
  expect(response.status, JSON.stringify(body)).toBe(status);
  expect(response.headers.get("cache-control")).toBe("no-store");
  return body;
}

const routes = {
  list: () => import("../../../../packages/api/src/admin/workers/read"),
  commands: () => import("../../../../packages/api/src/admin/workers/commands"),
};
const params = (assignmentId: string) => ({
  params: Promise.resolve({ assignmentId }),
});

async function directory(who: Person) {
  const { GET } = await routes.list();
  const body = await answer(
    await GET(request(who, "GET", "/api/admin/workers")),
    200,
  );
  seen.push(body);
  return Object.fromEntries(
    (body.workers as Record<string, unknown>[]).map((w) => [
      w.assignmentId as string,
      w,
    ]),
  );
}
async function count(who: Person) {
  const { GET_UNREVIEWED_COUNT } = await routes.list();
  const body = await answer(
    await GET_UNREVIEWED_COUNT(
      request(who, "GET", "/api/admin/workers/unreviewed-count"),
    ),
    200,
  );
  seen.push(body);
  return body.count;
}
async function record(who: Person | null, assignmentId: string) {
  const { GET_RECORD } = await routes.list();
  return GET_RECORD(
    request(who, "GET", `/api/admin/workers/${assignmentId}`),
    params(assignmentId),
  );
}
type Command = "restrict" | "lift" | "confirm" | "reveal";
async function command(
  who: Person | null,
  name: Command,
  assignmentId: string,
  body: unknown,
  type?: string,
) {
  const handlers = await routes.commands();
  const handler = {
    restrict: handlers.POST_RESTRICT,
    lift: handlers.POST_LIFT,
    confirm: handlers.POST_CONFIRM,
    reveal: handlers.POST_REVEAL,
  }[name];
  return handler(
    request(
      who,
      "POST",
      `/api/admin/workers/${assignmentId}/${name}`,
      body,
      type,
    ),
    params(assignmentId),
  );
}

describe.skipIf(!required && ![url, database, anon, service].some(Boolean))(
  "AL-2678 WP5 part 2-r2b1: the worker's record through its routes with real tokens (T3) and a restriction at once on every surface (T4)",
  () => {
    let db: pg.Client;
    const parties = async () =>
      (
        await db.query(
          "select id, security_level, security_level_source, public_alias, do_not_publish from public.parties where tenant_id = any($1::uuid[]) order by id",
          [[TA, TB]],
        )
      ).rows;
    const reveals = async (party: string) =>
      (
        await db.query(
          "select details from public.audit_logs where action = 'worker_identity_revealed' and resource_id = $1",
          [party],
        )
      ).rows as { details: Record<string, unknown> }[];

    beforeAll(async () => {
      db = await provisionWorkerRecordStack();
    }, 900_000);

    afterAll(() => cleanupWorkerRecordStack());

    afterEach(() => {
      absent(seen);
      seen.length = 0;
    });

    it("T3 an administrator reads the directory and the count, confirms U (Q12: badge, filter and count clear together), restricts K with an alias, lifts K, and reveals K with exactly one audit row; a second confirm of U is 409 LEVEL_CHANGED", async () => {
      const who = as("A");
      const before = await directory(who);
      expect(Object.keys(before)).toEqual(
        expect.arrayContaining([id.wU, id.wK, id.wV, id.wR, id.wC]),
      );
      expect(Object.keys(before)).not.toContain(id.wZ);
      expect(before[id.wU!]).toMatchObject({
        securityLevelSource: "unreviewed_default",
        hasLegalIdentity: false,
      });
      expect(before[id.wK!]).toMatchObject({ hasLegalIdentity: true });
      expect(await count(who)).toBe(1);
      const k = await answer(await record(who, id.wK!), 200);
      expect(k.worker).toMatchObject({
        assignmentId: id.wK,
        partyId: id.pK,
        displayName: "Worker Kestrel",
      });

      const confirmed = await answer(
        await command(who, "confirm", id.wU!, {
          level: "standard",
          reason: "Reviewed with the field director",
        }),
        200,
      );
      expect(confirmed.worker).toMatchObject({
        securityLevel: "standard",
        securityLevelSource: "manual",
      });
      expect(await count(who)).toBe(0);
      expect((await directory(who))[id.wU!]).toMatchObject({
        securityLevelSource: "manual",
      });
      expect(
        await answer(
          await command(who, "confirm", id.wU!, {
            level: "standard",
            reason: "Again",
          }),
          409,
        ),
      ).toMatchObject({
        error: "This worker's level has changed. Reload to see it.",
        code: "LEVEL_CHANGED",
      });

      const restricted = await answer(
        await command(who, "restrict", id.wK!, {
          level: "restricted",
          alias: "Heron",
          reason: "Field security",
        }),
        200,
      );
      expect(restricted.worker).toMatchObject({
        securityLevel: "restricted",
        publicAlias: "Heron",
      });
      const lifted = await answer(
        await command(who, "lift", id.wK!, {
          level: "standard",
          reason: "Back home",
        }),
        200,
      );
      expect(lifted.worker).toMatchObject({
        securityLevel: "standard",
        publicAlias: "Heron",
      });

      const keptAlias = await answer(
        await command(who, "restrict", id.wV!, {
          doNotPublish: true,
          reason: "Hold publishing",
        }),
        200,
      );
      expect(keptAlias.worker).toMatchObject({
        publicAlias: "Birch",
        doNotPublish: true,
        securityLevel: "restricted",
      });

      expect(await reveals(id.pK!)).toEqual([]);
      const revealed = await answer(
        await command(who, "reveal", id.wK!, { reason: "Visa paperwork" }),
        200,
      );
      expect(revealed).toEqual({
        legalName: "Legal Kestrel",
        realCountry: "Country Kestrel",
        preciseLocation: "Place Kestrel",
      });
      const audit = await reveals(id.pK!);
      expect(audit).toEqual([
        { details: { reason: "Visa paperwork", assignment_id: id.mA } },
      ]);
      seen.push(confirmed, restricted, lifted, keptAlias, k);
    });

    it("T3 plain staff read both pages with hasLegalIdentity null and are refused every command with 403 NOT_PERMITTED and the fixed text; nothing changes", async () => {
      const who = as("P");
      const rows = await directory(who);
      for (const row of Object.values(rows))
        expect(row.hasLegalIdentity).toBeNull();
      const k = await answer(await record(who, id.wK!), 200);
      expect((k.worker as Record<string, unknown>).hasLegalIdentity).toBeNull();
      expect(typeof (await count(who))).toBe("number");
      const state = await parties();
      const revealedBefore = (await reveals(id.pK!)).length;
      for (const [name, body] of [
        ["restrict", { level: "high_risk", alias: "Owl", reason: "x" }],
        ["lift", { clearDoNotPublish: true, reason: "x" }],
        ["confirm", { level: "standard", reason: "x" }],
        ["reveal", { reason: "x" }],
      ] as const) {
        const refused = await answer(
          await command(who, name, id.wK!, body),
          403,
        );
        expect(refused, name).toMatchObject({
          error: NOT_PERMITTED,
          code: "NOT_PERMITTED",
        });
        seen.push(refused);
      }
      expect(await parties()).toEqual(state);
      expect(await reveals(id.pK!)).toHaveLength(revealedBefore);
      seen.push(rows, k);
    });

    it("T3 another organization's administrator gets 404 for the organization's worker, on the record and on a command, and changes nothing; a person with staff rows in both reads each organization's workers under its own selection only", async () => {
      const who = as("B");
      const state = await parties();
      expect(Object.keys(await directory(who))).toEqual([id.wZ]);
      for (const response of [
        await record(who, id.wK!),
        await command(who, "restrict", id.wK!, {
          level: "high_risk",
          alias: "Owl",
          reason: "x",
        }),
        await command(who, "reveal", id.wK!, { reason: "x" }),
      ])
        expect(await answer(response, 404)).toMatchObject({
          error: "Worker not found.",
          code: "NOT_FOUND",
        });
      expect(await parties()).toEqual(state);
      as("DSA");
      const inA = Object.keys(await directory("DS"));
      as("DSB");
      const inB = Object.keys(await directory("DS"));
      expect(inA).toEqual(expect.arrayContaining([id.wU, id.wK, id.wV]));
      expect(inA).not.toContain(id.wZ);
      expect(inB).toEqual([id.wZ]);
    });

    it("T3 every refusal the routes can reach answers its status, fixed text and code with no-store, withOperation's own 401 and 403 included", async () => {
      s.auth = { isAuthenticated: false, memberships: [] };
      for (const response of [
        await record(null, id.wK!),
        await command(null, "reveal", id.wK!, { reason: "x" }),
      ]) {
        const refused = await answer(response, 401);
        expect(refused).toEqual({
          error: "Unauthorized",
          requestId: expect.any(String),
        });
        seen.push(refused);
      }
      as("D");
      const staffOnly = await answer(await record("D", id.wK!), 403);
      expect(staffOnly.error).toBe("Forbidden: requires a staff membership");
      expect(staffOnly.code).toBeUndefined();
      const who = as("A");
      const cases: [Command, string, unknown, number, string, string?][] = [
        ["reveal", "not-a-uuid", { reason: "x" }, 404, "NOT_FOUND"],
        ["reveal", randomUUID(), { reason: "x" }, 404, "NOT_FOUND"],
        ["reveal", id.wU!, { reason: "x" }, 404, "NO_IDENTITY"],
        [
          "restrict",
          id.wK!,
          { level: "high_risk", reason: "  " },
          400,
          "REASON_REQUIRED",
        ],
        [
          "restrict",
          id.wK!,
          { level: "high_risk", reason: "\u200b\u2060" },
          400,
          "REASON_REQUIRED",
        ],
        ["restrict", id.wK!, { reason: "x" }, 400, "NOTHING_TO_CHANGE"],
        [
          "lift",
          id.wK!,
          { level: "high_risk", reason: "x" },
          409,
          "LEVEL_CHANGED",
        ],
        [
          "restrict",
          id.wV!,
          { level: "sensitive", reason: "x" },
          409,
          "LEVEL_CHANGED",
        ],
        [
          "restrict",
          id.wU!,
          { level: "restricted", reason: "x" },
          400,
          "ALIAS_REQUIRED",
        ],
        [
          "restrict",
          id.wK!,
          { level: "restricted", alias: "legal kestrel", reason: "x" },
          400,
          "ALIAS_IS_LEGAL_NAME",
        ],
        [
          "restrict",
          id.wK!,
          { level: "high_risk", alias: "Owl", reason: "x", tenantId: TB },
          400,
          "INVALID_INPUT",
        ],
        ["reveal", id.wK!, "x", 415, "INVALID_INPUT", "text/plain"],
      ];
      const state = await parties();
      for (const [name, target, body, status, code, type] of cases) {
        const refused = await answer(
          await command(who, name, target, body, type),
          status,
        );
        expect(refused, `${name} ${code}`).toEqual({
          error: REFUSAL_TEXT[code],
          code,
          requestId: expect.any(String),
        });
        seen.push(refused);
      }
      expect(await parties()).toEqual(state);
      expect(await reveals(id.pU!)).toEqual([]);
    });

    it("T4 a restriction through the route holds at once on every surface r1, r2a and r2s cover: the donor portal, the feed, comments, GET /api/donations, GraphQL, a stored receipt rendered again, and the colleague's Partners; none shows the legal identity, the profile name or the Party name", async () => {
      const forbidden = ["Profile Rowan", "Party Rowan", "Donor Rowan"];
      as("A");
      const restricted = await answer(
        await command("A", "restrict", id.wR!, {
          level: "restricted",
          alias: "Wren",
          reason: "Field security",
        }),
        200,
      );
      expect(restricted.worker).toMatchObject({
        securityLevel: "restricted",
        publicAlias: "Wren",
      });

      as("D");
      const portal = (await (
        await getDonorPortal(request("D", "GET", "/api/donor-portal"))
      ).json()) as Record<string, unknown>;
      expect(JSON.stringify(portal)).toContain("Wren");
      absent(portal, forbidden);

      const feed = await getFeed(
        request("D", "GET", `/api/posts?missionaryId=${user.R}`),
      );
      const feedBody = (await feed.json()) as {
        posts?: Record<string, unknown>[];
      };
      expect(feed.status, JSON.stringify(feedBody)).toBe(200);
      const post = (feedBody.posts ?? []).find((p) => p.id === id.postR);
      expect(post && postAuthorName(post as never)).toBe("Wren");
      absent(feedBody, forbidden);

      const comments = await getComments(
        request("D", "GET", `/api/posts/${id.postR}/comments`),
        { params: Promise.resolve({ postId: id.postR! }) },
      );
      const commentsBody = (await comments.json()) as {
        comments?: {
          user_id: string;
          user: { first_name: string; avatar_url: string | null };
        }[];
      };
      expect(comments.status, JSON.stringify(commentsBody)).toBe(200);
      expect(
        (commentsBody.comments ?? []).find((c) => c.user_id === user.R)?.user,
      ).toMatchObject({ first_name: "Wren", avatar_url: null });
      absent(commentsBody, forbidden);

      const donations = await getDonations(
        request("D", "GET", "/api/donations"),
      );
      const donationsBody = (await donations.json()) as {
        donations?: {
          id: string;
          missionary: { worker_public_name: string | null };
        }[];
      };
      expect(donations.status, JSON.stringify(donationsBody)).toBe(200);
      expect(
        (donationsBody.donations ?? []).find((d) => d.id === id.gD)?.missionary
          .worker_public_name,
      ).toBe("Wren");
      absent(donationsBody, forbidden);

      const graph = (await (
        await createGraphQLHandler().POST(
          new Request("http://localhost/api/graphql", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              query:
                "{ myDonations(limit: 10) { id missionary { id publicName } } }",
            }),
          }),
        )
      ).json()) as {
        data?: {
          myDonations: { id: string; missionary: { publicName: string } }[];
        };
        errors?: unknown;
      };
      expect(graph.errors, JSON.stringify(graph.errors)).toBeUndefined();
      expect(
        graph.data!.myDonations.find((d) => d.id === id.gD)?.missionary
          .publicName,
      ).toBe("Wren");
      absent(graph, forbidden);

      const html: string[] = [];
      await renderContributionReceiptSnapshotPdf({
        supabaseAdmin: createClient(url!, service!, {
          auth: { persistSession: false, autoRefreshToken: false },
        }) as never,
        tenantId: TA,
        snapshotId: id.snap!,
        docraptorClient: {
          async renderSync(input: { html: string }) {
            html.push(input.html);
            return {
              kind: "sync",
              pdf: new Uint8Array([0x25, 0x50, 0x44, 0x46]),
              contentType: "application/pdf",
              request: {},
            };
          },
        } as unknown as DocRaptorClient,
      });
      expect(html).toHaveLength(1);
      expect(html[0]).toContain("Wren");
      absent(html, forbidden);

      as("C");
      const partnersBody = (await (
        await partners.GET(request("C", "GET", "/api/missionary/donors"))
      ).json()) as { donors?: Record<string, unknown>[] };
      expect(
        (partnersBody.donors ?? []).find((d) => d.id === id.dR),
      ).toMatchObject({ name: "Anonymous partner", is_anonymous: true });
      absent(partnersBody, forbidden);
    });

    it("T4b (review fix) an update whose alias is blank or invisible-only keeps the stored alias, so the public name stays the alias across that update, an audited reveal and a lift, and the profile name is never shown", async () => {
      await db.query(
        "update public.parties set security_level = 'restricted', security_level_source = 'manual', public_alias = 'Wren', do_not_publish = false where id = $1",
        [id.pR],
      );
      const forbidden = ["Profile Rowan", "Party Rowan", "Donor Rowan"];
      const publicName = async () => {
        as("D");
        const donations = (await (
          await getDonations(request("D", "GET", "/api/donations"))
        ).json()) as {
          donations?: {
            id: string;
            missionary: { worker_public_name: string | null };
          }[];
        };
        const feed = (await (
          await getFeed(
            request("D", "GET", `/api/posts?missionaryId=${user.R}`),
          )
        ).json()) as { posts?: Record<string, unknown>[] };
        absent([donations, feed], forbidden);
        const post = (feed.posts ?? []).find((p) => p.id === id.postR);
        return [
          (donations.donations ?? []).find((d) => d.id === id.gD)?.missionary
            .worker_public_name,
          post && postAuthorName(post as never),
        ];
      };
      as("A");
      const lowered = await answer(
        await command("A", "lift", id.wR!, {
          level: "standard",
          reason: "Back home",
        }),
        200,
      );
      expect(lowered.worker).toMatchObject({
        securityLevel: "standard",
        publicAlias: "Wren",
      });
      expect(await publicName()).toEqual(["Wren", "Wren"]);

      as("A");
      const updated = await answer(
        await command("A", "restrict", id.wR!, {
          doNotPublish: true,
          alias: "\u200b\u2060 \u00a0\ufeff",
          reason: "Hold publishing",
        }),
        200,
      );
      expect(updated.worker).toMatchObject({
        securityLevel: "standard",
        publicAlias: "Wren",
        doNotPublish: true,
      });
      expect(await publicName()).toEqual(["Wren", "Wren"]);

      as("A");
      const disclosed = await answer(
        await command("A", "reveal", id.wR!, { reason: "Visa paperwork" }),
        200,
      );
      expect(disclosed.legalName).toBe("Legal Rowan");
      const afterReveal = await answer(await record("A", id.wR!), 200);
      expect(afterReveal.worker).toMatchObject({ publicAlias: "Wren" });

      const cleared = await answer(
        await command("A", "lift", id.wR!, {
          clearDoNotPublish: true,
          reason: "Publishing allowed",
        }),
        200,
      );
      expect(cleared.worker).toMatchObject({
        publicAlias: "Wren",
        doNotPublish: false,
      });
      expect(await publicName()).toEqual(["Wren", "Wren"]);
      seen.push(lowered, updated, afterReveal, cleared);
    });

    const restrictRpc = (
      party: string,
      level: string | null,
      alias: string,
      doNotPublish: boolean | null,
      reason = "last round",
    ) =>
      rpc("restrict_worker_publication", {
        p_tenant_id: TA,
        p_party_id: party,
        p_security_level: level,
        p_public_alias: alias,
        p_do_not_publish: doNotPublish,
        p_reason: reason,
      });
    const liftRpc = (party: string, level: string | null, clear: boolean) =>
      rpc("lift_worker_restriction", {
        p_tenant_id: TA,
        p_party_id: party,
        p_security_level: level,
        p_clear_do_not_publish: clear,
        p_reason: "reset",
      });
    const partyRow = async (party: string) =>
      (
        await db.query(
          "select security_level, public_alias, do_not_publish from public.parties where id = $1",
          [party],
        )
      ).rows[0];

    it("A1 (r2b1 last round) (a) an administrator calling restrict_worker_publication through PostgREST, with no route between, with a level and an alias the database reduces to nothing: the level rises and the stored alias stays", async () => {
      for (const alias of BLANK_ALIASES) {
        const label = codePoints(alias);
        const raised = await restrictRpc(id.pS!, "sensitive", alias, null);
        expect(raised.status, `${label}: ${JSON.stringify(raised.body)}`).toBe(
          200,
        );
        expect(await partyRow(id.pS!), label).toEqual({
          security_level: "sensitive",
          public_alias: "Ash",
          do_not_publish: false,
        });
        const lowered = await liftRpc(id.pS!, "standard", false);
        expect(lowered.status, JSON.stringify(lowered.body)).toBe(200);
      }
    });

    it("A1 (b) through PostgREST with only such an alias: 400, 22023 Nothing to change, and the stored alias stays", async () => {
      for (const alias of BLANK_ALIASES) {
        const label = codePoints(alias);
        const nothing = await restrictRpc(id.pN!, null, alias, null);
        expect(
          {
            status: nothing.status,
            code: nothing.body?.code,
            message: nothing.body?.message,
          },
          label,
        ).toEqual({ status: 400, code: "22023", message: "Nothing to change" });
        expect(await partyRow(id.pN!), label).toEqual({
          security_level: "standard",
          public_alias: "Ash",
          do_not_publish: false,
        });
      }
    });

    it("A1 (c) through PostgREST with such an alias and do-not-publish: a restricted worker keeps its stored alias, no 23514", async () => {
      for (const alias of BLANK_ALIASES) {
        const label = codePoints(alias);
        const kept = await restrictRpc(id.pX!, null, alias, true);
        expect(kept.status, `${label}: ${JSON.stringify(kept.body)}`).toBe(200);
        expect(await partyRow(id.pX!), label).toEqual({
          security_level: "restricted",
          public_alias: "Elm",
          do_not_publish: true,
        });
        const cleared = await liftRpc(id.pX!, null, true);
        expect(cleared.status, JSON.stringify(cleared.body)).toBe(200);
      }
    });

    it("A1 (d) through PostgREST a real alias between invisible characters is stored normalized", async () => {
      const real = await restrictRpc(id.pY!, null, REAL_ALIAS, null);
      expect(real.status, JSON.stringify(real.body)).toBe(200);
      expect(await partyRow(id.pY!)).toEqual({
        security_level: "standard",
        public_alias: "Oak Two",
        do_not_publish: false,
      });
    });

    it("A1 (e) through PostgREST the audit row of each case (a) records no alias change", async () => {
      for (const alias of BLANK_ALIASES) {
        const raised = await restrictRpc(
          id.pE!,
          "sensitive",
          alias,
          null,
          "audit (e)",
        );
        expect(raised.status, JSON.stringify(raised.body)).toBe(200);
        const lowered = await liftRpc(id.pE!, "standard", false);
        expect(lowered.status, JSON.stringify(lowered.body)).toBe(200);
      }
      expect(
        (
          await db.query(
            "select details->'alias_changed' as changed from public.audit_logs where resource_id = $1 and action = 'worker_publication_restricted' and details->>'reason' = 'audit (e)' order by created_at, id",
            [id.pE],
          )
        ).rows.map((r) => r.changed as boolean),
      ).toEqual(BLANK_ALIASES.map(() => false));
    });

    it("B1 (bot round): worker_records, as granted, accepts the directory's ordered and ranged pages through PostgREST; in pages of two it gives the organization's workers, each once, as one unpaged read does", async () => {
      const client = createClient(url!, anon!, {
        auth: { persistSession: false, autoRefreshToken: false },
        global: {
          headers: {
            Authorization: `Bearer ${token.A}`,
            "x-asym-tenant": TA,
            "x-asym-assignment": id.mA!,
          },
        },
      });
      const ranges: [number, number][] = [];
      const paged = {
        rpc: (fn: string, args: Record<string, unknown>) => {
          const query = client.rpc(fn, args);
          const range = query.range.bind(query);
          return Object.assign(query, {
            range: (from: number, to: number) => {
              ranges.push([from, to]);
              return range(from, to);
            },
          });
        },
      };
      const inPages = await readWorkerRows(rpcClient(paged), null, 2);
      const whole = await readWorkerRows(rpcClient(client), null);
      if (!inPages.ok || !whole.ok)
        throw new Error(JSON.stringify({ inPages, whole }));
      const ids = inPages.rows.map((row) => row.assignment_id);
      expect(ranges[0]).toEqual([0, 1]);
      expect(ranges.length).toBeGreaterThanOrEqual(3);
      expect(new Set(ids).size).toBe(ids.length);
      expect(ids).toEqual(whole.rows.map((row) => row.assignment_id));
      expect([...ids].sort()).toEqual(
        [id.wU, id.wK, id.wV, id.wR, id.wC].sort(),
      );
    });
  },
);
