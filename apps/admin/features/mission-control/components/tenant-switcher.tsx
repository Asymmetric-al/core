"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@asym/ui/components/shadcn/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@asym/ui/components/shadcn/popover";
import { cn } from "@asym/ui/lib/utils";
import { Building2, ChevronsUpDown, Check } from "lucide-react";
import { useState, useCallback, memo, useId } from "react";

import { useMC } from "../context";

import type { Tenant } from "@asym/database/types";

const STUB_TENANTS: Tenant[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    name: "asymmetric.al",
    slug: "asymmetric-al",
    org_post_visibility: "all_donors",
    org_settings: {},
    stripe_secret_key: null,
    stripe_publishable_key: null,
    stripe_webhook_secret: null,
    billing_email: null,
    default_timezone: "UTC",
    locale: "en-US",
    created_at: "",
    updated_at: "",
  },
];

export const TenantSwitcher = memo(function TenantSwitcher() {
  const [open, setOpen] = useState(false);
  const listboxId = useId();
  const { tenant } = useMC();
  const [selectedTenant, setSelectedTenant] = useState(tenant);

  const tenants = STUB_TENANTS;

  const handleSelect = useCallback((t: Tenant) => {
    setSelectedTenant(t);
    setOpen(false);
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          className="h-9 w-48 justify-between"
        >
          <div className="flex items-center gap-2 truncate">
            <Building2 className="size-4 shrink-0" />
            <span className="truncate">
              {selectedTenant?.name || "Select tenant..."}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-0">
        <Command>
          <CommandInput popoverChrome placeholder="Search tenant..." />
          <CommandList id={listboxId}>
            <CommandEmpty>No tenant found.</CommandEmpty>
            <CommandGroup>
              {tenants.map((t) => (
                <CommandItem key={t.id} onSelect={() => handleSelect(t)}>
                  <Check
                    className={cn(
                      "mr-2 size-4",
                      selectedTenant?.id === t.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {t.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
});
