import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { renderPublicCmsPageContent } from "@asym/lib/cms/public-page-renderer";

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

  it("sanitizes unsafe Lexical link URLs", () => {
    const content = {
      root: {
        children: [
          {
            type: "paragraph",
            children: [
              {
                type: "link",
                url: "javascript:alert(1)",
                children: [{ type: "text", text: "bad link" }],
              },
            ],
          },
        ],
      },
    };

    const markup = renderToStaticMarkup(
      <>{renderPublicCmsPageContent(content, "page_2")}</>,
    );

    expect(markup).toBe('<p><a href="#">bad link</a></p>');
  });

  it("returns null for malformed or empty content", () => {
    expect(renderPublicCmsPageContent(null, "page_3")).toBeNull();
    expect(renderPublicCmsPageContent({ root: {} }, "page_3")).toBeNull();
  });
});
