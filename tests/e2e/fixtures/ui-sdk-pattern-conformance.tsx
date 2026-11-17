import { DataGridSelectionBar } from "@asym/ui/components/data-grid-panel";
import { Rating } from "@asym/ui/components/primitives/rating";
import { useAsymForm } from "@asym/ui/components/primitives/tanstack-form";
import { SettingsLayout } from "@asym/ui/components/settings";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@asym/ui/components/shadcn/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@asym/ui/components/shadcn/alert-dialog";
import { Button } from "@asym/ui/components/shadcn/button";
import { Checkbox } from "@asym/ui/components/shadcn/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@asym/ui/components/shadcn/collapsible";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxList,
  ComboboxTrigger,
} from "@asym/ui/components/shadcn/combobox";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@asym/ui/components/shadcn/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@asym/ui/components/shadcn/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuEmpty,
  DropdownMenuFilterProvider,
  DropdownMenuGroup,
  DropdownMenuInput,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuList,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@asym/ui/components/shadcn/dropdown-menu";
import {
  InputGroup,
  InputGroupInput,
} from "@asym/ui/components/shadcn/input-group";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@asym/ui/components/shadcn/menubar";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@asym/ui/components/shadcn/popover";
import {
  RadioGroup,
  RadioGroupItem,
} from "@asym/ui/components/shadcn/radio-group";
import { SearchableSelect } from "@asym/ui/components/shadcn/searchable-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@asym/ui/components/shadcn/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@asym/ui/components/shadcn/sheet";
import { Slider } from "@asym/ui/components/shadcn/slider";
import { Switch } from "@asym/ui/components/shadcn/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@asym/ui/components/shadcn/tabs";
import { Toolbar, ToolbarButton } from "@asym/ui/components/shadcn/toolbar";
import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

// Only `packages/ui` installs UI SDK, so its testing kit is reached by file.
import { checkPattern } from "../../../packages/ui/node_modules/@ui-sdk/core/dist/testing.js";

declare global {
  interface Window {
    __checkPattern?: (selector: string, pattern: string) => Promise<string[]>;
    __menuActions?: string[];
  }
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section data-widget={id} className="flex flex-col items-start gap-2">
      <h2 className="text-sm font-medium">{title}</h2>
      {children}
    </section>
  );
}

const PARTNERS = ["Amara Okafor", "Lucas Silva", "Mei Tanaka"];
const LABELS = ["Billing", "Prayer request", "Urgent"];
const PAGES = ["Home", "Partners", "Tasks"];
const MERGE_TAGS = ["First name", "Last name", "Gift amount"];

