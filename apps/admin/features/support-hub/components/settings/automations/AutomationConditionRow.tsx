"use client";

import { SUPPORT_AUTOMATION_CONDITION_KINDS } from "@asym/database/hooks";
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
import { Switch } from "@asym/ui/components/shadcn/switch";
import { Trash2 } from "lucide-react";
import * as React from "react";

import { useSupportInboxes } from "../../../hooks/use-support-inbox-settings";
import { useSupportLabels } from "../../../hooks/use-support-labels";
import { AUTOMATION_CONDITION_LABELS } from "../../../lib/status-labels";

import type { SupportAutomationCondition } from "../../../types";

interface AutomationConditionRowProps {
  condition: SupportAutomationCondition;
  /** Zero-based position; controls are named by row so each name is unique. */
  index: number;
  /** What the row still needs, shown once staff try to save. */
  error?: string | null;
  onChange: (next: SupportAutomationCondition) => void;
  onRemove: () => void;
}

export function AutomationConditionRow({
  condition,
  index,
  error,
  onChange,
  onRemove,
}: AutomationConditionRowProps) {
  const { data: inboxes } = useSupportInboxes();
  const { data: labels } = useSupportLabels();
  const errorId = React.useId();
  const row = `Condition ${index + 1}`;
  const kindLabel = labelForKind(condition.kind);
  const invalid = error
    ? { "aria-invalid": true, "aria-describedby": errorId }
    : {};

  const handleKindChange = (kind: SupportAutomationCondition["kind"]) => {
    onChange(defaultForKind(kind));
  };

  return (
    <li className="flex flex-wrap items-center gap-2 rounded-lg bg-muted/60 p-2">
      <Select
        items={SUPPORT_AUTOMATION_CONDITION_KINDS.map((kind) => ({
          value: kind,
          label: labelForKind(kind),
        }))}
        value={condition.kind}
        onValueChange={(value) => {
          if (value !== null) handleKindChange(value);
        }}
      >
        <div className="min-w-50 flex-1">
          <SelectTrigger
            aria-label={`${row} type`}
            size="sm"
            className="w-full"
          >
            <SelectValue />
          </SelectTrigger>
        </div>
        <SelectContent>
          {SUPPORT_AUTOMATION_CONDITION_KINDS.map((kind) => (
            <SelectItem key={kind} value={kind}>
              {labelForKind(kind)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {condition.kind === "inbox_is" ? (
        <div className="min-w-50 flex-1">
          <SearchableSelect
            items={inboxes.map((inbox) => ({
              value: inbox.id,
              label: inbox.name,
            }))}
            value={condition.inboxId}
            onValueChange={(value) => {
              if (value === null) return;
              onChange({ kind: "inbox_is", inboxId: value });
            }}
            aria-label={`${row} inbox`}
            {...invalid}
            className="w-full"
            placeholder="Pick an inbox"
          />
        </div>
      ) : null}

      {condition.kind === "label_includes" ? (
        <div className="min-w-50 flex-1">
          <SearchableSelect
            items={labels.map((label) => ({
              value: label.id,
              label: label.name,
            }))}
            value={condition.labelId}
            onValueChange={(value) => {
              if (value === null) return;
              onChange({ kind: "label_includes", labelId: value });
            }}
            aria-label={`${row} label`}
            {...invalid}
            className="w-full"
            placeholder="Pick a label"
          />
        </div>
      ) : null}

      {condition.kind === "from_domain_equals" ? (
        <div className="min-w-50 flex-1">
          <Input
            value={condition.domain}
            onChange={(event) =>
              onChange({
                kind: "from_domain_equals",
                domain: event.target.value,
              })
            }
            aria-label={`${row} domain`}
            {...invalid}
            placeholder="example.org"
            className="w-full"
          />
        </div>
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
            aria-label={`${row}: ${kindLabel}`}
          />
          <span aria-hidden="true" className="text-xs text-muted-foreground">
            {condition.value ? "Yes" : "No"}
          </span>
        </div>
      ) : null}

      {condition.kind === "subject_contains" ||
      condition.kind === "body_contains" ? (
        <div className="min-w-50 flex-1">
          <Input
            value={condition.value}
            onChange={(event) =>
              onChange({
                kind: condition.kind,
                value: event.target.value,
              } as SupportAutomationCondition)
            }
            aria-label={`${row} word or phrase`}
            {...invalid}
            placeholder="keyword"
            className="w-full"
          />
        </div>
      ) : null}

      <Button
        type="button"
        variant="destructive"
        size="icon-sm"
        onClick={onRemove}
        aria-label={`Remove condition ${index + 1}: ${kindLabel}`}
      >
        <Trash2 className="size-3.5 text-destructive" />
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
  return AUTOMATION_CONDITION_LABELS[kind];
}
