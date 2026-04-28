import { describe, expect, it } from "vitest";

import {
  extractPlainText,
  getUrlFromString,
  isAllowedPostLinkHref,
  isPostContentEmpty,
  isRichText,
  isValidUrl,
  normalizePostLinkHref,
  parseContent,
} from "../../../../../../../packages/ui/components/shadcn/rich-text-editor/helpers";

describe("rich-text-editor/helpers", () => {
  it("parses valid TipTap JSON strings", () => {
    const value = JSON.stringify({
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: "Hi" }] }],
    });

    expect(parseContent(value)).toEqual(JSON.parse(value));
  });

  it("keeps legacy HTML and plain text as strings", () => {
    expect(parseContent("<p>Legacy</p>")).toBe("<p>Legacy</p>");
    expect(parseContent("Plain text")).toBe("Plain text");
    expect(parseContent("")).toBe("");
    expect(parseContent('{"type":"paragraph"}')).toBe('{"type":"paragraph"}');
  });

  it("handles malformed JSON safely", () => {
    expect(parseContent('{"type":"doc"')).toBe('{"type":"doc"');
    expect(isRichText('{"type":"doc"')).toBe(false);
  });

  it("detects rich text docs only", () => {
    expect(isRichText('{"type":"doc"}')).toBe(true);
    expect(isRichText('{"type":"paragraph"}')).toBe(false);
    expect(isRichText("<p>Legacy</p>")).toBe(false);
  });

  it("extracts plain text across common node types", () => {
    const value = JSON.stringify({
      type: "doc",
      content: [
        { type: "heading", content: [{ type: "text", text: "Title" }] },
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Hello " },
            {
              type: "text",
              text: "Link",
              marks: [{ type: "link", attrs: { href: "https://example.com" } }],
            },
          ],
        },
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [
                { type: "paragraph", content: [{ type: "text", text: "One" }] },
              ],
            },
          ],
        },
        {
          type: "blockquote",
          content: [
            { type: "paragraph", content: [{ type: "text", text: "Quote" }] },
          ],
        },
        { type: "image", attrs: { src: "https://example.com/a.png" } },
      ],
    });

    expect(extractPlainText(value)).toContain("TitleHello LinkOneQuote");
    expect(extractPlainText("<p>Hello <strong>world</strong></p>")).toBe(
      "Hello world",
    );
  });

  it("detects post content emptiness for text and image docs", () => {
    expect(
      isPostContentEmpty('{"type":"doc","content":[{"type":"paragraph"}]}'),
    ).toBe(true);
    expect(isPostContentEmpty("<p>   </p>")).toBe(true);
    expect(isPostContentEmpty("    ")).toBe(true);
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
    expect(isPostContentEmpty("<p>Meaningful</p>")).toBe(false);
  });

  it("applies URL normalization + validation policy", () => {
    expect(getUrlFromString("example.com/path")).toBe(
      "https://example.com/path",
    );
    expect(getUrlFromString("https://example.com/path")).toBe(
      "https://example.com/path",
    );
    expect(getUrlFromString("mailto:person@example.com")).toBeNull();
    expect(getUrlFromString("javascript:alert(1)")).toBeNull();

    expect(normalizePostLinkHref("https://example.com")).toBe(
      "https://example.com/",
    );
    expect(normalizePostLinkHref("javascript:alert(1)")).toBeNull();

    expect(isAllowedPostLinkHref("https://example.com")).toBe(true);
    expect(isAllowedPostLinkHref("http://example.com")).toBe(true);
    expect(isAllowedPostLinkHref("mailto:person@example.com")).toBe(false);
    expect(isAllowedPostLinkHref("javascript:alert(1)")).toBe(false);

    expect(isValidUrl("https://example.com")).toBe(true);
    expect(isValidUrl("data:text/html;base64,abc")).toBe(false);
  });
});
