// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { EmailMessage } from "../../../../../../../apps/admin/features/support-hub/components/detail/timeline/EmailMessage";
import type { SupportMessage } from "../../../../../../../apps/admin/features/support-hub/types";
vi.mock("@asym/ui/components/shadcn/rich-text-editor", () => ({
  RichTextViewer: () => null,
}));
vi.mock("../../../../../../../apps/admin/features/support-hub/lib/now", () => ({
  useSupportNow: () => "2026-11-11T12:00:00.000Z",
}));
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
function message(overrides: Partial<SupportMessage> = {}): SupportMessage {
  return {
    id: "message-1",
    tenantId: "tenant-1",
    conversationId: "conversation-1",
    type: "email",
    direction: "inbound",
    isPrivate: false,
    deliveryState: "delivered",
    author: {
      id: "contact-1",
      role: "donor",
      name: "A donor",
      email: "donor@example.org",
      avatarUrl: null,
    },
    body: { json: null, html: "", text: "" },
    attachments: [],
    emailHeaders: null,
    outboundSendLogId: null,
    inboundEmailId: null,
    postedAt: "2026-11-11T09:00:00.000Z",
    createdAt: "2026-11-11T09:00:00.000Z",
    updatedAt: "2026-11-11T09:00:00.000Z",
    ...overrides,
  };
}
it("shows sizes but never opens unverified attachment destinations", () => {
  render(
    <EmailMessage
      message={message({
        attachments: [
          {
            id: "attachment-1",
            filename: "Receipt.pdf",
            contentType: "application/pdf",
            sizeBytes: 1536,
            url: "https://files.example.org/receipt.pdf",
          },
          {
            id: "attachment-2",
            filename: "Unsafe.html",
            contentType: "text/html",
            sizeBytes: 0,
            url: "javascript:alert(1)",
          },
        ],
      })}
    />,
  );
  expect(screen.getByText("Receipt.pdf")).toBeTruthy();
  expect(screen.getByText("1.5 KB · Not available to download")).toBeTruthy();
  expect(screen.getByText("0 B · Not available to download")).toBeTruthy();
  expect(screen.queryByRole("link")).toBeNull();
});
it("preserves tenant-server recovery for failed inbound attachments", async () => {
  const retry = vi.fn().mockResolvedValue({ ok: true });
  vi.stubGlobal("fetch", retry);
  render(
    <EmailMessage
      message={message({
        inboundEmailId: "inbound-1",
        inboundAttachmentStatus: "failed",
      })}
    />,
  );
  expect(screen.getByText("Attachments unavailable")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Retry" }));
  await waitFor(() =>
    expect(retry).toHaveBeenCalledWith(
      "/api/admin/support-hub/inbound/retry",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          inboundEmailRowId: "inbound-1",
          kind: "attachments",
        }),
      }),
    ),
  );
  expect(await screen.findByText("Attachments retrying")).toBeTruthy();
});
it("announces the retry and moves focus to the message when Retry goes away", async () => {
  let finish: ((response: { ok: boolean }) => void) | undefined;
  vi.stubGlobal(
    "fetch",
    vi.fn(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    ),
  );
  render(
    <EmailMessage
      message={message({
        inboundEmailId: "inbound-1",
        inboundAttachmentStatus: "failed",
      })}
    />,
  );
  const status = screen.getByRole("status");
  expect(status.textContent).toBe("Attachments unavailable");
  // The badge itself is the live region, so no wrapper line box resizes the row.
  expect(status.getAttribute("data-slot")).toBe("badge");
  const retry = screen.getByRole("button", { name: "Retry" });
  retry.focus();
  fireEvent.click(retry);
  expect(document.activeElement).toBe(retry);
  await act(async () => finish?.({ ok: true }));
  expect(screen.queryByRole("button", { name: /Retry/ })).toBeNull();
  expect(screen.getByRole("status")).toBe(status);
  expect(status.textContent).toBe("Attachments retrying");
  expect(document.activeElement).toBe(
    screen.getByRole("article", { name: "Inbound email" }),
  );
});
it("keeps focus on Retry when the retry fails", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
  render(
    <EmailMessage
      message={message({
        inboundEmailId: "inbound-1",
        inboundAttachmentStatus: "failed",
      })}
    />,
  );
  const retry = screen.getByRole("button", { name: "Retry" });
  retry.focus();
  fireEvent.click(retry);
  expect(
    await screen.findByRole("button", { name: "Retry failed — try again" }),
  ).toBe(retry);
  expect(document.activeElement).toBe(retry);
});
