import React, { useRef, useState } from "react";
import { createRoot } from "react-dom/client";

import { TaskKanbanBoard } from "../../../packages/missionary/components/task-kanban-board";
import { Button } from "../../../packages/ui/components/shadcn/button";

import type { Task, TaskStatus } from "../../../packages/missionary/types";
import "virtual:base-ui-styles";

const initialTasks: Task[] = [
  {
    id: "call",
    missionary_id: "fixture",
    title: "Call Anna",
    task_type: "call",
    status: "not_started",
    priority: "none",
    sort_key: 100,
    is_auto_generated: false,
    created_at: "2026-10-22T00:00:00Z",
    updated_at: "2026-10-22T00:00:00Z",
  },
  {
    id: "newsletter",
    missionary_id: "fixture",
    title: "Send newsletter",
    task_type: "email",
    status: "not_started",
    priority: "none",
    sort_key: 200,
    is_auto_generated: false,
    created_at: "2026-10-22T00:00:00Z",
    updated_at: "2026-10-22T00:00:00Z",
  },
  {
    id: "review",
    missionary_id: "fixture",
    title: "Review support",
    task_type: "to_do",
    status: "in_progress",
    priority: "none",
    sort_key: 100,
    is_auto_generated: false,
    created_at: "2026-10-22T00:00:00Z",
    updated_at: "2026-10-22T00:00:00Z",
  },
];
function App() {
  const [tasks, setTasks] = useState(initialTasks);
  const requested = new URLSearchParams(location.search).get("moveResult");
  const [saveResult, setSaveResult] = useState<
    "success" | "false" | "throw" | "pending"
  >(
    requested === "false" || requested === "throw" || requested === "pending"
      ? requested
      : "success",
  );
  const finishSave = useRef<(() => void) | null>(null);
  const [saving, setSaving] = useState(false);
  const [moves, setMoves] = useState<
    { taskId: string; status: TaskStatus; index: number }[]
  >([]);
  return (
    <main className="min-h-svh bg-background text-foreground p-4 space-y-4">
      <h1>Task board contracts</h1>
      <div className="flex gap-2">
        <Button onClick={() => setSaveResult("success")}>Save normally</Button>
        <Button onClick={() => setSaveResult("false")}>Decline saves</Button>
        <Button onClick={() => setSaveResult("throw")}>Throw on saves</Button>
        <Button onClick={() => finishSave.current?.()}>Finish task save</Button>
      </div>
      <h2 className="sr-only">Tasks by status</h2>
      <TaskKanbanBoard
        tasks={tasks}
        onMoveTask={async (taskId, status, index) => {
          setMoves((current) => [...current, { taskId, status, index }]);
          if (saveResult === "pending") {
            setSaving(true);
            await new Promise<void>((resolve) => {
              finishSave.current = resolve;
            });
            finishSave.current = null;
            setSaving(false);
          }
          if (saveResult === "throw")
            throw new Error("Simulated task persistence failure");
          if (saveResult === "false") return false;
          setTasks((current) => {
            const moving = current.find((task) => task.id === taskId);
            if (!moving) return current;
            const destination = current
              .filter((task) => task.status === status && task.id !== taskId)
              .sort((a, b) => a.sort_key - b.sort_key);
            destination.splice(index, 0, { ...moving, status });
            return [
              ...current.filter(
                (task) => task.status !== status && task.id !== taskId,
              ),
              ...destination.map((task, position) => ({
                ...task,
                sort_key: (position + 1) * 100,
              })),
            ];
          });
          return true;
        }}
        onEditTask={() => {}}
        onCompleteTask={() => {}}
        onDeleteTask={() => {}}
      />
      <output aria-label="Task save phase">
        {saving ? "pending" : "idle"}
      </output>
      <output aria-label="Submitted task moves">{JSON.stringify(moves)}</output>
    </main>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
