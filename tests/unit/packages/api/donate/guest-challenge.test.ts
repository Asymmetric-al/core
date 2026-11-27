import { describe, expect, it, vi } from "vitest";

import {
  CHALLENGE_VERIFY_URL,
  verifyGuestChallenge,
} from "../../../../../packages/api/src/donate/guest/challenge";

const SECRET = "1x0000000000000000000000000000000AA";

function answering(status: number, body: unknown) {
  return vi.fn(async () => new Response(JSON.stringify(body), { status }));
}

describe("AL-2681 PR 2a: the server-verified challenge (plan :1149)", () => {
  it("asks the provider once with the secret, the token and the client's address, and passes only on success", async () => {
    const fetchImpl = answering(200, { success: true, "error-codes": [] });
    const verdict = await verifyGuestChallenge({
      token: "token-1",
      remoteIp: "198.51.100.4",
      secret: SECRET,
      fetchImpl,
    });
    expect(verdict).toEqual({ ok: true });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect(url).toBe(CHALLENGE_VERIFY_URL);
    expect(url).toBe(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    );
    expect(init.method).toBe("POST");
    const form = new URLSearchParams(String(init.body));
    expect(Object.fromEntries(form)).toEqual({
      secret: SECRET,
      response: "token-1",
      remoteip: "198.51.100.4",
    });
  });

  it("F6 (e): Turnstile's own internal error is unavailable (retryable), while a rejected token stays a failed challenge", async () => {
    const internal = answering(200, {
      success: false,
      "error-codes": ["internal-error"],
    });
    expect(
      await verifyGuestChallenge({
        token: "token-1",
        remoteIp: "198.51.100.4",
        secret: SECRET,
        fetchImpl: internal,
      }),
    ).toEqual({ ok: false, reason: "unavailable" });
    const rejected = answering(200, {
      success: false,
      "error-codes": ["invalid-input-response"],
    });
    expect(
      await verifyGuestChallenge({
        token: "token-1",
        remoteIp: "198.51.100.4",
        secret: SECRET,
        fetchImpl: rejected,
      }),
    ).toEqual({ ok: false, reason: "invalid" });
  });

  it("a missing or blank token is refused without asking anyone", async () => {
    const fetchImpl = answering(200, { success: true });
    for (const token of [null, undefined, "", "   "]) {
      expect(
        await verifyGuestChallenge({
          token,
          remoteIp: "198.51.100.4",
          secret: SECRET,
          fetchImpl,
        }),
      ).toEqual({ ok: false, reason: "missing" });
    }
    expect(
      await verifyGuestChallenge({
        token: "t".repeat(2049),
        remoteIp: "198.51.100.4",
        secret: SECRET,
        fetchImpl,
      }),
    ).toEqual({ ok: false, reason: "invalid" });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("without a secret the challenge is unavailable and nothing is asked", async () => {
    const fetchImpl = answering(200, { success: true });
    for (const secret of [undefined, "", "  "]) {
      expect(
        await verifyGuestChallenge({
          token: "token-1",
          remoteIp: "198.51.100.4",
          secret,
          fetchImpl,
        }),
      ).toEqual({ ok: false, reason: "unavailable" });
    }
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("a failed verdict is invalid; an error, a non-200 answer, a malformed body or a timeout is unavailable", async () => {
    expect(
      await verifyGuestChallenge({
        token: "token-1",
        remoteIp: "198.51.100.4",
        secret: SECRET,
        fetchImpl: answering(200, {
          success: false,
          "error-codes": ["invalid-input-response"],
        }),
      }),
    ).toEqual({ ok: false, reason: "invalid" });
    expect(
      await verifyGuestChallenge({
        token: "token-1",
        remoteIp: "198.51.100.4",
        secret: SECRET,
        fetchImpl: answering(200, { success: "true" }),
      }),
    ).toEqual({ ok: false, reason: "invalid" });
    for (const fetchImpl of [
      answering(500, { success: true }),
      vi.fn(async () => new Response("not json", { status: 200 })),
      vi.fn(async () => {
        throw new Error("network down");
      }),
    ]) {
      expect(
        await verifyGuestChallenge({
          token: "token-1",
          remoteIp: "198.51.100.4",
          secret: SECRET,
          fetchImpl,
        }),
      ).toEqual({ ok: false, reason: "unavailable" });
    }
    const hanging = vi.fn(
      (_url: string, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () =>
            reject(new Error("aborted")),
          );
        }),
    );
    expect(
      await verifyGuestChallenge({
        token: "token-1",
        remoteIp: "198.51.100.4",
        secret: SECRET,
        fetchImpl: hanging,
        timeoutMs: 20,
      }),
    ).toEqual({ ok: false, reason: "unavailable" });
  });
});
