// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import {
  QueryClient,
  QueryClientProvider,
} from "../../../../apps/admin/node_modules/@tanstack/react-query/build/modern/index.js";
import { StandardPageFromTemplateView } from "../../../../apps/admin/src/cms-ui/web-studio/flows/StandardPageFromTemplateView";

const SITE = "6a1f3c2e-0d4b-4c8a-9e7f-1b2c3d4e5f60";

const fixture = vi.hoisted(() => ({
  push: vi.fn(),
  search: "",
}));

vi.mock(
  "../../../../apps/admin/node_modules/@payloadcms/ui/dist/exports/client/index.js",
  async (importOriginal) => ({
    ...(await importOriginal<
      typeof import("../../../../apps/admin/node_modules/@payloadcms/ui/dist/exports/client/index.js")
    >()),
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

beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
  Element.prototype.scrollIntoView ??= () => {};
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  fixture.search = "";
});

function renderFlow(
  directory: (url: string) => Response | Promise<Response> = () =>
    Response.json({}),
) {
  const create = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(
    async () => Response.json({ id: "page-9", collectionSlug: "pages" }),
  );
  const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
    if (init?.method === "POST") return create(url, init);
    if (url.includes("/site-presentations")) {
      return Response.json({ docs: [{ id: SITE }] });
    }
    return directory(url);
  });
  vi.stubGlobal("fetch", fetchMock);
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const view = render(
    <QueryClientProvider client={client}>
      <StandardPageFromTemplateView />
    </QueryClientProvider>,
  );
  const form = () => view.container.querySelector("form")!;
  return { create, fetchMock, form, client };
}

