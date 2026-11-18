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
import { DocumentPinToggle } from "../../../../apps/admin/src/cms-ui/web-studio/collections/shared/document-workspace/document-pin-toggle";
import { TooltipProvider } from "../../../../packages/ui/components/shadcn/tooltip";

vi.mock(
  "../../../../apps/admin/node_modules/@payloadcms/ui/dist/exports/client/index.js",
  async (importOriginal) => ({
    ...(await importOriginal<
      typeof import("../../../../apps/admin/node_modules/@payloadcms/ui/dist/exports/client/index.js")
    >()),
    useConfig: () => ({
      config: { routes: { api: "/api", admin: "/web-studio" }, serverURL: "" },
    }),
  }),
);

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function setup(
  stored: Array<{ id: string | number; collectionSlug: string }>,
  save?: Promise<void>,
) {
  let items = stored;
  const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
    expect(url).toBe("/api/payload-preferences/pinned-documents");
    if (init?.method === "POST") {
      await save;
      items = (JSON.parse(String(init.body)) as { value: { items: [] } }).value
        .items;
      return Response.json({});
    }
    return Response.json({ value: { items } });
  });
  vi.stubGlobal("fetch", fetchMock);
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <TooltipProvider>
        <DocumentPinToggle collectionSlug="pages" documentId={7} />
      </TooltipProvider>
    </QueryClientProvider>,
  );
  return { fetchMock, items: () => items };
}

it("pins the open document in Payload's pinned-documents preference", async () => {
  const { items } = setup([{ id: "m9", collectionSlug: "media" }]);
  const toggle = screen.getByRole("button", { name: "Pin to Studio home" });
  await waitFor(() => expect(toggle.hasAttribute("disabled")).toBe(false));
  expect(toggle.getAttribute("aria-pressed")).toBe("false");
  fireEvent.click(toggle);
  await waitFor(() =>
    expect(items()).toEqual([
      // Stored with Payload's own id type, newest first, like its widget.
      { id: 7, collectionSlug: "pages" },
      { id: "m9", collectionSlug: "media" },
    ]),
  );
  await waitFor(() => expect(toggle.getAttribute("aria-pressed")).toBe("true"));
});

it("unpins a document that is already pinned", async () => {
  const { items } = setup([{ id: 7, collectionSlug: "pages" }]);
  const toggle = screen.getByRole("button", { name: "Pin to Studio home" });
  await waitFor(() => expect(toggle.getAttribute("aria-pressed")).toBe("true"));
  fireEvent.click(toggle);
  await waitFor(() => expect(items()).toEqual([]));
  await waitFor(() =>
    expect(toggle.getAttribute("aria-pressed")).toBe("false"),
  );
});

it("keeps focus on the toggle while the pin saves", async () => {
  const save = Promise.withResolvers<void>();
  const { fetchMock, items } = setup([], save.promise);
  const toggle = screen.getByRole("button", { name: "Pin to Studio home" });
  await waitFor(() => expect(toggle.hasAttribute("disabled")).toBe(false));
  toggle.focus();
  fireEvent.click(toggle);
  await waitFor(() =>
    expect(toggle.getAttribute("aria-disabled")).toBe("true"),
  );
  expect(toggle.hasAttribute("disabled")).toBe(false);
  expect(document.activeElement).toBe(toggle);
  // A second press while saving does nothing.
  fireEvent.click(toggle);

  await act(async () => save.resolve());
  await waitFor(() => expect(toggle.getAttribute("aria-pressed")).toBe("true"));
  expect(items()).toEqual([{ id: 7, collectionSlug: "pages" }]);
  expect(
    fetchMock.mock.calls.filter(([, init]) => init?.method === "POST"),
  ).toHaveLength(1);
  expect(toggle.getAttribute("aria-disabled")).not.toBe("true");
  expect(document.activeElement).toBe(toggle);
});
