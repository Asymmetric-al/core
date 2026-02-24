import { describe, expect, it } from "vitest";

import {
  getVirtualPadding,
  resolveVirtualizationConfig,
  type VirtualizationDefaults,
} from "../../packages/ui/components/shadcn/data-table/hooks/use-data-table-virtualization";

const defaults: VirtualizationDefaults = {
  enabled: false,
  estimateSize: 56,
  overscan: 8,
  containerHeight: 640,
};

describe("virtualization config helpers", () => {
  it("falls back to defaults when config is empty", () => {
    const resolved = resolveVirtualizationConfig(defaults);

    expect(resolved).toEqual({
      enabled: false,
      estimateSize: 56,
      overscan: 8,
      containerHeight: 640,
      getItemKey: undefined,
    });
  });

  it("prefers new virtualization config over legacy values", () => {
    const resolved = resolveVirtualizationConfig(
      defaults,
      {
        enabled: true,
        estimateSize: 72,
        overscan: 12,
        containerHeight: "70vh",
      },
      {
        enabled: false,
        estimateSize: 40,
        overscan: 2,
        containerHeight: 320,
      },
    );

    expect(resolved.enabled).toBe(true);
    expect(resolved.estimateSize).toBe(72);
    expect(resolved.overscan).toBe(12);
    expect(resolved.containerHeight).toBe("70vh");
  });

  it("uses legacy values when new virtualization config is missing", () => {
    const resolved = resolveVirtualizationConfig(defaults, undefined, {
      enabled: true,
      estimateSize: 60,
      overscan: 6,
      containerHeight: 500,
    });

    expect(resolved).toEqual({
      enabled: true,
      estimateSize: 60,
      overscan: 6,
      containerHeight: 500,
      getItemKey: undefined,
    });
  });

  it("returns zero padding when no virtual items are present", () => {
    expect(getVirtualPadding([], 0)).toEqual({
      paddingTop: 0,
      paddingBottom: 0,
    });
  });

  it("computes top and bottom padding from virtual window", () => {
    const padding = getVirtualPadding(
      [
        { start: 120, end: 180 },
        { start: 180, end: 240 },
        { start: 240, end: 300 },
      ],
      900,
    );

    expect(padding).toEqual({
      paddingTop: 120,
      paddingBottom: 600,
    });
  });
});
