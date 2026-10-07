/** UI identities stay outside serialized automation and macro actions. */
export interface DraftRow<T> {
  id: string;
  value: T;
}
export function createDraftRow<T>(value: T): DraftRow<T> {
  return { id: crypto.randomUUID(), value };
}
export function createDraftRows<T>(values: readonly T[]): DraftRow<T>[] {
  return values.map((value, index) => ({
    id: `initial-draft-${index}`,
    value,
  }));
}
