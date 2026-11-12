// @vitest-environment jsdom

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  Command,
  CommandInput,
} from "../../../../../../packages/ui/components/shadcn/command";

afterEach(cleanup);

/**
 * The global `:focus-visible` rule (packages/ui/styles/globals.css) adds a
 * 2px ring offset. CommandInput turns the ring off but must also cancel the
 * offset, or the offset band paints stray edge lines around the borderless
 * search field inside a clipped dialog or popover.
 */
describe("CommandInput focus ring", () => {
  it.each([
    ["dialog layout", false],
    ["popover layout", true],
  ])("cancels the global ring offset in the %s", (_layout, popoverChrome) => {
    const { container } = render(
      <Command>
        <CommandInput aria-label="Search" popoverChrome={popoverChrome} />
      </Command>,
    );

    const input = container.querySelector<HTMLInputElement>(
      'input[data-slot="command-input"]',
    );
    if (!input) throw new Error("CommandInput did not render an input");
    expect(input.className).toMatch(/(^|\s)focus-visible:ring-0(\s|$)/);
    expect(input.className).toMatch(/(^|\s)focus-visible:ring-offset-0(\s|$)/);
  });
});
