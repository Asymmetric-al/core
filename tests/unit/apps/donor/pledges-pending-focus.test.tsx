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
    data: { recurringGifts: [] },
    isLoading: false,
    error: null,
  }),
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

describe("Pledge billing portal pending focus", () => {
  it.each([
    ["Manage in billing portal", "Open billing portal"],
    ["Open billing portal", "Manage in billing portal"],
  ])("preserves only the initiating %s button", async (name, peerName) => {
    let rejectRequest!: (reason: Error) => void;
    boundary.createSession.mockImplementation(
      () =>
        new Promise((_, reject) => {
          rejectRequest = reject;
        }),
    );
    render(<DonorPledgesPage />);
    const initiator = screen.getByRole("button", { name, exact: true });
    const peer = screen.getByRole("button", { name: peerName, exact: true });
    act(() => initiator.focus());
    fireEvent.click(initiator);
    expect(document.activeElement).toBe(initiator);
    await waitFor(() =>
      expect(initiator.getAttribute("aria-disabled")).toBe("true"),
    );
    expect(initiator.hasAttribute("disabled")).toBe(false);
    expect(peer.hasAttribute("disabled")).toBe(true);
    expect(peer.hasAttribute("aria-disabled")).toBe(false);
    fireEvent.click(peer);
    fireEvent.click(initiator);
    expect(boundary.createSession).toHaveBeenCalledOnce();
    expect(boundary.createSession).toHaveBeenCalledWith();
    await act(async () => rejectRequest(new Error("offline")));
    expect(initiator.hasAttribute("disabled")).toBe(false);
    expect(peer.hasAttribute("disabled")).toBe(false);
    expect(initiator.getAttribute("aria-disabled")).not.toBe("true");
    expect(screen.getByRole("alert").textContent).toContain("Please try again");
    expect(document.activeElement).toBe(initiator);
  });
});
