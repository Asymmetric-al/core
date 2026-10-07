import { describe, expect, it } from "vitest";
import { Button, buttonVariants } from "@asym/ui/components/shadcn/button";
import { Badge, badgeVariants } from "@asym/ui/components/shadcn/badge";
import {
  ButtonGroup,
  buttonGroupVariants,
} from "@asym/ui/components/shadcn/button-group";
import { Tabs, tabsListVariants } from "@asym/ui/components/shadcn/tabs";
import { Toggle, toggleVariants } from "@asym/ui/components/shadcn/toggle";
import {
  NavigationMenu,
  navigationMenuTriggerStyle,
} from "@asym/ui/components/shadcn/navigation-menu";
import {
  Combobox,
  createComboboxItems,
} from "@asym/ui/components/shadcn/combobox";

describe("shared controls' public import contract", () => {
  it("retains components and their styling helpers at the existing entrypoints", () => {
    for (const component of [
      Button,
      Badge,
      ButtonGroup,
      Tabs,
      Toggle,
      NavigationMenu,
      Combobox,
    ])
      expect(component).toBeTruthy();
    expect(buttonVariants({ variant: "maia", size: "sm" })).toContain(
      "rounded-2xl",
    );
    expect(badgeVariants({ variant: "outline" })).toContain("border-border");
    expect(buttonGroupVariants({ orientation: "vertical" })).toContain(
      "flex-col",
    );
    expect(tabsListVariants({ variant: "line" })).toContain("bg-transparent");
    expect(toggleVariants({ variant: "outline" })).toContain("border-input");
    expect(navigationMenuTriggerStyle()).toContain("inline-flex");
    expect(typeof createComboboxItems).toBe("function");
  });
});
