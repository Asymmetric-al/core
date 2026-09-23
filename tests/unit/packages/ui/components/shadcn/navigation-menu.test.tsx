// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  NavigationMenu,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "../../../../../../packages/ui/components/shadcn/navigation-menu";

afterEach(cleanup);

describe("NavigationMenu state styling", () => {
  it("styles the actual active-page attribute emitted by Base UI", () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink active href="/overview">
              Overview
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    const link = screen.getByRole("link", { name: "Overview" });
    expect(link.getAttribute("aria-current")).toBe("page");
    expect(link.getAttribute("data-active")).toBe("");
    expect(link.className).toContain("data-active:bg-accent/50");
    expect(link.className).not.toContain("data-[active=true]");
  });

  it("styles the indicator using the current item's popup-open state", () => {
    const menu = (value: string | null) => (
      <NavigationMenu value={value}>
        <NavigationMenuList>
          <NavigationMenuItem value="resources">
            <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
            <NavigationMenuIndicator data-testid="indicator" />
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    );
    const { rerender } = render(menu("resources"));
    const indicator = screen.getByTestId("indicator");
    expect(indicator.getAttribute("data-popup-open")).toBe("");
    expect(indicator.className).toContain("data-popup-open:opacity-100");
    expect(indicator.className).not.toContain("data-[state=");
    rerender(menu(null));
    expect(indicator.hasAttribute("data-popup-open")).toBe(false);
    expect(indicator.className.split(" ")).toContain("opacity-0");
  });
});
