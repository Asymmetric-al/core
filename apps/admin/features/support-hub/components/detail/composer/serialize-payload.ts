import type {
  SupportAttachmentDraft,
  SupportReplyPayload,
} from "../../../models/editor-payload";
import type { SupportAssignee } from "../../../types";

interface SerializeArgs {
  /** Tiptap document JSON serialized as a string (whatever EditorRoot.onChange emits). */
  rawJson: string;
  attachments: SupportAttachmentDraft[];
  /** When set, append the agent's signature to text/html (never to the JSON doc). */
  signatureAgent: SupportAssignee | null;
  appendSignature: boolean;
}

/**
 * Pure serializer that turns a Tiptap JSON snapshot into the support reply
 * payload shape. Lives next to the composer (not in `models/`) because it
 * encodes UI-side concerns (signature handling, plain-text fallback).
 *
 * - Tiptap JSON is stored verbatim — never mutated by the signature flag, so
 *   toggling the signature does not garble the editor doc.
 * - HTML is built from the JSON tree as a small subset (paragraph, br, list,
 *   blockquote, link, mark) so the donor receives the same content the agent
 *   typed. Phase 5 may swap this for `editor.getHTML()` once the composer
 *   exposes the editor instance.
 * - The plain-text fallback walks the JSON tree.
 *
 * `attachments` are passed straight through; the mock pipeline doesn't ship
 * file bytes yet but the SupportReplyPayload contract has carried them since
 * Phase 2.
 */
export function serializeReplyPayload({
  rawJson,
  attachments,
  signatureAgent,
  appendSignature,
}: SerializeArgs): SupportReplyPayload {
  const json = parseDocument(rawJson);
  const text = nodeToText(json).trim();
  const html = nodeToHtml(json).trim();

  const signatureLine =
    appendSignature && signatureAgent
      ? buildSignatureLine(signatureAgent)
      : null;

  const finalText = signatureLine
    ? text.length > 0
      ? `${text}\n\n--\n${signatureLine.text}`
      : signatureLine.text
    : text;

  const finalHtml = signatureLine
    ? `${html}\n<p class="support-signature">--<br/>${signatureLine.html}</p>`
    : html;

  return {
    json,
    html: finalHtml,
    text: finalText,
    attachments,
  };
}

export function buildSignatureLine(agent: SupportAssignee): {
  text: string;
  html: string;
} {
  const lines = [agent.name];
  if (agent.title) lines.push(agent.title);
  lines.push(agent.email);

  return {
    text: lines.join("\n"),
    html: lines.map((line) => escapeHtml(line)).join("<br/>"),
  };
}

interface TiptapNode {
  type?: string;
  content?: TiptapNode[];
  text?: string;
  marks?: Array<{ type: string; attrs?: { href?: string } }>;
  attrs?: Record<string, unknown>;
}

function parseDocument(raw: string): TiptapNode {
  if (!raw) return { type: "doc", content: [] };
  try {
    const parsed = JSON.parse(raw) as TiptapNode;
    if (parsed && typeof parsed === "object") return parsed;
  } catch {
    // Fall through — treat as plain text.
  }
  return {
    type: "doc",
    content: [{ type: "paragraph", content: [{ type: "text", text: raw }] }],
  };
}

function nodeToText(node: TiptapNode): string {
  if (!node) return "";
  if (node.type === "text") return node.text ?? "";
  if (node.type === "hardBreak") return "\n";

  const children = (node.content ?? []).map(nodeToText);
  switch (node.type) {
    case "paragraph":
    case "heading":
      return `${children.join("")}\n\n`;
    case "bulletList":
    case "orderedList":
      return children.join("");
    case "listItem":
      return `- ${children.join("").trim()}\n`;
    case "blockquote":
      return children
        .join("")
        .split("\n")
        .map((line) => (line ? `> ${line}` : line))
        .join("\n");
    default:
      return children.join("");
  }
}

function nodeToHtml(node: TiptapNode): string {
  if (!node) return "";
  if (node.type === "text") {
    return wrapMarks(escapeHtml(node.text ?? ""), node.marks ?? []);
  }
  if (node.type === "hardBreak") return "<br/>";

  const children = (node.content ?? []).map(nodeToHtml).join("");
  switch (node.type) {
    case "doc":
      return children;
    case "paragraph":
      return `<p>${children || "&nbsp;"}</p>`;
    case "heading": {
      const level = (node.attrs?.level as number | undefined) ?? 1;
      return `<h${level}>${children}</h${level}>`;
    }
    case "bulletList":
      return `<ul>${children}</ul>`;
    case "orderedList":
      return `<ol>${children}</ol>`;
    case "listItem":
      return `<li>${children}</li>`;
    case "blockquote":
      return `<blockquote>${children}</blockquote>`;
    default:
      return children;
  }
}

function wrapMarks(
  text: string,
  marks: Array<{ type: string; attrs?: { href?: string } }>,
): string {
  let result = text;
  for (const mark of marks) {
    switch (mark.type) {
      case "bold":
        result = `<strong>${result}</strong>`;
        break;
      case "italic":
        result = `<em>${result}</em>`;
        break;
      case "underline":
        result = `<u>${result}</u>`;
        break;
      case "code":
        result = `<code>${result}</code>`;
        break;
      case "link": {
        const href = mark.attrs?.href ?? "#";
        result = `<a href="${escapeAttr(href)}">${result}</a>`;
        break;
      }
      default:
        break;
    }
  }
  return result;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(value: string): string {
  return escapeHtml(value).replace(/"/g, "&quot;");
}
