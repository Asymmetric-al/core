/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ResendDisconnectedView } from "../../../../apps/admin/app/(app)/settings/integrations/resend/resend-sections";
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
