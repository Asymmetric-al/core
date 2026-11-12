/** @vitest-environment jsdom */

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SetTenantDefaultDialog } from "../../../../../apps/admin/app/(app)/crm/gift-history-dialogs";

describe("tenant default confirmation layout", () => {
  afterEach(cleanup);

  it("allows the action row to wrap at narrow dialog widths", () => {
    const view = render(
      <SetTenantDefaultDialog
        open
        isSaving={false}
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    const confirm = view.getByRole("button", {
      name: "Set organization default",
    });
    expect(confirm.parentElement?.classList.contains("flex-wrap")).toBe(true);
  });
});
