"use client";

import {
  DEFAULT_MERGE_TAG_REGISTRY,
  getMergeTagDefinitions,
} from "@asym/email/merge-tags";
import { Braces, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@asym/ui/components/shadcn/button";
import {
  DropdownMenuGroup,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@asym/ui/components/shadcn/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@asym/ui/components/shadcn/input-group";

export interface EmailStudioMergeTagMenuProps {
  onInsert: (key: string) => void;
  disabled?: boolean;
}

export function EmailStudioMergeTagMenu({
  onInsert,
  disabled,
}: EmailStudioMergeTagMenuProps) {
  const [query, setQuery] = useState("");
  const tags = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return getMergeTagDefinitions(DEFAULT_MERGE_TAG_REGISTRY).filter((tag) => {
      if (!normalized) return true;
      return (
        tag.key.toLowerCase().includes(normalized) ||
        tag.label.toLowerCase().includes(normalized) ||
        tag.category.toLowerCase().includes(normalized)
      );
    });
  }, [query]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className=""
            disabled={disabled}
          >
            <Braces className="size-3.5" />
            Merge tag
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Insert merge tag</DropdownMenuLabel>
          <div className="w-72 px-2 pb-2">
            <InputGroup>
              <InputGroupAddon>
                <Search aria-hidden="true" />
              </InputGroupAddon>
              <InputGroupInput
                aria-label="Search merge tags"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search tags"
              />
            </InputGroup>
          </div>

          <DropdownMenuSeparator />
          <div className="max-h-80 overflow-y-auto">
            {tags.map((tag) => (
              <DropdownMenuItem key={tag.key} onClick={() => onInsert(tag.key)}>
                <div className="flex flex-col items-start gap-0.5">
                  <span className="font-medium">{tag.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {"{{"}
                    {tag.key}
                    {"}}"} · {tag.category}
                  </span>
                </div>
              </DropdownMenuItem>
            ))}
            {tags.length === 0 && (
              <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                No matching tags
              </div>
            )}
          </div>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default EmailStudioMergeTagMenu;
