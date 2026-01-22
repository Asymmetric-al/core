/**
 * Responsive Design System
 *
 * A comprehensive responsive system following modern UX/UI best practices:
 *
 * 1. PERCEPTUAL CONSISTENCY: Spacing and sizing that "feels" the same across devices
 *    - Uses relative scaling ratios rather than fixed pixel values
 *    - Adjusts optical weight for different screen densities
 *
 * 2. FLUID TYPOGRAPHY: Text that scales smoothly between breakpoints
 *    - Uses clamp() for seamless scaling without media query jumps
 *    - Maintains optimal reading line-length (45-75 characters)
 *
 * 3. TOUCH-FIRST INTERACTIONS: Mobile interactions prioritized
 *    - 44px minimum touch targets (Apple HIG)
 *    - 48px recommended (Material Design)
 *    - Adequate spacing between interactive elements
 *
 * 4. CONTENT-DRIVEN BREAKPOINTS: Based on content, not devices
 *    - sm (640px): Text content starts needing more room
 *    - md (768px): Two-column layouts become viable
 *    - lg (1024px): Full dashboard layouts
 *    - xl (1280px): Extended sidebars, more columns
 *    - 2xl (1536px): Ultra-wide optimizations
 *
 * Usage:
 * - Import constants and use in JavaScript when needed
 * - For CSS, prefer the utility classes in globals.css
 * - Use CSS custom properties for runtime flexibility
 */

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

export const CONTAINER = {
  maxWidth: 1600,
  padding: {
    mobile: 16,
    tablet: 24,
    desktop: 40,
  },
  gutter: {
    mobile: 12,
    tablet: 16,
    desktop: 24,
  },
} as const;

export const SPACING = {
  scale: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128],

  gap: {
    xs: { mobile: 4, tablet: 6, desktop: 8 },
    sm: { mobile: 8, tablet: 10, desktop: 12 },
    md: { mobile: 12, tablet: 16, desktop: 20 },
    lg: { mobile: 16, tablet: 20, desktop: 24 },
    xl: { mobile: 20, tablet: 24, desktop: 32 },
  },

  section: {
    sm: { mobile: 16, tablet: 24, desktop: 32 },
    md: { mobile: 24, tablet: 32, desktop: 48 },
    lg: { mobile: 32, tablet: 48, desktop: 64 },
    xl: { mobile: 48, tablet: 64, desktop: 96 },
  },

  card: {
    mobile: 12,
    tablet: 16,
    desktop: 24,
  },
} as const;

export const TOUCH = {
  minTargetSize: 44,
  recommendedTargetSize: 48,
  minTargetSpacing: 8,
} as const;

export const TYPOGRAPHY = {
  scale: {
    xs: { min: 10, max: 12 },
    sm: { min: 12, max: 14 },
    base: { min: 14, max: 16 },
    lg: { min: 16, max: 18 },
    xl: { min: 18, max: 20 },
    "2xl": { min: 20, max: 24 },
    "3xl": { min: 24, max: 30 },
    "4xl": { min: 30, max: 36 },
    "5xl": { min: 36, max: 48 },
    "6xl": { min: 48, max: 60 },
  },

  lineHeight: {
    tight: 1.1,
    snug: 1.25,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  maxLineLength: {
    prose: "65ch",
    narrow: "45ch",
    wide: "80ch",
  },
} as const;

export const RADIUS = {
  scale: {
    none: 0,
    sm: { mobile: 6, tablet: 6, desktop: 8 },
    md: { mobile: 8, tablet: 10, desktop: 12 },
    lg: { mobile: 12, tablet: 14, desktop: 16 },
    xl: { mobile: 16, tablet: 20, desktop: 24 },
    "2xl": { mobile: 20, tablet: 24, desktop: 32 },
    full: 9999,
  },
} as const;

export const SIDEBAR = {
  width: {
    expanded: "13rem",
    collapsed: "3rem",
    mobile: "16rem",
  },
} as const;

export const HEADER = {
  height: {
    mobile: 48,
    tablet: 48,
    desktop: 48,
  },
} as const;

export const Z_INDEX = {
  dropdown: 50,
  sticky: 40,
  fixed: 30,
  overlay: 25,
  modal: 50,
  popover: 40,
  tooltip: 45,
} as const;

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

export function clamp(min: number, preferred: string, max: number): string {
  return `clamp(${min}px, ${preferred}, ${max}px)`;
}

export function fluidSize(
  minSize: number,
  maxSize: number,
  minVw: number = 320,
  maxVw: number = 1536,
): string {
  const slope = (maxSize - minSize) / (maxVw - minVw);
  const yIntercept = minSize - slope * minVw;
  return `clamp(${minSize}px, ${yIntercept.toFixed(4)}px + ${(slope * 100).toFixed(4)}vw, ${maxSize}px)`;
}

export const RESPONSIVE_CLASSES = {
  container: "mx-auto w-full max-w-[1600px]",
  containerPadding: "px-4 sm:px-6 lg:px-10",
  containerFull: "mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-10",

  sectionGap: {
    sm: "space-y-4 sm:space-y-6 lg:space-y-8",
    md: "space-y-6 sm:space-y-8 lg:space-y-12",
    lg: "space-y-8 sm:space-y-12 lg:space-y-16",
  },

  gridGap: {
    sm: "gap-2 sm:gap-3 lg:gap-4",
    md: "gap-3 sm:gap-4 lg:gap-6",
    lg: "gap-4 sm:gap-6 lg:gap-8",
  },

  cardPadding: {
    sm: "p-3 sm:p-4",
    md: "p-3 sm:p-4 lg:p-6",
    lg: "p-4 sm:p-6 lg:p-8",
  },

  text: {
    h1: "text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight",
    h2: "text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight",
    h3: "text-lg sm:text-xl font-semibold",
    h4: "text-base sm:text-lg font-semibold",
    body: "text-sm sm:text-base",
    small: "text-xs sm:text-sm",
    caption: "text-[10px] sm:text-xs",
  },

  grid: {
    cols1: "grid grid-cols-1",
    cols1to2: "grid grid-cols-1 md:grid-cols-2",
    cols1to3: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    cols1to4: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    cols2to4: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
    cols12: "grid grid-cols-1 lg:grid-cols-12",
  },

  flex: {
    responsive: "flex flex-col sm:flex-row",
    responsiveReverse: "flex flex-col-reverse sm:flex-row",
    center: "flex items-center justify-center",
    between: "flex items-center justify-between",
    start: "flex items-center justify-start",
  },

  visibility: {
    hideMobile: "hidden sm:block",
    hideTablet: "hidden md:block",
    hideDesktop: "block lg:hidden",
    showMobileOnly: "block sm:hidden",
    showTabletOnly: "hidden sm:block lg:hidden",
    showDesktopOnly: "hidden lg:block",
  },

  touch: {
    target: "min-h-[44px] min-w-[44px]",
    targetLg: "min-h-[48px] min-w-[48px]",
  },
} as const;

export type ResponsiveValue<T> = {
  mobile: T;
  tablet: T;
  desktop: T;
};

export function getResponsiveValue<T>(
  value: ResponsiveValue<T>,
  breakpoint: Breakpoint | "xs",
): T {
  switch (breakpoint) {
    case "xs":
    case "sm":
      return value.mobile;
    case "md":
      return value.tablet;
    default:
      return value.desktop;
  }
}
