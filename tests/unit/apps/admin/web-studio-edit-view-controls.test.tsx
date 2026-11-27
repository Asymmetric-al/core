// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) Regression uses the editor's installed Query context at its app boundary.
import {
  QueryClient,
  QueryClientProvider,
} from "../../../../apps/admin/node_modules/@tanstack/react-query/build/modern/index.js";
// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) The real app editor is the public boundary under test.
import { NativeCollectionEditView } from "../../../../apps/admin/src/cms-ui/web-studio/collections/shared/document-workspace/NativeCollectionEditView";

import type { ComponentProps, ReactNode } from "react";

const ME = "00000000-0000-4000-8000-0000000000a1";
const OTHER = "00000000-0000-4000-8000-0000000000b2";

const fixture = vi.hoisted(() => ({
  info: {} as Record<string, unknown>,
  user: { id: "" } as { id: string } | null,
}));

vi.mock(
  "../../../../apps/admin/node_modules/@payloadcms/ui/dist/exports/client/index.js",
  () => ({
    DefaultEditView: ({
      BeforeDocumentControls,
      PublishButton,
      UnpublishButton,
    }: {
      BeforeDocumentControls?: ReactNode;
      PublishButton?: ReactNode;
      UnpublishButton?: ReactNode;
    }) => (
      <div>
        {BeforeDocumentControls}
        {PublishButton ?? <button type="button">Publish changes</button>}
        {UnpublishButton ?? <button type="button">Unpublish</button>}
        <button type="button">Save draft</button>
      </div>
    ),
    useAuth: () => ({ user: fixture.user }),
    useConfig: () => ({ config: { routes: { api: "/web-studio/api" } } }),
    useDocumentInfo: () => fixture.info,
    useDocumentTitle: () => ({ title: "About" }),
    useLocale: () => ({ code: "en" }),
    useForm: () => ({ isValid: true }),
    useFormBackgroundProcessing: () => false,
    useFormInitializing: () => false,
    useFormModified: () => false,
    useFormProcessing: () => false,
    useFormSubmitted: () => false,
    useLivePreviewContext: () => ({
      isLivePreviewEnabled: false,
      previewURL: "/web-studio/preview/pages/42",
      setPreviewURL: vi.fn(),
    }),
    usePreferences: () => ({
      getPreference: vi.fn(async () => undefined),
      setPreference: vi.fn(async () => undefined),
    }),
  }),
);

vi.mock("../../../../apps/admin/src/cms-ui/web-studio/routing", () => ({
  Link: (props: ComponentProps<"a">) => <a {...props} />,
}));
vi.mock(
  "../../../../apps/admin/src/cms-ui/web-studio/shell/studio-layout",
  () => ({ StudioLayout: ({ children }: { children: ReactNode }) => children }),
);
vi.mock(
  "../../../../apps/admin/src/cms-ui/web-studio/collections/shared/document-workspace/NativeDocumentWorkspaceSettingsDialog",
  () => ({ NativeDocumentWorkspaceSettingsDialog: () => null }),
);
vi.mock(
  "../../../../apps/admin/src/cms-ui/web-studio/collections/shared/document-workspace/document-pin-toggle",
  () => ({ DocumentPinToggle: () => null }),
);

let queryClient: QueryClient;

beforeEach(() => {
  fixture.user = { id: ME };
  fixture.info = {
    id: 42,
    collectionSlug: "pages",
    currentEditor: null,
    data: {
      id: 42,
      _status: "draft",
      slug: "about",
      tenant: 7,
      updatedAt: "2026-11-27T10:00:00.000Z",
    },
    docPermissions: { read: true, update: true },
    documentIsLocked: false,
    hasPublishedDoc: false,
    hasPublishPermission: true,
    hasSavePermission: true,
    isInitializing: false,
    isTrashed: false,
    lastUpdateTime: 1,
    unpublishedVersionCount: 0,
    versionCount: 1,
  };
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response("{}", { status: 404 })),
  );
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
});

afterEach(() => {
  cleanup();
  queryClient.clear();
  vi.unstubAllGlobals();
});

function editor() {
  return render(
    <QueryClientProvider client={queryClient}>
      <NativeCollectionEditView studioCollection="pages" />
    </QueryClientProvider>,
  );
}

describe("the edit view offers nothing the server refuses (WP6 rest, pull request 2, invariant 7)", () => {
  it("shows no Publish and no Unpublish, even to a person Payload would let publish, and keeps Save draft", () => {
    editor();
    expect(screen.queryAllByRole("button", { name: /publish/i })).toEqual([]);
    expect(screen.getByRole("button", { name: "Save draft" })).toBeTruthy();
  });

  it("never says another editor is active on the person's own lock", () => {
    Object.assign(fixture.info, {
      documentIsLocked: true,
      currentEditor: { id: ME },
    });
    editor();
    expect(screen.queryAllByText("Locked")).toEqual([]);
    expect(
      screen.queryAllByText("Another editor is active on this document."),
    ).toEqual([]);
  });

  it("says Locked when another person holds the lock", () => {
    Object.assign(fixture.info, {
      documentIsLocked: true,
      currentEditor: { id: OTHER },
    });
    editor();
    expect(screen.getAllByText("Locked").length).toBeGreaterThan(0);
  });
});
