/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { GiftHistoryViewSwitcher } from "../../../../../apps/admin/app/crm/gift-history-view-switcher";

import type { CrmNamedView } from "@asym/database/types";

/**
 * Locks the apply-first management decision for named views (#273):
 * rename/duplicate/set-default/reset/delete are offered for the ACTIVE view
 * only — managing another view means applying it first. Recorded as intended
 * UX (working state is authoritative, ADR-CD-021).
 */

function makeView(overrides: Partial<CrmNamedView> = {}): CrmNamedView {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Major donors",
    isDefault: false,
    schemaVersion: 1,
    pinnedActionId: null,
    settings: null,
    ...overrides,
  };
}

function renderSwitcher(input: {
  views: CrmNamedView[];
  activeViewId: string | null;
}) {
  return render(
    <GiftHistoryViewSwitcher
      views={input.views}
      activeViewId={input.activeViewId}
      onApplyView={vi.fn()}
      onSaveCurrentAs={vi.fn()}
      onRename={vi.fn()}
      onDuplicate={vi.fn()}
      onSetDefault={vi.fn()}
      onResetToSaved={vi.fn()}
      onDelete={vi.fn()}
    />,
  );
}

async function openMenu(view: ReturnType<typeof render>) {
  fireEvent.click(view.getByRole("button", { name: "Gift history views" }));
  await waitFor(() => {
    expect(view.getByText("Save current as view…")).toBeTruthy();
  });
}

describe("crm gift history view switcher", () => {
  afterEach(() => {
    cleanup();
  });

  it("offers management actions for the active view only", async () => {
    const active = makeView();
    const other = makeView({
      id: "22222222-2222-4222-8222-222222222222",
      name: "Lapsed donors",
    });
    const view = renderSwitcher({
      views: [active, other],
      activeViewId: active.id,
    });
    await openMenu(view);

    // Management targets the active view by name; the non-active view is
    // switchable but not directly manageable (apply-first management).
    expect(view.getByText(`Rename “${active.name}”…`)).toBeTruthy();
    expect(view.queryByText(`Rename “${other.name}”…`)).toBeNull();
    expect(view.getByText("Duplicate")).toBeTruthy();
    expect(view.getByText("Set as default")).toBeTruthy();
    expect(view.getByText("Delete view…")).toBeTruthy();
  });

  it("offers no management actions when no view is active", async () => {
    const view = renderSwitcher({
      views: [makeView()],
      activeViewId: null,
    });
    await openMenu(view);

    expect(view.getByText("Save current as view…")).toBeTruthy();
    expect(view.queryByText(/^Rename/)).toBeNull();
    expect(view.queryByText("Duplicate")).toBeNull();
    expect(view.queryByText("Set as default")).toBeNull();
    expect(view.queryByText("Delete view…")).toBeNull();
  });

  it("hides Set as default when the active view is already the default", async () => {
    const active = makeView({ isDefault: true });
    const view = renderSwitcher({
      views: [active],
      activeViewId: active.id,
    });
    await openMenu(view);

    expect(view.queryByText("Set as default")).toBeNull();
    expect(view.getByText("Delete view…")).toBeTruthy();
  });
});
