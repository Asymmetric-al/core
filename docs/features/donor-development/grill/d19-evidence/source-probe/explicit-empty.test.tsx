// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import {
  Select,
  SelectContent,
  SelectControlLabel,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../../packages/ui/components/shadcn/select";

afterEach(cleanup);

it("emits an explicit null selection and displays its item label rather than the generic placeholder", async () => {
  const onValueChange = vi.fn();
  const items = [
    { value: null, label: "Not yet assessed" },
    { value: "stage-b", label: "Conversation" },
  ];
  render(
    <Select<string | null> items={items} defaultValue="stage-b" onValueChange={onValueChange}>
      <SelectControlLabel>Stage outcome</SelectControlLabel>
      <SelectTrigger>
        <SelectValue placeholder="Generic placeholder" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {items.map((item) => (
            <SelectItem key={item.value ?? "explicit-empty-item"} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>,
  );

  const trigger = screen.getByRole("combobox", { name: "Stage outcome" });
  expect(trigger.textContent).toContain("Conversation");
  expect(onValueChange).not.toHaveBeenCalled();
  fireEvent.mouseDown(trigger);
  const emptyOption = await screen.findByRole("option", { name: "Not yet assessed" });
  fireEvent.pointerDown(emptyOption, { pointerType: "mouse", buttons: 1 });
  fireEvent.click(emptyOption);
  await waitFor(() => expect(trigger.textContent).toContain("Not yet assessed"));
  expect(trigger.textContent).not.toContain("Generic placeholder");
  expect(onValueChange).toHaveBeenCalledTimes(1);
  expect(onValueChange.mock.calls[0]?.[0]).toBeNull();
});
