/** @vitest-environment jsdom */

import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const toastError = vi.fn();

vi.mock("@tiptap/react", () => ({
  useEditorState: ({ editor, selector }: { editor: unknown; selector: (arg: { editor: unknown }) => unknown }) =>
    selector({ editor }),
}));

vi.mock("sonner", () => ({
  toast: { error: (...args: unknown[]) => toastError(...args) },
}));

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
}) {
  const calls: string[] = [];

  const chainState: Record<string, unknown> = {
    focus: () => chain,
    toggleBold: () => (calls.push("toggleBold"), chain),
    toggleItalic: () => (calls.push("toggleItalic"), chain),
    toggleUnderline: () => (calls.push("toggleUnderline"), chain),
    toggleHeading: ({ level }: { level: number }) => (calls.push(`toggleHeading:${level}`), chain),
    toggleBlockquote: () => (calls.push("toggleBlockquote"), chain),
    toggleBulletList: () => (calls.push("toggleBulletList"), chain),
    toggleOrderedList: () => (calls.push("toggleOrderedList"), chain),
    extendMarkRange: () => (calls.push("extendMarkRange"), chain),
    setLink: ({ href }: { href: string }) => (calls.push(`setLink:${href}`), chain),
    unsetLink: () => (calls.push("unsetLink"), chain),
    setImage: ({ src }: { src: string }) => (calls.push(`setImage:${src}`), chain),
    undo: () => (calls.push("undo"), chain),
    redo: () => (calls.push("redo"), chain),
    run: () => (calls.push("run"), true),
  };

  const chain = chainState as ChainMock;

  const isActive = overrides?.isActive ?? {};

  const editor = {
    chain: () => chain,
    isActive: (name: string, attrs?: { level?: number }) => {
      if (name === "heading") return Boolean(isActive[`heading:${attrs?.level}`]);
      return Boolean(isActive[name]);
    },
    can: () => ({
      undo: () => overrides?.canUndo ?? true,
      redo: () => overrides?.canRedo ?? true,
    }),
    getAttributes: () => ({ href: overrides?.href }),
  };

  return { editor, calls };
}

afterEach(() => {
  cleanup();
  toastError.mockReset();
});

describe("rich-text-editor/toolbar", () => {
  it("renders default tools and hides image without image handlers", () => {
    const { editor } = createEditorMock();
    render(<EditorToolbar editor={editor as never} />);

    expect(screen.getByLabelText("Bold (Ctrl+B)")).toBeTruthy();
    expect(screen.queryByLabelText("Insert image")).toBeNull();
    expect(screen.queryByLabelText("Upload image")).toBeNull();
  });

  it("respects tools prop and command wiring for text/list/history actions", () => {
    const { editor, calls } = createEditorMock({ canUndo: false, canRedo: false });

    render(
      <EditorToolbar
        editor={editor as never}
        tools={["bold", "italic", "underline", "heading", "blockquote", "bulletList", "orderedList", "undo", "redo"]}
      />,
    );

    fireEvent.click(screen.getByLabelText("Bold (Ctrl+B)"));
    fireEvent.click(screen.getByLabelText("Italic (Ctrl+I)"));
    fireEvent.click(screen.getByLabelText("Underline (Ctrl+U)"));
    fireEvent.click(screen.getByLabelText("Heading 1"));
    fireEvent.click(screen.getByLabelText("Heading 2"));
    fireEvent.click(screen.getByLabelText("Quote"));
    fireEvent.click(screen.getByLabelText("Bullet List"));
    fireEvent.click(screen.getByLabelText("Numbered List"));

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

    expect(screen.getByLabelText("Undo (Ctrl+Z)").getAttribute("data-disabled")).toBe("");
    expect(screen.getByLabelText("Redo (Ctrl+Shift+Z)").getAttribute("data-disabled")).toBe("");
  });

  it("supports link add/update/remove and rejects invalid links", async () => {
    const { editor, calls } = createEditorMock({ href: "https://example.com" });

    render(<EditorToolbar editor={editor as never} tools={["link"]} />);

    fireEvent.click(screen.getByLabelText("Add link"));

    const input = screen.getByLabelText("Link URL");
    fireEvent.change(input, { target: { value: "example.org/path" } });
    fireEvent.click(screen.getByRole("button", { name: "Update" }));

    await waitFor(() => {
      expect(calls).toContain("setLink:https://example.org/path");
    });

    fireEvent.click(screen.getByLabelText("Add link"));
    fireEvent.change(screen.getByLabelText("Link URL"), {
      target: { value: "javascript:alert(1)" },
    });
    fireEvent.submit(screen.getByLabelText("Link URL").closest("form") as HTMLFormElement);

    expect(toastError).toHaveBeenCalled();

    fireEvent.click(screen.getByLabelText("Remove link"));
    expect(calls).toContain("unsetLink");
  });

  it("supports image click and upload flows, with upload errors surfaced", async () => {
    const { editor, calls } = createEditorMock();
    const onImageClick = vi.fn();

    const { rerender, container } = render(
      <EditorToolbar editor={editor as never} onImageClick={onImageClick} tools={["image"]} />,
    );

    fireEvent.click(screen.getByLabelText("Insert image"));
    expect(onImageClick).toHaveBeenCalledTimes(1);

    const onImageUpload = vi.fn().mockResolvedValue("https://cdn.example.com/img.png");
    rerender(
      <EditorToolbar editor={editor as never} onImageUpload={onImageUpload} tools={["image"]} />,
    );

    const uploadInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["abc"], "avatar.png", { type: "image/png" });
    fireEvent.change(uploadInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(onImageUpload).toHaveBeenCalledWith(file);
      expect(calls).toContain("setImage:https://cdn.example.com/img.png");
      expect(uploadInput.value).toBe("");
    });

    const failingUpload = vi.fn().mockRejectedValue(new Error("upload failed"));
    rerender(
      <EditorToolbar editor={editor as never} onImageUpload={failingUpload} tools={["image"]} />,
    );

    fireEvent.change(container.querySelector('input[type="file"]') as HTMLInputElement, {
      target: { files: [file] },
    });

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith("upload failed");
    });
  });
});
