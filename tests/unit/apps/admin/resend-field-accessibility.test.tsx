/** @vitest-environment jsdom */

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  ResendConnectedView,
  ResendDisconnectedView,
} from "../../../../apps/admin/app/(app)/settings/integrations/resend/resend-sections";
import { useResendConnectForm } from "../../../../apps/admin/app/(app)/settings/integrations/resend/use-resend-forms";
import type { DeliverabilityWarning } from "@asym/email/types";

function ConnectionForm({
  warnings = [],
}: { warnings?: DeliverabilityWarning[] } = {}) {
  const form = useResendConnectForm({ onSubmit: vi.fn() });
  const [showApiKey, setShowApiKey] = useState(false);
  return (
    <ResendDisconnectedView
      form={form}
      connectionWarnings={warnings}
      connectionStatus="disconnected"
      showApiKey={showApiKey}
      onToggleApiKeyVisibility={() => setShowApiKey((value) => !value)}
    />
  );
}
afterEach(cleanup);

describe("Resend credential field", () => {
  it("names visibility actions and associates validation feedback with the credential", async () => {
    const view = render(<ConnectionForm />);
    const credential = view.getByLabelText(/Resend API key/);
    fireEvent.click(view.getByRole("button", { name: "Show API key" }));
    expect(credential.getAttribute("type")).toBe("text");
    fireEvent.click(view.getByRole("button", { name: "Hide API key" }));
    expect(credential.getAttribute("type")).toBe("password");
    fireEvent.change(credential, { target: { value: "invalid-key" } });
    fireEvent.blur(credential);
    await waitFor(() =>
      expect(credential.getAttribute("aria-invalid")).toBe("true"),
    );
    const errorId = credential.getAttribute("aria-describedby");
    expect(errorId).toBeTruthy();
    expect(document.getElementById(errorId!)?.textContent).toMatch(/API key/i);
  });
});

