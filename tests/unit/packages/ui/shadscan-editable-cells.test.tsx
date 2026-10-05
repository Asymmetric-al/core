/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { NumberCell } from "../../../../packages/ui/components/shadcn/data-table/cell-variants/number-cell";
import { TextCell } from "../../../../packages/ui/components/shadcn/data-table/cell-variants/text-cell";

afterEach(cleanup);

it("names the numeric editor with its table column rather than only a placeholder", () => {
  const cell = {
    column: { id: "amount", columnDef: { meta: { label: "Gift amount" } } },
  } as never;
  render(
    <NumberCell value={10} isEditing cell={cell} row={undefined as never} />,
  );
  expect(
    screen.getByRole("textbox", { name: "Edit Gift amount" }),
  ).toBeTruthy();
});

it.each([false, true])(
  "names the text editor through its shared props at multiline=%s",
  (multiline) => {
    const cell = {
      column: { id: "name", columnDef: { meta: { label: "Partner name" } } },
    } as never;
    render(
      <TextCell
        value="Conrad"
        isEditing
        multiline={multiline}
        cell={cell}
        row={undefined as never}
      />,
    );
    expect(
      screen.getByRole("textbox", { name: "Edit Partner name" }),
    ).toBeTruthy();
  },
);
