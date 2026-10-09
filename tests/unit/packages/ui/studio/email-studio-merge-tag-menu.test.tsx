// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { EmailStudioMergeTagMenu } from "../../../../../packages/ui/components/studio/EmailStudioMergeTagMenu";

afterEach(() => {
  cleanup();
});

describe("EmailStudioMergeTagMenu", () => {
  it("focuses search and inserts a filtered tag with arrow keys and Enter", async () => {
    const onInsert = vi.fn();
    render(<EmailStudioMergeTagMenu onInsert={onInsert} />);

    fireEvent.click(screen.getByRole("button", { name: "Merge tag" }));
    const input = await screen.findByLabelText("Search merge tags");
    await waitFor(() => expect(document.activeElement).toBe(input));

    fireEvent.change(input, { target: { value: "FIRST_NAME" } });
    await screen.findByRole("menuitem", { name: /First Name/u });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(document.activeElement).toBe(input);
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => {
      expect(onInsert).toHaveBeenCalledExactlyOnceWith("first_name");
      expect(screen.queryByLabelText("Search merge tags")).toBeNull();
    });
  });

  it.each([
    { query: "  FIRST_NAME  ", labels: ["First Name"] },
    { query: "payment method", labels: ["Payment Method"] },
    {
      query: "RECIPIENT",
      labels: [
        "First Name",
        "Last Name",
        "Full Name",
        "Email Address",
        "Salutation",
      ],
    },
  ])(
    "preserves key, label, and category matching for '$query'",
    async ({ query, labels }) => {
      render(<EmailStudioMergeTagMenu onInsert={vi.fn()} />);

      fireEvent.click(screen.getByRole("button", { name: "Merge tag" }));
      const input = await screen.findByLabelText("Search merge tags");
      fireEvent.change(input, { target: { value: query } });

      await waitFor(() => {
        const items = screen.getAllByRole("menuitem");
        expect(items).toHaveLength(labels.length);
        for (const label of labels) {
          expect(
            screen.getByRole("menuitem", { name: new RegExp(label, "u") }),
          ).toBeTruthy();
        }
        expect(screen.queryByText("No matching tags")).toBeNull();
      });
    },
  );

  it("shows an empty state for missing tags without matching across fields", async () => {
    const onInsert = vi.fn();
    render(<EmailStudioMergeTagMenu onInsert={onInsert} />);

    fireEvent.click(screen.getByRole("button", { name: "Merge tag" }));
    const input = await screen.findByLabelText("Search merge tags");

    for (const query of ["not_a_merge_tag", "First Name recipient"]) {
      fireEvent.change(input, { target: { value: query } });
      await screen.findByText("No matching tags");
      expect(screen.queryAllByRole("menuitem")).toHaveLength(0);
      fireEvent.keyDown(input, { key: "Enter" });
      expect(onInsert).not.toHaveBeenCalled();
      expect(document.activeElement).toBe(input);
    }
  });

  it("clears search on Escape and restores all tags when reopened", async () => {
    render(<EmailStudioMergeTagMenu onInsert={vi.fn()} />);
    const trigger = screen.getByRole("button", { name: "Merge tag" });

    fireEvent.click(trigger);
    const input = await screen.findByLabelText("Search merge tags");
    fireEvent.change(input, { target: { value: "first_name" } });
    expect(screen.getAllByRole("menuitem")).toHaveLength(1);
    fireEvent.keyDown(input, { key: "Escape" });

    await waitFor(() => {
      expect(screen.queryByLabelText("Search merge tags")).toBeNull();
      expect(document.activeElement).toBe(trigger);
    });
    fireEvent.click(trigger);
    const reopened = (await screen.findByRole("searchbox", {
      name: "Search merge tags",
    })) as HTMLInputElement;
    expect(reopened.value).toBe("");
    expect(screen.getAllByRole("menuitem").length).toBeGreaterThan(1);
    expect(
      screen.getByRole("menuitem", { name: /Organization Name/u }),
    ).toBeTruthy();
  });

  it("keeps the menu closed while the trigger is disabled", () => {
    const onInsert = vi.fn();
    render(<EmailStudioMergeTagMenu disabled onInsert={onInsert} />);
    const trigger = screen.getByRole("button", {
      name: "Merge tag",
    }) as HTMLButtonElement;

    expect(trigger.disabled).toBe(true);
    fireEvent.click(trigger);
    expect(screen.queryByLabelText("Search merge tags")).toBeNull();
    expect(onInsert).not.toHaveBeenCalled();
  });
});
