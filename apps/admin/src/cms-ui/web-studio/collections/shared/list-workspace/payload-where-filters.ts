import {
  filterGroupsOf,
  filterStateOfGroups,
} from "@asym/ui/components/shadcn/data-table";
import { isFieldDisabled } from "payload/shared";

import { columnLabel } from "./payload-list-grid";

import type {
  AdvancedFilterState,
  FilterCondition,
  FilterFieldDefinition,
  FilterOperator,
  FilterOption,
  FilterValue,
} from "@asym/ui/components/shadcn/data-table";
import type { Where } from "payload";

/**
 * Bridges Core's shared filter builder and Payload's list query.
 *
 * The Studio list used Payload's `WhereBuilder` through a deep import. That
 * module tree reads Payload's providers from separate files, not from the
 * client bundle the admin providers come from, so it saw no translations and
 * no permissions: operators showed raw keys ("operators:equals") and only the
 * ID field was offered. The shared `FilterBuilder` is Core's owner for this
 * UI; these helpers describe a collection's fields to it and translate its
 * state to and from Payload's `where`.
 */

type PayloadFieldLike = {
  type?: string;
  name?: string;
  label?: unknown;
  hasMany?: boolean;
  options?: unknown[];
  relationTo?: string | string[];
  fields?: unknown[];
  tabs?: unknown[];
  admin?: {
    hidden?: boolean;
    /** Payload 4: `true`, or per area (`filter`, `groupBy`, `column`). */
    disabled?: unknown;
  } | null;
};

const TEXT_OPERATORS: FilterOperator[] = [
  "contains",
  "equals",
  "not_equals",
  "not_contains",
  "is_empty",
  "is_not_empty",
];
const NUMBER_OPERATORS: FilterOperator[] = [
  "equals",
  "not_equals",
  "gt",
  "gte",
  "lt",
  "lte",
  "between",
  "is_empty",
  "is_not_empty",
];
const DATE_OPERATORS: FilterOperator[] = [
  "after",
  "before",
  "on_or_after",
  "on_or_before",
  "between",
  "is_empty",
  "is_not_empty",
];
const SELECT_OPERATORS: FilterOperator[] = [
  "equals",
  "not_equals",
  "in",
  "not_in",
  "is_empty",
  "is_not_empty",
];
const MULTI_SELECT_OPERATORS: FilterOperator[] = [
  "in",
  "not_in",
  "is_empty",
  "is_not_empty",
];

const TEXT_TYPES = new Set(["text", "textarea", "email", "code"]);
const SELECT_TYPES = new Set(["select", "radio"]);
const LAYOUT_TYPES = new Set(["row", "collapsible"]);

const STATUS_OPTIONS: FilterOption[] = [
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
];

