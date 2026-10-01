import React from "react";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
} from "../../../packages/ui/components/shadcn/alert-dialog";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "../../../packages/ui/components/shadcn/avatar";
import { Button } from "../../../packages/ui/components/shadcn/button";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "../../../packages/ui/components/shadcn/collapsible";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../../../packages/ui/components/shadcn/dialog";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "../../../packages/ui/components/shadcn/hover-card";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverTitle,
  PopoverDescription,
} from "../../../packages/ui/components/shadcn/popover";
import { Separator } from "../../../packages/ui/components/shadcn/separator";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "../../../packages/ui/components/shadcn/sheet";
import { TooltipProvider } from "../../../packages/ui/components/shadcn/tooltip";
import { EmailStudioProviderStatus } from "../../../packages/ui/components/studio/EmailStudioProviderStatus";
export function DisplayContracts() {
  return (
    <section aria-label="Display primitives">
      <h2>Display primitives</h2>
      <TooltipProvider>
        <EmailStudioProviderStatus variant="badge" />
      </TooltipProvider>
      <Dialog>
        <DialogTrigger render={<Button />}>Open compact dialog</DialogTrigger>
        <DialogContent>
          <DialogTitle>Compact dialog</DialogTitle>
          <DialogDescription>Modal details</DialogDescription>
          <Button>Inside dialog action</Button>
          <Popover>
            <PopoverTrigger render={<Button />}>
              Open nested popover
            </PopoverTrigger>
            <PopoverContent>
              <PopoverTitle>Nested help</PopoverTitle>
              <PopoverDescription>Useful nested details</PopoverDescription>
              <Button>Nested action</Button>
            </PopoverContent>
          </Popover>
        </DialogContent>
      </Dialog>
      <AlertDialog>
        <AlertDialogTrigger render={<Button />}>
          Open alert dialog
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Important alert</AlertDialogTitle>
          <AlertDialogDescription>Review your action</AlertDialogDescription>
          <AlertDialogCancel>Cancel action</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>
      <Sheet>
        <SheetTrigger render={<Button />}>Open side sheet</SheetTrigger>
        <SheetContent>
          <SheetTitle>Side sheet</SheetTitle>
          <SheetDescription>Side content</SheetDescription>
        </SheetContent>
      </Sheet>
      <HoverCard>
        <HoverCardTrigger href="#preview-destination">
          Preview destination
        </HoverCardTrigger>
        <HoverCardContent>Supplementary preview details</HoverCardContent>
      </HoverCard>
      <p id="preview-destination">
        Supplementary preview details are available at this destination.
      </p>
      <Avatar>
        <AvatarImage
          alt=""
          src="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2732%27 height=%2732%27%3E%3Crect width=%2732%27 height=%2732%27 fill=%27gray%27/%3E%3C/svg%3E"
        />
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
      <Collapsible>
        <CollapsibleTrigger render={<Button />}>
          Toggle disclosure
        </CollapsibleTrigger>
        <CollapsibleContent>Disclosure content</CollapsibleContent>
      </Collapsible>
      <Separator aria-label="Section separator" />
    </section>
  );
}
