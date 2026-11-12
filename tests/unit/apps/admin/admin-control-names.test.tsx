/** @vitest-environment jsdom */

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DeleteNamedViewDialog } from "../../../../apps/admin/app/(app)/crm/gift-history-dialogs";

afterEach(cleanup);

describe("Admin form relationships", () => {
  it("names the replacement-default radio group", () => {
    const current = {
      id: "view-1",
      name: "Current",
      isDefault: true,
      schemaVersion: 1,
      pinnedActionId: null,
      settings: null,
    };
    const view = render(
      <DeleteNamedViewDialog
        view={current}
        views={[current]}
        nextDefaultChoice=""
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
        onNextDefaultChoiceChange={vi.fn()}
      />,
    );
    expect(
      view.getByRole("radiogroup", { name: "Replacement default view" }),
    ).toBeTruthy();
  });
});
