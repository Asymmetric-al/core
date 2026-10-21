import React, { useState } from "react";
import { createRoot } from "react-dom/client";

import { NativePdfDocumentBuilderSection } from "../../../apps/admin/app/(app)/pdf/native-pdf-document-builder-section";
import { TaskTable } from "../../../packages/missionary/components/tasks/task-table";
import type { Task } from "../../../packages/missionary/types";
import "virtual:base-ui-styles";

const task: Task = {
  id: "task-keyboard",
  missionary_id: "fixture-worker",
  title: "Call partner",
  task_type: "call",
  status: "not_started",
  priority: "none",
  sort_key: 0,
  is_auto_generated: false,
  created_at: "2026-10-21T00:00:00Z",
  updated_at: "2026-10-21T00:00:00Z",
};

function App() {
  const [source, setSource] = useState('{"version":1}');
  const [previews, setPreviews] = useState(0);
  const [opens, setOpens] = useState(0);
  const [selections, setSelections] = useState(0);
  const [statusChanges, setStatusChanges] = useState(0);
  const [edits, setEdits] = useState(0);
  const [deletions, setDeletions] = useState(0);
  return (
    <main className="p-4">
      <h1>Modernization control contracts</h1>
      <section
        aria-label="Native PDF editor"
        className="relative h-160 overflow-hidden border"
      >
        <NativePdfDocumentBuilderSection
          templateText={source}
          onTemplateTextChange={setSource}
          onPreview={() => setPreviews((count) => count + 1)}
          preview={{
            html: "<!doctype html><html lang='en'><title>Static print preview</title><body><p>Preserved document preview</p></body></html>",
            diagnostics: [],
            status: "success",
            error: null,
          }}
        />
      </section>
      <output aria-label="Source length">{source.length}</output>
      <output aria-label="Preview count">{previews}</output>
      <TaskTable
        tasks={[task]}
        selectedTaskIds={[]}
        onToggleSelection={() => setSelections((count) => count + 1)}
        onSelectAll={() => setSelections((count) => count + 1)}
        onTaskClick={() => setOpens((count) => count + 1)}
        onStatusChange={() => setStatusChanges((count) => count + 1)}
        onEdit={() => setEdits((count) => count + 1)}
        onDelete={() => setDeletions((count) => count + 1)}
      />
      <output aria-label="Task open count">{opens}</output>
      <output aria-label="Task selection count">{selections}</output>
      <output aria-label="Task status count">{statusChanges}</output>
      <output aria-label="Task edit count">{edits}</output>
      <output aria-label="Task delete count">{deletions}</output>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
