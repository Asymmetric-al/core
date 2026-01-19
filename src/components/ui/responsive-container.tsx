import { cn } from "@/lib/utils";
import { RESPONSIVE_CLASSES } from "@/lib/responsive";

interface ResponsiveContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  as?: "div" | "section" | "article" | "main";
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full" | "screen";
  padding?: "none" | "sm" | "default" | "lg";
  centered?: boolean;
}

const maxWidthClasses = {
  sm: "max-w-screen-sm",
  md: "max-w-screen-md",
  lg: "max-w-screen-lg",
  xl: "max-w-screen-xl",
  "2xl": "max-w-[1600px]",
  full: "max-w-full",
  screen: "max-w-screen",
} as const;

const paddingClasses = {
  none: "",
  sm: "px-3 sm:px-4",
  default: "px-4 sm:px-6 lg:px-10",
  lg: "px-6 sm:px-8 lg:px-12",
} as const;

export function ResponsiveContainer({
  children,
  as: Component = "div",
  maxWidth = "2xl",
  padding = "default",
  centered = true,
  className,
  ...props
}: ResponsiveContainerProps) {
  return (
    <Component
      className={cn(
        "w-full",
        centered && "mx-auto",
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

interface ResponsiveGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: "sm" | "default" | "lg";
  responsive?: boolean;
}

const gridColsClasses = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6",
  12: "grid-cols-1 lg:grid-cols-12",
} as const;

const gapClasses = {
  sm: "gap-2 sm:gap-3",
  default: "gap-3 sm:gap-4 lg:gap-6",
  lg: "gap-4 sm:gap-6 lg:gap-8",
} as const;

export function ResponsiveGrid({
  children,
  cols = 3,
  gap = "default",
  responsive = true,
  className,
  ...props
}: ResponsiveGridProps) {
  return (
    <div
      className={cn(
        "grid",
        responsive ? gridColsClasses[cols] : `grid-cols-${cols}`,
        gapClasses[gap],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface ResponsiveStackProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  gap?: "none" | "sm" | "default" | "lg" | "xl";
  direction?: "vertical" | "horizontal" | "responsive";
}

const stackGapClasses = {
  none: "",
  sm: "gap-2 sm:gap-3",
  default: "gap-3 sm:gap-4 lg:gap-6",
  lg: "gap-4 sm:gap-6 lg:gap-8",
  xl: "gap-6 sm:gap-8 lg:gap-10",
} as const;

const stackDirectionClasses = {
  vertical: "flex-col",
  horizontal: "flex-row",
  responsive: "flex-col sm:flex-row",
} as const;

export function ResponsiveStack({
  children,
  gap = "default",
  direction = "vertical",
  className,
  ...props
}: ResponsiveStackProps) {
  return (
    <div
      className={cn(
        "flex",
        stackDirectionClasses[direction],
        stackGapClasses[gap],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface ResponsiveSectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  spacing?: "sm" | "default" | "lg";
}

const sectionSpacingClasses = {
  sm: "py-4 sm:py-6",
  default: "py-6 sm:py-8 lg:py-12",
  lg: "py-8 sm:py-12 lg:py-16",
} as const;

export function ResponsiveSection({
  children,
  spacing = "default",
  className,
  ...props
}: ResponsiveSectionProps) {
  return (
    <section
      className={cn(sectionSpacingClasses[spacing], className)}
      {...props}
    >
      {children}
    </section>
  );
}

export function MainContent({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <main
      className={cn(
        RESPONSIVE_CLASSES.containerFull,
        "flex-1 py-4 sm:py-6 lg:py-10",
        className,
      )}
      {...props}
    >
      {children}
    </main>
  );
}
