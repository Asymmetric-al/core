/** @vitest-environment jsdom */

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { setPlatform } from "@ui-sdk/core/testing";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

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
import { listShortcuts } from "../../../../packages/ui/components/primitives/shortcut";

import type { ReactNode } from "react";

beforeEach(() => setPlatform("other"));

afterEach(() => {
  cleanup();
  setPlatform("other");
  vi.unstubAllGlobals();
});

function stubSearchDom() {
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
  return () => {
    if (scrollDescriptor)
      Object.defineProperty(
        HTMLElement.prototype,
        "scrollIntoView",
        scrollDescriptor,
      );
    else Reflect.deleteProperty(HTMLElement.prototype, "scrollIntoView");
  };
}

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

it("toggles location search with the platform's mod+K on the shared shortcut owner", async () => {
  const restore = stubSearchDom();
  render(<WhereWeWorkMap />);
  const search = screen.getByRole("button", { name: "Search locations…" });
  expect(search.getAttribute("aria-keyshortcuts")).toBe("Control+K");
  expect(search.textContent?.replace(/[⁦⁩]/g, "")).toContain("Ctrl+K");
  expect(search.textContent).not.toContain("⌘");

  search.focus();
  fireEvent.keyDown(search, { key: "k", metaKey: true });
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(
    listShortcuts().find(({ keys }) => keys === "mod+k")?.description,
  ).toBe("Search locations");

  fireEvent.keyDown(search, { key: "k", ctrlKey: true });
  const dialog = await screen.findByRole("dialog", {
    name: "Search Locations",
  });
  const input = within(dialog).getByRole("combobox");
  input.focus();
  fireEvent.keyDown(input, { key: "k", ctrlKey: true });
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  await waitFor(() => expect(document.activeElement).toBe(search));
  restore();
});

it("leaves mod+K alone while a location detail dialog is open", async () => {
  const restore = stubSearchDom();
  vi.stubGlobal("innerWidth", 1280);
  render(<WhereWeWorkMap />);
  fireEvent.click(screen.getByRole("button", { name: "View River Ministry" }));
  const detail = await screen.findByRole("dialog", { name: "River Ministry" });
  await waitFor(() =>
    expect(detail.contains(document.activeElement)).toBe(true),
  );

  const focused = document.activeElement ?? document.body;
  fireEvent.keyDown(focused, { key: "k", ctrlKey: true });

  expect(screen.queryByRole("dialog", { name: "Search Locations" })).toBeNull();
  expect(screen.getAllByRole("dialog")).toHaveLength(1);
  restore();
});

// The public site has no app shell, so the map that registers the shortcut
// also mounts the list Shift+? opens.
it("lists the map's shortcuts on Shift+?", async () => {
  const restore = stubSearchDom();
  render(<WhereWeWorkMap />);
  const search = screen.getByRole("button", { name: "Search locations…" });
  search.focus();

  fireEvent.keyDown(search, { key: "?", shiftKey: true });

  const help = await screen.findByRole("dialog", {
    name: "Keyboard shortcuts",
  });
  expect(within(help).getByText("Search locations")).toBeTruthy();
  expect(within(help).getByText("Show keyboard shortcuts")).toBeTruthy();
  fireEvent.keyDown(help, { key: "Escape" });
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  await waitFor(() => expect(document.activeElement).toBe(search));
  restore();
});
