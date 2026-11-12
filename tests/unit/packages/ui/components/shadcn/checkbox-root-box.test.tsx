// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Checkbox } from "../../../../../../packages/ui/components/shadcn/checkbox";

afterEach(cleanup);

function rootOf(name: string) {
  const root = screen
    .getByRole("checkbox", { name })
    .closest<HTMLElement>('[data-slot="checkbox"]');
  expect(root).not.toBeNull();
  return root!;
}

describe("Checkbox root", () => {
  it("is a centred 16px box, so it never collapses inside a table cell", () => {
    render(
      <table>
        <tbody>
          <tr>
            <td>
              <Checkbox aria-label="Select row" defaultChecked />
            </td>
          </tr>
        </tbody>
      </table>,
    );
    // Base UI renders the root as a span; without a display utility its
    // width and height do not apply.
    const classes = rootOf("Select row").className.split(" ");
    expect(classes).toEqual(
      expect.arrayContaining([
        "inline-flex",
        "items-center",
        "justify-center",
        "size-4",
      ]),
    );
  });

  it("still shows a minus for the mixed state and a check when checked", () => {
    render(
      <>
        <Checkbox aria-label="Select all" indeterminate />
        <Checkbox aria-label="Select one" defaultChecked />
      </>,
    );
    const mixed = rootOf("Select all");
    expect(mixed.hasAttribute("data-indeterminate")).toBe(true);
    expect(mixed.querySelector("svg")?.getAttribute("class")).toContain(
      "lucide-minus",
    );
    const checked = rootOf("Select one");
    expect(checked.querySelector("svg")?.getAttribute("class")).toContain(
      "lucide-check",
    );
  });
});
