/** @vitest-environment jsdom */

import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { RichTextViewer } from "../../../../../../../packages/ui/components/shadcn/rich-text-editor/rich-text-viewer";

afterEach(() => {
  cleanup();
});

describe("rich-text-editor/rich-text-viewer", () => {
  it("renders nothing for empty values", () => {
    const { container } = render(<RichTextViewer value="" />);
    expect(container.firstChild).toBeNull();
  });

  it("renders JSON content through static renderer output", () => {
    const value = JSON.stringify({
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "Heading" }],
        },
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Hello " },
            { type: "text", marks: [{ type: "bold" }], text: "bold" },
            { type: "text", text: " and " },
            { type: "text", marks: [{ type: "italic" }], text: "italic" },
            { type: "text", text: " with " },
            {
              type: "text",
              marks: [
                {
                  type: "link",
                  attrs: {
                    href: "https://example.com",
                    target: "_blank",
                    rel: "noopener noreferrer",
                  },
                },
              ],
              text: "link",
            },
          ],
        },
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Item" }],
                },
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
        {
          type: "image",
          attrs: { src: "https://example.com/a.jpg", alt: "alt text" },
        },
      ],
    });

    const { container } = render(
      <RichTextViewer value={value} className="custom-class" />,
    );

    expect(screen.getByRole("heading", { name: "Heading" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "link" })).toBeTruthy();
    expect(screen.getByText("Quote")).toBeTruthy();
    expect(screen.getByRole("img", { name: "alt text" })).toBeTruthy();
    expect(container.querySelector(".tiptap")).toBeTruthy();
    expect(container.querySelector(".custom-class")).toBeTruthy();
  });

  it("falls back to SafeHtml for legacy HTML strings", () => {
    render(
      <RichTextViewer value={"<h2>Legacy</h2><p><strong>Body</strong></p>"} />,
    );

    expect(screen.getByRole("heading", { name: "Legacy" })).toBeTruthy();
    expect(screen.getByText("Body")).toBeTruthy();
  });

  it("handles malformed or unsupported JSON safely", () => {
    const { container, rerender } = render(
      <RichTextViewer value='{"type":"doc","content":[{"type":"unknownNode"}]}' />,
    );

    expect(container.querySelector(".tiptap")).toBeTruthy();

    rerender(<RichTextViewer value='{"type":"doc"' />);
    expect(screen.getByText('{"type":"doc"')).toBeTruthy();
  });
});
