"use client";

import { SearchableSelect } from "@asym/ui/components/shadcn/searchable-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectControlLabel,
} from "@asym/ui/components/shadcn/select";
import * as React from "react";

import { useSupportAgents } from "../../hooks/use-support-agents";
import { useSupportInboxes } from "../../hooks/use-support-inbox-settings";
import { useSupportLabels } from "../../hooks/use-support-labels";
import { useSupportReportRouteState } from "../../lib/report-state";

import type { SupportReportScopeKind } from "../../types";

interface ReportScopeSelectProps {
  lockKind?: SupportReportScopeKind;
}

export function ReportScopeSelect({ lockKind }: ReportScopeSelectProps) {
  const { state, setState } = useSupportReportRouteState();
  const { data: agents } = useSupportAgents();
  const { data: inboxes } = useSupportInboxes();
  const { data: labels } = useSupportLabels();

  const activeKind = lockKind ?? state.scopeKind;

  const options = React.useMemo(() => {
    switch (activeKind) {
      case "inbox":
        return inboxes.map((row) => ({ id: row.id, name: row.name }));
      case "agent":
        return agents.map((row) => ({ id: row.id, name: row.name }));
      case "label":
        return labels.map((row) => ({ id: row.id, name: row.name }));
      case "team":
      case "all":
      default:
        return [];
    }
  }, [activeKind, agents, inboxes, labels]);

  const selectedScopeId = state.scopeId || options[0]?.id || "";

  React.useEffect(() => {
    if (state.scopeId || !selectedScopeId) {
      return;
    }
    setState({ scopeId: selectedScopeId });
  }, [selectedScopeId, setState, state.scopeId]);

  return (
    <div className="flex items-end gap-2">
      {!lockKind ? (
        <div className="flex w-35 flex-col gap-1.5">
          <Select<SupportReportScopeKind>
            items={[
              { value: "all", label: "All" },
              { value: "inbox", label: "Inbox" },
              { value: "agent", label: "Agent" },
              { value: "team", label: "Team" },
              { value: "label", label: "Label" },
            ]}
            value={state.scopeKind}
            onValueChange={(value) => {
              if (value === null) return;
              setState({
                scopeKind: value,
                scopeId: "",
              });
            }}
          >
            <SelectControlLabel>Scope</SelectControlLabel>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="inbox">Inbox</SelectItem>
              <SelectItem value="agent">Agent</SelectItem>
              <SelectItem value="team">Team</SelectItem>
              <SelectItem value="label">Label</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ) : null}
      {options.length > 0 ? (
        <div className="flex min-w-45 flex-col gap-1.5 text-sm font-medium leading-none">
          <SearchableSelect
            items={[
              ...options.map((option) => ({
                value: option.id,
                label: option.name,
              })),
            ]}
            value={selectedScopeId}
            onValueChange={(value) => {
              if (value === null) {
                return;
              }
              setState({ scopeId: value });
            }}
            label={activeKind.charAt(0).toUpperCase() + activeKind.slice(1)}
          />
        </div>
      ) : null}
    </div>
  );
}
