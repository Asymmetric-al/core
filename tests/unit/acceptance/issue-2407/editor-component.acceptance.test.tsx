/** @vitest-environment jsdom */
/**
 * #2407 PR (a) criterion 15 [A]: LegacyRichTextEditor with `imagePurpose`
 * posts FormData { file, purpose } with the session bearer to
 * /api/upload/editor-image and inserts the returned url; it never calls
 * storage.from(...) (M20); without the prop (and without onImageClick) no
 * upload button renders (OQ19). Mount checks are static reads of the four
 * mount files. Seams: @asym/database/supabase createBrowserClient and fetch.
 */
import { readFileSync } from "node:fs";

import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  LegacyRichTextEditor,
  type LegacyRichTextEditorProps,
} from "../../../../packages/ui/components/shadcn/rich-text-editor/legacy-rich-text-editor";

const h = vi.hoisted(() => ({ from: vi.fn(), getSession: vi.fn() }));
vi.mock("@asym/database/supabase", () => ({
  createBrowserClient: () => ({
    auth: { getSession: h.getSession },
    storage: { from: h.from },
  }),
}));

const TOKEN = "session-access-token";
const URL = "https://storage.example/document-uploads/editor/t/u/x.webp";
const fileInput = (c: HTMLElement) => c.querySelector('input[type="file"]');
function mount(extra: Record<string, unknown>) {
  const onChange = vi.fn();
  const props = {
    "aria-label": "Editor",
    value: "",
    onChange,
    ...extra,
  } as LegacyRichTextEditorProps;
  return { onChange, ...render(<LegacyRichTextEditor {...props} />) };
}
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("#2407a criterion 15 [A] editor component", () => {
  it("#2407a criterion 15: with imagePurpose it posts { file, purpose } with the session bearer to /api/upload/editor-image, inserts the returned url and never calls storage.from (M20)", async () => {
    h.getSession.mockResolvedValue({
      data: { session: { access_token: TOKEN } },
      error: null,
    });
    const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ url: URL, path: "editor/t/u/x.webp" }), {
        status: 201,
        headers: { "content-type": "application/json" },
      }),
    );
    const { container, onChange } = mount({ imagePurpose: "feed" });
    const input = fileInput(container);
    expect(input, "upload button with imagePurpose").not.toBeNull();
    const file = new File([new Uint8Array([0x89, 0x50])], "photo.png", {
      type: "image/png",
    });
    fireEvent.change(input!, { target: { files: [file] } });
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    const [url, init] = fetch.mock.calls[0]! as [
      string | URL | Request,
      RequestInit,
    ];
    expect(String(url instanceof Request ? url.url : url)).toMatch(
      /(^|\/)api\/upload\/editor-image$/,
    );
    expect(init.method).toBe("POST");
    expect(new Headers(init.headers).get("authorization")).toBe(
      `Bearer ${TOKEN}`,
    );
    expect(init.body).toBeInstanceOf(FormData);
    const body = init.body as FormData;
    expect(body.get("purpose")).toBe("feed");
    expect(body.get("file")).toBe(file);
    await waitFor(() => expect(onChange.mock.calls.at(-1)?.[0]).toContain(URL));
    expect(h.from).not.toHaveBeenCalled();
  });
  it("#2407a criterion 15: without imagePurpose (and without onImageClick) no upload button renders", () => {
    const { container, queryByText } = mount({});
    expect(fileInput(container)).toBeNull();
    expect(queryByText("Upload image")).toBeNull();
  });
  it("#2407a criterion 15: onImageClick still renders the click button, not the upload input", () => {
    const { container, getByLabelText } = mount({ onImageClick: vi.fn() });
    expect(getByLabelText("Insert image")).toBeDefined();
    expect(fileInput(container)).toBeNull();
  });
  it.each([
    [
      "apps/admin/features/mission-control/care/components/PersonnelProfile.tsx",
      "Care thread update",
      "care-thread",
    ],
    [
      "apps/admin/features/mission-control/care/components/PersonnelProfile.tsx",
      "Private care note",
      "care-note",
    ],
    [
      "apps/admin/app/(app)/feed/org-updates/page-client.tsx",
      "Organization post content",
      "feed",
    ],
    [
      "apps/missionary/app/feed/worker-feed-page-client.tsx",
      "Ministry post content",
      "feed",
    ],
  ])(
    "#2407a criterion 15: mount %s '%s' passes imagePurpose=%s",
    (path, label, purpose) => {
      const src = readFileSync(path, "utf8");
      const at = src.indexOf(`aria-label="${label}"`);
      expect(at, `${label} mount`).toBeGreaterThan(-1);
      const open = src.lastIndexOf("<", at);
      const element = src.slice(open, src.indexOf(">", at));
      expect(element).toMatch(/^<(Legacy)?RichTextEditor\b/);
      expect(element).toContain(`imagePurpose="${purpose}"`);
    },
  );
});
