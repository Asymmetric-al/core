// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { useState } from "react";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";

vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-labels",
  () => ({
    useSupportLabels: () => ({
      data: [
        { id: "label-a", slug: "urgent", name: "Urgent" },
        { id: "label-b", slug: "follow-up", name: "Follow Up" },
      ],
    }),
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/components/labels/LabelManagerDialog",
  () => ({
    LabelManagerDialog: ({ open }: { open: boolean }) =>
      open ? <div role="dialog" aria-label="Manage labels" /> : null,
  }),
);

import { LabelFilter } from "../../../../../../../apps/admin/features/support-hub/components/toolbar/LabelFilter";

function Harness() {
  const [value, onValueChange] = useState(["urgent"]);
  return (
    <>
      <LabelFilter value={value} onValueChange={onValueChange} />
      <output aria-label="Labels value">{JSON.stringify(value)}</output>
    </>
  );
}

const scrollIntoViewDescriptor = Object.getOwnPropertyDescriptor(
  Element.prototype,
  "scrollIntoView",
);
beforeAll(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  Object.defineProperty(Element.prototype, "scrollIntoView", {
    configurable: true,
    value: vi.fn(),
  });
});
afterEach(cleanup);
afterAll(() => {
  vi.unstubAllGlobals();
  if (scrollIntoViewDescriptor)
    Object.defineProperty(
      Element.prototype,
      "scrollIntoView",
      scrollIntoViewDescriptor,
    );
  else Reflect.deleteProperty(Element.prototype, "scrollIntoView");
});

describe("support label filter", () => {
  it("exposes multiple selected labels, searches display names and preserves slug callbacks", async () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole("combobox", { name: "Labels" }));
    const listbox = await screen.findByRole("listbox");
    expect(listbox.getAttribute("aria-multiselectable")).toBe("true");
    expect(
      screen
        .getByRole("option", { name: "Urgent" })
        .getAttribute("aria-selected"),
    ).toBe("true");
    const search = screen.getByRole("combobox", { name: "Search labels" });
    fireEvent.change(search, { target: { value: "Follow Up" } });
    const option = await screen.findByRole("option", { name: "Follow Up" });
    fireEvent.keyDown(search, { key: "ArrowDown" });
    await waitFor(() =>
      expect(search.getAttribute("aria-activedescendant")).toBe(option.id),
    );
    fireEvent.keyDown(search, { key: "Enter" });
    expect(screen.getByLabelText("Labels value").textContent).toBe(
      '["urgent","follow-up"]',
    );
    expect(option.getAttribute("aria-selected")).toBe("true");
    expect(search).toHaveProperty("value", "Follow Up");
    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(screen.getByLabelText("Labels value").textContent).toBe("[]");
  });

  it("closes the filter before opening label management", async () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole("combobox", { name: "Labels" }));
    fireEvent.click(
      await screen.findByRole("button", { name: "Manage labels" }),
    );
    expect(screen.getByRole("dialog", { name: "Manage labels" })).toBeTruthy();
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
  });
});
