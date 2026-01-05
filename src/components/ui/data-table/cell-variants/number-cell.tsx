"use client"

import { useState, useRef, useLayoutEffect, useCallback, useMemo } from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import type { NumberCellProps } from "./types"

function NumberCellEditor<TData>({
  value,
  onValueChange,
  onEditComplete,
  onEditCancel,
  className,
  disabled = false,
  min,
  max,
  step = 1,
}: Pick<NumberCellProps<TData>, "value" | "onValueChange" | "onEditComplete" | "onEditCancel" | "className" | "disabled" | "min" | "max" | "step">) {
  const [localValue, setLocalValue] = useState(value?.toString() ?? "")
  const inputRef = useRef<HTMLInputElement>(null)

  useLayoutEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault()
        const numValue = localValue === "" ? null : parseFloat(localValue)
        if (numValue !== null && !isNaN(numValue)) {
          const clampedValue = Math.max(
            min ?? -Infinity,
            Math.min(max ?? Infinity, numValue)
          )
          onValueChange?.(clampedValue)
        } else if (localValue === "") {
          onValueChange?.(null)
        }
        onEditComplete?.()
      } else if (e.key === "Escape") {
        e.preventDefault()
        onEditCancel?.()
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        const current = parseFloat(localValue) || 0
        const newValue = Math.min(max ?? Infinity, current + step)
        setLocalValue(newValue.toString())
      } else if (e.key === "ArrowDown") {
        e.preventDefault()
        const current = parseFloat(localValue) || 0
        const newValue = Math.max(min ?? -Infinity, current - step)
        setLocalValue(newValue.toString())
      }
    },
    [localValue, min, max, step, onValueChange, onEditComplete, onEditCancel]
  )

  const handleBlur = useCallback(() => {
    const numValue = localValue === "" ? null : parseFloat(localValue)
    if (numValue !== null && !isNaN(numValue)) {
      const clampedValue = Math.max(
        min ?? -Infinity,
        Math.min(max ?? Infinity, numValue)
      )
      onValueChange?.(clampedValue)
    } else if (localValue === "") {
      onValueChange?.(null)
    }
    onEditComplete?.()
  }, [localValue, min, max, onValueChange, onEditComplete])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    if (inputValue === "" || inputValue === "-" || /^-?\d*\.?\d*$/.test(inputValue)) {
      setLocalValue(inputValue)
    }
  }, [])

  return (
    <Input
      ref={inputRef}
      type="text"
      inputMode="decimal"
      value={localValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      className={cn(
        "h-8 px-2 py-1 text-sm text-right tabular-nums border-primary/50 focus-visible:ring-1",
        className
      )}
      disabled={disabled}
    />
  )
}

export function NumberCell<TData>({
  value,
  isEditing = false,
  onValueChange,
  onEditComplete,
  onEditCancel,
  className,
  disabled = false,
  format = "decimal",
  locale = "en-US",
  currency = "USD",
  minimumFractionDigits,
  maximumFractionDigits,
  min,
  max,
  step = 1,
  prefix,
  suffix,
}: NumberCellProps<TData>) {
  const formattedValue = useMemo(() => {
    if (value === null || value === undefined) return null

    const options: Intl.NumberFormatOptions = {}

    switch (format) {
      case "currency":
        options.style = "currency"
        options.currency = currency
        break
      case "percent":
        options.style = "percent"
        options.minimumFractionDigits = minimumFractionDigits ?? 0
        options.maximumFractionDigits = maximumFractionDigits ?? 2
        break
      case "integer":
        options.maximumFractionDigits = 0
        break
      case "decimal":
      default:
        options.minimumFractionDigits = minimumFractionDigits
        options.maximumFractionDigits = maximumFractionDigits
        break
    }

    try {
      const formatter = new Intl.NumberFormat(locale, options)
      return formatter.format(format === "percent" ? value / 100 : value)
    } catch {
      return value.toString()
    }
  }, [value, format, locale, currency, minimumFractionDigits, maximumFractionDigits])

  if (isEditing && !disabled) {
    return (
      <NumberCellEditor
        value={value}
        onValueChange={onValueChange}
        onEditComplete={onEditComplete}
        onEditCancel={onEditCancel}
        className={className}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
      />
    )
  }

  const displayValue = formattedValue !== null ? (
    <>
      {prefix && <span className="text-muted-foreground">{prefix}</span>}
      {formattedValue}
      {suffix && <span className="text-muted-foreground">{suffix}</span>}
    </>
  ) : (
    <span className="text-muted-foreground italic">—</span>
  )

  return (
    <span
      className={cn(
        "block truncate text-sm text-right tabular-nums",
        className
      )}
      title={value?.toString()}
    >
      {displayValue}
    </span>
  )
}
