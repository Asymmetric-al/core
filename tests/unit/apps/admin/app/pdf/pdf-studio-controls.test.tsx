/** @vitest-environment jsdom */

import { getPDFStudioConfig } from "@asym/config/pdf-studio";
import {
  act,
  cleanup,
  fireEvent,
  render,
  renderHook,
  screen,
} from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import type { LegacyUnlayerDocumentEditorProps } from "@asym/ui/components/studio/legacy/UnlayerDocumentEditor";

const legacyEditor = vi.hoisted(() => ({
  props: null as LegacyUnlayerDocumentEditorProps | null,
}));

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL ??= "http://127.0.0.1:54321";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= "test-anon-key";
  process.env.SKIP_ENV_VALIDATION ??= "1";
});
vi.mock("@asym/ui/components/studio/legacy/UnlayerDocumentEditor", () => ({
  LegacyUnlayerDocumentEditor: (props: LegacyUnlayerDocumentEditorProps) => {
    legacyEditor.props = props;
    return <iframe title="Legacy PDF editor mock" />;
  },
}));
type StudioModule =
  typeof import("../../../../../../apps/admin/app/(app)/pdf/page-client");
let studio: StudioModule;
beforeAll(async () => {
  studio =
    await import("../../../../../../apps/admin/app/(app)/pdf/page-client");
}, 60_000);
afterEach(() => {
  cleanup();
  legacyEditor.props = null;
  vi.unstubAllGlobals();
});

describe("PDF Studio controls", () => {
  it("keeps the legacy iframe in a named focusable viewport through readiness and unsaved updates", () => {
    render(<studio.default />);
    const viewport = screen.getByRole("region", {
      name: "PDF editor canvas",
    });
    const iframe = screen.getByTitle("Legacy PDF editor mock");
    expect(viewport.contains(iframe)).toBe(true);
    expect(viewport.tabIndex).toBe(0);
    viewport.focus();
    expect(document.activeElement).toBe(viewport);
    expect(
      screen.getByRole("button", { name: "Export" }).hasAttribute("disabled"),
    ).toBe(true);
    expect(screen.queryByText("Unsaved changes")).toBeNull();
    expect(
      screen.getByText(/Scroll left or right within the editor below/),
    ).toBeTruthy();

    const props = legacyEditor.props;
    act(() => props?.onReady?.(getPDFStudioConfig()));
    expect(
      screen.getByRole("button", { name: "Export" }).hasAttribute("disabled"),
    ).toBe(false);

    act(() => props?.onDesignUpdate?.({ body: { rows: [], values: {} } }));
    expect(
      screen.getByText("Unsaved changes").closest('[role="status"]'),
    ).toBeTruthy();
    expect(screen.getByRole("region", { name: "PDF editor canvas" })).toBe(
      viewport,
    );
    expect(screen.getByTitle("Legacy PDF editor mock")).toBe(iframe);
  });

  it("names required save fields with unique IDs and describes the optional description", () => {
    const { result } = renderHook(() => studio.usePDFStudioController());
    const props = {
      open: true,
      onOpenChange: vi.fn(),
      metadata: result.current.metadata,
      setMetadata: vi.fn(),
      isSaving: false,
      onConfirmSave: vi.fn(),
    };
    const view = render(<studio.PDFSaveDialogSection {...props} />);
    const name = screen.getByRole("textbox", { name: /Template name/i });
    expect(name.getAttribute("aria-required")).toBe("true");
    expect(name.id).not.toBe("name");
    const description = screen.getByRole("textbox", { name: /Description/i });
    const hint = document.getElementById(
      description.getAttribute("aria-describedby") ?? "",
    );
    expect(hint?.textContent).toContain("team members");
    view.rerender(<studio.PDFSaveDialogSection {...props} isSaving />);
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(props.onOpenChange).not.toHaveBeenCalled();
  });

  it("preserves a dirty document until replacement is confirmed", () => {
    const { result } = renderHook(() => studio.usePDFStudioController());
    act(() =>
      result.current.handleNativeTemplateTextChange('{"draft":"keep"}'),
    );
    act(() => result.current.handleNewNativeTemplate());
    expect(result.current.nativeTemplateText).toBe('{"draft":"keep"}');
    expect(result.current.hasUnsavedChanges).toBe(true);
    act(() => result.current.discardGuard.cancel());
    expect(result.current.nativeTemplateText).toBe('{"draft":"keep"}');
    act(() => result.current.handleNewNativeTemplate());
    act(() => result.current.discardGuard.confirm());
    expect(result.current.hasUnsavedChanges).toBe(false);
  });

  it("leaves browser print and text undo alone, including uppercase composing shortcuts", () => {
    const { result } = renderHook(() => studio.usePDFStudioController());
    const undo = vi.fn();
    act(() => {
      result.current.editorRef.current = { undo } as never;
    });
    const print = new KeyboardEvent("keydown", {
      key: "p",
      ctrlKey: true,
      cancelable: true,
    });
    window.dispatchEvent(print);
    expect(print.defaultPrevented).toBe(false);
    const input = document.createElement("textarea");
    document.body.append(input);
    fireEvent.keyDown(input, { key: "z", ctrlKey: true });
    expect(undo).not.toHaveBeenCalled();
    const composing = new KeyboardEvent("keydown", {
      key: "Z",
      ctrlKey: true,
      isComposing: true,
      cancelable: true,
    });
    window.dispatchEvent(composing);
    expect(composing.defaultPrevented).toBe(false);
    input.remove();
    fireEvent.keyDown(window, { key: "Z", ctrlKey: true });
    expect(undo).toHaveBeenCalledOnce();
  });

  it("shows picker retry on a failed read and can recover", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({ ok: false, json: async () => ({}) })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, templates: [] }),
        }),
    );
    const { result } = renderHook(() => studio.usePDFStudioController());
    await act(() => result.current.handleOpenTemplatePicker());
    expect(result.current.templateLoadFailed).toBe(true);
    await act(() => result.current.handleOpenTemplatePicker());
    expect(result.current.templateLoadFailed).toBe(false);
  });

  it("keeps failed reads distinct from empty lists in the picker", () => {
    const retry = vi.fn();
    render(
      <studio.PDFTemplatePickerDialog
        open
        onOpenChange={vi.fn()}
        templates={[]}
        isLoading={false}
        loadFailed
        onRetry={retry}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.queryByText("No saved PDF templates yet.")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(retry).toHaveBeenCalledOnce();
  });
});
