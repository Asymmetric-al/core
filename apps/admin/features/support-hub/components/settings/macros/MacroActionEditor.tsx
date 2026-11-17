"use client";

import {
  SUPPORT_CONVERSATION_STATUSES,
  SUPPORT_PRIORITIES,
} from "@asym/database/hooks";
import {
  SortableList,
  SortableListHandle,
  SortableListItem,
} from "@asym/ui/components/primitives/sortable-list";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  FieldError,
  FieldSet,
  FieldLegend,
} from "@asym/ui/components/shadcn/field";
import { Input } from "@asym/ui/components/shadcn/input";
import { SearchableSelect } from "@asym/ui/components/shadcn/searchable-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@asym/ui/components/shadcn/select";
import { ArrowUp, ArrowDown, Plus, Trash2 } from "lucide-react";
import * as React from "react";

import {
  useSupportAgents,
  useSupportTeams,
} from "../../../hooks/use-support-agents";
import { useSupportCannedResponses } from "../../../hooks/use-support-canned-responses";
import { useSupportLabels } from "../../../hooks/use-support-labels";
import {
  CONVERSATION_PRIORITY_LABELS,
  CONVERSATION_STATUS_LABELS,
  MACRO_ACTION_LABELS,
} from "../../../lib/status-labels";
import { createDraftRow, type DraftRow } from "../draft-rows";

import type { SupportMacroAction } from "../../../types";

const ACTION_KINDS: SupportMacroAction["kind"][] = [
  "set_status",
  "set_priority",
  "assign_agent",
  "assign_team",
  "add_label",
  "remove_label",
  "send_canned_response",
  "snooze",
  "add_private_note",
];

interface MacroActionEditorProps {
  rows: DraftRow<SupportMacroAction>[];
  errors?: (string | null)[];
  emptyError?: string;
  onChange: (next: DraftRow<SupportMacroAction>[]) => void;
}

