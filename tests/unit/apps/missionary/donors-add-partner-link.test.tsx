/** @vitest-environment jsdom */
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  search: "",
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/donors",
  useRouter: () => ({ replace: mocks.replace }),
  useSearchParams: () => new URLSearchParams(mocks.search),
}));
vi.mock("@asym/missionary/components/add-partner-dialog", () => ({
  AddPartnerDialog: (props: { open?: boolean; trigger?: React.ReactNode }) => (
    <div>
      {props.trigger}
      {props.open ? <p>Add partner dialog is open</p> : null}
    </div>
  ),
}));
vi.mock("../../../../apps/missionary/app/donors/use-donors-page-view", () => ({
  useDonorsPageViewFields: () => ({
    profile: { id: "missionary-1" },
    actions: { refreshDonors: vi.fn() },
    donors: { filtered: [], hasMore: false },
  }),
}));

import { DonorsPageHeader } from "../../../../apps/missionary/app/donors/donors-page-header";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  mocks.search = "";
});

describe("Partners page add link", () => {
  it("opens the add-partner dialog when a link asks for it, then clears the request", async () => {
    mocks.search = "add=1&view=monthly";
    render(<DonorsPageHeader />);
    expect(await screen.findByText("Add partner dialog is open")).toBeTruthy();
    await waitFor(() =>
      expect(mocks.replace).toHaveBeenCalledWith("/donors?view=monthly", {
        scroll: false,
      }),
    );
  });

  it("keeps the dialog closed on a plain visit", () => {
    render(<DonorsPageHeader />);
    expect(screen.queryByText("Add partner dialog is open")).toBeNull();
    expect(screen.getByRole("button", { name: "Add partner" })).toBeTruthy();
    expect(mocks.replace).not.toHaveBeenCalled();
  });
});
