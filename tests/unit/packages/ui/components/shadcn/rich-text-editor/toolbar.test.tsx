/** @vitest-environment jsdom */

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import React from "react";
import { flushSync } from "react-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

const { toastError } = vi.hoisted(() => ({
  toastError: vi.fn(),
}));

vi.mock("@tiptap/react", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@tiptap/react")>();
  return {
    ...mod,
    useEditorState: ({
      editor,
      selector,
    }: {
      editor: unknown;
      selector: (arg: { editor: unknown }) => unknown;
    }) => selector({ editor }),
  };
});

vi.mock("sonner", async (importOriginal) => {
  const actual = await importOriginal<typeof import("sonner")>();
  Object.assign(actual.toast, {
    error: (...args: unknown[]) => toastError(...args),
  });
  return actual;
});

import { EditorToolbar } from "../../../../../../../packages/ui/components/shadcn/rich-text-editor/toolbar";

type ChainMock = {
  focus: () => ChainMock;
  [key: string]: unknown;
};

function createEditorMock(overrides?: {
  isActive?: Record<string, boolean>;
  canUndo?: boolean;
  canRedo?: boolean;
  href?: string;
  editable?: boolean;
  selectionEmpty?: boolean;
}) {
  const calls: string[] = [];

  const chainState: Record<string, unknown> = {
    focus: () => chain,
    toggleBold: () => (calls.push("toggleBold"), chain),
    toggleItalic: () => (calls.push("toggleItalic"), chain),
    toggleUnderline: () => (calls.push("toggleUnderline"), chain),
    toggleHeading: ({ level }: { level: number }) => (
      calls.push(`toggleHeading:${level}`),
      chain
    ),
    toggleBlockquote: () => (calls.push("toggleBlockquote"), chain),
    toggleBulletList: () => (calls.push("toggleBulletList"), chain),
    toggleOrderedList: () => (calls.push("toggleOrderedList"), chain),
    extendMarkRange: () => (calls.push("extendMarkRange"), chain),
    setLink: ({ href }: { href: string }) => (
      calls.push(`setLink:${href}`),
      chain
    ),
    unsetLink: () => (calls.push("unsetLink"), chain),
    insertContent: (content: {
      text: string;
      marks: { attrs: { href: string } }[];
    }) => (
      calls.push(
        `insertLinkedText:${content.text}->${content.marks[0]?.attrs.href}`,
      ),
      chain
    ),
    setImage: ({ src }: { src: string }) => (
      calls.push(`setImage:${src}`),
      chain
    ),
    undo: () => (calls.push("undo"), chain),
    redo: () => (calls.push("redo"), chain),
    run: () => (calls.push("run"), true),
  };

  const chain = chainState as ChainMock;

  const isActive = overrides?.isActive ?? {};

  const editor = {
    chain: () => chain,
    isActive: (name: string, attrs?: { level?: number }) => {
      if (name === "heading")
        return Boolean(isActive[`heading:${attrs?.level}`]);
      return Boolean(isActive[name]);
    },
    can: () => ({
      undo: () => overrides?.canUndo ?? true,
      redo: () => overrides?.canRedo ?? true,
    }),
    getAttributes: (name: string) =>
      name === "link" ? { href: overrides?.href } : {},
    isEditable: overrides?.editable ?? true,
    state: { selection: { empty: overrides?.selectionEmpty ?? false } },
    view: { dom: document.createElement("div") },
    isDestroyed: false,
    on: (_event: string, _fn: () => void) => () => {},
    off: () => {},
    registerPlugin: () => {},
    unregisterPlugin: () => {},
  };

  return { editor, calls };
}

afterEach(() => {
  cleanup();
  toastError.mockReset();
});

