"use client";

import { resolveCrmRowAction } from "@asym/api/admin/crm/table-preferences";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@asym/ui/components/shadcn/dropdown-menu";
import { MoreHorizontal, Pin } from "lucide-react";

import {
  OPERATION_CATEGORY_LABELS,
  OPERATION_DEFINITIONS,
  type OperationCategory,
  type OperationDefinition,
} from "../contributions/operation-shell";

import type {
  CrmGiftInlineActions,
  CrmTablePreferencesResponse,
} from "@asym/database/types";

/**
 * Server-computed inline operations for one gift row (#270): a single
 * next-best action plus a capability/state-filtered menu grouped by
 * operation category. Submissions run through the shared operation shell.
 *
 * The visible row action honors preferences (#271): valid user pin, then
 * valid tenant default, then the system next-best. Resolution re-validates
 * against the entries, so preferences never bypass capabilities or state.
 */
export function GiftInlineActionControls({
  inlineActions,
  preferences,
  onRunOperation,
  onPinChange,
}: {
  inlineActions: CrmGiftInlineActions | undefined;
  preferences: CrmTablePreferencesResponse | undefined;
  onRunOperation: (operation: OperationDefinition) => void;
  onPinChange: (actionId: string | null) => void;
}) {
  const entries = inlineActions?.entries ?? [];
  if (entries.length === 0) {
    return null;
  }

  const resolved = resolveCrmRowAction({
    userPin: preferences?.user ?? null,
    tenantDefault: preferences?.tenantDefault ?? null,
    entries,
  });
  const rowAction = resolved.actionType
    ? OPERATION_DEFINITIONS[resolved.actionType]
    : undefined;

  const categories = Object.keys(
    OPERATION_CATEGORY_LABELS,
  ) as OperationCategory[];
  const groups = categories
    .map((category) => ({
      category,
      items: entries.flatMap((entry) => {
        const definition = OPERATION_DEFINITIONS[entry.actionType];
        if (!definition || definition.category !== category) {
          return [];
        }
        return [{ definition, entry }];
      }),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <div className="flex shrink-0 items-center gap-1">
      {rowAction ? (
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-2 text-xs"
          title={resolved.explanation ?? undefined}
          onClick={() => onRunOperation(rowAction)}
        >
          {resolved.source === "user_pin" ? (
            <Pin className="size-3" aria-hidden="true" />
          ) : null}
          {rowAction.title}
        </Button>
      ) : null}
      {resolved.explanation ? (
        <span role="note" className="sr-only">
          {resolved.explanation}
        </span>
      ) : null}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground"
              aria-label="More gift actions"
            >
              <MoreHorizontal className="size-4" aria-hidden="true" />
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-64">
          {groups.map((group, index) => (
            <DropdownMenuGroup key={group.category}>
              {index > 0 ? <DropdownMenuSeparator /> : null}
              <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {OPERATION_CATEGORY_LABELS[group.category]}
              </DropdownMenuLabel>
              {group.items.map(({ definition, entry }) => (
                <DropdownMenuItem
                  key={entry.actionType}
                  className={
                    entry.available ? undefined : "text-muted-foreground"
                  }
                  disabled={!entry.available}
                  onClick={() => {
                    if (entry.available) {
                      onRunOperation(definition);
                    }
                  }}
                >
                  {definition.title}
                  {entry.available ? null : (
                    <DropdownMenuShortcut>Blocked</DropdownMenuShortcut>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Pin className="size-3.5" aria-hidden="true" />
              Pin row action
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup
                value={preferences?.user?.actionId ?? ""}
                onValueChange={(value) =>
                  onPinChange(value === "" ? null : value)
                }
              >
                <DropdownMenuRadioItem value="">
                  System default
                </DropdownMenuRadioItem>
                {entries.map((entry) => {
                  const definition = OPERATION_DEFINITIONS[entry.actionType];
                  if (!definition) {
                    return null;
                  }
                  return (
                    <DropdownMenuRadioItem
                      key={entry.actionType}
                      value={entry.actionType}
                    >
                      {definition.title}
                    </DropdownMenuRadioItem>
                  );
                })}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
