// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TemplateGalleryView } from "../../../../apps/admin/src/cms-ui/web-studio/flows/TemplateGalleryView";

const fixture = vi.hoisted(() => ({ search: "" }));

vi.mock("../../../../apps/admin/src/cms-ui/web-studio/routing", () => ({
  Link: ({ href, ...props }: React.ComponentProps<"a">) => (
    <a href={href} {...props} />
  ),
  useSearchParams: () => new URLSearchParams(fixture.search),
}));
vi.mock(
  "../../../../apps/admin/src/cms-ui/web-studio/shell/studio-layout",
  () => ({
    StudioLayout: ({ children }: { children: React.ReactNode }) => (
      <main>{children}</main>
    ),
  }),
);

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  fetchMock.mockReset();
  fixture.search = "";
});

describe("the starter gallery (D-18: WP6 part 2b replaces the page-templates collection, its thumbnails and New template with three starters in code)", () => {
  it("lists the three starters as cards that start New page with the matching starter, loading nothing", () => {
    render(<TemplateGalleryView />);
    const cards = screen.getAllByRole("article");
    expect(
      cards.map((card) => within(card).getByRole("heading").textContent),
    ).toEqual(["Standard page", "Missionary giving page", "Project page"]);
    expect(
      cards.map((card) =>
        within(card)
          .getByRole("link", { name: /Use template/ })
          .getAttribute("href"),
      ),
    ).toEqual([
      "/web-studio/pages/new-from-template?template=standard",
      "/web-studio/pages/new-from-template?template=missionary-giving",
      "/web-studio/pages/new-from-template?template=project",
    ]);
    expect(screen.queryByRole("link", { name: /New template/ })).toBeNull();
    expect(screen.queryByRole("img")).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("filters by page type with named links that keep the missionary context", () => {
    fixture.search = "family=missionary&missionaryId=m-1";
    render(<TemplateGalleryView />);
    const cards = screen.getAllByRole("article");
    expect(cards).toHaveLength(1);
    expect(
      within(cards[0]!)
        .getByRole("link", { name: /Use template/ })
        .getAttribute("href"),
    ).toBe(
      "/web-studio/pages/new-from-template?template=missionary-giving&missionaryId=m-1",
    );
    const filter = screen.getByRole("navigation", { name: "Page type" });
    const giving = within(filter).getByRole("link", { name: "Giving page" });
    expect(giving.getAttribute("aria-current")).toBe("page");
    expect(
      within(filter).getByRole("link", { name: "All" }).getAttribute("href"),
    ).toBe("/web-studio/templates?missionaryId=m-1");
    expect(
      within(filter)
        .getByRole("link", { name: "Project page" })
        .getAttribute("href"),
    ).toBe("/web-studio/templates?family=project&missionaryId=m-1");
  });

  it("says so, and offers every starter, when a filter matches none", () => {
    fixture.search = "family=ministry_update";
    render(<TemplateGalleryView />);
    expect(screen.queryAllByRole("article")).toEqual([]);
    expect(screen.getByText("No templates yet")).toBeTruthy();
    expect(
      screen
        .getByRole("link", { name: "Show all templates" })
        .getAttribute("href"),
    ).toBe("/web-studio/templates");
  });
});