describe("rich-text-editor/toolbar", () => {
  it("provides one named toolbar with arrow navigation across control groups", async () => {
    const { editor } = createEditorMock();
    render(
      <EditorToolbar
        editor={editor as never}
        tools={["bold", "italic", "link", "image"]}
        onImageClick={() => {}}
      />,
    );
    expect(
      screen.getByRole("toolbar", { name: "Text formatting" }),
    ).toBeTruthy();
    const bold = screen.getByRole("button", { name: "Bold" });
    bold.focus();
    fireEvent.keyDown(bold, { key: "ArrowRight" });
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Italic" }),
      ),
    );
    fireEvent.keyDown(document.activeElement!, { key: "ArrowRight" });
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Add link" }),
      ),
    );
    fireEvent.keyDown(document.activeElement!, { key: "ArrowRight" });
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Insert image" }),
      ),
    );
    expect(
      screen.getAllByRole("button").filter((button) => button.tabIndex === 0),
    ).toHaveLength(1);
  });

  it("wraps its tools onto more lines instead of hiding them off-screen", () => {
    const { editor } = createEditorMock();
    render(
      <EditorToolbar
        editor={editor as never}
        tools={["bold", "italic", "link", "image", "undo", "redo"]}
        onImageClick={() => {}}
      />,
    );
    const toolbar = screen.getByRole("toolbar", { name: "Text formatting" });
    const row = toolbar.querySelector("[data-toolbar-row]");
    expect(row?.className).toContain("flex-wrap");
    expect(row?.contains(screen.getByRole("button", { name: "Undo" }))).toBe(
      true,
    );
    expect(toolbar.closest("[data-slot=scroll-area]")).toBeNull();
  });

  it("exposes history commands as actions and blocks disabled activation", () => {
    const { editor, calls } = createEditorMock({
      canUndo: false,
      canRedo: false,
    });
    render(<EditorToolbar editor={editor as never} tools={["undo", "redo"]} />);
    const undo = screen.getByRole("button", { name: "Undo" });
    expect(undo.hasAttribute("aria-pressed")).toBe(false);
    fireEvent.click(undo);
    expect(calls).not.toContain("undo");
  });
  it("names each control plainly and announces its keyboard shortcut", () => {
    const { editor } = createEditorMock();
    render(
      <EditorToolbar
        editor={editor as never}
        tools={["bold", "heading", "bulletList", "redo"]}
      />,
    );
    // jsdom reports a non-Apple platform, so shortcuts use Control.
    expect(
      screen
        .getByRole("button", { name: "Bold" })
        .getAttribute("aria-keyshortcuts"),
    ).toBe("Control+B");
    expect(
      screen
        .getByRole("button", { name: "Heading 1" })
        .getAttribute("aria-keyshortcuts"),
    ).toBe("Control+Alt+1");
    expect(
      screen
        .getByRole("button", { name: "Bullet list" })
        .getAttribute("aria-keyshortcuts"),
    ).toBe("Control+Shift+8");
    expect(
      screen
        .getByRole("button", { name: "Redo" })
        .getAttribute("aria-keyshortcuts"),
    ).toBe("Control+Shift+Z");
  });

  it("renders default tools and hides image without image handlers", () => {
    const { editor } = createEditorMock();
    render(<EditorToolbar editor={editor as never} />);

    expect(screen.getByLabelText("Bold")).toBeTruthy();
    expect(screen.queryByLabelText("Insert image")).toBeNull();
    expect(screen.queryByLabelText("Upload image")).toBeNull();
  });

  it("respects tools prop and command wiring for text/list/history actions", () => {
    const { editor, calls } = createEditorMock({
      canUndo: false,
      canRedo: false,
    });

    render(
      <EditorToolbar
        editor={editor as never}
        tools={[
          "bold",
          "italic",
          "underline",
          "heading",
          "blockquote",
          "bulletList",
          "orderedList",
          "undo",
          "redo",
        ]}
      />,
    );

    fireEvent.click(screen.getByLabelText("Bold"));
    fireEvent.click(screen.getByLabelText("Italic"));
    fireEvent.click(screen.getByLabelText("Underline"));
    fireEvent.click(screen.getByLabelText("Heading 1"));
    fireEvent.click(screen.getByLabelText("Heading 2"));
    fireEvent.click(screen.getByLabelText("Quote"));
    fireEvent.click(screen.getByLabelText("Bullet list"));
    fireEvent.click(screen.getByLabelText("Numbered list"));

    expect(calls).toEqual(
      expect.arrayContaining([
        "toggleBold",
        "toggleItalic",
        "toggleUnderline",
        "toggleHeading:1",
        "toggleHeading:2",
        "toggleBlockquote",
        "toggleBulletList",
        "toggleOrderedList",
      ]),
    );

    expect(screen.getByLabelText("Undo").getAttribute("data-disabled")).toBe(
      "",
    );
    expect(screen.getByLabelText("Redo").getAttribute("data-disabled")).toBe(
      "",
    );
  });

  it("supports link add/update/remove and rejects invalid links", async () => {
    const { editor, calls } = createEditorMock({ href: "https://example.com" });

    render(<EditorToolbar editor={editor as never} tools={["link"]} />);

    fireEvent.click(screen.getByLabelText("Add link"));

    const input = screen.getByLabelText("Link URL");
    fireEvent.change(input, { target: { value: "example.org/path" } });
    fireEvent.click(screen.getByRole("button", { name: "Save link" }));

    await waitFor(() => {
      expect(calls).toContain("setLink:https://example.org/path");
    });

    fireEvent.click(screen.getByLabelText("Add link"));
    await waitFor(() => {
      expect(
        (screen.getByLabelText("Link URL") as HTMLInputElement).value,
      ).toBe("https://example.com");
    });
    flushSync(() => {
      fireEvent.change(screen.getByLabelText("Link URL"), {
        target: { value: "javascript:alert(1)" },
      });
    });
    fireEvent.submit(
      screen.getByLabelText("Link URL").closest("form") as HTMLFormElement,
    );

    const error = await screen.findByRole("alert");
    expect(error.textContent).toBe(
      "Enter a web address, like https://example.org",
    );
    expect(screen.getByLabelText("Link URL").getAttribute("aria-invalid")).toBe(
      "true",
    );
    expect(calls).not.toContain("setLink:javascript:alert(1)");

    fireEvent.click(screen.getByRole("button", { name: "Remove link" }));
    expect(calls).toContain("unsetLink");
  });

  it("supports image click and upload flows, with upload errors surfaced", async () => {
    const { editor, calls } = createEditorMock();
    const onImageClick = vi.fn();

    const { rerender, container } = render(
      <EditorToolbar
        editor={editor as never}
        onImageClick={onImageClick}
        tools={["image"]}
      />,
    );

    fireEvent.click(screen.getByLabelText("Insert image"));
    expect(onImageClick).toHaveBeenCalledTimes(1);

    const onImageUpload = vi
      .fn()
      .mockResolvedValue("https://cdn.example.com/img.png");
    rerender(
      <EditorToolbar
        editor={editor as never}
        onImageUpload={onImageUpload}
        tools={["image"]}
      />,
    );

    const uploadInput = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["abc"], "avatar.png", { type: "image/png" });
    fireEvent.change(uploadInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(onImageUpload).toHaveBeenCalledWith(file);
      expect(calls).toContain("setImage:https://cdn.example.com/img.png");
      expect(uploadInput.value).toBe("");
    });

    const failingUpload = vi.fn().mockRejectedValue(new Error("upload failed"));
    rerender(
      <EditorToolbar
        editor={editor as never}
        onImageUpload={failingUpload}
        tools={["image"]}
      />,
    );

    const file2 = new File(["xyz"], "avatar2.png", { type: "image/png" });
    fireEvent.change(
      container.querySelector('input[type="file"]') as HTMLInputElement,
      {
        target: { files: [file2] },
      },
    );

    await waitFor(() => {
      expect(failingUpload).toHaveBeenCalledWith(file2);
      expect(toastError).toHaveBeenCalledWith("upload failed");
    });
  });

  it("names each control plainly and exposes its keyboard shortcut", () => {
    const { editor } = createEditorMock();
    render(<EditorToolbar editor={editor as never} tools={["bold", "redo"]} />);

    expect(
      screen
        .getByRole("button", { name: "Bold" })
        .getAttribute("aria-keyshortcuts"),
    ).toBe("Control+B");
    expect(
      screen
        .getByRole("button", { name: "Redo" })
        .getAttribute("aria-keyshortcuts"),
    ).toBe("Control+Shift+Z");
  });

  it("shows the active format as pressed without a primary fill", () => {
    const { editor } = createEditorMock({ isActive: { bold: true } });
    render(
      <EditorToolbar editor={editor as never} tools={["bold", "italic"]} />,
    );

    const bold = screen.getByRole("button", { name: "Bold" });
    expect(bold.getAttribute("aria-pressed")).toBe("true");
    expect(bold.className).not.toContain("bg-primary");
    expect(
      screen
        .getByRole("button", { name: "Italic" })
        .getAttribute("aria-pressed"),
    ).toBe("false");
  });

  it("turns every control off while the editor cannot be edited", () => {
    const { editor, calls } = createEditorMock({ editable: false });
    render(
      <EditorToolbar
        editor={editor as never}
        tools={["bold", "bulletList", "link", "undo"]}
      />,
    );

    for (const name of ["Bold", "Bullet list", "Add link", "Undo"]) {
      expect(
        screen.getByRole("button", { name }).hasAttribute("data-disabled"),
      ).toBe(true);
    }
    fireEvent.click(screen.getByRole("button", { name: "Bold" }));
    expect(calls).not.toContain("toggleBold");
  });

  it("inserts the address as linked text when nothing is selected", async () => {
    const { editor, calls } = createEditorMock({ selectionEmpty: true });
    render(<EditorToolbar editor={editor as never} tools={["link"]} />);

    fireEvent.click(screen.getByRole("button", { name: "Add link" }));
    fireEvent.change(await screen.findByLabelText("Link URL"), {
      target: { value: "example.org" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save link" }));

    await waitFor(() => {
      expect(calls).toContain(
        "insertLinkedText:example.org->https://example.org/",
      );
    });
    expect(calls.some((call) => call.startsWith("setLink:"))).toBe(false);
  });

  it("opens the link form with Ctrl+K from the text", async () => {
    const { editor } = createEditorMock();
    render(<EditorToolbar editor={editor as never} tools={["link"]} />);

    fireEvent.keyDown(editor.view.dom, { key: "k", ctrlKey: true });

    expect(await screen.findByLabelText("Link URL")).toBeTruthy();
  });

  it("draws its divider above the content when placed at the bottom", () => {
    const { editor } = createEditorMock();
    const { container, rerender } = render(
      <EditorToolbar editor={editor as never} tools={["bold"]} />,
    );
    const bar = () =>
      container.querySelector('[data-slot="editor-toolbar"]') as HTMLElement;
    expect(bar().className.split(" ")).toEqual(
      expect.arrayContaining(["sticky", "border-b"]),
    );

    rerender(
      <EditorToolbar
        editor={editor as never}
        tools={["bold"]}
        position="bottom"
      />,
    );
    expect(bar().className.split(" ")).toContain("border-t");
    expect(bar().className.split(" ")).not.toContain("sticky");
  });
});
