// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import {
  QueryClient,
  QueryClientProvider,
} from "../../../../apps/admin/node_modules/@tanstack/react-query/build/modern/index.js";
import { MinistryUpdateCreateView } from "../../../../apps/admin/src/cms-ui/web-studio/flows/MinistryUpdateCreateView";
import { MissionaryGivingCreateView } from "../../../../apps/admin/src/cms-ui/web-studio/flows/MissionaryGivingCreateView";
import { ProjectPageCreateView } from "../../../../apps/admin/src/cms-ui/web-studio/flows/ProjectPageCreateView";
import { StandardPageFromTemplateView } from "../../../../apps/admin/src/cms-ui/web-studio/flows/StandardPageFromTemplateView";

const fixture = vi.hoisted(() => ({ push: vi.fn(), info: vi.fn() }));
vi.mock("sonner", () => ({ toast: { info: fixture.info } }));
vi.mock(
  "../../../../apps/admin/node_modules/@payloadcms/ui/dist/exports/client/index.js",
  async (importOriginal) => ({
    ...(await importOriginal<
      typeof import("../../../../apps/admin/node_modules/@payloadcms/ui/dist/exports/client/index.js")
    >()),
    useAuth: () => ({ user: { role: "admin" } }),
    useConfig: () => ({
      config: {
        routes: { api: "/api/cms", admin: "/web-studio" },
        serverURL: "",
      },
    }),
  }),
);
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams("template=template-1"),
  useRouter: () => ({ push: fixture.push }),
}));
// The flows render Payload links (Cancel, Change template); Payload's Link
// needs its router adapter, which these isolated renders do not mount.
vi.mock("../../../../apps/admin/src/cms-ui/web-studio/routing", () => ({
  Link: ({ href, ...props }: React.ComponentProps<"a">) => (
    <a href={href} {...props} />
  ),
  useSearchParams: () => new URLSearchParams("template=template-1"),
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

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

it.each([
  {
    View: MissionaryGivingCreateView,
    label: "Missionary",
    name: "Ada Lovelace",
    collection: "missionary-giving-pages",
    pageType: "missionary_giving",
    message: "This giving page already exists, so we opened it.",
  },
  {
    View: ProjectPageCreateView,
    label: "Fund",
    name: "Relief fund",
    collection: "project-pages",
    pageType: "project",
    message: "This project page already exists, so we opened it.",
  },
])(
  "explains an existing $collection before opening it",
  async ({ View, label, name, collection, pageType, message }) => {
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    Element.prototype.scrollIntoView ??= () => {};
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string, init?: RequestInit) =>
        init?.method === "POST"
          ? Response.json({ existingId: "existing-1" }, { status: 409 })
          : Response.json({
              missionaries: [
                { id: "missionary-1", profile: { full_name: "Ada Lovelace" } },
              ],
              funds: [{ id: "fund-1", name: "Relief fund" }],
              docs: [{ id: "template-1", name: "Starting layout", pageType }],
            }),
      ),
    );
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const view = render(
      <QueryClientProvider client={client}>
        <View />
      </QueryClientProvider>,
    );
    const selector = await screen.findByRole("combobox", {
      name: label,
      exact: true,
    });
    await waitFor(() => expect(selector.hasAttribute("disabled")).toBe(false));
    fireEvent.click(selector);
    fireEvent.click(await screen.findByRole("option", { name, exact: true }));
    const form = view.container.querySelector("form");
    if (!form) throw new Error("Draft form missing");
    fireEvent.submit(form);
    await waitFor(() =>
      expect(fixture.push).toHaveBeenCalledWith(
        `/web-studio/collections/${collection}/existing-1`,
      ),
    );
    expect(fixture.info).toHaveBeenCalledExactlyOnceWith(message);
    expect(fixture.info.mock.invocationCallOrder[0]).toBeLessThan(
      fixture.push.mock.invocationCallOrder[0]!,
    );
    client.clear();
  },
);

