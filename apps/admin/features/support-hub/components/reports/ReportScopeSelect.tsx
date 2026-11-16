"use client";

import { Button } from "@asym/ui/components/shadcn/button";
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

import {
  useSupportAgents,
  useSupportTeams,
} from "../../hooks/use-support-agents";
import { useSupportInboxes } from "../../hooks/use-support-inbox-settings";
import { useSupportLabels } from "../../hooks/use-support-labels";
import { useSupportReportRouteState } from "../../lib/report-state";

import type { SupportReportScopeKind } from "../../types";

interface ReportScopeSelectProps {
  lockKind?: SupportReportScopeKind;
  kinds?: SupportReportScopeKind[];
}

const DEFAULT_KINDS: SupportReportScopeKind[] = [
  "all",
  "inbox",
  "agent",
  "team",
  "label",
];
export function ReportScopeSelect({
  lockKind,
  kinds = DEFAULT_KINDS,
}: ReportScopeSelectProps) {
  const { state, setState } = useSupportReportRouteState();
  const { data: agents } = useSupportAgents();
  const teams = useSupportTeams();
  const { data: inboxes } = useSupportInboxes();
  const { data: labels } = useSupportLabels();

  const scopeSupported =
    lockKind !== undefined || kinds.includes(state.scopeKind);
  const activeKind = lockKind ?? (scopeSupported ? state.scopeKind : "all");
  const kindLabel = (kind: SupportReportScopeKind) =>
    kind.charAt(0).toUpperCase() + kind.slice(1);

  const options = React.useMemo(() => {
    switch (activeKind) {
      case "inbox":
        return inboxes.map((row) => ({ id: row.id, name: row.name }));
      case "agent":
        return agents.map((row) => ({ id: row.id, name: row.name }));
      case "label":
        return labels.map((row) => ({ id: row.id, name: row.name }));
      case "team":
        return teams.data.map((row) => ({ id: row.id, name: row.name }));
      case "all":
      default:
        return [];
    }
  }, [activeKind, agents, inboxes, labels, teams.data]);

  const selectedScopeId = state.scopeId || options[0]?.id || "";

  React.useEffect(() => {
    if (!scopeSupported) {
      setState({ scopeKind: "all", scopeId: "" });
      return;
    }
    if (state.scopeId || !selectedScopeId) {
      return;
    }
    setState({ scopeId: selectedScopeId });
  }, [scopeSupported, selectedScopeId, setState, state.scopeId]);

  return (
    <div className="flex flex-wrap items-end gap-2">
      {!lockKind ? (
        <div className="flex w-35 flex-col gap-1.5">
          <Select<SupportReportScopeKind>
            items={kinds.map((kind) => ({
              value: kind,
              label: kindLabel(kind),
            }))}
            value={activeKind}
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
              {kinds.map((kind) => (
                <SelectItem key={kind} value={kind}>
                  {kindLabel(kind)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}
      {activeKind === "team" &&
      (teams.isError || teams.isLoading || teams.data.length === 0) ? (
        <p role="status" className="text-sm text-muted-foreground">
          {teams.isError
            ? "Teams unavailable."
            : teams.isLoading
              ? "Loading teams…"
              : "No teams yet. Create a team in Support settings."}
        </p>
      ) : null}
      {activeKind === "team" && teams.isError ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void teams.refetch()}
        >
          Try again
        </Button>
      ) : null}
      {activeKind === "team" &&
      teams.isReady &&
      state.scopeId &&
      !teams.data.some((team) => team.id === state.scopeId) ? (
        <p role="status" className="text-sm text-muted-foreground">
          The selected team is unavailable. Choose another team.
        </p>
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
            labelClassName="text-sm font-medium"
          />
        </div>
      ) : null}
    </div>
  );
}
