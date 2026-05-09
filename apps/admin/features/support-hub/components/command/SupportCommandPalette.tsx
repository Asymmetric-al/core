"use client";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@asym/ui/components/shadcn/command";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Clock,
  Folder,
  Inbox,
  LayoutGrid,
  Mail,
  StickyNote,
  TableProperties,
  Tag,
  UserCheck,
  UserX,
  Wand2,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { InboxShortcutHints } from "./InboxShortcutHints";
import { useSupportCommandPalette } from "./use-support-command-palette";
import { useSupportConversations } from "../../hooks/use-support-conversations";
import { useSupportMacros } from "../../hooks/use-support-macros";
import {
  useApplyRoundRobinAssignment,
  useAssignSupportConversation,
  useRunSupportMacro,
  useSetSupportConversationStatus,
  useSnoozeSupportConversation,
} from "../../hooks/use-support-mutations";
import { useSupportSavedViews } from "../../hooks/use-support-saved-views";
import { useCurrentSupportAgentId } from "../../lib/current-agent";
import { macroNeedsComposerInsert } from "../../lib/macro-runner";
import { useSupportInboxState } from "../../lib/route-state";

import type {
  SupportInboxRouteState,
  SupportMacro,
  SupportSavedView,
} from "../../types";

const HOUR_MS = 60 * 60 * 1000;

/**
 * Inbox-scoped command palette. Opens with `Cmd/Ctrl + K` (wired through
 * `useInboxShortcuts`). Sections:
 *
 *   1. Navigation       — switch view tabs / layout, jump to inbox
 *   2. This conversation — resolve / pending / snooze / assign / round-robin
 *   3. Macros           — every saved macro
 *   4. Saved views      — every saved-view filter
 *   5. Quick reply tone — switch composer mode (handled by the keyboard map)
 *
 * Keeps the global Mission Control dialog untouched — no window listener,
 * no overlap with the global search shortcut.
 */
