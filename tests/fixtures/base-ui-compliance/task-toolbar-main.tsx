import "virtual:base-ui-styles";

import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

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

  return (
    <main
      id="task-toolbar-contracts"
      className="min-h-svh bg-background text-foreground"
    >
      <TasksPage />
      <output aria-label="Task action counts">
        {JSON.stringify(counts, null, 2)}
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
