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
 * Check whether a stored string is TipTap JSON or legacy plain text.
 */
export function isRichText(value: string): boolean {
  if (!value) return false;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && parsed.type === "doc";
  } catch {
    return false;
  }
}

/**
 * Parse a stored string into TipTap-compatible content.
 * Handles both JSON (new) and plain text (legacy).
 */
export function parseContent(value: string): JSONContent | string {
  if (!value) return "";
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === "object" && parsed.type === "doc") {
      return parsed as JSONContent;
    }
  } catch {
    // Not valid JSON — legacy plain text
  }
  return value;
}

/**
 * Extract plain text from a stored rich-text string.
 * Useful for search indexing, previews, or truncation.
 */
export function extractPlainText(value: string): string {
  if (!value) return "";
  if (!isRichText(value)) return value;

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
