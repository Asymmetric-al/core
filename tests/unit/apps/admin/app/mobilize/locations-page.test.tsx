/** @vitest-environment jsdom */

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- AL-1894: Exercise the page at its public UI boundary.
import LocationsPage from "../../../../../../apps/admin/app/(app)/mobilize/locations/page-client";
import { LocationEditor } from "../../../../../../apps/admin/features/mission-control/locations/components/LocationEditor";

const upsert = vi.fn(async (_location: unknown) => ({}));
const { mapPoint, queryState, refetch, remove } = vi.hoisted(() => ({
  mapPoint: { lng: 12.5, lat: 41.9 },
  queryState: { isLoading: false, isError: false, empty: false },
  refetch: vi.fn(),
  remove: vi.fn(),
}));

const LOCATIONS = [
  {
    id: "loc-1",
    title: "Amazon Medical Center",
    summary: "",
    type: "project",
    linked_id: null,
    status: "published",
    lat: -3.1,
    lng: -60.02,
    updated_at: "2026-10-01T12:00:00.000Z",
  },
  {
    id: "loc-2",
    title: "Nairobi team house",
    summary: "",
    type: "missionary",
    linked_id: null,
    status: "draft",
    lat: -1.29,
    lng: 36.82,
    updated_at: "2026-09-15T12:00:00.000Z",
  },
];

vi.mock("@asym/database/hooks", () => ({
  useLocations: () => ({
    data: queryState.empty ? [] : LOCATIONS,
    ...queryState,
    refetch,
  }),
  useLinkedEntities: () => ({ data: { missionaries: [] } }),
  useUpsertLocation: () => ({ mutateAsync: upsert, isPending: false }),
  useDeleteLocation: () => ({ mutateAsync: remove, isPending: false }),
}));

// The real map needs WebGL; the page only needs its click and marker seams.
vi.mock("@asym/ui/components/primitives/map", () => ({
  Map: ({
    children,
    onClick,
  }: {
    children?: React.ReactNode;
    onClick?: (event: { lngLat: { lng: number; lat: number } }) => void;
  }) => (
    <div>
      <button type="button" onClick={() => onClick?.({ lngLat: mapPoint })}>
        Simulated map click
      </button>
      {children}
    </div>
  ),
  MapControls: () => null,
  MapMarker: ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  ),
  MarkerContent: ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

beforeEach(() => {
  Object.assign(mapPoint, { lng: 12.5, lat: 41.9 });
  upsert.mockReset();
  upsert.mockResolvedValue({});
  remove.mockReset();
  remove.mockResolvedValue(undefined);
  Object.assign(queryState, { isLoading: false, isError: false, empty: false });
  vi.stubGlobal("matchMedia", (media: string) => ({
    media,
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  }));
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it("explains unavailable project links and preserves an existing relationship on save", async () => {
  render(
    <LocationEditor
      isOpen
      location={{
        ...LOCATIONS[0],
        type: "project",
        linked_id: "existing-project",
      }}
      onOpenChange={vi.fn()}
    />,
  );
  expect(screen.getByText("Project links aren’t available yet")).toBeTruthy();
  expect(
    screen.queryByRole("combobox", { name: /Link to project/i }),
  ).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: /Save/ }));
  await waitFor(() =>
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "project",
        linked_id: "existing-project",
      }),
    ),
  );
});

it("offers partner markers and clears an incompatible relationship when changing type", async () => {
  render(
    <LocationEditor
      isOpen
      location={{
        ...LOCATIONS[1],
        type: "missionary",
        linked_id: "existing-member",
      }}
      onOpenChange={vi.fn()}
    />,
  );
  fireEvent.click(screen.getByRole("combobox", { name: "Marker type" }));
  const partner = screen.getByRole("option", { name: "Partner" });
  fireEvent.pointerDown(partner, { pointerType: "mouse", buttons: 1 });
  fireEvent.click(partner);
  await waitFor(() =>
    expect(
      screen.queryByRole("combobox", { name: /Link to missionary/i }),
    ).toBeNull(),
  );
  fireEvent.click(screen.getByRole("button", { name: /Save/ }));
  await waitFor(() =>
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({ type: "partner", linked_id: null }),
    ),
  );
});

