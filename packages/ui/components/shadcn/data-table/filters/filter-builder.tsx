"use client";

import { useCallback } from "react";
import { PlusIcon, FilterIcon, XIcon } from "lucide-react";
import { cn } from "@asym/ui/lib/utils";
import { Button } from "../../button";
import { Badge } from "../../badge";
import { Popover, PopoverContent, PopoverTrigger } from "../../popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "../../sheet";
import { Separator } from "../../separator";
import { FilterRow } from "./filter-row";
import {
  type AdvancedFilterState,
  type FilterFieldDefinition,
  type FilterCondition,
  type FilterOperator,
  type FilterValue,
  createFilterCondition,
  createEmptyFilterState,
  countActiveFilters,
  getDefaultOperator,
  getDefaultValue,
} from "./types";

interface FilterBuilderProps {
  fields: FilterFieldDefinition[];
  value: AdvancedFilterState;
  onChange: (filter: AdvancedFilterState) => void;
  className?: string;
  variant?: "popover" | "sheet" | "inline";
  align?: "start" | "center" | "end";
}

export function FilterBuilder({
  fields,
  value,
  onChange,
  className,
  variant = "popover",
  align = "start",
}: FilterBuilderProps) {
  const activeCount = countActiveFilters(value);

  const content = (
    <FilterBuilderContent fields={fields} value={value} onChange={onChange} />
  );

  if (variant === "inline") {
    return <div className={className}>{content}</div>;
  }

  if (variant === "sheet") {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <FilterTriggerButton
            activeCount={activeCount}
            className={className}
          />
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Advanced Filters</SheetTitle>
            <SheetDescription>
              Add conditions to filter your data. Multiple conditions can be
              combined with AND/OR logic.
            </SheetDescription>
          </SheetHeader>
          <div className="py-4 overflow-y-auto max-h-[calc(100vh-200px)]">
            {content}
          </div>
          <SheetFooter>
            <Button
              variant="outline"
              onClick={() => onChange(createEmptyFilterState())}
              disabled={activeCount === 0}
            >
              Clear All
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <FilterTriggerButton activeCount={activeCount} className={className} />
      </PopoverTrigger>
      <PopoverContent
        className="w-auto min-w-[400px] max-w-[600px] p-4"
        align={align}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Filters</h4>
            {activeCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onChange(createEmptyFilterState())}
                className="h-7 text-xs"
              >
                Clear all
              </Button>
            )}
          </div>
          {content}
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface FilterTriggerButtonProps {
  activeCount: number;
  className?: string;
}

function FilterTriggerButton({
  activeCount,
  className,
}: FilterTriggerButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      className={cn("h-9 gap-2 rounded-xl border-dashed", className)}
    >
      <FilterIcon className="size-4" />
      <span>Filters</span>
      {activeCount > 0 && (
        <Badge
          variant="secondary"
          className="rounded-lg px-1.5 py-0 text-xs font-normal"
        >
          {activeCount}
        </Badge>
      )}
    </Button>
  );
}

interface FilterBuilderContentProps {
  fields: FilterFieldDefinition[];
  value: AdvancedFilterState;
  onChange: (filter: AdvancedFilterState) => void;
}

function FilterBuilderContent({
  fields,
  value,
  onChange,
}: FilterBuilderContentProps) {
  const addCondition = useCallback(() => {
    if (fields.length === 0) return;
    const firstField = fields[0];
    if (!firstField) return;
    const newCondition = createFilterCondition(firstField);
    onChange({
      ...value,
      conditions: [...value.conditions, newCondition],
    });
  }, [fields, value, onChange]);

  const updateCondition = useCallback(
    (index: number, updates: Partial<FilterCondition>) => {
      const newConditions = [...value.conditions];
      const existing = newConditions[index];
      if (!existing) return;
      newConditions[index] = { ...existing, ...updates };
      onChange({ ...value, conditions: newConditions });
    },
    [value, onChange],
  );

  const removeCondition = useCallback(
    (index: number) => {
      onChange({
        ...value,
        conditions: value.conditions.filter((_, i) => i !== index),
      });
    },
    [value, onChange],
  );

  const handleFieldChange = useCallback(
    (index: number, fieldId: string) => {
      const newField = fields.find((f) => f.id === fieldId);
      if (!newField) return;

      const operator =
        newField.defaultOperator ?? getDefaultOperator(newField.type);
      updateCondition(index, {
        field: fieldId,
        operator,
        value: getDefaultValue(newField.type, operator),
      });
    },
    [fields, updateCondition],
  );

  const handleOperatorChange = useCallback(
    (index: number, operator: FilterOperator) => {
      updateCondition(index, { operator });
    },
    [updateCondition],
  );

  const handleValueChange = useCallback(
    (index: number, newValue: FilterValue) => {
      updateCondition(index, { value: newValue });
    },
    [updateCondition],
  );

  const toggleLogic = useCallback(() => {
    onChange({
      ...value,
      logic: value.logic === "and" ? "or" : "and",
    });
  }, [value, onChange]);

  if (value.conditions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <FilterIcon className="size-8 text-muted-foreground/50 mb-2" />
        <p className="text-sm text-muted-foreground mb-3">No filters applied</p>
        <Button variant="outline" size="sm" onClick={addCondition}>
          <PlusIcon className="size-4 mr-1" />
          Add filter
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {value.conditions.map((condition, index) => (
        <div key={condition.id}>
          {index > 0 && (
            <div className="flex items-center gap-2 py-1">
              <Separator className="flex-1" />
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLogic}
                className="h-6 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                {value.logic.toUpperCase()}
              </Button>
              <Separator className="flex-1" />
            </div>
          )}
          <FilterRow
            condition={condition}
            fields={fields}
            onFieldChange={(fieldId) => handleFieldChange(index, fieldId)}
            onOperatorChange={(op) => handleOperatorChange(index, op)}
            onValueChange={(val) => handleValueChange(index, val)}
            onRemove={() => removeCondition(index)}
            showRemove={true}
          />
        </div>
      ))}
      <Button
        variant="ghost"
        size="sm"
        onClick={addCondition}
        className="h-8 w-full text-muted-foreground hover:text-foreground"
      >
        <PlusIcon className="size-4 mr-1" />
        Add filter
      </Button>
    </div>
  );
}

