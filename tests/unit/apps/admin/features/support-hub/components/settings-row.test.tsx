// @vitest-environment jsdom

import { SearchableSelect } from "@asym/ui/components/shadcn/searchable-select";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

// eslint-disable-next-line no-restricted-imports -- AL-1894: Integration test exercises the app's actual field composition.
import { SettingsRow } from "../../../../../../../apps/admin/features/support-hub/components/settings/SettingsRow";

afterEach(cleanup);

describe("SettingsRow control relationships", () => {
  it("names and describes a searchable selector and focuses it when the visible label is clicked", async () => {
    render(
      <SettingsRow control label="Owner" description="Who owns this signature">
        <SearchableSelect
          items={[{ value: "agent-1", label: "Alice" }]}
          value="agent-1"
        />
      </SettingsRow>,
    );
    const trigger = screen.getByRole("combobox", { name: "Owner" });
    expect(
      trigger
        .getAttribute("aria-describedby")
        ?.split(" ")
        .map((id) => document.getElementById(id)?.textContent)
        .join(" "),
    ).toContain("Who owns this signature");
    fireEvent.click(screen.getByText("Owner"));
    expect(document.activeElement).toBe(trigger);
    expect(screen.queryByRole("listbox")).toBeNull();
    fireEvent.click(trigger);
    const search = await screen.findByRole("combobox", {
      name: "Search options",
    });
    expect(search.id).not.toBe(trigger.id);
  });
});