function humanize(name: string): string {
  const words = name
    .replace(/^_+/, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim()
    .toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function readLabel(label: unknown, fallback: string): string {
  if (typeof label === "string" && label.trim()) return label;
  if (label && typeof label === "object") {
    const record = label as Record<string, unknown>;
    const value = record.en ?? Object.values(record)[0];
    if (typeof value === "string" && value.trim()) return value;
  }
  return humanize(fallback);
}

function readOptions(options: unknown[] | undefined): FilterOption[] {
  return (options ?? []).flatMap((option) => {
    if (typeof option === "string") {
      return [{ label: humanize(option), value: option }];
    }
    if (option && typeof option === "object") {
      const { label, value } = option as { label?: unknown; value?: unknown };
      if (typeof value !== "string") return [];
      return [{ label: readLabel(label, value), value }];
    }
    return [];
  });
}

/** Related documents offered for each relationship field, by field name. */
export type RelationshipFilterOptions = Readonly<
  Record<string, readonly FilterOption[]>
>;

function toDefinition(
  field: PayloadFieldLike,
  relationshipOptions: RelationshipFilterOptions = {},
): FilterFieldDefinition | null {
  const { name, type } = field;
  if (!name || !type) return null;
  if (field.admin?.hidden || isFieldDisabled(field, "filter")) return null;
  // The same label the grid's column shows (sentence case for Payload's
  // generated labels, "Page type" not "Page Type").
  const label = name === "_status" ? "Status" : columnLabel(field, name);

  // A relationship to one collection filters by the related document (its
  // id); a polymorphic relationship has no single list to choose from.
  if (type === "relationship" && typeof field.relationTo === "string") {
    const options = [...(relationshipOptions[name] ?? [])];
    return field.hasMany
      ? {
          id: name,
          label,
          type: "multi-select",
          options,
          operators: MULTI_SELECT_OPERATORS,
        }
      : {
          id: name,
          label,
          type: "select",
          options,
          operators: SELECT_OPERATORS,
        };
  }

  if (TEXT_TYPES.has(type)) {
    return { id: name, label, type: "text", operators: TEXT_OPERATORS };
  }
  if (type === "number") {
    return { id: name, label, type: "number", operators: NUMBER_OPERATORS };
  }
  if (type === "date") {
    return { id: name, label, type: "date", operators: DATE_OPERATORS };
  }
  if (type === "checkbox") {
    return { id: name, label, type: "boolean" };
  }
  if (SELECT_TYPES.has(type)) {
    const options =
      name === "_status" ? STATUS_OPTIONS : readOptions(field.options);
    return field.hasMany
      ? {
          id: name,
          label,
          type: "multi-select",
          options,
          operators: MULTI_SELECT_OPERATORS,
        }
      : {
          id: name,
          label,
          type: "select",
          options,
          operators: SELECT_OPERATORS,
        };
  }
  return null;
}

/**
 * A collection's named top-level fields: layout fields (row, collapsible,
 * unnamed tabs) are flattened; named tabs and groups nest their fields under
 * their own name, so they are not top-level paths.
 */
function topLevelFields(fields: readonly unknown[]): PayloadFieldLike[] {
  const out: PayloadFieldLike[] = [];
  const visit = (list: readonly unknown[]) => {
    for (const raw of list) {
      if (!raw || typeof raw !== "object") continue;
      const field = raw as PayloadFieldLike;
      if (field.type && LAYOUT_TYPES.has(field.type) && !field.name) {
        visit(field.fields ?? []);
        continue;
      }
      if (field.type === "tabs") {
        for (const tab of field.tabs ?? []) {
          const { name, fields: tabFields } = (tab ?? {}) as PayloadFieldLike;
          if (!name) visit(tabFields ?? []);
        }
        continue;
      }
      if (field.name && !out.some((existing) => existing.name === field.name)) {
        out.push(field);
      }
    }
  };
  visit(fields);
  return out;
}

function collect(
  fields: unknown[],
  into: FilterFieldDefinition[],
  relationshipOptions: RelationshipFilterOptions,
): void {
  for (const field of topLevelFields(fields)) {
    const definition = toDefinition(field, relationshipOptions);
    if (definition) into.push(definition);
  }
}

/** The filterable top-level fields of a collection, for `FilterBuilder`. */
export function payloadFilterFields(
  fields: readonly unknown[],
  {
    hasDrafts,
    relationshipOptions = {},
  }: { hasDrafts: boolean; relationshipOptions?: RelationshipFilterOptions },
): FilterFieldDefinition[] {
  const definitions: FilterFieldDefinition[] = [];
  collect(
    fields.filter(
      (field) => (field as PayloadFieldLike | null)?.name !== "_status",
    ),
    definitions,
    relationshipOptions,
  );
  if (hasDrafts) {
    const status = toDefinition({
      name: "_status",
      type: "select",
      options: [],
    });
    if (status) definitions.push(status);
  }
  return definitions;
}

function startOfDay(value: Date): Date {
  const day = new Date(value);
  day.setHours(0, 0, 0, 0);
  return day;
}

function endOfDay(value: Date): Date {
  const day = new Date(value);
  day.setHours(23, 59, 59, 999);
  return day;
}

function asDate(value: FilterValue): Date | null {
  if (value instanceof Date)
    return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === "string" && value) {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/** One condition as a Payload operator object, or null while incomplete. */
function toOperatorObject(
  condition: FilterCondition,
  definition: FilterFieldDefinition,
): Record<string, unknown> | null {
  const { operator, value } = condition;
  switch (operator) {
    case "is_empty":
      return { exists: false };
    case "is_not_empty":
      return { exists: true };
    case "is_true":
      return { equals: true };
    case "is_false":
      return { equals: false };
    default:
      break;
  }

  if (definition.type === "date") {
    if (operator === "between") {
      const range = (value ?? {}) as { from?: unknown; to?: unknown };
      const from = asDate((range.from ?? null) as FilterValue);
      const to = asDate((range.to ?? null) as FilterValue);
      if (!from || !to) return null;
      return {
        greater_than_equal: startOfDay(from).toISOString(),
        less_than_equal: endOfDay(to).toISOString(),
      };
    }
    const day = asDate(value);
    if (!day) return null;
    switch (operator) {
      case "before":
        return { less_than: startOfDay(day).toISOString() };
      case "after":
        return { greater_than: endOfDay(day).toISOString() };
      case "on_or_before":
        return { less_than_equal: endOfDay(day).toISOString() };
      case "on_or_after":
        return { greater_than_equal: startOfDay(day).toISOString() };
      default:
        return null;
    }
  }

  if (definition.type === "number") {
    if (operator === "between") {
      const range = (value ?? {}) as { min?: unknown; max?: unknown };
      const min = asNumber(range.min);
      const max = asNumber(range.max);
      if (min === null || max === null) return null;
      return { greater_than_equal: min, less_than_equal: max };
    }
    const number = asNumber(value);
    if (number === null) return null;
    const key = {
      equals: "equals",
      not_equals: "not_equals",
      gt: "greater_than",
      gte: "greater_than_equal",
      lt: "less_than",
      lte: "less_than_equal",
    }[operator as string];
    return key ? { [key]: number } : null;
  }

  if (operator === "in" || operator === "not_in") {
    const list = Array.isArray(value)
      ? value.filter((item) => item !== "")
      : [];
    return list.length > 0 ? { [operator]: list } : null;
  }

  const text = typeof value === "string" ? value.trim() : "";
  if (!text) return null;
  switch (operator) {
    case "equals":
    case "not_equals":
      return { [operator]: text };
    case "contains":
      return { like: text };
    case "not_contains":
      return { not_like: text };
    default:
      return null;
  }
}

/**
 * The filter state as a Payload `where`, in Payload's own `or`/`and` shape
 * (an OR of AND groups): AND joins every condition in one group, OR gives
 * each condition its own group, and the grouped builder's groups each stay
 * one group. Conditions still missing a value are left out, and so is a
 * group left with none.
 */
export function filterStateToWhere(
  state: AdvancedFilterState,
  definitions: readonly FilterFieldDefinition[],
): Where {
  const byId = new Map(definitions.map((field) => [field.id, field]));
  const groups = filterGroupsOf(state).flatMap((group) => {
    const clauses = group.conditions.flatMap((condition) => {
      const definition = byId.get(condition.field);
      const operatorObject = definition
        ? toOperatorObject(condition, definition)
        : null;
      return operatorObject
        ? [{ [condition.field]: operatorObject } as Where]
        : [];
    });
    return clauses.length > 0 ? [{ and: clauses }] : [];
  });
  return groups.length > 0 ? { or: groups } : {};
}

const DATE_READERS: Record<string, FilterOperator> = {
  less_than: "before",
  greater_than: "after",
  less_than_equal: "on_or_before",
  greater_than_equal: "on_or_after",
};
const NUMBER_READERS: Record<string, FilterOperator> = {
  equals: "equals",
  not_equals: "not_equals",
  greater_than: "gt",
  greater_than_equal: "gte",
  less_than: "lt",
  less_than_equal: "lte",
};

function readCondition(
  field: string,
  operatorObject: unknown,
  definition: FilterFieldDefinition,
): Omit<FilterCondition, "id"> | null {
  if (!operatorObject || typeof operatorObject !== "object") return null;
  const entries = Object.entries(operatorObject as Record<string, unknown>);
  const keys = entries.map(([key]) => key).sort();
  const make = (operator: FilterOperator, value: FilterValue) => ({
    field,
    operator,
    value,
  });

  if (
    keys.length === 2 &&
    keys[0] === "greater_than_equal" &&
    keys[1] === "less_than_equal"
  ) {
    const record = operatorObject as Record<string, unknown>;
    if (definition.type === "date") {
      const from = asDate(record.greater_than_equal as FilterValue);
      const to = asDate(record.less_than_equal as FilterValue);
      return from && to ? make("between", { from, to }) : null;
    }
    if (definition.type === "number") {
      const min = asNumber(record.greater_than_equal);
      const max = asNumber(record.less_than_equal);
      return min !== null && max !== null
        ? make("between", { min, max })
        : null;
    }
    return null;
  }
  if (entries.length !== 1) return null;
  const [[key, value]] = entries as [[string, unknown]];

  if (key === "exists" && typeof value === "boolean") {
    return make(value ? "is_not_empty" : "is_empty", null);
  }
  if (definition.type === "boolean") {
    return key === "equals" && typeof value === "boolean"
      ? make(value ? "is_true" : "is_false", null)
      : null;
  }
  if (definition.type === "date") {
    const operator = DATE_READERS[key];
    const day = asDate(value as FilterValue);
    return operator && day ? make(operator, day) : null;
  }
  if (definition.type === "number") {
    const operator = NUMBER_READERS[key];
    const number = asNumber(value);
    return operator && number !== null ? make(operator, number) : null;
  }
  // Choices hold string values; Payload's numeric document ids (from a link
  // or a saved preference) read as the same choice.
  const choice = (item: unknown) =>
    typeof item === "number" &&
    (definition.type === "select" || definition.type === "multi-select")
      ? String(item)
      : item;
  if ((key === "in" || key === "not_in") && Array.isArray(value)) {
    const items = value.map(choice);
    if (!items.every((item): item is string => typeof item === "string")) {
      return null;
    }
    return make(key, items);
  }
  const text = choice(value);
  if (typeof text !== "string") return null;
  switch (key) {
    case "equals":
    case "not_equals":
      return make(key, text);
    case "like":
    case "contains":
      return definition.type === "text" ? make("contains", text) : null;
    case "not_like":
      return definition.type === "text" ? make("not_contains", text) : null;
    default:
      return null;
  }
}

/**
 * The field clauses of a list of where clauses. A clause that nests its own
 * `and`/`or` cannot be shown as one flat row, so it marks the read as lossy.
 */
function readClauses(clauses: unknown[]): {
  pairs: Array<[string, unknown]>;
  lossy: boolean;
} {
  let lossy = false;
  const pairs = clauses.flatMap((clause) => {
    if (!clause || typeof clause !== "object") {
      lossy = true;
      return [];
    }
    return Object.entries(clause as Record<string, unknown>).filter(([key]) => {
      const nested = key === "and" || key === "or";
      if (nested) lossy = true;
      return !nested;
    });
  });
  return { pairs, lossy };
}

function readWhere(
  where: unknown,
  definitions: readonly FilterFieldDefinition[],
): { state: AdvancedFilterState; exact: boolean } {
  const byId = new Map(definitions.map((field) => [field.id, field]));
  // The where as an OR of AND groups of field clauses: Payload's own shape,
  // which the grouped builder shows group by group.
  let pairGroups: Array<Array<[string, unknown]>> = [];
  let exact = true;

  if (where && typeof where === "object") {
    const record = where as { or?: unknown; and?: unknown };
    // A clause beside an `or` or `and` list (a root `_status` next to the
    // groups, a key next to a group's `and`) has no row in the builder;
    // editing would silently drop it, so such a where is not editable.
    const besideList = (value: unknown, list: "or" | "and") =>
      Object.keys(value as Record<string, unknown>).some((key) => key !== list);
    const clauseGroups = Array.isArray(record.or)
      ? record.or.map((group) => {
          const and = (group as { and?: unknown } | null)?.and;
          if (!Array.isArray(and)) return [group];
          if (besideList(group, "and")) exact = false;
          return and;
        })
      : [Array.isArray(record.and) ? record.and : [where]];
    if (Array.isArray(record.or) && besideList(record, "or")) exact = false;
    if (
      !Array.isArray(record.or) &&
      Array.isArray(record.and) &&
      besideList(record, "and")
    ) {
      exact = false;
    }
    const read = clauseGroups.map((group) => readClauses(group));
    if (read.some((group) => group.lossy)) exact = false;
    // An empty group beside others matches every document; dropping it
    // would narrow the list, so such a where is not shown as editable.
    if (read.length > 1 && read.some((group) => group.pairs.length === 0)) {
      exact = false;
    }
    pairGroups = read.map((group) => group.pairs);
  }

  let index = 0;
  const groups = pairGroups.map((pairs, groupIndex) => ({
    id: `where-group-${groupIndex}`,
    conditions: pairs.flatMap(([field, operatorObject]): FilterCondition[] => {
      const id = `where-${index++}-${field}`;
      const definition = byId.get(field);
      const condition = definition
        ? readCondition(field, operatorObject, definition)
        : null;
      if (!condition) {
        exact = false;
        return [];
      }
      return [{ id, ...condition }];
    }),
  }));
  return { state: filterStateOfGroups(groups), exact };
}

/**
 * The filter state a Payload `where` describes, for the shapes the Studio
 * writes and plain field queries a URL may carry. Clauses the builder cannot
 * show (unknown fields, operators, nesting) are dropped rather than misread;
 * check `canEditWhere` before letting the builder rewrite such a where.
 */
export function whereToFilterState(
  where: unknown,
  definitions: readonly FilterFieldDefinition[],
): AdvancedFilterState {
  return readWhere(where, definitions).state;
}

/**
 * Whether the builder shows this where exactly. When it does not (nesting
 * deeper than an OR of AND groups, an empty group, or clauses it cannot
 * show), editing it in the builder would change its meaning, so the list
 * offers to clear it instead.
 */
export function canEditWhere(
  where: unknown,
  definitions: readonly FilterFieldDefinition[],
): boolean {
  return readWhere(where, definitions).exact;
}

/** Field types Payload's list can group by (its own GroupBy element's set). */
/**
 * Field types that form groups. Payload can also group by free text (text,
 * textarea, email), but nearly every document would then be its own group.
 */
const GROUP_BY_TYPES = new Set([
  "number",
  "select",
  "relationship",
  "date",
  "checkbox",
  "radio",
  "upload",
]);

/** A field the list can be grouped by. */
export interface GroupByFieldOption {
  id: string;
  label: string;
}

/** The fields a collection's list can be grouped by, for the Group by menu. */
export function payloadGroupByFields(
  fields: readonly unknown[],
  { hasDrafts }: { hasDrafts: boolean },
): GroupByFieldOption[] {
  const options = topLevelFields(
    fields.filter(
      (field) => (field as PayloadFieldLike | null)?.name !== "_status",
    ),
  ).flatMap((field) =>
    field.name &&
    field.type &&
    GROUP_BY_TYPES.has(field.type) &&
    !field.admin?.hidden &&
    !isFieldDisabled(field, "groupBy")
      ? [{ id: field.name, label: columnLabel(field, field.name) }]
      : [],
  );
  return hasDrafts ? [...options, { id: "_status", label: "Status" }] : options;
}
