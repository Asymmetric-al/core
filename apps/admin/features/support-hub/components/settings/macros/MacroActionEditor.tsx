"use client";

import {
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
import { Plus, Trash2 } from "lucide-react";
import * as React from "react";

import {
  useSupportAgents,
  useSupportTeams,
} from "../../../hooks/use-support-agents";
import { useSupportCannedResponses } from "../../../hooks/use-support-canned-responses";
import { useSupportLabels } from "../../../hooks/use-support-labels";

import type { SupportMacroAction } from "../../../types";

const ACTION_KINDS: SupportMacroAction["kind"][] = [
  "set_status",
  "set_priority",
  "assign_agent",
  "assign_team",
  "add_label",
  "remove_label",
  "send_canned_response",
  "snooze",
  "add_private_note",
];

interface MacroActionEditorProps {
  actions: SupportMacroAction[];
  onChange: (next: SupportMacroAction[]) => void;
}

export function MacroActionEditor({
  actions,
  onChange,
}: MacroActionEditorProps) {
  const { data: labels } = useSupportLabels();
  const { data: cannedResponses } = useSupportCannedResponses();
  const { data: agents } = useSupportAgents();
  const teams = useSupportTeams();

  const handleAdd = () => {
    onChange([...actions, defaultActionForKind("set_status")]);
  };

  const handleRemove = (index: number) => {
    onChange(actions.filter((_, i) => i !== index));
  };

  const handleKindChange = (
    index: number,
    kind: SupportMacroAction["kind"],
  ) => {
    const next = [...actions];
    next[index] = defaultActionForKind(kind);
    onChange(next);
  };

  const handlePatch = (index: number, patch: Partial<SupportMacroAction>) => {
    const next = [...actions];
    const current = next[index];
    if (!current) return;
    next[index] = { ...current, ...patch } as SupportMacroAction;
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-zinc-100 bg-white p-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
          Actions
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleAdd}
          className="h-7 gap-1 rounded-lg px-2 text-[10px] font-bold uppercase tracking-wider"
        >
          <Plus className="size-3" />
          Add action
        </Button>
      </div>

      {actions.length === 0 ? (
        <p className="text-[12px] text-zinc-500">
          No actions yet. Add at least one to save the macro.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {actions.map((action, index) => (
            <li
              key={index}
              className="flex flex-wrap items-center gap-2 rounded-lg bg-zinc-50/60 p-2"
            >
              <Select
                value={action.kind}
                onValueChange={(value) =>
                  handleKindChange(index, value as SupportMacroAction["kind"])
                }
              >
                <SelectTrigger className="h-8 min-w-[170px] text-[12px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACTION_KINDS.map((kind) => (
                    <SelectItem key={kind} value={kind}>
                      {labelForKind(kind)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {action.kind === "set_status" ? (
                <Select
                  value={action.status}
                  onValueChange={(value) =>
                    handlePatch(index, {
                      kind: "set_status",
                      status: value as Extract<
                        SupportMacroAction,
                        { kind: "set_status" }
                      >["status"],
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

              {action.kind === "set_priority" ? (
                <Select
                  value={action.priority}
                  onValueChange={(value) =>
                    handlePatch(index, {
                      kind: "set_priority",
                      priority: value as Extract<
                        SupportMacroAction,
                        { kind: "set_priority" }
                      >["priority"],
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

              {action.kind === "assign_agent" ? (
                <Select
                  value={action.agentId}
                  onValueChange={(value) =>
                    handlePatch(index, { kind: "assign_agent", agentId: value })
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
                    handlePatch(index, { kind: "assign_team", teamId: value })
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

              {action.kind === "add_label" || action.kind === "remove_label" ? (
                <Select
                  value={action.labelId}
                  onValueChange={(value) =>
                    handlePatch(index, {
                      kind: action.kind,
                      labelId: value,
                    } as SupportMacroAction)
                  }
                >
                  <SelectTrigger className="h-8 min-w-[180px] text-[12px]">
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

              {action.kind === "send_canned_response" ? (
                <Select
                  value={action.cannedResponseId}
                  onValueChange={(value) =>
                    handlePatch(index, {
                      kind: "send_canned_response",
                      cannedResponseId: value,
                    })
                  }
                >
                  <SelectTrigger className="h-8 min-w-[220px] text-[12px]">
                    <SelectValue placeholder="Pick a canned response" />
                  </SelectTrigger>
                  <SelectContent>
                    {cannedResponses.map((row) => (
                      <SelectItem key={row.id} value={row.id}>
                        {row.title}
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
                    handlePatch(index, {
                      kind: "snooze",
                      hours: Number(event.target.value) || 1,
                    })
                  }
                  className="h-8 w-[100px] font-mono text-[12px]"
                  aria-label="Hours to snooze"
                />
              ) : null}

              {action.kind === "add_private_note" ? (
                <Input
                  value={action.bodyText}
                  onChange={(event) =>
                    handlePatch(index, {
                      kind: "add_private_note",
                      bodyText: event.target.value,
                    })
                  }
                  placeholder="Note text"
                  className="h-8 min-w-[240px] text-[12px]"
                />
              ) : null}

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemove(index)}
                aria-label="Remove action"
                className="size-7 text-rose-500 hover:bg-rose-50"
              >
                <Trash2 className="size-3.5" aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function defaultActionForKind(
  kind: SupportMacroAction["kind"],
): SupportMacroAction {
  switch (kind) {
    case "set_status":
      return { kind: "set_status", status: "resolved" };
    case "set_priority":
      return { kind: "set_priority", priority: "normal" };
    case "assign_agent":
      return { kind: "assign_agent", agentId: "" };
    case "assign_team":
      return { kind: "assign_team", teamId: "" };
    case "add_label":
      return { kind: "add_label", labelId: "" };
    case "remove_label":
      return { kind: "remove_label", labelId: "" };
    case "send_canned_response":
      return { kind: "send_canned_response", cannedResponseId: "" };
    case "snooze":
      return { kind: "snooze", hours: 24 };
    case "add_private_note":
      return { kind: "add_private_note", bodyText: "" };
    default: {
      const _exhaustive: never = kind;
      void _exhaustive;
      return { kind: "set_status", status: "open" };
    }
  }
}

function labelForKind(kind: SupportMacroAction["kind"]): string {
  switch (kind) {
    case "set_status":
      return "Set status";
    case "set_priority":
      return "Set priority";
    case "assign_agent":
      return "Assign agent";
    case "assign_team":
      return "Assign team";
    case "add_label":
      return "Add label";
    case "remove_label":
      return "Remove label";
    case "send_canned_response":
      return "Send canned reply";
    case "snooze":
      return "Snooze";
    case "add_private_note":
      return "Add private note";
    default:
      return kind;
  }
}