export function SupportCommandPalette() {
  const palette = useSupportCommandPalette();
  const { state, setState } = useSupportInboxState();
  const conversations = useSupportConversations();
  const { data: macros } = useSupportMacros();
  const { data: savedViews } = useSupportSavedViews();
  const currentAgentId = useCurrentSupportAgentId();
  const setStatus = useSetSupportConversationStatus();
  const snooze = useSnoozeSupportConversation();
  const assign = useAssignSupportConversation();
  const runMacro = useRunSupportMacro();
  const roundRobin = useApplyRoundRobinAssignment();

  const selectedConversation = React.useMemo(() => {
    const id = state.selectedConversationId;
    if (!id) return null;
    return conversations.data.find((row) => row.id === id) ?? null;
  }, [conversations.data, state.selectedConversationId]);

  const close = palette.close;

  const wrap = React.useCallback(
    <T,>(action: () => T) => {
      const result = action();
      close();
      return result;
    },
    [close],
  );

  const handleSelectView = (view: SupportInboxRouteState["view"]) => {
    wrap(() => setState({ view }));
  };

  const handleToggleLayout = () => {
    wrap(() =>
      setState({ layout: state.layout === "board" ? "table" : "board" }),
    );
  };

  const handleApplySavedView = (view: SupportSavedView) => {
    wrap(() => {
      setState({
        view: view.filter.view,
        layout: view.filter.layout,
        status: view.filter.status,
        q: view.filter.q,
        labelSlugs: view.filter.labelSlugs,
        assignee: view.filter.assignee,
      });
      toast.success(`Applied "${view.name}".`);
    });
  };

  const ensureSelected = () => {
    if (!selectedConversation) {
      toast.info("Pick a conversation first.");
      return null;
    }
    return selectedConversation;
  };

  const handleStatus = async (status: "open" | "pending" | "resolved") => {
    const target = ensureSelected();
    if (!target) return;
    close();
    await setStatus.mutateAsync({ conversationId: target.id, status });
  };

  const handleSnooze = async (hours: number) => {
    const target = ensureSelected();
    if (!target) return;
    close();
    await snooze.mutateAsync({
      conversationId: target.id,
      snoozedUntil: new Date(Date.now() + hours * HOUR_MS).toISOString(),
    });
  };

  const handleAssignSelf = async () => {
    const target = ensureSelected();
    if (!target) return;
    if (!currentAgentId) {
      toast.error("No agent matched the current Mission Control user yet.");
      return;
    }
    close();
    await assign.mutateAsync({
      conversationId: target.id,
      assigneeAgentId: currentAgentId,
    });
  };

  const handleUnassign = async () => {
    const target = ensureSelected();
    if (!target) return;
    close();
    await assign.mutateAsync({
      conversationId: target.id,
      assigneeAgentId: null,
    });
  };

  const handleRoundRobin = async () => {
    const target = ensureSelected();
    if (!target) return;
    close();
    await roundRobin.mutateAsync({
      conversationId: target.id,
      authorAgentId: currentAgentId ?? undefined,
    });
  };

  const handleRunMacro = async (macro: SupportMacro) => {
    const target = ensureSelected();
    if (!target) return;
    if (!currentAgentId) {
      toast.error("No agent matched the current Mission Control user yet.");
      return;
    }
    if (macroNeedsComposerInsert(macro)) {
      toast.error("Open the reply composer to insert canned responses.");
      return;
    }
    close();
    await runMacro.mutateAsync({
      conversationId: target.id,
      macroId: macro.id,
      authorAgentId: currentAgentId,
    });
  };

  const handleSwitchMode = (mode: "reply" | "note") => {
    wrap(() => {
      // No state to flip from here — the composer reads its mode locally.
      // This entry is left as a deliberate keyboard hint so the palette can
      // surface the action; the actual mode switch happens via `r` / `n`.
      toast.info(
        mode === "reply"
          ? 'Use the "r" shortcut while a conversation is open.'
          : 'Use the "n" shortcut while a conversation is open.',
      );
    });
  };

  return (
    <CommandDialog
      open={palette.isOpen}
      onOpenChange={(open) => (open ? palette.open() : palette.close())}
      title="Support hub commands"
      description="Run support actions, switch views, or trigger macros without leaving the keyboard."
      className="max-w-2xl"
      showCloseButton
    >
      <CommandInput placeholder="Search support actions..." />
      <CommandList>
        <CommandEmpty>No actions match.</CommandEmpty>

        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => handleSelectView("all")}>
            <Inbox className="size-3.5 text-zinc-500" />
            All conversations
          </CommandItem>
          <CommandItem onSelect={() => handleSelectView("mine")}>
            <Inbox className="size-3.5 text-zinc-500" />
            My conversations
          </CommandItem>
          <CommandItem onSelect={() => handleSelectView("unassigned")}>
            <Inbox className="size-3.5 text-zinc-500" />
            Unassigned
          </CommandItem>
          <CommandItem onSelect={() => handleSelectView("past-due")}>
            <Inbox className="size-3.5 text-zinc-500" />
            Past due
          </CommandItem>
          <CommandItem onSelect={() => handleSelectView("escalated")}>
            <Inbox className="size-3.5 text-zinc-500" />
            Escalated
          </CommandItem>
          <CommandItem onSelect={handleToggleLayout}>
            {state.layout === "board" ? (
              <TableProperties className="size-3.5 text-zinc-500" />
            ) : (
              <LayoutGrid className="size-3.5 text-zinc-500" />
            )}
            Switch to {state.layout === "board" ? "table" : "board"} layout
          </CommandItem>
        </CommandGroup>

        {selectedConversation ? (
          <>
            <CommandSeparator />
            <CommandGroup
              heading={`Conversation — ${selectedConversation.subject ?? "Untitled"}`}
            >
              <CommandItem onSelect={() => void handleStatus("resolved")}>
                <CheckCircle2 className="size-3.5 text-emerald-600" />
                Resolve
              </CommandItem>
              <CommandItem onSelect={() => void handleStatus("pending")}>
                <Clock className="size-3.5 text-amber-500" />
                Mark pending
              </CommandItem>
              <CommandItem onSelect={() => void handleStatus("open")}>
                <ArrowUp className="size-3.5 text-zinc-500" />
                Reopen
              </CommandItem>
              <CommandItem onSelect={() => void handleSnooze(24)}>
                <ArrowDown className="size-3.5 text-zinc-500" />
                Snooze 24h
              </CommandItem>
              <CommandItem onSelect={() => void handleAssignSelf()}>
                <UserCheck className="size-3.5 text-zinc-500" />
                Assign to me
              </CommandItem>
              <CommandItem onSelect={() => void handleUnassign()}>
                <UserX className="size-3.5 text-zinc-500" />
                Unassign
              </CommandItem>
              <CommandItem onSelect={() => void handleRoundRobin()}>
                <Tag className="size-3.5 text-zinc-500" />
                Round-robin assign
              </CommandItem>
            </CommandGroup>
          </>
        ) : null}

        {macros.length > 0 ? (
          <>
            <CommandSeparator />
            <CommandGroup heading="Macros">
              {macros.map((macro) => (
                <CommandItem
                  key={macro.id}
                  onSelect={() => void handleRunMacro(macro)}
                >
                  <Wand2 className="size-3.5 text-zinc-500" />
                  {macro.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        ) : null}

        {savedViews.length > 0 ? (
          <>
            <CommandSeparator />
            <CommandGroup heading="Saved views">
              {savedViews.map((view) => (
                <CommandItem
                  key={view.id}
                  onSelect={() => handleApplySavedView(view)}
                >
                  <Folder className="size-3.5 text-zinc-500" />
                  {view.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        ) : null}

        <CommandSeparator />
        <CommandGroup heading="Quick reply tone">
          <CommandItem onSelect={() => handleSwitchMode("reply")}>
            <Mail className="size-3.5 text-zinc-500" />
            Switch composer to reply
          </CommandItem>
          <CommandItem onSelect={() => handleSwitchMode("note")}>
            <StickyNote className="size-3.5 text-amber-500" />
            Switch composer to internal note
          </CommandItem>
        </CommandGroup>
      </CommandList>
      <InboxShortcutHints />
    </CommandDialog>
  );
}
