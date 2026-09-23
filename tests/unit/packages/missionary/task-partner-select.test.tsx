// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TaskPartnerSelect } from "../../../../packages/missionary/components/task-partner-select";

const donors = [
  { id: "first", name: "Alex Smith", email: "first@example.test" },
  { id: "second", name: "Alex Smith", email: "second@example.test" },
];

function Example({
  initial = "",
  loading = false,
  onBlur,
}: {
  initial?: string;
  loading?: boolean;
  onBlur?: () => void;
}) {
  const [value, setValue] = useState(initial);
  const [open, setOpen] = useState(false);
  return (
    <>
      <TaskPartnerSelect
        donors={donors}
        value={value}
        loading={loading}
        onChange={setValue}
        onBlur={onBlur}
        open={open}
        onOpenChange={setOpen}
      />
      <output aria-label="Selected partner ID">{value || "none"}</output>
    </>
  );
}

const scrollDescriptor = Object.getOwnPropertyDescriptor(
  HTMLElement.prototype,
  "scrollIntoView",
);
beforeEach(() => {
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
    configurable: true,
    value: vi.fn(),
  });
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  if (scrollDescriptor)
    Object.defineProperty(
      HTMLElement.prototype,
      "scrollIntoView",
      scrollDescriptor,
    );
  else Reflect.deleteProperty(HTMLElement.prototype, "scrollIntoView");
});

describe("Task partner selection", () => {
  it("selects the correct stable ID by keyboard when names are duplicated", async () => {
    render(<Example />);
    fireEvent.click(screen.getByRole("combobox"));
    const input = await screen.findByPlaceholderText("Search partners...");
    fireEvent.change(input, { target: { value: "Alex" } });
    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(2));
    fireEvent.keyDown(input, { key: "End" });
    fireEvent.keyDown(input, { key: "Enter" });
    await waitFor(() =>
      expect(screen.getByLabelText("Selected partner ID").textContent).toBe(
        "second",
      ),
    );
  });

  it("clears with a named button outside the selection trigger", async () => {
    const onBlur = vi.fn();
    render(<Example initial="second" onBlur={onBlur} />);
    const clear = screen.getByRole("button", {
      name: "Clear associated partner",
    });
    expect(clear.parentElement?.closest("button")).toBeNull();
    fireEvent.click(clear);
    expect(screen.getByLabelText("Selected partner ID").textContent).toBe(
      "none",
    );
    expect(onBlur).toHaveBeenCalledOnce();
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole("combobox")),
    );
  });

  it("announces a search with no matching partners", async () => {
    render(<Example />);
    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.change(await screen.findByPlaceholderText("Search partners..."), {
      target: { value: "missing partner" },
    });
    expect(await screen.findByText("No partners found.")).toBeTruthy();
  });

  it("searches email and allows deselecting the current partner", async () => {
    render(<Example initial="second" />);
    fireEvent.click(screen.getByRole("combobox"));
    const input = await screen.findByPlaceholderText("Search partners...");
    fireEvent.change(input, { target: { value: "second@example.test" } });
    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(1));
    const option = screen.getByRole("option");
    expect(option.getAttribute("aria-selected")).toBe("true");
    fireEvent.click(option);
    await waitFor(() =>
      expect(screen.getByLabelText("Selected partner ID").textContent).toBe(
        "none",
      ),
    );
  });
});
