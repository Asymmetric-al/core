/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SuggestionList } from "../../../../../../../apps/admin/features/support-hub/components/detail/composer/extensions/SuggestionList";

afterEach(() => {
  cleanup();
});

describe("SuggestionList active option exposure", () => {
  it("points the listbox at the highlighted option id", () => {
    render(
      <SuggestionList
        heading="Mention"
        items={[
          { id: "alice", label: "Alice" },
          { id: "bob", label: "Bob" },
        ]}
        command={vi.fn()}
      />,
    );

    const listbox = screen.getByRole("listbox");
    const activeOption = screen.getByRole("option", { name: "Alice" });

    expect(activeOption.id).toMatch(/alice/);
    expect(listbox.getAttribute("aria-activedescendant")).toBe(activeOption.id);
    expect(activeOption.getAttribute("aria-selected")).toBe("true");
    expect(
      screen.getByRole("option", { name: "Bob" }).getAttribute("aria-selected"),
    ).toBe("false");
  });
});
