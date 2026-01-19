"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === "Tab") {
      onEndEdit();
    }
    if (e.key === "Escape") {
      onEndEdit();
    }
  };

  const cellClassName = cn(
    "h-full w-full px-3 py-2 text-sm border-0 outline-none",
    "focus:ring-2 focus:ring-primary focus:ring-inset",
    isSelected && "bg-primary/5 ring-2 ring-primary/30 ring-inset",
    className,
  );

  if (cellType === "readonly") {
    return (
      <div className={cn(cellClassName, "cursor-default select-none")}>
        {String(value ?? "")}
      </div>
    );
  }

  if (cellType === "checkbox") {
    return (
      <div className={cn(cellClassName, "flex items-center justify-center")}>
        <Checkbox
          checked={Boolean(value)}
          onCheckedChange={(checked) => onChange(checked)}
        />
      </div>
    );
  }

  if (cellType === "select" && options) {
    if (!isEditing && !isSelected) {
      const selectedOption = options.find((opt) => opt.value === value);
      return (
        <div
          className={cn(cellClassName, "cursor-pointer")}
          onClick={onStartEdit}
        >
          {selectedOption?.label ?? String(value ?? "")}
        </div>
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
        <SelectTrigger className={cn(cellClassName, "border-0 h-full")}>
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

  if (!isEditing) {
    return (
      <div
        className={cn(cellClassName, "cursor-cell truncate")}
        onDoubleClick={onStartEdit}
        onClick={isSelected ? onStartEdit : undefined}
      >
        {cellType === "number" && typeof value === "number"
          ? value.toLocaleString()
          : cellType === "date" && value
            ? new Date(String(value)).toLocaleDateString()
            : String(value ?? "")}
      </div>
    );
  }

  return (
    <Input
      ref={inputRef}
      type={
        cellType === "number" ? "number" : cellType === "date" ? "date" : "text"
      }
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
        cellClassName,
        "rounded-none bg-white",
        "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0",
      )}
    />
  );
}
