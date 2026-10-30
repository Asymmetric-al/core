function isPlainOrArray(value: unknown): value is object {
  if (typeof value !== "object" || value === null) return false;
  if (Array.isArray(value)) return true;
  const proto: unknown = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/**
 * Freezes plain objects and arrays at every depth over `Reflect.ownKeys`, so
 * a shared table cannot be widened at runtime. Already-frozen nodes are not
 * re-frozen but are still walked. Returns the same reference; never clones.
 */
export function deepFreeze<T>(value: T): T {
  if (!isPlainOrArray(value)) return value;
  for (const key of Reflect.ownKeys(value))
    deepFreeze((value as Record<PropertyKey, unknown>)[key]);
  if (!Object.isFrozen(value)) Object.freeze(value);
  return value;
}
