import type { Task } from "@asym/lib/hooks/use-tasks";

/** `searchLower` must already be lowercased. */
export function taskMatchesClientSearch(
  task: Task,
  searchLower: string,
): boolean {
  return (
    task.title.toLowerCase().includes(searchLower) ||
    (task.description ?? "").toLowerCase().includes(searchLower) ||
    (task.donor?.name ?? "").toLowerCase().includes(searchLower)
  );
}
