"use client";

import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import { CheckIcon, ChevronDownIcon, SearchIcon } from "lucide-react";
import { useMemo, type ReactNode } from "react";

import { Button } from "./button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxList,
  ComboboxTrigger,
  createComboboxItems,
} from "./combobox";
import { InputGroup, InputGroupAddon } from "./input-group";
import { mergeBaseUIClassName } from "../../lib/base-ui";

export type SearchableSelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type SearchableSelectProps = Pick<
  ComboboxPrimitive.Root.Props<string, false>,
  | "value"
  | "defaultValue"
  | "onValueChange"
  | "onOpenChange"
  | "disabled"
  | "name"
  | "readOnly"
  | "required"
> &
  Pick<
    ComboboxPrimitive.Trigger.Props,
    | "id"
    | "aria-label"
    | "aria-labelledby"
    | "aria-describedby"
    | "aria-invalid"
    | "className"
  > & {
    items: readonly SearchableSelectOption[];
    label?: ReactNode;
    labelClassName?: string;
    placeholder?: ReactNode;
    contentClassName?: string;
    searchLabel?: string;
    renderOption?: (option: SearchableSelectOption) => ReactNode;
  };

function SearchableSelect({
  items,
  label,
  labelClassName,
  placeholder = "Select...",
  contentClassName,
  searchLabel,
  renderOption,
  className,
  id,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  ...props
}: SearchableSelectProps) {
  const collection = useMemo(
    () =>
      createComboboxItems(items, {
        getValue: (item) => item.value,
        getLabel: (item) => item.label,
      }),
    [items],
  );
  const controlName = typeof label === "string" ? label : ariaLabel;

  return (
    <Combobox items={collection} {...props}>
      {label ? (
        <ComboboxPrimitive.Label className={labelClassName}>
          {label}
        </ComboboxPrimitive.Label>
      ) : null}
      <ComboboxTrigger
        id={id}
        {...(ariaLabel ? { "aria-label": ariaLabel } : {})}
        {...(ariaLabelledBy ? { "aria-labelledby": ariaLabelledBy } : {})}
        {...(ariaDescribedBy ? { "aria-describedby": ariaDescribedBy } : {})}
        {...(ariaInvalid !== undefined ? { "aria-invalid": ariaInvalid } : {})}
        render={<Button variant="outline" />}
        className={mergeBaseUIClassName(
          "h-9 w-full justify-between text-sm font-normal",
          className,
        )}
      >
        <ComboboxPrimitive.Value>
          {(value) => (
            <span className="truncate">
              {items.find((item) => item.value === value)?.label ?? placeholder}
            </span>
          )}
        </ComboboxPrimitive.Value>
        <ChevronDownIcon aria-hidden="true" data-icon="inline-end" />
      </ComboboxTrigger>
      <ComboboxContent
        aria-label={controlName ? `${controlName} options` : "Choose an option"}
        className={contentClassName}
      >
        <InputGroup className="m-2 mb-0 w-auto">
          <InputGroupAddon>
            <SearchIcon aria-hidden="true" />
          </InputGroupAddon>
          <ComboboxInput
            aria-label={
              searchLabel ??
              (controlName ? `Search ${controlName}` : "Search options")
            }
            placeholder="Search..."
          />
        </InputGroup>
        <ComboboxEmpty>No options found.</ComboboxEmpty>
        <ComboboxList>
          {(option: SearchableSelectOption) => (
            <ComboboxItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              <span className="min-w-0 flex-1 truncate">
                {renderOption ? renderOption(option) : option.label}
              </span>
              <ComboboxItemIndicator>
                <CheckIcon aria-hidden="true" className="size-4" />
              </ComboboxItemIndicator>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

export { SearchableSelect };
