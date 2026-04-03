import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import StarterKit from "@tiptap/starter-kit";

import { isAllowedPostLinkHref } from "./helpers";
import { ResizableImageExtension } from "./image-view";

export interface CreateDefaultExtensionsOptions {
  /** Shown for body paragraphs when using the Placeholder extension. */
  placeholder?: string;
}

export function createDefaultExtensions(
  options?: CreateDefaultExtensionsOptions,
) {
  const placeholderText = options?.placeholder?.trim() || "Type something...";

  return [
    StarterKit.configure({
      heading: {
        levels: [1, 2],
      },
      bulletList: {
        HTMLAttributes: {
          class: "list-disc pl-4 space-y-1",
        },
      },
      orderedList: {
        HTMLAttributes: {
          class: "list-decimal pl-4 space-y-1",
        },
      },
      blockquote: {
        HTMLAttributes: {
          class: "border-l-4 border-primary pl-4 italic",
        },
      },
    }),
    Link.configure({
      openOnClick: false,
      isAllowedUri: (url) => isAllowedPostLinkHref(url),
      HTMLAttributes: {
        class: "text-primary underline cursor-pointer",
      },
    }),
    Underline,
    ResizableImageExtension.configure({
      inline: false,
      allowBase64: false,
    }),
    Placeholder.configure({
      placeholder: ({ node }) => {
        if (node.type.name === "heading") {
          return "What is the title?";
        }
        return placeholderText;
      },
      includeChildren: true,
    }),
  ];
}
