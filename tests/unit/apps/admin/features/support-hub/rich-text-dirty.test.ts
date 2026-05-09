import { describe, expect, it } from "vitest";

import { isRichTextPayloadDirty } from "../../../../../../apps/admin/features/support-hub/lib/rich-text-dirty";

describe("isRichTextPayloadDirty", () => {
  it("ignores empty paragraphs and whitespace-only text", () => {
    expect(
      isRichTextPayloadDirty(
        JSON.stringify({
          type: "doc",
          content: [
            { type: "paragraph" },
            { type: "paragraph", content: [{ type: "text", text: "   " }] },
          ],
        }),
      ),
    ).toBe(false);
  });

  it("detects meaningful text and non-text leaf nodes", () => {
    expect(
      isRichTextPayloadDirty(
        JSON.stringify({
          type: "doc",
          content: [
            { type: "paragraph", content: [{ type: "text", text: "Hi" }] },
          ],
        }),
      ),
    ).toBe(true);
    expect(
      isRichTextPayloadDirty(
        JSON.stringify({
          type: "doc",
          content: [{ type: "image", attrs: { src: "blob://receipt" } }],
        }),
      ),
    ).toBe(true);
  });
});
