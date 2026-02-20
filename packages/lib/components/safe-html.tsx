import { useMemo, type HTMLAttributes } from "react";

import { sanitizeRichTextHtml } from "../html/sanitize";

type SafeHtmlProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "dangerouslySetInnerHTML"
> & {
  html: string | null | undefined;
};

export function SafeHtml({ html, ...divProps }: SafeHtmlProps) {
  const sanitizedHtml = useMemo(() => sanitizeRichTextHtml(html), [html]);

  return (
    <div {...divProps} dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
  );
}
