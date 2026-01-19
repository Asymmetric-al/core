"use client";

import * as React from "react";
import type { Row, Table } from "@tanstack/react-table";
import Image from "next/image";
import { MoreHorizontal, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface DataTableCardViewProps<TData> {
  rows: Row<TData>[];
  primaryField?: string;
  secondaryField?: string;
  tertiaryField?: string;
  badgeField?: string;
  avatarField?: string;
  enableRowSelection?: boolean;
  onRowClick?: (row: Row<TData>) => void;
  rowActions?: {
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: (row: TData) => void;
    variant?: "default" | "destructive";
  }[];
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
            <div key={row.id} className="relative">
              {renderCard(row)}
            </div>
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

interface DataTableCardItemProps<TData> {
  row: Row<TData>;
  primaryField?: string;
  secondaryField?: string;
  tertiaryField?: string;
  badgeField?: string;
  avatarField?: string;
  enableRowSelection?: boolean;
  onRowClick?: (row: Row<TData>) => void;
  rowActions?: {
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: (row: TData) => void;
    variant?: "default" | "destructive";
  }[];
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

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all rounded-xl",
        "hover:shadow-md hover:border-primary/20",
        "active:scale-[0.99]",
        isSelected && "border-primary bg-primary/5",
        onRowClick && "cursor-pointer",
      )}
      onClick={() => onRowClick?.(row)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {enableRowSelection && (
            <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => row.toggleSelected(!!checked)}
                aria-label="Select row"
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
                        <React.Fragment key={action.label}>
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

interface DataTableMobileViewProps<TData> {
  table: Table<TData>;
  primaryField?: string;
  secondaryField?: string;
  tertiaryField?: string;
  badgeField?: string;
  avatarField?: string;
  onRowClick?: (row: Row<TData>) => void;
  rowActions?: {
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: (row: TData) => void;
    variant?: "default" | "destructive";
  }[];
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
