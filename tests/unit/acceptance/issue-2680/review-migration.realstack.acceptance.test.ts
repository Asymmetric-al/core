import { readFileSync } from "node:fs";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { Replay } from "../issue-2674/privileges-harness";
import { fixtureIds, fixtureSql } from "../issue-2678/harness";
import {
  ADMIN_URL,
  IN_MIGRATE_JOB,
  backendPid,
  migration,
  waitsOn,
} from "./harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)("migrate supplies its database", () =>
  expect(ADMIN_URL).toBeTruthy(),
);

const REVIEW = "20261127070000";

describe.skipIf(!ADMIN_URL)(
  "AL-2680 WP7 pull request 1, fix round: the review migration over rows that exist, while a restriction is open",
  () => {
    const id = fixtureIds();
    let replay: Replay;

    beforeAll(async () => {
      replay = await new Replay(ADMIN_URL!, false).build(
        (file) => file >= REVIEW,
      );
      const db = await replay.db();
      await db.query("begin");
      await db.query(fixtureSql(id));
      await db.query(
        `insert into public.posts (tenant_id, missionary_id, title, content, status, visibility) values
           ($1, $2, 'Before review', 'Body', 'published', 'public'),
           ($1, $3, 'Before the restriction', 'Body', 'published', 'public')`,
        [id.TA, id.UM, id.UM2],
      );
      await db.query("commit");
    }, 600_000);
    afterAll(async () => {
      await replay?.close();
    });

    it("B-115 and reads.10: a restriction open while the migration starts commits first, and every post that existed starts approved with its author, the restricted worker's withheld", async () => {
      const restrictor = new pg.Client({ connectionString: replay.url });
      const migrator = new pg.Client({ connectionString: replay.url });
      await restrictor.connect();
      await migrator.connect();
      try {
        const restrictorPid = await backendPid(restrictor);
        const migratorPid = await backendPid(migrator);
        await restrictor.query("begin");
        await restrictor.query(
          "update public.parties set security_level = 'restricted', public_alias = 'Cedar' where id = $1",
          [id.pM2],
        );
        const migrated = migrator
          .query(readFileSync(migration("_wp7_1_review"), "utf8"))
          .then(
            () => "done",
            (e: { code?: string; message?: string }) =>
              `${e.code} ${e.message}`,
          );
        const observer = await replay.db();
        await waitsOn(observer, migratorPid, restrictorPid);
        await restrictor.query("commit");
        expect(await migrated).toBe("done");
        const rows = await replay.rows(
          "select title, review_state, author_user_id, worker_withheld from public.posts where tenant_id = $1 order by title",
          [id.TA],
        );
        expect(rows).toEqual([
          {
            title: "Before review",
            review_state: "approved",
            author_user_id: id.UM,
            worker_withheld: false,
          },
          {
            title: "Before the restriction",
            review_state: "approved",
            author_user_id: id.UM2,
            worker_withheld: true,
          },
        ]);
      } finally {
        await restrictor.end().catch(() => undefined);
        await migrator.end().catch(() => undefined);
      }
    }, 120_000);
  },
);
