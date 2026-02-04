/**
 * Responsive Design System - Constants
 * Extracted for use in UI components and hooks
 */

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

export function isBreakpoint(width: number, breakpoint: Breakpoint): boolean {
  return width >= BREAKPOINTS[breakpoint];
}

export function getBreakpoint(width: number): Breakpoint | "xs" {
  if (width >= BREAKPOINTS["2xl"]) return "2xl";
  if (width >= BREAKPOINTS.xl) return "xl";
  if (width >= BREAKPOINTS.lg) return "lg";
  if (width >= BREAKPOINTS.md) return "md";
  if (width >= BREAKPOINTS.sm) return "sm";
  return "xs";
}
