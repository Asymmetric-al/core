"use client";

import {
  SUPPORT_AUTOMATION_ACTION_KINDS,
  SUPPORT_CONVERSATION_STATUSES,
  SUPPORT_PRIORITIES,
} from "@asym/database/hooks";
import { Button } from "@asym/ui/components/shadcn/button";
import { Input } from "@asym/ui/components/shadcn/input";
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

import type { SupportAutomationAction } from "../../../types";

interface AutomationActionRowProps {
  action: SupportAutomationAction;
  onChange: (next: SupportAutomationAction) => void;
  onRemove: () => void;
}

export function AutomationActionRow({
  action,
  onChange,
  onRemove,
}: AutomationActionRowProps) {
  const { data: agents } = useSupportAgents();
  const { data: labels } = useSupportLabels();
  const { data: macros } = useSupportMacros();
  const teams = useSupportTeams();

  const handleKindChange = (kind: SupportAutomationAction["kind"]) => {
    onChange(defaultForKind(kind));
  };

  return (
    <li className="flex flex-wrap items-center gap-2 rounded-lg bg-zinc-50/60 p-2">
      <Select
        value={action.kind}
        onValueChange={(value) =>
          handleKindChange(value as SupportAutomationAction["kind"])
        }
      >
        <SelectTrigger className="h-8 min-w-[180px] text-[12px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SUPPORT_AUTOMATION_ACTION_KINDS.map((kind) => (
            <SelectItem key={kind} value={kind}>
              {labelForKind(kind)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {action.kind === "assign_agent" ? (
        <Select
          value={action.agentId}
          onValueChange={(value) =>
            onChange({ kind: "assign_agent", agentId: value })
          }
        >
          <SelectTrigger className="h-8 min-w-[200px] text-[12px]">
            <SelectValue placeholder="Pick an agent" />
          </SelectTrigger>
          <SelectContent>
            {agents.map((agent) => (
              <SelectItem key={agent.id} value={agent.id}>
                {agent.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}

      {action.kind === "assign_team" ? (
        <Select
          value={action.teamId}
          onValueChange={(value) =>
            onChange({ kind: "assign_team", teamId: value })
          }
        >
          <SelectTrigger className="h-8 min-w-[200px] text-[12px]">
            <SelectValue placeholder="Pick a team" />
          </SelectTrigger>
          <SelectContent>
            {(teams.data ?? []).map((team) => (
              <SelectItem key={team.id} value={team.id}>
                {team.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}

      {action.kind === "add_label" ? (
        <Select
          value={action.labelId}
          onValueChange={(value) =>
            onChange({ kind: "add_label", labelId: value })
          }
        >
          <SelectTrigger className="h-8 min-w-[200px] text-[12px]">
            <SelectValue placeholder="Pick a label" />
          </SelectTrigger>
          <SelectContent>
            {labels.map((label) => (
              <SelectItem key={label.id} value={label.id}>
                {label.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}

      {action.kind === "set_priority" ? (
        <Select
          value={action.priority}
          onValueChange={(value) =>
            onChange({
              kind: "set_priority",
              priority: value as SupportAutomationAction extends {
                kind: "set_priority";
                priority: infer P;
              }
                ? P
                : never,
            })
          }
        >
          <SelectTrigger className="h-8 min-w-[140px] text-[12px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SUPPORT_PRIORITIES.map((priority) => (
              <SelectItem key={priority} value={priority}>
                {priority}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}

      {action.kind === "set_status" ? (
        <Select
          value={action.status}
          onValueChange={(value) =>
            onChange({
              kind: "set_status",
              status: value as SupportAutomationAction extends {
                kind: "set_status";
                status: infer S;
              }
                ? S
                : never,
            })
          }
        >
          <SelectTrigger className="h-8 min-w-[140px] text-[12px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SUPPORT_CONVERSATION_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}

      {action.kind === "snooze" ? (
        <Input
          type="number"
          min={1}
          value={action.hours}
          onChange={(event) =>
            onChange({
              kind: "snooze",
              hours: Number(event.target.value) || 1,
            })
          }
          className="h-8 w-[120px] font-mono text-[12px]"
        />
      ) : null}

      {action.kind === "run_macro" ? (
        <Select
          value={action.macroId}
          onValueChange={(value) =>
            onChange({ kind: "run_macro", macroId: value })
          }
        >
          <SelectTrigger className="h-8 min-w-[220px] text-[12px]">
            <SelectValue placeholder="Pick a macro" />
          </SelectTrigger>
          <SelectContent>
            {macros.map((macro) => (
              <SelectItem key={macro.id} value={macro.id}>
                {macro.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onRemove}
        aria-label="Remove action"
        className="size-7 text-rose-500 hover:bg-rose-50"
      >
        <Trash2 className="size-3.5" />
      </Button>
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

function labelForKind(kind: SupportAutomationAction["kind"]): string {
  switch (kind) {
    case "assign_agent":
      return "Assign agent";
    case "assign_team":
      return "Assign team";
    case "add_label":
      return "Add label";
    case "set_priority":
      return "Set priority";
    case "set_status":
      return "Set status";
    case "snooze":
      return "Snooze";
    case "mark_escalated":
      return "Mark escalated";
    case "run_macro":
      return "Run macro";
    default:
      return kind;
  }
}
