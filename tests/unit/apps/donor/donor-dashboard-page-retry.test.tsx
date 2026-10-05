// @vitest-environment jsdom

import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  refetch: vi.fn().mockResolvedValue(undefined),
}));

vi.mock(
  "../../../../apps/donor/app/(dashboard)/donor-dashboard/use-donor-dashboard-bootstrap",
  () => ({
    useDonorDashboardBootstrap: () => ({
      isError: true,
      error: new Error("Bootstrap unavailable"),
      isPending: false,
      refetch: mocks.refetch,
    }),
  }),
);
vi.mock(
  "../../../../apps/donor/features/donor/components/donor-dashboard-main-body",
  () => ({
    DonorDashboardMainBody: () => {
      throw new Error(
        "The dashboard body must not render on the bootstrap error path.",
      );
    },
  }),
);
vi.mock(
  "../../../../apps/donor/features/donor/components/dashboard-ui",
  () => ({ DashboardSkeleton: () => null }),
);

// eslint-disable-next-line no-restricted-imports -- AL-1931 Component integration tests exercise the actual donor page, not an application dependency.
import DonorDashboardPage from "../../../../apps/donor/app/(dashboard)/donor-dashboard/page-client";

afterEach(() => cleanup());

it("retains the visible bootstrap error and retries through the existing refetch callback", () => {
  const view = render(<DonorDashboardPage />);

  expect(view.getByText("Load failed")).toBeTruthy();
  expect(view.getByText("Bootstrap unavailable")).toBeTruthy();
  const button = view.getByRole("button", { name: "Retry" });
  expect(button.getAttribute("type")).toBe("button");
  fireEvent.click(button);

  expect(mocks.refetch).toHaveBeenCalledOnce();
  expect(mocks.refetch).toHaveBeenCalledWith();
});
