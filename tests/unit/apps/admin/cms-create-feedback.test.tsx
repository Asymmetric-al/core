// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  QueryClient,
  QueryClientProvider,
} from "../../../../apps/admin/node_modules/@tanstack/react-query/build/modern/index.js";
import {
  NO_SITE_NOTE,
  StandardPageFromTemplateView,
} from "../../../../apps/admin/src/cms-ui/web-studio/flows/StandardPageFromTemplateView";

const SITE = "6a1f3c2e-0d4b-4c8a-9e7f-1b2c3d4e5f60";
const OTHER_SITE = "7b2e4d3f-1e5c-4d9b-8f80-2c3d4e5f6071";

const fixture = vi.hoisted(() => ({
  push: vi.fn(),
  search: "template=standard",
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

beforeEach(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  Element.prototype.scrollIntoView ??= () => {};
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  fixture.search = "template=standard";
});

function directoryResponse(url: string, sites: string[]) {
  if (url.includes("/site-presentations")) {
    return Response.json({ docs: sites.map((id) => ({ id })) });
  }
  return Response.json({
    missionaries: [
      {
        id: "m-1",
        profile: { full_name: "Grace Okafor" },
        location: "Nairobi",
        missionField: "Education",
      },
      {
        id: "m-2",
        profile: { full_name: "Grace Okafor" },
        location: "Lima",
        missionField: "Healthcare",
      },
    ],
    funds: [{ id: "fund-1", name: "Relief fund" }],
  });
}

function renderFlow() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const view = render(
    <QueryClientProvider client={client}>
      <StandardPageFromTemplateView />
    </QueryClientProvider>,
  );
  const form = () => {
    const element = view.container.querySelector("form");
    if (!element) throw new Error("Draft form missing");
    return element;
  };
  return { client, view, form };
}

describe("the one create flow (D-18: WP6 part 2b folds the giving, project and update create views into New page, one pages collection with a Site and a starter in code)", () => {
  it("keeps draft input and the request intact through pending, connection failure and retry", async () => {
    let reject!: (reason: unknown) => void;
    const pending = new Promise<Response>((_resolve, rejectPromise) => {
      reject = rejectPromise;
    });
    const create = vi
      .fn()
      .mockReturnValueOnce(pending)
      .mockResolvedValueOnce(
        Response.json({ id: "page-1", collectionSlug: "pages" }),
      );
    vi.stubGlobal(
      "fetch",
      vi.fn((url: string, init?: RequestInit) =>
        init?.method === "POST"
          ? create(url, init)
          : Promise.resolve(directoryResponse(url, [SITE])),
      ),
    );
    const { client, form } = renderFlow();
    fireEvent.change(screen.getByRole("textbox", { name: "Title" }), {
      target: { value: "Quarterly update" },
    });
    const submit = screen.getByRole("button", { name: "Create draft" });
    await waitFor(() => expect(submit.hasAttribute("disabled")).toBe(false));
    fireEvent.submit(form());
    const pendingButton = await screen.findByRole("button", {
      name: "Creating draft…",
    });
    expect(pendingButton.hasAttribute("disabled")).toBe(true);
    await act(async () => {
      fireEvent.submit(form());
    });
    expect(create).toHaveBeenCalledTimes(1);
    const [url, init] = create.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/cms/web-studio/create-from-template");
    expect(init.credentials).toBe("include");
    expect(JSON.parse(String(init.body))).toEqual({
      starterKey: "standard",
      site: SITE,
      title: "Quarterly update",
      slug: "quarterly-update",
    });
    await act(async () => reject(new TypeError("Connection interrupted")));
    expect((await screen.findByRole("alert")).textContent).toMatch(
      /check your connection and try again/i,
    );
    expect(screen.getByRole("textbox", { name: "Title" })).toHaveProperty(
      "value",
      "Quarterly update",
    );
    fireEvent.submit(form());
    await waitFor(() =>
      expect(fixture.push).toHaveBeenCalledExactlyOnceWith(
        "/web-studio/collections/pages/page-1",
      ),
    );
    expect(create.mock.calls[1]).toEqual(create.mock.calls[0]);
    client.clear();
  });

  it("names same-name missionaries by directory context and sends the chosen one with the giving starter", async () => {
    fixture.search = "template=missionary-giving";
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) =>
      init?.method === "POST"
        ? Response.json({ id: "giving-2", collectionSlug: "pages" })
        : directoryResponse(url, [SITE]),
    );
    vi.stubGlobal("fetch", fetchMock);
    const { client, form } = renderFlow();
    const selector = await screen.findByRole("combobox", {
      name: "Missionary",
      exact: true,
    });
    await waitFor(() => expect(selector.hasAttribute("disabled")).toBe(false));
    fireEvent.click(selector);
    fireEvent.click(
      await screen.findByRole("option", {
        name: "Grace Okafor · Lima · Healthcare",
        exact: true,
      }),
    );
    fireEvent.submit(form());
    await waitFor(() =>
      expect(fixture.push).toHaveBeenCalledWith(
        "/web-studio/collections/pages/giving-2",
      ),
    );
    const post = fetchMock.mock.calls.find(
      ([, init]) => init?.method === "POST",
    );
    expect(JSON.parse(String(post?.[1]?.body))).toEqual({
      starterKey: "missionary-giving",
      site: SITE,
      missionaryId: "m-2",
    });
    client.clear();
  });

  it.each([
    {
      search: "template=missionary-giving",
      label: "Missionary",
      message: "Choose a missionary.",
    },
    { search: "template=project", label: "Fund", message: "Choose a fund." },
  ])(
    "marks $label required and reports a missing choice under it",
    async ({ search, label, message }) => {
      fixture.search = search;
      const create = vi.fn();
      vi.stubGlobal(
        "fetch",
        vi.fn((url: string, init?: RequestInit) =>
          init?.method === "POST"
            ? create(url, init)
            : Promise.resolve(directoryResponse(url, [SITE])),
        ),
      );
      const { client, form } = renderFlow();
      const selector = await screen.findByRole("combobox", {
        name: label,
        exact: true,
      });
      await waitFor(() =>
        expect(selector.hasAttribute("disabled")).toBe(false),
      );
      expect(selector.getAttribute("aria-required")).toBe("true");
      await act(async () => {
        fireEvent.submit(form());
      });
      expect(create).not.toHaveBeenCalled();
      expect(selector.getAttribute("aria-invalid")).toBe("true");
      const describedBy = selector.getAttribute("aria-describedby") ?? "";
      expect(
        describedBy
          .split(" ")
          .map((id) => document.getElementById(id)?.textContent)
          .join(" "),
      ).toContain(message);
      client.clear();
    },
  );

  it("asks for a Site when the organization has two, and sends the one chosen", async () => {
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) =>
      init?.method === "POST"
        ? Response.json({ id: "page-2", collectionSlug: "pages" })
        : directoryResponse(url, [SITE, OTHER_SITE]),
    );
    vi.stubGlobal("fetch", fetchMock);
    const { client, form } = renderFlow();
    fireEvent.change(screen.getByRole("textbox", { name: "Title" }), {
      target: { value: "About us" },
    });
    const site = await screen.findByRole("combobox", {
      name: "Site",
      exact: true,
    });
    await waitFor(() => expect(site.hasAttribute("disabled")).toBe(false));
    await act(async () => {
      fireEvent.submit(form());
    });
    expect(
      fetchMock.mock.calls.some(([, init]) => init?.method === "POST"),
    ).toBe(false);
    expect(site.getAttribute("aria-invalid")).toBe("true");
    fireEvent.click(site);
    fireEvent.click(
      await screen.findByRole("option", {
        name: `Site ${OTHER_SITE}`,
        exact: true,
      }),
    );
    fireEvent.submit(form());
    await waitFor(() =>
      expect(fixture.push).toHaveBeenCalledWith(
        "/web-studio/collections/pages/page-2",
      ),
    );
    const post = fetchMock.mock.calls.find(
      ([, init]) => init?.method === "POST",
    );
    expect(JSON.parse(String(post?.[1]?.body))).toMatchObject({
      site: OTHER_SITE,
    });
    client.clear();
  });

  it("says why no page can be created when the organization has no Site, and offers no create", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => directoryResponse(url, [])),
    );
    const { client } = renderFlow();
    expect(await screen.findByText(NO_SITE_NOTE)).toBeTruthy();
    expect(
      screen
        .getByRole("button", { name: "Create draft" })
        .hasAttribute("disabled"),
    ).toBe(true);
    client.clear();
  });
});
