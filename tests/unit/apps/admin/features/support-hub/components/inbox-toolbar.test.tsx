// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SupportFailureBanner } from "../../../../../../../apps/admin/features/support-hub/components/SupportFailureBanner";
import {
  SupportFailureRecoveryProvider,
  useSupportFailureRecovery,
} from "../../../../../../../apps/admin/features/support-hub/hooks/use-support-failure-recovery";

afterEach(() => {
  cleanup();
});

function ReportHarness({
  retry = () => undefined,
}: {
  retry?: () => void | Promise<void>;
}) {
  const failure = useSupportFailureRecovery();
  return (
    <button
      type="button"
      onClick={() =>
        failure.report({
          kind: "send-reply",
          message: "Network down",
          conversationId: "conv-1",
          retry,
        })
      }
    >
      Trigger failure
    </button>
  );
}

describe("SupportFailureBanner", () => {
  it("renders nothing when there is no failure", () => {
    const { container } = render(
      <SupportFailureRecoveryProvider>
        <SupportFailureBanner />
      </SupportFailureRecoveryProvider>,
    );
    expect(container.children.length).toBe(0);
  });

  it("renders an aria-live banner with Retry + Dismiss when a failure is reported", () => {
    render(
      <SupportFailureRecoveryProvider>
        <ReportHarness />
        <SupportFailureBanner />
      </SupportFailureRecoveryProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Trigger failure/i }));

    const banner = screen.getByRole("status");
    expect(banner.textContent).toContain("Reply failed");
    expect(banner.textContent).toContain("Network down");
    // The failing mutation already raises an error toast; the persistent
    // banner is a recovery affordance, so it must not interrupt speech.
    expect(banner.getAttribute("aria-live")).toBe("polite");
    expect(screen.getByRole("button", { name: /retry/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Dismiss" })).toBeTruthy();
  });

  it("clears the banner when Dismiss is pressed", () => {
    render(
      <SupportFailureRecoveryProvider>
        <ReportHarness />
        <SupportFailureBanner />
      </SupportFailureRecoveryProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Trigger failure/i }));
    expect(screen.queryByRole("status")).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /Dismiss/i }));
    expect(screen.queryByRole("status")).toBeNull();
  });

  describe("hands focus on when it closes", () => {
    function renderWithFocusTarget(retry?: () => void | Promise<void>) {
      const returnFocus = vi.fn(() =>
        screen.getByRole("button", { name: "Inbox view" }).focus(),
      );
      render(
        <SupportFailureRecoveryProvider>
          <ReportHarness retry={retry} />
          <button type="button">Inbox view</button>
          <SupportFailureBanner returnFocus={returnFocus} />
        </SupportFailureRecoveryProvider>,
      );
      fireEvent.click(screen.getByRole("button", { name: /Trigger failure/i }));
      return returnFocus;
    }

    it("moves focus from Dismiss to the inbox before the banner goes", () => {
      renderWithFocusTarget();
      const dismiss = screen.getByRole("button", { name: "Dismiss" });
      dismiss.focus();
      fireEvent.click(dismiss);
      expect(screen.queryByRole("status")).toBeNull();
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Inbox view" }),
      );
    });

    it("moves focus from Retry once the retry succeeds", async () => {
      renderWithFocusTarget(() => Promise.resolve());
      const retry = screen.getByRole("button", { name: /retry/i });
      retry.focus();
      await act(async () => {
        fireEvent.click(retry);
      });
      expect(screen.queryByRole("status")).toBeNull();
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Inbox view" }),
      );
    });

    it("leaves focus where the agent moved it while the retry ran", async () => {
      let finish: () => void = () => undefined;
      const returnFocus = renderWithFocusTarget(
        () =>
          new Promise<void>((resolve) => {
            finish = resolve;
          }),
      );
      const retry = screen.getByRole("button", { name: /retry/i });
      retry.focus();
      fireEvent.click(retry);
      const elsewhere = screen.getByRole("button", {
        name: /Trigger failure/i,
      });
      elsewhere.focus();
      await act(async () => finish());
      expect(screen.queryByRole("status")).toBeNull();
      expect(returnFocus).not.toHaveBeenCalled();
      expect(document.activeElement).toBe(elsewhere);
    });
  });
});
