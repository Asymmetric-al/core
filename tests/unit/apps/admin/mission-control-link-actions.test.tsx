// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { TileCard } from "../../../../apps/admin/features/mission-control/components/tiles/tile-card";
import { TilePage } from "../../../../apps/admin/features/mission-control/components/tiles/tile-page";

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

afterEach(cleanup);

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

  it("keeps tile page actions as links and identifies the current breadcrumb", () => {
    render(<TilePage tile={tile} />);
    const actions = screen.getAllByRole("link", { name: "Open documents" });
    expect(actions).toHaveLength(2);
    expect(
      actions.every(
        (action) => action.getAttribute("href") === "/sign/documents",
      ),
    ).toBe(true);
    expect(screen.queryByRole("button", { name: "Open documents" })).toBeNull();
    const breadcrumb = screen.getByRole("navigation", { name: "breadcrumb" });
    expect(breadcrumb.querySelector('[aria-current="page"]')?.textContent).toBe(
      "Sign Studio",
    );
  });
});
