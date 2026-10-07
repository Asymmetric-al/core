"use client";

import { SUPPORT_AUTOMATION_TRIGGERS } from "@asym/database/hooks";
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
import { Textarea } from "@asym/ui/components/shadcn/textarea";
import { Plus } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { useSaveSupportAutomationRule } from "../../../hooks/use-support-mutations";
import { createDraftRow, createDraftRows } from "../draft-rows";
import { SettingsPanel } from "../SettingsPanel";
import { SettingsRow } from "../SettingsRow";
import { SettingsToolbar } from "../SettingsToolbar";
import { AutomationActionRow } from "./AutomationActionRow";
import { AutomationConditionRow } from "./AutomationConditionRow";
import { AutomationDryRunPreview } from "./AutomationDryRunPreview";

import type {
  SupportAutomationAction,
  SupportAutomationCondition,
  SupportAutomationRule,
} from "../../../types";

interface AutomationRuleFormProps {
  rule?: SupportAutomationRule | null;
  onSaved: () => void;
  onCancel: () => void;
}

export function AutomationRuleForm({
  rule,
  onSaved,
  onCancel,
}: AutomationRuleFormProps) {
  const save = useSaveSupportAutomationRule();

  const [name, setName] = React.useState(rule?.name ?? "");
  const [description, setDescription] = React.useState(rule?.description ?? "");
  const [enabled, setEnabled] = React.useState(rule?.enabled ?? true);
  const [trigger, setTrigger] = React.useState<
    SupportAutomationRule["trigger"]
  >(rule?.trigger ?? "conversation_created");
  const [conditionRows, setConditionRows] = React.useState(() =>
    createDraftRows(rule?.conditions ?? []),
  );
  const [actionRows, setActionRows] = React.useState(() =>
    createDraftRows(rule?.actions ?? []),
  );
  const conditions = React.useMemo(
    () => conditionRows.map((row) => row.value),
    [conditionRows],
  );
  const actions = React.useMemo(
    () => actionRows.map((row) => row.value),
    [actionRows],
  );
  const handleAddCondition = () => {
    const row = createDraftRow<SupportAutomationCondition>({
      kind: "subject_contains",
      value: "",
    });
    setConditionRows((previous) => [...previous, row]);
  };
  const handleAddAction = () => {
    const row = createDraftRow<SupportAutomationAction>({
      kind: "add_label",
      labelId: "",
    });
    setActionRows((previous) => [...previous, row]);
  };

  const isDirty = React.useMemo(
    () =>
      !rule ||
      name !== rule.name ||
      description !== (rule.description ?? "") ||
      enabled !== rule.enabled ||
      trigger !== rule.trigger ||
      JSON.stringify(conditions) !== JSON.stringify(rule.conditions) ||
      JSON.stringify(actions) !== JSON.stringify(rule.actions),
    [actions, conditions, description, enabled, name, rule, trigger],
  );

  const previewRule: SupportAutomationRule = React.useMemo(
    () => ({
      id: rule?.id ?? "draft",
      tenantId: rule?.tenantId ?? "draft",
      name: name || "Untitled rule",
      description: description ? description : null,
      enabled,
      trigger,
      conditions,
      actions,
      createdAt: rule?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
    [actions, conditions, description, enabled, name, rule, trigger],
  );

  const handleSave = async () => {
    if (!name.trim()) {
      toast.info("Give the rule a name first.");
      return;
    }
    if (actions.length === 0) {
      toast.info("Add at least one action.");
      return;
    }
    try {
      await save.mutateAsync({
        id: rule?.id,
        name: name.trim(),
        description: description.trim() ? description.trim() : null,
        enabled,
        trigger,
        conditions,
        actions,
      });
      toast.success(rule ? "Automation updated." : "Automation created.");
      onSaved();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not save the automation rule.",
      );
    }
  };

  return (
    <SettingsPanel
      title={rule ? `Edit "${rule.name}"` : "New automation rule"}
      description="Trigger + conditions + actions, all ANDed together. Use dry-run below to preview results before saving."
    >
      <SettingsRow label="Name" htmlFor="automation-name">
        <Input
          id="automation-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={80}
        />
      </SettingsRow>
      <SettingsRow label="Description" htmlFor="automation-desc">
        <Textarea
          id="automation-desc"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={2}
          maxLength={240}
        />
      </SettingsRow>
      <SettingsRow
        label="Enabled"
        description="Disabled rules are saved but do not run."
      >
        <div className="flex items-center gap-2">
          <Switch
            checked={enabled}
            onCheckedChange={setEnabled}
            aria-label="Enabled"
          />
          <span className="text-xs text-zinc-500">
            {enabled ? "Active" : "Disabled"}
          </span>
        </div>
      </SettingsRow>
      <SettingsRow
        control
        label="Trigger"
        description="Event that causes the rule to evaluate."
      >
        <Select
          items={[
            ...SUPPORT_AUTOMATION_TRIGGERS.map((kind) => ({
              value: kind,
              label: formatTrigger(kind),
            })),
          ]}
          value={trigger}
          onValueChange={(value) => {
            if (value !== null) setTrigger(value);
          }}
        >
          <SelectTrigger aria-label="Trigger" className="h-9 max-w-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SUPPORT_AUTOMATION_TRIGGERS.map((kind) => (
              <SelectItem key={kind} value={kind}>
                {formatTrigger(kind)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SettingsRow>

      <div className="flex flex-col gap-2 rounded-xl border border-zinc-100 bg-white p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
            Conditions
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleAddCondition}
            className="h-7 gap-1 rounded-lg px-2 font-bold uppercase tracking-wider"
          >
            <Plus className="size-3" />
            Add condition
          </Button>
        </div>
        {conditions.length === 0 ? (
          <p className="text-xs text-zinc-500">
            No conditions, the rule fires for every event.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {conditionRows.map(({ id, value: condition }) => (
              <AutomationConditionRow
                key={id}
                condition={condition}
                onChange={(next) =>
                  setConditionRows((prev) =>
                    prev.map((row) =>
                      row.id === id ? { ...row, value: next } : row,
                    ),
                  )
                }
                onRemove={() =>
                  setConditionRows((prev) =>
                    prev.filter((row) => row.id !== id),
                  )
                }
              />
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-2 rounded-xl border border-zinc-100 bg-white p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
            Actions
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleAddAction}
            className="h-7 gap-1 rounded-lg px-2 font-bold uppercase tracking-wider"
          >
            <Plus className="size-3" />
            Add action
          </Button>
        </div>
        {actions.length === 0 ? (
          <p className="text-xs text-zinc-500">
            Add at least one action to save the rule.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {actionRows.map(({ id, value: action }) => (
              <AutomationActionRow
                key={id}
                action={action}
                onChange={(next) =>
                  setActionRows((prev) =>
                    prev.map((row) =>
                      row.id === id ? { ...row, value: next } : row,
                    ),
                  )
                }
                onRemove={() =>
                  setActionRows((prev) => prev.filter((row) => row.id !== id))
                }
              />
            ))}
          </ul>
        )}
      </div>

      <AutomationDryRunPreview rule={previewRule} />

      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="rounded-lg text-xs"
        >
          Cancel
        </Button>
      </div>

      <SettingsToolbar
        isDirty={isDirty}
        isSaving={save.isPending}
        onSave={handleSave}
        onCancel={onCancel}
      />
    </SettingsPanel>
  );
}

function formatTrigger(kind: SupportAutomationRule["trigger"]): string {
  switch (kind) {
    case "conversation_created":
      return "Conversation created";
    case "message_received":
      return "Message received";
    case "status_changed":
      return "Status changed";
    case "label_added":
      return "Label added";
    case "past_due_reached":
      return "Past-due reached";
    default:
      return kind;
  }
}