describe("Locations page", () => {
  it("names the map and list view selector", () => {
    render(<LocationsPage />);
    const views = screen.getByRole("tablist", { name: "Locations view" });
    expect(within(views).getByRole("tab", { name: "Map" })).toBeTruthy();
    expect(within(views).getByRole("tab", { name: "List" })).toBeTruthy();
  });

  it("normalizes a pin dropped after panning across the antimeridian", async () => {
    Object.assign(mapPoint, { lng: 190.12345678, lat: 10.1234567 });
    render(<LocationsPage />);
    fireEvent.click(screen.getByRole("button", { name: "Place on map" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Simulated map click" }),
    );
    const editor = await screen.findByRole("dialog", { name: "Add location" });
    expect(
      (within(editor).getByLabelText("Latitude") as HTMLInputElement).value,
    ).toBe("10.123457");
    expect(
      (within(editor).getByLabelText("Longitude") as HTMLInputElement).value,
    ).toBe("-169.876543");
  });
  it("opens the editor straight from Add location, with empty coordinate fields, so no map click is needed", async () => {
    render(<LocationsPage />);

    fireEvent.click(screen.getByRole("button", { name: "Add location" }));

    const editor = await screen.findByRole("dialog", { name: "Add location" });
    const latitude = within(editor).getByLabelText("Latitude");
    const longitude = within(editor).getByLabelText("Longitude");
    expect((latitude as HTMLInputElement).value).toBe("");
    expect((longitude as HTMLInputElement).value).toBe("");
  });

  it("saves a location typed in by keyboard", async () => {
    render(<LocationsPage />);

    fireEvent.click(screen.getByRole("button", { name: "Add location" }));
    const editor = await screen.findByRole("dialog", { name: "Add location" });

    fireEvent.change(within(editor).getByLabelText("Title"), {
      target: { value: "Lima clinic" },
    });
    const latitude = within(editor).getByLabelText("Latitude");
    fireEvent.change(latitude, { target: { value: "-12.05" } });
    fireEvent.blur(latitude);
    const longitude = within(editor).getByLabelText("Longitude");
    fireEvent.change(longitude, { target: { value: "-77.04" } });
    fireEvent.blur(longitude);

    fireEvent.click(
      within(editor).getByRole("button", { name: "Save location" }),
    );

    await waitFor(() => expect(upsert).toHaveBeenCalledTimes(1));
    expect(upsert.mock.calls[0]?.[0]).toMatchObject({
      title: "Lima clinic",
      lat: -12.05,
      lng: -77.04,
      type: "custom",
      status: "draft",
    });
  });

  it("does not save a location without coordinates", async () => {
    render(<LocationsPage />);

    fireEvent.click(screen.getByRole("button", { name: "Add location" }));
    const editor = await screen.findByRole("dialog", { name: "Add location" });
    fireEvent.change(within(editor).getByLabelText("Title"), {
      target: { value: "Somewhere" },
    });
    fireEvent.click(
      within(editor).getByRole("button", { name: "Save location" }),
    );

    expect(await within(editor).findByText("Enter a latitude.")).toBeTruthy();
    expect(upsert).not.toHaveBeenCalled();
  });

  it("still lets a map click place the pin and fill the coordinates", async () => {
    render(<LocationsPage />);

    const place = screen.getByRole("button", { name: "Place on map" });
    expect(place.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(place);
    expect(place.getAttribute("aria-pressed")).toBe("true");

    fireEvent.click(
      screen.getByRole("button", { name: "Simulated map click" }),
    );

    const editor = await screen.findByRole("dialog", { name: "Add location" });
    expect(
      (within(editor).getByLabelText("Latitude") as HTMLInputElement).value,
    ).toBe("41.9");
    expect(
      (within(editor).getByLabelText("Longitude") as HTMLInputElement).value,
    ).toBe("12.5");
  });

  it("cancels pin placement with Escape", () => {
    render(<LocationsPage />);

    const place = screen.getByRole("button", { name: "Place on map" });
    fireEvent.click(place);
    expect(place.getAttribute("aria-pressed")).toBe("true");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(place.getAttribute("aria-pressed")).toBe("false");
  });

  it("shows only marker types present on the map in the legend", () => {
    render(<LocationsPage />);

    const legend = screen.getByRole("list", { name: "Marker types" });
    expect(within(legend).getByText("Missionary")).toBeTruthy();
    expect(within(legend).getByText("Project")).toBeTruthy();
    expect(within(legend).queryByText("Custom")).toBeNull();
    expect(within(legend).queryByText("Partner")).toBeNull();
  });

  it("does not show a marker legend when the map has no locations", () => {
    queryState.empty = true;
    render(<LocationsPage />);
    expect(screen.queryByRole("list", { name: "Marker types" })).toBeNull();
  });
});

describe("Locations list tab", () => {
  it("asks before deleting a location from the list", async () => {
    render(<LocationsPage />);

    fireEvent.mouseDown(screen.getByRole("tab", { name: "List" }));
    fireEvent.click(screen.getByRole("tab", { name: "List" }));
    fireEvent.click(
      await screen.findByRole("button", {
        name: "Actions for Nairobi team house",
      }),
    );
    fireEvent.click(await screen.findByRole("menuitem", { name: "Delete" }));

    const confirm = await screen.findByRole("alertdialog", {
      name: "Delete Nairobi team house?",
    });
    expect(
      within(confirm).getByRole("button", { name: "Delete location" }),
    ).toBeTruthy();
  });
});

it("switches from List to Map to place a pin and clears pick mode on List or the toggle", async () => {
  render(<LocationsPage />);
  const list = screen.getByRole("tab", { name: "List" });
  fireEvent.mouseDown(list);
  fireEvent.click(list);
  const place = screen.getByRole("button", { name: "Place on map" });
  fireEvent.click(place);
  expect(
    screen.getByRole("tab", { name: "Map" }).getAttribute("aria-selected"),
  ).toBe("true");
  expect(screen.getByRole("status").textContent).toContain("Click the map");
  fireEvent.mouseDown(list);
  fireEvent.click(list);
  expect(place.getAttribute("aria-pressed")).toBe("false");
  fireEvent.click(place);
  fireEvent.click(place);
  expect(place.getAttribute("aria-pressed")).toBe("false");
});

it("shows map loading, a retryable failure and the first-location action", async () => {
  queryState.isLoading = true;
  const { rerender } = render(<LocationsPage />);
  expect(screen.getByRole("status").textContent).toContain("Loading locations");
  queryState.isLoading = false;
  queryState.isError = true;
  rerender(<LocationsPage />);
  expect(screen.getByRole("alert").textContent).toContain(
    "Locations could not load",
  );
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  expect(refetch).toHaveBeenCalled();
  queryState.isError = false;
  queryState.empty = true;
  rerender(<LocationsPage />);
  expect(screen.getByText("No locations yet")).toBeTruthy();
  fireEvent.click(screen.getAllByRole("button", { name: "Add location" })[1]!);
  expect(
    await screen.findByRole("dialog", { name: "Add location" }),
  ).toBeTruthy();
});

it("preserves a failed save and lets the same draft retry", async () => {
  upsert.mockRejectedValueOnce(new Error("Save failed"));
  const close = vi.fn();
  render(
    <LocationEditor
      isOpen
      location={{ ...LOCATIONS[0], type: "project" }}
      onOpenChange={close}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
  expect(await screen.findByText("Save failed")).toBeTruthy();
  expect(close).not.toHaveBeenCalled();
  expect((screen.getByLabelText("Title") as HTMLInputElement).value).toBe(
    "Amazon Medical Center",
  );
  fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
  await waitFor(() => expect(close).toHaveBeenCalledWith(false));
});

it("keeps a failed delete confirmation open for retry", async () => {
  remove.mockRejectedValueOnce(new Error("Delete failed"));
  render(<LocationsPage />);
  fireEvent.mouseDown(screen.getByRole("tab", { name: "List" }));
  fireEvent.click(screen.getByRole("tab", { name: "List" }));
  fireEvent.click(
    await screen.findByRole("button", {
      name: "Actions for Nairobi team house",
    }),
  );
  fireEvent.click(await screen.findByRole("menuitem", { name: "Delete" }));
  const confirm = await screen.findByRole("alertdialog");
  fireEvent.click(
    within(confirm).getByRole("button", { name: "Delete location" }),
  );
  expect(await within(confirm).findByText("Delete failed")).toBeTruthy();
  fireEvent.click(
    within(confirm).getByRole("button", { name: "Delete location" }),
  );
  await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
});
