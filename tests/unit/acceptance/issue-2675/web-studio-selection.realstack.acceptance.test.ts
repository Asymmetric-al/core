/**
 * AL-2675 real-stack acceptance (WP2b, first release, slice C; plan 5.2,
 * "One stated exception: Web Studio"): the Web Studio tenant cookie only
 * narrows. What it names is proposed to the principal resolver, which reads
 * the caller's live rows through `public.current_user_assignments()` on the
 * caller's own token on every request. Here that function runs on the real
 * catalog, as PostgREST runs it, under Payload's strategy itself
 * (`createSupabaseAuthStrategy`, its Supabase client a double that executes
 * the function as the person) and under the decision the admin proxy and
 * the Web Studio layout share (council C8).
 *
 * - A person with staff rows in two tenants acts in the one the cookie
 *   selects, and in neither without a choice.
 * - Revoking the selected row denies Web Studio at the next resolution, and
 *   nothing falls back to the row that is left.
 * - A cookie naming another person's row, the person's own donor row, a row
 *   in another tenant than the one it names, or signed with another key,
 *   selects nothing.
 *
 * Runs against TENANT_GUARD_IT_ADMIN_DATABASE_URL (see ./harness.ts): skips
 * without it, except in CI's `migrate` job, where it fails. Every check runs
 * in one transaction that is always rolled back, over fixture rows with fresh
 * ids, so it holds no state another run could see.
 */
import { randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import {
  ADMIN_URL,
  IN_MIGRATE_JOB,
  asRole,
  fixtureIds,
  fixtureSql,
} from "./harness";
import { createSupabaseAuthStrategy } from "../../../../apps/admin/src/cms/auth/supabase-strategy";
import { readWebStudioRefusal } from "../../../../apps/admin/src/cms/auth/web-studio-refusal";
import { readActiveAssignments } from "../../../../packages/auth/principal/assignment";
import {
  decideWebStudioAccess,
  readWebStudioCookie,
  signWebStudioSelection,
  WEB_STUDIO_TENANT_COOKIE,
} from "../../../../packages/auth/web-studio";

import type { AssignmentReader } from "../../../../packages/auth/principal/types";

const SECRET = "realstack-web-studio-cookie-secret";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "the migrate job sets TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

describe.skipIf(!ADMIN_URL)(
  "AL-2675 the Web Studio tenant cookie against live memberships (real stack; D-18: WP6 part 2b's strategy reads no public.tenants and links the login as a principal-links row)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    const id = fixtureIds();
    // UWS: development staff in TA (wsA) and finance staff in TB (wsB), and a
    // donor in TB (wsDon). UB, from the shared fixture, is finance staff in TB.
    for (const key of ["UWS", "wsA", "wsB", "wsDon"]) id[key] = randomUUID();
    const as = asRole(db, id);

    beforeAll(async () => {
      // The strategy reads a session only where Supabase is configured.
      vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
      vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "example-anon-key");
      vi.stubEnv("E2E_AUTH_BYPASS", "");
      await db.connect();
    });
    afterAll(async () => {
      vi.unstubAllEnvs();
      await db.end();
    });

    async function tx(fn: () => Promise<void>) {
      await db.query("begin");
      try {
        await db.query(fixtureSql(id));
        const q = (k: string) => `'${id[k]}'`;
        await db.query(`insert into auth.users (id) values (${q("UWS")});
          delete from authz.memberships where user_id = ${q("UWS")};
          insert into authz.memberships (id, user_id, tenant_id, role, staff_role, is_tenant_admin, is_active) values
            (${q("wsA")}, ${q("UWS")}, ${q("TA")}, 'staff', 'development', false, true),
            (${q("wsB")}, ${q("UWS")}, ${q("TB")}, 'staff', 'finance', false, true),
            (${q("wsDon")}, ${q("UWS")}, ${q("TB")}, 'donor', null, false, true);`);
        await fn();
      } finally {
        await db.query("rollback");
      }
    }

    /** The caller's live rows, as PostgREST serves them on their own token. */
    const reader: AssignmentReader = {
      async listActiveAssignments() {
        // PostgREST serves the timestamp as JSON text; so does this read.
        const r = await as(
          "authenticated",
          { sub: "UWS" },
          "select a.*, to_json(a.updated_at) #>> '{}' as updated_at from public.current_user_assignments() a",
        );
        if (r.code) throw new Error(r.message);
        return r.rows as never;
      },
    };

    /** A signed Web Studio cookie value naming a fixture tenant and row. */
    function cookie(tenant: string, row: string, secret = SECRET) {
      return signWebStudioSelection(
        { tenantId: id[tenant]!, assignmentId: id[row]! },
        secret,
      );
    }

    const keyOf = (value: unknown) =>
      Object.keys(id).find((k) => id[k] === value) ?? String(value);

    /**
     * Payload's strategy itself. Its Supabase client is a double: the session
     * names the person and `current_user_assignments` runs on the real catalog
     * as the person. The Payload store is in memory: the login's
     * `principal-links` row is not under test here.
     */
    const strategy = createSupabaseAuthStrategy({
      createSupabaseClient: (() => ({
        auth: {
          getUser: async () => ({
            data: { user: { id: id.UWS, email: "uws@example.org" } },
          }),
        },
        rpc: async (fn: string) => {
          if (fn !== "current_user_assignments") throw new Error(fn);
          try {
            return { data: await reader.listActiveAssignments(), error: null };
          } catch (error) {
            return { data: null, error };
          }
        },
      })) as never,
      readWebStudioCookie: (value: string | null) =>
        readWebStudioCookie(value, SECRET),
    });

    const store = new Map<string, Record<string, unknown>>();
    const payload = {
      find: async (options: {
        collection: string;
        where?: Record<string, { equals?: unknown }>;
      }) => {
        const [[field, condition]] = Object.entries(options.where ?? {}) as [
          [string, { equals?: unknown }],
        ];
        return {
          docs: [...store.values()].filter(
            (doc) =>
              doc.collection === options.collection &&
              doc[field] === condition?.equals,
          ),
        };
      },
      create: async (options: { collection: string; data: object }) => {
        const doc = {
          id: store.size + 1,
          collection: options.collection,
          ...options.data,
        };
        store.set(`${options.collection}:${doc.id}`, doc);
        return doc;
      },
      update: async (options: {
        collection: string;
        id: unknown;
        data: object;
      }) => {
        const key = `${options.collection}:${options.id}`;
        const doc = { ...store.get(key), ...options.data };
        store.set(key, doc);
        return doc;
      },
    };

    /** Who Payload's strategy signs in for this cookie, or why it refuses. */
    async function signIn(value: string | null) {
      const req = { method: "GET", context: {} as Record<string, unknown> };
      const { user } = await strategy.authenticate({
        headers: new Headers({
          cookie: value ? `sb=1; ${WEB_STUDIO_TENANT_COOKIE}=${value}` : "sb=1",
        }),
        payload,
        req,
      } as never);
      return user
        ? keyOf((user as { tenantId?: string }).tenantId)
        : `refused: ${readWebStudioRefusal(req)}`;
    }

    /** What the admin proxy and the Web Studio layout decide for this cookie. */
    async function decide(value: string | null) {
      const read = await readActiveAssignments(id.UWS!, reader);
      if (!read.ok) throw new Error("rows unreadable");
      const decision = decideWebStudioAccess({
        assignments: read.assignments,
        cookie: await readWebStudioCookie(value, SECRET),
      });
      return decision.kind === "allow"
        ? Object.keys(id).find(
            (k) => id[k] === decision.assignment.assignmentId,
          )
        : decision.kind;
    }

    it("acts in the tenant the cookie selects, and in neither without a choice", () =>
      tx(async () => {
        expect(await signIn(await cookie("TA", "wsA"))).toBe("TA");
        expect(await signIn(await cookie("TB", "wsB"))).toBe("TB");
        expect(await signIn(null)).toBe("refused: no_selection");
        expect(await decide(null)).toBe("choose");
        expect(await decide(await cookie("TB", "wsB"))).toBe("wsB");
      }));

    it.each(["suspended", "closed"])(
      "refuses a selected %s tenant in the strategy and in the layout",
      (status) =>
        tx(async () => {
          const selected = await cookie("TB", "wsB");
          expect(await signIn(selected)).toBe("TB");
          await db.query("update public.tenants set status=$1 where id=$2", [
            status,
            id.TB,
          ]);
          expect(await signIn(selected)).toBe("refused: no_selection");
          expect(await decide(selected)).toBe("choose");
        }),
    );

    it("denies the revoked row at the next resolution, and falls back to nothing", () =>
      tx(async () => {
        const selected = await cookie("TB", "wsB");
        expect(await signIn(selected)).toBe("TB");

        await db.query(
          "update authz.memberships set is_active = false, revoked_at = now() where id = $1",
          [id.wsB],
        );

        expect(await signIn(selected)).toBe("refused: no_selection");
        // The person still holds wsA; the stale cookie selects nothing, and
        // they choose again.
        expect(await decide(selected)).toBe("choose");

        await db.query(
          "update authz.memberships set is_active = false, revoked_at = now() where id = $1",
          [id.wsA],
        );
        expect(await decide(selected)).toBe("refuse");
        expect(await decide(null)).toBe("refuse");
        expect(await signIn(null)).toBe("refused: no_selection");
      }));

    it("selects nothing with a cookie naming another person's row, the person's donor row, the wrong tenant, or another key", () =>
      tx(async () => {
        // Correctly signed, so only the live rows can refuse them.
        for (const value of [
          await cookie("TB", "mB"),
          await cookie("TB", "wsDon"),
          await cookie("TB", "wsA"),
          await cookie("TB", "wsB", "another-key"),
        ]) {
          expect(await signIn(value)).toBe("refused: no_selection");
        }
        for (const value of [
          await cookie("TB", "mB"),
          await cookie("TB", "wsDon"),
          await cookie("TB", "wsA"),
          await cookie("TB", "wsB", "another-key"),
        ]) {
          expect(await decide(value)).toBe("choose");
        }
      }));
  },
);
