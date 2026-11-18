"use client";

import {
  createChange,
  createReorder,
  definePrimitive,
  idPart,
  labelOf,
  type ChangeDetails,
  type ReorderDraft,
  type ReorderReason,
} from "@ui-sdk/core";
import { createParts, usePart, usePrimitive } from "@ui-sdk/react/primitive";
import { GripVerticalIcon } from "lucide-react";

import { cn } from "@asym/ui/lib/utils";

import { buttonVariants } from "../shadcn/button-variants";

import type { ComponentProps, ReactNode } from "react";

type SortableListOptions = {
  /** The row keys in order. Pass it with `onValueChange` to control the order. */
  value?: string[];
  defaultValue?: string[];
  /**
   * `details.reason` is `"drag"`, `"move-key"` or `"imperative"` (`move`),
   * `details.source` is `"agent"` for an agent's move, and `details.cancel()`
   * refuses the change.
   */
  onValueChange?: (
    value: string[],
    details: ChangeDetails<ReorderReason>,
  ) => void;
};

const instructionsId = (id: string, key: string) =>
  `${id}-${idPart(key)}-instructions`;

const sortableList = definePrimitive({
  name: "sortable-list",
  options: { value: "list", defaultValue: "list", onValueChange: "callback" },
  controlled: ["value"],
  state: (options: SortableListOptions) => ({
    value: options.value ?? options.defaultValue ?? [],
    moving: null as ReorderDraft | null,
  }),
  sync: (options) =>
    options.value === undefined ? {} : { value: options.value },
  api: (context) => {
    const change = createChange(context);
    const label = (key: string) =>
      context.props<{ label?: string }>("row", key)?.label;
    const name = (key: string) => {
      const row = context.element("row", key);
      return label(key) ?? ((row && labelOf(row)) || key);
    };
    const reorder = createReorder(context, {
      slot: "row",
      key: "value",
      draft: "moving",
      set: (value, details) => change("value", value, details),
      label,
    });
    // UI SDK puts a row picked up with the keyboard back only on Escape or
    // Tab. A press or focus elsewhere must too, or the list keeps showing an
    // order that is not its value and blocks pointer drags.
    const putBack = (event: Event) => {
      const draft = context.store.get().moving;
      if (!draft || draft.pointer) return;
      const handle = context.element("handle", draft.key);
      if (!(event.target instanceof Node && handle?.contains(event.target))) {
        reorder.cancel();
      }
    };
    let stopWatching: (() => void) | undefined;
    const unsubscribe = context.store.subscribe(() => {
      const draft = context.store.get().moving;
      if (!draft || draft.pointer) {
        stopWatching?.();
        stopWatching = undefined;
        return;
      }
      if (stopWatching) return;
      const doc = context.element("handle", draft.key)?.ownerDocument;
      if (!doc) return;
      doc.addEventListener("pointerdown", putBack, true);
      doc.addEventListener("focusin", putBack, true);
      stopWatching = () => {
        doc.removeEventListener("pointerdown", putBack, true);
        doc.removeEventListener("focusin", putBack, true);
      };
    });
    context.onDestroy(() => {
      unsubscribe();
      stopWatching?.();
    });
    return {
      reorder,
      // An agent's arguments are unchecked JSON. A thrown error fails its step
      // with this message, where `false` would still report the step as done.
      move: (key: string, index: number) => {
        const order = reorder.order(context.store.get());
        if (!order.includes(key)) {
          const names = order.map((row) => JSON.stringify(name(row)));
          throw new Error(`No row "${key}". Rows: ${names.join(", ")}.`);
        }
        if (!Number.isInteger(index) || index < 0 || index >= order.length) {
          throw new Error(
            `Position must be a whole number from 0 to ${order.length - 1}.`,
          );
        }
        return reorder.move(key, index);
      },
      rows: () =>
        reorder
          .order(context.store.get())
          .map((key) => ({ value: key, label: name(key) })),
    };
  },
  slots: (slot) => ({
    root: slot<object, { order: string[] }>({
      role: "list",
      state: (state, { api }) => ({ order: api.reorder.order(state) }),
      attrs: () => ({ "aria-roledescription": "sortable list" }),
    }),
    // Not `item`: UI SDK's agent bridge names an `item` part by its whole text,
    // which runs a row's controls together, instead of `rows()` below.
    row: slot<{ value: string; label?: string }>({
      role: "listitem",
      props: { value: "string", label: "string" },
      attrs: (state, { key, api }) => ({
        "data-grabbed": api.reorder.moving(state, key) ? "" : undefined,
        "data-dragging": api.reorder.dragging(state, key) ? "" : undefined,
      }),
      bind: (el, part) => part.api.reorder.bind(el, part),
    }),
    // Rows hold other controls, so only the handle reads keys and drags.
    handle: slot<{ value?: string }>({
      props: { value: { kind: "string", from: "row", required: true } },
      attrs: (state, { id, key, api }) => ({
        type: "button",
        "aria-pressed": String(api.reorder.moving(state, key)),
        "aria-describedby": instructionsId(id, key),
      }),
      on: {
        keydown: (event, { api, key }) => {
          api.reorder.keydown(event, key);
        },
        pointerdown: (event, { api, key }) =>
          api.reorder.pointerdown(event, key),
      },
    }),
    instructions: slot<{ value?: string }>({
      props: { value: { kind: "string", from: "row", required: true } },
      attrs: (_state, { id, key }) => ({
        id: instructionsId(id, key),
        hidden: "",
        "aria-hidden": "true",
      }),
    }),
  }),
  agent: { actions: ["move"], items: (api) => api.rows() },
});

