export function parseRpcObject<T extends Record<string, unknown>>(
  value: unknown,
): T | null {
  if (!value) return null;
  if (Array.isArray(value)) {
    const first = value[0];
    return first && typeof first === "object" ? (first as T) : null;
  }
  return typeof value === "object" ? (value as T) : null;
}
