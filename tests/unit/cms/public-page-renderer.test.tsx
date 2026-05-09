import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { renderPublicCmsPageContent } from "@asym/lib/cms/public-page-renderer";

function renderLinkMarkup(url: unknown) {
  const content = {
    root: {
      children: [
        {
          type: "paragraph",
          children: [
            {
              type: "link",
              url,
              children: [{ type: "text", text: "link" }],
            },
          ],
        },
      ],
    },
  };

  return renderToStaticMarkup(
    <>{renderPublicCmsPageContent(content, "page_link")}</>,
  );
}

describe("renderPublicCmsPageContent", () => {
  it("renders the supported Lexical subset on the server", () => {
    const content = {
      root: {
        children: [
          {
            type: "heading",
            tag: "h2",
            children: [{ type: "text", text: "About", format: 1 }],
          },
          {
            type: "paragraph",
            children: [
              { type: "text", text: "Hello ", format: 0 },
              { type: "text", text: "world", format: 2 },
            ],
          },
        ],
      },
    };

    const markup = renderToStaticMarkup(
      <>{renderPublicCmsPageContent(content, "page_1")}</>,
    );

    expect(markup).toBe(
      "<h2><strong>About</strong></h2><p>Hello <em>world</em></p>",
    );
  });

  it.each([
    ["javascript:alert(1)", "#"],
    ["data:text/html,<script>alert(1)</script>", "#"],
    ["relative-page", "#"],
    ["../admin", "#"],
    ["//example.org/path", "#"],
    ["/about", "/about"],
    ["#section", "#section"],
    ["https://example.org/path", "https://example.org/path"],
    ["mailto:hello@example.org", "mailto:hello@example.org"],
  ])("sanitizes Lexical link URL %s", (url, expectedHref) => {
    expect(renderLinkMarkup(url)).toBe(
      `<p><a href="${expectedHref}">link</a></p>`,
    );
  });

  it("returns null for malformed or empty content", () => {
    expect(renderPublicCmsPageContent(null, "page_3")).toBeNull();
    expect(renderPublicCmsPageContent({ root: {} }, "page_3")).toBeNull();
  });
});
