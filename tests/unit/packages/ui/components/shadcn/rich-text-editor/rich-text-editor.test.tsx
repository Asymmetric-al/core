/** @vitest-environment jsdom */

import React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  EditorContent,
  EditorRoot,
  useEditorContext,
} from "../../../../../../../packages/ui/components/shadcn/rich-text-editor";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function ContextProbe() {
  const { editor } = useEditorContext();
  return <div data-testid="has-editor">{String(Boolean(editor))}</div>;
}

function EditorSetContentProbe() {
  const { editor } = useEditorContext();
  return (
    <button
      type="button"
      onClick={() =>
        editor?.commands.setContent("<p>updated from command</p>", {
          emitUpdate: true,
        })
      }
    >
      set content
    </button>
  );
}

function EditorRoundTripProbe({
  onRoundTrip,
}: {
  onRoundTrip: (before: unknown, after: unknown) => void;
}) {
  const { editor } = useEditorContext();
  return (
    <button
      type="button"
      onClick={() => {
        if (!editor) return;
        const before = editor.getJSON();
        editor.commands.setContent(editor.getHTML());
        onRoundTrip(before, editor.getJSON());
      }}
    >
      round trip
    </button>
  );
}

describe("rich-text-editor/rich-text-editor", () => {
  it("mounts with immediate render disabled and renders editor content", () => {
    const onChange = vi.fn();
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <EditorRoot value="" onChange={onChange}>
        <EditorContent />
      </EditorRoot>,
    );

    expect(document.querySelector('[contenteditable="true"]')).toBeTruthy();
    expect(spy).not.toHaveBeenCalled();
  });

  it("initializes from JSON and legacy HTML input", async () => {
    const jsonValue = JSON.stringify({
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "json value" }] },
      ],
    });

    const onChange = vi.fn();
    const { rerender } = render(
      <EditorRoot value={jsonValue} onChange={onChange}>
        <EditorContent />
      </EditorRoot>,
    );

    expect(screen.getByText("json value")).toBeTruthy();

    rerender(
      <EditorRoot value="<p>legacy value</p>" onChange={onChange}>
        <EditorContent />
      </EditorRoot>,
    );

    await waitFor(() => {
      expect(screen.getByText("legacy value")).toBeTruthy();
    });
  });

  it("calls onChange with JSON when content changes", async () => {
    const onChange = vi.fn();

    render(
      <EditorRoot value="" onChange={onChange}>
        <EditorSetContentProbe />
        <EditorContent />
      </EditorRoot>,
    );
    screen.getByRole("button", { name: "set content" }).click();

    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
      expect(() =>
        JSON.parse(onChange.mock.calls.at(-1)?.[0] ?? ""),
      ).not.toThrow();
    });
  });

  it("preserves formatted stored content through a real JSON to HTML round trip", () => {
    const onRoundTrip = vi.fn();
    const value = JSON.stringify({
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Field update" }],
        },
        {
          type: "paragraph",
          content: [
            { type: "text", marks: [{ type: "bold" }], text: "News " },
            {
              type: "text",
              marks: [{ type: "link", attrs: { href: "https://example.com" } }],
              text: "Details",
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
                  content: [{ type: "text", text: "Prayer request" }],
                },
              ],
            },
          ],
        },
        {
          type: "image",
          attrs: { src: "https://example.com/photo.jpg", alt: "Field photo" },
        },
        { type: "paragraph", content: [{ type: "text", text: "Thank you" }] },
      ],
    });

    render(
      <EditorRoot value={value} onChange={vi.fn()}>
        <EditorRoundTripProbe onRoundTrip={onRoundTrip} />
        <EditorContent />
      </EditorRoot>,
    );
    screen.getByRole("button", { name: "round trip" }).click();

    const [before, after] = onRoundTrip.mock.calls[0] ?? [];
    expect(before).toBeDefined();
    expect(after).toEqual(before);
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe(
      "Field update",
    );
    expect(
      screen.getByRole("link", { name: "Details" }).getAttribute("href"),
    ).toBe("https://example.com");
    expect(JSON.stringify(after)).toContain("https://example.com/photo.jpg");
  });

  it("syncs external value changes and avoids update loops", async () => {
    const onChange = vi.fn();
    const initial = JSON.stringify({
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "one" }] },
      ],
    });
    const next = JSON.stringify({
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "two" }] },
      ],
    });

    const { rerender } = render(
      <EditorRoot value={initial} onChange={onChange}>
        <EditorContent />
      </EditorRoot>,
    );

    expect(screen.getByText("one")).toBeTruthy();

    rerender(
      <EditorRoot value={next} onChange={onChange}>
        <EditorContent />
      </EditorRoot>,
    );

    await waitFor(() => {
      expect(screen.getByText("two")).toBeTruthy();
    });

    expect(onChange).toHaveBeenCalledTimes(0);

    rerender(
      <EditorRoot value="" onChange={onChange}>
        <EditorContent />
      </EditorRoot>,
    );

    await waitFor(() => {
      expect(screen.queryByText("two")).toBeNull();
    });
  });

  it("respects disabled/editable transitions and classNames", async () => {
    const onChange = vi.fn();

    const { container, rerender } = render(
      <EditorRoot
        value=""
        onChange={onChange}
        disabled
        className="wrapper-class"
        editorClassName="editor-class"
        proseInvert={false}
      >
        <EditorContent />
      </EditorRoot>,
    );

    const root = container.querySelector(".wrapper-class");
    expect(root).toBeTruthy();
    const editor = container.querySelector(".editor-class");
    expect(editor).toBeTruthy();
    expect(editor?.className.includes("dark:prose-invert")).toBe(false);

    const disabledEditable = container.querySelector(
      '[contenteditable="false"]',
    );
    expect(disabledEditable).toBeTruthy();

    rerender(
      <EditorRoot value="" onChange={onChange} disabled={false}>
        <EditorContent />
      </EditorRoot>,
    );

    await waitFor(() => {
      expect(container.querySelector('[contenteditable="true"]')).toBeTruthy();
    });
  });

  it("provides editor context to child components", () => {
    render(
      <EditorRoot value="" onChange={vi.fn()}>
        <ContextProbe />
        <EditorContent />
      </EditorRoot>,
    );

    expect(screen.getByTestId("has-editor").textContent).toBe("true");
  });
});
