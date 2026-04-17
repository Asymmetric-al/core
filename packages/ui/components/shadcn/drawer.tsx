"use client";

import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer";
import { Slot as SlotPrimitive } from "radix-ui";
import * as React from "react";

import { cn } from "@asym/ui/lib/utils";

import {
  resolveDrawerSwipeDirection,
  type LegacyDrawerDirection,
} from "../../lib/drawer-swipe-direction";

function Drawer({
  direction,
  swipeDirection,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root> & {
  direction?: LegacyDrawerDirection;
}) {
  const resolvedSwipeDirection = resolveDrawerSwipeDirection({
    swipeDirection,
    direction,
  });

  return (
    <DrawerPrimitive.Root
      data-slot="drawer"
      swipeDirection={resolvedSwipeDirection}
      {...props}
    />
  );
}

function DrawerTrigger({
  asChild = false,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Trigger> & {
  asChild?: boolean;
}) {
  return (
    <DrawerPrimitive.Trigger
      data-slot="drawer-trigger"
      render={asChild ? <SlotPrimitive.Slot /> : undefined}
      {...props}
    />
  );
}

function DrawerPortal({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />;
}

function DrawerClose({
  asChild = false,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Close> & {
  asChild?: boolean;
}) {
  return (
    <DrawerPrimitive.Close
      data-slot="drawer-close"
      render={asChild ? <SlotPrimitive.Slot /> : undefined}
      {...props}
    />
  );
}

function DrawerOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Backdrop>) {
  return (
    <DrawerPrimitive.Backdrop
      data-slot="drawer-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/50 transition-opacity duration-200 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

function DrawerContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Popup>) {
  return (
    <DrawerPortal data-slot="drawer-portal">
      <DrawerOverlay />
      <DrawerPrimitive.Viewport
        data-slot="drawer-viewport"
        className="fixed inset-0 z-50 overflow-hidden overscroll-contain"
      >
        <DrawerPrimitive.Popup
          data-slot="drawer-content"
          className={cn(
            "group/drawer-content bg-background fixed z-50 flex h-auto flex-col shadow-lg outline-none transition-opacity duration-200 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
            "data-[swipe-direction=up]:inset-x-0 data-[swipe-direction=up]:top-0 data-[swipe-direction=up]:mb-24 data-[swipe-direction=up]:max-h-[80vh] data-[swipe-direction=up]:rounded-b-lg data-[swipe-direction=up]:border-b",
            "data-[swipe-direction=down]:inset-x-0 data-[swipe-direction=down]:bottom-0 data-[swipe-direction=down]:mt-24 data-[swipe-direction=down]:max-h-[80vh] data-[swipe-direction=down]:rounded-t-lg data-[swipe-direction=down]:border-t",
            "data-[swipe-direction=right]:inset-y-0 data-[swipe-direction=right]:right-0 data-[swipe-direction=right]:w-3/4 data-[swipe-direction=right]:border-l data-[swipe-direction=right]:sm:max-w-sm",
            "data-[swipe-direction=left]:inset-y-0 data-[swipe-direction=left]:left-0 data-[swipe-direction=left]:w-3/4 data-[swipe-direction=left]:border-r data-[swipe-direction=left]:sm:max-w-sm",
            className,
          )}
          {...props}
        >
          <DrawerPrimitive.Content
            data-slot="drawer-body"
            className="flex h-full flex-col"
          >
            <div className="bg-muted mx-auto mt-4 hidden h-2 w-[100px] shrink-0 rounded-full group-data-[swipe-direction=down]/drawer-content:block" />
            {children}
          </DrawerPrimitive.Content>
        </DrawerPrimitive.Popup>
      </DrawerPrimitive.Viewport>
    </DrawerPortal>
  );
}

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-header"
      className={cn(
        "flex flex-col gap-0.5 p-4 group-data-[swipe-direction=down]/drawer-content:text-center group-data-[swipe-direction=up]/drawer-content:text-center md:gap-1.5 md:text-left",
        className,
      )}
      {...props}
    />
  );
}

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  );
}

function DrawerTitle({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn("text-foreground font-semibold", className)}
      {...props}
    />
  );
}

function DrawerDescription({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
