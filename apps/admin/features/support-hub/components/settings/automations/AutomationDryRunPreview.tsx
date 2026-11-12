"use client";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@asym/ui/components/shadcn/alert";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { SearchableSelect } from "@asym/ui/components/shadcn/searchable-select";
import { CircleCheck, CircleX, FlaskConical } from "lucide-react";
import * as React from "react";

import { useSupportConversations } from "../../../hooks/use-support-conversations";
import {
  evaluateSupportAutomationRule,
  type AutomationEvaluationResult,
} from "../../../lib/automation-engine";
import { MacroPreviewLine } from "../../macros/MacroPreviewLine";
import { SettingsListState } from "../SettingsListState";
import { labelForKind } from "./AutomationActionRow";

import type { SupportAutomationRule } from "../../../types";

interface AutomationDryRunPreviewProps {
  rule: SupportAutomationRule;
}

function AutomationDryRunResult({
  result,
}: {
  result: AutomationEvaluationResult;
}) {
  const unsupportedLabelId = React.useId();
  return (
    <Alert role="status" variant={result.matches ? "success" : "default"}>
      {result.matches ? (
        <CircleCheck aria-hidden="true" />
      ) : (
        <CircleX aria-hidden="true" />
      )}
      <AlertTitle>
        {result.matches ? "Rule matches" : "Rule does not match"}
      </AlertTitle>
      <AlertDescription>
        {result.reasons.length > 0 ? (
          <ul className="flex list-disc flex-col gap-1 pl-4">
            {result.reasons.map((reason, index) => (
              <li key={`${index}-${reason}`}>{reason}</li>
            ))}
          </ul>
        ) : null}

        {result.matches && result.plannedActions.length > 0 ? (
          <div className="flex flex-col gap-1.5 pt-1">
            <p className="font-medium text-foreground">Planned actions</p>
            <MacroPreviewLine actions={result.plannedActions} />
          </div>
        ) : null}

        {/* No support automation runner exists yet, so these are only named,
            never described as running somewhere else. */}
        {result.unsupportedActions.length > 0 ? (
          <div
            role="group"
            aria-labelledby={unsupportedLabelId}
            className="flex flex-col gap-1.5 pt-1"
          >
            <p id={unsupportedLabelId} className="font-medium text-foreground">
              Not simulated in this preview
            </p>
            <ul className="flex flex-wrap items-center gap-1">
              {result.unsupportedActions.map((action, index) => (
                <li key={`${action.kind}-${index}`}>
                  <Badge variant="outline">{labelForKind(action.kind)}</Badge>
                </li>
              ))}
            </ul>
            <p>This preview doesn’t simulate these actions.</p>
          </div>
        ) : null}
      </AlertDescription>
    </Alert>
  );
}

export function AutomationDryRunPreview({
  rule,
}: AutomationDryRunPreviewProps) {
  const conversations = useSupportConversations();
  const rows = conversations.data;
  const firstConversationId = rows[0]?.id ?? null;
  const [selectedConversationId, setSelectedConversationId] = React.useState<
    string | null
  >(firstConversationId);
  if (selectedConversationId === null && firstConversationId !== null) {
    setSelectedConversationId(firstConversationId);
  }
  const conversationId = selectedConversationId ?? "";

  const target = rows.find((row) => row.id === conversationId);
  const result = React.useMemo(() => {
    if (!target) return null;
    return evaluateSupportAutomationRule(rule, { conversation: target });
  }, [rule, target]);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-0.5">
        <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
          <FlaskConical aria-hidden="true" className="size-3.5" />
          Dry run
        </span>
        <p className="text-xs text-muted-foreground">
          Tests this rule against one conversation. Nothing is changed.
        </p>
      </div>
      <SearchableSelect
        items={rows.map((row) => ({ value: row.id, label: row.subject }))}
        value={conversationId}
        onValueChange={(value) => {
          if (value !== null) setSelectedConversationId(value);
        }}
        disabled={rows.length === 0}
        aria-label="Conversation to test"
        placeholder="Choose a conversation to test"
      />

      <SettingsListState
        noun="conversations"
        isLoading={conversations.isLoading}
        isError={conversations.isError}
        itemCount={rows.length}
        onRetry={conversations.refetch}
      >
        {result ? (
          <AutomationDryRunResult result={result} />
        ) : (
          <p className="text-xs text-muted-foreground">
            No conversations to test against yet.
          </p>
        )}
      </SettingsListState>
    </div>
  );
}
