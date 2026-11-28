// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  MediaDeleteButton,
  MediaUploadButton,
  mediaThumbnail,
} from "../../../../apps/admin/src/cms-ui/web-studio/media/media-library-controls";

const adapter = vi.hoisted(() => ({
  upload: vi.fn(),
  register: vi.fn(),
  remove: vi.fn(),
}));

vi.mock(
  "../../../../apps/admin/src/cms-ui/web-studio/media/media-upload",
  async (importOriginal) => ({
    ...(await importOriginal<object>()),
    uploadMediaFile: adapter.upload,
    registerUploadedMedia: adapter.register,
    deleteMediaFile: adapter.remove,
  }),
);

const ASSET = "6b3b7f6e-9f0a-4c1d-8e2f-3a4b5c6d7e8f";

beforeEach(() => {
  adapter.upload.mockReset();
  adapter.register.mockReset();
  adapter.remove.mockReset();
});

afterEach(cleanup);

const photo = () =>
  new File([new Uint8Array([0xff, 0xd8, 0xff, 0xd9])], "well.jpg", {
    type: "image/jpeg",
  });

function openUpload(onUploaded = vi.fn()) {
  render(<MediaUploadButton onUploaded={onUploaded} />);
  fireEvent.click(screen.getByRole("button", { name: "Upload image" }));
  return onUploaded;
}

function fill({ file = photo(), alt = "A new well" } = {}) {
  fireEvent.change(screen.getByLabelText("Image file"), {
    target: { files: file ? [file] : [] },
  });
  fireEvent.change(screen.getByLabelText("Alt text"), {
    target: { value: alt },
  });
}

describe("the media library's upload control (WP6 rest, pull request 2)", () => {
  it("is a named button that opens a form with a named file field and alt text", async () => {
    openUpload();
    expect(
      await screen.findByRole("dialog", { name: "Upload image" }),
    ).toBeTruthy();
    expect(screen.getByLabelText("Image file")).toBeTruthy();
    expect(screen.getByLabelText("Alt text")).toBeTruthy();
    expect(screen.getByLabelText("Credit")).toBeTruthy();
    expect(screen.getByLabelText("Folder")).toBeTruthy();
  });

  it("asks for a file and alt text before it sends anything", async () => {
    openUpload();
    fireEvent.click(await screen.findByRole("button", { name: "Upload" }));
    expect(await screen.findByText("Choose an image to upload.")).toBeTruthy();
    expect(
      screen.getByText("Describe the image for people who cannot see it."),
    ).toBeTruthy();
    expect(adapter.upload).not.toHaveBeenCalled();
  });

  it("shows that it is uploading, then closes and tells the library", async () => {
    let finish!: (value: unknown) => void;
    adapter.upload.mockReturnValueOnce(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    const onUploaded = openUpload();
    fill();
    fireEvent.click(await screen.findByRole("button", { name: "Upload" }));
    const busy = await screen.findByRole("button", { name: "Uploading…" });
    expect(
      busy.hasAttribute("disabled") ||
        busy.getAttribute("aria-disabled") === "true",
    ).toBe(true);
    expect(adapter.upload).toHaveBeenCalledWith(expect.any(File), {
      alt: "A new well",
      credit: null,
      folder: null,
    });
    finish({ ok: true, id: ASSET });
    await waitFor(() => expect(onUploaded).toHaveBeenCalledWith(ASSET));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("shows a refusal (an image over the limit) and keeps the form open", async () => {
    adapter.upload.mockResolvedValueOnce({
      ok: false,
      stage: "finalize",
      assetId: ASSET,
      message: "Image exceeds 25 megapixel limit",
    });
    const onUploaded = openUpload();
    fill();
    fireEvent.click(await screen.findByRole("button", { name: "Upload" }));
    expect(await screen.findByRole("alert")).toHaveProperty(
      "textContent",
      expect.stringContaining("Image exceeds 25 megapixel limit"),
    );
    expect(onUploaded).not.toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: "Try again" })).toBeNull();
  });

  it("offers to finish a registration that failed after the file was stored, without uploading again", async () => {
    adapter.upload.mockResolvedValueOnce({
      ok: false,
      stage: "register",
      assetId: ASSET,
      message: "Something went wrong.",
    });
    adapter.register.mockResolvedValueOnce({ ok: true, id: ASSET });
    const onUploaded = openUpload();
    fill();
    fireEvent.click(await screen.findByRole("button", { name: "Upload" }));
    fireEvent.click(await screen.findByRole("button", { name: "Try again" }));
    await waitFor(() => expect(onUploaded).toHaveBeenCalledWith(ASSET));
    expect(adapter.register).toHaveBeenCalledWith(ASSET, {
      alt: "A new well",
      credit: null,
      folder: null,
    });
    expect(adapter.upload).toHaveBeenCalledTimes(1);
  });
});