interface ActiveFiltersProps {
  fields: FilterFieldDefinition[];
  value: AdvancedFilterState;
  onChange: (filter: AdvancedFilterState) => void;
  className?: string;
}

export function ActiveFilters({
  fields,
  value,
  onChange,
  className,
}: ActiveFiltersProps) {
  const removeCondition = useCallback(
    (conditionId: string) => {
      onChange({
        ...value,
        conditions: value.conditions.filter((c) => c.id !== conditionId),
      });
    },
    [value, onChange],
  );

  const clearAll = useCallback(() => {
    onChange(createEmptyFilterState());
  }, [onChange]);

  if (value.conditions.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {value.conditions.map((condition, index) => {
        const field = fields.find((f) => f.id === condition.field);
        if (!field) return null;

        return (
          <Badge
            key={condition.id}
            variant="secondary"
            className="rounded-lg pl-2 pr-1 py-1 gap-1 font-normal"
          >
            {index > 0 && (
              <span className="text-xs text-muted-foreground mr-1">
                {value.logic.toUpperCase()}
              </span>
            )}
            <span className="font-medium">{field.label}</span>
            <span className="text-muted-foreground mx-1">
              {getOperatorLabel(condition.operator)}
            </span>
            <span>{formatFilterValue(condition.value, field)}</span>
            <button
              type="button"
              onClick={() => removeCondition(condition.id)}
              className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
            >
              <XIcon className="size-3" />
            </button>
          </Badge>
        );
      })}
      {value.conditions.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAll}
          className="h-7 text-xs text-muted-foreground"
        >
          Clear all
        </Button>
      )}
    </div>
  );
}

function getOperatorLabel(operator: FilterOperator): string {
  const labels: Record<FilterOperator, string> = {
    equals: "=",
    not_equals: "≠",
    contains: "contains",
    not_contains: "excludes",
    starts_with: "starts",
    ends_with: "ends",
    is_empty: "empty",
    is_not_empty: "not empty",
    gt: ">",
    gte: "≥",
    lt: "<",
    lte: "≤",
    between: "between",
    in: "in",
    not_in: "not in",
    before: "before",
    after: "after",
    on_or_before: "≤",
    on_or_after: "≥",
    is_true: "is true",
    is_false: "is false",
  };
  return labels[operator] ?? operator;
}

function formatFilterValue(
  value: FilterValue,
  field: FilterFieldDefinition,
): string {
  if (value === null || value === undefined) return "";

  if (Array.isArray(value)) {
    if (value.length === 0) return "none";
    if (field.options) {
      const labels = value
        .map((v) => field.options?.find((o) => o.value === v)?.label ?? v)
        .slice(0, 2);
      if (value.length > 2) {
        return `${labels.join(", ")} +${value.length - 2}`;
      }
      return labels.join(", ");
    }
    return (
      value.slice(0, 2).join(", ") +
      (value.length > 2 ? ` +${value.length - 2}` : "")
    );
  }

  if (typeof value === "object") {
    if ("from" in value && "to" in value) {
      const from = value.from
        ? new Date(value.from).toLocaleDateString()
        : "...";
      const to = value.to ? new Date(value.to).toLocaleDateString() : "...";
      return `${from} - ${to}`;
    }
    if ("min" in value && "max" in value) {
      const min = value.min !== null ? value.min : "...";
      const max = value.max !== null ? value.max : "...";
      return `${min} - ${max}`;
    }
  }

  if (value instanceof Date) {
    return value.toLocaleDateString();
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (field.type === "select" && field.options) {
    const option = field.options.find((o) => o.value === value);
    return option?.label ?? String(value);
  }

  return String(value);
}
