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
            size={compact ? "icon" : "sm"}
            className={
              compact
                ? "size-7 rounded-md text-zinc-400 hover:text-zinc-900"
                : "h-8 gap-1.5 rounded-lg px-2 text-[11px] font-bold uppercase tracking-wider text-zinc-600"
            }
            aria-label="Open macros"
          >
            <Wand2 className="size-3.5" />
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
