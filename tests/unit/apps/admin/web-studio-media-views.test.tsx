// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MediaNativeEditView } from "../../../../apps/admin/src/cms-ui/web-studio/media/document/MediaNativeEditView";
import { MediaNativeListView } from "../../../../apps/admin/src/cms-ui/web-studio/media/list/MediaNativeListView";

import type { ReactNode } from "react";

const state = vi.hoisted(() => ({
  permissions: {} as unknown,
  docPermissions: {} as unknown,
}));

vi.mock(
  "../../../../apps/admin/node_modules/@payloadcms/ui/dist/exports/client/index.js",
  () => ({
    useAuth: () => ({ permissions: state.permissions }),
    useDocumentInfo: () => ({
      id: "6b3b7f6e-9f0a-4c1d-8e2f-3a4b5c6d7e8f",
      data: { alt: "A new well" },
      docPermissions: state.docPermissions,
    }),
  }),
);
vi.mock(
  "../../../../apps/admin/src/cms-ui/web-studio/collections/shared/list-workspace/NativeCollectionListView",
  () => ({
    NativeCollectionListView: ({
      studioActions,
    }: {
      studioActions?: ReactNode;
    }) => <div>{studioActions}</div>,
  }),
);
vi.mock(
  "../../../../apps/admin/src/cms-ui/web-studio/collections/shared/document-workspace/NativeCollectionEditView",
  () => ({
    NativeCollectionEditView: ({
      documentActions,
    }: {
      documentActions?: ReactNode;
    }) => <div>{documentActions}</div>,
  }),
);
vi.mock("../../../../apps/admin/src/cms-ui/web-studio/routing", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

beforeEach(() => {
  state.permissions = {};
  state.docPermissions = {};
});

afterEach(cleanup);

describe("the media library offers its controls only to people who may edit (WP6 rest, pull request 2)", () => {
  it("shows Upload image to an editor and not to a reader", () => {
    state.permissions = { collections: { media: { update: true } } };
    const { unmount } = render(<MediaNativeListView {...({} as never)} />);
    expect(screen.getByRole("button", { name: "Upload image" })).toBeTruthy();
    unmount();
    state.permissions = { collections: { media: { update: false } } };
    render(<MediaNativeListView {...({} as never)} />);
    expect(screen.queryAllByRole("button", { name: "Upload image" })).toEqual(
      [],
    );
  });

  it("shows Delete image to an editor of the record and not to a reader", () => {
    state.docPermissions = { update: true };
    const { unmount } = render(<MediaNativeEditView {...({} as never)} />);
    expect(screen.getByRole("button", { name: "Delete image" })).toBeTruthy();
    unmount();
    state.docPermissions = { update: false };
    render(<MediaNativeEditView {...({} as never)} />);
    expect(screen.queryAllByRole("button", { name: "Delete image" })).toEqual(
      [],
    );
  });
});
