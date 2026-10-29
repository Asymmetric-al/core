/** @vitest-environment jsdom */
/** #2407 PR (a) (B): LegacyRichTextEditor uploads through the server route. */
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  LegacyRichTextEditor,
  type EditorImagePurpose,
} from "../../../../../../../packages/ui/components/shadcn/rich-text-editor/legacy-rich-text-editor";

import type * as Sonner from "sonner";

const h = vi.hoisted(() => ({
  from: vi.fn(),
  getSession: vi.fn(),
  toastError: vi.fn(),
}));
vi.mock("@asym/database/supabase", () => ({
  createBrowserClient: () => ({
    auth: { getSession: h.getSession },
    storage: { from: h.from },
  }),
}));
vi.mock("sonner", async (importOriginal) => {
  const actual = await importOriginal<typeof Sonner>();
  Object.assign(actual.toast, { error: h.toastError });
  return actual;
});

function upload(imagePurpose: EditorImagePurpose = "care-note") {
  const onChange = vi.fn();
  const { container } = render(
    <LegacyRichTextEditor
      value=""
      onChange={onChange}
      imagePurpose={imagePurpose}
    />,
  );
  const file = new File([new Uint8Array([0x89, 0x50])], "a.png", {
    type: "image/png",
  });
  fireEvent.change(container.querySelector('input[type="file"]')!, {
    target: { files: [file] },
  });
  return { onChange, file };
}

beforeEach(() => {
  h.getSession.mockResolvedValue({ data: { session: { access_token: "t" } } });
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

describe("#2407a LegacyRichTextEditor image upload (B)", () => {
  it("sends the mount's purpose and the file to the route", async () => {
    const fetch = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        Response.json(
          { url: "https://cdn/editor/x.png", path: "p" },
          { status: 201 },
        ),
      );
    const { onChange, file } = upload("care-note");
    await waitFor(() => expect(onChange).toHaveBeenCalled());
    const [url, init] = fetch.mock.calls[0]! as [string, RequestInit];
    expect(url).toBe("/api/upload/editor-image");
    const body = init.body as FormData;
    expect([body.get("purpose"), body.get("file")]).toEqual([
      "care-note",
      file,
    ]);
    expect(onChange.mock.calls.at(-1)?.[0]).toContain(
      "https://cdn/editor/x.png",
    );
    expect(h.from).not.toHaveBeenCalled();
  });

  it("shows the route's error and inserts nothing when it refuses the file", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json(
        { error: "Image file must be 5 MB or smaller." },
        { status: 413 },
      ),
    );
    const { onChange } = upload();
    await waitFor(() =>
      expect(h.toastError).toHaveBeenCalledWith(
        "Image file must be 5 MB or smaller.",
      ),
    );
    expect(JSON.stringify(onChange.mock.calls)).not.toContain("image");
  });

  it("does not call the route without a session token", async () => {
    h.getSession.mockResolvedValue({ data: { session: null } });
    const fetch = vi.spyOn(globalThis, "fetch");
    upload();
    await waitFor(() => expect(h.toastError).toHaveBeenCalled());
    expect(fetch).not.toHaveBeenCalled();
    expect(h.from).not.toHaveBeenCalled();
  });
});
