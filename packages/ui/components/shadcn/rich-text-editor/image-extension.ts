"use client";
import Image from "@tiptap/extension-image";
import { ReactNodeViewRenderer } from "@tiptap/react";

import { ResizableImageView } from "./image-node-view";
import { normalizeImageWidth } from "./image-resize";

export const ResizableImageExtension = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: "100%",
        renderHTML: (attributes) => {
          const width = normalizeImageWidth(attributes.width);

          if (width === "100%") return {};

          return { style: `width: ${width}` };
        },
        parseHTML: (element) =>
          normalizeImageWidth(
            element.style.width || element.getAttribute("width") || "100%",
          ),
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView);
  },
});
