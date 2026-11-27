// @vitest-environment node

import { isValidElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { WebStudioPageScope } from "../../../../apps/admin/src/cms-ui/web-studio/shell/web-studio-document";
import { WEB_STUDIO_SEGMENT } from "../../../../packages/auth/web-studio";
import { DocumentScopeProvider } from "../../../../packages/database/document-scope";

import type { ReactElement, ReactNode } from "react";

/**
 * A client navigation inside Web Studio renders the page again but not the
 * layout, so the layout's gate alone would let a page rendered for the
 * organization another tab just chose land in a document opened for the old
 * one. Each Web Studio page therefore asks the gate on its own render and
 * renders under the scope it returns, through slice A's
 * DocumentScopeProvider, which in a document opened for another scope renders
 * nothing and reloads (document-scope.test.tsx proves that part; the
 * end-to-end suite proves the whole). AL-2675, council C1.
 *
 * Node, not jsdom: the real page modules import `@payload-config`, which
 * resolves only when Vitest transforms for the server.
 */

const SCOPE_B = {
  userId: "00000000-0000-4000-8000-0000000000c1",
  tenantId: "00000000-0000-0000-0000-000000000002",
  assignmentId: "00000000-0000-4000-8000-0000000000b1",
  addressPrefix: "",
};

const state = vi.hoisted(() => ({
  gate: [] as string[],
  order: [] as string[],
}));

vi.mock("../../../../apps/admin/src/cms/web-studio-access", () => ({
  requireWebStudioAccess: async (pathname: string) => {
    state.gate.push(pathname);
    state.order.push("gate");
    return {
      scope: SCOPE_B,
      organization: { name: "Bravo Mission", canSwitch: true },
    };
  },
}));
vi.mock("next/server", () => ({ connection: async () => undefined }));
vi.mock("next/headers", () => ({
  headers: async () =>
    new Headers({ "x-asym-pathname": "/web-studio/collections/pages/7" }),
}));
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
  redirect: (target: string) => {
    throw new Error(`NEXT_REDIRECT:${target}`);
  },
}));

// The catch-all page: Payload's own admin view.
vi.mock("@payload-config", () => ({ default: {} }));
vi.mock("../../../../apps/admin/app/(payload)/web-studio/importMap", () => ({
  importMap: {},
}));
vi.mock(
  "../../../../apps/admin/node_modules/@payloadcms/next/dist/exports/views.js",
  () => ({
    RootPage: async () => {
      state.order.push("payload");
      return <p>Payload view</p>;
    },
    generatePageMetadata: async () => ({}),
  }),
);

// The draft preview: its reads, as a signed-in editor sees them.
vi.mock("../../../../apps/admin/src/cms/get-payload", () => ({
  getPayloadClient: async () => {
    state.order.push("payload");
    return {
      auth: async () => ({ user: { id: "editor" } }),
      findByID: async () => ({ id: "7", _status: "draft" }),
    };
  },
}));
vi.mock("../../../../apps/admin/node_modules/payload/dist/index.js", () => ({
  createPayloadRequest: async () => ({}),
  executeAuthStrategies: async () => ({ user: { id: "editor" } }),
}));
vi.mock("../../../../apps/admin/src/cms/preview/authenticated-preview", () => ({
  isWebStudioPreviewCollection: () => true,
  buildWebStudioPreviewModel: () => ({
    id: "7",
    title: "Draft preview title",
    content: null,
    layout: [],
    summary: null,
  }),
  getWebStudioPreviewCollectionLabel: () => "Pages",
}));
vi.mock("../../../../packages/lib/cms/public-page-renderer", () => ({
  renderPublicCmsPageContent: () => null,
}));
vi.mock("../../../../packages/ui/components/public/blocks", () => ({
  renderPublicBlocks: () => [],
}));

const { default: CatchAllPage } =
  await import("../../../../apps/admin/app/(payload)/web-studio/[[...segments]]/page");
const { default: PreviewPage } =
  await import("../../../../apps/admin/app/(payload)/web-studio/preview/[collection]/[id]/page");

beforeEach(() => {
  state.gate = [];
  state.order = [];
});

describe.each([
  [
    "Payload's catch-all page",
    () =>
      CatchAllPage({
        params: Promise.resolve({ segments: ["collections", "pages", "7"] }),
        searchParams: Promise.resolve({}),
      }),
    "/web-studio/collections/pages/7",
    "Payload view",
  ],
  [
    "the draft preview",
    () =>
      PreviewPage({
        params: Promise.resolve({ collection: "pages", id: "7" }),
      }),
    "/web-studio/preview/pages/7",
    "Draft preview title",
  ],
])("%s", (_label, open, pathname, content) => {
  it("asks the gate on its own render, before any Payload read, and renders under its scope", async () => {
    const page: unknown = await open();

    expect(state.gate).toEqual([pathname]);
    expect(state.order[0]).toBe("gate");
    expect(isValidElement(page)).toBe(true);
    const element = page as ReactElement<{
      scope: unknown;
      children: ReactNode;
    }>;
    // Web Studio's own client wrapper of DocumentScopeProvider: the segment
    // carries a function, which cannot pass from this server component
    // (council on the joined release, JC1).
    expect(element.type).toBe(WebStudioPageScope);
    expect(element.props.scope).toEqual(SCOPE_B);
    // Valid on Web Studio's pages only, as its document's scope is.
    const provider = WebStudioPageScope(
      element.props as Parameters<typeof WebStudioPageScope>[0],
    ) as ReactElement<{ scope: unknown; segment?: unknown }>;
    expect(provider.type).toBe(DocumentScopeProvider);
    expect(provider.props.scope).toEqual(SCOPE_B);
    expect(provider.props.segment).toBe(WEB_STUDIO_SEGMENT);
    expect(renderToStaticMarkup(<>{element.props.children}</>)).toContain(
      content,
    );
  });
});
