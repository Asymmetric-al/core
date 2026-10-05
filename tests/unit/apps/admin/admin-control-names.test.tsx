/** @vitest-environment jsdom */

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DeleteNamedViewDialog } from "../../../../apps/admin/app/(app)/crm/gift-history-dialogs";
import { MobilizeAddCandidateSheet } from "../../../../apps/admin/app/(app)/mobilize/mobilize-sections";

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

  it("associates every candidate input with its visible label and autofill purpose", () => {
    const view = render(
      <MobilizeAddCandidateSheet open onOpenChange={vi.fn()} />,
    );
    expect(
      view
        .getByRole("textbox", { name: "First Name" })
        .getAttribute("autocomplete"),
    ).toBe("given-name");
    expect(
      view
        .getByRole("textbox", { name: "Last Name" })
        .getAttribute("autocomplete"),
    ).toBe("family-name");
    expect(
      view
        .getByRole("textbox", { name: "Email Address" })
        .getAttribute("autocomplete"),
    ).toBe("email");
    expect(view.getByRole("textbox", { name: "Interest Role" })).toBeTruthy();
  });
});
