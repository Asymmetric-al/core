// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeAll, expect, it, vi } from "vitest";

import {
  QueryClient,
  QueryClientProvider,
} from "../../../../apps/admin/node_modules/@tanstack/react-query/build/modern/index.js";
import { StandardPageFromTemplateView } from "../../../../apps/admin/src/cms-ui/web-studio/flows/StandardPageFromTemplateView";
import { MissionaryGivingCreateView } from "../../../../apps/admin/src/cms-ui/web-studio/flows/MissionaryGivingCreateView";
import { ProjectPageCreateView } from "../../../../apps/admin/src/cms-ui/web-studio/flows/ProjectPageCreateView";

const fixture = vi.hoisted(() => ({
  push: vi.fn(),
  search: "",
  canCreateTemplates: true,
  info: vi.fn(),
}));

vi.mock("sonner", () => ({ toast: { info: fixture.info } }));

vi.mock(
  "../../../../apps/admin/node_modules/@payloadcms/ui/dist/exports/client/index.js",
  async (importOriginal) => ({
    ...(await importOriginal<
      typeof import("../../../../apps/admin/node_modules/@payloadcms/ui/dist/exports/client/index.js")
    >()),
    useAuth: () => ({
      user: { role: "admin" },
      permissions: {
        collections: {
          "page-templates": { create: fixture.canCreateTemplates },
        },
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
  fixture.canCreateTemplates = true;
});

function renderFlow(
  templates: Array<Record<string, unknown>>,
  loadTemplates?: () => Promise<Response>,
) {
  const create = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(
    async () => Response.json({ id: "page-9", collectionSlug: "pages" }),
  );
  vi.stubGlobal(
    "fetch",
    vi.fn((url: string, init?: RequestInit) => {
      if (init?.method === "POST") return create(url, init);
      return (
        loadTemplates?.() ?? Promise.resolve(Response.json({ docs: templates }))
      );
    }),
  );
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const view = render(
    <QueryClientProvider client={client}>
      <StandardPageFromTemplateView />
    </QueryClientProvider>,
  );
  return { create, view, client };
}

it("opened directly, picks the only standard template and creates from it", async () => {
  const { create, view, client } = renderFlow([
    { id: "t-standard", name: "Standard Page Template", pageType: "standard" },
    { id: "t-project", name: "Project Page Template", pageType: "project" },
  ]);
  const template = await screen.findByRole("combobox", { name: "Template" });
  const query = new URLSearchParams(
    String(vi.mocked(fetch).mock.calls[0]?.[0]).split("?")[1],
  );
  expect(query.get("depth")).toBe("0");
  await waitFor(() =>
    expect(template.textContent).toContain("Standard Page Template"),
  );
  expect(
    screen.getByRole("link", { name: "Cancel" }).getAttribute("href"),
  ).toBe("/web-studio/collections/pages");

  fireEvent.change(screen.getByRole("textbox", { name: "Title" }), {
    target: { value: "Spring Gala" },
  });
  // The address follows the title until it is edited by hand.
  expect(screen.getByRole("textbox", { name: "URL slug" })).toHaveProperty(
    "value",
    "spring-gala",
  );
  const form = view.container.querySelector("form");
  if (!form) throw new Error("Draft form missing");
  await act(async () => {
    fireEvent.submit(form);
  });
  await waitFor(() => expect(create).toHaveBeenCalledTimes(1));
  expect(JSON.parse(String(create.mock.calls[0]![1]!.body))).toEqual({
    targetCollection: "pages",
    templateId: "t-standard",
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
  fixture.search = "template=t-1&missionaryId=m-201";
  const create = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(
    async () =>
      Response.json({
        id: "giving-1",
        collectionSlug: "missionary-giving-pages",
      }),
  );
  const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
    if (init?.method === "POST") return create(url, init);
    if (url.includes("/api/admin/missionaries")) {
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
    }
    return Response.json({
      docs: [
        { id: "t-1", name: "Giving layout", pageType: "missionary_giving" },
      ],
    });
  });
  vi.stubGlobal("fetch", fetchMock);
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const view = render(
    <QueryClientProvider client={client}>
      <MissionaryGivingCreateView />
    </QueryClientProvider>,
  );
  await waitFor(() =>
    expect(
      screen.getByRole("combobox", { name: "Missionary" }).textContent,
    ).toContain("Grace Last"),
  );
  expect(fetchMock).toHaveBeenCalledWith(
    "/api/admin/missionaries?limit=200&offset=200",
    expect.objectContaining({ credentials: "include" }),
  );
  await act(async () => {
    fireEvent.submit(view.container.querySelector("form")!);
  });
  await waitFor(() => expect(create).toHaveBeenCalledTimes(1));
  expect(JSON.parse(String(create.mock.calls[0]![1]!.body))).toMatchObject({
    missionaryId: "m-201",
  });
  client.clear();
});

it("blocks creation if a later directory page fails", async () => {
  fixture.search = "template=t-1&missionaryId=m-1";
  const create = vi.fn();
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init?: RequestInit) => {
      if (init?.method === "POST") {
        create();
        return Response.json({});
      }
      if (url.includes("/api/admin/missionaries")) {
        return new URLSearchParams(url.split("?")[1]).get("offset") === "200"
          ? Response.json({}, { status: 503 })
          : Response.json({
              missionaries: Array.from({ length: 200 }, (_, i) => ({
                id: `m-${i}`,
              })),
            });
      }
      return Response.json({
        docs: [
          { id: "t-1", name: "Giving layout", pageType: "missionary_giving" },
        ],
      });
    }),
  );
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const view = render(
    <QueryClientProvider client={client}>
      <MissionaryGivingCreateView />
    </QueryClientProvider>,
  );
  expect(
    await screen.findByText("The missionary directory didn't load. Try again."),
  ).toBeTruthy();
  expect(screen.getByRole("button", { name: "Create draft" })).toHaveProperty(
    "disabled",
    true,
  );
  await act(async () => {
    fireEvent.submit(view.container.querySelector("form")!);
  });
  expect(create).not.toHaveBeenCalled();
  client.clear();
});

it("marks required fields and ties each problem to its field", async () => {
  const { create, view, client } = renderFlow([
    { id: "a", name: "Campaign", pageType: "standard" },
    { id: "b", name: "Events", pageType: "standard" },
  ]);
  const template = await screen.findByRole("combobox", { name: "Template" });
  await waitFor(() => expect(template.hasAttribute("disabled")).toBe(false));
  const title = screen.getByRole("textbox", { name: "Title" });
  const slug = screen.getByRole("textbox", { name: "URL slug" });
  // Required is part of each control, not only the visible mark.
  expect(template.getAttribute("aria-required")).toBe("true");
  expect(title).toHaveProperty("required", true);
  expect(slug).toHaveProperty("required", true);
  // With templates to choose from, submit stays available and explains.
  const submit = screen.getByRole("button", { name: "Create draft" });
  expect(submit.hasAttribute("disabled")).toBe(false);

  const form = view.container.querySelector("form");
  if (!form) throw new Error("Draft form missing");
  await act(async () => {
    fireEvent.submit(form);
  });
  expect(create).not.toHaveBeenCalled();
  const errorFor = (control: HTMLElement) => {
    expect(control.getAttribute("aria-invalid")).toBe("true");
    const ids = control.getAttribute("aria-describedby")?.split(" ") ?? [];
    return ids
      .map((id) => document.getElementById(id)?.textContent ?? "")
      .join(" ");
  };
  expect(errorFor(template)).toContain("Choose a template to start from.");
  expect(errorFor(title)).toContain("Enter a title.");
  expect(errorFor(slug)).toContain("Enter a URL slug.");
  // Focus moves to the first field that needs attention.
  expect(document.activeElement).toBe(template);

  // Fixing a field clears its message; the slug follows the title.
  fireEvent.change(title, { target: { value: "Spring Gala" } });
  expect(title.getAttribute("aria-invalid")).toBeNull();
  expect(slug.getAttribute("aria-invalid")).toBeNull();
  expect(screen.queryByText("Enter a URL slug.")).toBeNull();
  fireEvent.click(template);
  fireEvent.click(await screen.findByRole("option", { name: "Events" }));
  await waitFor(() => expect(template.getAttribute("aria-invalid")).toBeNull());
  await act(async () => {
    fireEvent.submit(form);
  });
  await waitFor(() => expect(create).toHaveBeenCalledTimes(1));
  expect(JSON.parse(String(create.mock.calls[0]![1]!.body))).toMatchObject({
    templateId: "b",
    title: "Spring Gala",
    slug: "spring-gala",
  });
  client.clear();
});

it("shows the normalized address while leaving the typed slug editable", async () => {
  const { client } = renderFlow([
    { id: "template", name: "Standard", pageType: "standard" },
  ]);
  await screen.findByText("Standard");
  const slug = screen.getByRole("textbox", { name: "URL slug" });
  fireEvent.change(slug, { target: { value: " About Us! " } });
  expect(screen.getByText("Web address: /about-us")).toBeTruthy();
  expect(slug).toHaveProperty("value", " About Us! ");
  fireEvent.change(slug, { target: { value: "!!!" } });
  expect(screen.queryByText("Web address: /")).toBeNull();
  client.clear();
});

it("checks the gallery's choice before enabling creation", () => {
  fixture.search = "template=t-standard";
  const { client } = renderFlow([]);
  expect(screen.queryByRole("combobox", { name: "Template" })).toBeNull();
  expect(screen.getByText("Loading template…")).toBeTruthy();
  expect(screen.getByRole("button", { name: "Create draft" })).toHaveProperty(
    "disabled",
    true,
  );
  expect(
    screen.getByRole("link", { name: "Change" }).getAttribute("href"),
  ).toBe("/web-studio/templates?pageType=standard");
  client.clear();
});

it.each([
  { docs: [], message: "This template no longer exists or is unavailable." },
  {
    docs: [{ id: "t-standard", name: "Project", pageType: "project" }],
    message: "Choose a standard page template for this draft.",
  },
])(
  "blocks a missing or incompatible gallery template: $message",
  async ({ docs, message }) => {
    fixture.search = "template=t-standard";
    const { client, create, view } = renderFlow(docs);
    expect(await screen.findByText(message)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Create draft" })).toHaveProperty(
      "disabled",
      true,
    );
    fireEvent.change(screen.getByRole("textbox", { name: "Title" }), {
      target: { value: "Spring Gala" },
    });
    await act(async () => {
      fireEvent.submit(view.container.querySelector("form")!);
    });
    expect(create).not.toHaveBeenCalled();
    client.clear();
  },
);

it("retries a failed gallery template load without clearing entered values", async () => {
  fixture.search = "template=t-standard";
  const load = vi
    .fn()
    .mockResolvedValueOnce(Response.json({}, { status: 503 }))
    .mockResolvedValue(
      Response.json({
        docs: [{ id: "t-standard", name: "Campaign", pageType: "standard" }],
      }),
    );
  const { client, create, view } = renderFlow([], load);
  expect(
    await screen.findByText(
      "Templates didn't load. Check your connection and try again.",
    ),
  ).toBeTruthy();
  fireEvent.change(screen.getByRole("textbox", { name: "Title" }), {
    target: { value: "Spring Gala" },
  });
  await act(async () => {
    fireEvent.submit(view.container.querySelector("form")!);
  });
  expect(create).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  expect(await screen.findByText("Campaign")).toBeTruthy();
  expect(screen.getByRole("textbox", { name: "Title" })).toHaveProperty(
    "value",
    "Spring Gala",
  );
  expect(screen.getByRole("button", { name: "Create draft" })).toHaveProperty(
    "disabled",
    false,
  );
  load.mockResolvedValue(Response.json({}, { status: 503 }));
  await act(async () => {
    await client.invalidateQueries({
      queryKey: ["web-studio", "page-templates"],
    });
  });
  expect(
    await screen.findByText(
      "Templates didn't load. Check your connection and try again.",
    ),
  ).toBeTruthy();
  expect(screen.getByRole("button", { name: "Create draft" })).toHaveProperty(
    "disabled",
    true,
  );
  expect(screen.getByRole("textbox", { name: "Title" })).toHaveProperty(
    "value",
    "Spring Gala",
  );
  client.clear();
});

it("names the template chosen in the gallery so it can be confirmed", async () => {
  fixture.search = "template=t-campaign";
  const { client } = renderFlow([
    { id: "t-campaign", name: "Campaign Landing", pageType: "standard" },
    { id: "t-other", name: "Events", pageType: "standard" },
  ]);
  const chosen = await screen.findByText("Campaign Landing");
  expect(chosen.closest("[data-chosen-template]")?.textContent).toContain(
    "Standard page",
  );
  expect(screen.queryByText("Template chosen in the gallery")).toBeNull();
  expect(screen.queryByRole("combobox", { name: "Template" })).toBeNull();
  expect(
    screen.getByRole("link", { name: "Change" }).getAttribute("href"),
  ).toBe("/web-studio/templates?pageType=standard");
  client.clear();
});

it("says so when no template of the type exists", async () => {
  const { client } = renderFlow([
    { id: "p", name: "Project", pageType: "project" },
  ]);
  expect(
    await screen.findByText(/No standard page templates yet/),
  ).toBeTruthy();
  expect(
    screen
      .getByRole("link", { name: "Create a template" })
      .getAttribute("href"),
  ).toBe("/web-studio/collections/page-templates/create");
  // The note under the select describes it, as text fields' hints do.
  const template = screen.getByRole("combobox", { name: "Template" });
  const described = (template.getAttribute("aria-describedby") ?? "")
    .split(" ")
    .map((id) => document.getElementById(id)?.textContent ?? "")
    .join(" ");
  expect(described).toContain("No standard page templates yet.");
  // Nothing to choose: submit waits instead of reporting an unfixable field.
  expect(
    screen
      .getByRole("button", { name: "Create draft" })
      .hasAttribute("disabled"),
  ).toBe(true);
  client.clear();
});

it("does not offer to create a template to people who cannot", async () => {
  fixture.canCreateTemplates = false;
  const { client } = renderFlow([
    { id: "p", name: "Project", pageType: "project" },
  ]);
  expect(
    await screen.findByText(/No standard page templates yet/),
  ).toBeTruthy();
  expect(screen.queryByRole("link", { name: "Create a template" })).toBeNull();
  expect(
    screen.getByText(/Ask a Web Studio administrator to add one/),
  ).toBeTruthy();
  client.clear();
});

it.each([
  {
    View: MissionaryGivingCreateView,
    pageType: "missionary_giving",
    collection: "missionary-giving-pages",
    noun: "giving page",
    field: "Missionary",
  },
  {
    View: ProjectPageCreateView,
    pageType: "project",
    collection: "project-pages",
    noun: "project page",
    field: "Fund",
  },
])(
  "explains opening an existing $noun before navigating",
  async ({ View, pageType, collection, noun, field }) => {
    fixture.search = "template=t-1&missionaryId=m-1";
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init?: RequestInit) => {
        if (init?.method === "POST")
          return Response.json({ existingId: "existing-9" }, { status: 409 });
        if (url.includes("/api/admin/missionaries"))
          return Response.json({
            missionaries: [
              { id: "m-1", profile: { full_name: "Grace Okafor" } },
            ],
          });
        if (url.includes("/api/admin/funds"))
          return Response.json({ funds: [{ id: "f-1", name: "School fund" }] });
        return Response.json({
          docs: [{ id: "t-1", name: "Layout", pageType }],
        });
      }),
    );
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const view = render(
      <QueryClientProvider client={client}>
        <View />
      </QueryClientProvider>,
    );
    await screen.findByText("Layout");
    const control = screen.getByRole("combobox", { name: field });
    await waitFor(() => expect(control).toHaveProperty("disabled", false));
    if (field === "Fund") {
      fireEvent.click(control);
      fireEvent.click(
        await screen.findByRole("option", { name: "School fund" }),
      );
    }
    await act(async () => {
      fireEvent.submit(view.container.querySelector("form")!);
    });
    await waitFor(() =>
      expect(fixture.push).toHaveBeenCalledWith(
        `/web-studio/collections/${collection}/existing-9`,
      ),
    );
    expect(fixture.info).toHaveBeenCalledWith(
      `This ${noun} already exists, so we opened it.`,
    );
    expect(fixture.info.mock.invocationCallOrder[0]).toBeLessThan(
      fixture.push.mock.invocationCallOrder[0]!,
    );
    client.clear();
  },
);
