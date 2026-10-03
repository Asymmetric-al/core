/** @vitest-environment jsdom */

import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, expect, it, vi } from "vitest";

vi.mock("@asym/database/hooks", () => ({
  usePublicLocations: () => ({
    data: [
      {
        id: "location-1",
        title: "River Ministry",
        type: "missionary",
        lat: 15,
        lng: 20,
        linked_id: "worker-1",
        summary: "Serving families",
        image_public_id: null,
      },
    ],
  }),
}));
vi.mock("@asym/ui/components/primitives/map", () => {
  const Container = ({ children }: { children?: ReactNode }) => (
    <div>{children}</div>
  );
  return {
    Map: Container,
    MapMarker: Container,
    MarkerContent: Container,
    MapControls: () => null,
    MapStyleToggle: () => null,
    MapLegend: Container,
  };
});

import { WhereWeWorkMap } from "../../../../apps/donor/app/(public)/(solid)/where-we-work/map-wrapper";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it.each([390, 1280])(
  "names map links without nesting controls and opens a keyboard-owned dialog at %ipx",
  async (width) => {
    vi.stubGlobal("innerWidth", width);
    render(<WhereWeWorkMap />);
    fireEvent.click(
      screen.getByRole("button", { name: "View River Ministry" }),
    );
    const dialog = await screen.findByRole("dialog", {
      name: "River Ministry",
    });
    const profile = within(dialog).getByRole("link", { name: "View Profile" });
    const give = within(dialog).getByRole("link", {
      name: "Give to River Ministry",
    });
    expect(profile.querySelector("button")).toBeNull();
    expect(give.querySelector("button")).toBeNull();
    expect(profile.getAttribute("href")).toBe("/workers/worker-1");
    expect(give.getAttribute("href")).toContain("missionary_id=worker-1");
    expect(
      within(dialog).getAllByRole("button", { name: "Close" }).length,
    ).toBeGreaterThan(0);
  },
);
