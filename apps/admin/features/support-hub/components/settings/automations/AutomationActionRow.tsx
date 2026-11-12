"use client";

import {
  SUPPORT_AUTOMATION_ACTION_KINDS,
  SUPPORT_CONVERSATION_STATUSES,
  SUPPORT_PRIORITIES,
} from "@asym/database/hooks";
import { Button } from "@asym/ui/components/shadcn/button";
import { FieldError } from "@asym/ui/components/shadcn/field";
import { Input } from "@asym/ui/components/shadcn/input";
import { SearchableSelect } from "@asym/ui/components/shadcn/searchable-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@asym/ui/components/shadcn/select";
import { Trash2 } from "lucide-react";
import * as React from "react";

import {
  useSupportAgents,
  useSupportTeams,
} from "../../../hooks/use-support-agents";
import { useSupportLabels } from "../../../hooks/use-support-labels";
import { useSupportMacros } from "../../../hooks/use-support-macros";
import {
  CONVERSATION_PRIORITY_LABELS,
  CONVERSATION_STATUS_LABELS,
  AUTOMATION_ACTION_LABELS,
} from "../../../lib/status-labels";

import type { SupportAutomationAction } from "../../../types";

interface AutomationActionRowProps {
  action: SupportAutomationAction;
  /** Zero-based position; controls are named by row so each name is unique. */
  index: number;
  /** What the row still needs, shown once staff try to save. */
  error?: string | null;
  onChange: (next: SupportAutomationAction) => void;
  onRemove: () => void;
}

