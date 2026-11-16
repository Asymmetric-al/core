"use client";

import {
  useLocaleFormat,
  type LocaleFormatters,
} from "@asym/lib/hooks/use-locale-format";
import { PlusIcon, FilterIcon, XIcon } from "lucide-react";
import { type ComponentProps, Fragment, useCallback } from "react";

import { cn } from "@asym/ui/lib/utils";

import { FilterRow } from "./filter-row";
import {
  type AdvancedFilterState,
  type FilterConditionGroup,
  type FilterFieldDefinition,
  type FilterCondition,
  type FilterOperator,
  type FilterValue,
  createFilterCondition,
  createEmptyFilterState,
  countActiveFilters,
  filterGroupsOf,
  filterStateOfGroups,
  getDefaultOperator,
  getDefaultValue,
} from "./types";
import { Badge } from "../../badge";
import { Button } from "../../button";
import { Popover, PopoverContent, PopoverTrigger } from "../../popover";
import { Separator } from "../../separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "../../sheet";

interface FilterBuilderProps {
  fields: FilterFieldDefinition[];
  value: AdvancedFilterState;
  onChange: (filter: AdvancedFilterState) => void;
  className?: string;
  variant?: "popover" | "sheet" | "inline";
  align?: "start" | "center" | "end";
  /**
   * Edit an OR of AND groups ("(A and B) or C") instead of one flat AND/OR
   * list. Only for consumers whose query can express groups; the state then
   * carries `groups` (see `filterStateOfGroups`).
   */
  allowGroups?: boolean;
}

