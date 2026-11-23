import { StrictMode } from "react";
/** @vitest-environment jsdom */
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { InvitationDoorway } from "../../../packages/ui/components/auth/InvitationDoorway";

const SELECTOR = "abcdefghijklmnopqrstuvwxyz012345";
const VERIFIER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-abcde";
const TENANT = "00000000-0000-4000-8000-0000000000a1";

describe("InvitationDoorway", () => {
  const fetchSpy = vi.fn();

  beforeEach(() => {
    fetchSpy.mockReset();
    vi.stubGlobal("fetch", fetchSpy);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    window.history.replaceState(null, "", "/");
  });

  it("strips the verifier fragment on mount without auto-submitting, and posts only on deliberate click", async () => {
    window.history.replaceState(null, "", `/invite/${SELECTOR}#${VERIFIER}`);
    const navigateSpy = vi.fn();
    fetchSpy.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          tenant_id: TENANT,
          redirectPath: `/${TENANT}`,
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );

    render(
      <InvitationDoorway
        selector={SELECTOR}
        surfaceName="Mission Control"
        onNavigate={navigateSpy}
      />,
    );

    await waitFor(() => {
      expect(window.location.hash).toBe("");
    });
    expect(window.location.pathname).toBe(`/invite/${SELECTOR}`);
    expect(fetchSpy).not.toHaveBeenCalled();

    const button = screen.getByRole("button", { name: /accept invitation/i });
    expect((button as HTMLButtonElement).disabled).toBe(false);

    fireEvent.click(button);

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });
    const [calledUrl, calledInit] = fetchSpy.mock.calls[0] as [
      string,
      RequestInit,
    ];
    expect(calledUrl).toBe("/api/invitations/accept");
    expect(calledInit.method).toBe("POST");
    expect(calledInit.credentials).toBe("same-origin");
    expect(new Headers(calledInit.headers).get("content-type")).toBe(
      "application/json",
    );
    expect(calledInit.body).toBe(
      JSON.stringify({ selector: SELECTOR, verifier: VERIFIER }),
    );
    await waitFor(() => {
      expect(navigateSpy).toHaveBeenCalledWith(`/${TENANT}`);
    });
  });

  it("disables acceptance when the verifier fragment is absent", async () => {
    window.history.replaceState(null, "", `/invite/${SELECTOR}`);
    render(
      <InvitationDoorway selector={SELECTOR} surfaceName="Mission Control" />,
    );

    await waitFor(() => {
      expect(screen.getByText(/invitation link is incomplete/i)).toBeTruthy();
    });
    const button = screen.getByRole("button", { name: /accept invitation/i });
    expect((button as HTMLButtonElement).disabled).toBe(true);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("distinguishes unauthenticated (401), inactive organization (409), and invalid invitation (403)", async () => {
    window.history.replaceState(null, "", `/invite/${SELECTOR}#${VERIFIER}`);
    fetchSpy
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            code: "UNAUTHENTICATED",
            error: "Sign in to accept this invitation.",
          }),
          { status: 401, headers: { "content-type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            code: "TENANT_INACTIVE",
            error:
              "This organization is not currently active and cannot accept invitations",
          }),
          { status: 409, headers: { "content-type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            code: "INVITATION_INVALID",
            error: "Invitation is invalid or no longer available",
          }),
          { status: 403, headers: { "content-type": "application/json" } },
        ),
      );

    render(
      <InvitationDoorway selector={SELECTOR} surfaceName="Mission Control" />,
    );

    const button = screen.getByRole("button", { name: /accept invitation/i });
    await waitFor(() => {
      expect((button as HTMLButtonElement).disabled).toBe(false);
    });

    fireEvent.click(button);
    await waitFor(() => {
      expect(
        screen.getByRole("link", { name: /sign in/i }).getAttribute("href"),
      ).toBe(`/login?next=${encodeURIComponent(`/invite/${SELECTOR}`)}`);
    });

    fireEvent.click(button);
    await waitFor(() => {
      expect(screen.getByText(/not currently active/i)).toBeTruthy();
    });

    fireEvent.click(button);
    await waitFor(() => {
      expect(
        screen.getByText(/invitation is invalid or no longer available/i),
      ).toBeTruthy();
    });
  });

  it("preserves the stripped verifier under React.StrictMode and accepts a verifier added via hashchange", async () => {
    window.history.replaceState(null, "", "/invite/sel-strict#ver-strict");
    const first = render(
      <StrictMode>
        <InvitationDoorway
          selector="sel-strict"
          surfaceName="Mission Control"
        />
      </StrictMode>,
    );

    const button = screen.getByRole("button", { name: "Accept invitation" });
    await waitFor(() =>
      expect((button as HTMLButtonElement).disabled).toBe(false),
    );
    expect(window.location.hash).toBe("");
    first.unmount();

    window.history.replaceState(null, "", "/invite/sel-hash");
    const view = render(
      <StrictMode>
        <InvitationDoorway
          selector="sel-hash"
          surfaceName="Missionary Workspace"
        />
      </StrictMode>,
    );
    const secondBtn = view.getByRole("button", {
      name: "Accept invitation",
    });
    expect((secondBtn as HTMLButtonElement).disabled).toBe(true);
    window.location.hash = "#ver-from-hashchange";
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    await waitFor(() =>
      expect((secondBtn as HTMLButtonElement).disabled).toBe(false),
    );
    expect(window.location.hash).toBe("");
  });
});
