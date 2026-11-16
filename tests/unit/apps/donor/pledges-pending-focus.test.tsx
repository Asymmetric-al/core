// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { useState, type ComponentType } from "react";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

let DonorPledgesPage: ComponentType;
beforeAll(async () => {
  const module =
    await import("../../../../apps/donor/app/(dashboard)/donor-dashboard/pledges/page-client");
  DonorPledgesPage = module.default;
}, 20000);

const boundary = vi.hoisted(() => ({ createSession: vi.fn() }));

vi.mock("../../../../packages/database/hooks/index", () => ({
  useDonorPortalSnapshot: () => ({
    data: {
      recurringGifts: [
        {
          id: "gift-1",
          amount: 50,
          frequency: "monthly",
          status: "active",
          nextChargeAt: "2026-12-05",
          endsAt: null,
          paymentMethodLabel: "Saved payment method",
          designation: { name: "Jordan Hale", avatarUrl: null },
          missionary: { id: "m", name: "Jordan Hale", avatarUrl: null },
          fund: null,
        },
      ],
    },
    isLoading: false,
    error: null,
  }),
  useDonorWallet: () => ({ data: { status: "not_linked", methods: [] } }),
  useCreateDonorBillingPortalSession: () => {
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState<unknown>(null);
    return {
      isPending,
      error,
      mutateAsync: async () => {
        setIsPending(true);
        setError(null);
        try {
          return await boundary.createSession();
        } catch (cause) {
          setError(cause);
          throw cause;
        } finally {
          setIsPending(false);
        }
      },
    };
  },
}));

afterEach(cleanup);
beforeEach(() => {
  boundary.createSession.mockReset();
});

describe("Recurring gifts payment settings pending focus", () => {
  it("keeps focus on the button while payment settings open, then reports a failure", async () => {
    let rejectRequest!: (reason: Error) => void;
    boundary.createSession.mockImplementation(
      () =>
        new Promise((_, reject) => {
          rejectRequest = reject;
        }),
    );
    render(<DonorPledgesPage />);
    const button = screen.getByRole("button", {
      name: "Change or stop a gift",
      exact: true,
    });
    act(() => button.focus());
    fireEvent.click(button);
    expect(document.activeElement).toBe(button);
    await waitFor(() =>
      expect(button.getAttribute("aria-disabled")).toBe("true"),
    );
    expect(button.hasAttribute("disabled")).toBe(false);
    fireEvent.click(button);
    expect(boundary.createSession).toHaveBeenCalledOnce();
    await act(async () => rejectRequest(new Error("offline")));
    expect(button.getAttribute("aria-disabled")).not.toBe("true");
    expect(screen.getByRole("alert").textContent).toContain("Please try again");
    expect(document.activeElement).toBe(button);
  });
});
