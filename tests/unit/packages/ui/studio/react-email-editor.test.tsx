/** @vitest-environment jsdom */

import React, { useRef, useState } from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { EmailStudioEditorHandle } from "../../../../../packages/email/email-builder-types";

const { editorState } = vi.hoisted(() => ({
  editorState: {
    getJSONMock: vi.fn(),
    getEmailMock: vi.fn(),
    setContentMock: vi.fn(),
    undoMock: vi.fn(),
    redoMock: vi.fn(),
    focusMock: vi.fn(),
    canUndoMock: vi.fn(),
    canRedoMock: vi.fn(),
    insertContentMock: vi.fn(),
    runMock: vi.fn(),
    deferReady: false,
    extensions: undefined as unknown[] | undefined,
    fireReady: undefined as (() => void) | undefined,
    onUploadImage: undefined as
      ((file: File) => Promise<{ url: string }>) | undefined,
  },
}));

const { placeCaretAtStartMock, revealEmptyPlaceholdersMock } = vi.hoisted(
  () => ({
    placeCaretAtStartMock: vi.fn(),
    revealEmptyPlaceholdersMock: vi.fn(),
  }),
);

vi.mock(
  "../../../../../packages/ui/components/studio/react-email-placeholder",
  async (importOriginal) => ({
    ...(await importOriginal<
      typeof import("../../../../../packages/ui/components/studio/react-email-placeholder")
    >()),
    placeCaretAtStart: placeCaretAtStartMock,
    revealEmptyPlaceholders: revealEmptyPlaceholdersMock,
  }),
);

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL ??= "http://127.0.0.1:54321";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= "test-anon-key";
  process.env.SKIP_ENV_VALIDATION ??= "1";
});

vi.mock("next/dynamic", async () => {
  const React = await import("react");

  const createChain = () => {
    const chain = {
      focus: vi.fn(() => chain),
      insertContent: vi.fn((value: string) => {
        editorState.insertContentMock(value);
        return chain;
      }),
      run: vi.fn(() => {
        editorState.runMock();
        return true;
      }),
    };
    return chain;
  };

  const MockEmailEditor = React.forwardRef(function MockEmailEditor(
    props: {
      content: unknown;
      className?: string;
      extensions?: unknown[];
      onReady?: () => void;
      onUpdate?: (editor: { getJSON: () => unknown }) => void;
      onUploadImage?: (file: File) => Promise<{ url: string }>;
      editable?: boolean;
    },
    ref,
  ) {
    editorState.extensions = props.extensions;
    const editorApi = {
      getJSON: editorState.getJSONMock,
      extensionManager: { extensions: [] },
      schema: { marks: {} },
      commands: {
        setContent: (content: unknown, options?: { emitUpdate?: boolean }) => {
          editorState.setContentMock(content, options);
          if (options?.emitUpdate !== false) {
            props.onUpdate?.({ getJSON: editorState.getJSONMock });
          }
        },
        undo: editorState.undoMock,
        redo: editorState.redoMock,
        focus: editorState.focusMock,
      },
      can: () => ({
        undo: editorState.canUndoMock,
        redo: editorState.canRedoMock,
      }),
      chain: createChain,
    };
    const handle: {
      getJSON: typeof editorState.getJSONMock;
      getEmail: typeof editorState.getEmailMock;
      editor: typeof editorApi | undefined;
    } = {
      getJSON: editorState.getJSONMock,
      getEmail: editorState.getEmailMock,
      editor: editorState.deferReady ? undefined : editorApi,
    };

    React.useImperativeHandle(ref, () => handle);

    React.useEffect(() => {
      editorState.onUploadImage = props.onUploadImage;
      const fireReady = () => {
        handle.editor = editorApi;
        props.onReady?.();
        props.onUpdate?.({ getJSON: editorState.getJSONMock });
      };
      if (editorState.deferReady) {
        editorState.fireReady = fireReady;
        return;
      }
      fireReady();
    }, [props]);

    return React.createElement("div", {
      "data-testid": "mock-react-email-editor",
      "data-content": JSON.stringify(props.content),
      "data-editable": String(props.editable ?? true),
      className: props.className,
    });
  });

  return {
    default: () => MockEmailEditor,
  };
});

import { ReactEmailEditor } from "../../../../../packages/ui/components/studio/ReactEmailEditor";
import { EmailStudioEditor } from "../../../../../packages/ui/components/studio/EmailStudioEditor";

