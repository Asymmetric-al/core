/** @vitest-environment jsdom */

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
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
      within(dialog).getAllByRole("button", { name: /Close/ }).length,
    ).toBeGreaterThan(0);
  },
);

it("closes the mobile Sheet at the desktop breakpoint while retaining the selected location", async () => {
  vi.stubGlobal("innerWidth", 390);
  render(<WhereWeWorkMap />);
  const marker = screen.getByRole("button", { name: "View River Ministry" });
  marker.focus();
  fireEvent.click(marker);
  await screen.findByRole("dialog", { name: "River Ministry" });
  vi.stubGlobal("innerWidth", 1023);
  fireEvent(window, new Event("resize"));
  expect(screen.getByRole("dialog", { name: "River Ministry" })).toBeTruthy();
  vi.stubGlobal("innerWidth", 1024);
  fireEvent(window, new Event("resize"));
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  expect(document.querySelector('[data-slot="sheet-overlay"]')).toBeNull();
  const selectedLocation = screen.getByRole("button", {
    name: "River Ministry",
    exact: true,
  });
  fireEvent.click(selectedLocation);
  const desktopDialog = await screen.findByRole("dialog", {
    name: "River Ministry",
  });
  expect(desktopDialog.getAttribute("data-slot")).toBe("dialog-content");
  expect(
    within(desktopDialog)
      .getByRole("link", { name: "Give to River Ministry" })
      .getAttribute("href"),
  ).toContain("missionary_id=worker-1");
  fireEvent.keyDown(document, { key: "Escape", code: "Escape" });
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  vi.stubGlobal("innerWidth", 390);
  fireEvent(window, new Event("resize"));
  fireEvent.click(marker);
  const reopened = await screen.findByRole("dialog", {
    name: "River Ministry",
  });
  expect(reopened.getAttribute("data-slot")).toBe("sheet-content");
});

it("announces location search as a dialog and restores focus after dismissal", async () => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  const scrollDescriptor = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    "scrollIntoView",
  );
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
    configurable: true,
    value: vi.fn(),
  });
  render(<WhereWeWorkMap />);
  const search = screen.getByRole("button", { name: /Search locations/ });
  expect(search.getAttribute("aria-haspopup")).toBe("dialog");
  expect(search.getAttribute("aria-expanded")).toBe("false");
  search.focus();
  fireEvent.click(search);
  await screen.findByRole("dialog", { name: "Search Locations" });
  expect(search.getAttribute("aria-expanded")).toBe("true");
  fireEvent.keyDown(document, { key: "Escape", code: "Escape" });
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  expect(search.getAttribute("aria-expanded")).toBe("false");
  await waitFor(() => expect(document.activeElement).toBe(search));
  if (scrollDescriptor)
    Object.defineProperty(
      HTMLElement.prototype,
      "scrollIntoView",
      scrollDescriptor,
    );
  else Reflect.deleteProperty(HTMLElement.prototype, "scrollIntoView");
});
