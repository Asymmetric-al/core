"use client";

import { useCallback, useState } from "react";
import type { ColumnFiltersState } from "@tanstack/react-table";
import {
  type AdvancedFilterState,
  type FilterCondition,
  type FilterFieldDefinition,
  type FilterValue,
  createEmptyFilterState,
  serializeFilter,
  deserializeFilter,
} from "./types";

export interface UseAdvancedFilterOptions {
  fields: FilterFieldDefinition[];
  initialFilter?: AdvancedFilterState;
  onFilterChange?: (filter: AdvancedFilterState) => void;
}

export interface UseAdvancedFilterReturn {
  filter: AdvancedFilterState;
  setFilter: (filter: AdvancedFilterState) => void;
  resetFilter: () => void;
  addCondition: (fieldId: string) => void;
  removeCondition: (conditionId: string) => void;
  updateCondition: (
    conditionId: string,
    updates: Partial<FilterCondition>,
  ) => void;
  toColumnFilters: () => ColumnFiltersState;
  toUrlParam: () => string;
  fromUrlParam: (param: string) => void;
}

export function useAdvancedFilter({
  fields,
  initialFilter,
  onFilterChange,
}: UseAdvancedFilterOptions): UseAdvancedFilterReturn {
  const [filter, setFilterState] = useState<AdvancedFilterState>(
    initialFilter ?? createEmptyFilterState(),
  );

  const setFilter = useCallback(
    (newFilter: AdvancedFilterState) => {
      setFilterState(newFilter);
      onFilterChange?.(newFilter);
    },
    [onFilterChange],
  );

  const resetFilter = useCallback(() => {
    const empty = createEmptyFilterState();
    setFilterState(empty);
    onFilterChange?.(empty);
  }, [onFilterChange]);

  const addCondition = useCallback(
    (fieldId: string) => {
      const field = fields.find((f) => f.id === fieldId);
      if (!field) return;

      const newCondition: FilterCondition = {
        id: crypto.randomUUID(),
        field: fieldId,
        operator: field.defaultOperator ?? "equals",
        value: null,
      };

      setFilterState((prev) => {
        const updated = {
          ...prev,
          conditions: [...prev.conditions, newCondition],
        };
        onFilterChange?.(updated);
        return updated;
      });
    },
    [fields, onFilterChange],
  );

  const removeCondition = useCallback(
    (conditionId: string) => {
      setFilterState((prev) => {
        const updated = {
          ...prev,
          conditions: prev.conditions.filter(
            (c: FilterCondition) => c.id !== conditionId,
          ),
        };
        onFilterChange?.(updated);
        return updated;
      });
    },
    [onFilterChange],
  );

  const updateCondition = useCallback(
    (conditionId: string, updates: Partial<FilterCondition>) => {
      setFilterState((prev) => {
        const updated = {
          ...prev,
          conditions: prev.conditions.map((c: FilterCondition) =>
            c.id === conditionId ? { ...c, ...updates } : c,
          ),
        };
        onFilterChange?.(updated);
        return updated;
      });
    },
    [onFilterChange],
  );

  const toColumnFilters = useCallback((): ColumnFiltersState => {
    return filter.conditions.map((condition: FilterCondition) => ({
      id: condition.field,
      value: {
        operator: condition.operator,
        value: condition.value,
      },
    }));
  }, [filter]);

  const toUrlParam = useCallback((): string => {
    return serializeFilter(filter);
  }, [filter]);

  const fromUrlParam = useCallback(
    (param: string) => {
      const parsed = deserializeFilter(param);
      if (parsed) {
        setFilterState(parsed);
        onFilterChange?.(parsed);
      }
    },
    [onFilterChange],
  );

  return {
    filter,
    setFilter,
    resetFilter,
    addCondition,
    removeCondition,
    updateCondition,
    toColumnFilters,
    toUrlParam,
    fromUrlParam,
  };
}

export function advancedFilterFn(
  row: { getValue: (columnId: string) => unknown },
  columnId: string,
  filterValue: { operator: string; value: FilterValue },
): boolean {
  const { operator, value } = filterValue;
  const cellValue = row.getValue(columnId);

  switch (operator) {
    case "equals":
      return cellValue === value;
    case "not_equals":
      return cellValue !== value;
    case "contains":
      return String(cellValue ?? "")
        .toLowerCase()
        .includes(String(value ?? "").toLowerCase());
    case "not_contains":
      return !String(cellValue ?? "")
        .toLowerCase()
        .includes(String(value ?? "").toLowerCase());
    case "starts_with":
      return String(cellValue ?? "")
        .toLowerCase()
        .startsWith(String(value ?? "").toLowerCase());
    case "ends_with":
      return String(cellValue ?? "")
        .toLowerCase()
        .endsWith(String(value ?? "").toLowerCase());
    case "is_empty":
      return cellValue === null || cellValue === undefined || cellValue === "";
    case "is_not_empty":
      return cellValue !== null && cellValue !== undefined && cellValue !== "";
    case "gt":
      return Number(cellValue) > Number(value);
    case "gte":
      return Number(cellValue) >= Number(value);
    case "lt":
      return Number(cellValue) < Number(value);
    case "lte":
      return Number(cellValue) <= Number(value);
    case "between": {
      const range = value as { min: number | null; max: number | null } | null;
      if (!range) return true;
      const num = Number(cellValue);
      const minOk = range.min === null || num >= range.min;
      const maxOk = range.max === null || num <= range.max;
      return minOk && maxOk;
    }
    case "in": {
      const arr = value as string[] | undefined;
      return Array.isArray(arr) && arr.includes(String(cellValue));
    }
    case "not_in": {
      const arr = value as string[] | undefined;
      return Array.isArray(arr) && !arr.includes(String(cellValue));
    }
    case "before": {
      const cellDate = new Date(cellValue as string | Date);
      const filterDate = new Date(value as string | Date);
      return cellDate < filterDate;
    }
    case "after": {
      const cellDate = new Date(cellValue as string | Date);
      const filterDate = new Date(value as string | Date);
      return cellDate > filterDate;
    }
    case "on_or_before": {
      const cellDate = new Date(cellValue as string | Date);
      const filterDate = new Date(value as string | Date);
      return cellDate <= filterDate;
    }
    case "on_or_after": {
      const cellDate = new Date(cellValue as string | Date);
      const filterDate = new Date(value as string | Date);
      return cellDate >= filterDate;
    }
    case "is_true":
      return cellValue === true;
    case "is_false":
      return cellValue === false;
    default:
      return true;
  }
}

export function createAdvancedFilterFn<TData>(
  filter: AdvancedFilterState,
): (
  row: TData,
  getRowValue: (row: TData, columnId: string) => unknown,
) => boolean {
  return (row, getRowValue) => {
    if (filter.conditions.length === 0) return true;

    const results = filter.conditions.map((condition: FilterCondition) => {
      const cellValue = getRowValue(row, condition.field);
      return advancedFilterFn({ getValue: () => cellValue }, condition.field, {
        operator: condition.operator,
        value: condition.value,
      });
    });

    if (filter.logic === "and") {
      return results.every(Boolean);
    } else {
      return results.some(Boolean);
    }
  };
}
