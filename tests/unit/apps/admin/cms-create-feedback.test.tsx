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

const fixture = vi.hoisted(() => ({ push: vi.fn() }));
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
    targetCollection: "missionary-giving-pages",
    selection: { missionaryId: "missionary-1" },
  },
  {
    View: ProjectPageCreateView,
    label: "Fund",
    targetCollection: "project-pages",
    selection: { fundId: "fund-1" },
  },
  {
    View: MinistryUpdateCreateView,
    label: "Missionary profile",
    targetCollection: "ministry-updates",
    selection: { missionaryProfileId: "profile-1" },
  },
])(
  "preserves $targetCollection selection and retries network failure without duplicate pending requests",
  async ({ View, label, targetCollection, selection }) => {
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
            docs: [{ id: "profile-1", fullName: "Ada Lovelace" }],
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
        screen.getByRole("textbox", { name: "Slug", exact: true }),
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

it("keeps draft input and payload intact through pending, connection failure, and retry", async () => {
  let reject!: (reason: unknown) => void;
  const pending = new Promise<Response>((_resolve, rejectPromise) => {
    reject = rejectPromise;
  });
  const fetchMock = vi
    .fn()
    .mockReturnValueOnce(pending)
    .mockResolvedValueOnce(
      Response.json({ id: "page-1", collectionSlug: "pages" }),
    );
  vi.stubGlobal("fetch", fetchMock);
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
