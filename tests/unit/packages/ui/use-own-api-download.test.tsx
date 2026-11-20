// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * `useOwnApiDownload` (WP2b, AL-2675; council round 1 on slice B, SB3 and the
 * minor item on the failure toast). A download button keeps keyboard focus
 * while the file loads and says it is busy, and a refusal is told in plain
 * words, never as the route's text or an HTTP status.
 */
const h = vi.hoisted(() => ({
  download: vi.fn(),
  toastError: vi.fn(),
}));
vi.mock("@asym/database/own-api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@asym/database/own-api")>()),
  ownApiDownload: h.download,
}));
vi.mock("sonner", () => ({ toast: { error: h.toastError } }));

import { OwnApiDownloadError } from "../../../../packages/database/own-api";
import { Button } from "../../../../packages/ui/components/shadcn/button";
import { useOwnApiDownload } from "../../../../packages/ui/hooks/use-own-api-download";

function StatementButton() {
  const { download, buttonProps } = useOwnApiDownload();
  return (
    <Button
      {...buttonProps}
      onClick={() => void download("/api/donor/statements/2026")}
    >
      2026 giving statement
    </Button>
  );
}

afterEach(() => {
  cleanup();
  h.download.mockReset();
  h.toastError.mockReset();
});

describe("useOwnApiDownload", () => {
  it("keeps keyboard focus on the button while the file loads, and says it is busy", async () => {
    let finish!: () => void;
    h.download.mockImplementation(
      () => new Promise<void>((resolve) => (finish = resolve)),
    );
    render(<StatementButton />);
    const button = screen.getByRole("button", {
      name: "2026 giving statement",
    });
    button.focus();

    fireEvent.click(button);

    // A native `disabled` would drop focus to the page; the button stays
    // focusable, refuses a second press, and reports the work in progress.
    expect(h.download).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(button);
    expect(button.hasAttribute("disabled")).toBe(false);
    expect(button.getAttribute("aria-disabled")).toBe("true");
    expect(button.getAttribute("aria-busy")).toBe("true");
    fireEvent.click(button);
    expect(h.download).toHaveBeenCalledTimes(1);

    await act(async () => finish());

    expect(document.activeElement).toBe(button);
    expect(button.getAttribute("aria-busy")).toBeNull();
    // Base UI keeps the attribute on a focusable-when-disabled button, as false.
    expect(button.getAttribute("aria-disabled")).not.toBe("true");
    expect(button.hasAttribute("disabled")).toBe(false);
  });

  it.each([
    [401, "Your session has ended. Sign in again, then try once more."],
    [403, "This file isn't available to your account."],
    [404, "This file couldn't be found."],
    [500, "Something went wrong on our side. Try again in a moment."],
  ])(
    "tells a refused download (%i) in plain words, not the route's text",
    async (status, plain) => {
      h.download.mockRejectedValue(
        new OwnApiDownloadError(status, "Unauthorized"),
      );
      render(<StatementButton />);

      fireEvent.click(
        screen.getByRole("button", { name: "2026 giving statement" }),
      );

      await waitFor(() => expect(h.toastError).toHaveBeenCalledTimes(1));
      expect(h.toastError).toHaveBeenCalledWith("The file didn't download.", {
        description: plain,
      });
      expect(JSON.stringify(h.toastError.mock.calls)).not.toMatch(
        /Unauthorized|status/i,
      );
    },
  );

  it("tells a lost connection in plain words", async () => {
    h.download.mockRejectedValue(new TypeError("Failed to fetch"));
    render(<StatementButton />);

    fireEvent.click(
      screen.getByRole("button", { name: "2026 giving statement" }),
    );

    await waitFor(() => expect(h.toastError).toHaveBeenCalledTimes(1));
    expect(h.toastError).toHaveBeenCalledWith("The file didn't download.", {
      description: "Check your connection and try again.",
    });
  });
});