export function MacroActionEditor({
  rows,
  onChange,
  errors,
  emptyError,
}: MacroActionEditorProps) {
  const { data: labels } = useSupportLabels();
  const { data: cannedResponses } = useSupportCannedResponses();
  const { data: agents } = useSupportAgents();
  const { data: teams } = useSupportTeams();
  const addButtonRef = React.useRef<HTMLButtonElement>(null);
  const typeTriggerRefs = React.useRef(new Map<string, HTMLButtonElement>());

  const handleAdd = () => {
    onChange([...rows, createDraftRow(defaultActionForKind("set_status"))]);
  };

  const rowIds = React.useMemo(() => rows.map((row) => row.id), [rows]);

  const handleReorder = (ids: string[]) => {
    const next = ids.flatMap((id) => rows.find((row) => row.id === id) ?? []);
    if (next.length === rows.length) onChange(next);
  };

  // Removing a row takes its focused control with it, and the sheet would
  // send focus back to its top: focus a neighbouring row, or Add action.
  const handleRemove = (
    index: number,
    row: Element | null,
    neighbourId: string | undefined,
  ) => {
    if (row?.contains(document.activeElement)) {
      (
        (neighbourId ? typeTriggerRefs.current.get(neighbourId) : undefined) ??
        addButtonRef.current
      )?.focus();
    }
    onChange(rows.filter((_, i) => i !== index));
  };

  const handleKindChange = (
    index: number,
    kind: SupportMacroAction["kind"],
  ) => {
    const next = [...rows];
    const current = next[index];
    if (!current) return;
    next[index] = { ...current, value: defaultActionForKind(kind) };
    onChange(next);
  };

  const handlePatch = (index: number, patch: Partial<SupportMacroAction>) => {
    const next = [...rows];
    const current = next[index];
    if (!current) return;
    next[index] = {
      ...current,
      value: { ...current.value, ...patch } as SupportMacroAction,
    };
    onChange(next);
  };

  return (
    <FieldSet className="gap-2">
      <div className="flex items-center justify-between">
        <FieldLegend>Actions</FieldLegend>
        <Button
          ref={addButtonRef}
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleAdd}
        >
          <Plus data-icon="inline-start" aria-hidden="true" />
          Add action
        </Button>
      </div>

      {emptyError ? <FieldError>{emptyError}</FieldError> : null}
      {rows.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No actions yet. Add at least one to save the macro.
        </p>
      ) : (
        <SortableList
          aria-label="Macro actions"
          className="flex flex-col gap-2"
          value={rowIds}
          onValueChange={handleReorder}
        >
          {({ order, move }) =>
            order.map((id, position) => {
              // `order` follows an action while it is being moved; edits,
              // errors and removal still address its saved place in `rows`.
              const index = rows.findIndex((entry) => entry.id === id);
              const action = rows[index]?.value;
              if (!action) return null;
              const row = `Action ${position + 1}`;
              const errorProps = {
                "aria-invalid": !!errors?.[index],
                "aria-describedby": errors?.[index]
                  ? `macro-action-${id}-error`
                  : undefined,
              };
              return (
                <SortableListItem
                  key={id}
                  value={id}
                  // Agents name a row by this label, so two rows of one type
                  // must differ. It keeps the saved place, not `position`,
                  // because a move announces it while the row is moving.
                  label={`Action ${index + 1}: ${describeAction(action, {
                    labels,
                    agents,
                    teams,
                  })}`}
                  className="flex flex-wrap items-center gap-2 rounded-lg bg-muted/60 p-2"
                >
                  <SortableListHandle
                    aria-label={`Reorder action ${position + 1}: ${labelForKind(action.kind)}`}
                  />
                  <Select
                    items={ACTION_KINDS.map((kind) => ({
                      value: kind,
                      label: labelForKind(kind),
                    }))}
                    value={action.kind}
                    onValueChange={(value) => {
                      if (value !== null) handleKindChange(index, value);
                    }}
                  >
                    <SelectTrigger
                      ref={(element) => {
                        if (element) typeTriggerRefs.current.set(id, element);
                        else typeTriggerRefs.current.delete(id);
                      }}
                      aria-label={`${row} type`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTION_KINDS.map((kind) => (
                        <SelectItem key={kind} value={kind}>
                          {labelForKind(kind)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {action.kind === "set_status" ? (
                    <Select
                      items={SUPPORT_CONVERSATION_STATUSES.map((status) => ({
                        value: status,
                        label: CONVERSATION_STATUS_LABELS[status],
                      }))}
                      value={action.status}
                      onValueChange={(value) => {
                        if (value === null) return;
                        handlePatch(index, {
                          kind: "set_status",
                          status: value,
                        });
                      }}
                    >
                      <SelectTrigger aria-label={`${row} status`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SUPPORT_CONVERSATION_STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            {CONVERSATION_STATUS_LABELS[status]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : null}

                  {action.kind === "set_priority" ? (
                    <Select
                      items={SUPPORT_PRIORITIES.map((priority) => ({
                        value: priority,
                        label: CONVERSATION_PRIORITY_LABELS[priority],
                      }))}
                      value={action.priority}
                      onValueChange={(value) => {
                        if (value === null) return;
                        handlePatch(index, {
                          kind: "set_priority",
                          priority: value,
                        });
                      }}
                    >
                      <SelectTrigger aria-label={`${row} priority`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SUPPORT_PRIORITIES.map((priority) => (
                          <SelectItem key={priority} value={priority}>
                            {CONVERSATION_PRIORITY_LABELS[priority]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : null}

                  {action.kind === "assign_agent" ? (
                    <SearchableSelect
                      items={agents.map((agent) => ({
                        value: agent.id,
                        label: agent.name,
                      }))}
                      value={action.agentId}
                      onValueChange={(value) => {
                        if (value === null) return;
                        handlePatch(index, {
                          kind: "assign_agent",
                          agentId: value,
                        });
                      }}
                      aria-label={`${row} agent`}
                      {...errorProps}
                      placeholder="Pick an agent"
                    />
                  ) : null}

                  {action.kind === "assign_team" ? (
                    <SearchableSelect
                      items={teams.map((team) => ({
                        value: team.id,
                        label: team.name,
                      }))}
                      value={action.teamId}
                      onValueChange={(value) => {
                        if (value === null) return;
                        handlePatch(index, {
                          kind: "assign_team",
                          teamId: value,
                        });
                      }}
                      aria-label={`${row} team`}
                      {...errorProps}
                      placeholder="Pick a team"
                    />
                  ) : null}

                  {action.kind === "add_label" ||
                  action.kind === "remove_label" ? (
                    <SearchableSelect
                      items={labels.map((label) => ({
                        value: label.id,
                        label: label.name,
                      }))}
                      value={action.labelId}
                      onValueChange={(value) => {
                        if (value === null) return;
                        handlePatch(index, {
                          kind: action.kind,
                          labelId: value,
                        } as SupportMacroAction);
                      }}
                      aria-label={`${row} label`}
                      {...errorProps}
                      placeholder="Pick a label"
                    />
                  ) : null}

                  {action.kind === "send_canned_response" ? (
                    <SearchableSelect
                      items={cannedResponses.map((response) => ({
                        value: response.id,
                        label: response.title,
                      }))}
                      value={action.cannedResponseId}
                      onValueChange={(value) => {
                        if (value === null) return;
                        handlePatch(index, {
                          kind: "send_canned_response",
                          cannedResponseId: value,
                        });
                      }}
                      aria-label={`${row} canned response`}
                      {...errorProps}
                      placeholder="Pick a canned response"
                    />
                  ) : null}

                  {action.kind === "snooze" ? (
                    <Input
                      type="number"
                      min={1}
                      value={action.hours}
                      onChange={(event) =>
                        handlePatch(index, {
                          kind: "snooze",
                          hours: Number(event.target.value),
                        })
                      }
                      aria-label={`${row} hours to snooze`}
                      {...errorProps}
                    />
                  ) : null}

                  {action.kind === "add_private_note" ? (
                    <Input
                      value={action.bodyText}
                      onChange={(event) =>
                        handlePatch(index, {
                          kind: "add_private_note",
                          bodyText: event.target.value,
                        })
                      }
                      aria-label={`${row} note`}
                      {...errorProps}
                      placeholder="Note text"
                    />
                  ) : null}

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Move action ${position + 1} up`}
                    disabled={position === 0}
                    focusableWhenDisabled
                    onClick={() => move(id, position - 1)}
                  >
                    <ArrowUp aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Move action ${position + 1} down`}
                    disabled={position === order.length - 1}
                    focusableWhenDisabled
                    onClick={() => move(id, position + 1)}
                  >
                    <ArrowDown aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={(event) =>
                      handleRemove(
                        index,
                        event.currentTarget.closest("li"),
                        order[position + 1] ?? order[position - 1],
                      )
                    }
                    aria-label={`Remove action ${position + 1}: ${labelForKind(action.kind)}`}
                  >
                    <Trash2 aria-hidden="true" className="size-3.5" />
                  </Button>
                  {errors?.[index] ? (
                    <FieldError
                      id={`macro-action-${id}-error`}
                      className="basis-full"
                    >
                      {errors[index]}
                    </FieldError>
                  ) : null}
                  {action.kind === "assign_team" ? (
                    <p className="basis-full text-xs text-muted-foreground">
                      Skipped when the macro runs: conversations can’t be
                      assigned to a team yet.
                    </p>
                  ) : null}
                </SortableListItem>
              );
            })
          }
        </SortableList>
      )}
    </FieldSet>
  );
}

function defaultActionForKind(
  kind: SupportMacroAction["kind"],
): SupportMacroAction {
  switch (kind) {
    case "set_status":
      return { kind: "set_status", status: "resolved" };
    case "set_priority":
      return { kind: "set_priority", priority: "normal" };
    case "assign_agent":
      return { kind: "assign_agent", agentId: "" };
    case "assign_team":
      return { kind: "assign_team", teamId: "" };
    case "add_label":
      return { kind: "add_label", labelId: "" };
    case "remove_label":
      return { kind: "remove_label", labelId: "" };
    case "send_canned_response":
      return { kind: "send_canned_response", cannedResponseId: "" };
    case "snooze":
      return { kind: "snooze", hours: 24 };
    case "add_private_note":
      return { kind: "add_private_note", bodyText: "" };
    default: {
      const _exhaustive: never = kind;
      void _exhaustive;
      return { kind: "set_status", status: "open" };
    }
  }
}

function labelForKind(kind: SupportMacroAction["kind"]): string {
  return MACRO_ACTION_LABELS[kind];
}

type Named = { id: string; name: string }[];

function describeAction(
  action: SupportMacroAction,
  names: { labels: Named; agents: Named; teams: Named },
): string {
  const kind = labelForKind(action.kind);
  const naming = (list: Named, id: string) => {
    const name = list.find((item) => item.id === id)?.name;
    return name ? `${kind} ${name}` : kind;
  };
  switch (action.kind) {
    case "set_status":
      return `${kind} to ${CONVERSATION_STATUS_LABELS[action.status]}`;
    case "set_priority":
      return `${kind} to ${CONVERSATION_PRIORITY_LABELS[action.priority]}`;
    case "assign_agent":
      return naming(names.agents, action.agentId);
    case "assign_team":
      return naming(names.teams, action.teamId);
    case "add_label":
    case "remove_label":
      return naming(names.labels, action.labelId);
    default:
      return kind;
  }
}