describe("the media library's delete control (WP6 rest, pull request 2)", () => {
  it("asks first, then deletes and tells the library", async () => {
    adapter.remove.mockResolvedValueOnce({ ok: true });
    const onDeleted = vi.fn();
    render(
      <MediaDeleteButton id={ASSET} label="A new well" onDeleted={onDeleted} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Delete image" }));
    expect(
      await screen.findByRole("alertdialog", { name: "Delete this image?" }),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    await waitFor(() => expect(onDeleted).toHaveBeenCalled());
    expect(adapter.remove).toHaveBeenCalledWith(ASSET);
  });

  it("shows why a delete failed and deletes nothing more", async () => {
    adapter.remove.mockResolvedValueOnce({ ok: false, message: "Forbidden" });
    const onDeleted = vi.fn();
    render(
      <MediaDeleteButton id={ASSET} label="A new well" onDeleted={onDeleted} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Delete image" }));
    fireEvent.click(await screen.findByRole("button", { name: "Delete" }));
    expect(await screen.findByRole("alert")).toHaveProperty(
      "textContent",
      expect.stringContaining("Forbidden"),
    );
    expect(onDeleted).not.toHaveBeenCalled();
  });
});

describe("the media library's dialogs are never left busy, and keep a stored file's retry (fix round F4)", () => {
  it("ends an upload whose request throws: the failure shows, Upload works again and the dialog closes", async () => {
    adapter.upload.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    openUpload();
    fill();
    fireEvent.click(await screen.findByRole("button", { name: "Upload" }));
    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Upload" }).hasAttribute("disabled"),
    ).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("keeps Try again when the registration retry throws", async () => {
    adapter.upload.mockResolvedValueOnce({
      ok: false,
      stage: "register",
      assetId: ASSET,
      message: "Something went wrong.",
    });
    adapter.register.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    openUpload();
    fill();
    fireEvent.click(await screen.findByRole("button", { name: "Upload" }));
    fireEvent.click(await screen.findByRole("button", { name: "Try again" }));
    await waitFor(() =>
      expect(
        screen
          .getByRole("button", { name: "Try again" })
          .hasAttribute("disabled"),
      ).toBe(false),
    );
    expect(adapter.upload).toHaveBeenCalledTimes(1);
  });

  it("ends a delete whose request throws: the failure shows and Delete and Cancel work again", async () => {
    adapter.remove.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    render(
      <MediaDeleteButton id={ASSET} label="A new well" onDeleted={vi.fn()} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Delete image" }));
    fireEvent.click(await screen.findByRole("button", { name: "Delete" }));
    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Delete" }).hasAttribute("disabled"),
    ).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
  });
});

describe("the media library's dialogs open from the shared triggers and close with Cancel (fix round F6)", () => {
  it("returns focus to Upload image when the dialog closes, and its Cancel closes it", async () => {
    openUpload();
    fireEvent.click(await screen.findByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Upload image" }),
      ),
    );
  });

  it("disables Cancel while an upload is running", async () => {
    adapter.upload.mockReturnValueOnce(new Promise(() => {}));
    openUpload();
    fill();
    fireEvent.click(await screen.findByRole("button", { name: "Upload" }));
    await screen.findByRole("button", { name: "Uploading…" });
    expect(
      screen.getByRole("button", { name: "Cancel" }).hasAttribute("disabled"),
    ).toBe(true);
  });

  it("returns focus to Delete image when the confirmation closes", async () => {
    render(
      <MediaDeleteButton id={ASSET} label="A new well" onDeleted={vi.fn()} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Delete image" }));
    fireEvent.click(await screen.findByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Delete image" }),
      ),
    );
  });
});

describe("the upload form checks what the registration checks, and leads to the first field to fix (fix rounds F8 and F9)", () => {
  it.each([
    ["Alt text", "Alt text"],
    ["Credit", "Credit"],
    ["Folder", "Folder"],
  ])(
    "refuses %s over 500 characters before anything is sent, and focuses it",
    async (label) => {
      openUpload();
      fill();
      fireEvent.change(screen.getByLabelText(label), {
        target: { value: "x".repeat(501) },
      });
      fireEvent.click(await screen.findByRole("button", { name: "Upload" }));
      const field = screen.getByLabelText(label);
      await waitFor(() => expect(document.activeElement).toBe(field));
      expect(field.getAttribute("aria-invalid")).toBe("true");
      expect(screen.getByText(/at most 500 characters/)).toBeTruthy();
      expect(adapter.upload).not.toHaveBeenCalled();
    },
  );

  it("focuses the file field first when the file and the alt text are both missing", async () => {
    openUpload();
    const upload = await screen.findByRole("button", { name: "Upload" });
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByLabelText("Image file")),
    );
    upload.focus();
    fireEvent.click(upload);
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByLabelText("Image file")),
    );
  });

  it("focuses the alt text when only it is missing", async () => {
    openUpload();
    fill({ alt: "  " });
    fireEvent.click(await screen.findByRole("button", { name: "Upload" }));
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByLabelText("Alt text")),
    );
  });
});

