"use client";

import { SUPPORT_AUTOMATION_CONDITION_KINDS } from "@asym/database/hooks";
import { Button } from "@asym/ui/components/shadcn/button";
import { Input } from "@asym/ui/components/shadcn/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@asym/ui/components/shadcn/select";
import { Switch } from "@asym/ui/components/shadcn/switch";
import { Trash2 } from "lucide-react";
import * as React from "react";

import { useSupportInboxes } from "../../../hooks/use-support-inbox-settings";
import { useSupportLabels } from "../../../hooks/use-support-labels";

import type { SupportAutomationCondition } from "../../../types";

interface AutomationConditionRowProps {
  condition: SupportAutomationCondition;
  onChange: (next: SupportAutomationCondition) => void;
  onRemove: () => void;
}

export function AutomationConditionRow({
  condition,
  onChange,
  onRemove,
}: AutomationConditionRowProps) {
  const { data: inboxes } = useSupportInboxes();
  const { data: labels } = useSupportLabels();

  const handleKindChange = (kind: SupportAutomationCondition["kind"]) => {
    onChange(defaultForKind(kind));
  };

  return (
    <li className="flex flex-wrap items-center gap-2 rounded-lg bg-zinc-50/60 p-2">
      <Select
        value={condition.kind}
        onValueChange={(value) =>
          handleKindChange(value as SupportAutomationCondition["kind"])
        }
      >
        <SelectTrigger className="h-8 min-w-[200px] text-[12px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SUPPORT_AUTOMATION_CONDITION_KINDS.map((kind) => (
            <SelectItem key={kind} value={kind}>
              {labelForKind(kind)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {condition.kind === "inbox_is" ? (
        <Select
          value={condition.inboxId}
          onValueChange={(value) =>
            onChange({ kind: "inbox_is", inboxId: value })
          }
        >
          <SelectTrigger className="h-8 min-w-[200px] text-[12px]">
            <SelectValue placeholder="Pick an inbox" />
          </SelectTrigger>
          <SelectContent>
            {inboxes.map((inbox) => (
              <SelectItem key={inbox.id} value={inbox.id}>
                {inbox.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}

      {condition.kind === "label_includes" ? (
        <Select
          value={condition.labelId}
          onValueChange={(value) =>
            onChange({ kind: "label_includes", labelId: value })
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

      {condition.kind === "from_domain_equals" ? (
        <Input
          value={condition.domain}
          onChange={(event) =>
            onChange({ kind: "from_domain_equals", domain: event.target.value })
          }
          placeholder="example.org"
          className="h-8 min-w-[200px] font-mono text-[12px]"
        />
      ) : null}

      {condition.kind === "assignee_is_present" ||
      condition.kind === "is_overdue" ||
      condition.kind === "is_escalated" ? (
        <div className="flex items-center gap-2">
          <Switch
            checked={condition.value}
            onCheckedChange={(value) =>
              onChange({
                kind: condition.kind,
                value,
              } as SupportAutomationCondition)
            }
            aria-label={condition.kind}
          />
          <span className="text-[11px] text-zinc-500">
            {condition.value ? "true" : "false"}
          </span>
        </div>
      ) : null}

      {condition.kind === "subject_contains" ||
      condition.kind === "body_contains" ? (
        <Input
          value={condition.value}
          onChange={(event) =>
            onChange({
              kind: condition.kind,
              value: event.target.value,
            } as SupportAutomationCondition)
          }
          placeholder="keyword"
          className="h-8 min-w-[200px] text-[12px]"
        />
      ) : null}

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onRemove}
        aria-label="Remove condition"
        className="size-7 text-rose-500 hover:bg-rose-50"
      >
        <Trash2 className="size-3.5" aria-hidden="true" />
      </Button>
    </li>
  );
}

function defaultForKind(
  kind: SupportAutomationCondition["kind"],
): SupportAutomationCondition {
  switch (kind) {
    case "inbox_is":
      return { kind: "inbox_is", inboxId: "" };
    case "label_includes":
      return { kind: "label_includes", labelId: "" };
    case "from_domain_equals":
      return { kind: "from_domain_equals", domain: "" };
    case "assignee_is_present":
      return { kind: "assignee_is_present", value: true };
    case "is_overdue":
      return { kind: "is_overdue", value: true };
    case "is_escalated":
      return { kind: "is_escalated", value: true };
    case "subject_contains":
      return { kind: "subject_contains", value: "" };
    case "body_contains":
      return { kind: "body_contains", value: "" };
    default: {
      const _exhaustive: never = kind;
      void _exhaustive;
      return { kind: "subject_contains", value: "" };
    }
  }
}

function labelForKind(kind: SupportAutomationCondition["kind"]): string {
  switch (kind) {
    case "inbox_is":
      return "Inbox is";
    case "label_includes":
      return "Label includes";
    case "from_domain_equals":
      return "From domain equals";
    case "assignee_is_present":
      return "Assignee is present";
    case "is_overdue":
      return "Is overdue";
    case "is_escalated":
      return "Is escalated";
    case "subject_contains":
      return "Subject contains";
    case "body_contains":
      return "Body contains";
    default:
      return kind;
  }
}
