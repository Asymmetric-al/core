"use client";

import { ChevronRight } from "lucide-react";
import Image from "next/image";
import * as React from "react";

import { cn } from "@asym/ui/lib/utils";

import { Badge } from "../badge";
import { Button } from "../button";
import { Card, CardContent } from "../card";
import { Checkbox } from "../checkbox";
import { DataTableRowActions } from "./data-table-row-actions";

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
  getRowActionAriaLabel?: (row: Row<TData>) => string;
  renderCard?: (row: Row<TData>) => React.ReactNode;
  /** Shown instead of the generic message when there are no rows. */
  emptyState?: React.ReactNode;
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
  getRowActionAriaLabel,
  renderCard,
  emptyState,
  className,
}: DataTableCardViewProps<TData>) {
  if (rows.length === 0) {
    return (
      emptyState ?? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-muted-foreground">No results found</p>
        </div>
      )
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
  getRowActionAriaLabel?: (row: Row<TData>) => string;
}

function cardField(original: Record<string, unknown>, field?: string): string {
  return field ? String(original[field] ?? "") : "";
}

function DataTableCardSelection<TData extends RowData>({
  row,
  isSelected,
  enableRowSelection,
  primaryLabelValue,
}: {
  row: Row<TData>;
  isSelected: boolean;
  enableRowSelection: boolean;
  primaryLabelValue: string;
}) {
  if (!enableRowSelection) {
    return null;
  }

  return (
    <div className="pt-0.5">
      <Checkbox
        checked={isSelected}
        onCheckedChange={(checked) => row.toggleSelected(!!checked)}
        aria-label={
          primaryLabelValue ? `Select ${primaryLabelValue}` : "Select row"
        }
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

function DataTableCardAvatar({ avatarValue }: { avatarValue: string }) {
  if (!avatarValue) {
    return null;
  }

  return (
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
  );
}

function DataTableCardLine({
  className,
  onOpen,
  children,
}: {
  className: string;
  onOpen?: () => void;
  children: string;
}) {
  if (!onOpen) {
    return <p className={cn(className, "truncate")}>{children}</p>;
  }

  return (
    <button
      type="button"
      className={cn(
        className,
        "block max-w-full truncate rounded-md text-start outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
      )}
      onClick={(event) => {
        // The card's own pointer click would open the row a second time.
        event.stopPropagation();
        onOpen();
      }}
    >
      {children}
    </button>
  );
}

function DataTableCardIdentity({
  primaryValue,
  secondaryValue,
  onOpen,
}: {
  primaryValue: string;
  secondaryValue: string;
  onOpen?: () => void;
}) {
  const hasPrimary = primaryValue.trim() !== "";
  return (
    <div className="min-w-0 flex-1">
      {hasPrimary && (
        <DataTableCardLine className="font-medium text-sm" onOpen={onOpen}>
          {primaryValue}
        </DataTableCardLine>
      )}
      {secondaryValue.trim() && (
        <DataTableCardLine
          className="text-sm text-muted-foreground"
          onOpen={hasPrimary ? undefined : onOpen}
        >
          {secondaryValue}
        </DataTableCardLine>
      )}
    </div>
  );
}

function DataTableCardTrailing<TData extends RowData>({
  badgeValue,
  row,
  rowActions,
  rowActionAriaLabel,
  onRowClick,
  onOpenFallback,
}: {
  badgeValue: string;
  row: Row<TData>;
  rowActions?: DataTableInteractiveRowAction<TData>[];
  rowActionAriaLabel?: (row: Row<TData>) => string;
  onRowClick?: (row: Row<TData>) => void;
  onOpenFallback?: () => void;
}) {
  const hasRowActions = Boolean(rowActions && rowActions.length > 0);
  return (
    <div className="flex items-center gap-2 shrink-0">
      {badgeValue && (
        <Badge variant="secondary" className="rounded-lg text-xs">
          {badgeValue}
        </Badge>
      )}
      {rowActions && hasRowActions && (
        <DataTableRowActions
          row={row}
          actions={rowActions}
          getAriaLabel={rowActionAriaLabel}
        />
      )}
      {onOpenFallback ? (
        // No card text to carry the row's control, so the chevron becomes it.
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Open row"
          onClick={(event) => {
            event.stopPropagation();
            onOpenFallback();
          }}
        >
          <ChevronRight className="size-4 text-muted-foreground" />
        </Button>
      ) : (
        !hasRowActions &&
        onRowClick && <ChevronRight className="size-4 text-muted-foreground" />
      )}
    </div>
  );
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
  getRowActionAriaLabel,
}: DataTableCardItemProps<TData>) {
  const original = row.original as Record<string, unknown>;
  const isSelected = row.getIsSelected();
  const primaryValue = cardField(original, primaryField);
  const secondaryValue = cardField(original, secondaryField);
  const tertiaryValue = cardField(original, tertiaryField);
  const badgeValue = cardField(original, badgeField);
  const avatarValue = cardField(original, avatarField);
  const isRowClickable = Boolean(onRowClick);
  const primaryLabelValue = primaryValue.trim();
  const openRow = onRowClick ? () => onRowClick(row) : undefined;
  const hasCardText = primaryLabelValue !== "" || secondaryValue.trim() !== "";
  const contextualRowActionAriaLabel = primaryLabelValue
    ? () => `Row actions for ${primaryLabelValue}`
    : undefined;
  const rowActionAriaLabel =
    getRowActionAriaLabel ?? contextualRowActionAriaLabel;

  return (
    <Card
      className={cn(
        "relative overflow-hidden rounded-xl transition-[background-color,border-color]",
        isSelected && "border-primary bg-primary/5",
        isRowClickable &&
          "press-feedback cursor-pointer [@media(hover:hover)_and_(pointer:fine)]:hover:shadow-md [@media(hover:hover)_and_(pointer:fine)]:hover:border-primary/20",
      )}
      // Pointer convenience only: the primary text is the row's keyboard and
      // screen-reader control, so the card's checkbox and actions stay operable.
      onClick={() => onRowClick?.(row)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <DataTableCardSelection
            row={row}
            isSelected={isSelected}
            enableRowSelection={enableRowSelection}
            primaryLabelValue={primaryLabelValue}
          />
          <DataTableCardAvatar avatarValue={avatarValue} />
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-start justify-between gap-2">
              <DataTableCardIdentity
                primaryValue={primaryValue}
                secondaryValue={secondaryValue}
                onOpen={openRow}
              />
              <DataTableCardTrailing
                badgeValue={badgeValue}
                row={row}
                rowActions={rowActions}
                rowActionAriaLabel={rowActionAriaLabel}
                onRowClick={onRowClick}
                onOpenFallback={hasCardText ? undefined : openRow}
              />
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
  getRowActionAriaLabel?: (row: Row<TData>) => string;
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
      enableRowSelection
      onRowClick={onRowClick}
      rowActions={rowActions}
      getRowActionAriaLabel={getRowActionAriaLabel}
      renderCard={renderCard}
      className={className}
    />
  );
}
