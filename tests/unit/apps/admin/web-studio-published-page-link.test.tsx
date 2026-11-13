// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) Regression uses the editor's installed Query context at its app boundary.
import {
  QueryClient,
  QueryClientProvider,
} from "../../../../apps/admin/node_modules/@tanstack/react-query/build/modern/index.js";
// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) The real app editor is the public boundary under test.
import { NativeCollectionEditView } from "../../../../apps/admin/src/cms-ui/web-studio/collections/shared/document-workspace/NativeCollectionEditView";

import type { ComponentProps, ReactNode } from "react";

const fixture = vi.hoisted(() => ({
  info: {
    id: 42,
    collectionSlug: "pages",
    data: {
      id: 42,
      _status: "published",
      slug: "about",
      tenant: 7,
      updatedAt: "2026-11-10T10:00:00.000Z",
    },
    docPermissions: { read: true, update: true },
    hasPublishedDoc: true,
    hasPublishPermission: true,
    hasSavePermission: true,
    isInitializing: false,
    isTrashed: false,
    lastUpdateTime: 1,
    unpublishedVersionCount: 0,
    versionCount: 1,
  },
  api: "/web-studio-api",
  locale: { code: "en" },
  getPreference: vi.fn(async () => undefined),
  setPreference: vi.fn(async () => {}),
  setPreviewURL: vi.fn(),
}));