describe("New page from a starter (D-18: WP6 part 2b replaces the page-templates collection with three starters in code and adds the Site)", () => {
  it("offers the three starters without loading a template list, and creates from the one chosen", async () => {
    const { create, fetchMock, form, client } = renderFlow();
    const template = screen.getByRole("combobox", { name: "Template" });
    fireEvent.click(template);
    expect(
      (await screen.findAllByRole("option")).map(
        (option) => option.textContent,
      ),
    ).toEqual(["Standard page", "Missionary giving page", "Project page"]);
    fireEvent.click(screen.getByRole("option", { name: "Standard page" }));
    expect(
      fetchMock.mock.calls.some(([url]) =>
        String(url).includes("page-templates"),
      ),
    ).toBe(false);
    expect(
      screen.getByRole("link", { name: "Cancel" }).getAttribute("href"),
    ).toBe("/web-studio/collections/pages");
    fireEvent.change(screen.getByRole("textbox", { name: "Title" }), {
      target: { value: "Spring Gala" },
    });
    expect(screen.getByRole("textbox", { name: "URL slug" })).toHaveProperty(
      "value",
      "spring-gala",
    );
    await waitFor(() =>
      expect(
        screen
          .getByRole("button", { name: "Create draft" })
          .hasAttribute("disabled"),
      ).toBe(false),
    );
    await act(async () => {
      fireEvent.submit(form());
    });
    await waitFor(() => expect(create).toHaveBeenCalledTimes(1));
    expect(JSON.parse(String(create.mock.calls[0]![1]!.body))).toEqual({
      starterKey: "standard",
      site: SITE,
      title: "Spring Gala",
      slug: "spring-gala",
    });
    await waitFor(() =>
      expect(fixture.push).toHaveBeenCalledExactlyOnceWith(
        "/web-studio/collections/pages/page-9",
      ),
    );
    client.clear();
  });

  it("selects and submits a missionary from a later directory page", async () => {
    fixture.search = "template=missionary-giving&missionaryId=m-201";
    const { create, fetchMock, form, client } = renderFlow((url) => {
      const offset = new URLSearchParams(url.split("?")[1]).get("offset");
      return Response.json({
        missionaries:
          offset === "200"
            ? [{ id: "m-201", profile: { full_name: "Grace Last" } }]
            : Array.from({ length: 200 }, (_, i) => ({
                id: `m-${i}`,
                profile: { full_name: `Missionary ${i}` },
              })),
      });
    });
    await waitFor(() =>
      expect(
        screen.getByRole("combobox", { name: "Missionary" }).textContent,
      ).toContain("Grace Last"),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/missionaries?limit=200&offset=200",
      expect.objectContaining({ credentials: "include" }),
    );
    await waitFor(() =>
      expect(
        screen
          .getByRole("button", { name: "Create draft" })
          .hasAttribute("disabled"),
      ).toBe(false),
    );
    await act(async () => {
      fireEvent.submit(form());
    });
    await waitFor(() => expect(create).toHaveBeenCalledTimes(1));
    expect(JSON.parse(String(create.mock.calls[0]![1]!.body))).toEqual({
      starterKey: "missionary-giving",
      site: SITE,
      missionaryId: "m-201",
    });
    client.clear();
  });

  it("blocks creation if a later directory page fails", async () => {
    fixture.search = "template=missionary-giving&missionaryId=m-1";
    const { create, form, client } = renderFlow((url) =>
      new URLSearchParams(url.split("?")[1]).get("offset") === "200"
        ? Response.json({}, { status: 503 })
        : Response.json({
            missionaries: Array.from({ length: 200 }, (_, i) => ({
              id: `m-${i}`,
            })),
          }),
    );
    expect(
      await screen.findByText(
        "The missionary directory didn't load. Try again.",
      ),
    ).toBeTruthy();
    expect(
      screen
        .getByRole("combobox", { name: "Missionary" })
        .hasAttribute("disabled"),
    ).toBe(true);
    expect(
      screen
        .getByRole("button", { name: "Create draft" })
        .hasAttribute("disabled"),
    ).toBe(true);
    await act(async () => {
      fireEvent.submit(form());
    });
    expect(create).not.toHaveBeenCalled();
    client.clear();
  });

  it("marks required fields and ties each problem to its field", async () => {
    const { create, form, client } = renderFlow();
    const template = screen.getByRole("combobox", { name: "Template" });
    const title = screen.getByRole("textbox", { name: "Title" });
    const slug = screen.getByRole("textbox", { name: "URL slug" });
    expect(template.getAttribute("aria-required")).toBe("true");
    expect(title).toHaveProperty("required", true);
    expect(slug).toHaveProperty("required", true);
    const submit = screen.getByRole("button", { name: "Create draft" });
    await waitFor(() => expect(submit.hasAttribute("disabled")).toBe(true));
    fireEvent.click(template);
    fireEvent.click(
      await screen.findByRole("option", { name: "Standard page" }),
    );
    await waitFor(() => expect(submit.hasAttribute("disabled")).toBe(false));
    await act(async () => {
      fireEvent.submit(form());
    });
    expect(create).not.toHaveBeenCalled();
    const errorFor = (control: HTMLElement) => {
      expect(control.getAttribute("aria-invalid")).toBe("true");
      const ids = control.getAttribute("aria-describedby")?.split(" ") ?? [];
      return ids
        .map((id) => document.getElementById(id)?.textContent ?? "")
        .join(" ");
    };
    expect(errorFor(title)).toContain("Enter a title.");
    expect(errorFor(slug)).toContain("Enter a URL slug.");
    expect(document.activeElement).toBe(title);
    fireEvent.change(title, { target: { value: "Spring Gala" } });
    expect(title.getAttribute("aria-invalid")).toBeNull();
    expect(slug.getAttribute("aria-invalid")).toBeNull();
    await act(async () => {
      fireEvent.submit(form());
    });
    await waitFor(() => expect(create).toHaveBeenCalledTimes(1));
    client.clear();
  });

  it("shows the normalized address while leaving the typed slug editable", () => {
    const { client } = renderFlow();
    const slug = screen.getByRole("textbox", { name: "URL slug" });
    fireEvent.change(slug, { target: { value: " About Us! " } });
    expect(screen.getByText("Web address: /about-us")).toBeTruthy();
    expect(slug).toHaveProperty("value", " About Us! ");
    fireEvent.change(slug, { target: { value: "!!!" } });
    expect(screen.queryByText("Web address: /")).toBeNull();
    client.clear();
  });

  it("names the starter chosen in the gallery so it can be confirmed or changed", () => {
    fixture.search = "template=project";
    const { client } = renderFlow(() => Response.json({ funds: [] }));
    const chosen = screen.getByText("Project page");
    expect(chosen.closest("[data-chosen-template]")?.textContent).toContain(
      "Project page template",
    );
    expect(screen.queryByRole("combobox", { name: "Template" })).toBeNull();
    expect(
      screen.getByRole("link", { name: "Change" }).getAttribute("href"),
    ).toBe("/web-studio/templates");
    expect(screen.getByRole("combobox", { name: "Fund" })).toBeTruthy();
    client.clear();
  });

  it("ignores an unknown starter in the address and asks for one", () => {
    fixture.search = "template=retired-template-id";
    const { client } = renderFlow();
    expect(screen.getByRole("combobox", { name: "Template" })).toBeTruthy();
    expect(document.querySelector("[data-chosen-template]")).toBeNull();
    client.clear();
  });
});
