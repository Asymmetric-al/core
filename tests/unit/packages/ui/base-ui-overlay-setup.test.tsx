// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { URL as NodeURL, fileURLToPath } from "node:url";

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../../../packages/ui/components/shadcn/alert-dialog";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "../../../../packages/ui/components/shadcn/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "../../../../packages/ui/components/shadcn/drawer";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "../../../../packages/ui/components/shadcn/sheet";

const read = (path: string) =>
  readFileSync(
    resolve(fileURLToPath(new NodeURL("../../../../", import.meta.url)), path),
    "utf8",
  );

afterEach(cleanup);

describe("Base UI application stacking setup", () => {
  it.each(["admin", "donor", "missionary"])(
    "%s isolates the application tree below body-level portals",
    (app) => {
      const layout = read(`apps/${app}/app/layout.tsx`);

      // The body itself cannot separate page z-indexes from portaled siblings.
      expect(layout).toMatch(
        /<body[^>]*>\s*<div className="app-root">\s*<ThemeProvider[\s\S]*?\{children\}[\s\S]*?<\/ThemeProvider>\s*<\/div>\s*<Toaster \/>/,
      );
    },
  );

  it("isolates the app root and positions body for absolute Safari backdrops", () => {
    const css = read("packages/ui/styles/globals.css");
    const body = css.match(/\bbody\s*\{([^}]+)\}/)?.[1];
    const root = css.match(/\.app-root\s*\{([^}]+)\}/)?.[1];

    expect(body).toMatch(/position:\s*relative/);
    expect(body).not.toMatch(/isolation:/);
    expect(root).toMatch(/isolation:\s*isolate/);
  });
});

const overlays = [
  {
    name: "dialog",
    Root: Dialog,
    Trigger: DialogTrigger,
    Content: DialogContent,
    Title: DialogTitle,
    Description: DialogDescription,
    Close: DialogClose,
    role: "dialog",
  },
  {
    name: "alert-dialog",
    Root: AlertDialog,
    Trigger: AlertDialogTrigger,
    Content: AlertDialogContent,
    Title: AlertDialogTitle,
    Description: AlertDialogDescription,
    Close: AlertDialogCancel,
    role: "alertdialog",
  },
  {
    name: "sheet",
    Root: Sheet,
    Trigger: SheetTrigger,
    Content: SheetContent,
    Title: SheetTitle,
    Description: SheetDescription,
    Close: SheetClose,
    role: "dialog",
  },
  {
    name: "drawer",
    Root: Drawer,
    Trigger: DrawerTrigger,
    Content: DrawerContent,
    Title: DrawerTitle,
    Description: DrawerDescription,
    Close: DrawerClose,
    role: "dialog",
  },
];

describe.each(overlays)(
  "$name portal integration",
  ({ name, Root, Trigger, Content, Title, Description, Close, role }) => {
    it("keeps the backdrop outside the app root with iOS-compatible positioning and restores trigger focus", async () => {
      const { container } = render(
        <div className="app-root">
          <Root>
            <Trigger>Open overlay</Trigger>
            <Content>
              <Title>Overlay title</Title>
              <Description>Overlay details</Description>
              <Close>Done</Close>
            </Content>
          </Root>
        </div>,
      );
      const trigger = screen.getByRole("button", { name: "Open overlay" });
      trigger.focus();
      fireEvent.click(trigger);

      const popup = await screen.findByRole(role, { name: "Overlay title" });
      const backdrop = document.querySelector(`[data-slot="${name}-overlay"]`);
      expect(backdrop).not.toBeNull();
      expect(container.contains(popup)).toBe(false);
      expect(container.contains(backdrop)).toBe(false);
      expect(backdrop?.classList.contains("absolute")).toBe(true);
      expect(backdrop?.classList.contains("fixed")).toBe(false);
      expect(backdrop?.classList.contains("inset-0")).toBe(true);
      expect(
        document.getElementById(popup.getAttribute("aria-describedby") ?? "")
          ?.textContent,
      ).toBe("Overlay details");

      fireEvent.click(screen.getByRole("button", { name: "Done" }));
      await waitFor(() =>
        expect(screen.queryByRole(role, { name: "Overlay title" })).toBeNull(),
      );
      await waitFor(() => expect(document.activeElement).toBe(trigger));
    });
  },
);
