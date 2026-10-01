// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- AL-1894: App component regression test at its public UI boundary.
import { SupportFailureBanner } from "../../../../../../../apps/admin/features/support-hub/components/SupportFailureBanner";
const recovery = vi.hoisted(() => ({ retry: vi.fn(), clear: vi.fn() }));
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-failure-recovery",
  () => ({
    useSupportFailureRecovery: () => ({
      failure: {
        kind: "send-reply",
        message: "Try again",
        retry: recovery.retry,
      },
      clear: recovery.clear,
    }),
  }),
);
afterEach(cleanup);
it("keeps the initiating retry focused and blocks repeat activation until recovery completes", async () => {
  let finish: () => void = () => undefined;
  recovery.retry.mockReturnValue(
    new Promise<void>((resolve) => {
      finish = resolve;
    }),
  );
  render(<SupportFailureBanner />);
  const button = screen.getByRole("button", { name: "Retry" });
  button.focus();
  fireEvent.click(button);
  expect(button.getAttribute("aria-disabled")).toBe("true");
  expect(button.hasAttribute("disabled")).toBe(false);
  expect(document.activeElement).toBe(button);
  fireEvent.click(button);
  expect(recovery.retry).toHaveBeenCalledOnce();
  await act(async () => finish());
  expect(recovery.clear).toHaveBeenCalledOnce();
  expect(button.hasAttribute("disabled")).toBe(false);
});
