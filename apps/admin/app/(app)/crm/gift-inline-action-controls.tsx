"use client";

import {
  OPERATION_CATEGORY_LABELS,
  OPERATION_DEFINITIONS,
  type OperationCategory,
  type OperationDefinition,
} from "@asym/api/admin/contribution-operations/catalog";
import {
  CRM_POSTING_UNAVAILABLE_NEXT_STEP,
  CRM_POSTING_UNAVAILABLE_REASON,
  isContributionCrmPostingSupported,
} from "@asym/api/admin/contribution-operations/crm-retry-support";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@asym/ui/components/shadcn/tooltip";
import { MoreHorizontal, Pin } from "lucide-react";

import type {
  CrmGiftInlineActionEntry,
  CrmGiftInlineActions,
  CrmTablePreferencesResponse,
} from "@asym/database/types";

const CRM_POSTING_ACTION_TYPES = new Set([
  "approve_staged_gift",
  "retry_staged_gift",
  "crm_repost",
]);

function isCrmPostingAction(actionType: string): boolean {
  return CRM_POSTING_ACTION_TYPES.has(actionType);
}

function normalizeCrmPostingEntry(
  entry: CrmGiftInlineActionEntry,
  crmPostingSupported: boolean,
): CrmGiftInlineActionEntry {
  if (crmPostingSupported || !isCrmPostingAction(entry.actionType)) {
    return entry;
  }

  return {
    ...entry,
    available: false,
    blockedReason: CRM_POSTING_UNAVAILABLE_REASON,
    nextStep: CRM_POSTING_UNAVAILABLE_NEXT_STEP,
  };
}

/**
 * The row's normalized entries and its resolved visible action: valid user
 * pin, then valid tenant default, then the system next-best (#271).
 */
export function resolveGiftRowAction(
  inlineActions: CrmGiftInlineActions | undefined,
  preferences: CrmTablePreferencesResponse | undefined,
) {
  const crmPostingSupported = isContributionCrmPostingSupported();
  const entries = (inlineActions?.entries ?? []).map((entry) =>
    normalizeCrmPostingEntry(entry, crmPostingSupported),
  );
  const resolved = resolveCrmRowAction({
    userPin: preferences?.user ?? null,
    tenantDefault: preferences?.tenantDefault ?? null,
    entries,
  });
  return { crmPostingSupported, entries, resolved };
}

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
  receiptSent = false,
  giftLabel,
}: {
  inlineActions: CrmGiftInlineActions | undefined;
  preferences: CrmTablePreferencesResponse | undefined;
  onRunOperation: (operation: OperationDefinition) => void;
  onPinChange: (actionId: string | null) => void;
  /** The gift's receipt already went out, so sending it is a resend. */
  receiptSent?: boolean;
  /** Names the actions menu after its gift ("$250.00 gift on May 1, 2026 to …"). */
  giftLabel?: string;
}) {
  const { crmPostingSupported, entries, resolved } = resolveGiftRowAction(
    inlineActions,
    preferences,
  );
  if (entries.length === 0) {
    return null;
  }

  const pinnableEntries = entries.filter(
    (entry) => crmPostingSupported || !isCrmPostingAction(entry.actionType),
  );
  const rowAction = resolved.actionType
    ? OPERATION_DEFINITIONS[resolved.actionType]
    : undefined;

  const categories = Object.keys(
    OPERATION_CATEGORY_LABELS,
  ) as OperationCategory[];
  // Posting to the retired external CRM can never run again, so its blocked
  // entries leave the menu; the gift's detail sheet explains the retirement.
  const menuEntries = entries.filter(
    (entry) => crmPostingSupported || !isCrmPostingAction(entry.actionType),
  );
  const groups = categories.flatMap((category) => {
    const items = menuEntries.flatMap((entry) => {
      const definition = OPERATION_DEFINITIONS[entry.actionType];
      if (!definition || definition.category !== category) {
        return [];
      }
      return [{ definition, entry }];
    });
    return items.length ? [{ category, items }] : [];
  });

  const isPinned = resolved.source === "user_pin";
  // A pinned action shows on every row whatever the gift's state (e.g.
  // "Send receipt" next to "Receipt sent"), so say it is the viewer's pin
  // rather than a suggestion for this gift.
  const rowActionHint = isPinned
    ? "Pinned row action. Change it in this gift's More actions menu."
    : resolved.explanation;

  return (
    <div className="flex shrink-0 items-center gap-1">
      {rowAction ? (
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRunOperation(rowAction)}
              >
                {isPinned ? <Pin aria-hidden="true" /> : null}
                {rowAction.actionType === "resend_receipt" && receiptSent
                  ? "Resend receipt"
                  : rowAction.title}
                {isPinned ? <span className="sr-only">, pinned</span> : null}
              </Button>
            }
          />
          {rowActionHint ? (
            <TooltipContent>{rowActionHint}</TooltipContent>
          ) : null}
        </Tooltip>
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
              size="icon-sm"
              aria-label={
                giftLabel
                  ? `More actions for ${giftLabel}`
                  : "More gift actions"
              }
            >
              <MoreHorizontal aria-hidden="true" />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          {groups.map((group, index) => (
            <DropdownMenuGroup key={group.category}>
              {index > 0 ? <DropdownMenuSeparator /> : null}
              {/* Muted, smaller group names, so they never read as actions. */}
              <DropdownMenuLabel>
                <span className="text-xs font-normal text-muted-foreground">
                  {OPERATION_CATEGORY_LABELS[group.category]}
                </span>
              </DropdownMenuLabel>
              {group.items.map(({ definition, entry }) => (
                <DropdownMenuItem
                  key={entry.actionType}

                  // A blocked entry keeps the same server-computed reason and
                  // next step the detail surface shows (#270), so staff learn
                  // why an action is unavailable without leaving the row.
                  title={
                    entry.available
                      ? undefined
                      : [entry.blockedReason, entry.nextStep]
                          .filter(Boolean)
                          .join(". ") || undefined
                  }
                  disabled={!entry.available}
                  onClick={() => {
                    if (entry.available) {
                      onRunOperation(definition);
                    }
                  }}
                >
                  {entry.available ? (
                    // A sent receipt is resent, as the row button says.
                    definition.actionType === "resend_receipt" &&
                    receiptSent ? (
                      "Resend receipt"
                    ) : (
                      definition.title
                    )
                  ) : (
                    // The base item already dims disabled entries
                    // (data-disabled:opacity-50); no extra muted color, so the
                    // blocked reason stays legible — that's the point of
                    // showing it (#270).
                    <span className="flex w-full max-w-64 flex-col items-start gap-0.5">
                      <span className="flex w-full items-center">
                        {definition.title}
                        <DropdownMenuShortcut>Blocked</DropdownMenuShortcut>
                      </span>
                      {entry.blockedReason ? (
                        <span className="text-xs font-normal">
                          {entry.blockedReason}
                        </span>
                      ) : null}
                      {entry.nextStep ? (
                        <span className="text-xs font-normal">
                          {entry.nextStep}
                        </span>
                      ) : null}
                    </span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Pin aria-hidden="true" />
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
                {pinnableEntries.map((entry) => {
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
