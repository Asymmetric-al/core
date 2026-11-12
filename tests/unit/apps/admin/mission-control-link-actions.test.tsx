// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TileCard } from "../../../../apps/admin/features/mission-control/components/tiles/tile-card";

import type { Tile } from "@asym/lib/mission-control/types";

const tile: Tile = {
  id: "sign",
  title: "Sign Studio",
  route: "/mc/sign",
  icon: "FileText",
  purpose: "Manage document packets.",
  inside: "Documents and signatures",
  roles: ["admin"],
  quickActions: [
    { label: "Open documents", href: "/mc/sign/documents", icon: "FileText" },
  ],
};

// Tile shortcuts and features are filtered by the viewer's role; an admin
// sees them all unless a test sets another role.
const viewer = vi.hoisted(() => ({ role: "admin" }));
vi.mock("@asym/lib/mission-control/context", () => ({
  useMC: () => ({ role: viewer.role }),
}));

afterEach(() => {
  cleanup();
  viewer.role = "admin";
});

describe("Mission Control navigation actions", () => {
  it("offers each tile quick action as a single named navigation target", () => {
    render(<TileCard tile={tile} />);
    const action = screen.getByRole("link", { name: "Open documents" });
    expect(action.getAttribute("href")).toBe("/sign/documents");
    expect(
      screen.getAllByRole("link", { name: "Open Sign Studio" }),
    ).toHaveLength(1);
    expect(screen.queryByRole("button", { name: "Open documents" })).toBeNull();
  });

  it("links each destination once per directory card", () => {
    render(
      <TileCard
        tile={{
          ...tile,
          quickActions: [
            { label: "Open studio", href: "/sign", icon: "FileText" },
            ...tile.quickActions,
          ],
        }}
      />,
    );
    const hrefs = screen
      .getAllByRole("link")
      .map((link) => link.getAttribute("href"));
    expect(hrefs).toEqual(["/sign", "/sign/documents"]);
    expect(screen.queryByRole("link", { name: "Open studio" })).toBeNull();
  });

  it("omits the shortcut footer when the only shortcut repeats the module link", () => {
    const { container } = render(
      <TileCard
        tile={{
          ...tile,
          quickActions: [
            { label: "Open studio", href: "/mc/sign", icon: "FileText" },
          ],
        }}
      />,
    );
    expect(container.querySelector('[role="group"]')).toBeNull();
    expect(screen.getAllByRole("link")).toHaveLength(1);
  });

  it("shows every distinct shortcut destination in a named group", () => {
    render(
      <TileCard
        tile={{
          ...tile,
          quickActions: [
            { label: "Documents", href: "/sign/documents" },
            { label: "Packets", href: "/sign/packets" },
            { label: "Templates", href: "/sign/templates" },
            { label: "Audit", href: "/sign/audit" },
            { label: "Documents again", href: "/mc/sign/documents" },
          ],
        }}
      />,
    );
    const group = screen.getByRole("group", { name: "Sign Studio shortcuts" });
    expect(
      [...group.querySelectorAll("a")].map((link) => link.getAttribute("href")),
    ).toEqual([
      "/sign/documents",
      "/sign/packets",
      "/sign/templates",
      "/sign/audit",
    ]);
  });

  it("never truncates module purpose text", () => {
    render(<TileCard tile={tile} />);
    expect(screen.getByText("Manage document packets.").className).not.toMatch(
      /line-clamp-[1-9]/,
    );
  });

  it("keeps feature separators attached to the preceding feature when wrapping", () => {
    render(
      <TileCard tile={{ ...tile, inside: "Packets · Templates · Audit" }} />,
    );
    const features = screen.getByText("Packets · Templates · Audit");
    expect(features.textContent).toBe("Packets · Templates · Audit");
  });

  it("lists role-limited features only for the roles that may open them", () => {
    const admin: Tile = {
      ...tile,
      inside: "Teams · Email delivery",
      roleInside: [{ label: "Eve", roles: ["admin"] }],
    };
    render(<TileCard tile={admin} />);
    expect(screen.getByText(/Email delivery\s·\sEve/)).toBeTruthy();
    cleanup();

    viewer.role = "finance";
    render(<TileCard tile={admin} />);
    expect(screen.getByText(/Email delivery/)).toBeTruthy();
    expect(screen.queryByText(/Eve/)).toBeNull();
  });
});