it.each([
  {
    View: MissionaryGivingCreateView,
    label: "Missionary",
    targetCollection: "missionary-giving-pages",
    pageType: "missionary_giving",
    selection: { missionaryId: "missionary-1" },
  },
  {
    View: ProjectPageCreateView,
    label: "Fund",
    targetCollection: "project-pages",
    pageType: "project",
    selection: { fundId: "fund-1" },
  },
  {
    View: MinistryUpdateCreateView,
    label: "Missionary profile",
    targetCollection: "ministry-updates",
    pageType: "ministry_update",
    selection: { missionaryProfileId: "profile-1" },
  },
])(
  "preserves $targetCollection selection and retries network failure without duplicate pending requests",
  async ({ View, label, targetCollection, pageType, selection }) => {
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    Element.prototype.scrollIntoView ??= () => {};
    let reject!: (reason: unknown) => void;
    const pending = new Promise<Response>((_resolve, rejectPromise) => {
      reject = rejectPromise;
    });
    const create = vi
      .fn()
      .mockReturnValueOnce(pending)
      .mockResolvedValueOnce(
        Response.json({ id: "document-1", collectionSlug: targetCollection }),
      );
    vi.stubGlobal(
      "fetch",
      vi.fn((url: string, init?: RequestInit) => {
        if (init?.method === "POST") return create(url, init);
        return Promise.resolve(
          Response.json({
            missionaries: [
              { id: "missionary-1", profile: { full_name: "Ada Lovelace" } },
            ],
            funds: [{ id: "fund-1", name: "Relief fund" }],
            docs: url.includes("page-templates")
              ? [{ id: "template-1", name: "Starting layout", pageType }]
              : [{ id: "profile-1", fullName: "Ada Lovelace" }],
          }),
        );
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
    const selector = await screen.findByRole("combobox", {
      name: label,
      exact: true,
    });
    await waitFor(() => expect(selector.hasAttribute("disabled")).toBe(false));
    fireEvent.click(selector);
    fireEvent.click(
      await screen.findByRole("option", {
        name: label === "Fund" ? "Relief fund" : "Ada Lovelace",
        exact: true,
      }),
    );
    if (targetCollection === "ministry-updates") {
      fireEvent.change(screen.getByRole("textbox", { name: "Title" }), {
        target: { value: "Quarterly update" },
      });
      fireEvent.change(
        screen.getByRole("textbox", { name: "URL slug", exact: true }),
        { target: { value: "quarterly-update" } },
      );
    }
    const form = view.container.querySelector("form");
    if (!form) throw new Error("Draft form missing");
    fireEvent.submit(form);
    expect(
      (
        await screen.findByRole("button", { name: "Creating draft…" })
      ).hasAttribute("disabled"),
    ).toBe(true);
    await act(async () => {
      fireEvent.submit(form);
    });
    expect(create).toHaveBeenCalledTimes(1);
    const [url, init] = create.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/cms/web-studio/create-from-template");
    expect(JSON.parse(String(init.body))).toEqual({
      targetCollection,
      templateId: "template-1",
      ...selection,
      ...(targetCollection === "ministry-updates"
        ? { title: "Quarterly update", slug: "quarterly-update" }
        : {}),
    });
    await act(async () => reject(new TypeError("Connection interrupted")));
    expect((await screen.findByRole("alert")).textContent).toMatch(
      /check your connection and try again/i,
    );
    expect(
      screen.getByRole("combobox", { name: label, exact: true }).textContent,
    ).toContain(label === "Fund" ? "Relief fund" : "Ada Lovelace");
    fireEvent.submit(form);
    await waitFor(() =>
      expect(fixture.push).toHaveBeenCalledExactlyOnceWith(
        `/web-studio/collections/${targetCollection}/document-1`,
      ),
    );
    expect(create).toHaveBeenCalledTimes(2);
    expect(create.mock.calls[1]).toEqual(create.mock.calls[0]);
    client.clear();
  },
);

it("identifies same-name missionaries by directory context before creating the selected giving page", async () => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  Element.prototype.scrollIntoView ??= () => {};
  const fetchMock = vi.fn(async (_url: string, init?: RequestInit) =>
    init?.method === "POST"
      ? Response.json({
          id: "giving-2",
          collectionSlug: "missionary-giving-pages",
        })
      : Response.json({
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
            {
              id: "m-3",
              profile: { full_name: "Grace Okafor" },
              location: null,
              missionField: null,
            },
          ],
          docs: [
            {
              id: "template-1",
              name: "Starting layout",
              pageType: "missionary_giving",
            },
          ],
        }),
  );
  vi.stubGlobal("fetch", fetchMock);
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const view = render(
    <QueryClientProvider client={client}>
      <MissionaryGivingCreateView />
    </QueryClientProvider>,
  );
  const selector = await screen.findByRole("combobox", {
    name: "Missionary",
    exact: true,
  });
  await waitFor(() => expect(selector.hasAttribute("disabled")).toBe(false));
  fireEvent.click(selector);
  expect(
    await screen.findByRole("option", {
      name: "Grace Okafor · Nairobi · Education",
      exact: true,
    }),
  ).toBeTruthy();
  expect(
    screen.getByRole("option", { name: "Grace Okafor (m-3)", exact: true }),
  ).toBeTruthy();
  fireEvent.click(
    screen.getByRole("option", {
      name: "Grace Okafor · Lima · Healthcare",
      exact: true,
    }),
  );
  const form = view.container.querySelector("form");
  if (!form) throw new Error("Draft form missing");
  fireEvent.submit(form);
  await waitFor(() =>
    expect(fixture.push).toHaveBeenCalledWith(
      "/web-studio/collections/missionary-giving-pages/giving-2",
    ),
  );
  const create = fetchMock.mock.calls.find(
    ([, init]) => init?.method === "POST",
  );
  expect(JSON.parse(String(create?.[1]?.body))).toMatchObject({
    missionaryId: "m-2",
  });
  client.clear();
});

it("keeps draft input and payload intact through pending, connection failure, and retry", async () => {
  let reject!: (reason: unknown) => void;
  const pending = new Promise<Response>((_resolve, rejectPromise) => {
    reject = rejectPromise;
  });
  // Only the create POST is sequenced; the template field also reads the
  // template list (GET) to name the gallery's choice.
  const fetchMock = vi
    .fn()
    .mockReturnValueOnce(pending)
    .mockResolvedValueOnce(
      Response.json({ id: "page-1", collectionSlug: "pages" }),
    );
  vi.stubGlobal(
    "fetch",
    vi.fn((url: string, init?: RequestInit) =>
      init?.method === "POST"
        ? fetchMock(url, init)
        : Promise.resolve(
            Response.json({
              docs: [
                {
                  id: "template-1",
                  name: "Starting layout",
                  pageType: "standard",
                },
              ],
            }),
          ),
    ),
  );
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const view = render(
    <QueryClientProvider client={client}>
      <StandardPageFromTemplateView />
    </QueryClientProvider>,
  );
  fireEvent.change(screen.getByRole("textbox", { name: "Title" }), {
    target: { value: "Quarterly update" },
  });
  fireEvent.change(screen.getByRole("textbox", { name: "URL slug" }), {
    target: { value: "quarterly-update" },
  });
  const form = view.container.querySelector("form");
  if (!form) throw new Error("Draft form missing");
  const submit = screen.getByRole("button", { name: "Create draft" });
  await waitFor(() => expect(submit.hasAttribute("disabled")).toBe(false));
  submit.focus();
  fireEvent.submit(form);
  const pendingButton = await screen.findByRole("button", {
    name: "Creating draft…",
  });
  expect(pendingButton).toBe(submit);
  expect(pendingButton.hasAttribute("disabled")).toBe(true);
  await act(async () => {
    fireEvent.submit(form);
  });
  expect(fetchMock).toHaveBeenCalledTimes(1);
  const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
  expect(url).toBe("/api/cms/web-studio/create-from-template");
  expect(init.credentials).toBe("include");
  expect(JSON.parse(String(init.body))).toEqual({
    targetCollection: "pages",
    templateId: "template-1",
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
  expect(screen.getByRole("textbox", { name: "URL slug" })).toHaveProperty(
    "value",
    "quarterly-update",
  );
  fireEvent.submit(form);
  await waitFor(() =>
    expect(fixture.push).toHaveBeenCalledExactlyOnceWith(
      "/web-studio/collections/pages/page-1",
    ),
  );
  expect(fetchMock).toHaveBeenCalledTimes(2);
  expect(fetchMock.mock.calls[1]).toEqual(fetchMock.mock.calls[0]);
  expect(screen.queryByRole("alert")).toBeNull();
  client.clear();
});

it.each([
  {
    View: MissionaryGivingCreateView,
    label: "Missionary",
    message: "Select a missionary.",
    pageType: "missionary_giving",
  },
  {
    View: ProjectPageCreateView,
    label: "Fund",
    message: "Select a fund.",
    pageType: "project",
  },
  {
    View: MinistryUpdateCreateView,
    label: "Missionary profile",
    pageType: "ministry_update",
    message: "Select a missionary profile.",
  },
])(
  "marks $label required and reports a missing choice under it",
  async ({ View, label, pageType, message }) => {
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    const create = vi.fn();
    vi.stubGlobal(
      "fetch",
      vi.fn((url: string, init?: RequestInit) => {
        if (init?.method === "POST") return create(url, init);
        return Promise.resolve(
          Response.json({
            missionaries: [
              { id: "missionary-1", profile: { full_name: "Ada Lovelace" } },
            ],
            funds: [{ id: "fund-1", name: "Relief fund" }],
            docs: url.includes("page-templates")
              ? [{ id: "template-1", name: "Starting layout", pageType }]
              : [{ id: "profile-1", fullName: "Ada Lovelace" }],
          }),
        );
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
    const selector = await screen.findByRole("combobox", {
      name: label,
      exact: true,
    });
    await waitFor(() => expect(selector.hasAttribute("disabled")).toBe(false));
    expect(selector.getAttribute("aria-required")).toBe("true");
    const form = view.container.querySelector("form");
    if (!form) throw new Error("Draft form missing");
    await act(async () => {
      fireEvent.submit(form);
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
    expect(document.activeElement).toBe(selector);
    client.clear();
  },
);
