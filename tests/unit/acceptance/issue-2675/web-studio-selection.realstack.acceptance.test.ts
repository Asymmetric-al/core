/**
 * AL-2675 real-stack acceptance (WP2b, first release, slice C; plan 5.2,
 * "One stated exception: Web Studio"): the Web Studio tenant cookie only
 * narrows. What it names is proposed to the principal resolver, which reads
 * the caller's live rows through `public.current_user_assignments()` on the
 * caller's own token on every request. Here that function runs on the real
 * catalog, as PostgREST runs it, under the same code Payload's strategy, the
 * admin proxy and the Web Studio layout use.
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
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  ADMIN_URL,
  IN_MIGRATE_JOB,
  asRole,
  fixtureIds,
  fixtureSql,
} from "./harness";
import {
  readActiveAssignments,
  resolveActiveAssignment,
} from "../../../../packages/auth/principal/assignment";
import {
  decideWebStudioAccess,
  readWebStudioCookie,
  signWebStudioSelection,
  webStudioResolveInput,
  type WebStudioCookieState,
} from "../../../../packages/auth/web-studio";

import type { AssignmentReader } from "../../../../packages/auth/principal/types";

const SECRET = "realstack-web-studio-cookie-secret";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "the migrate job sets TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

describe.skipIf(!ADMIN_URL)(
  "AL-2675 the Web Studio tenant cookie against live memberships (real stack)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    const id = fixtureIds();
    // UWS: development staff in TA (wsA) and finance staff in TB (wsB), and a
    // donor in TB (wsDon). UB, from the shared fixture, is finance staff in TB.
    for (const key of ["UWS", "wsA", "wsB", "wsDon"]) id[key] = randomUUID();
    const as = asRole(db, id);

    beforeAll(() => db.connect());
    afterAll(() => db.end());

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

    async function cookie(tenant: string, row: string, secret = SECRET) {
      return readWebStudioCookie(
        await signWebStudioSelection(
          { tenantId: id[tenant]!, assignmentId: id[row]! },
          secret,
        ),
        SECRET,
      );
    }

    /** What Payload's strategy resolves for this cookie. */
    async function resolve(state: WebStudioCookieState) {
      const input = webStudioResolveInput(state);
      if (!input.ok) return "unusable";
      const { ok: _ok, ...narrowing } = input;
      const result = await resolveActiveAssignment(
        { ...narrowing, userId: id.UWS! },
        reader,
      );
      return result.ok
        ? Object.keys(id).find((k) => id[k] === result.assignment.assignmentId)
        : result.reason;
    }

    /** What the admin proxy and the Web Studio layout decide for this cookie. */
    async function decide(state: WebStudioCookieState) {
      const read = await readActiveAssignments(id.UWS!, reader);
      if (!read.ok) throw new Error("rows unreadable");
      const decision = decideWebStudioAccess({
        assignments: read.assignments,
        cookie: state,
      });
      return decision.kind === "allow"
        ? Object.keys(id).find(
            (k) => id[k] === decision.assignment.assignmentId,
          )
        : decision.kind;
    }

    it("acts in the tenant the cookie selects, and in neither without a choice", () =>
      tx(async () => {
        expect(await resolve(await cookie("TA", "wsA"))).toBe("wsA");
        expect(await resolve(await cookie("TB", "wsB"))).toBe("wsB");
        expect(await resolve({ kind: "absent" })).toBe("ambiguous");
        expect(await decide({ kind: "absent" })).toBe("choose");
        expect(await decide(await cookie("TB", "wsB"))).toBe("wsB");
      }));

    it("denies the revoked row at the next resolution, and falls back to nothing", () =>
      tx(async () => {
        const selected = await cookie("TB", "wsB");
        expect(await resolve(selected)).toBe("wsB");

        await db.query(
          "update authz.memberships set is_active = false, revoked_at = now() where id = $1",
          [id.wsB],
        );

        expect(await resolve(selected)).toBe("not_owned_or_inactive");
        // The person still holds wsA; the stale cookie selects nothing, and
        // they choose again.
        expect(await decide(selected)).toBe("choose");

        await db.query(
          "update authz.memberships set is_active = false, revoked_at = now() where id = $1",
          [id.wsA],
        );
        expect(await decide(selected)).toBe("refuse");
        expect(await decide({ kind: "absent" })).toBe("refuse");
      }));

    it("selects nothing with a cookie naming another person's row, the person's donor row, the wrong tenant, or another key", () =>
      tx(async () => {
        // Correctly signed, so only the live rows can refuse them.
        expect(await resolve(await cookie("TB", "mB"))).toBe(
          "not_owned_or_inactive",
        );
        expect(await resolve(await cookie("TB", "wsDon"))).toBe(
          "role_class_mismatch",
        );
        expect(await resolve(await cookie("TB", "wsA"))).toBe(
          "tenant_mismatch",
        );
        expect(await resolve(await cookie("TB", "wsB", "another-key"))).toBe(
          "unusable",
        );
        for (const state of [
          await cookie("TB", "mB"),
          await cookie("TB", "wsDon"),
          await cookie("TB", "wsA"),
          await cookie("TB", "wsB", "another-key"),
        ]) {
          expect(await decide(state)).toBe("choose");
        }
      }));
  },
);
