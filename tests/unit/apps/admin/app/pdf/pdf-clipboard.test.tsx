/** @vitest-environment jsdom */

import {
  act,
  cleanup,
  fireEvent,
  render,
  renderHook,
  screen,
} from "@testing-library/react";
import { toast } from "sonner";
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

vi.mock("@asym/ui/components/studio/legacy/UnlayerDocumentEditor", async () => {
  const { forwardRef, useEffect, useImperativeHandle } = await import("react");
  const { getPDFStudioConfig } = await import("@asym/config/pdf-studio");
  return {
    LegacyUnlayerDocumentEditor: forwardRef<
      { exportHtml: () => Promise<{ html: string }> },
      LegacyUnlayerDocumentEditorProps
    >(function MockDocumentEditor({ onReady }, ref) {
      useImperativeHandle(
        ref,
        () => ({
          exportHtml: async () => ({ html: "<main>Document source</main>" }),
        }),
        [],
      );
      useEffect(() => {
        onReady?.(getPDFStudioConfig());
      }, [onReady]);
      return null;
    }),
  };
});
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const loadStudio = () =>
  import("../../../../../../apps/admin/app/(app)/pdf/page-client");
let studio: Awaited<ReturnType<typeof loadStudio>>;

beforeAll(async () => {
  studio = await loadStudio();
}, 60_000);

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  if (vi.isFakeTimers()) vi.clearAllTimers();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function renderClipboardController(
  engine: "unlayer" | "asym_pdf_document_builder" = "unlayer",
) {
  const view = renderHook(() => studio.usePDFStudioController());
  act(() => {
    view.result.current.setMetadata({
      ...view.result.current.metadata,
      engine,
    });
    view.result.current.dispatchUi({
      type: "open_export_dialog",
      html:
        engine === "unlayer"
          ? "<main>Document source</main>"
          : '{"type":"document"}',
    });
  });
  return view;
}

