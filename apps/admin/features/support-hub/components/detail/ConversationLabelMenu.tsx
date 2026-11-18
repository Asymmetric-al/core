"use client";

import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxList,
  ComboboxTrigger,
  createComboboxItems,
} from "@asym/ui/components/shadcn/combobox";
import {
  InputGroup,
  InputGroupAddon,
} from "@asym/ui/components/shadcn/input-group";
import { Check, Search, Tag } from "lucide-react";
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

function matchesLabel(label: SupportLabel, query: string) {
  const search = query.trim().toLocaleLowerCase();
  return (
    label.name.toLocaleLowerCase().includes(search) ||
    label.slug.toLocaleLowerCase().includes(search)
  );
}

export function ConversationLabelMenu({
  conversation,
  compact = false,
}: ConversationLabelMenuProps) {
  const { data: labels } = useSupportLabels();
  const toggleLabel = useToggleSupportLabel();
  const [open, setOpen] = React.useState(false);
  const items = React.useMemo(
    () =>
      createComboboxItems(labels, {
        getValue: (label) => label.id,
        getLabel: (label) => label.name,
      }),
    [labels],
  );

  const activeIds = conversation.labels.map((label) => label.id);
  const appliedCount = activeIds.length;

  const handleValueChange = (next: string[]) => {
    const toggled = [
      ...next.filter((id) => !activeIds.includes(id)),
      ...activeIds.filter((id) => !next.includes(id)),
    ];
    for (const labelId of toggled)
      toggleLabel.mutate({ conversationId: conversation.id, labelId });
  };

  return (
    <Combobox
      multiple
      items={items}
      value={activeIds}
      onValueChange={handleValueChange}
      open={open}
      onOpenChange={setOpen}
      filter={matchesLabel}
      onInputValueChange={(_query, details) => {
        if (details.isItemPress) details.cancel();
      }}
    >
      <ComboboxTrigger
        aria-label={
          appliedCount > 0
            ? `Edit labels, ${appliedCount} applied`
            : "Edit labels"
        }
        render={
          <Button
            type="button"
            variant="outline"
            size={compact ? "icon-sm" : "sm"}
          />
        }
      >
        <Tag aria-hidden="true" />
        {compact ? null : (
          <span>
            Labels
            {appliedCount > 0 ? (
              <Badge variant="secondary" className="ml-1">
                {appliedCount}
              </Badge>
            ) : null}
          </span>
        )}
      </ComboboxTrigger>
      {/* The popup defaults to the anchor's width, too narrow for the icon
          trigger, and its contract only allows w-full: the wrapper sets it. */}
      <ComboboxContent aria-label="Edit labels" align="end" className="w-full">
        <div className="w-64 max-w-full">
          <div className="p-2 pb-0">
            <InputGroup>
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <ComboboxInput
                aria-label="Search labels"
                placeholder="Search labels..."
              />
            </InputGroup>
          </div>
          <ComboboxEmpty>No labels.</ComboboxEmpty>
          <ComboboxList>
            {(label: SupportLabel) => (
              <ComboboxItem key={label.id} value={label.id}>
                <span className="flex size-4 items-center justify-center rounded border border-border in-data-selected:border-primary in-data-selected:bg-primary in-data-selected:text-primary-foreground">
                  <ComboboxItemIndicator>
                    <Check className="size-3" />
                  </ComboboxItemIndicator>
                </span>
                <LabelChip label={label} />
              </ComboboxItem>
            )}
          </ComboboxList>
        </div>
      </ComboboxContent>
    </Combobox>
  );
}

function LabelChip({ label }: { label: SupportLabel }) {
  return <Badge variant={LABEL_BADGE_VARIANTS[label.tone]}>{label.name}</Badge>;
}