// Composed like the missionary task dialog's partner picker.
function PartnerCombobox() {
  return (
    <Combobox items={PARTNERS}>
      <span id="partner-label" className="text-sm">
        Partner
      </span>
      <ComboboxTrigger
        aria-labelledby="partner-label"
        render={<Button variant="outline" />}
      >
        Select partner
      </ComboboxTrigger>
      <ComboboxContent aria-labelledby="partner-label">
        <div className="m-2">
          <InputGroup>
            <ComboboxInput
              aria-label="Search partners"
              placeholder="Search partners..."
            />
          </InputGroup>
        </div>
        <ComboboxEmpty>No partners found.</ComboboxEmpty>
        <ComboboxList>
          {(partner: string) => (
            <ComboboxItem key={partner} value={partner}>
              {partner}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

// A TanStack form select, composed like the missionary add-partner dialog.
function GivingFrequencyField() {
  const form = useAsymForm({ defaultValues: { frequency: "monthly" } });
  return (
    <form.AppForm>
      <form.AppField name="frequency">
        {(field) => (
          <field.SelectField
            label="Giving frequency"
            options={[
              { value: "monthly", label: "Monthly" },
              { value: "quarterly", label: "Quarterly" },
              { value: "annually", label: "Annually" },
            ]}
            triggerClassName="w-40"
          />
        )}
      </form.AppField>
    </form.AppForm>
  );
}

// Composed like the Support inbox label filter.
function LabelCombobox() {
  return (
    <Combobox multiple items={LABELS} defaultValue={["Urgent"]}>
      <ComboboxTrigger
        aria-label="Labels, 1 selected"
        render={<Button variant="outline" />}
      >
        Labels
      </ComboboxTrigger>
      <ComboboxContent aria-label="Labels" className="w-64 p-0">
        <InputGroup className="m-2 mb-0 w-auto shadow-none">
          <ComboboxInput
            aria-label="Search labels"
            placeholder="Search labels..."
          />
        </InputGroup>
        <ComboboxEmpty>No labels.</ComboboxEmpty>
        <ComboboxList>
          {(label: string) => (
            <ComboboxItem key={label} value={label}>
              <ComboboxItemIndicator aria-hidden="true">
                ✓
              </ComboboxItemIndicator>
              {label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

// Composed like the shared navigation command palette.
function PageCommandPalette() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        variant="outline"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        Search pages
      </Button>
      <CommandDialog
        title="Pages"
        description="Find a page in your workspace."
        commandLabel="Search pages"
        open={open}
        onOpenChange={setOpen}
      >
        <CommandInput aria-label="Search pages" placeholder="Search pages…" />
        <CommandList>
          <CommandEmpty>No matching pages.</CommandEmpty>
          <CommandGroup heading="Pages">
            {PAGES.map((page) => (
              <CommandItem
                key={page}
                value={page}
                onSelect={() => window.__menuActions?.push(page)}
              >
                {page}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

// Composed like the email studio's Insert merge tag menu.
function MergeTagMenu() {
  const [query, setQuery] = useState("");
  const tags = MERGE_TAGS.filter((tag) =>
    tag.toLowerCase().includes(query.trim().toLowerCase()),
  );
  return (
    <DropdownMenuFilterProvider
      filter={null}
      value={query}
      onValueChange={setQuery}
    >
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
          Merge tag
        </DropdownMenuTrigger>
        <DropdownMenuContent aria-label="Insert merge tag">
          <div className="w-72 px-2 pb-2">
            <InputGroup>
              <DropdownMenuInput
                aria-label="Search merge tags"
                placeholder="Search tags"
                render={<InputGroupInput />}
              />
            </InputGroup>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuEmpty>No matching tags</DropdownMenuEmpty>
          <DropdownMenuList>
            <DropdownMenuGroup>
              <DropdownMenuLabel>Insert merge tag</DropdownMenuLabel>
              {tags.map((tag) => (
                <DropdownMenuItem
                  key={tag}
                  onClick={() => window.__menuActions?.push(tag)}
                >
                  {tag}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuList>
        </DropdownMenuContent>
      </DropdownMenu>
    </DropdownMenuFilterProvider>
  );
}

// Core's retained Base UI wrappers and cmdk command list, composed the way a
// dashboard composes them, plus the one UI SDK control. The spec runs UI SDK's
// `checkPattern` against each in a real browser.
export function App() {
  const [ready, setReady] = useState(false);
  const [settingsTab, setSettingsTab] = useState("profile");
  useEffect(() => {
    window.__menuActions = [];
    // Resolves to the problems `checkPattern` lists, one per entry, with the
    // generated ids removed so they compare across runs.
    window.__checkPattern = async (selector, pattern) => {
      const root = document.querySelector(selector);
      if (!root) return [`No element matches ${selector}`];
      try {
        await checkPattern(root, pattern as Parameters<typeof checkPattern>[1]);
        return [];
      } catch (error) {
        return String(error instanceof Error ? error.message : error)
          .split("\n")
          .filter((line) => line.startsWith("- "))
          .map((line) => line.slice(2).replace(/#[\w:-]+/g, ""));
      }
    };
    setReady(true);
  }, []);

  return (
    <main
      data-ready={ready}
      className="flex min-h-screen flex-col items-start gap-6 bg-background p-6 text-foreground"
    >
      <Section id="tabs" title="Tabs">
        <Tabs defaultValue="overview">
          <TabsList aria-label="Partner sections">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="giving">Giving</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">Overview panel</TabsContent>
          <TabsContent value="giving">Giving panel</TabsContent>
          <TabsContent value="contact">Contact panel</TabsContent>
        </Tabs>
      </Section>

      <Section id="radio-group" title="Radio group">
        <RadioGroup aria-label="Receipt delivery" defaultValue="email">
          <label className="flex items-center gap-2">
            <RadioGroupItem value="email" /> Email
          </label>
          <label className="flex items-center gap-2">
            <RadioGroupItem value="mail" /> Mail
          </label>
          <label className="flex items-center gap-2">
            <RadioGroupItem value="none" /> None
          </label>
        </RadioGroup>
      </Section>

      <Section id="rating" title="Rating (UI SDK)">
        <Rating aria-label="Visit quality" defaultValue={3} />
      </Section>

      <Section id="checkbox" title="Checkbox">
        <label className="flex items-center gap-2">
          <Checkbox /> Send me a year-end statement
        </label>
      </Section>

      <Section id="switch" title="Switch">
        <label className="flex items-center gap-2">
          <Switch /> Email me new updates
        </label>
      </Section>

      <Section id="slider" title="Slider">
        <Slider
          className="w-64"
          defaultValue={[30]}
          thumbProps={{ "aria-label": "Zoom" }}
        />
      </Section>

      <Section id="accordion" title="Accordion">
        <Accordion defaultValue={["receipts"]} className="w-80">
          <AccordionItem value="receipts">
            <AccordionTrigger>Receipts</AccordionTrigger>
            <AccordionContent>Receipts arrive by email.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="statements">
            <AccordionTrigger>Statements</AccordionTrigger>
            <AccordionContent>Statements arrive in January.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </Section>

      <Section id="disclosure" title="Collapsible">
        <Collapsible>
          <CollapsibleTrigger render={<Button variant="outline" />}>
            Show details
          </CollapsibleTrigger>
          <CollapsibleContent>Gift details</CollapsibleContent>
        </Collapsible>
      </Section>

      <Section id="dialog" title="Dialog">
        <Dialog>
          <DialogTrigger render={<Button variant="outline" />}>
            Edit note
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit note</DialogTitle>
              <DialogDescription>Change the note text.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button type="button">Save note</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Section>

      <Section id="alertdialog" title="Alert dialog">
        <AlertDialog>
          <AlertDialogTrigger render={<Button variant="outline" />}>
            Delete task
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this task?</AlertDialogTitle>
              <AlertDialogDescription>
                This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep task</AlertDialogCancel>
              <AlertDialogAction>Delete task</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Section>

      <Section id="menu" title="Dropdown menu">
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" />}>
            Row actions
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {["Open", "Rename", "Archive"].map((action) => (
              <DropdownMenuItem
                key={action}
                onClick={() => window.__menuActions?.push(action)}
              >
                {action}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </Section>

      <Section id="menubar" title="Menubar">
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>New</MenubarItem>
              <MenubarItem>Open</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>Edit</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>Undo</MenubarItem>
              <MenubarItem>Redo</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </Section>

      <Section id="selection-bar" title="Selection bar">
        <DataGridSelectionBar count={2} noun="gift" onClear={() => {}}>
          <p>1 hidden by filters won&apos;t be included</p>
          <Button size="sm">Send receipts…</Button>
          <Button size="sm" variant="outline">
            Export
          </Button>
        </DataGridSelectionBar>
      </Section>

      <Section id="toolbar" title="Toolbar">
        <Toolbar aria-label="Formatting">
          <ToolbarButton render={<Button variant="ghost" size="sm" />}>
            Bold
          </ToolbarButton>
          <ToolbarButton render={<Button variant="ghost" size="sm" />}>
            Italic
          </ToolbarButton>
          <ToolbarButton render={<Button variant="ghost" size="sm" />}>
            Link
          </ToolbarButton>
        </Toolbar>
      </Section>

      <Section id="searchable-select" title="Searchable select">
        <SearchableSelect
          aria-label="Missionary"
          className="w-56"
          defaultValue="amara"
          items={[
            { value: "amara", label: "Amara Okafor" },
            { value: "lucas", label: "Lucas Silva" },
            { value: "mei", label: "Mei Tanaka" },
          ]}
        />
      </Section>

      <Section id="select" title="Select">
        <Select defaultValue="2026">
          <SelectTrigger aria-label="Year" className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2026">2026</SelectItem>
            <SelectItem value="2025">2025</SelectItem>
            <SelectItem value="2024">2024</SelectItem>
          </SelectContent>
        </Select>
      </Section>

      <Section id="form-select" title="Form select">
        <GivingFrequencyField />
      </Section>

      <Section id="combobox" title="Combobox">
        <PartnerCombobox />
      </Section>

      <Section id="combobox-multiple" title="Combobox, multiple">
        <LabelCombobox />
      </Section>

      <Section id="command" title="Command dialog">
        <PageCommandPalette />
      </Section>

      <Section id="filter-menu" title="Filterable dropdown menu">
        <MergeTagMenu />
      </Section>

      <Section id="sheet" title="Sheet">
        <Sheet>
          <SheetTrigger render={<Button variant="outline" />}>
            Open task
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Task details</SheetTitle>
              <SheetDescription>Call Amara about her visit.</SheetDescription>
            </SheetHeader>
            <SheetFooter>
              <Button type="button">Mark complete</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </Section>

      <Section id="popover" title="Popover">
        <Popover>
          <PopoverTrigger render={<Button variant="outline" />}>
            Personnel details
          </PopoverTrigger>
          <PopoverContent>
            <PopoverHeader>
              <PopoverTitle>Amara Okafor</PopoverTitle>
              <PopoverDescription>Field partner in Lima.</PopoverDescription>
            </PopoverHeader>
            <Button type="button" size="sm">
              Send message
            </Button>
          </PopoverContent>
        </Popover>
      </Section>

      {/* Vertical at this desktop width, as on donor settings. */}
      <Section id="vertical-tabs" title="Settings tabs">
        <SettingsLayout
          value={settingsTab}
          onValueChange={setSettingsTab}
          ariaLabel="Settings sections"
          tabs={[
            { value: "profile", label: "Profile" },
            { value: "email", label: "Email" },
            { value: "security", label: "Security" },
          ]}
        >
          <TabsContent value="profile">Profile panel</TabsContent>
          <TabsContent value="email">Email panel</TabsContent>
          <TabsContent value="security">Security panel</TabsContent>
        </SettingsLayout>
      </Section>
    </main>
  );
}

if (typeof document !== "undefined") {
  createRoot(document.getElementById("root")!).render(<App />);
}
