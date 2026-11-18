import { useShortcut } from "@asym/ui/components/primitives/shortcut";
import {
  ShortcutHelp,
  ShortcutHelpMenuItem,
} from "@asym/ui/components/primitives/shortcut-help";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@asym/ui/components/shadcn/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@asym/ui/components/shadcn/dropdown-menu";
import { Input } from "@asym/ui/components/shadcn/input";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@asym/ui/components/shadcn/popover";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@asym/ui/components/shadcn/sheet";
import React, { useEffect, useRef, useState } from "react";
import { hydrateRoot } from "react-dom/client";

declare global {
  interface Window {
    __runs?: string[];
    __secondHost?: boolean;
  }
}

const ran = (name: string) => () => {
  (window.__runs ??= []).push(name);
};

// A panel like Mission Control's Eve sheet or the phone conversation sheet:
// its shortcut belongs to a region inside it.
function PanelBody() {
  const regionRef = useRef<HTMLDivElement>(null);
  useShortcut("mod+enter", ran("panel"), {
    description: "Send from panel",
    within: regionRef,
    allowInInput: true,
  });
  return (
    <div ref={regionRef} className="flex flex-col gap-2">
      <Input aria-label="Panel message" />
      <Button type="button">Panel action</Button>
    </div>
  );
}

// A dialog like the studios' Save template: its key works whatever holds
// focus.
function TemplateBody() {
  useShortcut("mod+s", ran("save"), {
    description: "Save template",
    allowInOverlay: true,
    allowInInput: true,
  });
  return (
    <div className="flex flex-col gap-2">
      <Input aria-label="Template name" />
      <Button type="button">Template action</Button>
    </div>
  );
}

// A non-modal popover like a data grid's View or filter popover: its key
// belongs to a region inside it.
function FiltersBody() {
  const regionRef = useRef<HTMLDivElement>(null);
  useShortcut("mod+enter", ran("filters"), {
    description: "Apply filters",
    within: regionRef,
  });
  return (
    <div ref={regionRef} className="flex flex-col gap-2">
      <Button type="button" variant="outline">
        Clear filters
      </Button>
    </div>
  );
}

// Mounted like an app shell: one ShortcutHelp, a page shortcut, overlays,
// a list with its own typing outside Base UI and an account menu. `window.__secondHost` mounts a second help host, as a
// page with its own host inside a shell would.
export function App() {
  const [hostTwice, setHostTwice] = useState(false);
  useShortcut("mod+j", ran("page"), { description: "Page action" });

  useEffect(() => {
    if (window.__secondHost) setHostTwice(true);
    document.documentElement.dataset.hydrated = "true";
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-start gap-4 bg-background p-6 text-foreground">
      <ShortcutHelp />
      {hostTwice ? <ShortcutHelp /> : null}
      <Button type="button" variant="outline">
        Page control
      </Button>
      <Sheet>
        <SheetTrigger render={<Button type="button" variant="outline" />}>
          Open panel
        </SheetTrigger>
        <SheetContent>
          <SheetTitle>Panel</SheetTitle>
          <PanelBody />
        </SheetContent>
      </Sheet>
      <Dialog>
        <DialogTrigger render={<Button type="button" variant="outline" />}>
          Edit template
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Edit template</DialogTitle>
          <TemplateBody />
        </DialogContent>
      </Dialog>
      <Popover>
        <PopoverTrigger render={<Button type="button" variant="outline" />}>
          Filters
        </PopoverTrigger>
        <PopoverContent>
          <PopoverHeader>
            <PopoverTitle>Filters</PopoverTitle>
          </PopoverHeader>
          <FiltersBody />
        </PopoverContent>
      </Popover>
      {/* No Base UI typeahead takes Shift+? here first, so only the help's
          menu and list check leaves the key to this list. */}
      <div
        role="listbox"
        aria-label="Saved views"
        className="flex flex-col gap-1 rounded-md border border-border p-1 text-sm"
      >
        <div
          role="option"
          aria-selected="true"
          tabIndex={0}
          className="rounded-sm px-2 py-1 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          All gifts
        </div>
        <div
          role="option"
          aria-selected="false"
          tabIndex={-1}
          className="rounded-sm px-2 py-1 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          Recurring gifts
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button type="button" variant="outline" />}
        >
          Account
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <ShortcutHelpMenuItem />
        </DropdownMenuContent>
      </DropdownMenu>
    </main>
  );
}

if (typeof document !== "undefined") {
  const root = document.getElementById("root");
  if (root) hydrateRoot(root, <App />);
}
