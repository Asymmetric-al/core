import { randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  ADMIN_URL,
  IN_MIGRATE_JOB,
  STAFF_ROLES,
  approveSql,
  asRole,
  counts,
  fixtureIds,
  fixtureSql,
  keepAs,
  lit,
  rejectSql,
  submitSql,
  versionOf,
  who,
  withdrawOwnSql,
  withdrawSql,
} from "./harness";

import type { Ids, Who } from "./harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)("migrate supplies its database", () =>
  expect(ADMIN_URL).toBeTruthy(),
);

const NOT_LINKED =
  "tenant_guard: the caller's worker record is not linked to their sign-in";
const NO_MINISTRY = "tenant_guard: the caller has no ministry in this tenant";
const CHANGED = "The update changed since it was read";
const OWN_WITHDRAW = "Only a submitted or approved update can be withdrawn";

const BASE_COLUMNS = [
  "comment_count",
  "content",
  "created_at",
  "fires_count",
  "id",
  "image_url",
  "like_count",
  "media",
  "ministry_assignment_id",
  "missionary_id",
  "post_type",
  "prayer_count",
  "status",
  "tenant_id",
  "title",
  "type",
  "updated_at",
  "visibility",
];
const REVIEW_COLUMNS = [
  "author_user_id",
  "content_version",
  "review_reason",
  "review_state",
  "reviewed_at",
  "reviewed_by",
  "reviewed_by_assignment_id",
  "worker_withheld",
];
const SERVICE_UPDATES = [
  "comment_count",
  "content",
  "fires_count",
  "like_count",
  "media",
  "post_type",
  "prayer_count",
  "status",
  "title",
  "updated_at",
  "visibility",
];

