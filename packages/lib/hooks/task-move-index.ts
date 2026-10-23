import type { Task, TaskStatus } from "./use-tasks";

type OrderedTask = Pick<Task, "id" | "status" | "sort_key">;

/** Translate a final position in the filtered board to the full persistence column. */
export function getFullTaskMoveIndex(
  tasks: readonly OrderedTask[],
  displayedTasks: readonly OrderedTask[],
  taskId: string,
  status: TaskStatus,
  visibleIndex: number,
): number {
  const destination = tasks
    .filter((task) => task.status === status && task.id !== taskId)
    .sort((left, right) => left.sort_key - right.sort_key);
  const shownIds = new Set(displayedTasks.map((task) => task.id));
  const shownDestination = destination.filter((task) => shownIds.has(task.id));
  if (
    !Number.isInteger(visibleIndex) ||
    visibleIndex < 0 ||
    visibleIndex > shownDestination.length
  ) {
    throw new RangeError(
      "Task position no longer matches the displayed column",
    );
  }
  const nextShown = shownDestination[visibleIndex];
  if (nextShown) return destination.indexOf(nextShown);
  const lastShown = shownDestination.at(-1);
  return lastShown ? destination.indexOf(lastShown) + 1 : destination.length;
}
