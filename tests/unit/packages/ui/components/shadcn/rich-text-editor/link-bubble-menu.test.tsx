/** @vitest-environment jsdom */

import React from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { flushSync } from "react-dom";

import { EditorContext } from "../../../../../../../packages/ui/components/shadcn/rich-text-editor/editor-context";
import { bubbleMenuShouldShowResults } from "../../../../../../../tests/mocks/tiptap-react-menus";

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

import { LinkBubbleMenu } from "../../../../../../../packages/ui/components/shadcn/rich-text-editor/link-bubble-menu";

function createEditor(overrides?: {
  href?: string;
  isEditable?: boolean;
  isLink?: boolean;
}) {
  const calls: string[] = [];
  const chain = {
    focus: () => chain,
    extendMarkRange: () => (calls.push("extendMarkRange"), chain),
    setLink: ({ href }: { href: string }) => (
      calls.push(`setLink:${href}`),
      chain
    ),
    unsetLink: () => (calls.push("unsetLink"), chain),
    run: () => (calls.push("run"), true),
  };

  const editor = {
    isEditable: overrides?.isEditable ?? true,
    isActive: (name: string) =>
      name === "link" ? (overrides?.isLink ?? true) : false,
    getAttributes: (name: string) =>
      name === "link" ? { href: overrides?.href ?? "https://example.com" } : {},
    chain: () => chain,
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
  bubbleMenuShouldShowResults.length = 0;
});

describe("rich-text-editor/link-bubble-menu", () => {
  it("does not render without an active link", () => {
    const { editor } = createEditor({ isLink: false });

    render(
      <EditorContext.Provider value={{ editor: editor as never }}>
        <LinkBubbleMenu />
      </EditorContext.Provider>,
    );

    expect(screen.queryByTestId("bubble-menu")).toBeNull();
  });

  it("renders preview with safe href and supports open/edit/remove", async () => {
    const { editor, calls } = createEditor({ href: "example.com" });

    render(
      <EditorContext.Provider value={{ editor: editor as never }}>
        <LinkBubbleMenu />
      </EditorContext.Provider>,
    );

    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe("https://example.com/");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toContain("noopener");

    fireEvent.click(screen.getByLabelText("Edit link"));
    const input = screen.getByLabelText("Edit link URL");
    expect((input as HTMLInputElement).value).toBe("example.com");

    fireEvent.change(input, { target: { value: "https://new.example.com" } });
    fireEvent.click(screen.getByLabelText("Save link"));

    await waitFor(() => {
      expect(
        calls.some((call) =>
          call.startsWith("setLink:https://new.example.com"),
        ),
      ).toBe(true);
    });

    fireEvent.click(screen.getByLabelText("Remove link"));
    expect(calls).toContain("unsetLink");
  });

  it("rejects invalid edits, keeps focus, and supports cancel", async () => {
    const { editor, calls } = createEditor({ href: "https://example.com" });

    render(
      <EditorContext.Provider value={{ editor: editor as never }}>
        <LinkBubbleMenu />
      </EditorContext.Provider>,
    );

    fireEvent.click(screen.getByLabelText("Edit link"));
    const input = screen.getByLabelText("Edit link URL") as HTMLInputElement;
    await waitFor(() => {
      expect(input.value).toBe("https://example.com");
    });
    flushSync(() => {
      fireEvent.change(input, { target: { value: "javascript:alert(1)" } });
    });
    fireEvent.click(screen.getByLabelText("Save link"));

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith("Please enter a valid URL");
    });
    expect(document.activeElement).toBe(input);

    fireEvent.click(screen.getByLabelText("Cancel link edit"));
    expect(screen.queryByLabelText("Edit link URL")).toBeNull();
    expect(calls).not.toContain("setLink:javascript:alert(1)");
  });

  it("shouldShow requires editable + focused + active link", () => {
    const { editor: readOnlyEditor } = createEditor({
      isEditable: false,
      isLink: true,
    });
    render(
      <EditorContext.Provider value={{ editor: readOnlyEditor as never }}>
        <LinkBubbleMenu />
      </EditorContext.Provider>,
    );

    expect(bubbleMenuShouldShowResults.some((v) => v === false)).toBe(true);
  });
});