// AL-1967 replaces the connection card's raw-color gradient with native Maia.
// Its identity, readiness rules and existing callbacks remain public contracts.
describe("Resend connected surface", () => {
  it.each([
    ["DEFAULT_FROM_EMAIL_DOMAIN_NOT_VERIFIED", "Sender domain not verified"],
    ["DOMAIN_NOT_VERIFIED", "Domain not verified"],
    ["NO_DOMAINS", "No sending domain"],
    ["RESTRICTED_API_KEY", "Limited API key permissions"],
    ["API_KEY_METADATA_UNAVAILABLE", "API key details unavailable"],
    ["DOMAIN_DETAILS_INCOMPLETE", "Domain details incomplete"],
    ["DOMAIN_LIST_INCOMPLETE", "Domain list incomplete"],
    ["FUTURE_WARNING", "Delivery setup notice"],
  ])("uses a readable, capability-neutral title for %s", (code, title) => {
    render(
      <ConnectionForm
        warnings={[
          {
            code,
            message: "Keep this validator explanation.",
            severity: "warning",
          },
        ]}
      />,
    );
    expect(screen.getByText(title)).toBeTruthy();
    expect(screen.getByText("Keep this validator explanation.")).toBeTruthy();
  });
  const connection = {
    apiKeyHint: "1234",
    hasValidationMetadata: false,
    sendReady: false,
    senderIdentities: [],
    domainAuthentication: [],
    deliverabilityScore: 0,
    warnings: [],
  };

  it("preserves connected identity and disconnect without claiming send readiness", async () => {
    const onDisconnect = vi.fn();
    const onOpenTestDialog = vi.fn();
    render(
      <ResendConnectedView
        connection={connection}
        canSendTestEmail={false}
        onDisconnect={onDisconnect}
        onOpenTestDialog={onOpenTestDialog}
      />,
    );

    expect(screen.getByText("Connection active")).toBeTruthy();
    expect(screen.getByText("API key: ********1234")).toBeTruthy();
    expect(screen.getByRole("alert").textContent).toContain(
      "Reconnect required",
    );
    const send = screen.getByRole("button", {
      name: "Send test email",
    });
    expect(send).toHaveProperty("disabled", true);
    expect(
      document.getElementById(send.getAttribute("aria-describedby")!)
        ?.textContent,
    ).toMatch(/Reconnect Resend/);
    fireEvent.click(send);
    expect(onOpenTestDialog).not.toHaveBeenCalled();
    // Disconnecting asks first; only the confirmation disconnects.
    fireEvent.click(screen.getByRole("button", { name: "Disconnect" }));
    expect(onDisconnect).not.toHaveBeenCalled();
    const confirm = await screen.findByRole("alertdialog", {
      name: "Disconnect Resend?",
    });
    fireEvent.click(
      within(confirm).getByRole("button", { name: "Disconnect" }),
    );
    expect(onDisconnect).toHaveBeenCalledOnce();
  });

  it("uses real external anchors and announces their new tabs", () => {
    render(
      <ResendConnectedView
        connection={{
          ...connection,
          warnings: [
            {
              code: "NO_DOMAINS",
              message: "Add a domain.",
              severity: "warning",
              helpUrl: "https://resend.com/docs/dashboard/domains/introduction",
            },
          ],
        }}
        canSendTestEmail={false}
        onDisconnect={vi.fn()}
        onOpenTestDialog={vi.fn()}
      />,
    );
    const dashboard = screen.getByRole("link", {
      name: "Open Resend dashboard (opens in a new tab)",
    });
    const help = screen.getByRole("link", {
      name: "Learn more (opens in a new tab)",
    });
    expect(dashboard.getAttribute("href")).toBe("https://resend.com/domains");
    for (const link of [dashboard, help]) {
      expect(link.getAttribute("target")).toBe("_blank");
      expect(link.getAttribute("rel")).toContain("noopener");
    }
    cleanup();
    render(<ConnectionForm />);
    expect(
      screen
        .getByRole("link", {
          name: "Create Resend account (opens in a new tab)",
        })
        .getAttribute("href"),
    ).toBe("https://resend.com/signup");
  });

  it.each([
    [
      {
        hasValidationMetadata: true,
        warnings: [
          {
            code: "DEFAULT_FROM_EMAIL_DOMAIN_NOT_VERIFIED",
            severity: "error" as const,
            message: "The configured sender does not match a verified domain.",
          },
        ],
      },
      "The configured sender does not match a verified domain.",
    ],
    [
      { hasValidationMetadata: true, warnings: [] },
      "Verify a sending domain in Resend before sending a test.",
    ],
  ])(
    "describes the actual disabled send-readiness reason",
    (details, reason) => {
      render(
        <ResendConnectedView
          connection={{ ...connection, ...details }}
          canSendTestEmail={false}
          onDisconnect={vi.fn()}
          onOpenTestDialog={vi.fn()}
        />,
      );
      const send = screen.getByRole("button", { name: "Send test email" });
      expect(
        document.getElementById(send.getAttribute("aria-describedby")!)
          ?.textContent,
      ).toBe(reason);
    },
  );

  it("keeps disconnect pending until success and retains failures for retry", async () => {
    const deferred = Promise.withResolvers<boolean>();
    const onDisconnect = vi
      .fn()
      .mockReturnValueOnce(deferred.promise)
      .mockResolvedValueOnce(true);
    render(
      <ResendConnectedView
        connection={connection}
        canSendTestEmail={false}
        onDisconnect={onDisconnect}
        onOpenTestDialog={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Disconnect" }));
    const dialog = await screen.findByRole("alertdialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Disconnect" }));
    expect(
      within(dialog).getByRole("button", { name: "Disconnecting…" }),
    ).toHaveProperty("disabled", true);
    expect(
      within(dialog).getByRole("button", { name: "Cancel" }),
    ).toHaveProperty("disabled", true);
    deferred.resolve(false);
    await waitFor(() =>
      expect(within(dialog).getByRole("alert").textContent).toMatch(
        /Unable to disconnect/,
      ),
    );
    expect(screen.getByRole("alertdialog")).toBe(dialog);
    fireEvent.click(within(dialog).getByRole("button", { name: "Disconnect" }));
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
    expect(onDisconnect).toHaveBeenCalledTimes(2);
  });

  it("announces a rejected disconnect without closing the confirmation", async () => {
    render(
      <ResendConnectedView
        connection={connection}
        canSendTestEmail={false}
        onDisconnect={vi
          .fn()
          .mockRejectedValue(new Error("Connection unavailable"))}
        onOpenTestDialog={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Disconnect" }));
    const dialog = await screen.findByRole("alertdialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Disconnect" }));
    await waitFor(() =>
      expect(within(dialog).getByRole("alert").textContent).toContain(
        "Connection unavailable",
      ),
    );
  });

  it("opens the existing test-send dialog when the connected metadata permits it", () => {
    const onOpenTestDialog = vi.fn();
    render(
      <ResendConnectedView
        connection={{
          ...connection,
          hasValidationMetadata: true,
          sendReady: true,
        }}
        canSendTestEmail
        onDisconnect={vi.fn()}
        onOpenTestDialog={onOpenTestDialog}
      />,
    );

    const send = screen.getByRole("button", { name: "Send test email" });
    expect(send).toHaveProperty("disabled", false);
    fireEvent.click(send);
    expect(onOpenTestDialog).toHaveBeenCalledOnce();
  });

  it("states a recommendation once: the title, then only what to do", () => {
    render(
      <ResendConnectedView
        connection={{
          ...connection,
          warnings: [
            {
              code: "dmarc_policy_none",
              severity: "warning",
              message:
                "Your DMARC policy is set to none. Consider quarantine once mail is aligned.",
            },
          ],
        }}
        canSendTestEmail={false}
        onDisconnect={vi.fn()}
        onOpenTestDialog={vi.fn()}
      />,
    );
    expect(screen.getByText("DMARC policy is set to none")).toBeTruthy();
    expect(
      screen.getByText("Consider quarantine once mail is aligned."),
    ).toBeTruthy();
    expect(screen.queryByText(/Your DMARC policy is set to none/)).toBeNull();
  });
});

describe("Resend delivery summary layout", () => {
  const connection = {
    apiKeyHint: "1234",
    hasValidationMetadata: true,
    sendReady: true,
    senderIdentities: [],
    domainAuthentication: [],
    deliverabilityScore: 92,
    warnings: [],
  };

  it("keeps the summary tiles close to the header and even on phones", () => {
    render(
      <ResendConnectedView
        connection={connection}
        canSendTestEmail
        onDisconnect={vi.fn()}
        onOpenTestDialog={vi.fn()}
      />,
    );
    const summary = screen.getByRole("region", {
      name: "Email delivery summary",
    });
    const classes = summary.className.split(" ");
    // Three tiles across a phone card left about 70px per label, so
    // "Deliverability" touched its tile edge; phones stack compact tiles.
    expect(classes).toContain("grid-cols-1");
    expect(classes).toContain("sm:grid-cols-3");
    expect(classes).not.toContain("grid-cols-3");

    expect(classes).not.toContain("[&>*:first-child]:col-span-2");
    // The card's own gap separates header and tiles; no extra header padding.
    const header = summary
      .closest('[data-slot="card"]')!
      .querySelector('[data-slot="card-header"]')!;
    expect(header.className.split(" ")).not.toContain("pb-4");
  });
});
