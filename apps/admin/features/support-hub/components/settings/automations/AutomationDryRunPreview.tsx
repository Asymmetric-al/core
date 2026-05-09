"use client";

import { useSupportConversationsLive } from "@asym/database/hooks";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@asym/ui/components/shadcn/select";
import { CheckCircle2, FlaskConical, XCircle } from "lucide-react";
import * as React from "react";

import { evaluateSupportAutomationRule } from "../../../lib/automation-engine";
import { MacroPreviewLine } from "../../macros/MacroPreviewLine";

import type {
  SupportAutomationAction,
  SupportAutomationRule,
  SupportConversation,
} from "../../../types";

interface AutomationDryRunPreviewProps {
  rule: SupportAutomationRule;
}

export function AutomationDryRunPreview({
  rule,
}: AutomationDryRunPreviewProps) {
  const conversations = useSupportConversationsLive();
  const rows = React.useMemo<SupportConversation[]>(
    () => (conversations.data ?? []) as SupportConversation[],
    [conversations.data],
  );
  const [conversationId, setConversationId] = React.useState<string>(
    rows[0]?.id ?? "",
  );

  React.useEffect(() => {
    if (!conversationId && rows[0]?.id) {
      setConversationId(rows[0].id);
    }
  }, [conversationId, rows]);

  const target = rows.find((row) => row.id === conversationId);
  const result = React.useMemo(() => {
    if (!target) return null;
    return evaluateSupportAutomationRule(rule, { conversation: target });
  }, [rule, target]);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
          <FlaskConical className="size-3.5" />
          Dry run
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={rows.length === 0}
          onClick={() => {
            const next = rows[Math.floor(Math.random() * rows.length)];
            if (next) setConversationId(next.id);
          }}
          className="h-7 gap-1 rounded-lg px-2 text-[10px] font-bold uppercase tracking-wider"
        >
          Pick another
        </Button>
      </div>
      <Select
        value={conversationId}
        onValueChange={setConversationId}
        disabled={rows.length === 0}
      >
        <SelectTrigger className="h-9 text-[12px]">
          <SelectValue placeholder="Choose a conversation to test" />
        </SelectTrigger>
        <SelectContent>
          {rows.map((row) => (
            <SelectItem key={row.id} value={row.id}>
              {row.subject}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {!target ? (
        <p className="text-[12px] text-zinc-500">
          Open the inbox to seed conversations, then come back to dry-run this
          rule.
        </p>
      ) : result ? (
        <div className="flex flex-col gap-3">
          <span
            className={
              result.matches
                ? "inline-flex items-center gap-2 rounded-md bg-emerald-50 px-2 py-1 text-[12px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200"
                : "inline-flex items-center gap-2 rounded-md bg-zinc-100 px-2 py-1 text-[12px] font-semibold text-zinc-700"
            }
          >
            {result.matches ? (
              <CheckCircle2 className="size-3.5" />
            ) : (
              <XCircle className="size-3.5 text-zinc-400" />
            )}
            {result.matches ? "Rule matches" : "Rule does not match"}
          </span>

          {result.reasons.length > 0 ? (
            <ul className="flex flex-col gap-1">
              {result.reasons.map((reason, index) => (
                <li key={index} className="text-[11px] text-zinc-600">
                  • {reason}
                </li>
              ))}
            </ul>
          ) : null}

          {result.matches && result.plannedActions.length > 0 ? (
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                Planned actions
              </span>
              <MacroPreviewLine actions={result.plannedActions} />
            </div>
          ) : null}

          {result.unsupportedActions.length > 0 ? (
            <p className="text-[11px] text-amber-700">
              {result.unsupportedActions
                .map((action: SupportAutomationAction) => action.kind)
                .join(", ")}{" "}
              will run server-side in Phase 7 — dry-run only logs the intent.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
