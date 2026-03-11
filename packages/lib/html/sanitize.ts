import DOMPurify from "isomorphic-dompurify";

export function sanitizeRichTextHtml(
  content: string | null | undefined,
): string {
  if (!content) return "";

  return DOMPurify.sanitize(content, {
    USE_PROFILES: { html: true },
  });
}
