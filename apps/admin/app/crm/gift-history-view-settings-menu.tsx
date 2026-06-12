"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@asym/ui/components/shadcn/dropdown-menu";
import { Settings2 } from "lucide-react";

import type { ViewSettingsPatch } from "./crm-detail-shared";
import type {
  CrmGiftHistoryFiltersSortSettings,
  CrmGiftHistoryViewSettings,
  CrmViewSettingsScope,
} from "@asym/database/types";

/**
 * One CRM gift-history view settings surface (#272): columns, filters/sort,
 * and granular resets. The server preference record is authoritative;
 * toggles save optimistically through the preferences mutation.
 */
export function GiftHistoryViewSettingsMenu({
  settings,
  onPatch,
  onRequestReset,
}: {
  settings: CrmGiftHistoryViewSettings;
  onPatch: (patch: ViewSettingsPatch) => void;
  onRequestReset: (scope: CrmViewSettingsScope) => void;
}) {
  const sortValue = `${settings.filtersSort.sortField}:${settings.filtersSort.sortDirection}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground"
          aria-label="Gift history view settings"
        >
          <Settings2 className="size-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Columns
        </DropdownMenuLabel>
        <DropdownMenuCheckboxItem
          checked={settings.columns.designation}
          onCheckedChange={(checked) =>
            onPatch({
              columns: { ...settings.columns, designation: checked === true },
            })
          }
        >
          Designation
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={settings.columns.statusLine}
          onCheckedChange={(checked) =>
            onPatch({
              columns: { ...settings.columns, statusLine: checked === true },
            })
          }
        >
          Receipt / CRM status
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Sort
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={sortValue}
          onValueChange={(value) => {
            const [sortField, sortDirection] = value.split(":") as [
              CrmGiftHistoryFiltersSortSettings["sortField"],
              CrmGiftHistoryFiltersSortSettings["sortDirection"],
            ];
            onPatch({
              filtersSort: {
                ...settings.filtersSort,
                sortField,
                sortDirection,
              },
            });
          }}
        >
          <DropdownMenuRadioItem value="giftDate:desc">
            Newest first
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="giftDate:asc">
            Oldest first
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="amountCents:desc">
            Largest amount
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Filter
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={settings.filtersSort.paymentStatus}
          onValueChange={(value) =>
            onPatch({
              filtersSort: {
                ...settings.filtersSort,
                paymentStatus:
                  value as CrmGiftHistoryFiltersSortSettings["paymentStatus"],
              },
            })
          }
        >
          <DropdownMenuRadioItem value="all">
            All payments
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="completed">
            Completed only
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="refunded">
            Refunded only
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Issues
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={settings.filtersSort.issue}
          onValueChange={(value) =>
            onPatch({
              filtersSort: {
                ...settings.filtersSort,
                issue: value as CrmGiftHistoryFiltersSortSettings["issue"],
              },
            })
          }
        >
          <DropdownMenuRadioItem value="all">All gifts</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="needs_attention">
            Needs attention
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="receipt_affected">
            Receipt affected
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="pending_correction">
            Pending correction
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Reset view settings</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onSelect={() => onRequestReset("columns")}>
              Reset columns…
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onRequestReset("filtersSort")}>
              Reset filters & sort…
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onRequestReset("pinnedAction")}>
              Reset pinned row action…
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onRequestReset("all")}>
              Reset all view settings…
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
