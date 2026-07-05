"use client";

import { Command as CommandPrimitive } from "cmdk";
import * as React from "react";

import { cn } from "@asym/ui/lib/utils";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./dialog";

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function Command({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        "bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md",
        className,
      )}
      {...props}
    />
  );
}

function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  className,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
}) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      {/*
        Strip the default Dialog open/close animations for the command
        palette: it's a keyboard-initiated surface that users open
        100+ times/day, so it should feel instant (Raycast pattern).
        See docs/ai/skills/anim/SKILL.md.
      */}
      <DialogContent
        className={cn(
          "overflow-hidden p-0",
          "data-open:!animate-none data-closed:!animate-none !duration-0",
          className,
        )}
        showCloseButton={showCloseButton}
      >
        <Command className="[&_[cmdk-group-heading]]:text-muted-foreground **:data-[slot=command-input-wrapper]:h-12 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
}

type CommandInputProps = React.ComponentProps<typeof CommandPrimitive.Input> & {
  wrapperClassName?: string;
  iconClassName?: string;
  /**
   * Popover filter layout: border + radius live on the native `<input>` so the
   * stroke is one box (no wrapper/input stacking or stadium-border glitches).
   */
  popoverChrome?: boolean;
};

function CommandInput({
  className,
  wrapperClassName,
  iconClassName,
  popoverChrome,
  ...props
}: CommandInputProps) {
  if (popoverChrome) {
    return (
      <div
        data-slot="command-input-wrapper"
        className={cn("relative m-2 mb-0 max-w-full", wrapperClassName)}
      >
        <SearchIcon
          aria-hidden
          className={cn(
            "pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground/60",
            iconClassName,
          )}
        />
        <CommandPrimitive.Input
          data-slot="command-input"
          className={cn(
            "placeholder:text-muted-foreground box-border h-10 w-full rounded-xl border-2 border-solid border-border/70 bg-background py-0 pl-9 pr-3 text-sm shadow-none outline-none ring-0 transition-colors",
            "hover:border-border/85 disabled:cursor-not-allowed disabled:opacity-50",
            "focus:border-ring focus:outline-none focus-visible:outline-none focus-visible:ring-0",
            className,
          )}
          {...props}
        />
      </div>
    );
  }

  return (
    <div
      data-slot="command-input-wrapper"
      className={cn(
        "flex h-10 items-center gap-2 px-3",
        !wrapperClassName && "border-b border-border/60",
        wrapperClassName,
      )}
    >
      <SearchIcon
        className={cn(
          "size-4 shrink-0 text-muted-foreground/60",
          iconClassName,
        )}
      />
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn(
          "placeholder:text-muted-foreground flex h-full w-full rounded-none border-0 bg-transparent py-0 text-sm shadow-none outline-none ring-0 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:outline-none focus-visible:ring-0",
          className,
        )}
        {...props}
      />
    </div>
  );
}

function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn(
        "max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto",
        className,
      )}
      {...props}
    />
  );
}

function CommandEmpty({
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className="py-6 text-center text-sm"
      {...props}
    />
  );
}

function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        "text-foreground [&_[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium",
        className,
      )}
      {...props}
    />
  );
}

function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn("bg-border -mx-1 h-px", className)}
      {...props}
    />
  );
}

function CommandItem({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function CommandShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className,
      )}
      {...props}
    />
  );
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};
