import { describe, expect, it } from "vitest";

import { normalizeStoredPostContent } from "../../../../../packages/api/src/posts/content";

describe("normalizeStoredPostContent", () => {
  it("canonicalizes stored TipTap JSON docs", () => {
    const input = '{ "type": "doc", "content": [{ "type": "paragraph" }] }';

    expect(normalizeStoredPostContent(input)).toBe(
      JSON.stringify({
        type: "doc",
        content: [{ type: "paragraph" }],
      }),
    );
  });

  it("leaves legacy HTML and plain text untouched", () => {
    expect(normalizeStoredPostContent("<p>Legacy HTML</p>")).toBe(
      "<p>Legacy HTML</p>",
    );
    expect(normalizeStoredPostContent("  Plain text  ")).toBe("  Plain text  ");
  });

  it("leaves non-doc JSON untouched", () => {
    const input = JSON.stringify({ type: "paragraph", content: [] });

    expect(normalizeStoredPostContent(input)).toBe(input);
  });
});
