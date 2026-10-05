import "virtual:base-ui-styles";

import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

import {
  completeTaskDeleteFixtureFromRefresh,
  setTaskDeleteFixtureMode,
  settleTaskDeleteFixture,
  useTaskDeleteFixtureState,
} from "./task-toolbar-hooks-stub";
import TasksPage from "../../../apps/missionary/app/tasks/page-client";
import { MotionProvider } from "../../../packages/lib/motion-provider";
import { ThemeProvider } from "../../../packages/ui/lib/theme-provider";

const initialCounts = {
  refresh: 0,
  complete: 0,
  reopen: 0,
  delete: 0,
  move: 0,
};

function TaskToolbarContracts() {
  const [counts, setCounts] = useState(initialCounts);
  const deletion = useTaskDeleteFixtureState();

  useEffect(() => {
    const record = (event: Event) => {
      if (!(event instanceof CustomEvent)) return;
      const action: unknown = event.detail;
      if (typeof action !== "string" || !(action in initialCounts)) return;
      const key = action as keyof typeof initialCounts;
      setCounts((current) => ({ ...current, [key]: current[key] + 1 }));
    };
    document.addEventListener("fixture-task-toolbar-action", record);
    return () =>
      document.removeEventListener("fixture-task-toolbar-action", record);
  }, []);

  useEffect(() => {
    const control = (event: Event) => {
      if (!(event instanceof CustomEvent)) return;
      const detail: unknown = event.detail;
      if (!detail || typeof detail !== "object" || !("command" in detail))
        return;
      if (detail.command === "mode" && "mode" in detail) {
        const mode = detail.mode;
        if (
          mode === "success" ||
          mode === "false" ||
          mode === "throw" ||
          mode === "deferred"
        ) {
          setTaskDeleteFixtureMode(mode);
        }
      } else if (
        detail.command === "settle" &&
        "success" in detail &&
        typeof detail.success === "boolean"
      ) {
        settleTaskDeleteFixture(detail.success);
      } else if (detail.command === "complete-from-refresh") {
        completeTaskDeleteFixtureFromRefresh();
      }
    };
    document.addEventListener("fixture-task-delete-control", control);
    return () =>
      document.removeEventListener("fixture-task-delete-control", control);
  }, []);

  return (
    <main
      id="task-toolbar-contracts"
      className="min-h-svh bg-background text-foreground"
    >
      <TasksPage />
      <output aria-label="Task action counts">
        {JSON.stringify(counts, null, 2)}
      </output>
      <output aria-label="Task deletion fixture state">
        {JSON.stringify(
          {
            mode: deletion.deleteMode,
            pending: deletion.deletePending,
            taskIds: deletion.tasks.map((item) => item.id),
          },
          null,
          2,
        )}
      </output>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <ThemeProvider
    attribute="class"
    forcedTheme="light"
    defaultTheme="light"
    enableSystem={false}
  >
    <MotionProvider>
      <TaskToolbarContracts />
    </MotionProvider>
  </ThemeProvider>,
);
