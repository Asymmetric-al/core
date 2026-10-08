/** @vitest-environment jsdom */

import { act, cleanup, render, waitFor } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LegacyUnlayerEmailEditor } from "../../../../../packages/ui/components/studio/legacy/UnlayerEmailEditor";

import type { LegacyUnlayerEditorHandle } from "../../../../../packages/ui/components/studio/legacy/UnlayerEmailEditor";

const state = vi.hoisted(() => ({
  deferReady: false,
  editorId: "",
  design: {
    schemaVersion: 16,
    body: { rows: [{ id: "legacy-row" }], values: {} },
  },
  loadDesign: vi.fn(),
  exportHtml: vi.fn(),
  saveDesign: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  listener: undefined as ((event: { design: unknown }) => void) | undefined,
}));

// The hosted embed is an external boundary. This checks Core's readiness,
// refs, event ownership and stored-design adapter without contacting Unlayer.
vi.mock("next/dynamic", async () => {
  const React = await import("react");
  const api = {
    loadDesign: state.loadDesign,
    saveDesign: (callback: (design: unknown) => void) => {
      state.saveDesign();
      callback(state.design);
    },
    exportHtml: (callback: (result: unknown) => void, options: unknown) => {
      state.exportHtml(options);
      callback({ design: state.design, html: "<p>Legacy template</p>" });
    },
    addEventListener: (type: string, callback: typeof state.listener) => {
      state.addEventListener(type);
      state.listener = callback;
    },
    removeEventListener: (type: string) => {
      state.removeEventListener(type);
      state.listener = undefined;
    },
  };
  const Embed = React.forwardRef(function Embed(
    props: {
      editorId: string;
      onLoad: () => void;
      onReady: (editor: typeof api) => void;
    },
    ref,
  ) {
    state.editorId = props.editorId;
    React.useImperativeHandle(ref, () => ({
      editor: state.deferReady ? undefined : api,
    }));
    React.useEffect(() => {
      props.onLoad();
      if (!state.deferReady) props.onReady(api);
    }, []);
    return <div data-testid="unlayer-embed" />;
  });
  return { default: () => Embed };
});

beforeEach(() => {
  vi.clearAllMocks();
  state.deferReady = false;
  state.listener = undefined;
});
afterEach(() => cleanup());

describe("legacy Unlayer adapter", () => {
  it("loads a stored design on readiness and preserves the requested editor id", async () => {
    const onReady = vi.fn();
    const onLoad = vi.fn();
    render(
      <LegacyUnlayerEmailEditor
        initialDesign={state.design}
        editorId="legacy-stored-editor"
        onLoad={onLoad}
        onReady={onReady}
      />,
    );

    await waitFor(() => expect(onReady).toHaveBeenCalledTimes(1));
    expect(onLoad).toHaveBeenCalledTimes(1);
    expect(state.loadDesign).toHaveBeenCalledWith(state.design);
    expect(state.editorId).toBe("legacy-stored-editor");
  });

  it("exports and saves the same legacy design through the neutral handle", async () => {
    const ref = createRef<LegacyUnlayerEditorHandle>();
    const onReady = vi.fn();
    const onSave = vi.fn();
    const onExport = vi.fn();
    render(
      <LegacyUnlayerEmailEditor
        ref={ref}
        onReady={onReady}
        onSave={onSave}
        onExport={onExport}
      />,
    );
    await waitFor(() => expect(onReady).toHaveBeenCalled());

    expect(await ref.current?.exportDesign()).toEqual(state.design);
    expect(
      await ref.current?.exportHtml({ minify: false, cleanup: true }),
    ).toEqual({ design: state.design, html: "<p>Legacy template</p>" });
    expect(state.exportHtml).toHaveBeenCalledWith({
      minify: false,
      cleanup: true,
      mergeTags: undefined,
    });
    expect(onExport).toHaveBeenCalledWith({
      design: state.design,
      html: "<p>Legacy template</p>",
    });
    expect(await ref.current?.saveDesign()).toEqual(state.design);
    expect(onSave).toHaveBeenCalledWith({
      design: state.design,
      html: "<p>Legacy template</p>",
    });
    ref.current?.loadDesign(state.design);
    expect(state.loadDesign).toHaveBeenLastCalledWith(state.design);
  });

  it("rebinds design listeners and removes the subscription on unmount", async () => {
    const first = vi.fn();
    const next = vi.fn();
    const { rerender, unmount } = render(
      <LegacyUnlayerEmailEditor onDesignUpdate={first} />,
    );
    await waitFor(() => expect(state.listener).toBeTypeOf("function"));
    act(() => state.listener?.({ design: state.design }));
    expect(first).toHaveBeenCalledWith(state.design);
    rerender(<LegacyUnlayerEmailEditor onDesignUpdate={next} />);
    act(() => state.listener?.({ design: state.design }));
    expect(next).toHaveBeenCalledWith(state.design);
    expect(first).toHaveBeenCalledTimes(1);
    unmount();
    expect(state.removeEventListener).toHaveBeenCalledWith("design:updated");
    expect(state.listener).toBeUndefined();
  });

  it("rejects exports while the hosted embed is still loading", async () => {
    state.deferReady = true;
    const ref = createRef<LegacyUnlayerEditorHandle>();
    render(<LegacyUnlayerEmailEditor ref={ref} />);
    await expect(ref.current?.exportHtml()).rejects.toThrow("Editor not ready");
    await expect(ref.current?.exportDesign()).rejects.toThrow(
      "Editor not ready",
    );
  });
});
