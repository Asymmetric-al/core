import {
  isAllowedPostLinkHref,
  normalizePostLinkHref,
} from "@asym/lib/posts/link-policy";

type RichTextRecord = Record<string, unknown>;

function isRichTextRecord(value: unknown): value is RichTextRecord {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function sanitizeLinkMark(mark: unknown): unknown | null {
  if (!isRichTextRecord(mark) || mark.type !== "link") {
    return mark;
  }

  const attrs = isRichTextRecord(mark.attrs) ? mark.attrs : null;
  const href = typeof attrs?.href === "string" ? attrs.href : null;
  let sanitizedHref: string | null = null;

  if (href) {
    try {
      sanitizedHref = isAllowedPostLinkHref(href) ? href : null;
      new URL(href);
    } catch {
      sanitizedHref = normalizePostLinkHref(href);
    }
  }

  if (!sanitizedHref) {
    return null;
  }

  return {
    ...mark,
    attrs: {
      ...(attrs ?? {}),
      href: sanitizedHref,
    },
  };
}

function sanitizeRichTextNode(node: unknown): unknown {
  if (!isRichTextRecord(node)) {
    return node;
  }

  const sanitizedNode: RichTextRecord = { ...node };

  if (Array.isArray(node.marks)) {
    const sanitizedMarks = node.marks.flatMap((mark) => {
      const sanitizedMark = sanitizeLinkMark(mark);
      return sanitizedMark === null ? [] : [sanitizedMark];
    });

    if (sanitizedMarks.length > 0) {
      sanitizedNode.marks = sanitizedMarks;
    } else {
      delete sanitizedNode.marks;
    }
  }

  if (Array.isArray(node.content)) {
    sanitizedNode.content = node.content.map((child) =>
      sanitizeRichTextNode(child),
    );
  }

  return sanitizedNode;
}

export function normalizeStoredPostContent(content: string): string {
  try {
    const parsed = JSON.parse(content) as unknown;

    if (
      parsed !== null &&
      typeof parsed === "object" &&
      (parsed as { type?: string }).type === "doc"
    ) {
      return JSON.stringify(sanitizeRichTextNode(parsed));
    }
  } catch {
    // Treat non-JSON content as legacy HTML/plain text and store as-is.
  }

  return content;
}
