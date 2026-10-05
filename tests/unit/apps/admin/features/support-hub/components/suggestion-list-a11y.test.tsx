/** @vitest-environment jsdom */

import {
  EditorContent,
  EditorRoot,
  useEditorContext,
  type Editor,
} from "@asym/ui/components/shadcn/rich-text-editor";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { buildMentionExtension } from "../../../../../../../apps/admin/features/support-hub/components/detail/composer/extensions/mention-suggestion";

const agents = [
  {
    id: "alice",
    name: "Alice",
    email: "alice@example.test",
    avatarUrl: null,
    title: null,
  },
  {
    id: "bob",
    name: "Bob",
    email: "bob@example.test",
    avatarUrl: null,
    title: null,
  },
];
const rangeRectDescriptor = Object.getOwnPropertyDescriptor(
  Range.prototype,
  "getBoundingClientRect",
);
const rangeRectsDescriptor = Object.getOwnPropertyDescriptor(
  Range.prototype,
  "getClientRects",
);

beforeEach(() => {
  // jsdom has no text layout; the editor, suggestion renderer and DOM stay real.
  Object.defineProperty(Range.prototype, "getBoundingClientRect", {
    configurable: true,
    value: () => new DOMRect(),
  });
  Object.defineProperty(Range.prototype, "getClientRects", {
    configurable: true,
    value: () => document.createElement("span").getClientRects(),
  });
});

function CaptureEditor({ capture }: { capture: (editor: Editor) => void }) {
  const { editor } = useEditorContext();
  React.useEffect(() => {
    if (editor) capture(editor);
  }, [capture, editor]);
  return null;
}

afterEach(async () => {
  cleanup();
  await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
  for (const [name, descriptor] of [
    ["getBoundingClientRect", rangeRectDescriptor],
    ["getClientRects", rangeRectsDescriptor],
  ] as const) {
    if (descriptor) Object.defineProperty(Range.prototype, name, descriptor);
    else Reflect.deleteProperty(Range.prototype, name);
  }
});

describe("SuggestionList active option exposure", () => {
  it("connects the focused editor to the highlighted option and updates keyboard selection", async () => {
    let editor: Editor | undefined;
    const capture = (instance: Editor) => {
      editor = instance;
    };
    const selected = vi.fn();
    const extensions = [buildMentionExtension({ agents, onMention: selected })];
    render(
      <EditorRoot
        aria-label="Reply message"
        value=""
        onChange={vi.fn()}
        extraExtensions={extensions}
      >
        <CaptureEditor capture={capture} />
        <EditorContent />
      </EditorRoot>,
    );
    await waitFor(() => expect(editor).toBeDefined());
    const focusOwner = screen.getByRole("textbox", { name: "Reply message" });
    await act(async () => {
      focusOwner.focus();
      editor?.commands.insertContent("@");
    });

    const listbox = await screen.findByRole("listbox", {
      name: "Mention agent",
    });
    const activeOption = screen.getByRole("option", { name: "Alice" });
    const nextOption = screen.getByRole("option", { name: "Bob" });

    expect(activeOption.id).toBeTruthy();
    expect(document.getElementById(activeOption.id)).toBe(activeOption);
    expect(nextOption.id).not.toBe(activeOption.id);
    expect(document.activeElement).toBe(focusOwner);
    expect(focusOwner.getAttribute("aria-controls")).toBe(listbox.id);
    expect(focusOwner.getAttribute("aria-activedescendant")).toBe(
      activeOption.id,
    );
    expect(listbox.hasAttribute("aria-activedescendant")).toBe(false);
    expect(activeOption.getAttribute("aria-selected")).toBe("true");
    expect(nextOption.getAttribute("aria-selected")).toBe("false");

    fireEvent.keyDown(focusOwner, { key: "ArrowDown" });
    await waitFor(() =>
      expect(focusOwner.getAttribute("aria-activedescendant")).toBe(
        nextOption.id,
      ),
    );
    expect(nextOption.getAttribute("aria-selected")).toBe("true");
    expect(activeOption.getAttribute("aria-selected")).toBe("false");
    expect(document.activeElement).toBe(focusOwner);
    fireEvent.keyDown(focusOwner, { key: "Enter" });
    await waitFor(() => expect(selected).toHaveBeenCalledWith(agents[1]));
    expect(focusOwner.textContent).toContain("Bob");
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
  });
});
