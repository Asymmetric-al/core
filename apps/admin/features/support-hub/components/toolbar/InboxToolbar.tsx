"use client";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@asym/ui/components/shadcn/input-group";
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
  const [draftQuery, setDraftQuery] = React.useState(state.q);

  if (draftQuery !== state.q) {
    setDraftQuery(state.q);
    setSearchDraft(state.q);
  }

  React.useEffect(() => {
    if (searchDraft === state.q) return;
    const handle = window.setTimeout(() => {
      setState({ q: searchDraft });
    }, 200);
    return () => window.clearTimeout(handle);
  }, [searchDraft, setState, state.q]);

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <InputGroup className="w-full max-w-md">
        <InputGroupAddon>
          <Search aria-hidden="true" />
        </InputGroupAddon>
        <InputGroupInput
          value={searchDraft}
          onChange={(event) => setSearchDraft(event.target.value)}
          placeholder="Search by donor, subject, or email..."
          aria-label="Search conversations"
        />
        {searchDraft.length > 0 ? (
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Clear search"
              onClick={() => setSearchDraft("")}
            >
              <X aria-hidden="true" />
            </InputGroupButton>
          </InputGroupAddon>
        ) : null}
      </InputGroup>

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
