"use no memo";

import { getColumnHeaderLabel, useDataGrid } from "./data-grid";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../../shadcn/dropdown-menu";

import type { DataGridFeatures } from "./data-grid";
import type { Table } from "@tanstack/react-table";
import type { ReactElement } from "react";

function DataGridColumnVisibility<TData extends object>({
  table,
  trigger,
}: {
  table: Table<DataGridFeatures, TData>;
  trigger: ReactElement<Record<string, unknown>>;
}) {
  const { i18n } = useDataGrid();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={trigger} />
      <DropdownMenuContent align="end" className="min-w-[150px]">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-medium">
            {i18n.labels.toggleColumns}
          </DropdownMenuLabel>
          {table
            .getAllColumns()
            .filter((column) => column.getCanHide())
            .map((column) => {
              return (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  // Title-casing is for a raw column id only; an authored
                  // label keeps its own casing.
                  className={
                    getColumnHeaderLabel(column) === column.id
                      ? "capitalize"
                      : undefined
                  }
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {getColumnHeaderLabel(column)}
                </DropdownMenuCheckboxItem>
              );
            })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { DataGridColumnVisibility };