export function FilterBuilder({
  fields,
  value,
  onChange,
  className,
  variant = "popover",
  align = "start",
  allowGroups = false,
}: FilterBuilderProps) {
  const activeCount = countActiveFilters(value);

  const content = allowGroups ? (
    <FilterGroupsContent fields={fields} value={value} onChange={onChange} />
  ) : (
    <FilterBuilderContent fields={fields} value={value} onChange={onChange} />
  );

  if (variant === "inline") {
    return <div className={className}>{content}</div>;
  }

  if (variant === "sheet") {
    return (
      <Sheet>
        <SheetTrigger
          render={
            <FilterTriggerButton
              activeCount={activeCount}
              className={className}
            />
          }
        />
        <SheetContent side="right" className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Advanced Filters</SheetTitle>
            <SheetDescription>
              Add conditions to filter your data. Multiple conditions can be
              combined with AND/OR logic.
            </SheetDescription>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto p-4">{content}</div>
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
      <PopoverTrigger
        render={
          <FilterTriggerButton
            activeCount={activeCount}
            className={className}
          />
        }
      />
      <PopoverContent className="w-100" align={align}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Filters</h4>
            {activeCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onChange(createEmptyFilterState())}
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

interface FilterTriggerButtonProps extends ComponentProps<typeof Button> {
  activeCount: number;
}

/**
 * Used as a Base UI trigger `render` target; the trigger's merged props
 * (click handler, ARIA wiring, ref) arrive as regular props and must be
 * forwarded to the underlying `Button` or the trigger never opens.
 */
function FilterTriggerButton({
  activeCount,
  className,
  ...props
}: FilterTriggerButtonProps) {
  return (
    <Button variant="outline" size="sm" className={className} {...props}>
      <FilterIcon className="size-4" />
      <span>Filters</span>
      {activeCount > 0 && <Badge variant="secondary">{activeCount}</Badge>}
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
    return <NoFiltersState onAdd={addCondition} />;
  }

  return (
    <div className="space-y-2">
      {value.conditions.map((condition, index) => (
        <div key={condition.id}>
          {index > 0 && (
            <div className="flex items-center gap-2 py-1">
              <Separator className="flex-1" />
              <Button variant="ghost" size="xs" onClick={toggleLogic}>
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
            showRemove
          />
        </div>
      ))}
      <Button
        variant="ghost"
        size="sm"
        onClick={addCondition}
        className="w-full"
      >
        <PlusIcon className="size-4 mr-1" />
        Add filter
      </Button>
    </div>
  );
}

function NoFiltersState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-6 text-center">
      <FilterIcon className="size-8 text-muted-foreground/50 mb-2" />
      <p className="text-sm text-muted-foreground mb-3">No filters applied</p>
      <Button variant="outline" size="sm" onClick={onAdd}>
        <PlusIcon className="size-4 mr-1" />
        Add filter
      </Button>
    </div>
  );
}

/** The word joining the rows or groups on either side of it. */
function LogicDivider({ label }: { label: "AND" | "OR" }) {
  return (
    <div className="flex items-center gap-2 py-1">
      <Separator className="flex-1" />
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <Separator className="flex-1" />
    </div>
  );
}

/**
 * The grouped builder: conditions in a group are joined by AND, groups by
 * OR, so a row shows when it matches every condition of any one group.
 * "And" adds a condition to its group; "Or" starts a new group. Removing a
 * group's last condition removes the group.
 */
function FilterGroupsContent({
  fields,
  value,
  onChange,
}: FilterBuilderContentProps) {
  const groups = filterGroupsOf(value);
  const commit = (next: FilterConditionGroup[]) =>
    onChange(filterStateOfGroups(next));
  const newCondition = () => {
    const firstField = fields[0];
    return firstField ? createFilterCondition(firstField) : null;
  };
  const addToGroup = (groupId: string) => {
    const condition = newCondition();
    if (!condition) return;
    commit(
      groups.map((group) =>
        group.id === groupId
          ? { ...group, conditions: [...group.conditions, condition] }
          : group,
      ),
    );
  };
  const addGroup = () => {
    const condition = newCondition();
    if (!condition) return;
    commit([
      ...groups,
      { id: `group-${condition.id}`, conditions: [condition] },
    ]);
  };
  const updateCondition = (
    conditionId: string,
    updates: Partial<FilterCondition>,
  ) =>
    commit(
      groups.map((group) => ({
        ...group,
        conditions: group.conditions.map((condition) =>
          condition.id === conditionId
            ? { ...condition, ...updates }
            : condition,
        ),
      })),
    );
  const removeCondition = (conditionId: string) =>
    commit(
      groups.map((group) => ({
        ...group,
        conditions: group.conditions.filter(
          (condition) => condition.id !== conditionId,
        ),
      })),
    );
  const changeField = (conditionId: string, fieldId: string) => {
    const field = fields.find((candidate) => candidate.id === fieldId);
    if (!field) return;
    const operator = field.defaultOperator ?? getDefaultOperator(field.type);
    updateCondition(conditionId, {
      field: fieldId,
      operator,
      value: getDefaultValue(field.type, operator),
    });
  };

  if (groups.length === 0) {
    return <NoFiltersState onAdd={addGroup} />;
  }

  // One group reads as a plain list; frames and the rule only appear once
  // there is an OR between groups to explain.
  const framed = groups.length > 1;
  return (
    <div className="space-y-2">
      {framed ? (
        <p className="text-xs text-muted-foreground">
          Shows rows that match every condition in at least one group.
        </p>
      ) : null}
      {groups.map((group, groupIndex) => (
        <Fragment key={group.id}>
          {groupIndex > 0 ? <LogicDivider label="OR" /> : null}
          <div
            role={framed ? "group" : undefined}
            aria-label={
              framed
                ? `Condition group ${groupIndex + 1} of ${groups.length}`
                : undefined
            }
            className={cn(
              "space-y-2",
              framed && "rounded-lg border bg-muted/30 p-3",
            )}
          >
            {group.conditions.map((condition, index) => (
              <div key={condition.id}>
                {index > 0 ? <LogicDivider label="AND" /> : null}
                <FilterRow
                  condition={condition}
                  fields={fields}
                  onFieldChange={(fieldId) =>
                    changeField(condition.id, fieldId)
                  }
                  onOperatorChange={(operator) =>
                    updateCondition(condition.id, { operator })
                  }
                  onValueChange={(next) =>
                    updateCondition(condition.id, { value: next })
                  }
                  onRemove={() => removeCondition(condition.id)}
                  showRemove
                />
              </div>
            ))}
            {framed ? (
              <AddConditionButton
                groupNumber={groupIndex + 1}
                onClick={() => addToGroup(group.id)}
              />
            ) : null}
          </div>
        </Fragment>
      ))}
      {/* One group: both adds share a row. Several: each group adds its
          own condition, and the OR group button follows them. */}
      <div className="flex flex-wrap items-center gap-2">
        {framed ? null : (
          <AddConditionButton onClick={() => addToGroup(groups[0]!.id)} />
        )}
        <Button variant="outline" size="sm" onClick={addGroup}>
          <PlusIcon aria-hidden="true" />
          Add OR group
        </Button>
      </div>
    </div>
  );
}

/**
 * Adds an AND condition to a group. In a framed group the name says which
 * group, since every group has one.
 */
function AddConditionButton({
  groupNumber,
  onClick,
}: {
  groupNumber?: number;
  onClick: () => void;
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      aria-label={
        groupNumber === undefined
          ? undefined
          : `Add condition to group ${groupNumber}`
      }
      onClick={onClick}
    >
      <PlusIcon aria-hidden="true" />
      Add condition
    </Button>
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
  const { formatDate } = useLocaleFormat();
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
          <Badge key={condition.id} variant="secondary">
            {index > 0 && (
              <span className="text-xs text-muted-foreground mr-1">
                {value.logic.toUpperCase()}
              </span>
            )}
            <span className="font-medium">{field.label}</span>
            <span className="text-muted-foreground mx-1">
              {getOperatorLabel(condition.operator)}
            </span>
            <span>{formatFilterValue(condition.value, field, formatDate)}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => removeCondition(condition.id)}
              aria-label={`Remove ${field.label} filter`}
              className="ml-1"
            >
              <XIcon className="size-3" />
            </Button>
          </Badge>
        );
      })}
      {value.conditions.length > 1 && (
        <Button variant="ghost" size="sm" onClick={clearAll}>
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
  formatDate: LocaleFormatters["formatDate"],
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
      const from = value.from ? formatDate(value.from) : "...";
      const to = value.to ? formatDate(value.to) : "...";
      return `${from} - ${to}`;
    }
    if ("min" in value && "max" in value) {
      const min = value.min !== null ? value.min : "...";
      const max = value.max !== null ? value.max : "...";
      return `${min} - ${max}`;
    }
  }

  if (value instanceof Date) {
    return formatDate(value);
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
