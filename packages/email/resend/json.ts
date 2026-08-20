export type JsonRecord = Record<string, unknown>;

export function isJsonRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null;
}

export function asString(value: unknown): string | null {
  if (typeof value === "string") {
    return value;
  }
  return null;
}

export function asIdString(value: unknown): string | null {
  if (typeof value === "string" && value.length > 0) {
    return value;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  return null;
}

export function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
}

export function asBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

export function extractRows(value: unknown): JsonRecord[] {
  if (Array.isArray(value)) {
    return value.filter(isJsonRecord);
  }

  if (!isJsonRecord(value)) {
    return [];
  }

  const maybeData = value.data;
  if (Array.isArray(maybeData)) {
    return maybeData.filter(isJsonRecord);
  }

  return [];
}
