import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  ADMIN_URL,
  IN_MIGRATE_JOB,
  STAFF_ROLES,
  asRole,
  counts,
  fixtureIds,
  fixtureSql,
  keepAs,
  lit,
  submitSql,
  who,
} from "./harness";

import type { Ids, Who } from "./harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)("migrate supplies its database", () =>
  expect(ADMIN_URL).toBeTruthy(),
);

const NOT_OWN = "tenant_guard: the update is not the caller's own";
const OWN_APPROVAL =
  "tenant_guard: an update is approved by a person other than its author";
const NO_AUTHORITY =
  "tenant_guard: the caller does not hold the authority this command requires";
const REASON = "A reason is required";

describe.skipIf(!ADMIN_URL)(
  "AL-2680 WP7 pull request 1: missionary updates under review (invariants 1-3, 5, 9 and 10)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    const id: Ids = fixtureIds();
    const queryAs = asRole(db, id);
    const writeAs = keepAs(db, id);

    const missionary = who(id, "UM", "mM", "TA");
    const missionaryAsReviewer = who(id, "UM", "mMS", "TA");
    const missionaryInB = who(id, "UM", "mMB", "TB");
    const secondMissionary = who(id, "UM2", "mM2", "TA");
    const reviewer = who(id, "UST", "mST", "TA");
    const admin = who(id, "US", "mS", "TA");
    const follower = who(id, "UDA", "mDA", "TA");
    const followerInB = who(id, "UDA", "mDAB", "TB");
    const nonFollower = who(id, "UD2", "mD2", "TA");
    const staffB = who(id, "UBS", "mBS", "TB");
    const staffBnamingA: Who = {
      sub: "UBS",
      headers: { "x-asym-tenant": id.TA, "x-asym-assignment": id.mBS },
    };
    const missionaryOfB = who(id, "UMBO", "mMBO", "TB");
    const missionaryOfBnamingA: Who = {
      sub: "UMBO",
      headers: { "x-asym-tenant": id.TA, "x-asym-assignment": id.mMBO },
    };
    const revokedAsMissionary = who(id, "UMR", "mMR", "TA");
    const revokedAsDonor = who(id, "UMR", "mMRD", "TA");

    beforeAll(async () => {
      await db.connect();
      await db.query("begin");
      await db.query(fixtureSql(id));
    });
    afterAll(async () => {
      await db.query("rollback");
      await db.end();
    });

    const read = (caller: Who | null, sql: string) =>
      caller
        ? queryAs("authenticated", caller as never, sql)
        : queryAs("anon", {}, sql);
    const act = (caller: Who, sql: string) =>
      writeAs("authenticated", caller as never, sql);
    const sees = async (caller: Who | null, post: string) => {
      const r = await read(
        caller,
        `select id from public.posts where id = ${lit(post)}`,
      );
      expect(r.code, r.message).toBeNull();
      return r.rows.length === 1;
    };
    const submit = async (
      caller: Who,
      tenant: string,
      title: string,
      options: { visibility?: string; publish?: boolean; post?: string } = {},
    ) => {
      const r = await act(
        caller,
        submitSql(tenant, options.post ?? null, title, options),
      );
      expect(r.code, r.message).toBeNull();
      return r.rows[0]!.id as string;
    };
    const decide = (
      caller: Who,
      command: "approve" | "reject" | "withdraw",
      post: string,
      reason?: string | null,
      tenant = id.TA,
    ) =>
      act(
        caller,
        command === "approve"
          ? `select public.approve_ministry_update(${lit(tenant)}, ${lit(post)})`
          : `select public.${command}_ministry_update(${lit(tenant)}, ${lit(post)}, ${lit(reason ?? null)})`,
      );
    const state = async (post: string) =>
      (
        await db.query(
          "select review_state, reviewed_by, reviewed_by_assignment_id, review_reason, author_user_id from public.posts where id = $1",
          [post],
        )
      ).rows[0] as Record<string, string | null>;
    const audits = async (post: string) =>
      (
        await db.query(
          "select action, user_id, details->>'assignment_id' assignment, details->>'reason' reason from public.audit_logs where tenant_id = $1 and resource_id = $2 order by action",
          [id.TA, post],
        )
      ).rows;
    const inSavepoint = async (body: () => Promise<void>) => {
      await db.query("savepoint s");
      try {
        await body();
      } finally {
        await db.query("rollback to savepoint s");
      }
    };

    it("each own-ministry command refuses (42501) staff of every sub-role, the administrator, a donor, a missionary of B naming A, a revoked missionary, anon, service_role and a target outside the caller's own ministry, and writes nothing", () =>
      inSavepoint(async () => {
        const own = await submit(missionary, id.TA, "Own update");
        const before = await counts(db, id.TA);
        const commands = [
          submitSql(id.TA, null, "Intruder"),
          submitSql(id.TA, own, "Intruder"),
          `select public.withdraw_own_ministry_update(${lit(id.TA)}, ${lit(own)})`,
        ];
        const callers: [string, Who][] = [
          ...STAFF_ROLES.map(
            (r) =>
              [`staff ${r}`, who(id, `U_${r}`, `m_${r}`, "TA")] as [
                string,
                Who,
              ],
          ),
          ["the administrator", admin],
          ["the missionary's own staff assignment", missionaryAsReviewer],
          ["a donor of A", follower],
          ["a missionary of B naming A", missionaryOfBnamingA],
          ["a missionary of B under B's header", missionaryOfB],
          ["the missionary under their B assignment", missionaryInB],
          ["a revoked missionary", revokedAsMissionary],
          ["a revoked missionary as a donor", revokedAsDonor],
        ];
        const openingPasses = new Set<Who>([
          ...callers.slice(0, STAFF_ROLES.length).map(([, caller]) => caller),
          admin,
          missionaryAsReviewer,
          follower,
          revokedAsDonor,
        ]);
        for (const [label, caller] of callers)
          for (const sql of commands) {
            const r = await act(caller, sql);
            expect(r.code, `${label}: ${sql}: ${r.message}`).toBe("42501");
            if (openingPasses.has(caller))
              expect(r.message, label).toBe(NO_AUTHORITY);
          }
        for (const role of ["anon", "service_role"])
          for (const sql of commands) {
            const r = await queryAs(role, {}, sql);
            expect(r.code, `${role}: ${sql}`).toBe("42501");
            expect(r.message).toMatch(/^permission denied for function /);
          }
        for (const sql of commands.slice(1)) {
          const r = await act(secondMissionary, sql);
          expect(r.code, sql).toBe("42501");
          expect(r.message).toBe(NOT_OWN);
        }
        expect(await counts(db, id.TA)).toEqual(before);
      }));

    it("A's missionary submits: the update is absent anonymously, from a follower's feed and to another missionary, present to its author and a reviewer; once A's reviewer approves it, present next request; each command writes one audit row naming the person and the assignment", () =>
      inSavepoint(async () => {
        const post = await submit(missionary, id.TA, "First letter");
        expect(await state(post)).toMatchObject({
          review_state: "submitted",
          author_user_id: id.UM,
        });
        for (const caller of [null, follower, nonFollower, secondMissionary])
          expect(await sees(caller, post)).toBe(false);
        expect(await sees(missionary, post)).toBe(true);
        expect(await sees(reviewer, post)).toBe(true);
        expect(await sees(revokedAsDonor, post)).toBe(false);

        const approved = await decide(reviewer, "approve", post);
        expect(approved.code, approved.message).toBeNull();
        expect(await state(post)).toMatchObject({
          review_state: "approved",
          reviewed_by: id.UST,
          reviewed_by_assignment_id: id.mST,
        });
        for (const caller of [null, follower, nonFollower, secondMissionary])
          expect(await sees(caller, post)).toBe(true);
        expect(await audits(post)).toEqual([
          {
            action: "ministry_update.approved",
            user_id: id.UST,
            assignment: id.mST,
            reason: null,
          },
          {
            action: "ministry_update.submit",
            user_id: id.UM,
            assignment: id.mM,
            reason: null,
          },
        ]);
      }));

    it("the author approving their own update under their own staff assignment, and B's reviewer with or without B's header, are refused (42501) and write nothing", () =>
      inSavepoint(async () => {
        const post = await submit(missionary, id.TA, "Self approval");
        const before = await counts(db, id.TA);
        const own = await decide(missionaryAsReviewer, "approve", post);
        expect(own.code).toBe("42501");
        expect(own.message).toBe(OWN_APPROVAL);
        for (const [caller, tenant] of [
          [staffB, id.TA],
          [staffBnamingA, id.TA],
          [staffB, id.TB],
        ] as const) {
          const r = await decide(caller, "approve", post, null, tenant);
          expect(r.code, r.message).toBe("42501");
        }
        expect(await counts(db, id.TA)).toEqual(before);
        expect((await state(post)).review_state).toBe("submitted");
      }));

    it("a signed-in donor of A reads none of B's approved public updates (served on the base) and B's donor none of A's; anon reads both", () =>
      inSavepoint(async () => {
        const inB = await submit(missionaryInB, id.TB, "Letter from B");
        expect((await decide(staffB, "approve", inB, null, id.TB)).code).toBe(
          null,
        );
        const inA = await submit(missionary, id.TA, "Letter from A");
        expect((await decide(reviewer, "approve", inA)).code).toBe(null);
        expect(await sees(follower, inB)).toBe(false);
        expect(await sees(follower, inA)).toBe(true);
        expect(await sees(followerInB, inB)).toBe(true);
        expect(await sees(followerInB, inA)).toBe(false);
        expect(await sees(null, inA)).toBe(true);
        expect(await sees(null, inB)).toBe(true);
        const all = await read(follower, "select tenant_id from public.posts");
        expect(new Set(all.rows.map((r) => r.tenant_id))).toEqual(
          new Set([id.TA]),
        );
      }));

    it("restricting a worker (alias set) or marking them do-not-publish takes their approved updates out of every feed next request and leaves them approved; lift returns them; confirming standard, raising to sensitive or changing only the alias withdraws nothing", () =>
      inSavepoint(async () => {
        const post = await submit(secondMissionary, id.TA, "Field news");
        expect((await decide(reviewer, "approve", post)).code).toBe(null);
        const feeds = [null, follower, nonFollower, missionary];
        const everyone = async () =>
          Promise.all(feeds.map((caller) => sees(caller, post)));
        expect(await everyone()).toEqual([true, true, true, true]);

        const command = (sql: string) =>
          act(admin, sql).then((r) => expect(r.code, r.message).toBeNull());
        await command(
          `select public.restrict_worker_publication(${lit(id.TA)}, ${lit(id.pM2)}, 'restricted', 'Cedar', null, 'Threat reported') as r`,
        );
        expect(await everyone()).toEqual([false, false, false, false]);
        expect(await sees(secondMissionary, post)).toBe(true);
        expect((await state(post)).review_state).toBe("approved");
        const refused = await decide(reviewer, "approve", post);
        expect(refused.code).toBe("22023");

        await command(
          `select public.lift_worker_restriction(${lit(id.TA)}, ${lit(id.pM2)}, 'standard', false, 'Threat over') as r`,
        );
        expect(await everyone()).toEqual([true, true, true, true]);

        await command(
          `select public.restrict_worker_publication(${lit(id.TA)}, ${lit(id.pM2)}, 'standard', null, true, 'Asked not to be published') as r`,
        );
        expect(await everyone()).toEqual([false, false, false, false]);
        await command(
          `select public.lift_worker_restriction(${lit(id.TA)}, ${lit(id.pM2)}, 'standard', true, 'May be published again') as r`,
        );
        expect(await everyone()).toEqual([true, true, true, true]);

        for (const sql of [
          `select public.restrict_worker_publication(${lit(id.TA)}, ${lit(id.pM2)}, 'standard', null, null, 'Reviewed with the field director') as r`,
          `select public.restrict_worker_publication(${lit(id.TA)}, ${lit(id.pM2)}, 'sensitive', null, null, 'Sensitive field') as r`,
          `select public.restrict_worker_publication(${lit(id.TA)}, ${lit(id.pM2)}, 'sensitive', 'Oak', null, 'Alias only') as r`,
        ]) {
          await command(sql);
          expect(await everyone(), sql).toEqual([true, true, true, true]);
          expect((await state(post)).review_state).toBe("approved");
        }
      }));

    it("automatic is set per missionary path by A's administrator with a reason (refused without the capability, without a reason, or for B's worker); a submit under it is approved in its own transaction and public at once; review again restores waiting", () =>
      inSavepoint(async () => {
        const policy = (caller: Who, worker: string, reason: string | null) =>
          act(
            caller,
            `select public.set_publication_policy(${lit(id.TA)}, ${lit(worker)}, 'update', 'automatic', ${lit(reason)})`,
          );
        const before = await counts(db, id.TA);
        const noCapability = await policy(reviewer, id.mA, "Trusted writer");
        expect(noCapability.code).toBe("42501");
        for (const blank of [null, "   ", "​"]) {
          const r = await policy(admin, id.mA, blank);
          expect(r.code, String(blank)).toBe("22023");
          expect(r.message).toBe(REASON);
        }
        const otherTenant = await policy(admin, id.mB, "Trusted writer");
        expect(otherTenant.code).toBe("42501");
        expect(await counts(db, id.TA)).toEqual(before);

        const set = await policy(admin, id.mA, "Trusted writer");
        expect(set.code, set.message).toBeNull();
        const audit = await db.query(
          "select user_id, details from public.audit_logs where tenant_id = $1 and action = 'publication_policy.set'",
          [id.TA],
        );
        expect(audit.rows).toEqual([
          {
            user_id: id.US,
            details: {
              assignment_id: id.mS,
              path: "update",
              mode: "automatic",
              reason: "Trusted writer",
            },
          },
        ]);
        const post = await submit(missionary, id.TA, "Straight out");
        expect(await state(post)).toMatchObject({
          review_state: "approved",
          review_reason: "automatic",
        });
        expect(await sees(null, post)).toBe(true);
        expect(await sees(follower, post)).toBe(true);

        const other = await submit(secondMissionary, id.TA, "Still waits");
        expect((await state(other)).review_state).toBe("submitted");

        const back = await act(
          admin,
          `select public.set_publication_policy(${lit(id.TA)}, ${lit(id.mA)}, 'update', 'review', 'Back to review')`,
        );
        expect(back.code, back.message).toBeNull();
        const later = await submit(missionary, id.TA, "Waits again");
        expect((await state(later)).review_state).toBe("submitted");

        const policies = async (caller: Who) =>
          (
            await read(
              caller,
              "select mode from public.publication_policies order by mode",
            )
          ).rows;
        expect(await policies(admin)).toEqual([{ mode: "review" }]);
        expect(await policies(reviewer)).toEqual([{ mode: "review" }]);
        for (const caller of [follower, missionary, staffBnamingA])
          expect(await policies(caller)).toEqual([]);
      }));

    it("M's partners-only update is refused to a non-following donor, anon, another missionary and B, served to a follower and to staff; a pending or removed follow is refused next request", () =>
      inSavepoint(async () => {
        const post = await submit(missionary, id.TA, "For partners", {
          visibility: "partners_only",
        });
        expect((await decide(reviewer, "approve", post)).code).toBe(null);
        expect(await sees(follower, post)).toBe(true);
        expect(await sees(reviewer, post)).toBe(true);
        for (const caller of [
          null,
          nonFollower,
          secondMissionary,
          followerInB,
          revokedAsDonor,
        ])
          expect(await sees(caller, post)).toBe(false);
        await db.query(
          "update public.follows set status = 'pending' where id = $1",
          [id.fA],
        );
        expect(await sees(follower, post)).toBe(false);
        await db.query(
          "update public.follows set status = 'approved' where id = $1",
          [id.fA],
        );
        expect(await sees(follower, post)).toBe(true);
        await db.query("delete from public.follows where id = $1", [id.fA]);
        expect(await sees(follower, post)).toBe(false);
      }));

    it("the author withdraws their own update without a reason; another missionary cannot; a reviewer withdraws or rejects with a reason only; nothing approves a withdrawn, rejected or draft update; an edit resubmits an approved one", () =>
      inSavepoint(async () => {
        const own = await submit(missionary, id.TA, "Mine to withdraw");
        expect((await decide(reviewer, "approve", own)).code).toBe(null);
        const withdrawn = await act(
          missionary,
          `select public.withdraw_own_ministry_update(${lit(id.TA)}, ${lit(own)})`,
        );
        expect(withdrawn.code, withdrawn.message).toBeNull();
        expect(await state(own)).toMatchObject({
          review_state: "withdrawn",
          reviewed_by: id.UM,
          reviewed_by_assignment_id: id.mM,
          review_reason: null,
        });
        expect(await sees(null, own)).toBe(false);
        expect(await sees(follower, own)).toBe(false);
        expect(await sees(missionary, own)).toBe(true);
        expect((await decide(reviewer, "approve", own)).code).toBe("22023");

        const theirs = await submit(missionary, id.TA, "A reviewer withdraws");
        expect((await decide(reviewer, "approve", theirs)).code).toBe(null);
        const other = await act(
          secondMissionary,
          `select public.withdraw_own_ministry_update(${lit(id.TA)}, ${lit(theirs)})`,
        );
        expect(other.code).toBe("42501");
        for (const blank of [null, "", "  ​ "]) {
          const r = await decide(reviewer, "withdraw", theirs, blank);
          expect(r.code, String(blank)).toBe("22023");
          expect(r.message).toBe(REASON);
        }
        const byReviewer = await decide(
          reviewer,
          "withdraw",
          theirs,
          "Names a partner church",
        );
        expect(byReviewer.code, byReviewer.message).toBeNull();
        expect(await state(theirs)).toMatchObject({
          review_state: "withdrawn",
          reviewed_by: id.UST,
          review_reason: "Names a partner church",
        });
        expect(await sees(follower, theirs)).toBe(false);
        expect((await audits(theirs)).at(-1)).toEqual({
          action: "ministry_update.withdrawn",
          user_id: id.UST,
          assignment: id.mST,
          reason: "Names a partner church",
        });

        const rejected = await submit(missionary, id.TA, "To be rejected");
        expect((await decide(reviewer, "reject", rejected, " ")).code).toBe(
          "22023",
        );
        const reject = await decide(reviewer, "reject", rejected, "Too long");
        expect(reject.code, reject.message).toBeNull();
        expect(await state(rejected)).toMatchObject({
          review_state: "rejected",
          review_reason: "Too long",
        });
        expect(await sees(missionary, rejected)).toBe(true);
        expect(await sees(follower, rejected)).toBe(false);
        expect((await decide(reviewer, "approve", rejected)).code).toBe(
          "22023",
        );

        const draft = await submit(missionary, id.TA, "Draft", {
          publish: false,
        });
        expect((await decide(reviewer, "approve", draft)).code).toBe("22023");
        expect(await sees(null, draft)).toBe(false);

        const edited = await submit(missionary, id.TA, "Approved then edited");
        expect((await decide(reviewer, "approve", edited)).code).toBe(null);
        expect(await sees(null, edited)).toBe(true);
        await submit(missionary, id.TA, "Edited text", { post: edited });
        expect((await state(edited)).review_state).toBe("submitted");
        expect(await sees(null, edited)).toBe(false);
        expect(await sees(follower, edited)).toBe(false);
      }));

    it("no signed-in caller writes posts directly (42501), so the review state moves only through the commands", () =>
      inSavepoint(async () => {
        const post = await submit(missionary, id.TA, "Direct write");
        for (const caller of [missionary, reviewer, admin])
          for (const sql of [
            `update public.posts set review_state = 'approved' where id = ${lit(post)}`,
            `insert into public.posts (tenant_id, title, content, review_state) values (${lit(id.TA)}, 'x', 'x', 'approved')`,
            `update public.publication_policies set mode = 'automatic'`,
          ]) {
            const r = await act(caller, sql);
            expect(r.code, sql).toBe("42501");
          }
        expect((await state(post)).review_state).toBe("submitted");
      }));

    it("a post on no missionary path is public only once a person other than its author approves it; one whose author is unknown is never approved", () =>
      inSavepoint(async () => {
        const inserted = await db.query(
          `insert into public.posts (tenant_id, author_user_id, title, content, status, visibility)
           values ($1, $2, 'Organization news', 'Body', 'published', 'public'),
                  ($1, null, 'Unknown author', 'Body', 'published', 'public')
           returning id, review_state`,
          [id.TA, id.UST],
        );
        const [organization, unknown] = inserted.rows as {
          id: string;
          review_state: string;
        }[];
        expect(inserted.rows.map((r) => r.review_state)).toEqual([
          "submitted",
          "submitted",
        ]);
        expect(await sees(null, organization!.id)).toBe(false);
        expect(await sees(follower, organization!.id)).toBe(false);
        const own = await decide(reviewer, "approve", organization!.id);
        expect(own.code).toBe("42501");
        expect(own.message).toBe(OWN_APPROVAL);
        expect(await sees(null, organization!.id)).toBe(false);
        const other = await decide(admin, "approve", organization!.id);
        expect(other.code, other.message).toBeNull();
        expect(await sees(null, organization!.id)).toBe(true);
        const nobody = await decide(admin, "approve", unknown!.id);
        expect(nobody.code).toBe("42501");
        expect(await sees(null, unknown!.id)).toBe(false);
      }));

    it("each atomic_* reaction takes its post's tenant; a reaction keyed to another tenant's post fails; the four tables force row security and a reaction is read only where its post is", () =>
      inSavepoint(async () => {
        const post = await submit(missionary, id.TA, "Reactions");
        expect((await decide(reviewer, "approve", post)).code).toBe(null);
        const pending = await submit(missionary, id.TA, "Pending reactions");
        for (const target of [post, pending])
          for (const sql of [
            `select public.atomic_like_post(${lit(target)}, ${lit(id.UDA)}, ${lit(id.TA)})`,
            `select public.atomic_pray_for_post(${lit(target)}, ${lit(id.UDA)}, ${lit(id.TA)})`,
            `select public.atomic_fire_post(${lit(target)}, ${lit(id.UDA)}, ${lit(id.TA)})`,
            `select public.atomic_add_post_comment(${lit(target)}, ${lit(id.UDA)}, ${lit(id.TA)}, 'Praying')`,
          ]) {
            await db.query(sql);
          }
        const tables = [
          "post_likes",
          "post_prayers",
          "post_fires",
          "post_comments",
        ];
        for (const table of tables) {
          const rows = await db.query(
            `select tenant_id from public.${table} where post_id = any($1::uuid[])`,
            [[post, pending]],
          );
          expect(rows.rows, table).toEqual([
            { tenant_id: id.TA },
            { tenant_id: id.TA },
          ]);
          await db.query("savepoint cross_tenant");
          const cross = await db
            .query(
              `insert into public.${table} (tenant_id, post_id, user_id${table === "post_comments" ? ", content" : ""}) values ($1, $2, $3${table === "post_comments" ? ", 'x'" : ""})`,
              [id.TB, post, id.UDC],
            )
            .then(
              () => "inserted",
              (e: { code?: string }) => e.code,
            );
          await db.query("rollback to savepoint cross_tenant");
          expect(cross, table).toBe("23503");
          const forced = await db.query(
            "select relforcerowsecurity from pg_class where oid = $1::regclass",
            [`public.${table}`],
          );
          expect(forced.rows[0].relforcerowsecurity, table).toBe(true);
          const seen = async (caller: Who | null) =>
            (
              await read(
                caller,
                `select post_id from public.${table} where post_id = any(array[${lit(post)}, ${lit(pending)}]::uuid[])`,
              )
            ).rows.map((r) => r.post_id);
          expect(await seen(null), table).toEqual([post]);
          expect(await seen(follower), table).toEqual([post]);
          expect(await seen(followerInB), table).toEqual([]);
          expect((await seen(missionary)).sort(), table).toEqual(
            [post, pending].sort(),
          );
        }
      }));
  },
);
