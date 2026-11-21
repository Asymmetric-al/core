// @vitest-environment jsdom

import { act } from "react";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { useColumnResizing } from "../../../../packages/ui/components/shadcn/data-table/hooks/use-column-resizing";
import { renderDocumentScope } from "../database/scope-fixture";

// WP2b, AL-2675 (council round 1 on slice B, SB5): stored column sizes are
// keyed by the document's person and tenant, and a document with no scope
// stores nothing. This page is given a scope, as a signed-in page has, and
// its stored sizes sit under the scoped key; every assertion is unchanged.
const SCOPE = {
  userId: "00000000-0000-4000-8000-0000000000a1",
  tenantId: "00000000-0000-0000-0000-000000000001",
  assignmentId: "00000000-0000-4000-8000-000000000101",
  addressPrefix: "/00000000-0000-0000-0000-000000000001",
};

beforeAll(async () => {
  await renderDocumentScope(SCOPE);
});

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
      `data-table-column-sizing-hydration::${SCOPE.userId}::${SCOPE.tenantId}`,
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
