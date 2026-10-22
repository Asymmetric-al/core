/** @vitest-environment jsdom */

import {
  PdfEditor,
  type PdfEditorRef,
  ReactEmailStarterKitReference,
} from "@asym/pdf-editor";
import { act, cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { EditorAccessibility } from "../../../../../packages/ui/components/studio/editor-accessibility";

afterEach(cleanup);

async function renderEditor() {
  let reference: PdfEditorRef | undefined;
  render(
    <PdfEditor
      content="<p>Reviewed wording</p>"
      extensions={[
        ReactEmailStarterKitReference,
        EditorAccessibility.configure({ label: "PDF document" }),
      ]}
      onReady={(ready) => {
        reference = ready;
      }}
    />,
  );
  await waitFor(() => expect(reference?.editor).toBeDefined());
  const editor = reference?.editor;
  if (!editor) throw new Error("Public editor did not become ready");
  return editor;
}

describe("editor accessibility boundary", () => {
  it("keeps its name through option updates without changing content, selection, attributes or key handlers", async () => {
    const editor = await renderEditor();
    const keydown = vi.fn(() => false);
    const before = editor.getJSON();
    await act(async () => {
      editor.commands.setTextSelection(5);
      editor.setOptions({
        editorProps: {
          attributes: {
            class: "authored-editor",
            lang: "fr",
            spellcheck: "false",
          },
          handleKeyDown: keydown,
        },
      });
    });
    expect(editor.view.dom.getAttribute("aria-label")).toBe("PDF document");
    expect(editor.view.dom.getAttribute("aria-multiline")).toBe("true");
    expect(editor.view.dom.classList.contains("authored-editor")).toBe(true);
    expect(editor.view.dom.getAttribute("lang")).toBe("fr");
    expect(editor.view.dom.getAttribute("spellcheck")).toBe("false");
    expect(editor.options.editorProps.handleKeyDown).toBe(keydown);
    editor.view.dom.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
    );
    expect(keydown).toHaveBeenCalledOnce();
    expect(editor.getJSON()).toEqual(before);
    expect(editor.state.selection.from).toBe(5);
  });

  it("retains state-dependent attribute functions and explicitly supplied accessible names", async () => {
    const editor = await renderEditor();
    const attributes = vi.fn((state: typeof editor.state) => ({
      "data-content-size": String(state.doc.content.size),
      "aria-labelledby": "reviewed-editor-heading",
      "aria-label": "Explicit editor name",
      "aria-multiline": "false",
    }));
    await act(async () => {
      editor.setOptions({ editorProps: { attributes } });
      editor.commands.setContent("<p>More reviewed content</p>");
    });
    expect(editor.view.dom.getAttribute("aria-labelledby")).toBe(
      "reviewed-editor-heading",
    );
    expect(editor.view.dom.getAttribute("aria-label")).toBe(
      "Explicit editor name",
    );
    expect(editor.view.dom.getAttribute("aria-multiline")).toBe("false");
    expect(editor.view.dom.getAttribute("data-content-size")).toBe(
      String(editor.state.doc.content.size),
    );
    expect(editor.options.editorProps.attributes).toBe(attributes);
    expect(attributes).toHaveBeenCalled();
  });
});
