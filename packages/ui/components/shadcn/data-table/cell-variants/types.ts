import type { Row, Cell } from "@tanstack/react-table";

export interface BaseCellProps<TData, TValue = unknown> {
  value: TValue;
  row: Row<TData>;
  cell: Cell<TData, TValue>;
  isEditing?: boolean;
  onValueChange?: (value: TValue) => void;
  onEditComplete?: () => void;
  onEditCancel?: () => void;
  className?: string;
  disabled?: boolean;
}

export interface TextCellProps<TData> extends BaseCellProps<
  TData,
  string | null
> {
  placeholder?: string;
  maxLength?: number;
  multiline?: boolean;
}

export interface NumberCellProps<TData> extends BaseCellProps<
  TData,
  number | null
> {
  format?: "decimal" | "integer" | "percent" | "currency";
  locale?: string;
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
}

export interface DateCellProps<TData> extends BaseCellProps<
  TData,
  Date | string | null
> {
  format?: string;
  showTime?: boolean;
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
}

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  color?: string;
  description?: string;
  disabled?: boolean;
}

export interface SelectCellProps<TData> extends BaseCellProps<
  TData,
  string | null
> {
  options: SelectOption[];
  placeholder?: string;
  searchable?: boolean;
  clearable?: boolean;
}

export interface MultiSelectCellProps<TData> extends BaseCellProps<
  TData,
  string[]
> {
  options: SelectOption[];
  placeholder?: string;
  maxItems?: number;
}

export type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "success"
  | "warning"
  | "info";

export interface BadgeOption {
  value: string;
  label: string;
  variant?: BadgeVariant;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

export interface BadgeCellProps<TData> extends BaseCellProps<
  TData,
  string | null
> {
  options?: BadgeOption[];
  variant?: BadgeVariant;
  showDot?: boolean;
}

export interface CheckboxCellProps<TData> extends BaseCellProps<
  TData,
  boolean
> {
  label?: string;
  indeterminate?: boolean;
}

export interface AvatarCellProps<TData> extends BaseCellProps<
  TData,
  string | null
> {
  name?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  subtitle?: string;
}

export interface ProgressCellProps<TData> extends BaseCellProps<TData, number> {
  max?: number;
  showLabel?: boolean;
  variant?: "default" | "success" | "warning" | "destructive";
  size?: "sm" | "md" | "lg";
}

export interface LinkCellProps<TData> extends BaseCellProps<
  TData,
  string | null
> {
  href?: string | ((value: string | null, row: TData) => string);
  target?: "_blank" | "_self" | "_parent" | "_top";
  truncate?: boolean;
  showIcon?: boolean;
}

export interface RatingCellProps<TData> extends BaseCellProps<TData, number> {
  max?: number;
  size?: "sm" | "md" | "lg";
  allowHalf?: boolean;
}

export interface CurrencyCellProps<TData> extends BaseCellProps<
  TData,
  number | null
> {
  currency?: string;
  locale?: string;
  showSymbol?: boolean;
}

export interface CellContext<TData, TValue = unknown> {
  row: Row<TData>;
  cell: Cell<TData, TValue>;
  getValue: () => TValue;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
}
