/**
 * AL-2675 real-stack acceptance (WP2b first release; council on the joined
 * release, JB11): `public.post_comment_authors(post)` names the people who
 * commented on a published public post, through a definer read of their
 * profiles' display name and avatar and nothing else, so the comments route
 * names commenters without reading other people's `profiles` rows (which the
 * second release stops). The profile is matched by the login, preferring
 * `profiles.user_id`.
 *
 * Runs against TENANT_GUARD_IT_ADMIN_DATABASE_URL (see ./harness.ts): skips
 * without it, except in CI's `migrate` job, where it fails. Every check runs
 * in one transaction that is always rolled back.
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

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "the migrate job sets TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

describe.skipIf(!ADMIN_URL)(
  "AL-2675 the commenters' names on a post (real stack)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    const id = fixtureIds();
    const as = asRole(db, id);
    const post = randomUUID();

    beforeAll(() => db.connect());
    afterAll(() => db.end());

    async function tx(fn: () => Promise<void>) {
      await db.query("begin");
      try {
        await db.query(fixtureSql(id));
        // A published public post in TA, commented on by the administrator
        // and by the finance and member-care person.
        await db.query(
          `insert into public.posts (id, tenant_id, content, status, visibility)
           values ($1, $2, 'acc2675 post', 'published', 'public')`,
          [post, id.TA],
        );
        await db.query(
          `insert into public.post_comments (post_id, user_id, content)
           values ($1, $2, 'first'), ($1, $3, 'second'), ($1, $2, 'third')`,
          [post, id.UADM, id.UFC],
        );
        await db.query(
          "update public.profiles set avatar_url = 'https://example.org/a.png' where user_id = $1",
          [id.UADM],
        );
        await fn();
      } finally {
        await db.query("rollback");
      }
    }

    /** What `sub` gets for the post, ordered by commenter. */
    const call = (sub = "UDON") =>
      as(
        "authenticated",
        { sub },
        `select * from public.post_comment_authors('${post}') order by user_id`,
      );
    const byUser = (
      rows: {
        user_id: string;
        display_name: string | null;
        avatar_url: string | null;
      }[],
    ) => [...rows].sort((a, b) => a.user_id.localeCompare(b.user_id));

    it("gives a member of the post's organization each commenter's display name and avatar, once each", () =>
      tx(async () => {
        // UDON is a donor in TA, the post's organization.
        const r = await call("UDON");
        expect(r.code, r.message).toBeNull();
        expect(r.rows).toEqual(
          byUser([
            {
              user_id: id.UADM!,
              display_name: "Blair Admin",
              avatar_url: "https://example.org/a.png",
            },
            {
              user_id: id.UFC!,
              display_name: "Avery Finance-Care",
              avatar_url: null,
            },
          ]),
        );
      }));

    it("gives no name for a blank display name, even when first, last and full names are set", () =>
      tx(async () => {
        await db.query(
          `update public.profiles
              set display_name = '   ', first_name = 'Avery', last_name = 'Care',
                  full_name = 'Avery Care'
            where user_id = $1`,
          [id.UFC],
        );
        const r = await call("UDON");
        expect(r.code, r.message).toBeNull();
        expect(r.rows.find((row) => row.user_id === id.UFC)).toEqual({
          user_id: id.UFC,
          display_name: null,
          avatar_url: null,
        });
      }));

    it("gives a signed-in person outside the post's organization every commenter, with no name or avatar", () =>
      tx(async () => {
        // UB is finance staff in TB only; UREV's row in TA is revoked.
        for (const sub of ["UB", "UREV"]) {
          const r = await call(sub);
          expect(r.code, r.message).toBeNull();
          expect(r.rows, sub).toEqual(
            byUser([
              { user_id: id.UADM!, display_name: null, avatar_url: null },
              { user_id: id.UFC!, display_name: null, avatar_url: null },
            ]),
          );
        }
      }));

    it("names no one on a post that is not published and public", () =>
      tx(async () => {
        // Each call succeeds, with no row: an empty answer, not a refusal.
        const answer = async () => {
          const r = await call();
          expect(r.code, r.message).toBeNull();
          return r.rows;
        };
        expect(await answer()).toHaveLength(2);
        await db.query(
          "update public.posts set visibility = 'followers' where id = $1",
          [post],
        );
        expect(await answer()).toEqual([]);
        await db.query(
          "update public.posts set visibility = 'public', status = 'draft' where id = $1",
          [post],
        );
        expect(await answer()).toEqual([]);
      }));

    it("is refused to anon, and is a definer owned by postgres with an empty search path, executable by authenticated only", () =>
      tx(async () => {
        const anon = await as(
          "anon",
          {},
          `select * from public.post_comment_authors('${post}')`,
        );
        expect(anon.code).toBe("42501");
        const { rows } = await db.query(
          `select p.prosecdef, p.proconfig, pg_get_userbyid(p.proowner) as owner,
                  array(
                    select case a.grantee when 0 then 'PUBLIC' else a.grantee::regrole::text end
                      from aclexplode(p.proacl) a
                     where a.privilege_type = 'EXECUTE' and a.grantee <> p.proowner
                     order by 1
                  ) as grantees
             from pg_proc p
            where p.oid = 'public.post_comment_authors(uuid)'::regprocedure`,
        );
        expect(rows).toEqual([
          {
            prosecdef: true,
            proconfig: ['search_path=""'],
            owner: "postgres",
            grantees: ["authenticated"],
          },
        ]);
      }));
  },
);