// The editor/provider boundary is synchronous here. This does not exercise
// Payload's installed async DefaultEditView or the authenticated route.
vi.mock(
  "../../../../apps/admin/node_modules/@payloadcms/ui/dist/exports/client/index.js",
  () => ({
    DefaultEditView: ({
      BeforeDocumentControls,
    }: {
      BeforeDocumentControls?: ReactNode;
    }) => <div>{BeforeDocumentControls}</div>,
    useConfig: () => ({ config: { routes: { api: fixture.api } } }),
    useDocumentInfo: () => fixture.info,
    useDocumentTitle: () => ({ title: "About" }),
    useLocale: () => fixture.locale,
    useForm: () => ({ isValid: true }),
    useFormBackgroundProcessing: () => false,
    useFormInitializing: () => false,
    useFormModified: () => false,
    useFormProcessing: () => false,
    useFormSubmitted: () => false,
    useLivePreviewContext: () => ({
      isLivePreviewEnabled: false,
      previewURL: "/web-studio/preview/pages/42",
      setPreviewURL: fixture.setPreviewURL,
    }),
    usePreferences: () => ({
      getPreference: fixture.getPreference,
      setPreference: fixture.setPreference,
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

const fetchMock = vi.fn<typeof fetch>();
let queryClient: QueryClient;

beforeEach(() => {
  Object.assign(fixture.info, {
    id: 42,
    collectionSlug: "pages",
    data: {
      id: 42,
      _status: "published",
      slug: "about",
      tenant: 7,
      updatedAt: "2026-11-10T10:00:00.000Z",
    },
    docPermissions: { read: true, update: true },
    hasPublishedDoc: true,
    hasPublishPermission: true,
    hasSavePermission: true,
    isInitializing: false,
    isTrashed: false,
    lastUpdateTime: 1,
    unpublishedVersionCount: 0,
    versionCount: 1,
  });
  fixture.api = "/web-studio-api";
  fixture.locale = { code: "en" };
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("NEXT_PUBLIC_DONOR_URL", "https://give.example.org");
  vi.stubEnv("DONOR_APP_URL", "");
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
});

afterEach(() => {
  cleanup();
  queryClient.clear();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

function editor() {
  return (
    <QueryClientProvider client={queryClient}>
      <NativeCollectionEditView studioCollection="pages" />
    </QueryClientProvider>
  );
}

function publishedResponse(slug = "about", id = 42) {
  return new Response(
    JSON.stringify({ id, tenant: 7, _status: "published", slug }),
  );
}

function expectNoPublishedLinks() {
  expect(screen.queryAllByRole("link", { name: /View live page/ })).toEqual([]);
  expect(screen.queryByRole("button", { name: "Preview" })).toBeNull();
  expect(
    screen
      .getByRole("link", { name: "Open preview (opens in a new tab)" })
      .getAttribute("href"),
  ).toBe("/web-studio/preview/pages/42");
}

async function expectPublishedLinks(href: string) {
  await waitFor(() => {
    const links = screen.getAllByRole("link", { name: /View live page/ });
    expect(links).toHaveLength(2);
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      href,
      href,
    ]);
  });
  fireEvent.click(screen.getByRole("button", { name: "Preview" }));
  const menu = await screen.findByRole("menu");
  expect(
    within(menu)
      .getByRole("menuitem", { name: /Open published page/ })
      .getAttribute("href"),
  ).toBe(href);
  fireEvent.keyDown(menu, { key: "Escape" });
  await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
}

describe("Web Studio published page address", () => {
  it("keeps the header, phone and inspector on the published page after a newer same-slug draft", async () => {
    fetchMock.mockImplementation(async () => publishedResponse());
    const view = render(editor());
    await expectPublishedLinks("https://give.example.org/about");

    fixture.info.data = { ...fixture.info.data, _status: "draft" };
    fixture.info.unpublishedVersionCount = 1;
    fixture.info.versionCount = 2;
    view.rerender(editor());

    await expectPublishedLinks("https://give.example.org/about");
    expect(screen.getAllByText("Older version public").length).toBeGreaterThan(
      0,
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/web-studio-api/pages/42?locale=en&fallback-locale=null&depth=0",
      expect.objectContaining({ method: "GET", credentials: "include" }),
    );
  });

  it("uses the prior published path when the newer draft changes its slug", async () => {
    const pending = Promise.withResolvers<Response>();
    fetchMock.mockReturnValue(pending.promise);
    fixture.info.data = {
      ...fixture.info.data,
      _status: "draft",
      slug: "unpublished-new-address",
    };
    fixture.info.unpublishedVersionCount = 1;
    render(editor());

    expectNoPublishedLinks();
    await act(async () => pending.resolve(publishedResponse("our-story")));
    await expectPublishedLinks("https://give.example.org/our-story");
    expect(
      document.querySelector(
        'a[href="https://give.example.org/unpublished-new-address"]',
      ),
    ).toBeNull();
    const [url, options] = fetchMock.mock.calls[0]!;
    expect(url).toBe(
      "/web-studio-api/pages/42?locale=en&fallback-locale=null&depth=0",
    );
    expect(String(url)).not.toContain("draft=");
    expect(options).toEqual(
      expect.objectContaining({
        cache: "no-store",
        signal: expect.any(AbortSignal),
      }),
    );
  });

  it("revalidates the address after the successor is published", async () => {
    fetchMock
      .mockResolvedValueOnce(publishedResponse())
      .mockResolvedValueOnce(publishedResponse("our-story"));
    const view = render(editor());
    await expectPublishedLinks("https://give.example.org/about");
    fixture.info.data = { ...fixture.info.data, slug: "our-story" };
    fixture.info.versionCount += 1;
    fixture.info.lastUpdateTime += 1;
    view.rerender(editor());
    expectNoPublishedLinks();
    await expectPublishedLinks("https://give.example.org/our-story");
  });

  it.each(["home", "stories/hope & help"])(
    "keeps the configured public path mapping for %s",
    async (slug) => {
      fetchMock.mockResolvedValue(publishedResponse(slug));
      render(editor());
      await expectPublishedLinks(
        slug === "home"
          ? "https://give.example.org/"
          : "https://give.example.org/stories/hope%20%26%20help",
      );
    },
  );

  it.each([
    "never-published",
    "no-origin",
    "trashed",
    "initializing",
    "no-read",
  ])("offers no public action or read for %s", (condition) => {
    if (condition === "never-published") {
      fixture.info.hasPublishedDoc = false;
      fixture.info.data._status = "draft";
    }
    if (condition === "no-origin") vi.stubEnv("NEXT_PUBLIC_DONOR_URL", "");
    if (condition === "trashed") fixture.info.isTrashed = true;
    if (condition === "initializing") fixture.info.isInitializing = true;
    if (condition === "no-read") fixture.info.docPermissions.read = false;
    render(editor());
    expectNoPublishedLinks();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("allows readers without edit or publish permissions to view the published page", async () => {
    fixture.info.hasSavePermission = false;
    fixture.info.hasPublishPermission = false;
    fixture.info.docPermissions.update = false;
    fetchMock.mockResolvedValue(publishedResponse());
    render(editor());
    await expectPublishedLinks("https://give.example.org/about");
    expect(screen.getByText("View only")).toBeTruthy();
  });

  it("omits locale parameters for a collection without localization", async () => {
    fixture.locale = { code: "" };
    fetchMock.mockResolvedValue(publishedResponse());
    render(editor());
    await expectPublishedLinks("https://give.example.org/about");
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "/web-studio-api/pages/42?depth=0",
    );
  });

  it("keeps only the resolved address in the query cache", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 42,
          tenant: 7,
          _status: "published",
          slug: "about",
          content: "private-editor-metadata",
        }),
      ),
    );
    render(editor());
    await expectPublishedLinks("https://give.example.org/about");
    expect(
      queryClient
        .getQueryCache()
        .getAll()
        .map((query) => query.state.data),
    ).toEqual(["https://give.example.org/about"]);
    expect(document.body.textContent).not.toContain("private-editor-metadata");
  });

  it("does not request a public address for a collection without a configured public path", () => {
    fixture.info.collectionSlug = "ministry-updates";
    render(
      <QueryClientProvider client={queryClient}>
        <NativeCollectionEditView studioCollection="ministry-updates" />
      </QueryClientProvider>,
    );
    expectNoPublishedLinks();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    { id: 42, tenant: 7, _status: "draft", slug: "private-draft" },
    { id: 99, tenant: 7, _status: "published", slug: "other-document" },
    { id: 42, tenant: 99, _status: "published", slug: "other-tenant" },
    { id: 42, tenant: 7, _status: "published" },
    { id: 42, tenant: 7, _status: "published", slug: "" },
    { id: 42, tenant: 7, _status: "published", slug: "   " },
    null,
    { errors: [{ message: "private-provider-diagnostic" }] },
  ])("fails closed for an unusable published response: %j", async (body) => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify(body)));
    render(editor());
    await waitFor(() => expect(queryClient.isFetching()).toBe(0));
    expectNoPublishedLinks();
    expect(document.body.textContent).not.toContain(
      "private-provider-diagnostic",
    );
  });

  it.each(["denied", "not-found", "network", "invalid-json"])(
    "removes the existing public action when revalidation encounters %s",
    async (failure) => {
      fetchMock.mockResolvedValueOnce(publishedResponse());
      const view = render(editor());
      await expectPublishedLinks("https://give.example.org/about");
      if (failure === "network") {
        fetchMock.mockRejectedValueOnce(
          new Error("private-provider-diagnostic"),
        );
      } else {
        fetchMock.mockResolvedValueOnce(
          new Response("private-provider-diagnostic", {
            status:
              failure === "denied" ? 403 : failure === "not-found" ? 404 : 200,
          }),
        );
      }
      fixture.info.versionCount += 1;
      view.rerender(editor());
      expectNoPublishedLinks();
      await waitFor(() => expect(queryClient.isFetching()).toBe(0));
      expectNoPublishedLinks();
      expect(document.body.textContent).not.toContain(
        "private-provider-diagnostic",
      );
      const cachedState = queryClient
        .getQueryCache()
        .getAll()
        .map((query) => ({
          data: query.state.data,
          error: String(query.state.error),
        }));
      expect(JSON.stringify(cachedState)).not.toContain(
        "private-provider-diagnostic",
      );
    },
  );

  it.each(["document", "locale"])(
    "aborts the old %s request and ignores its late response",
    async (scope) => {
      const oldRequest = Promise.withResolvers<Response>();
      const newRequest = Promise.withResolvers<Response>();
      fetchMock
        .mockReturnValueOnce(oldRequest.promise)
        .mockReturnValueOnce(newRequest.promise);
      const view = render(editor());
      await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
      const oldSignal = fetchMock.mock.calls[0]?.[1]?.signal;
      if (scope === "document") {
        fixture.info.id = 43;
        fixture.info.data = {
          ...fixture.info.data,
          id: 43,
          slug: "new-document",
        };
      } else {
        fixture.locale = { code: "fr" };
      }
      view.rerender(editor());
      expectNoPublishedLinks();
      await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
      expect(oldSignal?.aborted).toBe(true);
      expect(fetchMock.mock.calls[1]?.[0]).toBe(
        scope === "document"
          ? "/web-studio-api/pages/43?locale=en&fallback-locale=null&depth=0"
          : "/web-studio-api/pages/42?locale=fr&fallback-locale=null&depth=0",
      );
      await act(async () =>
        newRequest.resolve(
          publishedResponse("current-address", fixture.info.id),
        ),
      );
      await expectPublishedLinks("https://give.example.org/current-address");
      await act(async () =>
        oldRequest.resolve(publishedResponse("stale-address")),
      );
      await expectPublishedLinks("https://give.example.org/current-address");
      expect(
        document.querySelector(
          'a[href="https://give.example.org/stale-address"]',
        ),
      ).toBeNull();
    },
  );

  it("clears an old document's live action while the next document loads", async () => {
    const pending = Promise.withResolvers<Response>();
    fetchMock
      .mockResolvedValueOnce(publishedResponse())
      .mockReturnValueOnce(pending.promise);
    const view = render(editor());
    await expectPublishedLinks("https://give.example.org/about");
    fixture.info.id = 43;
    fixture.info.data = { ...fixture.info.data, id: 43 };
    view.rerender(editor());
    expectNoPublishedLinks();
    await act(async () => pending.resolve(publishedResponse("new-page", 43)));
    await expectPublishedLinks("https://give.example.org/new-page");
  });

  it("aborts and ignores a response when its public origin is removed", async () => {
    const pending = Promise.withResolvers<Response>();
    fetchMock.mockReturnValue(pending.promise);
    const view = render(editor());
    const signal = fetchMock.mock.calls[0]?.[1]?.signal;
    vi.stubEnv("NEXT_PUBLIC_DONOR_URL", "");
    view.rerender(editor());
    expect(signal?.aborted).toBe(true);
    await act(async () => pending.resolve(publishedResponse()));
    expectNoPublishedLinks();
  });

  it("aborts the read when the editor unmounts", async () => {
    const pending = Promise.withResolvers<Response>();
    fetchMock.mockReturnValue(pending.promise);
    const view = render(editor());
    const signal = fetchMock.mock.calls[0]?.[1]?.signal;
    view.unmount();
    expect(signal?.aborted).toBe(true);
    await act(async () => pending.resolve(publishedResponse()));
    await waitFor(() =>
      expect(queryClient.getQueryCache().getAll()).toEqual([]),
    );
  });

  it.each(["permission", "publication", "trash", "initializing"])(
    "cancels a pending read when %s makes its address ineligible",
    async (condition) => {
      const pending = Promise.withResolvers<Response>();
      fetchMock.mockReturnValue(pending.promise);
      const view = render(editor());
      const signal = fetchMock.mock.calls[0]?.[1]?.signal;
      if (condition === "permission") fixture.info.docPermissions.read = false;
      if (condition === "publication") fixture.info.hasPublishedDoc = false;
      if (condition === "trash") fixture.info.isTrashed = true;
      if (condition === "initializing") fixture.info.isInitializing = true;
      view.rerender(editor());
      expectNoPublishedLinks();
      expect(signal?.aborted).toBe(true);
      await act(async () => pending.resolve(publishedResponse()));
      expectNoPublishedLinks();
    },
  );
});
