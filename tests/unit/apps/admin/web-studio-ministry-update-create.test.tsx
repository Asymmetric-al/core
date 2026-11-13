// @vitest-environment jsdom

import {
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
import { MinistryUpdateCreateView } from "../../../../apps/admin/src/cms-ui/web-studio/flows/MinistryUpdateCreateView";

const fixture = vi.hoisted(() => ({ role: "super_admin" }));
vi.mock(
  "../../../../apps/admin/node_modules/@payloadcms/ui/dist/exports/client/index.js",
  async (importOriginal) => ({
    ...(await importOriginal<
      typeof import("../../../../apps/admin/node_modules/@payloadcms/ui/dist/exports/client/index.js")
    >()),
    useAuth: () => ({ user: { role: fixture.role }, permissions: {} }),
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
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: vi.fn() }),
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
  fixture.role = "super_admin";
});

function renderFlow() {
  const requests: string[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      requests.push(url);
      const params = new URL(url, "https://example.test").searchParams;
      const organization = params.get("where[tenant][equals]");
      const docs = url.includes("/tenants?")
        ? [
            { id: "org-1", name: "North" },
            { id: "org-2", name: "South" },
            { id: "org-3" },
            { id: "org-4", name: "Same" },
            { id: "org-5", name: "Same" },
          ]
        : url.includes("/missionary-profiles?")
          ? [
              {
                id: `${organization}-profile`,
                fullName:
                  organization === "org-2" ? "South profile" : "North profile",
              },
            ]
          : [{ id: "template", name: "Update", pageType: "ministry_update" }];
      return Response.json({ docs });
    }),
  );
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <MinistryUpdateCreateView />
    </QueryClientProvider>,
  );
  return { client, requests };
}

it("loads only the chosen organization's profiles and clears a previous choice", async () => {
  const { client, requests } = renderFlow();
  const organization = await screen.findByRole("combobox", {
    name: "Organization",
  });
  await waitFor(() => expect(organization).toHaveProperty("disabled", false));
  const profiles = screen.getByRole("combobox", { name: "Missionary profile" });
  expect(profiles.textContent).toContain("Choose an organization first");
  expect(requests.some((url) => url.includes("/missionary-profiles?"))).toBe(
    false,
  );
  fireEvent.click(organization);
  expect(
    await screen.findByRole("option", { name: "Unnamed organization (org-3)" }),
  ).toBeTruthy();
  expect(screen.getByRole("option", { name: "Same (org-4)" })).toBeTruthy();
  expect(screen.getByRole("option", { name: "Same (org-5)" })).toBeTruthy();
  fireEvent.click(screen.getByRole("option", { name: "North" }));
  await waitFor(() => expect(profiles).toHaveProperty("disabled", false));
  fireEvent.click(profiles);
  fireEvent.click(await screen.findByRole("option", { name: "North profile" }));
  expect(profiles.textContent).toContain("North profile");
  fireEvent.click(organization);
  fireEvent.click(await screen.findByRole("option", { name: "South" }));
  await waitFor(() => expect(profiles).toHaveProperty("disabled", false));
  expect(profiles.textContent).not.toContain("North profile");
  fireEvent.click(profiles);
  expect(
    await screen.findByRole("option", { name: "South profile" }),
  ).toBeTruthy();
  expect(screen.queryByRole("option", { name: "North profile" })).toBeNull();
  expect(
    requests
      .filter((url) => url.includes("/missionary-profiles?"))
      .map((url) =>
        new URL(url, "https://example.test").searchParams.get(
          "where[tenant][equals]",
        ),
      ),
  ).toEqual(["org-1", "org-2"]);
  expect(screen.getByText(/Up to 200 profiles/)).toBeTruthy();
  client.clear();
});

it("lets ordinary staff use server-scoped profiles without an organization picker", async () => {
  fixture.role = "staff";
  const { client, requests } = renderFlow();
  const profiles = await screen.findByRole("combobox", {
    name: "Missionary profile",
  });
  await waitFor(() => expect(profiles).toHaveProperty("disabled", false));
  expect(screen.queryByRole("combobox", { name: "Organization" })).toBeNull();
  expect(
    requests.find((url) => url.includes("/missionary-profiles?")),
  ).not.toContain("where");
  client.clear();
});
