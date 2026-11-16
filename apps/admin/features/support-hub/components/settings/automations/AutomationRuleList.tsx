"use client";

import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@asym/ui/components/shadcn/item";
import { Pencil, Plus, Trash2, Zap } from "lucide-react";
import { toast } from "sonner";

import { AutomationRuleForm, formatTrigger } from "./AutomationRuleForm";
import { useSupportAutomationRules } from "../../../hooks/use-support-automation-rules";
import { useDeleteSupportAutomationRule } from "../../../hooks/use-support-mutations";
import { useConfirm } from "../../workspace/confirm-provider";
import { SupportEmptySection } from "../../workspace/SupportEmptySection";
import { SettingsEditorSheet } from "../SettingsEditorSheet";
import {
  SettingsListState,
  isSettingsListPending,
  settingsHeaderAction,
} from "../SettingsListState";
import { SettingsNotAppliedNote } from "../SettingsNotAppliedNote";
import { SettingsPanel } from "../SettingsPanel";
import { SettingsIconButton } from "../SettingsRowActions";
import { useSettingsEditor } from "../use-settings-editor";

import type { SupportAutomationRule } from "../../../types";

function plural(count: number, noun: string) {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

export function AutomationRuleList() {
  const query = useSupportAutomationRules();
  const rules = query.data;
  const listState = {
    isLoading: query.isLoading,
    isError: query.isError,
    itemCount: rules.length,
  };
  const deleteRule = useDeleteSupportAutomationRule();
  const editor = useSettingsEditor<SupportAutomationRule>();
  const editingRule = editor.record;

  const confirm = useConfirm();
  const handleDelete = async (rule: SupportAutomationRule) => {
    await confirm({
      title: `Delete the ${rule.name} rule?`,
      description: "The rule, its conditions and its actions are removed.",
      confirmLabel: "Delete rule",
      action: async () => {
        try {
          await deleteRule.mutateAsync({ id: rule.id });
          toast.success("Inbox rule deleted.");
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Could not delete the inbox rule.",
          );
          throw error;
        }
      },
    });
  };

  const createButton = (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={isSettingsListPending(listState)}
      onClick={editor.openNew}
    >
      <Plus data-icon="inline-start" aria-hidden="true" />
      New rule
    </Button>
  );

  return (
    <div className="flex flex-col gap-4">
      <SettingsNotAppliedNote>
        Rules don’t run on their own yet, so saving a rule changes no
        conversations. Open a rule to see what its dry run would change.
      </SettingsNotAppliedNote>
      <SettingsPanel
        title="Inbox rules"
        description="Each rule names a trigger, the conditions to check and the actions to take."
        actions={settingsHeaderAction(listState, createButton)}
      >
        <SettingsListState
          noun="inbox rules"
          {...listState}
          onRetry={query.refetch}
        >
          {rules.length === 0 ? (
            <SupportEmptySection
              icon={<Zap className="size-4" />}
              title="No inbox rules yet"
              description="Draft a rule that would label, assign or snooze donor conversations, then test it with a dry run."
              action={createButton}
            />
          ) : (
            <ItemGroup className="gap-2">
              {rules.map((rule) => (
                <Item key={rule.id} variant="outline" size="sm">
                  <ItemMedia variant="icon">
                    <Zap aria-hidden="true" />
                  </ItemMedia>
                  <ItemContent className="min-w-0">
                    <ItemTitle>
                      {rule.name}
                      <Badge variant="secondary">
                        {formatTrigger(rule.trigger)}
                      </Badge>
                    </ItemTitle>
                    {rule.description ? (
                      <ItemDescription>{rule.description}</ItemDescription>
                    ) : null}
                    <ItemDescription>
                      {plural(rule.conditions.length, "condition")} ·{" "}
                      {plural(rule.actions.length, "action")}
                    </ItemDescription>
                  </ItemContent>
                  {/* Rules don't run yet, so there is no on/off switch. */}
                  <ItemActions>
                    <SettingsIconButton
                      label={`Edit ${rule.name}`}
                      tooltip="Edit"
                      onClick={() => editor.openRecord(rule)}
                    >
                      <Pencil aria-hidden="true" />
                    </SettingsIconButton>
                    <SettingsIconButton
                      label={`Delete ${rule.name}`}
                      tooltip="Delete"
                      onClick={() => void handleDelete(rule)}
                    >
                      <Trash2 aria-hidden="true" />
                    </SettingsIconButton>
                  </ItemActions>
                </Item>
              ))}
            </ItemGroup>
          )}
        </SettingsListState>
      </SettingsPanel>

      <SettingsEditorSheet
        editor={editor}
        wide
        title={editingRule ? `Edit “${editingRule.name}”` : "New inbox rule"}
        description="A rule matches when its trigger happens and every condition is true. Use the dry run below to preview it before saving."
      >
        <AutomationRuleForm
          key={editingRule?.id ?? "new-rule"}
          rule={editingRule}
          onSaved={editor.close}
          onCancel={editor.requestClose}
        />
      </SettingsEditorSheet>
    </div>
  );
}
