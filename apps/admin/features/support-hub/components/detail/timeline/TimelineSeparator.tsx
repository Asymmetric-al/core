"use client";

interface TimelineSeparatorProps {
  label: string;
}

/** Day label between timeline entries; it sits inside the entry's list item. */
export function TimelineSeparator({ label }: TimelineSeparatorProps) {
  return (
    <div className="flex items-center gap-3 p-1 text-xs font-medium text-muted-foreground">
      <span className="h-px flex-1 bg-muted" aria-hidden />
      <span>{label}</span>
      <span className="h-px flex-1 bg-muted" aria-hidden />
    </div>
  );
}
