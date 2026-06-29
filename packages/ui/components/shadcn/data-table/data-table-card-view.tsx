"use client";

import { ChevronRight } from "lucide-react";
import Image from "next/image";
import * as React from "react";

import { cn } from "@asym/ui/lib/utils";

import { Badge } from "../badge";
import { Card, CardContent } from "../card";
import { Checkbox } from "../checkbox";
import { DataTableRowActions } from "./data-table-row-actions";

import type { DataTableInteractiveRowAction } from "./types";
import type { Row, Table } from "@tanstack/react-table";

interface DataTableCardViewProps<TData> {
  rows: Row<TData>[];
  primaryField?: string;
  secondaryField?: string;
  tertiaryField?: string;
  badgeField?: string;
  avatarField?: string;
  enableRowSelection?: boolean;
  onRowClick?: (row: Row<TData>) => void;
  rowActions?: DataTableInteractiveRowAction<TData>[];
  getRowActionAriaLabel?: (row: Row<TData>) => string;
  renderCard?: (row: Row<TData>) => React.ReactNode;
  className?: string;
}

export function DataTableCardView<TData>({
  rows,
  primaryField,
  secondaryField,
  tertiaryField,
  badgeField,
  avatarField,
  enableRowSelection = true,
  onRowClick,
  rowActions,
  getRowActionAriaLabel,
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
            getRowActionAriaLabel={getRowActionAriaLabel}
          />
        );
      })}
    </div>
  );
}

function DataTableCustomCard<TData>({
  row,
  render,
}: {
  row: Row<TData>;
  render: (row: Row<TData>) => React.ReactNode;
}) {
  return <div className="relative">{render(row)}</div>;
}

interface DataTableCardItemProps<TData> {
  row: Row<TData>;
  primaryField?: string;
  secondaryField?: string;
  tertiaryField?: string;
  badgeField?: string;
  avatarField?: string;
  enableRowSelection?: boolean;
  onRowClick?: (row: Row<TData>) => void;
  rowActions?: DataTableInteractiveRowAction<TData>[];
  getRowActionAriaLabel?: (row: Row<TData>) => string;
}

function DataTableCardItem<TData>({
  row,
  primaryField,
  secondaryField,
  tertiaryField,
  badgeField,
  avatarField,
  enableRowSelection = true,
  onRowClick,
  rowActions,
  getRowActionAriaLabel,
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
  const primaryLabelValue = primaryValue.trim();
  const contextualRowActionAriaLabel = primaryLabelValue
    ? () => `Row actions for ${primaryLabelValue}`
    : undefined;
  const rowActionAriaLabel =
    getRowActionAriaLabel ?? contextualRowActionAriaLabel;

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
        "relative overflow-hidden rounded-xl transition-[background-color,border-color]",
        isSelected && "border-primary bg-primary/5",
        isRowClickable &&
          "press-feedback cursor-pointer [@media(hover:hover)_and_(pointer:fine)]:hover:shadow-md [@media(hover:hover)_and_(pointer:fine)]:hover:border-primary/20",
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
                  <DataTableRowActions
                    row={row}
                    actions={rowActions}
                    getAriaLabel={rowActionAriaLabel}
                  />
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

interface DataTableMobileViewProps<TData> {
  table: Table<TData>;
  primaryField?: string;
  secondaryField?: string;
  tertiaryField?: string;
  badgeField?: string;
  avatarField?: string;
  onRowClick?: (row: Row<TData>) => void;
  rowActions?: DataTableInteractiveRowAction<TData>[];
  getRowActionAriaLabel?: (row: Row<TData>) => string;
  renderCard?: (row: Row<TData>) => React.ReactNode;
  className?: string;
}

export function DataTableMobileView<TData>({
  table,
  primaryField,
  secondaryField,
  tertiaryField,
  badgeField,
  avatarField,
  onRowClick,
  rowActions,
  getRowActionAriaLabel,
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
      getRowActionAriaLabel={getRowActionAriaLabel}
      renderCard={renderCard}
      className={className}
    />
  );
}
