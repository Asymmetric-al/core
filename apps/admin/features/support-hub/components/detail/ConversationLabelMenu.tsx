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
import { LABEL_BADGE_VARIANTS } from "../labels/label-badge-variants";

import type { SupportConversation, SupportLabel } from "../../types";

interface ConversationLabelMenuProps {
  conversation: SupportConversation;
  /** Render as just the chevron trigger (true) or as a labelled button (false). */
  compact?: boolean;
}

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
            size={compact ? "icon-sm" : "sm"}
            aria-label="Edit labels"
          >
            <Tag aria-hidden="true" />
            {compact ? null : (
              <span>
                Labels
                {conversation.labels.length > 0 ? (
                  <Badge variant="secondary" className="ml-1 tabular-nums">
                    {conversation.labels.length}
                  </Badge>
                ) : null}
              </span>
            )}
          </Button>
        }
      />
      <PopoverContent align="end" className="w-64 p-0">
        <Command>
          <CommandInput placeholder="Search labels..." />
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
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border",
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
  return <Badge variant={LABEL_BADGE_VARIANTS[label.tone]}>{label.name}</Badge>;
}
