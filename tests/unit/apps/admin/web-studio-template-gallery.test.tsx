// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import {
  QueryClient,
  QueryClientProvider,
} from "../../../../apps/admin/node_modules/@tanstack/react-query/build/modern/index.js";
import { TemplateGalleryView } from "../../../../apps/admin/src/cms-ui/web-studio/flows/TemplateGalleryView";

const fixture = vi.hoisted(() => ({
  search: "",
  permissions: {
    collections: { "page-templates": { create: true } },
  } as unknown,
}));

vi.mock(
  "../../../../apps/admin/node_modules/@payloadcms/ui/dist/exports/client/index.js",
  async (importOriginal) => ({
    ...(await importOriginal<
      typeof import("../../../../apps/admin/node_modules/@payloadcms/ui/dist/exports/client/index.js")
    >()),
    useAuth: () => ({ permissions: fixture.permissions }),
    useConfig: () => ({
      config: {
        routes: { api: "/api/cms", admin: "/web-studio" },
        serverURL: "",
      },
    }),
  }),
);
vi.mock("../../../../apps/admin/src/cms-ui/web-studio/routing", () => ({
  Link: ({ href, ...props }: React.ComponentProps<"a">) => (
    <a href={href} {...props} />
  ),
  useSearchParams: () => new URLSearchParams(fixture.search),
}));
vi.mock(
  "../../../../apps/admin/src/cms-ui/web-studio/shell/studio-layout",
  () => ({
    StudioLayout: ({ children }: { children: React.ReactNode }) => (
      <main>{children}</main>
    ),
  }),
);

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  fixture.search = "";
  fixture.permissions = {
    collections: { "page-templates": { create: true } },
  };
});

const TEMPLATES = [
  {
    id: 1,
    name: "Standard Page Template",
    pageType: "standard",
    templateKey: "standard-local",
    description: "A flexible page.",
  },
  {
    id: 2,
    name: "Project Page Template",
    pageType: "project",
    templateKey: "project-local",
  },
  {
    id: 3,
    name: "Missionary Giving Page Template",
    pageType: "missionary_giving",
    templateKey: "missionary-giving-local",
  },
];

function renderGallery(
  response: (url: string, init?: RequestInit) => Promise<Response>,
) {
  const fetchMock = vi.fn(response);
  vi.stubGlobal("fetch", fetchMock);
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <TemplateGalleryView />
    </QueryClientProvider>,
  );
  return { client, fetchMock };
}

it("lists templates as cards that start the matching create flow", async () => {
  const { client } = renderGallery(async () =>
    Response.json({ docs: TEMPLATES }),
  );
  expect(
    screen.getByRole("heading", { level: 1, name: "Template gallery" }),
  ).toBeTruthy();
  const card = (
    await screen.findByRole("heading", {
      name: "Project Page Template",
    })
  ).closest("article");
  if (!card) throw new Error("Template card missing");
  expect(within(card).getByText("Project page")).toBeTruthy();
  expect(within(card).getByText("project-local")).toBeTruthy();
  // Each card's action names its template, so a link list tells them apart
  // (the visible "Use template" leads the name).
  expect(
    within(card)
      .getByRole("link", { name: "Use template: Project Page Template" })
      .getAttribute("href"),
  ).toBe("/web-studio/projects/new?template=2");
  expect(
    screen
      .getAllByRole("link", { name: /Use template/ })
      .map((link) => link.getAttribute("href")),
  ).toEqual(
    expect.arrayContaining([
      "/web-studio/pages/new-from-template?template=1",
      "/web-studio/pages/give?template=3",
    ]),
  );
  client.clear();
});

it("filters by page type with named links that keep the missionary context", async () => {
  fixture.search = "pageType=missionary_giving&missionaryId=m-1";
  const { client } = renderGallery(async () =>
    Response.json({ docs: TEMPLATES }),
  );
  const filter = screen.getByRole("navigation", { name: "Page type" });
  const current = within(filter).getByRole("link", { name: "Giving page" });
  expect(current.getAttribute("aria-current")).toBe("page");
  expect(
    within(filter).getByRole("link", { name: "All" }).getAttribute("href"),
  ).toBe("/web-studio/templates?missionaryId=m-1");
  expect(
    await screen.findByRole("heading", {
      name: "Missionary Giving Page Template",
    }),
  ).toBeTruthy();
  expect(screen.queryByText("Project Page Template")).toBeNull();
  expect(
    screen.getByRole("link", { name: /Use template/ }).getAttribute("href"),
  ).toBe("/web-studio/pages/give?template=3&missionaryId=m-1");
  client.clear();
});

