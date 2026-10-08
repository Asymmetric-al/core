import { JSDOM } from "jsdom";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SafeHtml } from "../../../../packages/lib/components/safe-html";
import { sanitizeRichTextHtml } from "../../../../packages/lib/html/sanitize";

describe("safe rich HTML boundary", () => {
  it("removes scripts, executable links, event handlers and SVG", () => {
    const result = sanitizeRichTextHtml(
      '<p>Hello<script>alert(1)</script><a href="javascript:alert(1)" onclick="alert(1)">safe</a></p><svg onload="alert(1)"></svg>',
    );
    expect(result).toBe("<p>Hello<a>safe</a></p>");
  });

  it("preserves ordinary formatted content and HTTPS links", () => {
    const html =
      '<p><strong>Giving</strong> &amp; care <a href="https://example.com">details</a></p>';
    expect(sanitizeRichTextHtml(html)).toBe(html);
  });

  it.each([undefined, null, ""])(
    "renders absent content as empty HTML (%s)",
    (value) => {
      expect(sanitizeRichTextHtml(value)).toBe("");
      expect(renderToStaticMarkup(<SafeHtml html={value} />)).toBe(
        "<div></div>",
      );
    },
  );

  it("renders sanitized malformed HTML with the same safe content", () => {
    const markup = renderToStaticMarkup(
      <SafeHtml html='<p><strong>Safe<img src="javascript:alert(1)" onerror="alert(1)">' />,
    );
    const dom = new JSDOM(markup);
    try {
      expect(dom.window.document.body.textContent).toBe("Safe");
      const image = dom.window.document.querySelector("img");
      expect(image).not.toBeNull();
      expect(image?.hasAttribute("src")).toBe(false);
      expect(image?.hasAttribute("onerror")).toBe(false);
      expect(dom.window.document.querySelector("strong")?.textContent).toBe(
        "Safe",
      );
    } finally {
      dom.window.close();
    }
  });
});
