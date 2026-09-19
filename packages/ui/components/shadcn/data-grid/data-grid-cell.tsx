"use client";

import { useLocaleFormat } from "@asym/lib/hooks/use-locale-format";
import * as React from "react";

import { cn } from "@asym/ui/lib/utils";

import { Checkbox } from "../checkbox";
import { Input } from "../input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../select";

import type { DataGridCellType, DataGridColumnOption } from "./types";

interface DataGridCellProps {
  value: unknown;
  cellType: DataGridCellType;
  isEditing: boolean;
  isSelected: boolean;
  options?: DataGridColumnOption[];
  placeholder?: string;
  onChange: (value: unknown) => void;
  onStartEdit: () => void;
  onEndEdit: () => void;
  className?: string;
}

function formatDataGridDisplayValue(
  cellType: DataGridCellType,
  value: unknown,
  formatDate: (value: string) => string,
): string {
  switch (cellType) {
    case "number":
      return typeof value === "number"
        ? value.toLocaleString()
        : String(value ?? "");
    case "date":
      return value ? formatDate(String(value)) : String(value ?? "");
    case "text":
    case "select":
    case "checkbox":
    case "file":
    case "readonly":
      return String(value ?? "");
    default: {
      const _exhaustive: never = cellType;
      return _exhaustive;
    }
  }
}

function dataGridInputType(
  cellType: DataGridCellType,
): "number" | "date" | "text" {
  switch (cellType) {
    case "number":
      return "number";
    case "date":
      return "date";
    case "text":
    case "select":
    case "checkbox":
    case "file":
    case "readonly":
      return "text";
    default: {
      const _exhaustive: never = cellType;
      return _exhaustive;
    }
  }
}

function DataGridReadonlyCell({
  value,
  className,
}: {
  value: unknown;
  className: string;
}) {
  return (
    <div className={cn(className, "cursor-default select-none")}>
      {String(value ?? "")}
    </div>
  );
}

function DataGridCheckboxCell({
  value,
  onChange,
  className,
}: {
  value: unknown;
  onChange: (value: unknown) => void;
  className: string;
}) {
  return (
    <div className={cn(className, "flex items-center justify-center")}>
      <Checkbox
        checked={Boolean(value)}
        onCheckedChange={(checked) => onChange(checked)}
      />
    </div>
  );
}

function DataGridSelectCell({
  value,
  options,
  placeholder,
  isEditing,
  isSelected,
  onChange,
  onStartEdit,
  onEndEdit,
  className,
}: {
  value: unknown;
  options: DataGridColumnOption[];
  placeholder?: string;
  isEditing: boolean;
  isSelected: boolean;
  onChange: (value: unknown) => void;
  onStartEdit: () => void;
  onEndEdit: () => void;
  className: string;
}) {
  if (!isEditing && !isSelected) {
    const selectedOption = options.find((opt) => opt.value === value);
    return (
      <button
        type="button"
        className={cn(className, "block cursor-pointer text-left")}
        onClick={onStartEdit}
      >
        {selectedOption?.label ?? String(value ?? "")}
      </button>
    );
  }

  return (
    <Select
      value={String(value ?? "")}
      onValueChange={(val) => {
        onChange(val);
        onEndEdit();
      }}
      open={isEditing}
      onOpenChange={(open) => !open && onEndEdit()}
    >
      <SelectTrigger className={cn(className, "border-0 h-full")}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="rounded-xl">
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="rounded-lg"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function DataGridDisplayCell({
  value,
  cellType,
  isSelected,
  onStartEdit,
  className,
}: {
  value: unknown;
  cellType: DataGridCellType;
  isSelected: boolean;
  onStartEdit: () => void;
  className: string;
}) {
  const { formatDate } = useLocaleFormat();

  return (
    <button
      type="button"
      className={cn(className, "block cursor-cell truncate text-left")}
      onDoubleClick={onStartEdit}
      onClick={isSelected ? onStartEdit : undefined}
      onKeyDown={(e) => {
        // Enter/Space start editing even before the cell is selected.
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onStartEdit();
        }
      }}
    >
      {formatDataGridDisplayValue(cellType, value, formatDate)}
    </button>
  );
}

function DataGridEditingInput({
  value,
  cellType,
  placeholder,
  onChange,
  onEndEdit,
  className,
}: {
  value: unknown;
  cellType: DataGridCellType;
  placeholder?: string;
  onChange: (value: unknown) => void;
  onEndEdit: () => void;
  className: string;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === "Tab") {
      onEndEdit();
    }
    if (e.key === "Escape") {
      onEndEdit();
    }
  };

  return (
    <Input
      ref={inputRef}
      type={dataGridInputType(cellType)}
      value={String(value ?? "")}
      onChange={(e) => {
        const newValue =
          cellType === "number"
            ? parseFloat(e.target.value) || 0
            : e.target.value;
        onChange(newValue);
      }}
      onBlur={onEndEdit}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      className={cn(
        className,
        "rounded-none bg-background",
        "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0",
      )}
    />
  );
}

export function DataGridCell({
  value,
  cellType,
  isEditing,
  isSelected,
  options,
  placeholder,
  onChange,
  onStartEdit,
  onEndEdit,
  className,
}: DataGridCellProps) {
  const cellClassName = cn(
    "h-full w-full px-3 py-2 text-sm border-0 outline-none",
    "focus:ring-2 focus:ring-primary focus:ring-inset",
    isSelected && "bg-primary/5 ring-2 ring-primary/30 ring-inset",
    className,
  );

  if (cellType === "readonly") {
    return <DataGridReadonlyCell value={value} className={cellClassName} />;
  }

  if (cellType === "checkbox") {
    return (
      <DataGridCheckboxCell
        value={value}
        onChange={onChange}
        className={cellClassName}
      />
    );
  }

  if (cellType === "select" && options) {
    return (
      <DataGridSelectCell
        value={value}
        options={options}
        placeholder={placeholder}
        isEditing={isEditing}
        isSelected={isSelected}
        onChange={onChange}
        onStartEdit={onStartEdit}
        onEndEdit={onEndEdit}
        className={cellClassName}
      />
    );
  }

  if (!isEditing) {
    return (
      <DataGridDisplayCell
        value={value}
        cellType={cellType}
        isSelected={isSelected}
        onStartEdit={onStartEdit}
        className={cellClassName}
      />
    );
  }

  return (
    <DataGridEditingInput
      value={value}
      cellType={cellType}
      placeholder={placeholder}
      onChange={onChange}
      onEndEdit={onEndEdit}
      className={cellClassName}
    />
  );
}
