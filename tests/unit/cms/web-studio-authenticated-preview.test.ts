import { describe, expect, it } from "vitest";

import {
  buildWebStudioPreviewModel,
  getWebStudioPreviewCollectionLabel,
  isWebStudioPreviewCollection,
} from "../../../apps/admin/src/cms/preview/authenticated-preview";

describe("authenticated Web Studio preview helpers (D-18: WP6 part 2b leaves pages the one previewed collection, its family naming the page type)", () => {
  it("accepts only the pages collection", () => {
    expect(isWebStudioPreviewCollection("pages")).toBe(true);
    for (const slug of [
      "project-pages",
      "missionary-giving-pages",
      "ministry-updates",
      "media",
      "navigation",
      "site-presentations",
      "principal-links",
      "cms-users",
    ]) {
      expect(isWebStudioPreviewCollection(slug), slug).toBe(false);
    }
  });

  it("uses the public serializer so CTA sanitization stays shared, routing a project page's CTA through its fund", () => {
    const preview = buildWebStudioPreviewModel({
      collection: "pages",
      doc: {
        fundId: "123e4567-e89b-42d3-a456-426614174222",
        id: "8d7c6b5a-4938-4271-8a6b-5c4d3e2f1a09",
        layout: [
          {
            blockType: "call-to-action",
            buttonHref: "javascript:alert(1)",
            buttonLabel: "Give",
            headline: "Water Project",
          },
        ],
        family: "project",
        title: "Water Project",
      },
    });

    expect(preview.title).toBe("Water Project");
    expect(preview.id).toBe("8d7c6b5a-4938-4271-8a6b-5c4d3e2f1a09");
    expect(preview.summary).toBeNull();
    expect(preview.layout).toEqual([
      expect.objectContaining({
        buttonHref: "/checkout?fund_id=123e4567-e89b-42d3-a456-426614174222",
      }),
    ]);
  });

  it("names an untitled draft and labels the preview for the route chrome", () => {
    expect(
      buildWebStudioPreviewModel({
        collection: "pages",
        doc: { id: "8d7c6b5a-4938-4271-8a6b-5c4d3e2f1a09", family: "standard" },
      }).title,
    ).toBe("Untitled page");
    expect(getWebStudioPreviewCollectionLabel("pages")).toBe("Page");
  });
});
