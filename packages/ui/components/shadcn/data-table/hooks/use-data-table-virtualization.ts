import {
  useVirtualizer,
  type VirtualItem,
  type Virtualizer,
} from "@tanstack/react-virtual";
import * as React from "react";

import type { VirtualizationConfig } from "../types";

export interface VirtualizationLegacyConfig {
  enabled?: boolean;
  estimateSize?: number;
  overscan?: number;
  containerHeight?: number | string;
  getItemKey?: (index: number) => string | number;
}

export interface VirtualizationDefaults {
  enabled: boolean;
  estimateSize: number;
  overscan: number;
  containerHeight: number | string;
}

export interface ResolvedVirtualizationConfig {
  enabled: boolean;
  estimateSize: number;
  overscan: number;
  containerHeight: number | string;
  getItemKey?: (index: number) => string | number;
}

export interface VirtualizationPadding {
  paddingTop: number;
  paddingBottom: number;
}

export const DEFAULT_VIRTUALIZATION_DEFAULTS: VirtualizationDefaults = {
  enabled: false,
  estimateSize: 56,
  overscan: 8,
  containerHeight: 640,
};

function getOverlappingVirtualizationOptions(
  virtualization?: VirtualizationConfig,
  legacy?: VirtualizationLegacyConfig,
): string[] {
  if (!virtualization || !legacy) {
    return [];
  }

  const overlaps: string[] = [];

  if (virtualization.enabled != null && legacy.enabled != null) {
    overlaps.push("enabled");
  }
  if (virtualization.estimateSize != null && legacy.estimateSize != null) {
    overlaps.push("estimateSize");
  }
  if (virtualization.overscan != null && legacy.overscan != null) {
    overlaps.push("overscan");
  }
  if (
    virtualization.containerHeight != null &&
    legacy.containerHeight != null
  ) {
    overlaps.push("containerHeight");
  }
  if (virtualization.getItemKey != null && legacy.getItemKey != null) {
    overlaps.push("getItemKey");
  }

  return overlaps;
}

export function resolveVirtualizationConfig(
  defaults: VirtualizationDefaults,
  virtualization?: VirtualizationConfig,
  legacy?: VirtualizationLegacyConfig,
): ResolvedVirtualizationConfig {
  return {
    enabled: virtualization?.enabled ?? legacy?.enabled ?? defaults.enabled,
    estimateSize:
      virtualization?.estimateSize ??
      legacy?.estimateSize ??
      defaults.estimateSize,
    overscan: virtualization?.overscan ?? legacy?.overscan ?? defaults.overscan,
    containerHeight:
      virtualization?.containerHeight ??
      legacy?.containerHeight ??
      defaults.containerHeight,
    getItemKey: virtualization?.getItemKey ?? legacy?.getItemKey,
  };
}

export function getVirtualPadding(
  virtualItems: Pick<VirtualItem, "start" | "end">[],
  totalSize: number,
): VirtualizationPadding {
  if (virtualItems.length === 0) {
    return { paddingTop: 0, paddingBottom: 0 };
  }

  const first = virtualItems[0];
  const last = virtualItems[virtualItems.length - 1];

  return {
    paddingTop: first?.start ?? 0,
    paddingBottom: Math.max(totalSize - (last?.end ?? 0), 0),
  };
}

export interface UseDataTableVirtualizationOptions {
  count: number;
  scrollElementRef: React.RefObject<HTMLElement | null>;
  virtualization?: VirtualizationConfig;
  legacy?: VirtualizationLegacyConfig;
  defaults?: Partial<VirtualizationDefaults>;
}

export interface UseDataTableVirtualizationReturn {
  config: ResolvedVirtualizationConfig;
  virtualizer: Virtualizer<HTMLElement, Element>;
  virtualItems: VirtualItem[];
  paddingTop: number;
  paddingBottom: number;
  totalSize: number;
  isEnabled: boolean;
}

export function useDataTableVirtualization({
  count,
  scrollElementRef,
  virtualization,
  legacy,
  defaults,
}: UseDataTableVirtualizationOptions): UseDataTableVirtualizationReturn {
  const resolvedDefaults = React.useMemo<VirtualizationDefaults>(
    () => ({
      ...DEFAULT_VIRTUALIZATION_DEFAULTS,
      ...defaults,
    }),
    [defaults],
  );

  const config = React.useMemo(
    () => resolveVirtualizationConfig(resolvedDefaults, virtualization, legacy),
    [resolvedDefaults, virtualization, legacy],
  );
  const overlappingOptions = React.useMemo(
    () => getOverlappingVirtualizationOptions(virtualization, legacy),
    [legacy, virtualization],
  );
  const warnedOverlapKeyRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (
      process.env.NODE_ENV === "production" ||
      overlappingOptions.length === 0
    ) {
      return;
    }

    const overlapKey = overlappingOptions.join(",");
    if (warnedOverlapKeyRef.current === overlapKey) {
      return;
    }

    warnedOverlapKeyRef.current = overlapKey;

    console.warn(
      `[asym/ui] useDataTableVirtualization received overlapping modern and legacy virtualization options (${overlapKey}). Values from virtualization.* take precedence over legacy fields.`,
    );
  }, [overlappingOptions]);

  const virtualizer = useVirtualizer({
    // TanStack Virtual v3 supports `enabled`; keep real item count and toggle
    // observers/state through this flag instead of forcing `count` to 0.
    count,
    enabled: config.enabled,
    getScrollElement: () => scrollElementRef.current,
    estimateSize: () => config.estimateSize,
    overscan: config.overscan,
    getItemKey: config.getItemKey,
  });

  const virtualItems = config.enabled ? virtualizer.getVirtualItems() : [];
  const totalSize = config.enabled
    ? virtualizer.getTotalSize()
    : count * config.estimateSize;
  const { paddingTop, paddingBottom } = getVirtualPadding(
    virtualItems,
    totalSize,
  );

  return {
    config,
    virtualizer,
    virtualItems,
    paddingTop,
    paddingBottom,
    totalSize,
    isEnabled: config.enabled,
  };
}
