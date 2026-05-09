"use client";

import * as React from "react";
import { createRoot, type Root } from "react-dom/client";

import {
  SuggestionList,
  type SuggestionItem,
  type SuggestionListHandle,
} from "./SuggestionList";

import type { SuggestionOptions } from "@asym/ui/components/shadcn/rich-text-editor";

interface RendererOptions {
  heading?: string;
  emptyHint?: string;
}

interface RenderProps<T> {
  items: T[];
  command: (item: T) => void;
  clientRect?: (() => DOMRect | null) | null;
}

interface KeyDownProps {
  event: KeyboardEvent;
}

/**
 * Bridges Tiptap's imperative suggestion `render()` API to a React-rendered
 * popover. Returns a function suitable to assign to `Suggestion.render` on
 * any extension that uses the same item shape.
 *
 * The popover is positioned absolutely against `document.body` using the
 * client rect Tiptap supplies. This avoids the tippy.js dependency while
 * staying compatible with the standard Tiptap suggestion API.
 */
export function buildSuggestionRenderer<T extends SuggestionItem>({
  heading,
  emptyHint,
}: RendererOptions = {}): SuggestionOptions<T>["render"] {
  return () => {
    let container: HTMLDivElement | null = null;
    let root: Root | null = null;
    let listRef: SuggestionListHandle | null = null;

    const ensureContainer = () => {
      if (container) return container;
      container = document.createElement("div");
      container.style.position = "absolute";
      container.style.zIndex = "1000";
      document.body.appendChild(container);
      root = createRoot(container);
      return container;
    };

    const renderInto = (props: RenderProps<T>) => {
      const node = ensureContainer();
      const rect = props.clientRect?.();
      if (rect) {
        node.style.top = `${rect.bottom + window.scrollY + 4}px`;
        node.style.left = `${rect.left + window.scrollX}px`;
      }
      root?.render(
        <SuggestionList
          ref={(handle) => {
            listRef = handle;
          }}
          items={props.items}
          command={(item) => props.command(item as T)}
          heading={heading}
          emptyHint={emptyHint}
        />,
      );
    };

    return {
      onStart: (props: RenderProps<T>) => {
        renderInto(props);
      },
      onUpdate: (props: RenderProps<T>) => {
        renderInto(props);
      },
      onKeyDown: (props: KeyDownProps) => {
        if (props.event.key === "Escape") return false;
        return listRef?.onKeyDown({ event: props.event }) ?? false;
      },
      onExit: () => {
        listRef = null;
        if (root) {
          root.unmount();
          root = null;
        }
        if (container?.parentNode) {
          container.parentNode.removeChild(container);
        }
        container = null;
      },
    };
  };
}
