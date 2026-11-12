// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { NativeRevertToPublished } from "../../../../apps/admin/src/cms-ui/web-studio/collections/shared/document-workspace/native-revert-status";

const fixture = vi.hoisted(() => ({
  info: {} as Record<string, unknown>,
  reset: vi.fn(async () => {}),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
  locale: { code: "en" } as { code?: string } | undefined,
  reverted: vi.fn(),
}));

// The revert reads Payload's providers through its client barrel, the same
// module instance the admin providers come from. (Payload's deep-imported
// `Status` element read separate provider modules, saw no document and
// rendered the raw key "version:draft" with no revert action.)
vi.mock(
  "../../../../apps/admin/node_modules/@payloadcms/ui/dist/exports/client/index.js",
  async (importOriginal) => ({
    ...(await importOriginal<
      typeof import("../../../../apps/admin/node_modules/@payloadcms/ui/dist/exports/client/index.js")
    >()),
    useDocumentInfo: () => fixture.info,
    useConfig: () => ({ config: { routes: { api: "/web-studio-api" } } }),
    useForm: () => ({ reset: fixture.reset }),
    useLocale: () => fixture.locale,
    toast: { success: fixture.toastSuccess, error: fixture.toastError },
  }),
);

const LIVE_WITH_DRAFT = {
  id: 13,
  collectionSlug: "pages",
  hasPublishedDoc: true,
  unpublishedVersionCount: 2,
  isTrashed: false,
  docPermissions: { update: true },
};

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fixture.info = {
    ...LIVE_WITH_DRAFT,
    incrementVersionCount: vi.fn(),
    setMostRecentVersionIsAutosaved: vi.fn(),
    setUnpublishedVersionCount: vi.fn(),
  };
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

function openAndConfirm() {
  render(<NativeRevertToPublished onReverted={fixture.reverted} />);
  fireEvent.click(screen.getByRole("button", { name: "Revert to published" }));
  const dialog = screen.getByRole("alertdialog");
  expect(dialog.textContent).toContain("Discard the unpublished changes");
  fireEvent.click(screen.getByRole("button", { name: "Revert" }));
}

it("asks first, then restores the published version into the form", async () => {
  const published = { id: 13, title: "Contact Us", _status: "published" };
  fetchMock
    .mockResolvedValueOnce(new Response(JSON.stringify(published)))
    .mockResolvedValueOnce(
      new Response(JSON.stringify({ doc: published, message: "Updated" }), {
        status: 200,
      }),
    );

  openAndConfirm();

  await waitFor(() => expect(fixture.reset).toHaveBeenCalledWith(published));
  const url = "/web-studio-api/pages/13?locale=en&fallback-locale=null&depth=0";
  expect(fetchMock).toHaveBeenNthCalledWith(
    1,
    url,
    expect.objectContaining({ method: "GET", credentials: "include" }),
  );
  expect(fetchMock).toHaveBeenNthCalledWith(
    2,
    url,
    expect.objectContaining({
      method: "PATCH",
      credentials: "include",
      body: JSON.stringify(published),
    }),
  );
  const info = fixture.info as Record<string, ReturnType<typeof vi.fn>>;
  expect(info.setUnpublishedVersionCount).toHaveBeenCalledWith(0);
  expect(info.setMostRecentVersionIsAutosaved).toHaveBeenCalledWith(false);
  expect(info.incrementVersionCount).toHaveBeenCalled();
  expect(fixture.toastSuccess).toHaveBeenCalledWith("Updated");
  expect(fixture.reverted).toHaveBeenCalled();
});

it("reports a failed revert and leaves the draft in place", async () => {
  fetchMock
    .mockResolvedValueOnce(new Response(JSON.stringify({ id: 13 })))
    .mockResolvedValueOnce(
      new Response(JSON.stringify({ errors: [{ message: "Not allowed" }] }), {
        status: 403,
      }),
    );

  openAndConfirm();

  await waitFor(() =>
    expect(fixture.toastError).toHaveBeenCalledWith("Not allowed"),
  );
  expect(fixture.reset).not.toHaveBeenCalled();
  expect(fixture.reverted).not.toHaveBeenCalled();
});

it.each([403, 500])(
  "does not write or reset the draft when the published read returns %s",
  async (status) => {
    fetchMock
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ errors: [{ message: "Published read failed" }] }),
          { status },
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ doc: { id: 13 } }), { status: 200 }),
      );

    openAndConfirm();

    await waitFor(() => expect(fixture.toastError).toHaveBeenCalled());
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fixture.reset).not.toHaveBeenCalled();
    expect(fixture.toastSuccess).not.toHaveBeenCalled();
    expect(fixture.reverted).not.toHaveBeenCalled();
    const info = fixture.info as Record<string, ReturnType<typeof vi.fn>>;
    expect(info.setUnpublishedVersionCount).not.toHaveBeenCalled();
    expect(info.incrementVersionCount).not.toHaveBeenCalled();
  },
);

it("does not cancel with a dead button: Cancel keeps the draft", () => {
  render(<NativeRevertToPublished />);
  fireEvent.click(screen.getByRole("button", { name: "Revert to published" }));
  fireEvent.click(screen.getByRole("button", { name: "Keep draft" }));
  expect(fetchMock).not.toHaveBeenCalled();
});

it("leaves the locale out for a collection without localization", async () => {
  fixture.locale = undefined;
  fetchMock
    .mockResolvedValueOnce(new Response(JSON.stringify({ id: 13 })))
    .mockResolvedValueOnce(
      new Response(JSON.stringify({ doc: { id: 13 } }), { status: 200 }),
    );
  openAndConfirm();
  await waitFor(() => expect(fixture.reset).toHaveBeenCalled());
  expect(fetchMock.mock.calls[0]?.[0]).toBe("/web-studio-api/pages/13?depth=0");
  fixture.locale = { code: "en" };
});

it.each([
  ["a published document with nothing newer", { unpublishedVersionCount: 0 }],
  ["a draft that was never published", { hasPublishedDoc: false }],
  ["a viewer who cannot edit", { docPermissions: { update: false } }],
  ["a trashed document", { isTrashed: true }],
])("stays out of the bar for %s", (_label, override) => {
  fixture.info = { ...fixture.info, ...override };
  const view = render(<NativeRevertToPublished />);
  expect(view.container.textContent).toBe("");
});
