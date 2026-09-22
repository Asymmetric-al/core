"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import { Button } from "@asym/ui/components/shadcn/button";
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
} from "@asym/ui/components/shadcn/combobox";
import { InputGroup } from "@asym/ui/components/shadcn/input-group";
import { cn } from "@asym/ui/lib/utils";
import { Check, ChevronsUpDown, Loader2, User, X } from "lucide-react";
import { useId, useMemo, useRef } from "react";

export interface TaskPartner {
  avatar_url?: string;
  email?: string;
  id: string;
  name: string;
}

export interface TaskPartnerSelectProps {
  donors: TaskPartner[];
  value: string;
  loading: boolean;
  onChange: (value: string) => void;
  onBlur?: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function PartnerAvatar({
  donor,
  size,
}: {
  donor: TaskPartner;
  size: "sm" | "md";
}) {
  return (
    <Avatar className={size === "sm" ? "size-6" : "size-8"}>
      <AvatarImage src={donor.avatar_url || undefined} />
      <AvatarFallback className="bg-muted text-[10px] font-bold">
        {donor.name
          .split(" ")
          .map((name) => name[0])
          .join("")
          .slice(0, 2)}
      </AvatarFallback>
    </Avatar>
  );
}

export function TaskPartnerSelect({
  donors,
  value,
  loading,
  onChange,
  onBlur,
  open,
  onOpenChange,
}: TaskPartnerSelectProps) {
  const labelId = useId();
  const hintId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selectedDonor = donors.find((donor) => donor.id === value);
  const items = useMemo(
    () =>
      createComboboxItems(donors, {
        getValue: (donor) => donor.id,
        getLabel: (donor) => donor.name,
      }),
    [donors],
  );

  return (
    <div className="grid gap-2">
      <span
        id={labelId}
        className="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
      >
        Associated Partner
      </span>
      <Combobox
        items={items}
        value={value || null}
        open={open}
        onOpenChange={onOpenChange}
        onValueChange={(nextValue) => {
          onChange(nextValue === value ? "" : (nextValue ?? ""));
          onBlur?.();
        }}
        filter={(donor, query) =>
          `${donor.name} ${donor.email ?? ""}`
            .toLocaleLowerCase()
            .includes(query.trim().toLocaleLowerCase())
        }
      >
        <div className="flex min-w-0 items-center gap-2">
          <ComboboxTrigger
            ref={triggerRef}
            aria-labelledby={labelId}
            aria-describedby={hintId}
            render={<Button variant="outline" />}
            className={cn(
              "h-12 min-w-0 flex-1 justify-between rounded-xl border-transparent bg-muted font-medium hover:bg-accent",
              !value && "text-muted-foreground",
            )}
          >
            {selectedDonor ? (
              <span className="flex min-w-0 items-center gap-2">
                <PartnerAvatar donor={selectedDonor} size="sm" />
                <span className="truncate">{selectedDonor.name}</span>
              </span>
            ) : (
              <span className="flex min-w-0 items-center gap-2">
                <User className="size-4" />
                <span className="truncate">Select partner (optional)</span>
              </span>
            )}
            <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
          </ComboboxTrigger>
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Clear associated partner"
              onClick={() => {
                onChange("");
                triggerRef.current?.focus();
              }}
            >
              <X aria-hidden="true" />
            </Button>
          )}
        </div>
        <ComboboxContent
          aria-labelledby={labelId}
          className="w-[400px] rounded-xl p-0"
        >
          <InputGroup className="m-2 w-auto">
            <ComboboxInput
              aria-label="Search partners"
              placeholder="Search partners..."
            />
          </InputGroup>
          <ComboboxEmpty>
            {loading ? (
              <span
                role="status"
                className="flex items-center justify-center gap-2"
              >
                <Loader2 className="size-4 animate-spin" />
                Loading partners...
              </span>
            ) : (
              "No partners found."
            )}
          </ComboboxEmpty>
          <ComboboxList>
            {(donor: TaskPartner) => (
              <ComboboxItem
                key={donor.id}
                value={donor.id}
                className="rounded-lg"
              >
                <PartnerAvatar donor={donor} size="md" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {donor.name}
                  </span>
                  {donor.email && (
                    <span className="block truncate text-xs text-muted-foreground">
                      {donor.email}
                    </span>
                  )}
                </span>
                <ComboboxItemIndicator>
                  <Check className="size-4 shrink-0" />
                </ComboboxItemIndicator>
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <p id={hintId} className="text-xs text-muted-foreground">
        Link this task to a specific partner for easy tracking
      </p>
    </div>
  );
}
