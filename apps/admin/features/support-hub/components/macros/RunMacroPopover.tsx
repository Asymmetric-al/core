"use client";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@asym/ui/components/shadcn/command";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { MacroPreviewLine } from "./MacroPreviewLine";
import { useSupportMacros } from "../../hooks/use-support-macros";
import { useRunSupportMacro } from "../../hooks/use-support-mutations";
import { useCurrentSupportAgentId } from "../../lib/current-agent";

import type { SupportConversation, SupportMacro } from "../../types";

interface RunMacroPopoverProps {
  conversation: SupportConversation;
  /** Called when a macro action handed back a rendered canned response body. */
  onCannedResponseInsert?: (input: { text: string; html: string }) => void;
  /** Hides the popover after a successful run. */
  onAfterRun?: () => void;
}

/**
 * Searchable list of macros. Selecting a macro runs it through
 * `useRunSupportMacro` against the active conversation and reports the
 * outcome via sonner.
 */
export function RunMacroPopover({
  conversation,
  onCannedResponseInsert,
  onAfterRun,
}: RunMacroPopoverProps) {
  const { data: macros } = useSupportMacros();
  const runMacro = useRunSupportMacro();
  const currentAgentId = useCurrentSupportAgentId();
  const [busyMacroId, setBusyMacroId] = React.useState<string | null>(null);

  const handleRun = async (macro: SupportMacro) => {
    if (!currentAgentId) {
      toast.error("No agent matched the current Mission Control user yet.");
      return;
    }
    setBusyMacroId(macro.id);
    try {
      const result = await runMacro.mutateAsync({
        conversationId: conversation.id,
        macroId: macro.id,
        authorAgentId: currentAgentId,
        onCannedResponseInsert,
      });
      const failed = result.outcomes.filter(
        (outcome) => outcome.status === "failed",
      );
      if (failed.length > 0) {
        toast.error(
          `Macro "${macro.name}" finished with ${failed.length} failed step(s).`,
        );
      } else {
        toast.success(`Ran macro "${macro.name}".`);
      }
      onAfterRun?.();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : `Could not run macro "${macro.name}".`,
      );
    } finally {
      setBusyMacroId(null);
    }
  };

  return (
    <Command>
      <CommandInput placeholder="Search macros..." className="h-9" />
      <CommandList>
        <CommandEmpty>
          No macros yet. Create one from the macros settings (coming in Phase
          6).
        </CommandEmpty>
        <CommandGroup heading="Macros">
          {macros.map((macro) => (
            <CommandItem
              key={macro.id}
              value={`${macro.name} ${macro.description ?? ""}`}
              onSelect={() => void handleRun(macro)}
              className="flex flex-col items-start gap-1"
              disabled={busyMacroId !== null}
            >
              <div className="flex w-full items-center justify-between gap-2">
                <span className="text-[13px] font-medium text-zinc-900">
                  {macro.name}
                </span>
                {busyMacroId === macro.id ? (
                  <Loader2 className="size-3.5 animate-spin text-zinc-400" />
                ) : null}
              </div>
              {macro.description ? (
                <p className="text-[11px] text-zinc-500">{macro.description}</p>
              ) : null}
              <MacroPreviewLine actions={macro.actions} />
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
