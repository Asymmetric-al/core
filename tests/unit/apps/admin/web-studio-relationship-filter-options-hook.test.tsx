// @vitest-environment jsdom

import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

type EntityLookup = (args: {
  collectionSlug: string;
}) => { admin?: { useAsTitle?: string } } | null;

const payload = vi.hoisted(
  (): {
    config: { serverURL: string; routes: { api: string } };
    getEntityConfig: EntityLookup;
  } => ({
    config: { serverURL: "", routes: { api: "/api" } },
    getEntityConfig: () => null,
  }),
);

// Payload's client config is the external boundary: its provider needs a full
// sanitized config, so the hook reads this one instead.
vi.mock(
  "../../../../apps/admin/node_modules/@payloadcms/ui/dist/exports/client/index.js",
  () => ({
    useConfig: () => ({
      config: payload.config,
      getEntityConfig: payload.getEntityConfig,
    }),
  }),
);

import { useRelationshipFilterOptions } from "../../../../apps/admin/src/cms-ui/web-studio/collections/shared/list-workspace/relationship-filter-options";

/**
 * Web Studio list filters load the documents each relationship can point at
 * once per set of relationships and API route. Rebuilt fields or a rebuilt
 * Payload config with the same relationships must not load them again.
 */

const titles: Record<string, string> = { tenants: "name", users: "email" };

function lookupTitles(): EntityLookup {
  return ({ collectionSlug }) => ({
    admin: { useAsTitle: titles[collectionSlug] },
  });
}

const tenantField = {
  name: "tenant",
  type: "relationship",
  relationTo: "tenants",
};
const authorField = {
  name: "author",
  type: "relationship",
  relationTo: "users",
};

const fetchMock = vi.fn(
  async (input: RequestInfo | URL, _init?: RequestInit) => {
    const url = String(input);
    if (url.includes("/tenants?")) {
      return Response.json({ docs: [{ id: 1, name: "E2E Tenant" }] });
    }
    if (url.includes("/users?")) {
      return Response.json({
        docs: [{ id: "u1", email: "editor@example.org" }],
      });
    }
    throw new Error(`Unexpected request: ${url}`);
  },
);

function requestedUrls() {
  return fetchMock.mock.calls.map(([input]) => String(input));
}

beforeEach(() => {
  payload.config = { serverURL: "", routes: { api: "/api" } };
  payload.getEntityConfig = lookupTitles();
  fetchMock.mockClear();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it("loads each relationship's documents once, named by the related collection's title field", async () => {
  const { result } = renderHook(() =>
    useRelationshipFilterOptions([tenantField]),
  );
  await waitFor(() =>
    expect(result.current).toEqual({
      tenant: [{ label: "E2E Tenant", value: "1" }],
    }),
  );
  expect(requestedUrls()).toHaveLength(1);
  const url = new URL(requestedUrls()[0] ?? "", "http://localhost");
  expect(url.pathname).toBe("/api/tenants");
  expect(url.searchParams.get("sort")).toBe("name");
});

it("does not load again when the fields or Payload's config are rebuilt with the same relationships", async () => {
  const { result, rerender } = renderHook(
    ({ fields }: { fields: readonly unknown[] }) =>
      useRelationshipFilterOptions(fields),
    { initialProps: { fields: [tenantField] } },
  );
  await waitFor(() => expect(result.current.tenant).toHaveLength(1));

  payload.getEntityConfig = lookupTitles();
  rerender({ fields: [{ ...tenantField }] });
  rerender({ fields: [{ ...tenantField }] });

  await Promise.resolve();
  expect(requestedUrls()).toHaveLength(1);
  expect(result.current.tenant).toEqual([{ label: "E2E Tenant", value: "1" }]);
});

it("loads again when the relationships change", async () => {
  const { result, rerender } = renderHook(
    ({ fields }: { fields: readonly unknown[] }) =>
      useRelationshipFilterOptions(fields),
    { initialProps: { fields: [tenantField] } },
  );
  await waitFor(() => expect(result.current.tenant).toHaveLength(1));

  rerender({ fields: [tenantField, authorField] });
  await waitFor(() =>
    expect(result.current.author).toEqual([
      { label: "editor@example.org", value: "u1" },
    ]),
  );
  expect(requestedUrls()).toHaveLength(3);
});

it("loads again from a changed API route", async () => {
  const { result, rerender } = renderHook(() =>
    useRelationshipFilterOptions([tenantField]),
  );
  await waitFor(() => expect(result.current.tenant).toHaveLength(1));

  payload.config = { serverURL: "", routes: { api: "/cms-api" } };
  rerender();
  await waitFor(() => expect(requestedUrls()).toHaveLength(2));
  expect(requestedUrls()[1]?.startsWith("/cms-api/tenants?")).toBe(true);
});

it("requests nothing for a collection without relationships", async () => {
  const { result } = renderHook(() =>
    useRelationshipFilterOptions([{ name: "title", type: "text" }]),
  );
  await Promise.resolve();
  expect(fetchMock).not.toHaveBeenCalled();
  expect(result.current).toEqual({});
});

it("cancels an unfinished load when the list unmounts", async () => {
  const { unmount } = renderHook(() =>
    useRelationshipFilterOptions([tenantField]),
  );
  await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
  const signal = fetchMock.mock.calls[0]?.[1]?.signal;
  expect(signal?.aborted).toBe(false);
  unmount();
  expect(signal?.aborted).toBe(true);
});
