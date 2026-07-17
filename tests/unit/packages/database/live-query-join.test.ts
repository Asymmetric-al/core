import { describe, expect, it } from "vitest";

import {
  createCollection,
  createLiveQueryCollection,
  eq,
  localOnlyCollectionOptions,
} from "../../../../packages/database/node_modules/@tanstack/db";
import { z } from "../../../../packages/database/node_modules/zod";

describe("representative TanStack DB live query join", () => {
  it("joins collection rows through public TanStack DB query APIs", () => {
    const posts = createCollection(
      localOnlyCollectionOptions({
        id: "test_posts",
        getKey: (post) => post.id,
        schema: z.object({
          id: z.string(),
          missionary_id: z.string(),
          content: z.string(),
        }),
      }),
    );
    const missionaries = createCollection(
      localOnlyCollectionOptions({
        id: "test_missionaries",
        getKey: (missionary) => missionary.id,
        schema: z.object({
          id: z.string(),
          display_name: z.string(),
        }),
      }),
    );

    posts.insert({ id: "post-1", missionary_id: "missionary-1", content: "A" });
    missionaries.insert({ id: "missionary-1", display_name: "Ada" });

    const joined = createLiveQueryCollection({
      startSync: true,
      query: (q) =>
        q
          .from({ post: posts })
          .join({ missionary: missionaries }, ({ post, missionary }) =>
            eq(post.missionary_id, missionary.id),
          )
          .select(({ post, missionary }) => ({
            id: post.id,
            authorName: missionary.display_name,
          })),
    });

    expect(
      joined.toArray.map((row) => ({
        id: row.id,
        authorName: row.authorName,
      })),
    ).toEqual([{ id: "post-1", authorName: "Ada" }]);
  });
});
