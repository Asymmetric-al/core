"use client";

import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@asym/ui/components/shadcn/alert";
import { Button, buttonVariants } from "@asym/ui/components/shadcn/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@asym/ui/components/shadcn/command";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";

import { MacroPreviewLine } from "./MacroPreviewLine";
import { useSupportMacros } from "../../hooks/use-support-macros";
import { useRunSupportMacro } from "../../hooks/use-support-mutations";
import { SUPPORT_AGENT_SETUP_MESSAGE } from "../../lib/agent-setup";
import { useCurrentSupportAgentId } from "../../lib/current-agent";
import { macroNeedsComposerInsert } from "../../lib/macro-runner";

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
  const macroQuery = useSupportMacros();
  const macros = macroQuery.data;
  const runMacro = useRunSupportMacro();
  const currentAgentId = useCurrentSupportAgentId();
  const [busyMacroId, setBusyMacroId] = React.useState<string | null>(null);

  const handleRun = async (macro: SupportMacro) => {
    if (!currentAgentId) {
      toast.error(SUPPORT_AGENT_SETUP_MESSAGE);
      return;
    }
    if (macroNeedsComposerInsert(macro) && !onCannedResponseInsert) {
      toast.error("Open the reply composer to insert canned responses.");
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

  if (macroQuery.isError)
    return (
      <Alert variant="destructive">
        <AlertTitle>Macros couldn’t load</AlertTitle>
        <AlertDescription>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void macroQuery.refetch()}
          >
            Try again
          </Button>
        </AlertDescription>
      </Alert>
    );
  if (macroQuery.isLoading || !macroQuery.isReady)
    return (
      <p role="status" className="p-4 text-sm text-muted-foreground">
        Loading macros…
      </p>
    );
  if (macros.length === 0)
    return (
      <div className="p-4 text-sm">
        <p>No macros yet.</p>
        <Link
          href="/support/settings/macros"
          className={buttonVariants({ variant: "link" })}
        >
          Set up macros
        </Link>
      </div>
    );
  return (
    <Command>
      <CommandInput popoverChrome placeholder="Search macros..." />
      <CommandList>
        <CommandEmpty>No macros match your search.</CommandEmpty>
        <CommandGroup heading="Macros">
          {macros.map((macro) => (
            <CommandItem
              key={macro.id}
              value={`${macro.name} ${macro.description ?? ""}`}
              onSelect={() => void handleRun(macro)}
              disabled={busyMacroId !== null}
            >
              <div className="flex w-full min-w-0 flex-col items-start gap-1">
                <div className="flex w-full items-center justify-between gap-2">
                  <span className="wrap-anywhere text-xs font-medium text-foreground">
                    {macro.name}
                  </span>
                  {busyMacroId === macro.id ? (
                    <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
                  ) : null}
                </div>
                {macro.description ? (
                  <p className="text-xs text-muted-foreground">
                    {macro.description}
                  </p>
                ) : null}
                <MacroPreviewLine actions={macro.actions} />
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
