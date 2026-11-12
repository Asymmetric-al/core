// @vitest-environment jsdom

import { Input } from "@asym/ui/components/shadcn/input";
import { SearchableSelect } from "@asym/ui/components/shadcn/searchable-select";
import { Switch } from "@asym/ui/components/shadcn/switch";
import { Textarea } from "@asym/ui/components/shadcn/textarea";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

// eslint-disable-next-line no-restricted-imports -- AL-1894: Integration test exercises the app's actual field composition.
import { SettingsRow } from "../../../../../../../apps/admin/features/support-hub/components/settings/SettingsRow";

afterEach(cleanup);

function describedText(element: HTMLElement): string {
  return (element.getAttribute("aria-describedby") ?? "")
    .split(" ")
    .filter(Boolean)
    .map((id) => document.getElementById(id)?.textContent ?? "")
    .join(" ");
}

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
    expect(describedText(trigger)).toContain("Who owns this signature");
    fireEvent.click(screen.getByText("Owner"));
    expect(document.activeElement).toBe(trigger);
    expect(screen.queryByRole("listbox")).toBeNull();
    fireEvent.click(trigger);
    const search = await screen.findByRole("combobox", {
      name: "Search options",
    });
    expect(search.id).not.toBe(trigger.id);
  });

  it("labels and describes a text input without the caller wiring ids", () => {
    render(
      <SettingsRow label="Name" description="Shown to the whole team">
        <Input />
      </SettingsRow>,
    );
    const input = screen.getByRole("textbox", { name: "Name" });
    const label = screen.getByText("Name");
    expect(label.tagName).toBe("LABEL");
    expect(label.getAttribute("for")).toBe(input.id);
    expect(describedText(input)).toContain("Shown to the whole team");
  });

  it("names a native textarea through htmlFor, without folding the description into its name", () => {
    render(
      <SettingsRow
        label="Body"
        htmlFor="canned-body"
        description="Plain text and merge variables"
      >
        <Textarea id="canned-body" />
      </SettingsRow>,
    );
    expect(screen.getByRole("textbox", { name: "Body" }).id).toBe(
      "canned-body",
    );
  });

  it("names a switch by its row label and links the description", () => {
    render(
      <SettingsRow
        control
        label="Donor panel"
        description="Show the donor's record beside a conversation"
      >
        <Switch />
      </SettingsRow>,
    );
    const toggle = screen.getByRole("switch", { name: "Donor panel" });
    expect(describedText(toggle)).toContain("Show the donor's record");
  });

  it("marks the control invalid and announces the row error with it", () => {
    render(
      <SettingsRow label="Name" error="Give the schedule a name.">
        <Input />
      </SettingsRow>,
    );
    const input = screen.getByRole("textbox", { name: "Name" });
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(describedText(input)).toContain("Give the schedule a name.");
    expect(screen.getByRole("alert").textContent).toBe(
      "Give the schedule a name.",
    );
  });

  it("keeps the two-column grid layout for horizontal rows", () => {
    const { container } = render(
      <SettingsRow label="Name">
        <Input />
      </SettingsRow>,
    );
    expect(container.innerHTML).toContain(
      "sm:grid-cols-[minmax(0,240px)_minmax(0,1fr)]",
    );
  });
});
