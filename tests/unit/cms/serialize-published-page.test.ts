import { describe, expect, it } from "vitest";

import { serializePublishedPageLike } from "../../../apps/admin/src/cms/public/serialize-published-page";

describe("serializePublishedPageLike", () => {
  it("maps known fields and stringifies id", () => {
    const out = serializePublishedPageLike({
      id: 12,
      title: "Hello",
      slug: "hello",
      summary: "S",
      content: { a: 1 },
      layout: [],
      pageType: "standard",
      missionaryId: "m1",
      fundId: "f1",
      legacyContentFallback: true,
      updatedAt: "2026-01-01",
    });

    expect(out).toEqual({
      id: "12",
      title: "Hello",
      slug: "hello",
      summary: "S",
      content: { a: 1 },
      layout: [],
      pageType: "standard",
      missionaryId: "m1",
      fundId: "f1",
      legacyContentFallback: true,
      updatedAt: "2026-01-01",
    });
  });
});
