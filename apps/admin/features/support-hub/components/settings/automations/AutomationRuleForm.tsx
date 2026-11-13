"use client";

import { SUPPORT_AUTOMATION_TRIGGERS } from "@asym/database/hooks";
import { Button } from "@asym/ui/components/shadcn/button";
import { FieldError } from "@asym/ui/components/shadcn/field";
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
import {
  automationActionIssue,
  automationConditionIssue,
  describeIncompleteRows,
  incompleteRowNumbers,
} from "../../../lib/settings-validation";
import { createDraftRow, createDraftRows } from "../draft-rows";
import { SettingsEditorForm } from "../SettingsEditorSheet";
import { SettingsRow } from "../SettingsRow";
import { AutomationActionRow } from "./AutomationActionRow";
import { AutomationConditionRow } from "./AutomationConditionRow";
import { AutomationDryRunPreview } from "./AutomationDryRunPreview";
import { AUTOMATION_TRIGGER_LABELS } from "../../../lib/status-labels";

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
  // Inline errors wait for the first save attempt, then track every edit.
  const [showErrors, setShowErrors] = React.useState(false);
  const conditionIssues = React.useMemo(
    () => conditions.map(automationConditionIssue),
    [conditions],
  );
  const actionIssues = React.useMemo(
    () => actions.map(automationActionIssue),
    [actions],
  );
  const nameError = name.trim() ? null : "Give the rule a name.";
  const actionsError = actions.length === 0 ? "Add at least one action." : null;
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
    const rowSummary = describeIncompleteRows([
      { noun: "condition", numbers: incompleteRowNumbers(conditionIssues) },
      { noun: "action", numbers: incompleteRowNumbers(actionIssues) },
    ]);
    const problems = [nameError, actionsError, rowSummary].filter(
      (problem): problem is string => problem !== null,
    );
    // Stop before sending: the server would reject the rule with a generic
    // payload error that doesn't say which row is incomplete.
    if (problems.length > 0) {
      setShowErrors(true);
      toast.error(problems.join(" "));
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
    <SettingsEditorForm
      draft={{ name, description, enabled, trigger, conditions, actions }}
      canSave={isDirty}
      isNew={!rule}
      isSaving={save.isPending}
      noun="rule"
      onSave={() => void handleSave()}
      onCancel={onCancel}
    >
      <SettingsRow
        label="Name"
        htmlFor="automation-name"
        error={showErrors ? (nameError ?? undefined) : undefined}
      >
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
        control
        label="Enabled"
        description="Turn off to keep the rule saved but skipped once rules start running."
      >
        <div className="flex items-center gap-2">
          <Switch
            checked={enabled}
            onCheckedChange={setEnabled}
            aria-label="Enabled"
          />
          <span className="text-xs text-muted-foreground">
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
          items={SUPPORT_AUTOMATION_TRIGGERS.map((kind) => ({
            value: kind,
            label: formatTrigger(kind),
          }))}
          value={trigger}
          onValueChange={(value) => {
            if (value !== null) setTrigger(value);
          }}
        >
          <div className="max-w-sm">
            <SelectTrigger aria-label="Trigger">
              <SelectValue />
            </SelectTrigger>
          </div>
          <SelectContent>
            {SUPPORT_AUTOMATION_TRIGGERS.map((kind) => (
              <SelectItem key={kind} value={kind}>
                {formatTrigger(kind)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SettingsRow>

      <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Conditions
          </span>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={handleAddCondition}
          >
            <Plus className="size-3" />
            Add condition
          </Button>
        </div>
        {conditions.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No conditions, the rule fires for every event.
          </p>
        ) : (
          <ol className="flex flex-col gap-2">
            {conditionRows.map(({ id, value: condition }, index) => (
              <AutomationConditionRow
                key={id}
                index={index}
                error={showErrors ? conditionIssues[index] : null}
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
          </ol>
        )}
      </div>

      <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Actions
          </span>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={handleAddAction}
          >
            <Plus className="size-3" />
            Add action
          </Button>
        </div>
        {actions.length === 0 ? (
          showErrors && actionsError ? (
            <FieldError>{actionsError}</FieldError>
          ) : (
            <p className="text-xs text-muted-foreground">
              Add at least one action to save the rule.
            </p>
          )
        ) : (
          <ol className="flex flex-col gap-2">
            {actionRows.map(({ id, value: action }, index) => (
              <AutomationActionRow
                key={id}
                index={index}
                error={showErrors ? actionIssues[index] : null}
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
          </ol>
        )}
      </div>

      <AutomationDryRunPreview rule={previewRule} />
    </SettingsEditorForm>
  );
}

/** A trigger as staff read it, in sentence case. */
export function formatTrigger(kind: SupportAutomationRule["trigger"]): string {
  return AUTOMATION_TRIGGER_LABELS[kind];
}
