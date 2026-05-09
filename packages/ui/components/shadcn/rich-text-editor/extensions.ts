import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";

import { isAllowedPostLinkHref } from "./helpers";
import { ResizableImageExtension } from "./image-view";

const LINK_HTML_ATTRIBUTES = {
  class: "text-primary underline cursor-pointer",
  target: "_blank",
  rel: "noopener noreferrer",
};

function createStarterKit({ openOnClick }: { openOnClick: boolean }) {
  return StarterKit.configure({
    heading: {
      levels: [1, 2],
    },
    link: {
      openOnClick,
      isAllowedUri: (url) => isAllowedPostLinkHref(url),
      HTMLAttributes: LINK_HTML_ATTRIBUTES,
    },
    underline: {
      HTMLAttributes: {},
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
  });
}

export interface CreateDefaultExtensionsOptions {
  /** Shown for body paragraphs when using the Placeholder extension. */
  placeholder?: string;
}

export const viewerExtensions = [
  createStarterKit({ openOnClick: true }),
  ResizableImageExtension.configure({
    inline: false,
    allowBase64: false,
    HTMLAttributes: {
      decoding: "async",
      loading: "lazy",
    },
  }),
];

export function createDefaultExtensions(
  options?: CreateDefaultExtensionsOptions,
) {
  const placeholderText = options?.placeholder?.trim() || "Type something...";

  return [
    createStarterKit({ openOnClick: false }),
    ResizableImageExtension.configure({
      inline: false,
      allowBase64: false,
      HTMLAttributes: {
        decoding: "async",
        loading: "lazy",
      },
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
