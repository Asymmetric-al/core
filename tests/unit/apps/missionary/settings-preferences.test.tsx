/** @vitest-environment jsdom */

import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import SettingsPage from "../../../../apps/missionary/app/settings/page-client";

vi.mock("@asym/env", () => ({
  clientEnv: { NEXT_PUBLIC_VIEW_TRANSITIONS_ENABLED: false },
}));

afterEach(cleanup);

it("changes only the requested channel and preserves selected values after local save", () => {
  render(<SettingsPage />);

  const save = screen.getByRole("button", { name: "Save Preferences" });
  const giftSms = screen.getByLabelText("SMS: New Gift Received");
  const giftEmail = screen.getByLabelText("Email: New Gift Received");
  const giftInApp = screen.getByLabelText("In-App: New Gift Received");
  const failedSms = screen.getByLabelText("SMS: Recurring Gift Failed");

  expect(save.hasAttribute("disabled")).toBe(true);
  expect(giftSms.getAttribute("aria-checked")).toBe("false");
  expect(giftEmail.getAttribute("aria-checked")).toBe("true");
  expect(giftInApp.getAttribute("aria-checked")).toBe("true");
  expect(failedSms.getAttribute("aria-checked")).toBe("true");

  fireEvent.click(giftSms);
  expect(giftSms.getAttribute("aria-checked")).toBe("true");
  expect(giftEmail.getAttribute("aria-checked")).toBe("true");
  expect(giftInApp.getAttribute("aria-checked")).toBe("true");
  expect(failedSms.getAttribute("aria-checked")).toBe("true");
  expect(save.hasAttribute("disabled")).toBe(false);

  fireEvent.click(save);
  expect(save.hasAttribute("disabled")).toBe(true);
  expect(giftSms.getAttribute("aria-checked")).toBe("true");

  fireEvent.click(giftEmail);
  expect(giftEmail.getAttribute("aria-checked")).toBe("false");
  expect(giftSms.getAttribute("aria-checked")).toBe("true");
  expect(save.hasAttribute("disabled")).toBe(false);
});

it("makes every notification and channel discoverable in the preferences matrix", () => {
  render(<SettingsPage />);

  const table = screen.getByRole("table", {
    name: "Notification channel preferences",
  });
  const matrix = within(table);
  expect(
    matrix.getAllByRole("columnheader").map((header) => header.textContent),
  ).toEqual(["Notification", "In-App", "Email", "SMS"]);
  expect(matrix.getAllByRole("rowheader")).toHaveLength(6);
  expect(matrix.getAllByRole("switch")).toHaveLength(18);

  const giftRow = matrix.getByRole("rowheader", {
    name: "New Gift Received When someone gives to your fund",
  }).parentElement!;
  const gift = within(giftRow);
  expect(gift.getByText("When someone gives to your fund")).toBeTruthy();
  expect(
    gift.getByRole("switch", { name: "In-App: New Gift Received" }),
  ).toBeTruthy();
  expect(
    gift.getByRole("switch", { name: "Email: New Gift Received" }),
  ).toBeTruthy();
  expect(
    gift.getByRole("switch", { name: "SMS: New Gift Received" }),
  ).toBeTruthy();
  expect(
    gift
      .getAllByRole("switch")
      .map((control) => control.getAttribute("aria-label")),
  ).toEqual([
    "In-App: New Gift Received",
    "Email: New Gift Received",
    "SMS: New Gift Received",
  ]);
});
