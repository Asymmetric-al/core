"use client";

import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@asym/ui/components/shadcn/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@asym/ui/components/shadcn/popover";
import { cn } from "@asym/ui/lib/utils";
import { Check, Tag } from "lucide-react";
import * as React from "react";

import { useSupportLabels } from "../../hooks/use-support-labels";
import { useToggleSupportLabel } from "../../hooks/use-support-mutations";

import type {
  SupportConversation,
  SupportLabel,
  SupportLabelTone,
} from "../../types";

interface ConversationLabelMenuProps {
  conversation: SupportConversation;
  /** Render as just the chevron trigger (true) or as a labelled button (false). */
  compact?: boolean;
}

const LABEL_TONE_CLASSES: Record<SupportLabelTone, string> = {
  zinc: "bg-zinc-100 text-zinc-700 ring-zinc-200",
  blue: "bg-blue-50 text-blue-700 ring-blue-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  rose: "bg-rose-50 text-rose-700 ring-rose-200",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  violet: "bg-violet-50 text-violet-700 ring-violet-200",
};

export function ConversationLabelMenu({
  conversation,
  compact = false,
}: ConversationLabelMenuProps) {
  const { data: labels } = useSupportLabels();
  const toggleLabel = useToggleSupportLabel();
  const [open, setOpen] = React.useState(false);

  const activeIds = new Set(conversation.labels.map((label) => label.id));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(
              "h-8 gap-2 rounded-lg border-zinc-200 bg-white px-2.5 text-[11px] font-medium text-zinc-700",
              compact && "px-2",
            )}
            aria-label="Edit labels"
          />
        }
      >
        <Tag className="size-3.5 text-zinc-400" />
        {compact ? null : (
          <span>
            Labels
            {conversation.labels.length > 0 ? (
              <Badge
                variant="secondary"
                className="ml-1 h-4 min-w-[1rem] justify-center rounded-md border-transparent bg-zinc-900 px-1 text-[10px] font-semibold text-white"
              >
                {conversation.labels.length}
              </Badge>
            ) : null}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-0">
        <Command>
          <CommandInput placeholder="Search labels..." className="h-9" />
          <CommandList>
            <CommandEmpty>No labels.</CommandEmpty>
            <CommandGroup>
              {labels.map((label) => {
                const isActive = activeIds.has(label.id);
                return (
                  <CommandItem
                    key={label.id}
                    value={label.slug}
                    onSelect={() =>
                      toggleLabel.mutate({
                        conversationId: conversation.id,
                        labelId: label.id,
                      })
                    }
                    className="flex items-center gap-2"
                  >
                    <span
                      className={cn(
                        "flex size-4 items-center justify-center rounded border",
                        isActive
                          ? "border-zinc-900 bg-zinc-900 text-white"
                          : "border-zinc-200",
                      )}
                      aria-hidden
                    >
                      {isActive ? <Check className="size-3" /> : null}
                    </span>
                    <LabelChip label={label} />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function LabelChip({ label }: { label: SupportLabel }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-md px-1.5 text-[10px] font-semibold ring-1 ring-inset",
        LABEL_TONE_CLASSES[label.tone],
      )}
    >
      {label.name}
    </span>
  );
}