describe("the upload dialog fits a short viewport and 200% zoom (round 2, G4)", () => {
  it("scrolls its content inside the dialog, with the shared dialog's own option", async () => {
    openUpload();
    const dialog = await screen.findByRole("dialog", { name: "Upload image" });
    expect(dialog.className).toContain("overflow-y-auto");
    expect(dialog.className).toContain("max-h-[calc(100dvh");
  });
});

describe("the media library's thumbnails (invariant 5)", () => {
  it("come from the signed-in media route's smallest variant", () => {
    expect(mediaThumbnail({ id: ASSET.toUpperCase(), alt: "x" })).toBe(
      `/api/media/${ASSET}?variant=w320`,
    );
    expect(mediaThumbnail({ id: 7 })).toBeNull();
    expect(
      mediaThumbnail({ id: ASSET, url: "https://x.supabase.co/storage/a.jpg" }),
    ).toBe(`/api/media/${ASSET}?variant=w320`);
  });
});

describe("the delete dialog says what is true at each stage (WP7 item zero, #2839 10:03)", () => {
  it.each([
    "The image could not be deleted. Check your connection and try again.",
    "The image was deleted but is still listed. Try again.",
  ])(
    "heads the failure “%s” with a heading true before and after the file is gone",
    async (message) => {
      adapter.remove.mockResolvedValueOnce({ ok: false, message });
      render(
        <MediaDeleteButton id={ASSET} label="A new well" onDeleted={vi.fn()} />,
      );
      fireEvent.click(screen.getByRole("button", { name: "Delete image" }));
      fireEvent.click(await screen.findByRole("button", { name: "Delete" }));
      const alert = await screen.findByRole("alert");
      expect(alert.textContent).toContain("Image deletion could not finish");
      expect(alert.textContent).toContain(message);
      expect(alert.textContent).not.toContain("The image was not deleted");
    },
  );
});
