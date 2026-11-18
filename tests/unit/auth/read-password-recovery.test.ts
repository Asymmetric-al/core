import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => ({ getClaims: vi.fn() }));
const connection = vi.hoisted(() => vi.fn(async () => undefined));

vi.mock("@asym/database/supabase/server", () => ({
  createClient: async () => ({ auth }),
}));
vi.mock("next/server", () => ({ connection }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`redirect:${url}`);
  },
}));

import { readPasswordRecovery } from "../../../packages/auth/auth-screen";

const NOW_MS = 1_800_000_000_000;
const NOW = NOW_MS / 1000;

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW_MS);
});
afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe("reading a password recovery session", () => {
  it("returns the address of a session the recovery link just created", async () => {
    auth.getClaims.mockResolvedValue({
      data: {
        claims: {
          email: "recover@example.com",
          amr: [{ method: "recovery", timestamp: NOW - 30 }],
        },
      },
      error: null,
    });

    // The time left goes to the screen, which refuses to save after it
    // (council round 2, B2).
    await expect(readPasswordRecovery()).resolves.toEqual({
      email: "recover@example.com",
      secondsLeft: 60 * 60 - 30,
    });
  });

  it("waits for a request before reading the session and the clock", async () => {
    auth.getClaims.mockResolvedValue({ data: null, error: null });
    await readPasswordRecovery();
    expect(connection).toHaveBeenCalledTimes(1);
    expect(connection.mock.invocationCallOrder[0]).toBeLessThan(
      auth.getClaims.mock.invocationCallOrder[0]!,
    );
  });

  it("refuses an ordinary signed-in session, which must give its current password", async () => {
    auth.getClaims.mockResolvedValue({
      data: {
        claims: {
          email: "signed-in@example.com",
          amr: [{ method: "password", timestamp: NOW - 30 }],
        },
      },
      error: null,
    });

    await expect(readPasswordRecovery()).resolves.toBeNull();
  });

  it.each([
    ["no session", { data: null, error: null }],
    [
      "a token that fails verification",
      { data: null, error: new Error("invalid JWT") },
    ],
  ])("refuses %s", async (_label, result) => {
    auth.getClaims.mockResolvedValue(result);
    await expect(readPasswordRecovery()).resolves.toBeNull();
  });
});
