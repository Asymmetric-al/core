import { JSDOM } from "jsdom";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Calendar } from "@asym/ui/components/shadcn/calendar";

describe("Calendar upstream integration", () => {
  it("preserves the Maia month grid and a selected day", () => {
    const dom = new JSDOM(
      renderToStaticMarkup(
        <Calendar
          mode="single"
          month={new Date(2026, 0, 1)}
          selected={new Date(2026, 0, 5)}
        />,
      ),
    );
    try {
      const document = dom.window.document;
      const grid = document.querySelector("table");
      expect(grid?.classList.contains("w-full")).toBe(true);
      expect(grid?.classList.contains("border-collapse")).toBe(true);
      expect(document.querySelectorAll("th[scope=col]")).toHaveLength(7);
      expect(
        document.querySelector('[aria-selected="true"] button')?.textContent,
      ).toBe("5");
      expect(document.body.textContent).toContain("January 2026");
    } finally {
      dom.window.close();
    }
  });
});