function EditorHarness({
  onReady,
  onDesignUpdate,
  onExport,
}: {
  onReady?: () => void;
  onDesignUpdate?: (design: Record<string, unknown>) => void;
  onExport?: (result: unknown) => void;
}) {
  const editorRef = useRef<EmailStudioEditorHandle>(null);
  const [result, setResult] = useState("");
  const [uploadUrl, setUploadUrl] = useState("");

  return (
    <>
      <ReactEmailEditor
        ref={editorRef}
        templateId="template_1"
        initialDesign={{ type: "doc", content: [] }}
        onReady={onReady}
        onDesignUpdate={onDesignUpdate}
        onExport={onExport as never}
      />
      <button
        type="button"
        onClick={async () => {
          const exported = await editorRef.current?.exportEmail({
            subject: "May update",
            preheader: "A note",
          });
          setResult(JSON.stringify(exported));
        }}
      >
        export
      </button>
      <button
        type="button"
        onClick={() => editorRef.current?.insertMergeTag?.("first_name")}
      >
        insert tag
      </button>
      <button
        type="button"
        onClick={async () => {
          const uploaded = await editorState.onUploadImage?.(
            new File(["image"], "hero.png", { type: "image/png" }),
          );
          setUploadUrl(uploaded?.url ?? "");
        }}
      >
        upload
      </button>
      <output data-testid="export-result">{result}</output>
      <output data-testid="upload-url">{uploadUrl}</output>
    </>
  );
}

function LoadBeforeReadyHarness() {
  const editorRef = useRef<EmailStudioEditorHandle>(null);

  return (
    <>
      <ReactEmailEditor ref={editorRef} />
      <button
        type="button"
        onClick={() =>
          editorRef.current?.loadDesign({
            body: { rows: [{ id: "hero" }] },
          })
        }
      >
        queue design
      </button>
    </>
  );
}

function LoadAfterReadyHarness({
  onReady,
  onDesignUpdate,
}: {
  onReady?: () => void;
  onDesignUpdate?: (design: Record<string, unknown>) => void;
}) {
  const editorRef = useRef<EmailStudioEditorHandle>(null);

  return (
    <>
      <ReactEmailEditor
        ref={editorRef}
        initialDesign={{ type: "doc", content: [] }}
        onReady={onReady}
        onDesignUpdate={onDesignUpdate}
      />
      <button
        type="button"
        onClick={() =>
          editorRef.current?.loadDesign({
            body: { rows: [{ id: "welcome" }] },
          })
        }
      >
        load design
      </button>
    </>
  );
}

