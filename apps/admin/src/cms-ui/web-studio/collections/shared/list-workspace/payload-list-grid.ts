import type { SortingState } from "@asym/ui/components/data-grid-panel";

/** TanStack column visibility: column id → shown. */
export type ColumnVisibility = Record<string, boolean>;

/** Payload column state as `TableColumnsProvider` exposes it. */
export type PayloadListColumn = {
  accessor: string;
  active: boolean;
  field?: unknown;
  renderedCells?: unknown[];
};

/** Payload adds these for its own table chrome (selection, drag, polymorphic type). */
const PAYLOAD_INTERNAL_COLUMNS = new Set([
  "_select",
  "_dragHandle",
  "collection",
]);

/** Field types Payload's own `SortColumn` refuses to sort. */
const UNSORTABLE_FIELD_TYPES = new Set([
  "array",
  "blocks",
  "group",
  "join",
  "ui",
]);

export function isDataColumn(column: PayloadListColumn): boolean {
  return !PAYLOAD_INTERNAL_COLUMNS.has(column.accessor);
}

export function isSortableField(field: unknown): boolean {
  if (!field || typeof field !== "object") return false;
  const candidate = field as { type?: unknown; virtual?: unknown };
  if (candidate.virtual === true) return false;
  return !UNSORTABLE_FIELD_TYPES.has(String(candidate.type));
}

