import { describe, expect, it } from "vitest";

import {
  isPostContentEmpty,
  isRichText,
} from "../../../../packages/ui/components/shadcn/rich-text-editor/helpers";

describe("rich text helpers", () => {
  it("detects TipTap JSON docs and rejects legacy content", () => {
    expect(
      isRichText(
        JSON.stringify({
          type: "doc",
          content: [
            { type: "paragraph", content: [{ type: "text", text: "Hi" }] },
          ],
        }),
      ),
    ).toBe(true);
    expect(isRichText("<p>Legacy HTML</p>")).toBe(false);
    expect(isRichText("Plain text")).toBe(false);
    expect(isRichText(JSON.stringify({ type: "paragraph" }))).toBe(false);
  });

  it("treats image-only content as non-empty across JSON and legacy formats", () => {
    expect(
      isPostContentEmpty(
        JSON.stringify({
          type: "doc",
          content: [
            { type: "image", attrs: { src: "https://example.com/a.jpg" } },
          ],
        }),
      ),
    ).toBe(false);
    expect(
      isPostContentEmpty('<p><img src="https://example.com/a.jpg" /></p>'),
    ).toBe(false);
  });

  it("treats blank JSON docs, blank HTML, and blank text as empty", () => {
    expect(
      isPostContentEmpty(
        JSON.stringify({
          type: "doc",
          content: [{ type: "paragraph" }],
        }),
      ),
    ).toBe(true);
    expect(isPostContentEmpty("<p>   </p>")).toBe(true);
    expect(isPostContentEmpty("   ")).toBe(true);
  });
});
