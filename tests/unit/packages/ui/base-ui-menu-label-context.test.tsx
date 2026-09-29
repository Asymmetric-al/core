// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
} from "../../../../packages/ui/components/shadcn/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "../../../../packages/ui/components/shadcn/dropdown-menu";
import {
  Menubar,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
} from "../../../../packages/ui/components/shadcn/menubar";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const menus = [
  {
    name: "dropdown",
    Root: DropdownMenu,
    Content: DropdownMenuContent,
    Group: DropdownMenuGroup,
    Item: DropdownMenuItem,
    Label: DropdownMenuLabel,
  },
  {
    name: "context menu",
    Root: ContextMenu,
    Content: ContextMenuContent,
    Group: ContextMenuGroup,
    Item: ContextMenuItem,
    Label: ContextMenuLabel,
  },
  {
    name: "menubar",
    Root: MenubarMenu,
    Content: MenubarContent,
    Group: MenubarGroup,
    Item: MenubarItem,
    Label: MenubarLabel,
  },
];

describe.each(menus)(
  "$name label ownership",
  ({ name, Root, Content, Group, Item, Label }) => {
    function menu(grouped: boolean) {
      const section = (
        <>
          <Label>Actions</Label>
          <Item>Edit</Item>
        </>
      );
      const content = (
        <Root defaultOpen>
          <Content>{grouped ? <Group>{section}</Group> : section}</Content>
        </Root>
      );
      return name === "menubar" ? <Menubar>{content}</Menubar> : content;
    }

    it("rejects a label without the required public group", () => {
      vi.spyOn(console, "error").mockImplementation(() => undefined);
      expect(() => render(menu(false))).toThrow(/MenuGroupContext is missing/u);
    });

    it("names the group that actually owns the items", async () => {
      render(menu(true));
      const group = await screen.findByRole("group", { name: "Actions" });
      expect(
        within(group).getByRole("menuitem", { name: "Edit" }),
      ).toBeTruthy();
    });
  },
);
