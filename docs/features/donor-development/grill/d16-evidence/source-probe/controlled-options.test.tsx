// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { SearchableSelect } from "../../../../../../packages/ui/components/shadcn/searchable-select";

afterEach(cleanup);

it("does not rebind a controlled stage to a same-labelled option when its list of options changes", async () => {
  const onValueChange = vi.fn();
  const oldValue = "stage-in-list-a";
  const firstItems = [{ value: oldValue, label: "Conversation" }];
  const secondItems = [
    { value: "stage-in-list-b", label: "Conversation" },
  ];
  const { rerender } = render(
    <SearchableSelect
      label="Stage"
      items={firstItems}
      value={oldValue}
      placeholder="Choose a stage"
      onValueChange={onValueChange}
    />,
  );
  expect(screen.getByRole("combobox", { name: "Stage" }).textContent).toContain(
    "Conversation",
  );

  // The caller deliberately keeps the old controlled value. Replacing the options
  // alone must not be mistaken for validating or resetting a dependent form field.
  rerender(
    <SearchableSelect
      label="Stage"
      items={secondItems}
      value={oldValue}
      placeholder="Choose a stage"
      onValueChange={onValueChange}
    />,
  );
  const trigger = screen.getByRole("combobox", { name: "Stage" });
  await waitFor(() => expect(trigger.textContent).toContain("Choose a stage"));
  expect(trigger.textContent).not.toContain("Conversation");
  expect(onValueChange).not.toHaveBeenCalled();

  fireEvent.click(trigger);
  const newOption = await screen.findByRole("option", { name: "Conversation" });
  expect(newOption.getAttribute("aria-selected")).not.toBe("true");
  expect(onValueChange).not.toHaveBeenCalled();
  fireEvent.click(newOption);
  expect(onValueChange).toHaveBeenCalledTimes(1);
  expect(onValueChange.mock.calls[0]?.[0]).toBe("stage-in-list-b");
});
