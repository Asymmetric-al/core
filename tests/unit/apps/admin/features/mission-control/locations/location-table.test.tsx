/** @vitest-environment jsdom */

import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- AL-1894: Exercise the admin module at its public UI boundary.
import { LocationTable } from "../../../../../../../apps/admin/features/mission-control/locations/components/LocationTable";

// eslint-disable-next-line no-restricted-imports -- AL-1894: Exercise the admin module at its public UI boundary.
import type { Location } from "../../../../../../../apps/admin/features/mission-control/locations/hooks/use-locations";

// Vitest runs from the repository root.
const SOURCE = join(
  process.cwd(),
  "apps/admin/features/mission-control/locations/components/LocationTable.tsx",
);

function location(overrides: Partial<Location>): Location {
  return {
    id: "loc-1",
    title: "Amazon Medical Center",
    summary: "",
    type: "project",
    linked_id: null,
    status: "published",
    lat: -3.1,
    lng: -60.02,
    updated_at: "2026-10-01T12:00:00.000Z",
    ...overrides,
  } as Location;
}

const LOCATIONS = [
  location({}),
  location({
    id: "loc-2",
    title: "Nairobi team house",
    type: "missionary",
    status: "draft",
    lat: -1.29,
    lng: 36.82,
  }),
];

beforeEach(() => {
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

describe("Locations list", () => {
  it("renders partner and unknown stored types without crashing", () => {
    render(
      <LocationTable
        data={[
          location({ type: "partner" }),
          location({ id: "future", type: "future-kind" as Location["type"] }),
        ]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    const table = screen.getByRole("table");
    expect(within(table).getByText("Partner")).toBeTruthy();
    expect(within(table).getByText("future-kind")).toBeTruthy();
  });
  it("is built on the shared ReUI record grid, not the older DataTable", () => {
    const source = readFileSync(SOURCE, "utf8");
    expect(source).toContain("@asym/ui/components/data-grid-panel");
    expect(source).not.toContain("shadcn/data-table");
  });

  it("keeps every column: location with coordinates, type, status and last updated", () => {
    render(
      <LocationTable data={LOCATIONS} onEdit={vi.fn()} onDelete={vi.fn()} />,
    );
    const grid = screen.getByRole("table");
    for (const header of ["Location", "Type", "Status", "Last updated"]) {
      expect(within(grid).getByText(header)).toBeTruthy();
    }
    expect(within(grid).getByText("Amazon Medical Center")).toBeTruthy();
    expect(within(grid).getByText("-3.1000, -60.0200")).toBeTruthy();
    expect(within(grid).getByText("Project")).toBeTruthy();
    expect(within(grid).getByText("Missionary")).toBeTruthy();
    expect(within(grid).getByText("Published")).toBeTruthy();
    expect(within(grid).getByText("Draft")).toBeTruthy();
  });

  it("narrows the list by search", () => {
    render(
      <LocationTable data={LOCATIONS} onEdit={vi.fn()} onDelete={vi.fn()} />,
    );
    fireEvent.change(
      screen.getByRole("searchbox", { name: "Search locations" }),
      { target: { value: "nairobi" } },
    );
    const grid = screen.getByRole("table");
    expect(within(grid).queryByText("Amazon Medical Center")).toBeNull();
    expect(within(grid).getByText("Nairobi team house")).toBeTruthy();
  });

  it("edits and asks to delete from each row's actions", async () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    render(
      <LocationTable data={LOCATIONS} onEdit={onEdit} onDelete={onDelete} />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Actions for Amazon Medical Center",
      }),
    );
    fireEvent.click(await screen.findByRole("menuitem", { name: "Edit" }));
    expect(onEdit).toHaveBeenCalledWith(LOCATIONS[0]);

    fireEvent.click(
      screen.getByRole("button", { name: "Actions for Nairobi team house" }),
    );
    fireEvent.click(await screen.findByRole("menuitem", { name: "Delete" }));
    expect(onDelete).toHaveBeenCalledWith("loc-2");
  });

  it("opens a location for editing from its name", () => {
    const onEdit = vi.fn();
    render(
      <LocationTable data={LOCATIONS} onEdit={onEdit} onDelete={vi.fn()} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Nairobi team house" }));
    expect(onEdit).toHaveBeenCalledWith(LOCATIONS[1]);
  });

  // 7 clinics and 5 team houses: 12 rows, past one page of 10.
  const MANY = [
    ...Array.from({ length: 7 }, (_, i) =>
      location({ id: `p-${i}`, title: `Clinic ${i + 1}`, type: "project" }),
    ),
    ...Array.from({ length: 5 }, (_, i) =>
      location({
        id: `m-${i}`,
        title: `Team house ${i + 1}`,
        type: "missionary",
      }),
    ),
  ];

  it("pages past 10 rows and offers page sizes to choose from", async () => {
    render(<LocationTable data={MANY} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(
      within(screen.getByRole("table")).queryByText("Team house 5"),
    ).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Go to page 2" }));
    expect(
      within(screen.getByRole("table")).getByText("Team house 5"),
    ).toBeTruthy();

    fireEvent.click(screen.getByRole("combobox", { name: "Rows per page" }));
    const option = await screen.findByRole("option", { name: "25" });
    fireEvent.pointerDown(option, { pointerType: "mouse" });
    fireEvent.click(option);
    const grid = screen.getByRole("table");
    expect(within(grid).getByText("Clinic 1")).toBeTruthy();
    expect(within(grid).getByText("Team house 5")).toBeTruthy();
  });

  it("never strands rows on a page the pager no longer shows", () => {
    render(<LocationTable data={MANY} onEdit={vi.fn()} onDelete={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Go to page 2" }));

    // Narrowing to 7 rows fits one page: the pager goes, so they must show.
    fireEvent.change(
      screen.getByRole("searchbox", { name: "Search locations" }),
      { target: { value: "project" } },
    );
    const grid = screen.getByRole("table");
    for (let n = 1; n <= 7; n += 1) {
      expect(within(grid).getByText(`Clinic ${n}`)).toBeTruthy();
    }
  });

  it("shows the earlier page when deletes empty the one in view", () => {
    const view = render(
      <LocationTable data={MANY} onEdit={vi.fn()} onDelete={vi.fn()} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Go to page 2" }));
    view.rerender(
      <LocationTable
        data={MANY.slice(0, 9)}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    const grid = screen.getByRole("table");
    expect(within(grid).getByText("Clinic 1")).toBeTruthy();
    expect(within(grid).getByText("Team house 2")).toBeTruthy();
  });

  describe("as cards (phones, or when the columns would not fit)", () => {
    let innerWidth: number;
    beforeEach(() => {
      innerWidth = window.innerWidth;
      Object.defineProperty(window, "innerWidth", {
        configurable: true,
        value: 390,
      });
    });
    afterEach(() => {
      Object.defineProperty(window, "innerWidth", {
        configurable: true,
        value: innerWidth,
      });
    });

    it("keeps last updated on each card", () => {
      render(
        <LocationTable
          data={[
            location({}),
            location({
              id: "loc-2",
              title: "Nairobi team house",
              updated_at: "2026-09-14T12:00:00.000Z",
            }),
          ]}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />,
      );
      expect(screen.queryByRole("table")).toBeNull();
      expect(screen.getByText("Last updated Oct 1, 2026")).toBeTruthy();
      expect(screen.getByText("Last updated Sep 14, 2026")).toBeTruthy();
    });

    it("offers the same sorts as the table headers", async () => {
      render(
        <LocationTable
          data={[
            location({ updated_at: "2026-10-01T12:00:00.000Z" }),
            location({
              id: "loc-2",
              title: "Nairobi team house",
              updated_at: "2026-10-05T12:00:00.000Z",
            }),
          ]}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />,
      );
      const order = () =>
        screen
          .getAllByRole("button", {
            name: /^(Amazon Medical Center|Nairobi team house)$/,
          })
          .map((button) => button.textContent);
      expect(order()).toEqual(["Amazon Medical Center", "Nairobi team house"]);

      fireEvent.click(screen.getByRole("combobox", { name: "Sort locations" }));
      for (const label of [
        "Location: A–Z",
        "Location: Z–A",
        "Type: A–Z",
        "Type: Z–A",
        "Status: drafts first",
        "Status: published first",
        "Last updated: newest",
        "Last updated: oldest",
      ]) {
        expect(await screen.findByRole("option", { name: label })).toBeTruthy();
      }
      const newest = screen.getByRole("option", {
        name: "Last updated: newest",
      });
      fireEvent.pointerDown(newest, { pointerType: "mouse" });
      fireEvent.click(newest);
      expect(order()).toEqual(["Nairobi team house", "Amazon Medical Center"]);
    });
  });

  it("shows no separate sort control beside the table, whose headers sort", () => {
    render(
      <LocationTable data={LOCATIONS} onEdit={vi.fn()} onDelete={vi.fn()} />,
    );
    expect(screen.getByRole("table")).toBeTruthy();
    expect(
      screen.queryByRole("combobox", { name: "Sort locations" }),
    ).toBeNull();
  });

  it("says so when there are no locations", () => {
    render(<LocationTable data={[]} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText("No locations yet")).toBeTruthy();
  });
});
