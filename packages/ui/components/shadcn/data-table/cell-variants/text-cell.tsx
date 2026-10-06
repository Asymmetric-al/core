"use client";

import { useState, useRef, useLayoutEffect, useCallback } from "react";

import { cn } from "@asym/ui/lib/utils";

import { cellEditorAccessibleName } from "./accessible-name";
import { Input } from "../../input";
import { Textarea } from "../../textarea";

import type { RowData } from "../tanstack";
import type { TextCellProps } from "./types";

function TextCellEditor<TData extends RowData>({
  cell,
  value,
  onValueChange,
  onEditComplete,
  onEditCancel,
  className,
  disabled = false,
  placeholder = "Enter text...",
  maxLength,
  multiline = false,
}: Omit<TextCellProps<TData>, "isEditing"> & { isEditing: true }) {
  const [localValue, setLocalValue] = useState(value ?? "");
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setLocalValue(e.target.value);
    },
    [],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        onValueChange?.(localValue || null);
        onEditComplete?.();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onEditCancel?.();
      }
    },
    [localValue, onValueChange, onEditComplete, onEditCancel],
  );

  const handleTextBlur = useCallback(() => {
    onValueChange?.(localValue || null);
    onEditComplete?.();
  }, [localValue, onValueChange, onEditComplete]);

  const commonProps = {
    "aria-label": cellEditorAccessibleName(cell),
    value: localValue,
    placeholder,
    maxLength,
    className: cn(
      "h-8 min-h-0 px-2 py-1 text-sm border-primary/50 focus-visible:ring-1",
      className,
    ),
    disabled,
  };

  if (multiline) {
    return (
      <Textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        aria-label={commonProps["aria-label"]}
        value={commonProps.value}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        onBlur={handleTextBlur}
        placeholder={commonProps.placeholder}
        maxLength={commonProps.maxLength}
        disabled={commonProps.disabled}
        rows={2}
        className={cn(commonProps.className, "resize-none")}
      />
    );
  }

  return (
    <Input
      ref={inputRef as React.RefObject<HTMLInputElement>}
      type="text"
      aria-label={commonProps["aria-label"]}
      value={commonProps.value}
      onChange={handleTextChange}
      onKeyDown={handleKeyDown}
      onBlur={handleTextBlur}
      placeholder={commonProps.placeholder}
      maxLength={commonProps.maxLength}
      disabled={commonProps.disabled}
      className={commonProps.className}
    />
  );
}

export function TextCell<TData extends RowData>({
  cell,
  row,
  value,
  isEditing = false,
  onValueChange,
  onEditComplete,
  onEditCancel,
  className,
  disabled = false,
  placeholder = "Enter text...",
  maxLength,
  multiline = false,
}: TextCellProps<TData>) {
  if (isEditing && !disabled) {
    return (
      <TextCellEditor
        value={value}
        onValueChange={onValueChange}
        onEditComplete={onEditComplete}
        onEditCancel={onEditCancel}
        className={className}
        disabled={disabled}
        placeholder={placeholder}
        maxLength={maxLength}
        multiline={multiline}
        isEditing
        row={row}
        cell={cell}
      />
    );
  }

  return (
    <span
      className={cn(
        "block truncate text-sm",
        !value && "text-muted-foreground italic",
        className,
      )}
      title={value ?? undefined}
    >
      {value || placeholder}
    </span>
  );
}
