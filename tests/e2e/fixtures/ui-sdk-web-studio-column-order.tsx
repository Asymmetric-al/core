import { AgentBridge } from "@asym/ui/components/primitives/agent-bridge";
import {
  SortableList,
  SortableListHandle,
  SortableListItem,
} from "@asym/ui/components/primitives/sortable-list";
import React, { useEffect, useState } from "react";
import { hydrateRoot } from "react-dom/client";

// eslint-disable-next-line no-restricted-imports -- AL-1864: Browser fixture mounts the bridge with Web Studio's actual agent grant.
import { WEB_STUDIO_AGENT_PERMISSIONS } from "../../../apps/admin/src/cms-ui/web-studio/agent-permissions";
// eslint-disable-next-line no-restricted-imports -- AL-1864: Browser fixture exercises the actual Web Studio View menu with its sortable column order.
import {
  GridViewMenu,
  type GridViewColumn,
} from "../../../apps/admin/src/cms-ui/web-studio/collections/shared/list-workspace/grid-view-menu";

declare global {
  interface Window {
    __saved?: string[][];
  }
}

const COLUMNS: GridViewColumn[] = [
  {
    id: "title",
    label: "Title",
    visible: true,
    canHide: false,
    movable: false,
  },
  {
    id: "_status",
    label: "Status",
    visible: true,
    canHide: false,
    movable: false,
  },
  { id: "slug", label: "Slug", visible: true, canHide: true, movable: true },
  {
    id: "layout",
    label: "Layout",
    visible: true,
    canHide: true,
    movable: true,
  },
  {
    id: "updatedAt",
    label: "Updated At",
    visible: false,
    canHide: true,
    movable: true,
  },
];

const PAGES = new Map([
  ["home", "Home"],
  ["about", "About"],
  ["contact", "Contact"],
]);

// The real View menu of a Web Studio collection list, under the agent bridge
// the Payload layout mounts for Web Studio. Like Payload's
// `setColumns` (NativeCollectionGrid's `reorderColumns`), a saved order
// comes back as the columns' new order.
export function App() {
  const [columns, setColumns] = useState(COLUMNS);

  useEffect(() => {
    document.documentElement.dataset.hydrated = "true";
  }, []);

  const movable = columns.filter((column) => column.movable);
  return (
    <main className="flex min-h-screen flex-col items-end gap-4 bg-background p-6 text-foreground">
      <AgentBridge allow={WEB_STUDIO_AGENT_PERMISSIONS} />
      <GridViewMenu
        columns={columns}
        onToggle={(id, visible) =>
          setColumns((current) =>
            current.map((column) =>
              column.id === id ? { ...column, visible } : column,
            ),
          )
        }
        onReorder={(order) => {
          (window.__saved ??= []).push(order);
          setColumns((current) => [
            ...current.filter((column) => !column.movable),
            ...order.map((id) => current.find((column) => column.id === id)!),
          ]);
        }}
      />
      <output aria-label="Saved order">
        {movable.map((column) => column.id).join(",")}
      </output>
      {/* A list the grant does not name, so an agent may not move it. */}
      <SortableList
        aria-label="Pinned pages"
        className="flex flex-col gap-1"
        defaultValue={[...PAGES.keys()]}
      >
        {({ order }) =>
          order.map((id) => (
            <SortableListItem
              key={id}
              value={id}
              label={PAGES.get(id)}
              className="flex items-center gap-2"
            >
              <SortableListHandle
                aria-label={`Reorder ${PAGES.get(id)}`}
                className="size-8"
              />
              <span className="truncate text-sm">{PAGES.get(id)}</span>
            </SortableListItem>
          ))
        }
      </SortableList>
    </main>
  );
}

if (typeof document !== "undefined") {
  const root = document.getElementById("root");
  if (root) hydrateRoot(root, <App />);
}