describe("@asym/ui ReactEmailEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    editorState.deferReady = false;
    editorState.fireReady = undefined;
    editorState.getJSONMock.mockReturnValue({ type: "doc", content: [] });
    editorState.getEmailMock.mockResolvedValue({
      html: "<p>fallback</p>",
      text: "fallback",
    });
    editorState.canUndoMock.mockReturnValue(true);
    editorState.canRedoMock.mockReturnValue(false);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("exports React Email HTML and text through the neutral editor handle", async () => {
    const onReady = vi.fn();
    const onDesignUpdate = vi.fn();
    const onExport = vi.fn();

    render(
      <EditorHarness
        onReady={onReady}
        onDesignUpdate={onDesignUpdate}
        onExport={onExport}
      />,
    );

    await waitFor(() => expect(onReady).toHaveBeenCalled());
    await waitFor(() =>
      expect(onDesignUpdate).toHaveBeenCalledWith({
        type: "doc",
        content: [],
      }),
    );

    fireEvent.click(screen.getByRole("button", { name: "export" }));

    await waitFor(() => {
      expect(screen.getByTestId("export-result").textContent).toContain(
        '"builder":"react_email"',
      );
    });
    expect(onExport).toHaveBeenCalledWith(
      expect.objectContaining({
        builder: "react_email",
        design: { type: "doc", content: [] },
        subject: "May update",
        preheader: "A note",
      }),
    );
  });

  it("inserts merge tags and uploads images through the configured API route", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ url: "https://cdn.test/hero.png" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    render(<EditorHarness />);

    await waitFor(() =>
      expect(editorState.onUploadImage).toBeTypeOf("function"),
    );

    fireEvent.click(screen.getByRole("button", { name: "insert tag" }));
    expect(editorState.insertContentMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "mergeTag",
        attrs: { key: "first_name", label: null },
      }),
    );
    expect(editorState.runMock).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "upload" }));

    await waitFor(() => {
      expect(screen.getByTestId("upload-url").textContent).toBe(
        "https://cdn.test/hero.png",
      );
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/email/assets/upload",
      expect.objectContaining({
        method: "POST",
        body: expect.any(FormData),
      }),
    );

    const body = fetchMock.mock.calls[0]?.[1]?.body as FormData;
    expect(body.get("templateId")).toBe("template_1");
    expect((body.get("file") as File).name).toBe("hero.png");
  });

  it("renders the React Email editor (Unlayer removed from Email Studio)", async () => {
    render(<EmailStudioEditor />);

    await waitFor(() =>
      expect(screen.getByTestId("mock-react-email-editor")).toBeTruthy(),
    );
  });

  it("passes read-only through to React Email so the email cannot change", async () => {
    const { rerender } = render(<EmailStudioEditor />);
    const editor = await screen.findByTestId("mock-react-email-editor");
    expect(editor.getAttribute("data-editable")).toBe("true");

    rerender(<EmailStudioEditor readOnly />);
    await waitFor(() =>
      expect(
        screen
          .getByTestId("mock-react-email-editor")
          .getAttribute("data-editable"),
      ).toBe("false"),
    );
  });

  it("centres the canvas and the email body in the workspace", async () => {
    render(<EmailStudioEditor />);
    const editor = await screen.findByTestId("mock-react-email-editor");
    // React Email's theme injects an unlayered "margin: 0" on the canvas and
    // the email body. The shared stylesheet centres the canvas (see
    // react-email-theme.test.ts); the important modifier centres the body.
    expect(editor.className).not.toContain("[&_.tiptap]:mx-auto!");
    expect(editor.className).toContain("[&_.node-container]:mx-auto!");
  });

  it("keeps the formatting bubble hidden until someone works in the editor", async () => {
    render(<EmailStudioEditor />);
    const editor = await screen.findByTestId("mock-react-email-editor");
    // React Email paints its bubble menu visible before any selection, so a
    // "Multiple" toolbar floated over a blank email on first load.
    expect(editor.className).toContain("[&_[data-re-bubble-menu]]:invisible!");
    fireEvent.focusIn(editor);
    await waitFor(() =>
      expect(editor.className).not.toContain(
        "[&_[data-re-bubble-menu]]:invisible!",
      ),
    );
  });

  it("shows the starting prompt on a blank email without a click", async () => {
    render(<EmailStudioEditor />);
    const editor = await screen.findByTestId("mock-react-email-editor");
    // The prompt is revealed once the editor is ready, before any focus.
    await waitFor(() => expect(revealEmptyPlaceholdersMock).toHaveBeenCalled());
    // The placeholder names real slash-menu blocks.
    const placeholder = (
      editorState.extensions as Array<{
        name: string;
        options: {
          placeholder: (props: unknown) => string;
          emptyNodeClass: (props: unknown) => string;
        };
      }>
    ).find((extension) => extension.name === "placeholder");
    expect(
      placeholder?.options.placeholder({
        node: { type: { name: "paragraph" }, attrs: {} },
      }),
    ).toBe("Start writing, or press '/' to add a heading, button or columns");
    // React Email paints `p.is-empty` at 30% opacity, too faint to read.
    // The empty paragraph takes its own class instead, drawn in the muted
    // text token at full strength, with no `!` override.
    expect(
      placeholder?.options.emptyNodeClass({
        node: { type: { name: "paragraph" }, attrs: {} },
      }),
    ).toBe("is-email-prompt");
    expect(editor.className).toContain(
      "[&_p.is-email-prompt]:before:text-muted-foreground",
    );
    expect(editor.className).toContain(
      "[&_p.is-email-prompt]:before:content-[attr(data-placeholder)]",
    );
    expect(editor.className).not.toMatch(/opacity/);
    expect(editor.className).not.toMatch(/is-email-prompt\S*!/);
  });

  it("applies loadDesign queued before the nested editor is ready", async () => {
    editorState.deferReady = true;

    render(<LoadBeforeReadyHarness />);

    await screen.findByTestId("mock-react-email-editor");
    fireEvent.click(screen.getByRole("button", { name: "queue design" }));

    expect(editorState.setContentMock).not.toHaveBeenCalled();

    editorState.fireReady?.();

    await waitFor(() => {
      expect(editorState.setContentMock).toHaveBeenCalledWith(
        { body: { rows: [{ id: "hero" }] } },
        { emitUpdate: false },
      );
    });
    // Loaded content starts with a caret at the top, not a selection that
    // would open the formatting bubble.
    expect(placeCaretAtStartMock).toHaveBeenCalledTimes(1);
  });

  it("does not notify onDesignUpdate when loadDesign applies stored template content", async () => {
    const onReady = vi.fn();
    const onDesignUpdate = vi.fn();

    render(
      <LoadAfterReadyHarness
        onReady={onReady}
        onDesignUpdate={onDesignUpdate}
      />,
    );

    await waitFor(() => expect(onReady).toHaveBeenCalled());
    onDesignUpdate.mockClear();

    fireEvent.click(screen.getByRole("button", { name: "load design" }));

    expect(editorState.setContentMock).toHaveBeenCalledWith(
      { body: { rows: [{ id: "welcome" }] } },
      { emitUpdate: false },
    );
    expect(onDesignUpdate).not.toHaveBeenCalled();
    expect(placeCaretAtStartMock).toHaveBeenCalledTimes(1);
    expect(placeCaretAtStartMock.mock.invocationCallOrder[0]).toBeGreaterThan(
      editorState.setContentMock.mock.invocationCallOrder[0]!,
    );
  });
});