describe.skipIf(!ADMIN_URL)(
  "AL-2680 WP7 pull request 1, fix round: what the review's fixes close",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    const id: Ids = fixtureIds();
    const queryAs = asRole(db, id);
    const writeAs = keepAs(db, id);

    const missionary = who(id, "UM", "mM", "TA");
    const secondMissionary = who(id, "UM2", "mM2", "TA");
    const unlinked = who(id, "UMN", "mMN", "TA");
    const noWorker = who(id, "UML", "mML", "TA");
    const reviewer = who(id, "UST", "mST", "TA");
    const admin = who(id, "US", "mS", "TA");
    const follower = who(id, "UDA", "mDA", "TA");
    const nonFollower = who(id, "UD2", "mD2", "TA");
    const staffB = who(id, "UBS", "mBS", "TB");

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
      title: string,
      options: { visibility?: string; publish?: boolean; post?: string } = {},
    ) => {
      const r = await act(
        caller,
        submitSql(id.TA, options.post ?? null, title, options),
      );
      expect(r.code, r.message).toBeNull();
      return r.rows[0]!.id as string;
    };
    const approve = async (post: string) => {
      const r = await act(
        reviewer,
        approveSql(id.TA, post, await versionOf(db, post)),
      );
      expect(r.code, r.message).toBeNull();
    };
    const command = (sql: string) =>
      act(admin, sql).then((r) => expect(r.code, r.message).toBeNull());
    const restrict = (
      party: string,
      level: string,
      alias: string | null,
      doNotPublish: boolean | null,
    ) =>
      command(
        `select public.restrict_worker_publication(${lit(id.TA)}, ${lit(party)}, ${lit(level)}, ${lit(alias)}, ${doNotPublish === null ? "null" : doNotPublish}, 'Threat reported') as r`,
      );
    const automatic = () =>
      command(
        `select public.set_publication_policy(${lit(id.TA)}, ${lit(id.mA)}, 'update', 'automatic', 'Trusted writer')`,
      );
    const state = async (post: string) =>
      (
        await db.query(
          "select title, review_state, reviewed_by, review_reason, author_user_id, worker_withheld, ministry_assignment_id from public.posts where id = $1",
          [post],
        )
      ).rows[0] as Record<string, unknown>;
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

    it("S1: a missionary whose worker row has no profile, or shares its profile with another worker row, cannot submit (42501, in words their page can show) and nothing is written", () =>
      inSavepoint(async () => {
        const before = await counts(db, id.TA);
        const none = await act(unlinked, submitSql(id.TA, null, "No profile"));
        expect(none.code).toBe("42501");
        expect(none.message).toBe(NOT_LINKED);

        const party = randomUUID();
        await db.query(
          "insert into public.parties (id, tenant_id, display_name) values ($1, $2, 'Shares a profile')",
          [party, id.TA],
        );
        await db.query(
          "insert into public.missionaries (id, tenant_id, party_id, profile_id, legal_entity_id) values ($1, $2, $3, $4, $2)",
          [randomUUID(), id.TA, party, id.UM2],
        );
        const shared = await act(
          secondMissionary,
          submitSql(id.TA, null, "Shared profile"),
        );
        expect(shared.code).toBe("42501");
        expect(shared.message).toBe(NOT_LINKED);
        expect(await counts(db, id.TA)).toEqual(before);
      }));

    it("S1: a writer that supplies another worker's key gets the key the post's missionary derives: a restricted worker's update waits and is withheld, not approved under the other worker's automatic policy", () =>
      inSavepoint(async () => {
        await automatic();
        await restrict(id.pM2, "restricted", "Cedar", null);
        const inserted = await db.query(
          "insert into public.posts (tenant_id, missionary_id, ministry_assignment_id, title, content, status, visibility) values ($1, $2, $3, 'Crossed', 'Body', 'published', 'public') returning id",
          [id.TA, id.UM2, id.mA],
        );
        const post = inserted.rows[0].id as string;
        expect(await state(post)).toMatchObject({
          ministry_assignment_id: id.m2,
          review_state: "submitted",
          worker_withheld: true,
          author_user_id: id.UM2,
        });
        for (const caller of [null, follower, nonFollower])
          expect(await sees(caller, post)).toBe(false);
      }));

    it("S4: an approval or a rejection names the version the reviewer read: after the author's edit it is refused (22023) and the update waits with its new words; the version moves only with the words, and the current one approves", () =>
      inSavepoint(async () => {
        const post = await submit(missionary, "Version one");
        const seen = await versionOf(db, post);
        await submit(missionary, "Version two", { post });
        for (const sql of [
          approveSql(id.TA, post, seen),
          rejectSql(id.TA, post, seen, "Too long"),
        ]) {
          const r = await act(reviewer, sql);
          expect(r.code, sql).toBe("22023");
          expect(r.message).toBe(CHANGED);
        }
        expect(await state(post)).toMatchObject({
          title: "Version two",
          review_state: "submitted",
        });
        expect((await audits(post)).map((a) => a.action)).toEqual([
          "ministry_update.submit",
          "ministry_update.submit",
        ]);
        const current = await versionOf(db, post);
        expect(current).toBe(seen + 1);
        await db.query("select public.atomic_like_post($1, $2, $3)", [
          post,
          id.UDA,
          id.TA,
        ]);
        expect(await versionOf(db, post)).toBe(current);
        const approved = await act(reviewer, approveSql(id.TA, post, current));
        expect(approved.code, approved.message).toBeNull();
        expect(await versionOf(db, post)).toBe(current);
        expect(await sees(null, post)).toBe(true);
      }));

    it("S5: the service key writes no review column, author or version (42501); it writes only the columns its writers name, and a content write resubmits", () =>
      inSavepoint(async () => {
        const post = await submit(missionary, "Service key");
        await approve(post);
        const target = `where id = ${lit(post)}`;
        for (const sql of [
          `update public.posts set review_state = 'approved' ${target}`,
          `update public.posts set reviewed_by = null ${target}`,
          `update public.posts set reviewed_by_assignment_id = null ${target}`,
          `update public.posts set reviewed_at = null ${target}`,
          `update public.posts set review_reason = 'x' ${target}`,
          `update public.posts set author_user_id = ${lit(id.UM2)} ${target}`,
          `update public.posts set worker_withheld = true ${target}`,
          `update public.posts set content_version = 9 ${target}`,
          `insert into public.posts (tenant_id, title, content, author_user_id) values (${lit(id.TA)}, 'x', 'x', ${lit(id.UM2)})`,
          `insert into public.posts (tenant_id, title, content, review_state) values (${lit(id.TA)}, 'x', 'x', 'approved')`,
          `insert into public.posts (tenant_id, title, content, worker_withheld) values (${lit(id.TA)}, 'x', 'x', false)`,
        ]) {
          const r = await queryAs("service_role", {}, sql);
          expect(r.code, sql).toBe("42501");
        }
        const privileges = await db.query(
          `select attname,
                  has_column_privilege('service_role', 'public.posts', attname, 'UPDATE') as can_update
             from pg_catalog.pg_attribute
            where attrelid = 'public.posts'::regclass and attnum > 0 and not attisdropped
            order by attname`,
        );
        expect(
          privileges.rows
            .filter((r) => r.can_update)
            .map((r) => r.attname as string),
        ).toEqual(SERVICE_UPDATES);
        const edit = await writeAs(
          "service_role",
          {},
          `update public.posts set content = 'Edited by the service key', updated_at = now() ${target}`,
        );
        expect(edit.code, edit.message).toBeNull();
        expect(await state(post)).toMatchObject({ review_state: "submitted" });
        expect(await sees(null, post)).toBe(false);
      }));

    it("S5: anon reads only the posts columns that existed before review (42501 on each new one) and still reads an approved update's words and counts", () =>
      inSavepoint(async () => {
        const post = await submit(missionary, "Public words");
        await approve(post);
        for (const column of REVIEW_COLUMNS) {
          const r = await read(
            null,
            `select ${column} from public.posts where id = ${lit(post)}`,
          );
          expect(r.code, column).toBe("42501");
        }
        const words = await read(
          null,
          `select id, content, like_count, prayer_count, fires_count, comment_count from public.posts where id = ${lit(post)}`,
        );
        expect(words.code, words.message).toBeNull();
        expect(words.rows).toHaveLength(1);
        const readable = await db.query(
          `select attname from pg_catalog.pg_attribute
            where attrelid = 'public.posts'::regclass and attnum > 0 and not attisdropped
              and has_column_privilege('anon', 'public.posts', attname, 'SELECT')
            order by attname`,
        );
        expect(readable.rows.map((r) => r.attname)).toEqual(BASE_COLUMNS);
      }));

    it("S6: under automatic, an author's edit of an update a reviewer rejected or withdrew, or the author withdrew, waits again instead of being approved; an approved one stays approved", () =>
      inSavepoint(async () => {
        const rejected = await submit(missionary, "Rejected first");
        const reject = await act(
          reviewer,
          rejectSql(
            id.TA,
            rejected,
            await versionOf(db, rejected),
            "Names a village",
          ),
        );
        expect(reject.code, reject.message).toBeNull();
        const pulled = await submit(missionary, "Withdrawn by a reviewer");
        await approve(pulled);
        const pull = await act(
          reviewer,
          withdrawSql(id.TA, pulled, "Names a partner"),
        );
        expect(pull.code, pull.message).toBeNull();
        const own = await submit(missionary, "Withdrawn by its author");
        const ownPull = await act(missionary, withdrawOwnSql(id.TA, own));
        expect(ownPull.code, ownPull.message).toBeNull();

        await automatic();
        for (const post of [rejected, pulled, own]) {
          await submit(missionary, "Edited after", { post });
          expect((await state(post)).review_state, post).toBe("submitted");
          expect(await sees(null, post)).toBe(false);
        }
        const straight = await submit(missionary, "Approved under automatic");
        expect((await state(straight)).review_state).toBe("approved");
        await submit(missionary, "Edited under automatic", { post: straight });
        expect((await state(straight)).review_state).toBe("approved");
      }));

    it("S6: a change of only the post's missionary keeps its review state and version and recomputes withheld from the derived key", () =>
      inSavepoint(async () => {
        const post = await submit(missionary, "Moves to another worker");
        await approve(post);
        const version = await versionOf(db, post);
        await restrict(id.pM2, "restricted", "Cedar", null);
        await db.query(
          "update public.posts set missionary_id = $1 where id = $2",
          [id.UM2, post],
        );
        expect(await state(post)).toMatchObject({
          ministry_assignment_id: id.m2,
          review_state: "approved",
          worker_withheld: true,
        });
        expect(await versionOf(db, post)).toBe(version);
        expect(await sees(null, post)).toBe(false);
      }));

    const commentAuthors = (caller: Who, post: string) =>
      read(
        caller,
        `select user_id, display_name, avatar_url from public.post_comment_authors(${lit(post)})`,
      );

    it("S7: post_comment_authors answers nothing for a waiting update or a withheld one", () =>
      inSavepoint(async () => {
        const post = await submit(missionary, "Commented");
        await approve(post);
        const waiting = await submit(missionary, "Commented while waiting");
        for (const target of [post, waiting])
          await db.query(
            "select public.atomic_add_post_comment($1, $2, $3, 'Praying')",
            [target, id.UDA, id.TA],
          );
        expect((await commentAuthors(nonFollower, post)).rows).toHaveLength(1);
        const forWaiting = await commentAuthors(nonFollower, waiting);
        expect(forWaiting.code, forWaiting.message).toBeNull();
        expect(forWaiting.rows).toEqual([]);
        await restrict(id.pMA, "restricted", "Cedar", null);
        const forWithheld = await commentAuthors(nonFollower, post);
        expect(forWithheld.code, forWithheld.message).toBeNull();
        expect(forWithheld.rows).toEqual([]);
      }));

    it("S7: post_comment_authors names a do-not-publish commenter by no name and no photo", () =>
      inSavepoint(async () => {
        const post = await submit(missionary, "Commented by a worker");
        await approve(post);
        await db.query(
          "update public.profiles set avatar_url = 'https://example.test/w.png' where id = $1",
          [id.UM2],
        );
        await db.query(
          "select public.atomic_add_post_comment($1, $2, $3, 'From the field')",
          [post, id.UM2, id.TA],
        );
        await restrict(id.pM2, "standard", null, true);
        const r = await commentAuthors(nonFollower, post);
        expect(r.code, r.message).toBeNull();
        expect(r.rows).toEqual([
          { user_id: id.UM2, display_name: null, avatar_url: null },
        ]);
      }));

    it("S7: post_comment_authors answers nothing to a caller of another organization", () =>
      inSavepoint(async () => {
        const post = await submit(missionary, "Commented in A");
        await approve(post);
        await db.query(
          "select public.atomic_add_post_comment($1, $2, $3, 'Praying')",
          [post, id.UDA, id.TA],
        );
        const r = await commentAuthors(staffB, post);
        expect(r.code, r.message).toBeNull();
        expect(r.rows).toEqual([]);
      }));

    it("C2: the author cannot withdraw an update a reviewer rejected or withdrew, or one already withdrawn (22023): the decision and its reason stand and no withdrawal is written", () =>
      inSavepoint(async () => {
        const rejected = await submit(missionary, "Rejected");
        const reject = await act(
          reviewer,
          rejectSql(
            id.TA,
            rejected,
            await versionOf(db, rejected),
            "Names a village",
          ),
        );
        expect(reject.code, reject.message).toBeNull();
        const pulled = await submit(missionary, "Pulled");
        await approve(pulled);
        const pull = await act(
          reviewer,
          withdrawSql(id.TA, pulled, "Names a partner"),
        );
        expect(pull.code, pull.message).toBeNull();
        const own = await submit(missionary, "Own");
        expect(
          (await act(missionary, withdrawOwnSql(id.TA, own))).code,
        ).toBeNull();

        for (const [post, by, reason] of [
          [rejected, id.UST, "Names a village"],
          [pulled, id.UST, "Names a partner"],
          [own, id.UM, null],
        ] as const) {
          const r = await act(missionary, withdrawOwnSql(id.TA, post));
          expect(r.code, post).toBe("22023");
          expect(r.message).toBe(OWN_WITHDRAW);
          expect(await state(post)).toMatchObject({
            reviewed_by: by,
            review_reason: reason,
          });
        }
        const withdrawals = await db.query(
          "select count(*)::int n from public.audit_logs where tenant_id = $1 and action = 'ministry_update.withdraw_own'",
          [id.TA],
        );
        expect(withdrawals.rows[0].n).toBe(1);
      }));

    it("C4: a donor's follow reads only a partners-only update, never another visibility; a reviewer reads a hidden or flagged update and nobody else does", () =>
      inSavepoint(async () => {
        const post = await submit(missionary, "Becomes staff only");
        await approve(post);
        await db.query(
          "update public.posts set visibility = 'staff_only' where id = $1",
          [post],
        );
        await approve(post);
        expect(await sees(follower, post)).toBe(false);
        expect(await sees(nonFollower, post)).toBe(false);
        expect(await sees(reviewer, post)).toBe(true);
        for (const status of ["hidden", "flagged"]) {
          const moderated = await submit(missionary, `Becomes ${status}`);
          await approve(moderated);
          await db.query("update public.posts set status = $1 where id = $2", [
            status,
            moderated,
          ]);
          expect(await sees(reviewer, moderated), status).toBe(true);
          for (const caller of [null, follower, nonFollower])
            expect(await sees(caller, moderated), status).toBe(false);
        }
      }));

    it("T5 reads.9: a high-risk worker's approved update leaves every feed but the author's and a reviewer's", () =>
      inSavepoint(async () => {
        const post = await submit(secondMissionary, "High risk field");
        await approve(post);
        await restrict(id.pM2, "high_risk", "Oak", null);
        for (const caller of [null, follower, nonFollower, missionary])
          expect(await sees(caller, post)).toBe(false);
        expect(await sees(secondMissionary, post)).toBe(true);
        expect(await sees(reviewer, post)).toBe(true);
      }));

    it("T5 partners.4: a follower of M does not read M2's partners-only update", () =>
      inSavepoint(async () => {
        const post = await submit(secondMissionary, "For M2's partners", {
          visibility: "partners_only",
        });
        await approve(post);
        expect(await sees(follower, post)).toBe(false);
        expect(await sees(nonFollower, post)).toBe(false);
        expect(await sees(reviewer, post)).toBe(true);
      }));

    it("T5 reads.21: the author's withdrawal and a reviewer's rejection each write exactly their audit rows, with person, assignment and reason", () =>
      inSavepoint(async () => {
        const own = await submit(missionary, "Withdrawn");
        await approve(own);
        expect(
          (await act(missionary, withdrawOwnSql(id.TA, own))).code,
        ).toBeNull();
        expect(await audits(own)).toEqual([
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
          {
            action: "ministry_update.withdraw_own",
            user_id: id.UM,
            assignment: id.mM,
            reason: null,
          },
        ]);
        const rejected = await submit(missionary, "Rejected");
        const r = await act(
          reviewer,
          rejectSql(id.TA, rejected, await versionOf(db, rejected), "Too long"),
        );
        expect(r.code, r.message).toBeNull();
        expect(await audits(rejected)).toEqual([
          {
            action: "ministry_update.rejected",
            user_id: id.UST,
            assignment: id.mST,
            reason: "Too long",
          },
          {
            action: "ministry_update.submit",
            user_id: id.UM,
            assignment: id.mM,
            reason: null,
          },
        ]);
      }));

    it("T5 lane.21: a live missionary whose sign-in is linked to no worker cannot submit, edit or withdraw (42501) and nothing is written", () =>
      inSavepoint(async () => {
        const post = await submit(missionary, "Someone else's");
        const before = await counts(db, id.TA);
        for (const sql of [
          submitSql(id.TA, null, "No worker"),
          submitSql(id.TA, post, "No worker"),
          withdrawOwnSql(id.TA, post),
        ]) {
          const r = await act(noWorker, sql);
          expect(r.code, sql).toBe("42501");
          expect(r.message).toBe(NO_MINISTRY);
        }
        expect(await counts(db, id.TA)).toEqual(before);
      }));

    it("T5 reads.31: every staff sub-role holds updates.review and a staff assignment needs a sub-role, so no staff caller reaches the policy's staff branch without the reviewer's", async () => {
      const roles = await db.query(
        "select unnest(enum_range(null::authz.staff_role))::text as role order by 1",
      );
      expect(roles.rows.map((r) => r.role)).toEqual([...STAFF_ROLES].sort());
      for (const role of STAFF_ROLES) {
        const held = await db.query(
          "select 'updates.review' = any(authz.assignment_capabilities($1)) as holds",
          [id[`m_${role}`]],
        );
        expect(held.rows[0].holds, role).toBe(true);
      }
      await db.query("savepoint no_role");
      const bare = await db
        .query(
          "insert into authz.memberships (id, user_id, tenant_id, role, staff_role, is_active) values ($1, $2, $3, 'staff', null, true)",
          [randomUUID(), id.UD2, id.TA],
        )
        .then(
          () => "inserted",
          (e: { code?: string }) => e.code,
        );
      await db.query("rollback to savepoint no_role");
      expect(bare).toBe("23514");
    });
  },
);
