"use client";

import { MoreHorizontal, ChevronRight } from "lucide-react";
import Image from "next/image";
import * as React from "react";

import { cn } from "@asym/ui/lib/utils";

import { Badge } from "../badge";
import { Button } from "../button";
import { Card, CardContent } from "../card";
import { Checkbox } from "../checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import { getDataTableRowActionKey } from "./data-table-row-action-key";

import type { Row, RowData, Table } from "./tanstack";
import type { DataTableInteractiveRowAction } from "./types";

interface DataTableCardViewProps<TData extends RowData> {
  rows: Row<TData>[];
  primaryField?: string;
  secondaryField?: string;
  tertiaryField?: string;
  badgeField?: string;
  avatarField?: string;
  enableRowSelection?: boolean;
  onRowClick?: (row: Row<TData>) => void;
  rowActions?: DataTableInteractiveRowAction<TData>[];
  renderCard?: (row: Row<TData>) => React.ReactNode;
  className?: string;
}

export function DataTableCardView<TData extends RowData>({
  rows,
  primaryField,
  secondaryField,
  tertiaryField,
  badgeField,
  avatarField,
  enableRowSelection = true,
  onRowClick,
  rowActions,
  renderCard,
  className,
}: DataTableCardViewProps<TData>) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-sm text-muted-foreground">No results found</p>
      </div>
    );
  }

  return (
    <div className={cn("grid gap-3", className)}>
      {rows.map((row) => {
        if (renderCard) {
          return (
            <DataTableCustomCard key={row.id} row={row} render={renderCard} />
          );
        }

        return (
          <DataTableCardItem
            key={row.id}
            row={row}
            primaryField={primaryField}
            secondaryField={secondaryField}
            tertiaryField={tertiaryField}
            badgeField={badgeField}
            avatarField={avatarField}
            enableRowSelection={enableRowSelection}
            onRowClick={onRowClick}
            rowActions={rowActions}
          />
        );
      })}
    </div>
  );
}

function DataTableCustomCard<TData extends RowData>({
  row,
  render,
}: {
  row: Row<TData>;
  render: (row: Row<TData>) => React.ReactNode;
}) {
  return <div className="relative">{render(row)}</div>;
}

interface DataTableCardItemProps<TData extends RowData> {
  row: Row<TData>;
  primaryField?: string;
  secondaryField?: string;
  tertiaryField?: string;
  badgeField?: string;
  avatarField?: string;
  enableRowSelection?: boolean;
  onRowClick?: (row: Row<TData>) => void;
  rowActions?: DataTableInteractiveRowAction<TData>[];
}

function DataTableCardItem<TData extends RowData>({
  row,
  primaryField,
  secondaryField,
  tertiaryField,
  badgeField,
  avatarField,
  enableRowSelection = true,
  onRowClick,
  rowActions,
}: DataTableCardItemProps<TData>) {
  const original = row.original as Record<string, unknown>;
  const isSelected = row.getIsSelected();

  const primaryValue = primaryField ? String(original[primaryField] ?? "") : "";
  const secondaryValue = secondaryField
    ? String(original[secondaryField] ?? "")
    : "";
  const tertiaryValue = tertiaryField
    ? String(original[tertiaryField] ?? "")
    : "";
  const badgeValue = badgeField ? String(original[badgeField] ?? "") : "";
  const avatarValue = avatarField ? String(original[avatarField] ?? "") : "";
  const isRowClickable = Boolean(onRowClick);

  const handleCardKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!onRowClick) {
      return;
    }
    if (event.target !== event.currentTarget) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onRowClick(row);
    }
  };

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all rounded-xl",
        "hover:shadow-md hover:border-primary/20",
        "active:scale-[0.99]",
        isSelected && "border-primary bg-primary/5",
        isRowClickable && "cursor-pointer",
      )}
      onClick={() => onRowClick?.(row)}
      onKeyDown={handleCardKeyDown}
      role={isRowClickable ? "button" : undefined}
      tabIndex={isRowClickable ? 0 : undefined}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {enableRowSelection && (
            <div className="pt-0.5">
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => row.toggleSelected(!!checked)}
                aria-label="Select row"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          {avatarValue && (
            <div className="size-10 rounded-full bg-muted flex items-center justify-center shrink-0 overflow-hidden relative">
              {avatarValue.startsWith("http") ? (
                <Image
                  src={avatarValue}
                  alt=""
                  fill
                  sizes="40px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <span className="text-sm font-medium text-muted-foreground">
                  {avatarValue.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          )}

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                {primaryValue && (
                  <p className="font-medium text-sm truncate">{primaryValue}</p>
                )}
                {secondaryValue && (
                  <p className="text-sm text-muted-foreground truncate">
                    {secondaryValue}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {badgeValue && (
                  <Badge variant="secondary" className="rounded-lg text-xs">
                    {badgeValue}
                  </Badge>
                )}

                {rowActions && rowActions.length > 0 ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-lg"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl">
                      {rowActions.map((action, index) => (
                        <React.Fragment
                          key={getDataTableRowActionKey(action, index)}
                        >
                          {action.variant === "destructive" && index > 0 && (
                            <DropdownMenuSeparator />
                          )}
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              action.onClick(row.original);
                            }}
                            className={cn(
                              "rounded-lg",
                              action.variant === "destructive" &&
                                "text-destructive focus:text-destructive",
                            )}
                          >
                            {action.icon && (
                              <action.icon className="size-4 mr-2" />
                            )}
                            {action.label}
                          </DropdownMenuItem>
                        </React.Fragment>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  onRowClick && (
                    <ChevronRight className="size-4 text-muted-foreground" />
                  )
                )}
              </div>
            </div>

            {tertiaryValue && (
              <p className="text-xs text-muted-foreground">{tertiaryValue}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface DataTableMobileViewProps<TData extends RowData> {
  table: Table<TData>;
  primaryField?: string;
  secondaryField?: string;
  tertiaryField?: string;
  badgeField?: string;
  avatarField?: string;
  onRowClick?: (row: Row<TData>) => void;
  rowActions?: DataTableInteractiveRowAction<TData>[];
  renderCard?: (row: Row<TData>) => React.ReactNode;
  className?: string;
}

export function DataTableMobileView<TData extends RowData>({
  table,
  primaryField,
  secondaryField,
  tertiaryField,
  badgeField,
  avatarField,
  onRowClick,
  rowActions,
  renderCard,
  className,
}: DataTableMobileViewProps<TData>) {
  const rows = table.getRowModel().rows;

  return (
    <DataTableCardView
      rows={rows}
      primaryField={primaryField}
      secondaryField={secondaryField}
      tertiaryField={tertiaryField}
      badgeField={badgeField}
      avatarField={avatarField}
      enableRowSelection={true}
      onRowClick={onRowClick}
      rowActions={rowActions}
      renderCard={renderCard}
      className={className}
    />
  );
}
