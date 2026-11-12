// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { NativeRevertToPublished } from "../../../../apps/admin/src/cms-ui/web-studio/collections/shared/document-workspace/native-revert-status";

const fixture = vi.hoisted(() => ({
  info: {} as Record<string, unknown>,
}));

vi.mock(
  "../../../../apps/admin/node_modules/@payloadcms/ui/dist/exports/client/index.js",
  () => ({ useDocumentInfo: () => fixture.info }),
);

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fixture.info = {
    id: 13,
    collectionSlug: "pages",
    hasPublishedDoc: true,
    unpublishedVersionCount: 2,
    isTrashed: false,
    docPermissions: { update: true },
  };
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

it("withholds unsafe revert until server-side revision fencing is available", () => {
  render(<NativeRevertToPublished />);
  expect(
    screen.queryByRole("button", { name: "Revert to published" }),
  ).toBeNull();
  const unavailable = screen.getByRole("button", {
    name: "Revert unavailable",
  });
  expect(unavailable.hasAttribute("disabled")).toBe(true);
  expect(unavailable.getAttribute("title")).toContain("newer saves");
  fireEvent.click(unavailable);
  expect(fetchMock).not.toHaveBeenCalled();
});

it.each([
  ["a published document with nothing newer", { unpublishedVersionCount: 0 }],
  ["a draft that was never published", { hasPublishedDoc: false }],
  ["a viewer who cannot edit", { docPermissions: { update: false } }],
  ["a trashed document", { isTrashed: true }],
  ["a collection without a slug", { collectionSlug: undefined }],
  ["an unsaved document", { id: undefined }],
])("stays out of the bar for %s", (_label, override) => {
  fixture.info = { ...fixture.info, ...override };
  const view = render(<NativeRevertToPublished />);
  expect(view.container.textContent).toBe("");
  expect(fetchMock).not.toHaveBeenCalled();
});
