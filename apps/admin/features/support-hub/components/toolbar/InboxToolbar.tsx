"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import { Input } from "@asym/ui/components/shadcn/input";
import { Search, X } from "lucide-react";
import * as React from "react";

import { AssigneeFilter } from "./AssigneeFilter";
import { LabelFilter } from "./LabelFilter";
import { LayoutToggle } from "./LayoutToggle";
import { StatusFilter } from "./StatusFilter";
import { useSupportInboxState } from "../../lib/route-state";

/**
 * Search + filters + layout toggle row. Every control is bound to the URL via
 * `useSupportInboxState`, so deep links and saved views hydrate the toolbar
 * for free.
 */
export function InboxToolbar() {
  const { state, setState } = useSupportInboxState();

  // Local mirror so typing isn't gated on URL replace latency.
  const [searchDraft, setSearchDraft] = React.useState(state.q);

  React.useEffect(() => {
    setSearchDraft(state.q);
  }, [state.q]);

  React.useEffect(() => {
    if (searchDraft === state.q) return;
    const handle = window.setTimeout(() => {
      setState({ q: searchDraft });
    }, 200);
    return () => window.clearTimeout(handle);
  }, [searchDraft, setState, state.q]);

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative w-full max-w-md">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400"
          aria-hidden
        />
        <Input
          value={searchDraft}
          onChange={(event) => setSearchDraft(event.target.value)}
          placeholder="Search by donor, subject, or email..."
          className="h-10 rounded-xl border-zinc-200 bg-white pl-9 pr-9 text-[13px]"
          aria-label="Search conversations"
        />
        {searchDraft.length > 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Clear search"
            onClick={() => setSearchDraft("")}
            className="absolute right-1 top-1/2 size-8 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
          >
            <X className="size-3.5" />
          </Button>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <StatusFilter
          value={state.status}
          onValueChange={(next) => setState({ status: next })}
        />
        <LabelFilter
          value={state.labelSlugs}
          onValueChange={(next) => setState({ labelSlugs: next })}
        />
        <AssigneeFilter
          value={state.assignee}
          onValueChange={(next) => setState({ assignee: next })}
        />
        <LayoutToggle
          value={state.layout}
          onValueChange={(next) => setState({ layout: next })}
        />
      </div>
    </div>
  );
}
