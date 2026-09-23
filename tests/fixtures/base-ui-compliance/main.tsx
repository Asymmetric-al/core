import React, { useState } from "react";
import { createRoot } from "react-dom/client";

import { CompositionContracts } from "./composition-contracts";
import { ControlsContracts } from "./controls-contracts";
import { DisplayContracts } from "./display-contracts";
import { DrawerContracts } from "./drawer-contracts";
import { InputContracts } from "./input-contracts";
import { ToolbarContracts } from "./toolbar-contracts";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../../../packages/ui/components/shadcn/accordion";
import { Button } from "../../../packages/ui/components/shadcn/button";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuLabel,
  ContextMenuItem,
} from "../../../packages/ui/components/shadcn/context-menu";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "../../../packages/ui/components/shadcn/drawer";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
} from "../../../packages/ui/components/shadcn/dropdown-menu";
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
} from "../../../packages/ui/components/shadcn/menubar";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from "../../../packages/ui/components/shadcn/navigation-menu";
import { ScrollArea } from "../../../packages/ui/components/shadcn/scroll-area";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../../packages/ui/components/shadcn/tabs";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "../../../packages/ui/components/shadcn/tooltip";
import "virtual:base-ui-styles";
function App() {
  const [count, setCount] = useState(1);
  return (
    <main className="app-root" style={{ padding: 24 }}>
      <div
        data-testid="high-z-app-child"
        style={{ position: "fixed", zIndex: 999999, inset: 0, display: "none" }}
      />
      <DisplayContracts />
      <DrawerContracts />
      <h1>Base UI contracts</h1>
      <Button onClick={() => setCount(count === 1 ? 30 : 1)}>
        Toggle rows
      </Button>
      <ScrollArea className="h-40 w-72 border">
        <div>
          {Array.from({ length: count }, (_, i) => (
            <p key={i} style={{ height: 32 }}>
              Message {i + 1}
            </p>
          ))}
        </div>
      </ScrollArea>
      <Drawer>
        <DrawerTrigger render={<Button />}>Open drawer</DrawerTrigger>
        <DrawerContent>
          <DrawerTitle>Gesture drawer</DrawerTitle>
          <DrawerDescription>Drag to dismiss</DrawerDescription>
          <div style={{ height: 200, padding: 24 }}>
            <label>
              Name
              <input aria-label="Name" />
            </label>
          </div>
          <DrawerClose render={<Button />}>Done</DrawerClose>
        </DrawerContent>
      </Drawer>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button />}>Actions</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuLabel>Record actions</DropdownMenuLabel>
            <DropdownMenuItem>Edit record</DropdownMenuItem>
            <DropdownMenuItem>Archive record</DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>New file</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Undo edit</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
      <ContextMenu>
        <ContextMenuTrigger>Right click this area</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuGroup>
            <ContextMenuLabel>Context actions</ContextMenuLabel>
            <ContextMenuItem>Copy record</ContextMenuItem>
          </ContextMenuGroup>
        </ContextMenuContent>
      </ContextMenu>
      <Button>Copy record alternative</Button>
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink href="#docs">
                Documentation
              </NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      <Accordion>
        <AccordionItem value="a">
          <AccordionTrigger>Details</AccordionTrigger>
          <AccordionContent
            className={({ open }) => (open ? "content-open" : "content-closed")}
          >
            Accordion details
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">First</TabsTrigger>
          <TabsTrigger value="b">Second</TabsTrigger>
        </TabsList>
        <TabsContent value="a">First content</TabsContent>
        <TabsContent value="b">Second content</TabsContent>
      </Tabs>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger aria-label="Helpful action">Help</TooltipTrigger>
          <TooltipContent>Helpful action</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <InputContracts />
      <ControlsContracts />
      <ToolbarContracts />
      <CompositionContracts />
    </main>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
