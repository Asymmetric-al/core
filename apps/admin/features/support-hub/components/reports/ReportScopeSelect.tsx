"use client";

import { Label } from "@asym/ui/components/shadcn/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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

  return (
    <div className="flex items-end gap-2">
      {!lockKind ? (
        <div className="flex flex-col gap-1.5">
          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
            Scope
          </Label>
          <Select
            value={state.scopeKind}
            onValueChange={(value) =>
              setState({
                scopeKind: value as SupportReportScopeKind,
                scopeId: "",
              })
            }
          >
            <SelectTrigger className="h-9 w-[140px] text-[12px]">
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
        <div className="flex flex-col gap-1.5">
          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
            {activeKind.charAt(0).toUpperCase() + activeKind.slice(1)}
          </Label>
          <Select
            value={state.scopeId || options[0]?.id || ""}
            onValueChange={(value) => setState({ scopeId: value })}
          >
            <SelectTrigger className="h-9 min-w-[180px] text-[12px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}
    </div>
  );
}
