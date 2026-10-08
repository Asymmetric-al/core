/** @vitest-environment jsdom */

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  ResendConnectedView,
  ResendDisconnectedView,
} from "../../../../apps/admin/app/(app)/settings/integrations/resend/resend-sections";
import { useResendConnectForm } from "../../../../apps/admin/app/(app)/settings/integrations/resend/use-resend-forms";

function ConnectionForm() {
  const form = useResendConnectForm({ onSubmit: vi.fn() });
  const [showApiKey, setShowApiKey] = useState(false);
  return (
    <ResendDisconnectedView
      form={form}
      connectionWarnings={[]}
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
    const credential = view.getByLabelText(/Resend API Key/);
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
  const connection = {
    apiKeyHint: "1234",
    hasValidationMetadata: false,
    sendReady: false,
    senderIdentities: [],
    domainAuthentication: [],
    deliverabilityScore: 0,
    warnings: [],
  };

  it("preserves connected identity and disconnect without claiming send readiness", () => {
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

    expect(screen.getByText("Connection Active")).toBeTruthy();
    expect(screen.getByText("API Key: ********1234")).toBeTruthy();
    expect(screen.getByRole("alert").textContent).toContain(
      "Reconnect Required",
    );
    const send = screen.getByRole("button", {
      name: "Resolve Delivery Setup First",
    });
    expect(send).toHaveProperty("disabled", true);
    fireEvent.click(send);
    expect(onOpenTestDialog).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Disconnect" }));
    expect(onDisconnect).toHaveBeenCalledOnce();
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

    const send = screen.getByRole("button", { name: "Send Test Email" });
    expect(send).toHaveProperty("disabled", false);
    fireEvent.click(send);
    expect(onOpenTestDialog).toHaveBeenCalledOnce();
  });
});
