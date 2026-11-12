"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@asym/ui/components/shadcn/dropdown-menu";
import { Group } from "lucide-react";

import type { GroupByFieldOption } from "./payload-where-filters";

const NO_GROUPING = "__none";
const ORDER_ASCENDING = "asc";
const ORDER_DESCENDING = "desc";

/**
 * Group by for a Studio collection list, as Payload's own list offers it: a
 * field and an order, written to the list query as Payload's `groupBy`
 * ("field" ascending, "-field" descending; "" clears). Payload then renders
 * the grouped tables on the server.
 */
export function GridGroupByMenu({
  fields,
  groupBy,
  onGroupByChange,
}: {
  fields: readonly GroupByFieldOption[];
  /** The list query's current `groupBy`, e.g. "_status" or "-tenant". */
  groupBy: string | undefined;
  onGroupByChange: (groupBy: string) => void;
}) {
  if (fields.length === 0) return null;
  const current = groupBy?.replace(/^-/, "") ?? "";
  const field = fields.find((option) => option.id === current);
  const order = groupBy?.startsWith("-") ? ORDER_DESCENDING : ORDER_ASCENDING;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant={field ? "secondary" : "outline"} size="sm">
            <Group aria-hidden="true" />
            {field ? `Group by: ${field.label}` : "Group by"}
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Group by</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={field ? field.id : NO_GROUPING}
            onValueChange={(id: string) => {
              if (id === NO_GROUPING) {
                onGroupByChange("");
                return;
              }
              onGroupByChange(order === ORDER_DESCENDING ? `-${id}` : id);
            }}
          >
            <DropdownMenuRadioItem value={NO_GROUPING}>
              No grouping
            </DropdownMenuRadioItem>
            {fields.map((option) => (
              <DropdownMenuRadioItem key={option.id} value={option.id}>
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
        {field ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>Group order</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={order}
                onValueChange={(value: string) =>
                  onGroupByChange(
                    value === ORDER_DESCENDING ? `-${field.id}` : field.id,
                  )
                }
              >
                <DropdownMenuRadioItem value={ORDER_ASCENDING}>
                  Ascending
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value={ORDER_DESCENDING}>
                  Descending
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
