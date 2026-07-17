// @vitest-environment jsdom

import { act } from "react";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useColumnResizing } from "../../../../packages/ui/components/shadcn/data-table/hooks/use-column-resizing";

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

function ColumnSizingProbe() {
  const { columnSizing } = useColumnResizing({
    persistKey: "hydration",
  });

  return <output>{columnSizing.name ?? "unset"}</output>;
}

describe("useColumnResizing", () => {
  afterEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it("hydrates before reading persisted column sizing", async () => {
    const originalWindow = window;
    vi.stubGlobal("window", undefined);
    const serverHtml = renderToString(<ColumnSizingProbe />);

    vi.stubGlobal("window", originalWindow);
    localStorage.setItem(
      "data-table-column-sizing-hydration",
      JSON.stringify({ name: 240 }),
    );

    const container = document.createElement("div");
    container.innerHTML = serverHtml;
    const recoverableErrors: unknown[] = [];
    let root: Root | undefined;

    await act(async () => {
      root = hydrateRoot(container, <ColumnSizingProbe />, {
        onRecoverableError(error) {
          recoverableErrors.push(error);
        },
      });
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(recoverableErrors).toEqual([]);
    expect(container.textContent).toBe("240");

    await act(async () => {
      root?.unmount();
    });
  });
});
