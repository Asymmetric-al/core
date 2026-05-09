// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import { afterEach, describe, expect, it } from "vitest";

import { SupportFailureBanner } from "../../../../../../../apps/admin/features/support-hub/components/SupportFailureBanner";
import {
  SupportFailureRecoveryProvider,
  useSupportFailureRecovery,
} from "../../../../../../../apps/admin/features/support-hub/hooks/use-support-failure-recovery";

afterEach(() => {
  cleanup();
});

function ReportHarness() {
  const failure = useSupportFailureRecovery();
  return (
    <button
      type="button"
      onClick={() =>
        failure.report({
          kind: "send-reply",
          message: "Network down",
          conversationId: "conv-1",
          retry: () => undefined,
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
    expect(banner.getAttribute("aria-live")).toBe("assertive");
    expect(screen.getByRole("button", { name: /retry/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /dismiss/i })).toBeTruthy();
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
});
