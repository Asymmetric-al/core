import { AgentBridge } from "@asym/ui/components/primitives/agent-bridge";
import {
  SortableList,
  SortableListHandle,
  SortableListItem,
} from "@asym/ui/components/primitives/sortable-list";
import { Button } from "@asym/ui/components/shadcn/button";
import React, { useEffect, useState } from "react";
import { hydrateRoot } from "react-dom/client";

declare global {
  interface Window {
    __changes?: { order: string[]; reason: string; source: string }[];
    __recoverableErrors?: string[];
  }
}

// Like Mission Control's macro editor, each row shows its type and its detail
// as separate text, and its label names both.
const STEPS = [
  { key: "assign", label: "Assign to agent", detail: "Support" },
  { key: "label", label: "Add label", detail: "Urgent" },
  { key: "note", label: "Add private note", detail: "Callback" },
  { key: "status", label: "Change status", detail: "Open" },
];
const LABELS = new Map(STEPS.map((step) => [step.key, step.label]));
const DETAILS = new Map(STEPS.map((step) => [step.key, step.detail]));
const ALLOW = [{ component: "sortable-list", actions: ["move"] }] as const;

// Imports the shared wrappers exactly as Mission Control's macro editor and
// shell do. The spec renders this on the server first, then hydrates it.
export function App() {
  const [order, setOrder] = useState(STEPS.map((step) => step.key));

  useEffect(() => {
    document.documentElement.dataset.hydrated = "true";
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-start gap-4 bg-background p-6 text-foreground">
      <AgentBridge allow={ALLOW} />
      <Button type="button" variant="outline">
        Before list
      </Button>
      <SortableList
        aria-label="Macro actions"
        value={order}
        onValueChange={(next, details) => {
          (window.__changes ??= []).push({
            order: next,
            reason: details.reason,
            source: details.source,
          });
          setOrder(next);
        }}
        className="flex w-80 flex-col gap-2"
      >
        {({ order: shown, move }) =>
          shown.map((key, index) => (
            <SortableListItem
              key={key}
              value={key}
              label={`Action ${index + 1}: ${LABELS.get(key)} ${DETAILS.get(key)}`}
              className="flex items-center gap-2 rounded-lg border bg-card p-2"
            >
              <SortableListHandle aria-label={`Move ${LABELS.get(key)}`} />
              <span data-step="" className="grow text-sm">
                {LABELS.get(key)}
              </span>
              <span className="text-sm">{DETAILS.get(key)}</span>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={index === 0}
                onClick={() => move(key, index - 1)}
              >
                Up
              </Button>
            </SortableListItem>
          ))
        }
      </SortableList>
      <output aria-label="Saved order">{order.join(",")}</output>
    </main>
  );
}

if (typeof document !== "undefined") {
  hydrateRoot(document.getElementById("root")!, <App />, {
    onRecoverableError: (error) => {
      (window.__recoverableErrors ??= []).push(String(error));
    },
  });
}
