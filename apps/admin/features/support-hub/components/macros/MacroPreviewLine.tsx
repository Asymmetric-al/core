"use client";

import { cn } from "@asym/ui/lib/utils";
import {
  Clock,
  Flag,
  StickyNote,
  Tag,
  Users,
  UserCheck,
  Wand2,
  X,
} from "lucide-react";

import {
  useSupportAgents,
  useSupportTeams,
} from "../../hooks/use-support-agents";
import { useSupportCannedResponses } from "../../hooks/use-support-canned-responses";
import { useSupportLabels } from "../../hooks/use-support-labels";
import {
  MACRO_ACTION_LABELS,
  CONVERSATION_STATUS_LABELS,
  CONVERSATION_PRIORITY_LABELS,
} from "../../lib/status-labels";

import type { SupportMacroAction } from "../../types";

interface MacroPreviewLineProps {
  actions: SupportMacroAction[];
}

/**
 * Compact action chips rendered inside the macro popover. Gives the agent a
 * quick read of what a macro will do before running it.
 */
export function MacroPreviewLine({ actions }: MacroPreviewLineProps) {
  const agents = useSupportAgents(),
    teams = useSupportTeams(),
    labels = useSupportLabels(),
    responses = useSupportCannedResponses();
  const targetNames = {
    agents: agents.data,
    teams: teams.data,
    labels: labels.data,
    responses: responses.data.map((row) => ({ id: row.id, name: row.title })),
  };
  const isTargetLoading = (action: SupportMacroAction) => {
    switch (action.kind) {
      case "assign_agent":
        return agents.isLoading;
      case "assign_team":
        return teams.isLoading;
      case "add_label":
      case "remove_label":
        return labels.isLoading;
      case "send_canned_response":
        return responses.isLoading;
      default:
        return false;
    }
  };
  if (actions.length === 0) return null;
  return (
    <ul className="flex flex-wrap items-center gap-1">
      {actions.map((action, index) => (
        <li
          key={`${action.kind}-${index}`}
          className={cn(
            "inline-flex h-5 items-center gap-1 rounded-md border border-border bg-card px-1.5 text-xs font-medium text-muted-foreground",
          )}
        >
          {iconFor(action)}
          {isTargetLoading(action)
            ? MACRO_ACTION_LABELS[action.kind]
            : labelFor(action, targetNames)}
        </li>
      ))}
    </ul>
  );
}

function iconFor(action: SupportMacroAction) {
  switch (action.kind) {
    case "set_status":
      return <Flag className="size-3 text-muted-foreground" />;
    case "set_priority":
      return <Flag className="size-3 text-warning" />;
    case "assign_agent":
      return <UserCheck className="size-3 text-muted-foreground" />;
    case "assign_team":
      return <Users className="size-3 text-muted-foreground" />;
    case "add_label":
      return <Tag className="size-3 text-muted-foreground" />;
    case "remove_label":
      return (
        <span className="relative inline-flex">
          <Tag className="size-3 text-muted-foreground" />
          <X
            aria-hidden
            className="absolute -right-0.5 -top-0.5 size-2 text-destructive"
          />
        </span>
      );
    case "send_canned_response":
      return <Wand2 className="size-3 text-muted-foreground" />;
    case "snooze":
      return <Clock className="size-3 text-muted-foreground" />;
    case "add_private_note":
      return <StickyNote className="size-3 text-warning" />;
    default: {
      const _exhaustive: never = action;
      void _exhaustive;
      return null;
    }
  }
}

function labelFor(
  action: SupportMacroAction,
  targets: {
    agents: { id: string; name: string }[];
    teams: { id: string; name: string }[];
    labels: { id: string; name: string }[];
    responses: { id: string; name: string }[];
  },
): string {
  switch (action.kind) {
    case "set_status":
      return "Set status: " + CONVERSATION_STATUS_LABELS[action.status];
    case "set_priority":
      return "Set priority: " + CONVERSATION_PRIORITY_LABELS[action.priority];
    case "assign_agent":
      return (
        "Assign agent: " +
        (targets.agents.find((row) => row.id === action.agentId)?.name ??
          "Agent unavailable")
      );
    case "assign_team":
      return (
        "Assign team: " +
        (targets.teams.find((row) => row.id === action.teamId)?.name ??
          "Team unavailable")
      );
    case "add_label":
      return (
        "Add label: " +
        (targets.labels.find((row) => row.id === action.labelId)?.name ??
          "Label unavailable")
      );
    case "remove_label":
      return (
        "Remove label: " +
        (targets.labels.find((row) => row.id === action.labelId)?.name ??
          "Label unavailable")
      );
    case "send_canned_response":
      return (
        "Insert canned response: " +
        (targets.responses.find((row) => row.id === action.cannedResponseId)
          ?.name ?? "Response unavailable")
      );
    case "snooze":
      return `Snooze ${action.hours} ${action.hours === 1 ? "hour" : "hours"}`;
    case "add_private_note":
      return "Add private note";
    default: {
      const _exhaustive: never = action;
      void _exhaustive;
      return "";
    }
  }
}
