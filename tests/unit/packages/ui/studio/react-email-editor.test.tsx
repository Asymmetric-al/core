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
    onUploadImage: undefined as
      | ((file: File) => Promise<{ url: string }>)
      | undefined,
  },
}));

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
      extensions?: unknown[];
      onReady?: () => void;
      onUpdate?: (editor: { getJSON: () => unknown }) => void;
      onUploadImage?: (file: File) => Promise<{ url: string }>;
    },
    ref,
  ) {
    React.useImperativeHandle(ref, () => ({
      getJSON: editorState.getJSONMock,
      getEmail: editorState.getEmailMock,
      editor: {
        getJSON: editorState.getJSONMock,
        extensionManager: { extensions: [] },
        schema: { marks: {} },
        commands: {
          setContent: editorState.setContentMock,
          undo: editorState.undoMock,
          redo: editorState.redoMock,
          focus: editorState.focusMock,
        },
        can: () => ({
          undo: editorState.canUndoMock,
          redo: editorState.canRedoMock,
        }),
        chain: createChain,
      },
    }));

    React.useEffect(() => {
      editorState.onUploadImage = props.onUploadImage;
      props.onReady?.();
      props.onUpdate?.({ getJSON: editorState.getJSONMock });
    }, [props]);

    return React.createElement("div", {
      "data-testid": "mock-react-email-editor",
      "data-content": JSON.stringify(props.content),
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

describe("@asym/ui ReactEmailEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
});
