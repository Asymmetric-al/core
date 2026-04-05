import type { Task } from "@asym/lib/hooks/use-tasks";

/** Lowercased search string; used by Tasks page client filtering. */
export function taskMatchesClientSearch(
  task: Task,
  searchLower: string,
): boolean {
  return (
    task.title.toLowerCase().includes(searchLower) ||
    Boolean(task.description?.toLowerCase().includes(searchLower)) ||
    (task.donor?.name ?? "").toLowerCase().includes(searchLower)
  );
}
