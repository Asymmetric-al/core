/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  Item,
  ItemGroup,
} from "../../../../packages/ui/components/shadcn/item";

afterEach(() => {
  cleanup();
});

describe("ItemGroup list semantics", () => {
  it("exposes default items as listitems", () => {
    render(
      <ItemGroup>
        <Item>First</Item>
        <Item>Second</Item>
      </ItemGroup>,
    );

    const group = screen.getByRole("list");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(group.contains(screen.getByText("First"))).toBe(true);
  });

  it("does not force listitem onto a custom rendered child", () => {
    render(
      <ItemGroup>
        <Item render={<a href="/profile" />}>Profile</Item>
      </ItemGroup>,
    );

    expect(screen.getByRole("link", { name: "Profile" })).toBeTruthy();
    expect(screen.queryByRole("listitem")).toBeNull();
  });
});
