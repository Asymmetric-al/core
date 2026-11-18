/** @vitest-environment jsdom */

import { getPDFStudioConfig } from "@asym/config/pdf-studio";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogTitle,
} from "@asym/ui/components/shadcn/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@asym/ui/components/shadcn/dialog";
import {
  act,
  cleanup,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { setPlatform } from "@ui-sdk/core/testing";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

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
// Control is `mod` unless a test picks Apple.
beforeEach(() => setPlatform("other"));
afterEach(() => {
  cleanup();
  legacyEditor.props = null;
  vi.unstubAllGlobals();
  setPlatform("other");
});

/** A real key press goes to the focused element, or the page when nothing has focus. */
function press(init: KeyboardEventInit) {
  const event = new KeyboardEvent("keydown", {
    bubbles: true,
    cancelable: true,
    ...init,
  });
  act(() => {
    (document.activeElement ?? document.body).dispatchEvent(event);
  });
  return event;
}

function typingField() {
  const field = document.createElement("textarea");
  document.body.append(field);
  field.focus();
  return field;
}

/** The mocked editor never attaches a handle, so the test supplies one. */
function mountStudioWithEditor() {
  render(<studio.default />);
  const editor = {
    undo: vi.fn(),
    redo: vi.fn(),
    exportHtml: vi.fn(async () => ({ html: "<p>Receipt</p>" })),
    loadDesign: vi.fn(),
  };
  const props = legacyEditor.props as LegacyUnlayerDocumentEditorProps & {
    ref: { current: unknown };
  };
  act(() => {
    props.ref.current = editor;
    props.onReady?.(getPDFStudioConfig());
  });
  return editor;
}

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
    expect(press({ key: "p", ctrlKey: true }).defaultPrevented).toBe(false);
    const input = typingField();
    expect(press({ key: "z", ctrlKey: true }).defaultPrevented).toBe(false);
    expect(undo).not.toHaveBeenCalled();
    input.remove();
    expect(
      press({ key: "Z", ctrlKey: true, isComposing: true }).defaultPrevented,
    ).toBe(false);
    expect(undo).not.toHaveBeenCalled();
    expect(press({ key: "Z", ctrlKey: true }).defaultPrevented).toBe(true);
    expect(undo).toHaveBeenCalledOnce();
  });

  it("saves from the keyboard, also while typing, and keeps the key when it cannot save", () => {
    const { result } = renderHook(() => studio.usePDFStudioController());
    act(() => {
      result.current.editorRef.current = {} as never;
    });
    // The editor is still loading: nothing saves, and the browser's own
    // "Save page" stays closed.
    expect(press({ key: "s", ctrlKey: true }).defaultPrevented).toBe(true);
    expect(result.current.showSaveDialog).toBe(false);

    act(() => result.current.handleEditorReady(getPDFStudioConfig()));
    const input = typingField();
    expect(press({ key: "s", ctrlKey: true }).defaultPrevented).toBe(true);
    expect(result.current.showSaveDialog).toBe(true);
    input.remove();
  });

  it("keeps Save from the browser while a studio menu holds focus", async () => {
    mountStudioWithEditor();
    fireEvent.click(
      screen.getByRole("button", { name: "More PDF template actions" }),
    );
    const item = (await screen.findAllByRole("menuitem"))[0]!;
    item.focus();
    expect(document.activeElement?.closest('[role="menu"]')).not.toBeNull();

    expect(press({ key: "s", ctrlKey: true }).defaultPrevented).toBe(true);
    expect(
      await screen.findByRole("dialog", { name: /Save PDF Template/ }),
    ).toBeTruthy();
  });

  it("runs undo, redo and export from the page with this platform's modifier only", async () => {
    const { result } = renderHook(() => studio.usePDFStudioController());
    const editor = {
      undo: vi.fn(),
      redo: vi.fn(),
      exportHtml: vi.fn(async () => ({ html: "<p>Receipt</p>" })),
    };
    act(() => {
      result.current.editorRef.current = editor as never;
    });
    expect(press({ key: "z", metaKey: true }).defaultPrevented).toBe(false);
    expect(editor.undo).not.toHaveBeenCalled();

    expect(press({ key: "z", ctrlKey: true }).defaultPrevented).toBe(true);
    expect(editor.undo).toHaveBeenCalledOnce();
    expect(editor.redo).not.toHaveBeenCalled();
    expect(
      press({ key: "Z", ctrlKey: true, shiftKey: true }).defaultPrevented,
    ).toBe(true);
    expect(editor.redo).toHaveBeenCalledOnce();
    expect(editor.undo).toHaveBeenCalledOnce();

    // A held key keeps stepping, as it did before the shared owner.
    press({ key: "z", ctrlKey: true, repeat: true });
    press({ key: "z", ctrlKey: true, repeat: true });
    expect(editor.undo).toHaveBeenCalledTimes(3);
    press({ key: "Z", ctrlKey: true, shiftKey: true, repeat: true });
    expect(editor.redo).toHaveBeenCalledTimes(2);

    const input = typingField();
    expect(press({ key: "e", ctrlKey: true }).defaultPrevented).toBe(false);
    expect(editor.exportHtml).not.toHaveBeenCalled();
    input.remove();
    expect(press({ key: "e", ctrlKey: true }).defaultPrevented).toBe(true);
    await waitFor(() => expect(result.current.showExportDialog).toBe(true));
    expect(result.current.exportedHtml).toBe("<p>Receipt</p>");
  });

  it("leaves fullscreen on Escape, and takes Escape only while fullscreen and not typing", () => {
    const { result } = renderHook(() => studio.usePDFStudioController());
    expect(press({ key: "Escape" }).defaultPrevented).toBe(false);

    act(() => result.current.dispatchUi({ type: "toggle_fullscreen" }));
    expect(result.current.isFullscreen).toBe(true);
    const input = typingField();
    expect(press({ key: "Escape" }).defaultPrevented).toBe(false);
    expect(result.current.isFullscreen).toBe(true);
    input.remove();

    expect(press({ key: "Escape" }).defaultPrevented).toBe(true);
    expect(result.current.isFullscreen).toBe(false);
  });

  it("pauses the studio shortcuts while any of its five dialogs holds focus", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          success: true,
          templates: [
            {
              id: "tmpl_receipt",
              name: "Receipt template",
              description: null,
              design: { body: { rows: [], values: {} } },
              html: null,
              category: "custom",
              page_size: "Letter",
              orientation: "portrait",
              status: "draft",
              engine: "unlayer",
              updated_at: "2026-01-01T00:00:00.000Z",
            },
          ],
        }),
      })),
    );
    const editor = mountStudioWithEditor();
    const chooseMoreAction = async (name: RegExp) => {
      fireEvent.click(
        screen.getByRole("button", { name: "More PDF template actions" }),
      );
      fireEvent.click(await screen.findByRole("menuitem", { name }));
    };
    // Focus sits inside the dialog, as it does for a real key press there.
    const expectPaused = async (
      role: "dialog" | "alertdialog",
      name: RegExp,
      { pressSave = true } = {},
    ) => {
      const dialog = await screen.findByRole(role, { name });
      within(dialog).getAllByRole("button")[0]!.focus();
      expect(press({ key: "z", ctrlKey: true }).defaultPrevented).toBe(false);
      expect(editor.undo).not.toHaveBeenCalled();
      if (pressSave) {
        // Save keeps the key from the browser but never opens beside it.
        expect(press({ key: "s", ctrlKey: true }).defaultPrevented).toBe(true);
        expect(
          screen.queryByRole("dialog", { name: /Save PDF Template/ }),
        ).toBeNull();
      }
      return dialog;
    };
    const leave = async (dialog: HTMLElement, button: HTMLElement) => {
      fireEvent.click(button);
      await waitFor(() => expect(dialog.isConnected).toBe(false));
    };
    const buttonIn = (dialog: HTMLElement, name: string | RegExp) =>
      within(dialog).getAllByRole("button", { name })[0]!;

    press({ key: "s", ctrlKey: true });
    const save = await expectPaused("dialog", /Save PDF Template/, {
      pressSave: false,
    });
    await leave(save, buttonIn(save, "Cancel"));

    press({ key: "e", ctrlKey: true });
    const exported = await expectPaused("dialog", /Export HTML/);
    expect(
      screen.queryByRole("dialog", { name: /Save PDF Template/ }),
    ).toBeNull();
    await leave(exported, buttonIn(exported, "Close"));

    fireEvent.click(screen.getByRole("button", { name: "Open template" }));
    const picker = await expectPaused("dialog", /Open PDF template/);
    await leave(
      picker,
      await within(picker).findByRole("button", { name: /Receipt template/ }),
    );

    await chooseMoreAction(/Archive template/);
    const archive = await expectPaused("alertdialog", /Archive template/);
    await leave(archive, buttonIn(archive, "Cancel"));

    act(() =>
      legacyEditor.props?.onDesignUpdate?.({ body: { rows: [], values: {} } }),
    );
    await chooseMoreAction(/New document/);
    const discard = await expectPaused(
      "alertdialog",
      /Discard unsaved changes/,
    );
    await leave(discard, buttonIn(discard, "Keep editing"));

    await waitFor(() =>
      expect(document.querySelector('[role="menu"]')).toBeNull(),
    );
    expect(press({ key: "z", ctrlKey: true }).defaultPrevented).toBe(true);
    expect(editor.undo).toHaveBeenCalledOnce();
  });

  it("submits the open Save dialog from the keyboard instead of leaving the key to the browser", async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ success: true, template: { id: "tmpl_saved" } }),
    }));
    vi.stubGlobal("fetch", fetchMock);
    const editor = mountStudioWithEditor();

    expect(press({ key: "s", ctrlKey: true }).defaultPrevented).toBe(true);
    const dialog = await screen.findByRole("dialog", {
      name: /Save PDF Template/,
    });
    within(dialog)
      .getByRole("textbox", { name: /Template name/i })
      .focus();
    expect(press({ key: "s", ctrlKey: true }).defaultPrevented).toBe(true);

    await waitFor(() => expect(dialog.isConnected).toBe(false));
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
        "/api/pdf-templates",
        expect.objectContaining({ method: "POST" }),
      ),
    );
    expect(editor.exportHtml).toHaveBeenCalledOnce();
    expect(screen.queryAllByRole("dialog")).toHaveLength(0);
  });

  it("never opens Save over the shell's leave-page alert", async () => {
    mountStudioWithEditor();
    const shellAlert = render(
      <AlertDialog open>
        <AlertDialogContent>
          <AlertDialogTitle>Leave this page?</AlertDialogTitle>
          <AlertDialogCancel>Stay on page</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>,
    );
    (await screen.findByRole("button", { name: "Stay on page" })).focus();
    expect(press({ key: "s", ctrlKey: true }).defaultPrevented).toBe(true);
    expect(
      screen.queryByRole("dialog", { name: /Save PDF Template/ }),
    ).toBeNull();

    shellAlert.unmount();
    (document.activeElement as HTMLElement | null)?.blur();
    expect(press({ key: "s", ctrlKey: true }).defaultPrevented).toBe(true);
    expect(
      await screen.findByRole("dialog", { name: /Save PDF Template/ }),
    ).toBeTruthy();
  });

  it("never opens Save over a dialog the studio does not track", async () => {
    mountStudioWithEditor();
    // The setup badge, the shell's page search and the Eve sheet are dialogs
    // outside the studio's own state.
    const outsideDialog = render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Search pages</DialogTitle>
          <input aria-label="Search pages" />
        </DialogContent>
      </Dialog>,
    );
    (await screen.findByRole("textbox", { name: "Search pages" })).focus();
    expect(press({ key: "s", ctrlKey: true }).defaultPrevented).toBe(true);
    expect(
      screen.queryByRole("dialog", { name: /Save PDF Template/ }),
    ).toBeNull();

    outsideDialog.unmount();
    (document.activeElement as HTMLElement | null)?.blur();
    expect(press({ key: "s", ctrlKey: true }).defaultPrevented).toBe(true);
    expect(
      await screen.findByRole("dialog", { name: /Save PDF Template/ }),
    ).toBeTruthy();
  });

  it("saves from a form: Enter submits once, never blank or busy", () => {
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
    const form = name.closest("form");
    expect(form).not.toBeNull();
    const save = screen.getByRole("button", { name: "Save template" });
    expect(save.getAttribute("type")).toBe("submit");
    expect(form!.contains(save)).toBe(true);
    fireEvent.submit(form!);
    expect(props.onConfirmSave).toHaveBeenCalledOnce();
    props.onConfirmSave.mockClear();

    view.rerender(
      <studio.PDFSaveDialogSection
        {...props}
        metadata={{ ...props.metadata, name: "   " }}
      />,
    );
    fireEvent.submit(form!);
    expect(props.onConfirmSave).not.toHaveBeenCalled();

    view.rerender(<studio.PDFSaveDialogSection {...props} isSaving />);
    expect(
      screen.getByRole("button", { name: /Saving/ }).hasAttribute("disabled"),
    ).toBe(true);
    fireEvent.submit(form!);
    expect(props.onConfirmSave).not.toHaveBeenCalled();
  });

  it("lets an open dialog or menu take Escape before fullscreen does", async () => {
    mountStudioWithEditor();
    const openMore = () =>
      fireEvent.click(
        screen.getByRole("button", { name: "More PDF template actions" }),
      );
    openMore();
    fireEvent.click(
      await screen.findByRole("menuitem", { name: /^Full screen/ }),
    );
    await waitFor(() =>
      expect(document.querySelector('[role="menu"]')).toBeNull(),
    );

    press({ key: "s", ctrlKey: true });
    const save = await screen.findByRole("dialog", {
      name: /Save PDF Template/,
    });
    within(save).getByRole("button", { name: "Cancel" }).focus();
    press({ key: "Escape" });
    await waitFor(() => expect(save.isConnected).toBe(false));

    openMore();
    const exit = await screen.findByRole("menuitem", {
      name: /^Exit full screen/,
    });
    exit.focus();
    press({ key: "Escape" });
    await waitFor(() => expect(exit.isConnected).toBe(false));

    (document.activeElement as HTMLElement | null)?.blur();
    expect(press({ key: "Escape" }).defaultPrevented).toBe(true);
    openMore();
    expect(
      await screen.findByRole("menuitem", { name: /^Full screen/ }),
    ).toBeTruthy();
  });

  it.each([
    ["other", "ctrlKey", "metaKey", "Control+Z"],
    ["apple", "metaKey", "ctrlKey", "Meta+Z"],
  ] as const)(
    "advertises and runs the same undo keys on the %s platform",
    async (platform, modifier, otherModifier, keys) => {
      setPlatform(platform);
      const editor = mountStudioWithEditor();
      const undo = screen.getByRole("button", { name: "Undo" });
      await waitFor(() =>
        expect(undo.getAttribute("aria-keyshortcuts")).toBe(keys),
      );
      expect(press({ key: "z", [otherModifier]: true }).defaultPrevented).toBe(
        false,
      );
      expect(editor.undo).not.toHaveBeenCalled();
      expect(press({ key: "z", [modifier]: true }).defaultPrevented).toBe(true);
      expect(editor.undo).toHaveBeenCalledOnce();
    },
  );

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
