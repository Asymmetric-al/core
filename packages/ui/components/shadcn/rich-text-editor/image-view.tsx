"use client";

import Image from "@tiptap/extension-image";
import {
  type NodeViewProps,
  NodeViewWrapper,
  ReactNodeViewRenderer,
} from "@tiptap/react";
import { Trash } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@asym/ui/lib/utils";

import { Button } from "../button";

/* -------------------------------------------------------------------------- */
/*    Extension - extends base Image with width attribute + custom NodeView   */
/* -------------------------------------------------------------------------- */

export const ResizableImageExtension = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: "100%",
        renderHTML: (attributes) => ({ width: attributes.width }),
        parseHTML: (element) => element.getAttribute("width") || "100%",
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView);
  },
});

/* -------------------------------------------------------------------------- */
/*            NodeView - renders image with drag-to-resize handles            */
/* -------------------------------------------------------------------------- */

function ResizableImageView({
  node,
  editor,
  selected,
  deleteNode,
  updateAttributes,
}: NodeViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [resizing, setResizing] = useState(false);
  const resizeState = useRef({
    side: "right" as "left" | "right",
    startX: 0,
    startWidth: 0,
  });

  function startResize(clientX: number, side: "left" | "right") {
    setResizing(true);
    resizeState.current = {
      side,
      startX: clientX,
      startWidth: imgRef.current?.offsetWidth ?? 0,
    };
  }

  useEffect(() => {
    if (!resizing) return;

    const parentWidth =
      containerRef.current?.parentElement?.offsetWidth ?? Infinity;

    function onMove(clientX: number) {
      const { side, startX, startWidth } = resizeState.current;
      const dx = side === "right" ? clientX - startX : startX - clientX;
      const newWidth = Math.max(150, Math.min(startWidth + dx, parentWidth));
      updateAttributes({ width: newWidth });
    }

    function handleMouseMove(e: MouseEvent) {
      onMove(e.clientX);
    }
    function handleTouchMove(e: TouchEvent) {
      if (e.touches[0]) onMove(e.touches[0].clientX);
    }
    function handleEnd() {
      setResizing(false);
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleEnd);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleEnd);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleEnd);
    };
  }, [resizing, updateAttributes]);

  const isEditable = editor?.isEditable;

  return (
    <NodeViewWrapper
      ref={containerRef}
      className={cn("image-resizable", selected && "image-selected")}
      style={{ width: node.attrs.width }}
      data-drag-handle
    >
      <div className="group relative inline-block">
        <img
          ref={imgRef}
          src={node.attrs.src}
          alt={node.attrs.alt ?? ""}
          title={node.attrs.title ?? undefined}
          className="rounded-lg w-full h-auto block"
          draggable={false}
        />

        {isEditable && (
          <>
            <div
              className="absolute inset-y-0 left-0 z-20 flex w-6 cursor-col-resize items-center justify-start pl-1.5"
              onMouseDown={(e) => {
                e.preventDefault();
                startResize(e.clientX, "left");
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                if (e.touches[0]) startResize(e.touches[0].clientX, "left");
              }}
            >
              <div className="h-16 w-2 rounded-full border-2 border-background/60 bg-foreground/60 opacity-0 transition-opacity group-hover:opacity-100" />
            </div>

            <div
              className="absolute inset-y-0 right-0 z-20 flex w-6 cursor-col-resize items-center justify-end pr-2"
              onMouseDown={(e) => {
                e.preventDefault();
                startResize(e.clientX, "right");
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                if (e.touches[0]) startResize(e.touches[0].clientX, "right");
              }}
            >
              <div className="h-16 w-2 rounded-full border-2 border-background/60 bg-foreground/60 opacity-0 transition-opacity group-hover:opacity-100" />
            </div>

            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 z-20 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={deleteNode}
            >
              <Trash className="h-3.5 w-3.5" />
            </Button>
          </>
        )}
      </div>
    </NodeViewWrapper>
  );
}