describe("PDF Studio clipboard feedback", () => {
  it.each([
    ["unlayer", "HTML", "<main>Document source</main>"],
    ["asym_pdf_document_builder", "JSON", '{"type":"document"}'],
  ] as const)(
    "waits for the clipboard write before reporting %s copied",
    async (engine, format, source) => {
      let finishWrite!: () => void;
      const writeText = vi.fn(
        () =>
          new Promise<void>((resolve) => {
            finishWrite = resolve;
          }),
      );
      vi.stubGlobal("navigator", { clipboard: { writeText } });
      const { result } = renderClipboardController(engine);
      let copyResult: void | Promise<void>;

      act(() => {
        copyResult = result.current.handleCopyHtml();
      });

      expect(writeText).toHaveBeenCalledExactlyOnceWith(source);
      expect(result.current.copiedHtml).toBe(false);
      expect(result.current.isCopyingHtml).toBe(true);
      expect(toast.success).not.toHaveBeenCalled();
      expect(toast.error).not.toHaveBeenCalled();

      act(() => vi.advanceTimersByTime(3000));
      expect(toast.success).not.toHaveBeenCalled();

      await act(async () => {
        finishWrite();
        await copyResult;
      });

      expect(result.current.copiedHtml).toBe(true);
      expect(result.current.isCopyingHtml).toBe(false);
      expect(toast.success).toHaveBeenCalledExactlyOnceWith(
        `${format} copied to clipboard`,
      );
      expect(toast.error).not.toHaveBeenCalled();

      act(() => vi.advanceTimersByTime(1999));
      expect(result.current.copiedHtml).toBe(true);
      act(() => vi.advanceTimersByTime(1));
      expect(result.current.copiedHtml).toBe(false);
    },
  );

  it.each([
    ["unlayer", "HTML"],
    ["asym_pdf_document_builder", "JSON"],
  ] as const)(
    "reports a rejected %s copy and permits a retry",
    async (engine, format) => {
      const writeText = vi
        .fn()
        .mockRejectedValueOnce(
          new DOMException("Permission denied", "NotAllowedError"),
        )
        .mockResolvedValueOnce(undefined);
      vi.stubGlobal("navigator", { clipboard: { writeText } });
      const { result } = renderClipboardController(engine);

      await act(async () => {
        await expect(result.current.handleCopyHtml()).resolves.toBeUndefined();
      });

      expect(result.current.copiedHtml).toBe(false);
      expect(result.current.isCopyingHtml).toBe(false);
      expect(toast.success).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledExactlyOnceWith("Copy failed", {
        description: `Could not copy ${format} to the clipboard. Try again or download the source.`,
      });

      await act(() => result.current.handleCopyHtml());

      expect(writeText).toHaveBeenCalledTimes(2);
      expect(result.current.copiedHtml).toBe(true);
      expect(toast.success).toHaveBeenCalledExactlyOnceWith(
        `${format} copied to clipboard`,
      );
    },
  );

  it.each([
    ["the clipboard API", undefined],
    ["the writeText method", {}],
  ])(
    "offers download instead when %s is unavailable",
    async (_label, clipboard) => {
      vi.stubGlobal("navigator", { clipboard });
      const { result } = renderClipboardController();

      await act(async () => {
        await expect(result.current.handleCopyHtml()).resolves.toBeUndefined();
      });

      expect(result.current.copiedHtml).toBe(false);
      expect(result.current.isCopyingHtml).toBe(false);
      expect(toast.success).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledExactlyOnceWith("Copy unavailable", {
        description:
          "Clipboard access is unavailable. Download the source instead.",
      });
    },
  );

  it("handles a synchronous clipboard failure without reporting success", async () => {
    const writeText = vi.fn(() => {
      throw new Error("Clipboard access denied");
    });
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    const { result } = renderClipboardController();

    await act(async () => {
      await expect(result.current.handleCopyHtml()).resolves.toBeUndefined();
    });

    expect(result.current.copiedHtml).toBe(false);
    expect(result.current.isCopyingHtml).toBe(false);
    expect(toast.success).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith("Copy failed", expect.any(Object));
  });

  it("keeps one clipboard write in flight across both copy controls", async () => {
    let finishWrite!: () => void;
    const writeText = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finishWrite = resolve;
        }),
    );
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    const { result } = renderClipboardController();
    let copyResult: Promise<void>;

    act(() => {
      copyResult = result.current.handleCopyHtml();
      void result.current.handleCopyHtml();
    });

    expect(result.current.isCopyingHtml).toBe(true);
    expect(result.current.copiedHtml).toBe(false);
    expect(writeText).toHaveBeenCalledOnce();
    expect(toast.success).not.toHaveBeenCalled();

    await act(async () => {
      finishWrite();
      await copyResult;
    });

    expect(result.current.isCopyingHtml).toBe(false);
    expect(result.current.copiedHtml).toBe(true);
    expect(toast.success).toHaveBeenCalledOnce();
  });

  it("clears an earlier copied state while a new attempt is pending", async () => {
    let finishWrite!: () => void;
    const writeText = vi
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockImplementationOnce(
        () =>
          new Promise<void>((resolve) => {
            finishWrite = resolve;
          }),
      );
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    const { result } = renderClipboardController();
    await act(() => result.current.handleCopyHtml());
    expect(result.current.copiedHtml).toBe(true);
    act(() => vi.advanceTimersByTime(1000));
    let copyResult: Promise<void>;

    act(() => {
      copyResult = result.current.handleCopyHtml();
    });

    expect(result.current.copiedHtml).toBe(false);
    expect(toast.success).toHaveBeenCalledOnce();

    await act(async () => {
      finishWrite();
      await copyResult;
    });
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.copiedHtml).toBe(true);
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.copiedHtml).toBe(false);
  });

  it("gives each immediately fulfilled copy its full feedback window", async () => {
    vi.stubGlobal("navigator", {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
    const { result } = renderClipboardController();
    await act(() => result.current.handleCopyHtml());
    act(() => vi.advanceTimersByTime(1000));

    await act(() => result.current.handleCopyHtml());

    expect(toast.success).toHaveBeenCalledTimes(2);
    act(() => vi.advanceTimersByTime(1999));
    expect(result.current.copiedHtml).toBe(true);
    act(() => vi.advanceTimersByTime(1));
    expect(result.current.copiedHtml).toBe(false);
  });

  it("cleans up copied feedback when the studio unmounts", async () => {
    vi.stubGlobal("navigator", {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
    const { result, unmount } = renderClipboardController();
    await act(() => result.current.handleCopyHtml());
    expect(result.current.copiedHtml).toBe(true);
    expect(vi.getTimerCount()).toBe(1);

    unmount();

    expect(vi.getTimerCount()).toBe(0);
  });

  it.each(["success", "failure"])(
    "shows pending feedback in the export dialog before clipboard %s",
    async (outcome) => {
      vi.useRealTimers();
      let finishWrite!: () => void;
      const writeText = vi.fn(
        () =>
          new Promise<void>((resolve, reject) => {
            finishWrite = () => {
              if (outcome === "success") resolve();
              else
                reject(
                  new DOMException("Permission denied", "NotAllowedError"),
                );
            };
          }),
      );
      vi.stubGlobal("navigator", {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        clipboard: { writeText },
      });
      render(<studio.default />);
      fireEvent.click(screen.getByRole("button", { name: "Export" }));
      fireEvent.click(
        await screen.findByRole("menuitem", { name: /Export as HTML/ }),
      );
      fireEvent.click(await screen.findByRole("button", { name: "Copy HTML" }));

      const copying = screen.getByRole("button", { name: "Copying…" });
      expect(copying.hasAttribute("disabled")).toBe(true);
      expect(copying.getAttribute("aria-busy")).toBe("true");
      expect(screen.getByRole("dialog").getAttribute("aria-busy")).toBe("true");
      expect(screen.queryByRole("button", { name: "Copied!" })).toBeNull();
      expect(
        screen
          .getByRole("button", { name: "Download" })
          .hasAttribute("disabled"),
      ).toBe(false);
      fireEvent.click(
        screen.getByRole("button", { name: "Copy", exact: true }),
      );
      expect(writeText).toHaveBeenCalledExactlyOnceWith(
        "<main>Document source</main>",
      );
      expect(toast.success).not.toHaveBeenCalled();

      await act(async () => finishWrite());

      expect(screen.getByRole("dialog").getAttribute("aria-busy")).toBe(
        "false",
      );
      expect(screen.queryByRole("button", { name: "Copying…" })).toBeNull();
      if (outcome === "success") {
        expect(screen.getAllByRole("button", { name: "Copied!" })).toHaveLength(
          2,
        );
        expect(toast.success).toHaveBeenCalledExactlyOnceWith(
          "HTML copied to clipboard",
        );
        expect(toast.error).not.toHaveBeenCalled();
      } else {
        expect(
          screen
            .getByRole("button", { name: "Copy HTML" })
            .hasAttribute("disabled"),
        ).toBe(false);
        expect(screen.queryByRole("button", { name: "Copied!" })).toBeNull();
        expect(toast.success).not.toHaveBeenCalled();
        expect(toast.error).toHaveBeenCalledWith(
          "Copy failed",
          expect.any(Object),
        );
      }
    },
  );
});
