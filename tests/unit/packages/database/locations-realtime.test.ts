import { describe, expect, it } from "vitest";

import { supabaseTableCollectionRegistry } from "../../../../packages/database/collections";

// AL-2675 (WP2b, second release; activation review, defect 12, and council
// R14): the migration takes these seven tables out of the supabase_realtime
// publication, and the installed adapter keeps an errored catch-all channel
// so that Realtime rejoins it, so no collection of theirs may subscribe:
// whoever first instantiates one would get a reconnect loop.
const OUT_OF_THE_PUBLICATION = [
  "funds",
  "locations",
  "posts",
  "post_comments",
  "post_fires",
  "post_likes",
  "post_prayers",
] as const;

describe("collections of the tables out of the Realtime publication", () => {
  it.each(OUT_OF_THE_PUBLICATION)(
    "does not realtime-sync %s, which the second release of WP2b takes out of the publication",
    (table) => {
      // Every collection registered for the table, not the first alone
      // (review of pull request 2737, thread 4641188166).
      const collections = supabaseTableCollectionRegistry.filter(
        (entry) => "tableName" in entry && entry.tableName === table,
      );

      expect(collections.length, `${table} has a collection`).toBeGreaterThan(
        0,
      );
      for (const collection of collections)
        expect(collection.realtime, table).toBe("disabled");
    },
  );
});
