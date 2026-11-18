/** @vitest-environment jsdom */

import { act, screen, waitFor } from "@testing-library/react";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

const LOCATION = {
  id: "8a1f0f5e-2a4b-4c7d-9e1f-0a2b3c4d5e6f",
  tenant_id: "tenant-1",
  title: "Nairobi team house",
  lat: -1.29,
  lng: 36.82,
  type: "missionary",
  linked_id: null,
  summary: null,
  image_public_id: null,
  status: "published",
  sort_key: 0,
  created_at: "2026-09-15T12:00:00.000Z",
  updated_at: "2026-09-15T12:00:00.000Z",
};

const fetchMock = vi.fn(async (_input: RequestInfo | URL) => ({
  ok: true,
  status: 200,
  json: async () => ({
    locations: [LOCATION],
    linkedEntities: { missionaries: [], projects: [] },
  }),
}));

let root: Root | undefined;
let container: HTMLDivElement | undefined;

// The collection is process-wide, so each test loads a fresh module graph.
async function loadLocations() {
  vi.resetModules();
  const hooks =
    await import("../../../../packages/database/hooks/admin-locations");
  const collections =
    await import("../../../../packages/database/collections/admin-locations");

  function LocationsProbe() {
    const { data, isLoading, isError } = hooks.useLocations();
    if (isLoading) return <p role="status">Loading locations</p>;
    if (isError) return <p role="alert">Locations could not load</p>;
    return (
      <ul>
        {data?.map((location) => (
          <li key={location.id}>{location.title}</li>
        ))}
      </ul>
    );
  }

  return {
    LocationsProbe,
    collection: collections.adminLocationsCollection,
  };
}

async function flushMicrotasks() {
  for (let i = 0; i < 5; i += 1) await Promise.resolve();
}

beforeEach(() => {
  fetchMock.mockClear();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(async () => {
  await act(async () => root?.unmount());
  root = undefined;
  container?.remove();
  container = undefined;
  vi.unstubAllGlobals();
});

it("renders the loading state on the server and starts no request", async () => {
  const { LocationsProbe, collection } = await loadLocations();

  const html = renderToString(<LocationsProbe />);
  await flushMicrotasks();

  expect(html).toContain('role="status"');
  expect(html).not.toContain('role="alert"');
  expect(fetchMock).not.toHaveBeenCalled();
  // Nothing syncs, so no failed server fetch can stick to the shared collection.
  expect(collection.status).toBe("idle");
});

it("hydrates the server's loading state without a mismatch, then loads in the browser", async () => {
  const { LocationsProbe } = await loadLocations();

  const html = renderToString(<LocationsProbe />);
  // Anything the server render started settles before the browser hydrates.
  await new Promise((resolve) => setTimeout(resolve, 20));
  container = document.createElement("div");
  container.innerHTML = html;
  document.body.append(container);

  const recoverableErrors: unknown[] = [];
  await act(async () => {
    root = hydrateRoot(container as HTMLDivElement, <LocationsProbe />, {
      onRecoverableError: (error) => recoverableErrors.push(error),
    });
  });

  expect(recoverableErrors).toEqual([]);
  const item = await screen.findByRole("listitem", {}, { timeout: 2000 });
  expect(item.textContent).toBe("Nairobi team house");
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
  expect(String(fetchMock.mock.calls[0]?.[0])).toBe("/api/admin/locations");
});