it("loads gallery thumbnails and marks only draft templates", async () => {
  const { client, fetchMock } = renderGallery(async () =>
    Response.json({
      docs: [
        {
          ...TEMPLATES[0],
          _status: "draft",
          thumbnail: {
            url: "/api/cms/media/file/layout.png",
            alt: "Standard layout preview",
          },
        },
        { ...TEMPLATES[1], _status: "published", thumbnail: 91 },
      ],
    }),
  );
  const image = await screen.findByRole("img", {
    name: "Standard layout preview",
  });
  expect(
    new URL(image.getAttribute("src")!, window.location.href).pathname,
  ).toBe("/api/cms/media/file/layout.png");
  expect(screen.getAllByText("Draft")).toHaveLength(1);
  const query = new URLSearchParams(
    String(fetchMock.mock.calls[0]?.[0]).split("?")[1],
  );
  expect(query.get("depth")).toBe("1");
  expect(query.get("draft")).toBe("true");
  fireEvent.error(image);
  expect(
    screen.queryByRole("img", { name: "Standard layout preview" }),
  ).toBeNull();
  expect(screen.getByText("Preview unavailable")).toBeTruthy();
  expect(
    screen.getByRole("link", { name: "Use template: Standard Page Template" }),
  ).toBeTruthy();
  client.clear();
});

it("keeps thumbnails a short strip and skips placeholder-sized images", async () => {
  const { client } = renderGallery(async () =>
    Response.json({
      docs: [
        {
          ...TEMPLATES[0],
          thumbnail: {
            url: "/api/cms/media/file/layout.png",
            alt: "Standard layout preview",
            width: 1600,
            height: 900,
          },
        },
        {
          ...TEMPLATES[1],
          thumbnail: {
            url: "/api/cms/media/file/pixel.png",
            alt: "Pixel",
            width: 1,
            height: 1,
          },
        },
      ],
    }),
  );
  const image = await screen.findByRole("img", {
    name: "Standard layout preview",
  });
  // A layout preview, not the card's main content.
  expect(image.className.split(" ")).toContain("max-h-36");
  expect(image.className.split(" ")).not.toContain("aspect-video");
  // A 1x1 image is a placeholder, not a preview; the card simply has none.
  expect(screen.queryByRole("img", { name: "Pixel" })).toBeNull();
  expect(screen.queryByText("Preview unavailable")).toBeNull();
  client.clear();
});

it("shows an inline error with a working retry", async () => {
  let fail = true;
  const { client, fetchMock } = renderGallery(async () =>
    fail
      ? new Response("nope", { status: 500 })
      : Response.json({ docs: TEMPLATES }),
  );
  expect(await screen.findByText("Couldn't load templates")).toBeTruthy();
  // Nothing to filter while the list failed: no type filter around the error.
  expect(screen.queryByRole("navigation", { name: "Page type" })).toBeNull();
  fail = false;
  fireEvent.click(screen.getByRole("button", { name: "Retry" }));
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  expect(
    await screen.findByRole("heading", { name: "Standard Page Template" }),
  ).toBeTruthy();
  client.clear();
});

it("offers to create a template when none exist", async () => {
  const { client } = renderGallery(async () => Response.json({ docs: [] }));
  expect(await screen.findByText("No templates yet")).toBeTruthy();
  expect(
    screen.getByRole("link", { name: "New template" }).getAttribute("href"),
  ).toBe("/web-studio/collections/page-templates/create");
  client.clear();
});

it("offers New template only to people who may create templates", async () => {
  fixture.permissions = {
    collections: { "page-templates": { create: false, read: true } },
  };
  const { client } = renderGallery(async () => Response.json({ docs: [] }));
  expect(await screen.findByText("No templates yet")).toBeTruthy();
  expect(screen.queryByRole("link", { name: "New template" })).toBeNull();
  expect(
    screen.getByText(/Ask a Web Studio administrator to add one/),
  ).toBeTruthy();
  client.clear();
});
