import { cn } from "@asym/ui/lib/utils";

const TONES = {
  default: "text-muted-foreground",
  inverted: "text-invert-foreground/75",
  media: "text-media-foreground/90",
} as const;

/**
 * The public site's organization figures are template samples, not totals
 * read from this organization's data. Every block of them says so.
 */
export function SampleFiguresNote({
  tone = "default",
  className,
  children = "Sample figures for this demo organization, not live totals.",
}: {
  tone?: keyof typeof TONES;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <p className={cn("text-xs font-medium", TONES[tone], className)}>
      {children}
    </p>
  );
}
