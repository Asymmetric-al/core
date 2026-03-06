import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";

import { ResizableImageExtension } from "./image-view";

export const defaultExtensions = [
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
    link: {
      openOnClick: false,
      HTMLAttributes: {
        class: "text-primary underline cursor-pointer",
      },
    },
    underline: {},
  }),
  ResizableImageExtension.configure({
    inline: false,
    allowBase64: false,
  }),
  Placeholder.configure({
    placeholder: ({ node }) => {
      if (node.type.name === "heading") {
        return "What is the title?";
      }
      return "Type something...";
    },
    includeChildren: true,
  }),
];
