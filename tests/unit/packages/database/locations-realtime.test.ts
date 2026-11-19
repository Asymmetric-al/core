import { describe, expect, it } from "vitest";

import { supabaseTableCollectionRegistry } from "../../../../packages/database/collections";

// AL-2675 (WP2b, second release; activation review, defect 12): the migration
// takes locations out of the supabase_realtime publication, and the installed
// adapter keeps an errored catch-all channel so that Realtime rejoins it, so
// the public map's collection must not subscribe.
describe("locations collection", () => {
  it("does not realtime-sync locations, which the second release of WP2b takes out of the publication", () => {
    const locations = supabaseTableCollectionRegistry.find(
      (entry) => entry.tableName === "locations",
    );

    expect(locations?.realtime).toBe("disabled");
  });
});