function humanize(accessor: string): string {
  const words = accessor
    .replace(/^_+/, "")
    .replace(/[-_.]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** Words kept upper case when a generated label is put in sentence case. */
const ACRONYMS = new Set(["api", "id", "seo", "url"]);

function compact(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** "Missionary Id" → "Missionary ID", "Updated At" → "Updated at". */
function sentenceCase(label: string): string {
  return label
    .split(/\s+/)
    .map((word, index) => {
      const lower = word.toLowerCase();
      if (ACRONYMS.has(lower)) return lower.toUpperCase();
      return index === 0
        ? lower.charAt(0).toUpperCase() + lower.slice(1)
        : lower;
    })
    .join(" ");
}

/**
 * A column heading in the Studio's sentence case. Payload generates a label
 * from the field name in Title Case ("Missionary Id", "Updated At"); those
 * read as "Missionary ID" and "Updated at" here. A label that is not the
 * field name's generated form was written by the collection's author and is
 * kept as written. Labels may be strings or per-language records.
 */
export function columnLabel(field: unknown, accessor: string): string {
  const raw =
    field && typeof field === "object" && "label" in field
      ? (field as { label?: unknown }).label
      : undefined;
  const label =
    typeof raw === "string"
      ? raw
      : raw && typeof raw === "object"
        ? Object.values(raw as Record<string, unknown>).find(
            (value): value is string =>
              typeof value === "string" && value.length > 0,
          )
        : undefined;
  if (!label) return sentenceCase(humanize(accessor));
  return compact(label) === compact(accessor) ? sentenceCase(label) : label;
}

/** First key of Payload's `sort` query (`-updatedAt`, `title,-slug`). */
export function parsePayloadSort(sort: unknown): SortingState {
  const value = Array.isArray(sort) ? sort[0] : sort;
  if (typeof value !== "string") return [];
  const first = value.split(",")[0]?.trim() ?? "";
  if (first === "" || first === "-") return [];
  return first.startsWith("-")
    ? [{ id: first.slice(1), desc: true }]
    : [{ id: first, desc: false }];
}

export function toPayloadSort(sorting: SortingState): string | null {
  const [first] = sorting;
  if (!first) return null;
  return first.desc ? `-${first.id}` : first.id;
}

export function visibilityFromColumns(
  columns: PayloadListColumn[],
): ColumnVisibility {
  return Object.fromEntries(
    columns.map((column) => [column.accessor, column.active]),
  );
}

/** Accessors Payload should keep active, in Payload's own column order. */
export function activeAccessors(
  columns: PayloadListColumn[],
  visibility: ColumnVisibility,
  alwaysActive: string,
): string[] {
  return columns
    .filter(
      (column) =>
        column.accessor === alwaysActive ||
        (visibility[column.accessor] ?? column.active),
    )
    .map((column) => column.accessor);
}

/** Conditions in a Payload `where` built by the list where-builder. */
export function countWhereConditions(where: unknown): number {
  if (!where || typeof where !== "object") return 0;
  const or = (where as { or?: unknown }).or;
  if (Array.isArray(or)) {
    return or.reduce<number>((total, group) => {
      const and = (group as { and?: unknown } | null)?.and;
      return total + (Array.isArray(and) ? and.length : 0);
    }, 0);
  }
  const and = (where as { and?: unknown }).and;
  if (Array.isArray(and)) return and.length;
  return Object.keys(where).length;
}

/** Field types whose cells Payload renders from more than the stored value. */
const CUSTOM_CELL_TYPES = new Set(["join", "ui"]);

/**
 * Whether a document's field is stored empty. Payload renders those cells as
 * "<No Slug>"; the Studio grid shows its own muted dash, as it does for
 * unrendered cells. A key the document does not carry (a nested or virtual
 * column) is not known to be empty, so Payload's cell stands.
 */
export function isEmptyCell(
  doc: Record<string, unknown>,
  accessor: string,
  fieldType: string | null,
): boolean {
  if (fieldType === null || CUSTOM_CELL_TYPES.has(fieldType)) return false;
  if (!Object.hasOwn(doc, accessor)) return false;
  const value = doc[accessor];
  return (
    value === null ||
    value === undefined ||
    value === "" ||
    (Array.isArray(value) && value.length === 0)
  );
}

/** Text for a cell Payload has not rendered yet (a column just switched on). */
export function plainCellValue(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return null;
}

export function resolveDocumentThumbnail(
  doc: Record<string, unknown>,
): string | null {
  if (typeof doc.thumbnailURL === "string" && doc.thumbnailURL) {
    return doc.thumbnailURL;
  }
  const sizes = doc.sizes as
    Record<string, { url?: unknown } | undefined> | undefined;
  const sized = sizes?.thumbnail?.url;
  if (typeof sized === "string" && sized) return sized;
  if (
    typeof doc.url === "string" &&
    doc.url &&
    typeof doc.mimeType === "string" &&
    doc.mimeType.startsWith("image/")
  ) {
    return doc.url;
  }
  return null;
}

/** Field type of a Payload list column (`date`, `text`, ...), if known. */
export function columnFieldType(field: unknown): string | null {
  if (!field || typeof field !== "object") return null;
  const type = (field as { type?: unknown }).type;
  return typeof type === "string" ? type : null;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** A raw reference ID (a missionary or fund UUID) stored in a text field. */
export function isReferenceId(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

/**
 * "5b0c2a52…0a01": the first and last characters of a reference ID. IDs
 * minted together often share a long prefix, so cutting only the end would
 * show identical cells for different records.
 */
export function shortReferenceId(value: string): string {
  return value.length > 13 ? `${value.slice(0, 8)}…${value.slice(-4)}` : value;
}

/** The sort Payload applies when the list has none (no `defaultSort` set). */
export const PAYLOAD_FALLBACK_SORT = "-createdAt";

const DEFAULT_SORT_LABELS: Record<string, string> = {
  "-createdAt": "newest first",
  createdAt: "oldest first",
  "-updatedAt": "recently updated",
  updatedAt: "least recently updated",
};

/**
 * Words for the collection's default order in the card list's Sort menu:
 * "Default (newest first)". An unrecognised default reads "Default order".
 */
export function defaultSortLabel(sort: string): string {
  const description = DEFAULT_SORT_LABELS[sort];
  return description ? `Default (${description})` : "Default order";
}

/** List-cell dates: "Nov 7, 2026, 9:06 PM" on one line. */
export const LIST_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
};

/**
 * The ISO value of a list-cell date, or null when the cell holds no valid
 * date. The label itself is formatted where it renders (`ViewerDate`), in
 * the viewer's time zone, instead of Payload's long admin format.
 */
export function listDateValue(value: unknown): string | null {
  if (typeof value !== "string" && !(value instanceof Date)) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return typeof value === "string" ? value : date.toISOString();
}

/*
 * Column sizes: what each kind of cell needs on one line, plus the cell's
 * 24px padding. The table lays columns out by content; these sizes are what
 * the panel's "auto" view adds up to decide whether the table fits or the
 * list turns to cards, so they follow the content rather than TanStack's
 * 150px default (which sent a 1024px window to cards with room to spare).
 */

/** The record's name, wrapping at its readable minimum (min-w-32). */
export const PRIMARY_COLUMN_SIZE = 152;
/** One status badge ("Published"). */
export const STATUS_COLUMN_SIZE = 100;

const COLUMN_SIZES: Record<string, number> = {
  // "Nov 7, 2026, 9:06 PM" on one line.
  date: 172,
  // A related document's name ("E2E Tenant").
  relationship: 104,
  select: 128,
  radio: 128,
  number: 96,
  checkbox: 96,
};

/** The size a Payload column's cells need (see above). */
export function gridColumnSize(field: unknown, accessor: string): number {
  const type = columnFieldType(field);
  // A missionary or fund: its name, or the short ID, with a copy button.
  if (type === "text" && /Id$/.test(accessor)) return 144;
  return (type && COLUMN_SIZES[type]) || 152;
}

/*
 * A heading never wraps, so a column is at least as wide as its label: about
 * 7.5px a character at the header's text size, the cell's 24px padding, and
 * 28px for the sort button's icon and gap. "Organization" needs 142px, more
 * than an organization's name; leaving it out let the 1024 table scroll.
 */
const HEADING_CHARACTER_WIDTH = 7.5;
const HEADING_PADDING = 24;
const HEADING_SORT_ICON = 28;

/** The size a column needs for its cells and its heading. */
export function gridColumnSizeWithHeading(
  field: unknown,
  accessor: string,
  heading: string,
  sortable: boolean,
): number {
  const headingSize = Math.ceil(
    heading.length * HEADING_CHARACTER_WIDTH +
      HEADING_PADDING +
      (sortable ? HEADING_SORT_ICON : 0),
  );
  return Math.max(gridColumnSize(field, accessor), headingSize);
}
