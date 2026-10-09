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
  DropdownMenuEmpty,
  DropdownMenuFilterProvider,
  DropdownMenuInput,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuList,
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
    <DropdownMenuFilterProvider
      filter={null}
      value={query}
      onValueChange={setQuery}
    >
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
        <DropdownMenuContent align="end" aria-label="Insert merge tag">
          <div className="w-72 px-2 pb-2">
            <InputGroup>
              <InputGroupAddon>
                <Search aria-hidden="true" />
              </InputGroupAddon>
              <DropdownMenuInput
                aria-label="Search merge tags"
                placeholder="Search tags"
                render={<InputGroupInput />}
              />
            </InputGroup>
          </div>

          <DropdownMenuSeparator />
          <DropdownMenuEmpty>No matching tags</DropdownMenuEmpty>
          <div className="max-h-80 overflow-y-auto">
            <DropdownMenuList>
              <DropdownMenuGroup>
                <DropdownMenuLabel>Insert merge tag</DropdownMenuLabel>
                {tags.map((tag) => (
                  <DropdownMenuItem
                    key={tag.key}
                    onClick={() => onInsert(tag.key)}
                  >
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
              </DropdownMenuGroup>
            </DropdownMenuList>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </DropdownMenuFilterProvider>
  );
}

export default EmailStudioMergeTagMenu;
