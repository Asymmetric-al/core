"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@asym/ui/components/shadcn/popover";
import { Wand2 } from "lucide-react";
import * as React from "react";

import { RunMacroPopover } from "./RunMacroPopover";

import type { SupportConversation } from "../../types";

interface MacroLauncherProps {
  conversation: SupportConversation;
  onCannedResponseInsert?: (input: { text: string; html: string }) => void;
  /** Compact (composer chrome) renders just the icon. */
  compact?: boolean;
}

/**
 * Slot-mountable macro popover. Used by `<ConversationComposer />` (composer
 * chrome slot) and the conversation header dropdown alike.
 */
export function MacroLauncher({
  conversation,
  onCannedResponseInsert,
  compact = false,
}: MacroLauncherProps) {
  const [open, setOpen] = React.useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size={compact ? "icon-sm" : "sm"}
            aria-label="Open macros"
          >
            <Wand2 aria-hidden="true" />
            {compact ? null : "Macros"}
          </Button>
        }
      />
      <PopoverContent align="end" className="w-80 p-0">
        <RunMacroPopover
          conversation={conversation}
          onCannedResponseInsert={(payload) => {
            onCannedResponseInsert?.(payload);
            setOpen(false);
          }}
          onAfterRun={() => setOpen(false)}
        />
      </PopoverContent>
    </Popover>
  );
}
