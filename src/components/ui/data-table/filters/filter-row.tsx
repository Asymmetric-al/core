"use client";

import { useCallback, useMemo } from "react";
import { Trash2Icon } from "lucide-react";
import { cn } from "@asym/lib/utils";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@asym/ui/components/shadcn/select";
import {
  FilterTextInput,
  FilterNumberInput,
  FilterCurrencyInput,
  FilterDateInput,
} from "./filter-value-inputs";
import {
  FilterSelectInput,
  FilterMultiSelectInput,
} from "./filter-select-inputs";
import {
  type FilterCondition,
  type FilterFieldDefinition,
  type FilterOperator,
  type FilterValue,
  OPERATOR_LABELS,
  OPERATORS_BY_TYPE,
  VALUE_LESS_OPERATORS,
  getDefaultValue,
} from "./types";

interface FilterRowProps {
  condition: FilterCondition;
  fields: FilterFieldDefinition[];
  onFieldChange: (fieldId: string) => void;
  onOperatorChange: (operator: FilterOperator) => void;
  onValueChange: (value: FilterValue) => void;
  onRemove: () => void;
  showRemove?: boolean;
  className?: string;
}

export function FilterRow({
  condition,
  fields,
  onFieldChange,
  onOperatorChange,
  onValueChange,
  onRemove,
  showRemove = true,
  className,
}: FilterRowProps) {
  const field = useMemo(
    () => fields.find((f) => f.id === condition.field),
    [fields, condition.field],
  );

  const availableOperators = useMemo(() => {
    if (!field) return [];
    return field.operators ?? OPERATORS_BY_TYPE[field.type] ?? [];
  }, [field]);

  const showValueInput = !VALUE_LESS_OPERATORS.includes(condition.operator);

  const handleFieldChange = useCallback(
    (newFieldId: string) => {
      onFieldChange(newFieldId);
    },
    [onFieldChange],
  );

  const handleOperatorChange = useCallback(
    (newOperator: string) => {
      const op = newOperator as FilterOperator;
      onOperatorChange(op);
      if (VALUE_LESS_OPERATORS.includes(op)) {
        onValueChange(null);
      } else if (field) {
        const needsReset =
          (op === "between" && condition.operator !== "between") ||
          (condition.operator === "between" && op !== "between") ||
          (["in", "not_in"].includes(op) &&
            !["in", "not_in"].includes(condition.operator)) ||
          (["in", "not_in"].includes(condition.operator) &&
            !["in", "not_in"].includes(op));
        if (needsReset) {
          onValueChange(getDefaultValue(field.type, op));
        }
      }
    },
    [field, condition.operator, onOperatorChange, onValueChange],
  );

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-lg border bg-card p-2",
        className,
      )}
    >
      <Select value={condition.field} onValueChange={handleFieldChange}>
        <SelectTrigger className="h-8 w-[160px] text-sm">
          <SelectValue placeholder="Select field" />
        </SelectTrigger>
        <SelectContent>
          {fields.map((f) => (
            <SelectItem key={f.id} value={f.id}>
              {f.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={condition.operator} onValueChange={handleOperatorChange}>
        <SelectTrigger className="h-8 w-[160px] text-sm">
          <SelectValue placeholder="Select operator" />
        </SelectTrigger>
        <SelectContent>
          {availableOperators.map((op) => (
            <SelectItem key={op} value={op}>
              {OPERATOR_LABELS[op]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showValueInput && field && (
        <FilterValueInput
          field={field}
          operator={condition.operator}
          value={condition.value}
          onChange={onValueChange}
        />
      )}

      {showRemove && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
        >
          <Trash2Icon className="size-4" />
        </Button>
      )}
    </div>
  );
}

interface FilterValueInputProps {
  field: FilterFieldDefinition;
  operator: FilterOperator;
  value: FilterValue;
  onChange: (value: FilterValue) => void;
}

function FilterValueInput({
  field,
  operator,
  value,
  onChange,
}: FilterValueInputProps) {
  const isMultiSelect = ["in", "not_in"].includes(operator);

  switch (field.type) {
    case "text":
      return (
        <FilterTextInput
          field={field}
          operator={operator}
          value={value}
          onChange={onChange}
        />
      );
    case "number":
      return (
        <FilterNumberInput
          field={field}
          operator={operator}
          value={value}
          onChange={onChange}
        />
      );
    case "currency":
      return (
        <FilterCurrencyInput
          field={field}
          operator={operator}
          value={value}
          onChange={onChange}
        />
      );
    case "date":
    case "datetime":
      return (
        <FilterDateInput
          field={field}
          operator={operator}
          value={value}
          onChange={onChange}
        />
      );
    case "select":
      if (isMultiSelect) {
        return (
          <FilterMultiSelectInput
            field={field}
            operator={operator}
            value={value}
            onChange={onChange}
          />
        );
      }
      return (
        <FilterSelectInput
          field={field}
          operator={operator}
          value={value}
          onChange={onChange}
        />
      );
    case "multi-select":
      return (
        <FilterMultiSelectInput
          field={field}
          operator={operator}
          value={value}
          onChange={onChange}
        />
      );
    case "boolean":
      return null;
    default:
      return (
        <FilterTextInput
          field={field}
          operator={operator}
          value={value}
          onChange={onChange}
        />
      );
  }
}
