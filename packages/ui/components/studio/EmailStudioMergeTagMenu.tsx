"use client";

import {
  DEFAULT_MERGE_TAG_REGISTRY,
  getMergeTagDefinitions,
} from "@asym/email/merge-tags";
import { Braces, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@asym/ui/components/shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@asym/ui/components/shadcn/dropdown-menu";
import { Input } from "@asym/ui/components/shadcn/input";

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
            className="gap-1.5"
            disabled={disabled}
          />
        }
      >
        <Braces className="h-3.5 w-3.5" />
        Merge tag
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>Insert merge tag</DropdownMenuLabel>
        <div className="px-2 pb-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search tags"
              className="h-8 pl-8"
            />
          </div>
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-80 overflow-y-auto">
          {tags.map((tag) => (
            <DropdownMenuItem
              key={tag.key}
              className="flex flex-col items-start gap-0.5"
              onClick={() => onInsert(tag.key)}
            >
              <span className="font-medium">{tag.label}</span>
              <span className="text-xs text-muted-foreground">
                {"{{"}
                {tag.key}
                {"}}"} · {tag.category}
              </span>
            </DropdownMenuItem>
          ))}
          {tags.length === 0 && (
            <div className="px-2 py-6 text-center text-sm text-muted-foreground">
              No matching tags
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default EmailStudioMergeTagMenu;
