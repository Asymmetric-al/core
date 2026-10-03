/** @vitest-environment jsdom */

import React from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  EditorContent,
  EditorRoot,
  LegacyRichTextEditor,
  useEditorContext,
  type Editor,
} from "@asym/ui/components/shadcn/rich-text-editor";
import { buildMentionExtension } from "../../../../apps/admin/features/support-hub/components/detail/composer/extensions/mention-suggestion";
import { SupportTipTapEditor } from "../../../../apps/admin/features/support-hub/components/detail/composer/SupportTipTapEditor";

const agents = [
  {
    id: "agent-morgan",
    name: "Morgan",
    email: "morgan@example.test",
    avatarUrl: null,
    title: "Care",
  },
  {
    id: "agent-riley",
    name: "Riley",
    email: "riley@example.test",
    avatarUrl: null,
    title: "Care",
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
  // jsdom has no text layout; editor/plugin, focus, events and DOM stay real.
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

async function mountEditor() {
  let instance: Editor | undefined;
  const capture = (editor: Editor) => {
    instance = editor;
  };
  const selected = vi.fn();
  const extensions = [buildMentionExtension({ agents, onMention: selected })];
  const view = render(
    <EditorRoot value="" onChange={vi.fn()} extraExtensions={extensions}>
      <CaptureEditor capture={capture} />
      <EditorContent />
    </EditorRoot>,
  );
  await waitFor(() => expect(instance).toBeDefined());
  const editable = view.container.querySelector<HTMLDivElement>(
    '[contenteditable="true"]',
  );
  if (!instance || !editable)
    throw new Error("Real Tiptap editor did not initialize");
  return { view, editable, editor: instance, selected };
}

async function openSuggestions(editor: Editor, editable: HTMLElement) {
  await act(async () => {
    editable.focus();
    editor.commands.insertContent("@");
  });
  return screen.findByRole("listbox");
}

function ControlledEditor({ capture }: { capture: (editor: Editor) => void }) {
  const [value, setValue] = React.useState("");
  const extensions = React.useMemo(
    () => [buildMentionExtension({ agents })],
    [],
  );
  return (
    <EditorRoot value={value} onChange={setValue} extraExtensions={extensions}>
      <CaptureEditor capture={capture} />
      <EditorContent />
    </EditorRoot>
  );
}

function ControlledLegacyEditor() {
  const [value, setValue] = React.useState("");
  return (
    <LegacyRichTextEditor
      aria-label="Ministry post content"
      value={value}
      onChange={setValue}
      onImageClick={() => {}}
    />
  );
}

afterEach(async () => {
  cleanup();
  await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
  vi.restoreAllMocks();
  for (const [name, descriptor] of [
    ["getBoundingClientRect", rangeRectDescriptor],
    ["getClientRects", rangeRectsDescriptor],
  ] as const) {
    if (descriptor) Object.defineProperty(Range.prototype, name, descriptor);
    else Reflect.deleteProperty(Range.prototype, name);
  }
});

describe("Support real Tiptap suggestion focus", () => {
  it("forwards the legacy adapter's meaningful name through controlled editing", async () => {
    const { container } = render(<ControlledLegacyEditor />);
    const host = container.querySelector<HTMLElement>(
      '[contenteditable="true"]',
    );
    if (!host) throw new Error("Actual legacy editable host did not mount");
    expect(host.getAttribute("aria-label")).toBe("Ministry post content");
    const editable = screen.getByRole("textbox", {
      name: "Ministry post content",
    });
    editable.focus();
    fireEvent.keyDown(editable, { key: "Enter" });
    await waitFor(() => expect(editable.querySelectorAll("p")).toHaveLength(2));
    expect(screen.getByRole("textbox", { name: "Ministry post content" })).toBe(
      editable,
    );
  });
  it.each(["reply", "note"] as const)(
    "names the actual %s composer editable host",
    async (tone) => {
      render(<SupportTipTapEditor value="" onChange={vi.fn()} tone={tone} />);
      const editable = await screen.findByRole("textbox", {
        name: tone === "reply" ? "Reply message" : "Internal note",
      });
      expect(editable.getAttribute("contenteditable")).toBe("true");
      expect(editable.getAttribute("aria-multiline")).toBe("true");
    },
  );
  it("preserves the actual controlled editor textbox role across option updates", async () => {
    let editor: Editor | undefined;
    const capture = (instance: Editor) => {
      editor = instance;
    };
    const view = render(<ControlledEditor capture={capture} />);
    await waitFor(() => expect(editor).toBeDefined());
    const editable = view.container.querySelector<HTMLDivElement>(
      '[contenteditable="true"]',
    );
    if (!editor || !editable)
      throw new Error("Actual controlled editor did not mount");
    await act(async () => {
      editable.focus();
      editor?.commands.insertContent("@");
    });
    await screen.findByRole("listbox");
    expect(editable.getAttribute("role")).toBe("textbox");
    expect(editable.getAttribute("aria-controls")).toBe(
      screen.getByRole("listbox").id,
    );
    fireEvent.keyDown(editable, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
    await act(async () => {
      fireEvent.keyDown(editable, { key: "Enter" });
    });
    expect(editor.getJSON().content).toHaveLength(2);
    expect(editable.getAttribute("aria-multiline")).toBe("true");
  });
  it("keeps keyboard focus in the editor and connects its active option to a named popup", async () => {
    const { editor, editable, selected } = await mountEditor();
    const listbox = await openSuggestions(editor, editable);
    expect(document.activeElement).toBe(editable);
    expect(editable.getAttribute("aria-controls")).toBeTruthy();
    expect(editable.getAttribute("aria-controls")).toBe(listbox.id);
    expect(screen.getByRole("listbox", { name: "Mention agent" })).toBe(
      listbox,
    );
    const first = screen.getByRole("option", { name: "Morgan Care" });
    expect(editable.getAttribute("aria-activedescendant")).toBe(first.id);
    fireEvent.keyDown(editable, { key: "ArrowDown" });
    const second = screen.getByRole("option", { name: "Riley Care" });
    await waitFor(() =>
      expect(editable.getAttribute("aria-activedescendant")).toBe(second.id),
    );
    expect(document.activeElement).toBe(editable);
    fireEvent.keyDown(editable, { key: "Enter" });
    await waitFor(() => expect(selected).toHaveBeenCalledWith(agents[1]));
    expect(editor.getJSON().content?.[0]?.content?.[0]?.attrs).toMatchObject({
      id: "agent-riley",
      label: "Riley",
    });
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
    expect(editable.hasAttribute("aria-controls")).toBe(false);
    expect(editable.hasAttribute("aria-activedescendant")).toBe(false);
  });

  it("restores preexisting editor attributes on Escape and editor unmount", async () => {
    const { view, editor, editable } = await mountEditor();
    const previous = {
      "aria-autocomplete": "both",
      "aria-controls": "previous-popup",
      "aria-activedescendant": "previous-option",
    };
    for (const [name, value] of Object.entries(previous))
      editable.setAttribute(name, value);
    await openSuggestions(editor, editable);
    expect(editable.getAttribute("aria-controls")).not.toBe(
      previous["aria-controls"],
    );
    fireEvent.keyDown(editable, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
    expect(document.activeElement).toBe(editable);
    for (const [name, value] of Object.entries(previous))
      expect(editable.getAttribute(name)).toBe(value);
    await act(async () => {
      editor.commands.clearContent();
    });
    await openSuggestions(editor, editable);
    view.unmount();
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
    for (const [name, value] of Object.entries(previous))
      expect(editable.getAttribute(name)).toBe(value);
  });

  it("clears the active reference for no matches and preserves attributes taken over by another editor feature", async () => {
    const { editor, editable } = await mountEditor();
    await openSuggestions(editor, editable);
    await act(async () => {
      editor.commands.insertContent("zzzz");
    });
    await screen.findByText("No agent matches.");
    await waitFor(() =>
      expect(editable.hasAttribute("aria-activedescendant")).toBe(false),
    );
    expect(editable.getAttribute("aria-controls")).toBe(
      screen.getByRole("listbox").id,
    );
    editable.setAttribute("aria-controls", "another-feature-popup");
    fireEvent.keyDown(editable, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
    expect(editable.getAttribute("aria-controls")).toBe(
      "another-feature-popup",
    );
    expect(editable.hasAttribute("aria-autocomplete")).toBe(false);
  });
});
