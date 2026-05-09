interface TiptapNode {
  type?: string;
  content?: TiptapNode[];
  text?: string;
  attrs?: Record<string, unknown>;
}

const MEANINGFUL_LEAF_TYPES = new Set(["horizontalRule", "image", "mention"]);

export function isRichTextPayloadDirty(rawJson: string): boolean {
  if (!rawJson) return false;
  try {
    const parsed = JSON.parse(rawJson) as TiptapNode;
    return hasMeaningfulNode(parsed);
  } catch {
    return rawJson.trim().length > 0;
  }
}

function hasMeaningfulNode(node: TiptapNode | null | undefined): boolean {
  if (!node) return false;
  if (typeof node.text === "string" && node.text.trim().length > 0) {
    return true;
  }
  if (node.type === "mention") {
    return hasNonEmptyAttr(node, "label") || hasNonEmptyAttr(node, "id");
  }
  if (node.type && MEANINGFUL_LEAF_TYPES.has(node.type)) return true;
  return (node.content ?? []).some(hasMeaningfulNode);
}

function hasNonEmptyAttr(node: TiptapNode, attr: string): boolean {
  const value = node.attrs?.[attr];
  return typeof value === "string" && value.trim().length > 0;
}
