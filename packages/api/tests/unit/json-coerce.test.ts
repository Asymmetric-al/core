import { describe, expect, it } from "vitest";

import {
  DEFAULT_TIMESTAMP,
  asString,
  coerceString,
  findFirstString,
  getNestedName,
  isRecord,
  timestampOrDefault,
} from "../../src/shared/json-coerce";

describe("isRecord", () => {
  it("accepts plain objects", () => {
    expect(isRecord({})).toBe(true);
    expect(isRecord({ id: "abc" })).toBe(true);
  });

  it("rejects null", () => {
    expect(isRecord(null)).toBe(false);
  });

  it("rejects arrays", () => {
    expect(isRecord([])).toBe(false);
    expect(isRecord([{ id: "abc" }])).toBe(false);
  });

  it("rejects primitives and undefined", () => {
    expect(isRecord("record")).toBe(false);
    expect(isRecord(42)).toBe(false);
    expect(isRecord(true)).toBe(false);
    expect(isRecord(undefined)).toBe(false);
  });
});

describe("asString", () => {
  it("returns strings with content unchanged, without trimming", () => {
    expect(asString("hello")).toBe("hello");
    expect(asString("  padded  ")).toBe("  padded  ");
  });

  it("returns null for empty and whitespace-only strings", () => {
    expect(asString("")).toBeNull();
    expect(asString("   ")).toBeNull();
    expect(asString("\n\t")).toBeNull();
  });

  it("returns null for non-strings", () => {
    expect(asString(42)).toBeNull();
    expect(asString(true)).toBeNull();
    expect(asString(null)).toBeNull();
    expect(asString(undefined)).toBeNull();
    expect(asString({ value: "hello" })).toBeNull();
    expect(asString(["hello"])).toBeNull();
  });
});

describe("coerceString", () => {
  it("trims strings and maps empty results to null", () => {
    expect(coerceString("hello")).toBe("hello");
    expect(coerceString("  padded  ")).toBe("padded");
    expect(coerceString("")).toBeNull();
    expect(coerceString("   ")).toBeNull();
  });

  it("stringifies numbers and booleans", () => {
    expect(coerceString(42)).toBe("42");
    expect(coerceString(0)).toBe("0");
    expect(coerceString(true)).toBe("true");
    expect(coerceString(false)).toBe("false");
  });

  it("unwraps { value: string } wrappers", () => {
    expect(coerceString({ value: "  wrapped " })).toBe("wrapped");
    expect(coerceString({ value: "" })).toBeNull();
  });

  it("returns null for other shapes", () => {
    expect(coerceString(null)).toBeNull();
    expect(coerceString(undefined)).toBeNull();
    expect(coerceString({ value: 42 })).toBeNull();
    expect(coerceString(["hello"])).toBeNull();
  });
});

describe("findFirstString", () => {
  it("returns the first key that coerces to a usable string", () => {
    const record = { id: "  rec-1 ", recordId: "rec-2" };
    expect(findFirstString(record, ["id", "recordId"])).toBe("rec-1");
  });

  it("skips blank and missing values", () => {
    const record = { id: "   ", name: null, recordId: "rec-2" };
    expect(findFirstString(record, ["id", "name", "recordId"])).toBe("rec-2");
  });

  it("returns null when no key matches", () => {
    expect(findFirstString({ id: "" }, ["id", "recordId"])).toBeNull();
    expect(findFirstString({}, [])).toBeNull();
  });
});

describe("getNestedName", () => {
  it("prefers name-like keys", () => {
    expect(getNestedName({ name: "Team Alpha" })).toBe("Team Alpha");
    expect(getNestedName({ displayName: "Alpha" })).toBe("Alpha");
    expect(getNestedName({ fullName: "Ada Lovelace" })).toBe("Ada Lovelace");
  });

  it("falls back to firstName + lastName", () => {
    expect(getNestedName({ firstName: "Ada", lastName: "Lovelace" })).toBe(
      "Ada Lovelace",
    );
    expect(getNestedName({ firstName: "Ada" })).toBe("Ada");
  });

  it("returns null for non-records and empty names", () => {
    expect(getNestedName(null)).toBeNull();
    expect(getNestedName("Ada")).toBeNull();
    expect(getNestedName({})).toBeNull();
    expect(getNestedName({ name: "   " })).toBeNull();
  });
});

describe("timestampOrDefault", () => {
  it("normalizes parseable timestamps to ISO strings", () => {
    expect(timestampOrDefault("2026-07-13T00:00:00Z")).toBe(
      "2026-07-13T00:00:00.000Z",
    );
  });

  it("returns the default for null and invalid input", () => {
    expect(timestampOrDefault(null)).toBe(DEFAULT_TIMESTAMP);
    expect(timestampOrDefault("not-a-date")).toBe(DEFAULT_TIMESTAMP);
  });
});
