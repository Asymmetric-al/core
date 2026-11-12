"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@asym/ui/components/shadcn/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@asym/ui/components/shadcn/tooltip";
import { MoreHorizontal } from "lucide-react";

import type * as React from "react";

interface SettingsIconButtonProps {
  /** Accessible name for this row, e.g. "Edit Weekdays". */
  label: string;
  /** Short visible hint, e.g. "Edit". */
  tooltip: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

/** Icon-only row action with a tooltip that says what it does. */
export function SettingsIconButton({
  label,
  tooltip,
  disabled,
  onClick,
  children,
}: SettingsIconButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={label}
            disabled={disabled}
            onClick={onClick}
          >
            {children}
          </Button>
        }
      />
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}

interface SettingsActionsMenuProps {
  /** Accessible name for this row, e.g. "More actions for Standard". */
  label: string;
  /** DropdownMenuItem entries. */
  children: React.ReactNode;
}

/** Overflow menu for a row's less common actions, such as Delete. */
export function SettingsActionsMenu({
  label,
  children,
}: SettingsActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={label}
          >
            <MoreHorizontal aria-hidden="true" />
          </Button>
        }
      />
      <DropdownMenuContent align="end">{children}</DropdownMenuContent>
    </DropdownMenu>
  );
}
