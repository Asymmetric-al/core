/** @vitest-environment jsdom */

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import React, { useState } from "react";
import { afterEach, expect, it, vi } from "vitest";

const { initialProfile } =
  await import("../../../../../../apps/missionary/app/profile/profile-model");
const { ProfileFormColumn } =
  await import("../../../../../../apps/missionary/app/profile/profile-form-column");
const { PreviewToggle } =
  await import("../../../../../../apps/missionary/app/profile/profile-primitives");

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function Preview({ onChange }: { onChange: (mode: string) => void }) {
  const [mode, setMode] = useState<"mobile" | "desktop">("mobile");
  return (
    <PreviewToggle
      value={mode}
      onChange={(next) => {
        onChange(next);
        setMode(next);
      }}
    />
  );
}

function previewButtons() {
  const group = screen.getByRole("group", { name: "Live preview" });
  return {
    group,
    mobile: within(group).getByRole("button", { name: "Mobile preview" }),
    desktop: within(group).getByRole("button", { name: "Desktop preview" }),
  };
}

it("offers the preview size as one named group with a single tab stop", () => {
  render(<Preview onChange={vi.fn()} />);
  const { group, mobile, desktop } = previewButtons();
  expect(group.querySelectorAll('[tabindex="0"]')).toHaveLength(1);
  expect(mobile.tabIndex).toBe(0);
  expect(mobile.getAttribute("aria-pressed")).toBe("true");
  expect(desktop.getAttribute("aria-pressed")).toBe("false");
});

it("follows the preview mode and never leaves it unset", () => {
  const onChange = vi.fn();
  render(<Preview onChange={onChange} />);
  const { mobile, desktop } = previewButtons();
  fireEvent.click(desktop);
  expect(onChange).toHaveBeenLastCalledWith("desktop");
  expect(desktop.getAttribute("aria-pressed")).toBe("true");
  expect(mobile.getAttribute("aria-pressed")).toBe("false");

  fireEvent.click(desktop);
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(desktop.getAttribute("aria-pressed")).toBe("true");
});

it("moves between the preview sizes with the arrow keys", async () => {
  const onChange = vi.fn();
  render(<Preview onChange={onChange} />);
  const { mobile, desktop } = previewButtons();
  mobile.focus();
  fireEvent.keyDown(mobile, { key: "ArrowRight" });
  await waitFor(() => expect(document.activeElement).toBe(desktop));
  expect(onChange).not.toHaveBeenCalled();
});

it("keeps the sliding pill and the quiet icon buttons", () => {
  render(<Preview onChange={vi.fn()} />);
  const { group, mobile, desktop } = previewButtons();
  // The pill slides behind the group inside the same muted frame.
  const frame = group.parentElement!;
  expect(frame.className).toMatch(/\bbg-muted\b/);
  expect(frame.className).toMatch(/\brounded-lg\b/);
  expect(frame.querySelector(".bg-card.rounded-md.shadow-sm")).not.toBeNull();
  expect(mobile.className).toMatch(/\btext-foreground\b/);
  expect(desktop.className).toMatch(/\btext-muted-foreground\b/);
  for (const button of [mobile, desktop]) {
    expect(button.className).not.toMatch(/data-pressed:|hover:bg-muted/);
  }
});

it("names the cover photo control by its label and opens the file picker", () => {
  const pick = vi
    .spyOn(HTMLInputElement.prototype, "click")
    .mockImplementation(() => undefined);
  render(
    <ProfileFormColumn
      profile={{ ...initialProfile, coverUrl: "" }}
      validationErrors={{}}
      bioWordCount={0}
      initials="JH"
      updateProfile={vi.fn()}
      onSave={vi.fn()}
    />,
  );
  const cover = screen.getByRole("button", {
    name: "Cover photo Click to upload cover photo",
  });
  expect(cover.tabIndex).toBe(0);
  const describedBy = cover.getAttribute("aria-describedby");
  expect(describedBy).toBeTruthy();
  expect(document.getElementById(describedBy!)?.textContent).toMatch(
    /Shown across the top of your giving page/,
  );

  fireEvent.click(cover);
  expect(pick).toHaveBeenCalledTimes(1);
});
