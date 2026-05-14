import { describe, expect, it } from "vitest";

import {
  buildWebStudioPreviewModel,
  getWebStudioPreviewCollectionLabel,
  isWebStudioPreviewCollection,
} from "../../../apps/admin/src/cms/preview/authenticated-preview";

describe("authenticated Web Studio preview helpers", () => {
  it("accepts only preview-safe CMS collections", () => {
    expect(isWebStudioPreviewCollection("pages")).toBe(true);
    expect(isWebStudioPreviewCollection("project-pages")).toBe(true);
    expect(isWebStudioPreviewCollection("media")).toBe(false);
    expect(isWebStudioPreviewCollection("cms-users")).toBe(false);
  });

  it("normalizes ministry updates without public route semantics", () => {
    const preview = buildWebStudioPreviewModel({
      collection: "ministry-updates",
      doc: {
        content: { root: { children: [] } },
        excerpt: "Draft update",
        id: "update_1",
        title: "Quarterly Report",
      },
    });

    expect(preview).toEqual({
      content: { root: { children: [] } },
      id: "update_1",
      summary: "Draft update",
      title: "Quarterly Report",
    });
  });

  it("uses public serializer for page-like previews so CTA sanitization stays shared", () => {
    const preview = buildWebStudioPreviewModel({
      collection: "project-pages",
      doc: {
        fundId: "123e4567-e89b-42d3-a456-426614174222",
        id: "project_1",
        layout: [
          {
            blockType: "call-to-action",
            buttonHref: "javascript:alert(1)",
            buttonLabel: "Give",
            headline: "Water Project",
          },
        ],
        pageType: "project",
        title: "Water Project",
      },
    });

    expect(preview.title).toBe("Water Project");
    expect(preview.id).toBe("project_1");
    expect(preview.content).toBeUndefined();
    expect(preview).toEqual(
      expect.objectContaining({
        summary: null,
      }),
    );
    expect(preview.layout).toEqual([
      expect.objectContaining({
        buttonHref: "/checkout?fund_id=123e4567-e89b-42d3-a456-426614174222",
      }),
    ]);
  });

  it("labels preview collections for the authenticated route chrome", () => {
    expect(getWebStudioPreviewCollectionLabel("missionary-giving-pages")).toBe(
      "Missionary Giving Page",
    );
  });
});
