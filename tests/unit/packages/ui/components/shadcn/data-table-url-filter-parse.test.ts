import { afterEach, describe, expect, it, vi } from "vitest";

import { parseColumnFiltersFromUrlString } from "../../../../../../packages/ui/components/shadcn/data-table/data-table-url-filter-parse";

describe("parseColumnFiltersFromUrlString", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns empty filters for null, undefined, or whitespace", () => {
    expect(parseColumnFiltersFromUrlString(null)).toEqual({
      ok: true,
      filters: [],
    });
    expect(parseColumnFiltersFromUrlString(undefined)).toEqual({
      ok: true,
      filters: [],
    });
    expect(parseColumnFiltersFromUrlString("   ")).toEqual({
      ok: true,
      filters: [],
    });
  });

  it("parses valid JSON array of column filters", () => {
    const raw = JSON.stringify([
      { id: "status", value: "open" },
      { id: "role", value: ["a", "b"] },
    ]);
    expect(parseColumnFiltersFromUrlString(raw)).toEqual({
      ok: true,
      filters: [
        { id: "status", value: "open" },
        { id: "role", value: ["a", "b"] },
      ],
    });
  });

  it("returns shouldClearParam for invalid JSON and warns in non-production", () => {
    vi.stubEnv("NODE_ENV", "development");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const result = parseColumnFiltersFromUrlString("{not json");
    expect(result).toEqual({
      ok: false,
      filters: [],
      shouldClearParam: true,
    });
    expect(warn).toHaveBeenCalled();

    warn.mockRestore();
  });

  it("returns shouldClearParam when JSON is not an array", () => {
    vi.stubEnv("NODE_ENV", "development");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    expect(parseColumnFiltersFromUrlString('{"id":"x"}')).toEqual({
      ok: false,
      filters: [],
      shouldClearParam: true,
    });
    expect(warn).toHaveBeenCalled();

    warn.mockRestore();
  });

  it("returns shouldClearParam when an entry lacks a non-empty string id", () => {
    vi.stubEnv("NODE_ENV", "development");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    expect(parseColumnFiltersFromUrlString('[{"value":"x"}]')).toEqual({
      ok: false,
      filters: [],
      shouldClearParam: true,
    });
    expect(warn).toHaveBeenCalled();

    warn.mockRestore();
  });
});