export function AutomationActionRow({
  action,
  index,
  error,
  onChange,
  onRemove,
}: AutomationActionRowProps) {
  const { data: agents } = useSupportAgents();
  const { data: labels } = useSupportLabels();
  const { data: macros } = useSupportMacros();
  const { data: teams } = useSupportTeams();
  const errorId = React.useId();
  const row = `Action ${index + 1}`;
  const invalid = error
    ? { "aria-invalid": true, "aria-describedby": errorId }
    : {};

  const handleKindChange = (kind: SupportAutomationAction["kind"]) => {
    onChange(defaultForKind(kind));
  };

  return (
    <li className="flex flex-wrap items-center gap-2 rounded-lg bg-muted/60 p-2">
      <Select
        items={SUPPORT_AUTOMATION_ACTION_KINDS.map((kind) => ({
          value: kind,
          label: labelForKind(kind),
        }))}
        value={action.kind}
        onValueChange={(value) => {
          if (value !== null) handleKindChange(value);
        }}
      >
        <div className="min-w-45 flex-1">
          <SelectTrigger
            aria-label={`${row} type`}
            size="sm"
            className="w-full"
          >
            <SelectValue />
          </SelectTrigger>
        </div>
        <SelectContent>
          {SUPPORT_AUTOMATION_ACTION_KINDS.map((kind) => (
            <SelectItem key={kind} value={kind}>
              {labelForKind(kind)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {action.kind === "assign_agent" ? (
        <div className="min-w-50 flex-1">
          <SearchableSelect
            items={agents.map((agent) => ({
              value: agent.id,
              label: agent.name,
            }))}
            value={action.agentId}
            onValueChange={(value) => {
              if (value === null) return;
              onChange({ kind: "assign_agent", agentId: value });
            }}
            aria-label={`${row} agent`}
            {...invalid}
            className="w-full"
            placeholder="Pick an agent"
          />
        </div>
      ) : null}

      {action.kind === "assign_team" ? (
        <div className="min-w-50 flex-1">
          <SearchableSelect
            items={teams.map((team) => ({ value: team.id, label: team.name }))}
            value={action.teamId}
            onValueChange={(value) => {
              if (value === null) return;
              onChange({ kind: "assign_team", teamId: value });
            }}
            aria-label={`${row} team`}
            {...invalid}
            className="w-full"
            placeholder="Pick a team"
          />
        </div>
      ) : null}

      {action.kind === "add_label" ? (
        <div className="min-w-50 flex-1">
          <SearchableSelect
            items={labels.map((label) => ({
              value: label.id,
              label: label.name,
            }))}
            value={action.labelId}
            onValueChange={(value) => {
              if (value === null) return;
              onChange({ kind: "add_label", labelId: value });
            }}
            aria-label={`${row} label`}
            {...invalid}
            className="w-full"
            placeholder="Pick a label"
          />
        </div>
      ) : null}

      {action.kind === "set_priority" ? (
        <Select
          items={SUPPORT_PRIORITIES.map((priority) => ({
            value: priority,
            label: CONVERSATION_PRIORITY_LABELS[priority],
          }))}
          value={action.priority}
          onValueChange={(value) => {
            if (value === null) return;
            onChange({
              kind: "set_priority",
              priority: value,
            });
          }}
        >
          <div className="min-w-35 flex-1">
            <SelectTrigger
              aria-label={`${row} priority`}
              size="sm"
              className="w-full"
            >
              <SelectValue />
            </SelectTrigger>
          </div>
          <SelectContent>
            {SUPPORT_PRIORITIES.map((priority) => (
              <SelectItem key={priority} value={priority}>
                {CONVERSATION_PRIORITY_LABELS[priority]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}

      {action.kind === "set_status" ? (
        <Select
          items={SUPPORT_CONVERSATION_STATUSES.map((status) => ({
            value: status,
            label: CONVERSATION_STATUS_LABELS[status],
          }))}
          value={action.status}
          onValueChange={(value) => {
            if (value === null) return;
            onChange({
              kind: "set_status",
              status: value,
            });
          }}
        >
          <div className="min-w-35 flex-1">
            <SelectTrigger
              aria-label={`${row} status`}
              size="sm"
              className="w-full"
            >
              <SelectValue />
            </SelectTrigger>
          </div>
          <SelectContent>
            {SUPPORT_CONVERSATION_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {CONVERSATION_STATUS_LABELS[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}

      {action.kind === "snooze" ? (
        <span className="inline-flex items-center gap-2">
          <div className="w-30 flex-1">
            <Input
              type="number"
              min={1}
              step={1}
              value={action.hours}
              onChange={(event) =>
                onChange({
                  kind: "snooze",
                  hours: Number(event.target.value) || 1,
                })
              }
              aria-label={`${row} hours to snooze`}
              {...invalid}
              className="w-full"
            />
          </div>
          <span className="text-xs text-muted-foreground">hours</span>
        </span>
      ) : null}

      {action.kind === "run_macro" ? (
        <div className="min-w-55 flex-1">
          <SearchableSelect
            items={macros.map((macro) => ({
              value: macro.id,
              label: macro.name,
            }))}
            value={action.macroId}
            onValueChange={(value) => {
              if (value === null) return;
              onChange({ kind: "run_macro", macroId: value });
            }}
            aria-label={`${row} macro`}
            {...invalid}
            className="w-full"
            placeholder="Pick a macro"
          />
        </div>
      ) : null}

      <Button
        type="button"
        variant="destructive"
        size="icon-sm"
        onClick={onRemove}
        aria-label={`Remove action ${index + 1}: ${labelForKind(action.kind)}`}
      >
        <Trash2 aria-hidden="true" className="size-3.5" />
      </Button>
      {error ? (
        <FieldError id={errorId} className="basis-full">
          {error}
        </FieldError>
      ) : null}
    </li>
  );
}

function defaultForKind(
  kind: SupportAutomationAction["kind"],
): SupportAutomationAction {
  switch (kind) {
    case "assign_agent":
      return { kind: "assign_agent", agentId: "" };
    case "assign_team":
      return { kind: "assign_team", teamId: "" };
    case "add_label":
      return { kind: "add_label", labelId: "" };
    case "set_priority":
      return { kind: "set_priority", priority: "high" };
    case "set_status":
      return { kind: "set_status", status: "pending" };
    case "snooze":
      return { kind: "snooze", hours: 24 };
    case "mark_escalated":
      return { kind: "mark_escalated" };
    case "run_macro":
      return { kind: "run_macro", macroId: "" };
    default: {
      const _exhaustive: never = kind;
      void _exhaustive;
      return { kind: "mark_escalated" };
    }
  }
}

/** An action kind as staff read it, in sentence case. */
export function labelForKind(kind: SupportAutomationAction["kind"]): string {
  return AUTOMATION_ACTION_LABELS[kind];
}
