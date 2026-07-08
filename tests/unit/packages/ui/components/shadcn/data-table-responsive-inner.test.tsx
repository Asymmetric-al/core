/** @vitest-environment jsdom */

import type { ColumnDef } from "../../../../../../packages/ui/components/shadcn/data-table/tanstack";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DataTableResponsive } from "../../../../../../packages/ui/components/shadcn/data-table/data-table-responsive";

type Person = {
  id: string;
  name: string;
};

function installMatchMedia(initialMatches: boolean) {
  let matches = initialMatches;
  const listeners = new Set<(event: MediaQueryListEvent) => void>();

  const matchMedia = vi.fn((query: string) => {
    return {
      get matches() {
        return matches;
      },
      media: query,
      onchange: null,
      addEventListener: (
        type: string,
        listener: (event: MediaQueryListEvent) => void,
      ) => {
        if (type === "change") {
          listeners.add(listener);
        }
      },
      removeEventListener: (
        type: string,
        listener: (event: MediaQueryListEvent) => void,
      ) => {
        if (type === "change") {
          listeners.delete(listener);
        }
      },
      addListener: (listener: (event: MediaQueryListEvent) => void) => {
        listeners.add(listener);
      },
      removeListener: (listener: (event: MediaQueryListEvent) => void) => {
        listeners.delete(listener);
      },
      dispatchEvent: () => true,
    } satisfies Partial<MediaQueryList> as MediaQueryList;
  });

  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: matchMedia,
  });

  return {
    matchMedia,
    setMatches(nextMatches: boolean) {
      matches = nextMatches;
      const event = {
        matches,
        media: "(max-width: 767px)",
      } as MediaQueryListEvent;

      for (const listener of listeners) {
        listener(event);
      }
    },
  };
}

const columns: ColumnDef<Person>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
];

const data: Person[] = [{ id: "person-1", name: "Ada Lovelace" }];

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("DataTableResponsive mobile mode", () => {
  it("does not warn when modern virtualization config relies on internal defaults", async () => {
    installMatchMedia(false);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    render(
      <DataTableResponsive
        columns={columns}
        data={data}
        config={{
          enableFilters: false,
          enablePagination: false,
          enableRowSelection: false,
          virtualization: {
            enabled: true,
            estimateSize: 84,
            overscan: 8,
            containerHeight: 640,
          },
        }}
      />,
    );

    await act(async () => {});

    const overlapWarnings = warn.mock.calls.filter(([message]) =>
      String(message).includes(
        "useDataTableVirtualization received overlapping modern",
      ),
    );

    expect(overlapWarnings).toHaveLength(0);
  });

  it("switches from table view to card view when the mobile media query starts matching", async () => {
    const media = installMatchMedia(false);

    render(
      <DataTableResponsive
        columns={columns}
        data={data}
        config={{
          enableFilters: false,
          enablePagination: false,
          enableRowSelection: false,
          mobileBreakpoint: 768,
        }}
        mobileCardConfig={{ primaryField: "name" }}
      />,
    );

    expect(media.matchMedia).toHaveBeenCalledWith("(max-width: 767px)");
    expect(screen.getByRole("region", { name: "Data table" })).toBeTruthy();

    act(() => {
      media.setMatches(true);
    });

    await waitFor(() => {
      expect(screen.queryByRole("region", { name: "Data table" })).toBeNull();
    });
    expect(screen.getByText("Ada Lovelace")).toBeTruthy();
  });
});
