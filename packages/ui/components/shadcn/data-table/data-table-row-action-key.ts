/**
 * Stable React key for row action lists. Prefer explicit `id` when duplicate
 * labels are possible; otherwise the index keeps siblings unique.
 */
export function getDataTableRowActionKey(
  action: { id?: string },
  index: number,
): string | number {
  return action.id ?? index;
}
