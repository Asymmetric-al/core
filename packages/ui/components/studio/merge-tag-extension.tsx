import { EmailNode } from "@react-email/editor/core";
import { mergeAttributes } from "@tiptap/core";

export const MERGE_TAG_NODE_NAME = "mergeTag";

export interface MergeTagNodeAttributes {
  key: string;
  label?: string | null;
}

function normalizeKey(value: unknown): string {
  return typeof value === "string" && value.trim() ? value.trim() : "unknown";
}

function tokenForKey(key: string): string {
  return `{{${key}}}`;
}

export const MergeTagExtension = EmailNode.create({
  name: MERGE_TAG_NODE_NAME,
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      key: {
        default: "unknown",
        parseHTML: (element) =>
          normalizeKey(element.getAttribute("data-merge-tag")),
        renderHTML: (attributes) => ({
          "data-merge-tag": normalizeKey(attributes.key),
        }),
      },
      label: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-label"),
        renderHTML: (attributes) =>
          typeof attributes.label === "string" && attributes.label
            ? { "data-label": attributes.label }
            : {},
      },
    };
  },

  parseHTML() {
    return [{ tag: "span[data-merge-tag]" }];
  },

  renderHTML({ HTMLAttributes }) {
    const key = normalizeKey(HTMLAttributes["data-merge-tag"]);
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        class: "react-email-merge-tag",
        contenteditable: "false",
      }),
      tokenForKey(key),
    ];
  },

  renderText({ node }) {
    return tokenForKey(normalizeKey(node.attrs?.key));
  },

  renderToReactEmail({ node }) {
    return tokenForKey(normalizeKey(node.attrs?.key));
  },
});

export function createMergeTagNode(key: string, label?: string | null) {
  return {
    type: MERGE_TAG_NODE_NAME,
    attrs: {
      key: normalizeKey(key),
      label: label ?? null,
    },
  };
}
