// @vitest-environment jsdom
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

const fetchSpy = vi.fn();

beforeEach(() => {
  fetchSpy.mockReset();
  vi.stubGlobal("fetch", fetchSpy);
  window.history.replaceState(null, "", `/invite/${SELECTOR}#${VERIFIER}`);
  fetchSpy.mockResolvedValueOnce(
    new Response(JSON.stringify({ tenant_id: TENANT }), {
      status: 200,
      headers: { "content-type": "application/json" },
    }),
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  window.history.replaceState(null, "", "/");
});

async function acceptedDestination() {
  const navigate = vi.fn();
  render(
    <InvitationDoorway
      selector={SELECTOR}
      surfaceName="Mission Control"
      onNavigate={navigate}
    />,
  );
  await waitFor(() => expect(window.location.hash).toBe(""));
  fireEvent.click(screen.getByRole("button", { name: /accept invitation/i }));
  await waitFor(() => expect(navigate).toHaveBeenCalledTimes(1));
  return navigate.mock.calls[0]![0] as string;
}

describe("the invitation doorway's fallback", () => {
  it("is / with the switch on, never /<tenant> (base: /<tenant>)", async () => {
    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "1");
    vi.stubEnv("CORE_APP_BASE_PATH", "/admin");
    expect(await acceptedDestination()).toBe("/");
  });

  it("is /<tenant> with the switch off (guard)", async () => {
    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "0");
    expect(await acceptedDestination()).toBe(`/${TENANT}`);
  });
});
