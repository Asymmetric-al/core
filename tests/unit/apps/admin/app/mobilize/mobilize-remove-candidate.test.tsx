/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import Mobilize from "../../../../../../apps/admin/app/(app)/mobilize/page-client";

vi.mock("@asym/database/hooks", () => ({
  useMobilizeCandidates: () => {
    throw new Error(
      "The disconnected pipeline must not load sample candidates",
    );
  },
}));
afterEach(cleanup);

it("explains the disconnected pipeline and keeps the real Locations destination", () => {
  render(<Mobilize />);
  expect(screen.getByText("Pipeline not connected yet")).toBeTruthy();
  expect(
    screen.getByText("Applicant tracking and serving locations."),
  ).toBeTruthy();
  expect(
    screen.queryByText("Take applicants from application to deployment."),
  ).toBeNull();
  expect(
    screen.getByText(/application, vetting, training and deployment/i),
  ).toBeTruthy();
  expect(
    screen.getByText(/continue managing applicants in your existing process/i),
  ).toBeTruthy();
  expect(
    screen.getByRole("link", { name: "Manage locations" }).getAttribute("href"),
  ).toBe("/mobilize/locations");
  expect(screen.queryByRole("button", { name: /add candidate/i })).toBeNull();
  expect(screen.queryByRole("combobox")).toBeNull();
  expect(screen.queryByText("Sample candidates")).toBeNull();
});
