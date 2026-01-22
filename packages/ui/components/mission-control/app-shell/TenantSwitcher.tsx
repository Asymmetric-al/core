"use client";

import { useState, useCallback, useMemo, memo } from "react";
import { Building2, ChevronsUpDown, Check } from "lucide-react";
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
import { cn } from "@asym/lib/utils";
import { useMC } from "@/lib/mission-control/context";
import type { Tenant } from "@/lib/mission-control/types";

const STUB_TENANTS: Tenant[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    name: "asymmetric.al",
    slug: "asymmetric-al",
  },
];

export const TenantSwitcher = memo(function TenantSwitcher() {
  const [open, setOpen] = useState(false);
  const { tenant } = useMC();
  const [selectedTenant, setSelectedTenant] = useState(tenant);

  const tenants = useMemo(() => STUB_TENANTS, []);

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
          className="h-9 w-48 justify-between"
        >
          <div className="flex items-center gap-2 truncate">
            <Building2 className="h-4 w-4 shrink-0" />
            <span className="truncate">
              {selectedTenant?.name || "Select tenant..."}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-0">
        <Command>
          <CommandInput placeholder="Search tenant..." />
          <CommandList>
            <CommandEmpty>No tenant found.</CommandEmpty>
            <CommandGroup>
              {tenants.map((t) => (
                <CommandItem key={t.id} onSelect={() => handleSelect(t)}>
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
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
