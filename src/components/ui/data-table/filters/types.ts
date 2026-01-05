export type FilterOperator =
  | "equals"
  | "not_equals"
  | "contains"
  | "not_contains"
  | "starts_with"
  | "ends_with"
  | "is_empty"
  | "is_not_empty"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "between"
  | "in"
  | "not_in"
  | "before"
  | "after"
  | "on_or_before"
  | "on_or_after"
  | "is_true"
  | "is_false"

export type FilterFieldType =
  | "text"
  | "number"
  | "date"
  | "datetime"
  | "select"
  | "multi-select"
  | "boolean"
  | "currency"

export type FilterLogicOperator = "and" | "or"

export interface FilterOption {
  value: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
  color?: string
  count?: number
}

export interface FilterFieldDefinition {
  id: string
  label: string
  type: FilterFieldType
  options?: FilterOption[]
  placeholder?: string
  operators?: FilterOperator[]
  defaultOperator?: FilterOperator
  currency?: string
  locale?: string
  min?: number
  max?: number
  step?: number
}

export interface FilterCondition {
  id: string
  field: string
  operator: FilterOperator
  value: FilterValue
}

export type FilterValue =
  | string
  | number
  | boolean
  | Date
  | string[]
  | number[]
  | { from: Date | null; to: Date | null }
  | { min: number | null; max: number | null }
  | null

export interface FilterGroup {
  id: string
  logic: FilterLogicOperator
  conditions: FilterCondition[]
  groups?: FilterGroup[]
}

export interface AdvancedFilterState {
  logic: FilterLogicOperator
  conditions: FilterCondition[]
  groups: FilterGroup[]
}

export interface SavedFilter {
  id: string
  name: string
  description?: string
  filter: AdvancedFilterState
  isDefault?: boolean
  createdAt: Date
  updatedAt: Date
}

export interface DateRangePreset {
  id: string
  label: string
  getValue: () => { from: Date; to: Date }
}

export const OPERATOR_LABELS: Record<FilterOperator, string> = {
  equals: "equals",
  not_equals: "does not equal",
  contains: "contains",
  not_contains: "does not contain",
  starts_with: "starts with",
  ends_with: "ends with",
  is_empty: "is empty",
  is_not_empty: "is not empty",
  gt: "greater than",
  gte: "greater than or equal",
  lt: "less than",
  lte: "less than or equal",
  between: "is between",
  in: "is any of",
  not_in: "is none of",
  before: "is before",
  after: "is after",
  on_or_before: "is on or before",
  on_or_after: "is on or after",
  is_true: "is true",
  is_false: "is false",
}

export const OPERATORS_BY_TYPE: Record<FilterFieldType, FilterOperator[]> = {
  text: [
    "equals",
    "not_equals",
    "contains",
    "not_contains",
    "starts_with",
    "ends_with",
    "is_empty",
    "is_not_empty",
  ],
  number: [
    "equals",
    "not_equals",
    "gt",
    "gte",
    "lt",
    "lte",
    "between",
    "is_empty",
    "is_not_empty",
  ],
  currency: [
    "equals",
    "not_equals",
    "gt",
    "gte",
    "lt",
    "lte",
    "between",
    "is_empty",
    "is_not_empty",
  ],
  date: [
    "equals",
    "not_equals",
    "before",
    "after",
    "on_or_before",
    "on_or_after",
    "between",
    "is_empty",
    "is_not_empty",
  ],
  datetime: [
    "equals",
    "not_equals",
    "before",
    "after",
    "on_or_before",
    "on_or_after",
    "between",
    "is_empty",
    "is_not_empty",
  ],
  select: ["equals", "not_equals", "in", "not_in", "is_empty", "is_not_empty"],
  "multi-select": ["in", "not_in", "is_empty", "is_not_empty"],
  boolean: ["is_true", "is_false"],
}

export const VALUE_LESS_OPERATORS: FilterOperator[] = [
  "is_empty",
  "is_not_empty",
  "is_true",
  "is_false",
]

export function getDefaultOperator(type: FilterFieldType): FilterOperator {
  switch (type) {
    case "text":
      return "contains"
    case "number":
    case "currency":
      return "equals"
    case "date":
    case "datetime":
      return "after"
    case "select":
      return "equals"
    case "multi-select":
      return "in"
    case "boolean":
      return "is_true"
    default:
      return "equals"
  }
}

export function createFilterCondition(
  field: FilterFieldDefinition,
  operator?: FilterOperator,
  value?: FilterValue
): FilterCondition {
  return {
    id: crypto.randomUUID(),
    field: field.id,
    operator: operator ?? field.defaultOperator ?? getDefaultOperator(field.type),
    value: value ?? getDefaultValue(field.type, operator),
  }
}

export function getDefaultValue(
  type: FilterFieldType,
  operator?: FilterOperator
): FilterValue {
  if (operator && VALUE_LESS_OPERATORS.includes(operator)) {
    return null
  }

  switch (type) {
    case "text":
      return ""
    case "number":
    case "currency":
      return null
    case "date":
    case "datetime":
      return null
    case "select":
      return ""
    case "multi-select":
      return []
    case "boolean":
      return true
    default:
      return null
  }
}

export function createEmptyFilterState(): AdvancedFilterState {
  return {
    logic: "and",
    conditions: [],
    groups: [],
  }
}

export function createFilterGroup(
  logic: FilterLogicOperator = "and"
): FilterGroup {
  return {
    id: crypto.randomUUID(),
    logic,
    conditions: [],
    groups: [],
  }
}

export function serializeFilter(filter: AdvancedFilterState): string {
  return JSON.stringify(filter, (key, value) => {
    if (value instanceof Date) {
      return { __type: "Date", value: value.toISOString() }
    }
    return value
  })
}

export function deserializeFilter(str: string): AdvancedFilterState | null {
  try {
    return JSON.parse(str, (key, value) => {
      if (value && typeof value === "object" && value.__type === "Date") {
        return new Date(value.value)
      }
      return value
    })
  } catch {
    return null
  }
}

export function isFilterActive(filter: AdvancedFilterState): boolean {
  return filter.conditions.length > 0 || filter.groups.length > 0
}

export function countActiveFilters(filter: AdvancedFilterState): number {
  let count = filter.conditions.length
  for (const group of filter.groups) {
    count += countActiveFiltersInGroup(group)
  }
  return count
}

function countActiveFiltersInGroup(group: FilterGroup): number {
  let count = group.conditions.length
  if (group.groups) {
    for (const g of group.groups) {
      count += countActiveFiltersInGroup(g)
    }
  }
  return count
}
