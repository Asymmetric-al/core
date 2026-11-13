"use client";

import { Button } from "@asym/ui/components/shadcn/button";
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
    // One wrapping row: search grows, filters keep together on the right.
    // On phones search shares its row with the layout toggle and the three
    // filters take the next row, so the board starts two rows sooner.
    <div className="flex flex-wrap items-center gap-2">
      <div className="min-w-0 flex-1 sm:min-w-64 sm:max-w-md">
        <InputGroup className="w-full">
          <InputGroupAddon>
            <Search aria-hidden="true" />
          </InputGroupAddon>
          <InputGroupInput
            value={searchDraft}
            onChange={(event) => setSearchDraft(event.target.value)}
            placeholder="Donor, subject or email…"
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
      </div>

      <div className="order-last flex w-full items-center gap-2 sm:order-none sm:w-auto sm:flex-wrap lg:ml-auto">
        {/* On phones Status and Assignee share what Labels leaves. */}
        <div className="min-w-0 flex-1 sm:flex-none">
          <StatusFilter
            value={state.status}
            onValueChange={(next) => setState({ status: next })}
          />
        </div>
        <LabelFilter
          value={state.labelSlugs}
          onValueChange={(next) => setState({ labelSlugs: next })}
        />
        <div className="min-w-0 flex-1 sm:flex-none">
          <AssigneeFilter
            value={state.assignee}
            onValueChange={(next) => setState({ assignee: next })}
          />
        </div>
      </div>
      {(searchDraft ||
        state.status !== "all" ||
        state.labelSlugs.length > 0 ||
        state.assignee) && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setSearchDraft("");
            setState({ q: "", status: "all", labelSlugs: [], assignee: "" });
          }}
        >
          Reset filters
        </Button>
      )}
      <LayoutToggle
        value={state.layout}
        onValueChange={(next) => setState({ layout: next })}
      />
    </div>
  );
}
