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

  it("preserves valid http/https TipTap link marks", () => {
    const input = JSON.stringify({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "OpenAI",
              marks: [{ type: "link", attrs: { href: "https://openai.com" } }],
            },
          ],
        },
      ],
    });

    expect(JSON.parse(normalizeStoredPostContent(input))).toEqual(
      JSON.parse(input),
    );
  });

  it("removes unsafe link marks while preserving surrounding content", () => {
    const input = JSON.stringify({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Click me",
              marks: [
                { type: "bold" },
                { type: "link", attrs: { href: "javascript:alert(1)" } },
              ],
            },
          ],
        },
      ],
    });

    expect(JSON.parse(normalizeStoredPostContent(input))).toEqual({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Click me",
              marks: [{ type: "bold" }],
            },
          ],
        },
      ],
    });
  });

  it("sanitizes nested content recursively", () => {
    const input = JSON.stringify({
      type: "doc",
      content: [
        {
          type: "blockquote",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Nested",
                  marks: [
                    {
                      type: "link",
                      attrs: { href: "https://example.com/nested" },
                    },
                  ],
                },
                {
                  type: "text",
                  text: " bad",
                  marks: [
                    { type: "link", attrs: { href: "data:text/plain,hello" } },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    expect(JSON.parse(normalizeStoredPostContent(input))).toEqual({
      type: "doc",
      content: [
        {
          type: "blockquote",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Nested",
                  marks: [
                    {
                      type: "link",
                      attrs: { href: "https://example.com/nested" },
                    },
                  ],
                },
                {
                  type: "text",
                  text: " bad",
                },
              ],
            },
          ],
        },
      ],
    });
  });
});
