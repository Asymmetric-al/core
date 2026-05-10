"use client";

interface TimelineSeparatorProps {
  label: string;
}

export function TimelineSeparator({ label }: TimelineSeparatorProps) {
  return (
    <li
      className="flex items-center gap-3 p-1 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400"
      aria-label={`Day group ${label}`}
    >
      <span className="h-px flex-1 bg-zinc-100" aria-hidden />
      <span>{label}</span>
      <span className="h-px flex-1 bg-zinc-100" aria-hidden />
    </li>
  );
}
