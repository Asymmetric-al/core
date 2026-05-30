"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import { Switch } from "@asym/ui/components/shadcn/switch";
import { Pencil, Plus, Trash2, Zap } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { AutomationRuleForm } from "./AutomationRuleForm";
import { useSupportAutomationRules } from "../../../hooks/use-support-automation-rules";
import {
  useDeleteSupportAutomationRule,
  useToggleSupportAutomationRule,
} from "../../../hooks/use-support-mutations";
import { SupportEmptySection } from "../../workspace/SupportEmptySection";
import { SettingsPanel } from "../SettingsPanel";

import type { SupportAutomationRule } from "../../../types";

export function AutomationRuleList() {
  const { data: rules } = useSupportAutomationRules();
  const deleteRule = useDeleteSupportAutomationRule();
  const toggleRule = useToggleSupportAutomationRule();
  const [editing, setEditing] = React.useState<
    SupportAutomationRule | "new" | null
  >(null);

  const editingRule = editing && editing !== "new" ? editing : null;

  const handleDelete = async (rule: SupportAutomationRule) => {
    if (!window.confirm(`Delete rule "${rule.name}"?`)) return;
    try {
      await deleteRule.mutateAsync({ id: rule.id });
      toast.success("Automation deleted.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not delete the automation.",
      );
    }
  };

  const handleToggle = async (rule: SupportAutomationRule, value: boolean) => {
    try {
      await toggleRule.mutateAsync({ id: rule.id, enabled: value });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not update the automation.",
      );
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <SettingsPanel
        title="Automations"
        description="Typed event → condition → action rules. Runtime evaluation lands with the Phase 7 inbound router."
        actions={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setEditing("new")}
            className="h-8 gap-1.5 rounded-lg px-3 text-xs"
          >
            <Plus className="size-3.5" />
            New rule
          </Button>
        }
      >
        {rules.length === 0 ? (
          <SupportEmptySection
            icon={<Zap className="size-4" />}
            title="No automation rules yet"
            description="Create a rule to auto-label, auto-assign, or snooze donor conversations."
          />
        ) : (
          <ul className="flex flex-col divide-y divide-zinc-100">
            {rules.map((rule) => (
              <li
                key={rule.id}
                className="flex flex-wrap items-start gap-3 py-3"
              >
                <span className="flex size-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500">
                  <Zap className="size-4" />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="text-[13px] font-semibold text-zinc-900">
                    {rule.name}
                    <span className="ml-2 inline-flex h-4 items-center rounded-md bg-zinc-100 px-1.5 text-[9px] font-black uppercase tracking-wider text-zinc-500">
                      {rule.trigger.replace(/_/g, " ")}
                    </span>
                  </span>
                  {rule.description ? (
                    <span className="text-[11px] text-zinc-500">
                      {rule.description}
                    </span>
                  ) : null}
                  <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                    {rule.conditions.length} conditions · {rule.actions.length}{" "}
                    actions
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={rule.enabled}
                    onCheckedChange={(value) => void handleToggle(rule, value)}
                    aria-label={`Toggle ${rule.name}`}
                  />
                  <span className="text-[11px] text-zinc-500">
                    {rule.enabled ? "On" : "Off"}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditing(rule)}
                  aria-label={`Edit ${rule.name}`}
                  className="size-8 text-zinc-500 hover:text-zinc-900"
                >
                  <Pencil className="size-3.5" aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => void handleDelete(rule)}
                  aria-label={`Delete ${rule.name}`}
                  className="size-8 text-rose-500 hover:bg-rose-50 hover:text-rose-700"
                >
                  <Trash2 className="size-3.5" aria-hidden="true" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </SettingsPanel>
      {editing ? (
        <AutomationRuleForm
          rule={editingRule}
          onSaved={() => setEditing(null)}
          onCancel={() => setEditing(null)}
        />
      ) : null}
    </div>
  );
}
