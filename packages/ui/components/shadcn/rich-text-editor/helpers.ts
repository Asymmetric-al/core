import type { JSONContent } from "@tiptap/react";

/**
 * Normalise user input into a full URL.
 * - Already valid → return as-is
 * - Looks like a domain (contains ".", no spaces) → prefix https://
 * - Otherwise → null
 */
export function getUrlFromString(str: string): string | null {
  if (isValidUrl(str)) return str;
  try {
    if (str.includes(".") && !str.includes(" ")) {
      return new URL(`https://${str}`).toString();
    }
  } catch {
    // invalid URL
  }
  return null;
}

export function isValidUrl(url: string): boolean {
  return /^https?:\/\/\S+$/.test(url);
}

/**
 * Check whether a stored string is TipTap JSON or legacy plain text / HTML.
 */
export function isRichText(value: string): boolean {
  if (!value) return false;
  try {
    const parsed = JSON.parse(value) as unknown;
    return (
      parsed !== null &&
      typeof parsed === "object" &&
      (parsed as { type?: string }).type === "doc"
    );
  } catch {
    return false;
  }
}

/**
 * Parse a stored string into TipTap-compatible content.
 * Handles JSON (new), HTML, and plain text (legacy).
 */
export function parseContent(value: string): JSONContent | string {
  if (!value) return "";
  try {
    const parsed = JSON.parse(value) as unknown;
    if (
      parsed &&
      typeof parsed === "object" &&
      (parsed as { type?: string }).type === "doc"
    ) {
      return parsed as JSONContent;
    }
  } catch {
    // Not valid JSON — legacy plain text or HTML
  }
  return value;
}

/**
 * Extract plain text from a stored rich-text string.
 * Useful for search indexing, previews, or truncation.
 */
export function extractPlainText(value: string): string {
  if (!value) return "";
  if (!isRichText(value)) {
    return value.replace(/<[^>]*>?/gm, "").trim();
  }

  try {
    const doc = JSON.parse(value) as JSONContent;
    return extractTextFromNode(doc);
  } catch {
    return value;
  }
}

function extractTextFromNode(node: JSONContent): string {
  if (node.type === "text") return node.text ?? "";
  if (!node.content) return "";
  return node.content.map(extractTextFromNode).join("");
}

function docHasImage(node: JSONContent): boolean {
  if (node.type === "image") return true;
  if (!node.content) return false;
  return node.content.some(docHasImage);
}

/**
 * True when there is no meaningful text and no embedded images.
 * Supports TipTap JSON, legacy HTML, and plain text.
 */
export function isPostContentEmpty(value: string): boolean {
  if (!value || !value.trim()) return true;

  if (isRichText(value)) {
    try {
      const doc = JSON.parse(value) as JSONContent;
      const text = extractPlainText(value);
      return text.trim().length === 0 && !docHasImage(doc);
    } catch {
      return true;
    }
  }

  const plain = value.replace(/<[^>]*>?/gm, "").trim();
  const hasImg =
    value.includes("<img") ||
    value.toLowerCase().includes("data:image") ||
    value.includes('"type":"image"');
  return plain.length === 0 && !hasImg;
}
