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

import type { SupportMacroAction } from "../../types";

interface MacroPreviewLineProps {
  actions: SupportMacroAction[];
}

/**
 * Compact action chips rendered inside the macro popover. Gives the agent a
 * quick read of what a macro will do before running it.
 */
export function MacroPreviewLine({ actions }: MacroPreviewLineProps) {
  if (actions.length === 0) return null;
  return (
    <ul className="flex flex-wrap items-center gap-1">
      {actions.map((action, index) => (
        <li
          key={`${action.kind}-${index}`}
          className={cn(
            "inline-flex h-5 items-center gap-1 rounded-md border border-zinc-200 bg-white px-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-600",
          )}
        >
          {iconFor(action)}
          {labelFor(action)}
        </li>
      ))}
    </ul>
  );
}

function iconFor(action: SupportMacroAction) {
  switch (action.kind) {
    case "set_status":
      return <Flag className="size-3 text-zinc-400" />;
    case "set_priority":
      return <Flag className="size-3 text-amber-500" />;
    case "assign_agent":
      return <UserCheck className="size-3 text-zinc-400" />;
    case "assign_team":
      return <Users className="size-3 text-zinc-400" />;
    case "add_label":
      return <Tag className="size-3 text-zinc-400" />;
    case "remove_label":
      return (
        <span className="relative inline-flex">
          <Tag className="size-3 text-zinc-400" />
          <X
            aria-hidden
            className="absolute -right-0.5 -top-0.5 size-2 text-rose-500"
          />
        </span>
      );
    case "send_canned_response":
      return <Wand2 className="size-3 text-zinc-400" />;
    case "snooze":
      return <Clock className="size-3 text-zinc-400" />;
    case "add_private_note":
      return <StickyNote className="size-3 text-amber-500" />;
    default: {
      const _exhaustive: never = action;
      void _exhaustive;
      return null;
    }
  }
}

function labelFor(action: SupportMacroAction): string {
  switch (action.kind) {
    case "set_status":
      return action.status;
    case "set_priority":
      return action.priority;
    case "assign_agent":
      return "assign";
    case "assign_team":
      return "team";
    case "add_label":
      return "+ label";
    case "remove_label":
      return "- label";
    case "send_canned_response":
      return "canned reply";
    case "snooze":
      return `snooze ${action.hours}h`;
    case "add_private_note":
      return "note";
    default: {
      const _exhaustive: never = action;
      void _exhaustive;
      return "";
    }
  }
}
