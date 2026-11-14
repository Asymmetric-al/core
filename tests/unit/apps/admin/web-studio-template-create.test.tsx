// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import {
  QueryClient,
  QueryClientProvider,
} from "../../../../apps/admin/node_modules/@tanstack/react-query/build/modern/index.js";
import { TemplateGalleryView } from "../../../../apps/admin/src/cms-ui/web-studio/flows/TemplateGalleryView";

const fixture = vi.hoisted(() => ({
  push: vi.fn(),
  user: { role: "admin" } as Record<string, unknown>,
}));
vi.mock(
  "../../../../apps/admin/node_modules/@payloadcms/ui/dist/exports/client/index.js",
  async (importOriginal) => ({
    ...(await importOriginal<
      typeof import("../../../../apps/admin/node_modules/@payloadcms/ui/dist/exports/client/index.js")
    >()),
    useAuth: () => ({
      user: fixture.user,
      permissions: {
        collections: { "page-templates": { create: true } },
      },
    }),
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
  useSearchParams: () => new URLSearchParams(""),
  useRouter: () => ({ push: fixture.push }),
}));
vi.mock(
  "../../../../apps/admin/src/cms-ui/web-studio/shell/studio-layout",
  () => ({
    StudioLayout: ({ children }: { children: React.ReactNode }) => (
      <main>{children}</main>
    ),
  }),
);

const fetchMock = vi.fn();

beforeEach(() => {
  fixture.user = { role: "admin" };
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  Element.prototype.scrollIntoView ??= () => {};
  fetchMock.mockImplementation((_url: string, init?: RequestInit) =>
    init?.method === "POST"
      ? Promise.resolve(
          Response.json(
            { doc: { id: 42, name: "Spring appeal" } },
            { status: 201 },
          ),
        )
      : Promise.resolve(Response.json({ docs: [] })),
  );
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

function renderView(props: { collectionSlug?: string } = {}) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <TemplateGalleryView {...props} />
    </QueryClientProvider>,
  );
}

function posts() {
  return fetchMock.mock.calls.filter(
    ([, init]) => (init as RequestInit | undefined)?.method === "POST",
  );
}

it("keeps the gallery on the root templates route", async () => {
  renderView();
  expect(
    await screen.findByRole("heading", { name: "Template gallery" }),
  ).toBeTruthy();
  expect(screen.queryByRole("textbox", { name: /name/i })).toBeNull();
});

it("serves a new-template form on the Page Templates create route and saves nothing on visit", async () => {
  renderView({ collectionSlug: "page-templates" });
  expect(
    await screen.findByRole("heading", { level: 1, name: "New template" }),
  ).toBeTruthy();
  // Payload's stock create view saved an empty draft as soon as it rendered.
  await new Promise((resolve) => setTimeout(resolve, 20));
  expect(posts()).toHaveLength(0);
});

it("creates the template draft only on submit, then opens its editor", async () => {
  renderView({ collectionSlug: "page-templates" });
  const name = await screen.findByRole("textbox", { name: /^name/i });
  fireEvent.change(name, { target: { value: "Spring appeal" } });
  const key = screen.getByRole("textbox", { name: /template key/i });
  expect((key as HTMLInputElement).value).toBe("spring-appeal");
  expect(posts()).toHaveLength(0);

  fireEvent.click(screen.getByRole("button", { name: "Create draft" }));

  await waitFor(() => expect(posts()).toHaveLength(1));
  const [url, init] = posts()[0] as [string, RequestInit];
  expect(url).toBe("/api/cms/page-templates?draft=true&depth=0");
  expect(JSON.parse(String(init.body))).toEqual({
    name: "Spring appeal",
    templateKey: "spring-appeal",
    pageType: "standard",
  });
  await waitFor(() =>
    expect(fixture.push).toHaveBeenCalledWith(
      "/web-studio/collections/page-templates/42",
    ),
  );
});

it("asks for a name before saving anything", async () => {
  renderView({ collectionSlug: "page-templates" });
  fireEvent.click(await screen.findByRole("button", { name: "Create draft" }));
  expect(await screen.findByText("Enter a name.")).toBeTruthy();
  expect(posts()).toHaveLength(0);
});

it("shows Payload's error message when the save is refused", async () => {
  fetchMock.mockImplementation((_url: string, init?: RequestInit) =>
    init?.method === "POST"
      ? Promise.resolve(
          Response.json(
            { errors: [{ message: "You are not allowed to do this." }] },
            { status: 403 },
          ),
        )
      : Promise.resolve(Response.json({ docs: [] })),
  );
  renderView({ collectionSlug: "page-templates" });
  fireEvent.change(await screen.findByRole("textbox", { name: /^name/i }), {
    target: { value: "Spring appeal" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Create draft" }));
  expect(
    await screen.findByText("You are not allowed to do this."),
  ).toBeTruthy();
  expect(fixture.push).not.toHaveBeenCalled();
});
