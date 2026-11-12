import type { ReactNode } from "react";

/**
 * A note after the document type ("· /slug"). The dot travels with its note,
 * so a wrapped line never ends on a dot; on phones the note takes its own
 * line and drops the dot.
 */
function SubtitleNote({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className="flex min-w-0 basis-full items-center gap-2 sm:basis-auto">
      <span aria-hidden="true" className="hidden sm:inline">
        ·
      </span>
      <span className={className}>{children}</span>
    </span>
  );
}

/**
 * The line under a document's title: its type and the record it is for
 * ("Giving Page for Grace Okafor"), then its slug and a view-only note.
 */
export function NativeDocumentSubtitle({
  readOnly,
  reference,
  slug,
  titleSingular,
}: {
  readOnly: boolean;
  /** The record the document is for ("for Grace Okafor"), if any. */
  reference: ReactNode;
  slug: string | null;
  titleSingular: string;
}) {
  return (
    <p className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
      <span className="inline-flex min-w-0 flex-wrap items-center gap-1">
        <span>{titleSingular}</span>
        {reference}
      </span>
      {slug ? (
        <SubtitleNote className="truncate font-mono text-xs">
          {slug}
        </SubtitleNote>
      ) : null}
      {readOnly ? (
        <SubtitleNote>You can view but not save changes.</SubtitleNote>
      ) : null}
    </p>
  );
}
