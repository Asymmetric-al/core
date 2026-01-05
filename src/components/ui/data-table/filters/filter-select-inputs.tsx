"use client"

import { useState, useMemo, useCallback } from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { FilterFieldDefinition, FilterOperator, FilterValue } from "./types"

interface FilterSelectInputProps {
  field: FilterFieldDefinition
  operator: FilterOperator
  value: FilterValue
  onChange: (value: FilterValue) => void
  className?: string
}

export function FilterSelectInput({
  field,
  value,
  onChange,
  className,
}: FilterSelectInputProps) {
  const [open, setOpen] = useState(false)
  
  const options = useMemo(() => field.options ?? [], [field.options])

  const selectedOption = useMemo(() => {
    return options.find((opt) => opt.value === value)
  }, [options, value])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "h-8 w-[180px] justify-between px-2 text-sm font-normal",
            !selectedOption && "text-muted-foreground",
            className
          )}
        >
          <span className="truncate">
            {selectedOption ? (
              <span className="flex items-center gap-2">
                {selectedOption.icon && (
                  <selectedOption.icon className="size-3.5 shrink-0" />
                )}
                {selectedOption.label}
              </span>
            ) : (
              field.placeholder ?? "Select..."
            )}
          </span>
          <ChevronsUpDown className="ml-2 size-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search..." className="h-8" />
          <CommandList>
            <CommandEmpty>No options found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => {
                    onChange(option.value === value ? "" : option.value)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 size-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.icon && (
                    <option.icon className="mr-2 size-4 text-muted-foreground" />
                  )}
                  <span>{option.label}</span>
                  {option.count !== undefined && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      {option.count}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export function FilterMultiSelectInput({
  field,
  value,
  onChange,
  className,
}: FilterSelectInputProps) {
  const [open, setOpen] = useState(false)
  
  const options = useMemo(() => field.options ?? [], [field.options])
  const selectedValues = useMemo(() => (value as string[]) ?? [], [value])

  const selectedOptions = useMemo(() => {
    return options.filter((opt) => selectedValues.includes(opt.value))
  }, [options, selectedValues])

  const toggleOption = useCallback(
    (optionValue: string) => {
      const newValues = selectedValues.includes(optionValue)
        ? selectedValues.filter((v) => v !== optionValue)
        : [...selectedValues, optionValue]
      onChange(newValues)
    },
    [selectedValues, onChange]
  )

  const removeValue = useCallback(
    (optionValue: string, e: React.MouseEvent) => {
      e.stopPropagation()
      onChange(selectedValues.filter((v) => v !== optionValue))
    },
    [selectedValues, onChange]
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "h-auto min-h-8 w-[240px] justify-between px-2 text-sm font-normal",
            !selectedOptions.length && "text-muted-foreground",
            className
          )}
        >
          {selectedOptions.length > 0 ? (
            <div className="flex flex-wrap gap-1 py-0.5">
              {selectedOptions.length <= 2 ? (
                selectedOptions.map((option) => (
                  <Badge
                    key={option.value}
                    variant="secondary"
                    className="rounded-md px-1.5 py-0 text-xs font-normal"
                  >
                    {option.label}
                    <button
                      type="button"
                      onClick={(e) => removeValue(option.value, e)}
                      className="ml-1 rounded-full hover:bg-muted-foreground/20"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))
              ) : (
                <Badge
                  variant="secondary"
                  className="rounded-md px-1.5 py-0 text-xs font-normal"
                >
                  {selectedOptions.length} selected
                </Badge>
              )}
            </div>
          ) : (
            <span>{field.placeholder ?? "Select options..."}</span>
          )}
          <ChevronsUpDown className="ml-2 size-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search..." className="h-8" />
          <CommandList>
            <CommandEmpty>No options found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValues.includes(option.value)
                return (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => toggleOption(option.value)}
                  >
                    <div
                      className={cn(
                        "mr-2 flex size-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50"
                      )}
                    >
                      {isSelected && <Check className="size-3" />}
                    </div>
                    {option.icon && (
                      <option.icon className="mr-2 size-4 text-muted-foreground" />
                    )}
                    <span>{option.label}</span>
                    {option.count !== undefined && (
                      <span className="ml-auto text-xs text-muted-foreground">
                        {option.count}
                      </span>
                    )}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
        {selectedValues.length > 0 && (
          <div className="border-t p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onChange([])}
              className="w-full h-7 text-xs"
            >
              Clear all
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
