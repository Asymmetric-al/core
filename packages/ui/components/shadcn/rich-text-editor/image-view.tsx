"use client";

import Image from "@tiptap/extension-image";
import {
  type NodeViewProps,
  NodeViewWrapper,
  ReactNodeViewRenderer,
} from "@tiptap/react";
import { Trash } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type TouchEvent,
} from "react";

import { cn } from "@asym/ui/lib/utils";

import { Button } from "../button";

export const IMAGE_RESIZE_MIN_PX = 150;

export function resolveImageResizeAriaValues({
  currentWidthPx,
  maxWidthPx,
}: {
  currentWidthPx: number;
  maxWidthPx: number;
}): { min: number; max: number; now: number } {
  const min = IMAGE_RESIZE_MIN_PX;
  const finiteMax =
    Number.isFinite(maxWidthPx) && maxWidthPx > 0
      ? maxWidthPx
      : Math.max(currentWidthPx, min);
  const max = Math.max(min, finiteMax);
  const now = Math.min(Math.max(currentWidthPx, min), max);
  return { min, max, now };
}

export function ImageResizeHandle({
  side,
  ariaValues,
  onResizeKeyDown,
  onMouseDown,
  onTouchStart,
}: {
  side: "left" | "right";
  ariaValues: { min: number; max: number; now: number };
  onResizeKeyDown: (
    event: KeyboardEvent<HTMLDivElement>,
    side: "left" | "right",
  ) => void;
  onMouseDown: (event: MouseEvent<HTMLDivElement>) => void;
  onTouchStart: (event: TouchEvent<HTMLDivElement>) => void;
}) {
  const isLeft = side === "left";

  return (
    <div
      role="separator"
      aria-label={
        isLeft ? "Resize image from the left" : "Resize image from the right"
      }
      aria-orientation="vertical"
      aria-valuemin={ariaValues.min}
      aria-valuemax={ariaValues.max}
      aria-valuenow={ariaValues.now}
      tabIndex={0}
      onKeyDown={(event) => onResizeKeyDown(event, side)}
      className={cn(
        "absolute inset-y-0 z-20 flex w-6 cursor-col-resize items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:[&>div]:opacity-100",
        isLeft ? "left-0 justify-start pl-1.5" : "right-0 justify-end pr-2",
      )}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    >
      <div className="h-16 w-2 rounded-full border-2 border-background/60 bg-foreground/60 opacity-0 transition-opacity group-hover:opacity-100" />
    </div>
  );
}

function normalizeImageWidth(value: unknown): string {
  if (typeof value === "number" && Number.isFinite(value)) {
    return `${value}px`;
  }

  if (typeof value === "string") {
    const normalizedValue = value.trim();

    if (!normalizedValue) return "100%";
    if (/^\d+$/.test(normalizedValue)) return `${normalizedValue}px`;

    return normalizedValue;
  }

  return "100%";
}

/* -------------------------------------------------------------------------- */
/*    Extension - extends base Image with width attribute + custom NodeView   */
/* -------------------------------------------------------------------------- */

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

  /** Keyboard alternative to dragging: arrow keys nudge the width by 10px (50px with Shift). */
  function handleResizeKeyDown(
    event: React.KeyboardEvent<HTMLDivElement>,
    side: "left" | "right",
  ) {
    const grows =
      (side === "right" && event.key === "ArrowRight") ||
      (side === "left" && event.key === "ArrowLeft");
    const shrinks =
      (side === "right" && event.key === "ArrowLeft") ||
      (side === "left" && event.key === "ArrowRight");
    if (!grows && !shrinks) return;

    event.preventDefault();
    const step = (event.shiftKey ? 50 : 10) * (grows ? 1 : -1);
    const parentWidth =
      containerRef.current?.parentElement?.offsetWidth ?? Infinity;
    const startWidth = imgRef.current?.offsetWidth ?? 0;
    const newWidth = Math.max(
      IMAGE_RESIZE_MIN_PX,
      Math.min(startWidth + step, parentWidth),
    );
    updateAttributes({ width: `${newWidth}px` });
  }

  useEffect(() => {
    if (!resizing) return;

    const parentWidth =
      containerRef.current?.parentElement?.offsetWidth ?? Infinity;

    function onMove(clientX: number) {
      const { side, startX, startWidth } = resizeState.current;
      const dx = side === "right" ? clientX - startX : startX - clientX;
      const newWidth = Math.max(
        IMAGE_RESIZE_MIN_PX,
        Math.min(startWidth + dx, parentWidth),
      );
      updateAttributes({ width: `${newWidth}px` });
    }

    function handleMouseMove(e: globalThis.MouseEvent) {
      onMove(e.clientX);
    }
    function handleTouchMove(e: globalThis.TouchEvent) {
      if (e.touches[0]) onMove(e.touches[0].clientX);
    }
    function handleEnd() {
      setResizing(false);
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleEnd);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleEnd);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleEnd);
    };
  }, [resizing, updateAttributes]);

  const isEditable = editor?.isEditable;
  const currentWidth = normalizeImageWidth(node.attrs.width);
  const currentWidthPx = (() => {
    const match = currentWidth.match(/^(\d+(?:\.\d+)?)px$/);
    if (match) return Number(match[1]);
    return imgRef.current?.offsetWidth ?? IMAGE_RESIZE_MIN_PX;
  })();
  const maxWidthPx =
    containerRef.current?.parentElement?.offsetWidth ?? currentWidthPx;
  const ariaValues = resolveImageResizeAriaValues({
    currentWidthPx,
    maxWidthPx,
  });

  return (
    <NodeViewWrapper
      ref={containerRef}
      className={cn("image-resizable", selected && "image-selected")}
      style={{ width: currentWidth }}
      data-drag-handle
    >
      <div className="group relative inline-block">
        {/* Intentional raw img: TipTap needs a DOM ref for resize handles; uploads provide image URLs and base64 is disabled in extensions.ts. */}
        <img
          ref={imgRef}
          src={node.attrs.src}
          alt={node.attrs.alt ?? ""}
          title={node.attrs.title ?? undefined}
          className="rounded-lg w-full h-auto block"
          decoding="async"
          draggable={false}
          loading="lazy"
        />

        {isEditable && (
          <>
            <ImageResizeHandle
              side="left"
              ariaValues={ariaValues}
              onResizeKeyDown={handleResizeKeyDown}
              onMouseDown={(e) => {
                e.preventDefault();
                startResize(e.clientX, "left");
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                if (e.touches[0]) startResize(e.touches[0].clientX, "left");
              }}
            />

            <ImageResizeHandle
              side="right"
              ariaValues={ariaValues}
              onResizeKeyDown={handleResizeKeyDown}
              onMouseDown={(e) => {
                e.preventDefault();
                startResize(e.clientX, "right");
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                if (e.touches[0]) startResize(e.touches[0].clientX, "right");
              }}
            />

            <Button
              variant="destructive"
              size="icon"
              aria-label="Delete image"
              className="absolute top-2 right-2 z-20 size-7 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={deleteNode}
            >
              <Trash className="size-3.5" />
            </Button>
          </>
        )}
      </div>
    </NodeViewWrapper>
  );
}