const { Row, Handle, Instructions } = createParts(sortableList, {
  row: "li",
  handle: "button",
  instructions: "span",
});

// Core's Base UI `FieldLabel` cannot name a UI SDK part, so callers must.
type AccessibleName =
  | { "aria-label": string; "aria-labelledby"?: never }
  | { "aria-label"?: never; "aria-labelledby": string };

export type SortableListProps = SortableListOptions &
  Omit<
    ComponentProps<"ul">,
    "aria-label" | "aria-labelledby" | "children" | "defaultValue"
  > &
  AccessibleName & {
    /**
     * Renders one `SortableListItem` per key of `order`, keyed by it. `order`
     * follows a row while it is being moved, so it can differ from `value`.
     * `move` puts a row at a position (from 0) at once and announces it, for a
     * "Move up" button.
     */
    children: (list: {
      order: string[];
      move: (key: string, index: number) => boolean;
    }) => ReactNode;
  };

/**
 * A list whose rows are reordered by dragging a row's handle or, from the
 * handle, with the keyboard: Space or Enter picks the row up, the arrow keys,
 * Home and End move it, Space or Enter drops it and Escape or Tab puts it
 * back. UI SDK owns that behavior and its screen-reader announcements; this
 * wrapper adds Maia tokens. See `docs/ai/skills/ui-sdk/SKILL.md`.
 */
export function SortableList({
  value,
  defaultValue,
  onValueChange,
  children,
  ...props
}: SortableListProps) {
  const list = usePrimitive(sortableList, {
    value,
    defaultValue,
    onValueChange,
  });
  return usePart(
    list,
    "root",
    {},
    {
      ...props,
      children: ({ order }) => children({ order, move: list.api.move }),
    },
    "ul",
  );
}

export type SortableListItemProps = Omit<
  ComponentProps<"li">,
  "id" | "value"
> & {
  /** The row's key in the list's `value`. */
  value: string;
  /** What a screen reader hears the row called as it moves, and what an agent calls it. Defaults to the row's text. */
  label?: string;
};

export function SortableListItem({
  className,
  ...props
}: SortableListItemProps) {
  return (
    <Row
      className={cn(
        "data-dragging:translate-x-(--drag-x) data-dragging:translate-y-(--drag-y) data-grabbed:relative data-grabbed:z-10 data-grabbed:shadow-md data-grabbed:ring-2 data-grabbed:ring-ring/50",
        className,
      )}
      {...props}
    />
  );
}

export type SortableListHandleProps = Omit<
  ComponentProps<"button">,
  "aria-label" | "aria-labelledby" | "id" | "type" | "value"
> &
  AccessibleName;

/** The button that moves its row. Put one inside each `SortableListItem`. */
export function SortableListHandle({
  className,
  children,
  onKeyDown,
  ...props
}: SortableListHandleProps) {
  return (
    <Handle
      className={cn(
        buttonVariants({ variant: "ghost", size: "icon" }),
        "cursor-grab touch-none text-muted-foreground aria-pressed:cursor-grabbing aria-pressed:bg-accent aria-pressed:text-accent-foreground pointer-coarse:size-11",
        className,
      )}
      {...props}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        // A Base UI dialog or sheet closes on Escape from its own React key
        // handler, which UI SDK cannot stop. While a row is picked up, Escape
        // only puts it back.
        if (
          event.key === "Escape" &&
          event.currentTarget.getAttribute("aria-pressed") === "true"
        ) {
          event.stopPropagation();
        }
      }}
    >
      {children ?? <GripVerticalIcon aria-hidden="true" />}
      <Instructions>
        Press Space or Enter to pick up this row. Use the arrow keys to move it,
        Home or End to move it to the top or bottom, Space or Enter to drop it,
        and Escape to cancel.
      </Instructions>
    </Handle>
  );
}
