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

  const virtualizer = useVirtualizer({
    count: config.enabled ? count : 0,
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
