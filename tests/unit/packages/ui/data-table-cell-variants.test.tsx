import type { Cell, Row } from "@asym/ui/components/shadcn/data-table/tanstack";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  BadgeCell,
  DateCell,
  LinkCell,
  NumberCell,
  SelectCell,
} from "@asym/ui/components/shadcn/data-table";

type EmptyRow = Record<string, never>;

const row = { original: {} } as Row<EmptyRow>;
const numberCell = {} as Cell<EmptyRow, number | null>;
const textCell = {} as Cell<EmptyRow, string | null>;

describe("data-table cell variant empty states", () => {
  it("renders N/A for missing numeric values", () => {
    const markup = renderToStaticMarkup(
      <NumberCell value={null} row={row} cell={numberCell} />,
    );

    expect(markup).toContain("N/A");
    expect(markup).not.toContain("&gt;,&lt;");
    expect(markup).not.toContain(">,<");
  });

  it("does not render comma placeholders for empty display variants", () => {
    const markup = renderToStaticMarkup(
      <>
        <BadgeCell value={null} row={row} cell={textCell} />
        <DateCell value={null} row={row} cell={textCell} />
        <LinkCell value={null} row={row} cell={textCell} />
        <SelectCell
          value={null}
          row={row}
          cell={textCell}
          options={[{ value: "active", label: "Active" }]}
        />
      </>,
    );

    expect(markup).toContain("N/A");
    expect(markup).not.toContain("&gt;,&lt;");
    expect(markup).not.toContain(">,<");
  });
});
