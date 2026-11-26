import pg from "pg";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { ADMIN_URL, IN_MIGRATE_JOB, fixtureIds, fixtureSql } from "./harness";
import { createSupabaseAuthStrategy } from "../../../../apps/admin/src/cms/auth/supabase-strategy";
import {
  WEB_STUDIO_REFUSAL_HEADER,
  readWebStudioRefusal,
  webStudioRefusalAfterError,
} from "../../../../apps/admin/src/cms/auth/web-studio-refusal";
import { resolveActiveAssignment } from "../../../../packages/auth/principal/assignment";
import { createRpcAssignmentReader } from "../../../../packages/auth/principal/reader";
import {
  WEB_STUDIO_TENANT_COOKIE,
  readWebStudioCookie,
  signWebStudioSelection,
} from "../../../../packages/auth/web-studio";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "the migrate job sets TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

const SECRET = "realstack-revocation-cookie-secret";

type Outcome = {
  rows: Record<string, unknown>[];
  code: string | null;
  message: string;
};

describe.skipIf(!ADMIN_URL)(
  "AL-2675 WP2c rest: a membership revoked with revoke_membership is refused at the next request (real stack)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    let id: Record<string, string> = {};

    beforeAll(async () => {
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
      id = fixtureIds();
      await db.query("begin");
      try {
        await db.query(fixtureSql(id));
        await db.query(
          "insert into public.crm_notes (tenant_id, title, body, visibility) values ($1, 'Revocation fixture', 'A note staff of A may read', 'standard')",
          [id.TA],
        );
        await fn();
      } finally {
        await db.query("rollback");
      }
    }

    async function call(
      who: string,
      sql: string,
      headers?: Record<string, string>,
    ): Promise<Outcome> {
      await db.query("savepoint call");
      try {
        await db.query("set local role authenticated");
        await db.query(
          `select set_config('request.jwt.claims', $1, true),
                  set_config('request.jwt.claim.sub', '', true),
                  set_config('request.headers', $2, true)`,
          [
            JSON.stringify({
              sub: id[who],
              role: "authenticated",
              aal: "aal1",
            }),
            headers ? JSON.stringify(headers) : "",
          ],
        );
        const r = await db.query(sql);
        await db.query("reset role");
        await db.query(
          `select set_config('request.jwt.claims', '', true), set_config('request.headers', '', true),
                  set_config('app.current_tenant_id', '', true)`,
        );
        await db.query("release savepoint call");
        return { rows: r.rows, code: null, message: "" };
      } catch (e) {
        await db.query("rollback to savepoint call");
        const err = e as { code?: string; message?: string };
        return { rows: [], code: err.code ?? "?", message: err.message ?? "" };
      }
    }

    const readerFor = (who: string) =>
      createRpcAssignmentReader({
        rpc: async (fn: string) => {
          if (fn !== "current_user_assignments") throw new Error(fn);
          const out = await call(
            who,
            "select a.*, to_json(a.updated_at) #>> '{}' as updated_at from public.current_user_assignments() a",
          );
          return out.code
            ? { data: null, error: { code: out.code, message: out.message } }
            : { data: out.rows, error: null };
        },
      } as never);

    async function missionControl(who: string, row: string) {
      const named = await resolveActiveAssignment(
        {
          userId: id[who]!,
          roleClass: "staff",
          proposedAssignmentId: id[row]!,
          expectedTenantId: id.TA!,
        },
        readerFor(who),
      );
      const unnamed = await resolveActiveAssignment(
        { userId: id[who]!, roleClass: "staff", expectedTenantId: id.TA! },
        readerFor(who),
      );
      return [
        named.ok ? "admitted" : named.reason,
        unnamed.ok ? "admitted" : unnamed.reason,
      ];
    }

    async function notes(who: string, row: string) {
      const counts: number[] = [];
      for (const headers of [
        { "x-asym-tenant": id.TA!, "x-asym-assignment": id[row]! },
        { "x-asym-tenant": id.TA! },
        undefined,
      ]) {
        const out = await call(
          who,
          "select count(*)::int as n from public.crm_notes",
          headers,
        );
        expect(out.code, out.message).toBeNull();
        counts.push(out.rows[0]!.n as number);
      }
      return counts;
    }

    async function webStudio(who: string, row: string) {
      const strategy = createSupabaseAuthStrategy({
        createSupabaseClient: (() => ({
          auth: {
            getUser: async () => ({
              data: { user: { id: id[who], email: `${who}@example.org` } },
            }),
          },
          rpc: async (fn: string) => {
            if (fn !== "current_user_assignments") throw new Error(fn);
            try {
              return {
                data: await readerFor(who).listActiveAssignments(),
                error: null,
              };
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
      const cookie = await signWebStudioSelection(
        { tenantId: id.TA!, assignmentId: id[row]! },
        SECRET,
      );
      const req: {
        method: string;
        context: Record<string, unknown>;
        responseHeaders?: Headers;
      } = { method: "GET", context: {} };
      const { user } = await strategy.authenticate({
        headers: new Headers({
          cookie: `sb=1; ${WEB_STUDIO_TENANT_COOKIE}=${cookie}`,
        }),
        payload,
        req,
      } as never);
      if (user) return { admitted: true };
      const forbidden = Object.assign(new Error("Forbidden"), {
        name: "Forbidden",
      });
      const answer = webStudioRefusalAfterError({
        error: forbidden,
        req,
        context: req.context,
      } as never) as { status?: number; response?: unknown } | undefined;
      return {
        admitted: false,
        refusal: readWebStudioRefusal(req),
        status: answer?.status,
        header: req.responseHeaders?.get(WEB_STUDIO_REFUSAL_HEADER) ?? null,
        location: req.responseHeaders?.get("location") ?? null,
        body: answer?.response,
      };
    }

    it("an administrator revokes a staff row with revoke_membership; at the next request Mission Control, the Data API and Web Studio all refuse", () =>
      tx(async () => {
        expect(await missionControl("UDEV", "mDev")).toEqual([
          "admitted",
          "admitted",
        ]);
        expect(await notes("UDEV", "mDev")).toEqual([1, 1, 0]);
        expect(await webStudio("UDEV", "mDev")).toEqual({ admitted: true });

        const revoked = await call(
          "UADM",
          `select public.revoke_membership('${id.TA}', '${id.mDev}', 'Left the organization') as r`,
          { "x-asym-tenant": id.TA!, "x-asym-assignment": id.mAdm! },
        );
        expect([revoked.code, revoked.message]).toEqual([null, ""]);
        expect(revoked.rows[0]!.r).toMatchObject({
          changed: true,
          membership_id: id.mDev,
        });

        expect(await missionControl("UDEV", "mDev")).toEqual([
          "not_owned_or_inactive",
          "no_assignment",
        ]);
        expect(await notes("UDEV", "mDev")).toEqual([0, 0, 0]);
        expect(await webStudio("UDEV", "mDev")).toEqual({
          admitted: false,
          refusal: "no_selection",
          status: 403,
          header: "no_selection",
          location: null,
          body: expect.objectContaining({
            message: expect.stringMatching(/Choose the organization/),
          }),
        });

        expect(await notes("UFC", "mFin")).toEqual([1, 0, 0]);
        expect(await notes("UADM", "mAdm")).toEqual([1, 1, 0]);
      }));
  },
);
