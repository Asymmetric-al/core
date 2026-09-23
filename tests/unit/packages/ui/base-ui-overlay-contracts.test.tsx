// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../../../../packages/ui/components/shadcn/accordion";
import {
  Avatar,
  AvatarImage,
} from "../../../../packages/ui/components/shadcn/avatar";
import { CommandDialog } from "../../../../packages/ui/components/shadcn/command";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "../../../../packages/ui/components/shadcn/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "../../../../packages/ui/components/shadcn/dropdown-menu";
import { ScrollArea } from "../../../../packages/ui/components/shadcn/scroll-area";
import { Separator } from "../../../../packages/ui/components/shadcn/separator";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../../../packages/ui/components/shadcn/tabs";

afterEach(cleanup);

describe("Base UI overlay and display contracts", () => {
  it("evaluates dialog popup class callbacks with primitive state", async () => {
    render(
      <Dialog defaultOpen>
        <DialogContent
          className={({ open }) => (open ? "callback-open" : "callback-closed")}
        >
          <DialogTitle>Callback dialog</DialogTitle>
        </DialogContent>
      </Dialog>,
    );
    expect(
      (
        await screen.findByRole("dialog", { name: "Callback dialog" })
      ).classList.contains("callback-open"),
    ).toBe(true);
  });

  it("evaluates tab callbacks without discarding shared styling", () => {
    render(
      <Tabs defaultValue="one">
        <TabsList>
          <TabsTrigger
            value="one"
            className={({ active }) =>
              active ? "callback-active" : "callback-idle"
            }
          >
            One
          </TabsTrigger>
          <TabsTrigger value="two">Two</TabsTrigger>
        </TabsList>
        <TabsContent value="one">First panel</TabsContent>
      </Tabs>,
    );
    expect(
      screen
        .getByRole("tab", { name: "One" })
        .classList.contains("callback-active"),
    ).toBe(true);
    expect(
      screen
        .getByRole("tab", { name: "One" })
        .classList.contains("inline-flex"),
    ).toBe(true);
  });

  it("labels the menu group that contains the actions", async () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>Edit</DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const group = await screen.findByRole("group", { name: "Actions" });
    expect(within(group).getByRole("menuitem", { name: "Edit" })).toBeTruthy();
  });

  it("keeps command title and description inside the modal surface", async () => {
    render(
      <CommandDialog
        open
        title="Find action"
        description="Search available actions"
      >
        <span>Available actions</span>
      </CommandDialog>,
    );
    const dialog = await screen.findByRole("dialog", { name: "Find action" });
    expect(
      within(dialog).getByRole("heading", { name: "Find action" }),
    ).toBeTruthy();
    expect(within(dialog).getByText("Search available actions")).toBeTruthy();
  });

  it("puts dynamic content in the Base UI content observer container", () => {
    const { container } = render(
      <ScrollArea>
        <p>Growing conversation</p>
      </ScrollArea>,
    );
    const viewport = container.querySelector(
      '[data-slot="scroll-area-viewport"]',
    );
    const content = viewport?.querySelector(
      '[data-slot="scroll-area-content"]',
    );
    expect(content?.contains(screen.getByText("Growing conversation"))).toBe(
      true,
    );
  });
  it("resolves accordion content classes on the padded inner content and preserves custom render", () => {
    render(
      <Accordion defaultValue={["one"]}>
        <AccordionItem value="one">
          <AccordionTrigger>Details</AccordionTrigger>
          <AccordionContent
            render={<section />}
            className={({ open }) =>
              open ? "pb-0 content-open" : "content-closed"
            }
          >
            <p>Details content</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    const inner = screen.getByText("Details content").parentElement;
    expect(inner?.classList.contains("content-open")).toBe(true);
    expect(inner?.classList.contains("pb-0")).toBe(true);
    expect(inner?.parentElement?.tagName).toBe("SECTION");
  });

  it("preserves separator orientation state callbacks", () => {
    render(
      <Separator
        orientation="vertical"
        className={({ orientation }) => `separator-${orientation}`}
      />,
    );
    expect(
      screen.getByRole("separator").classList.contains("separator-vertical"),
    ).toBe(true);
  });

  it("defaults unlabeled avatar images to decorative without overriding explicit descriptions", () => {
    const { container } = render(
      <>
        <Avatar>
          <AvatarImage keepMounted src="/decorative.png" />
        </Avatar>
        <Avatar>
          <AvatarImage keepMounted src="/portrait.png" alt="Conrad" />
        </Avatar>
      </>,
    );
    expect(
      container
        .querySelector('img[src="/decorative.png"]')
        ?.getAttribute("alt"),
    ).toBe("");
    expect(
      container.querySelector('img[src="/portrait.png"]')?.getAttribute("alt"),
    ).toBe("Conrad");
  });
});
