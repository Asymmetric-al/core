import { afterEach, describe, expect, it, vi } from "vitest";

import {
  confirmOperatorSession,
  OPERATOR_MFA_MESSAGES,
  operatorMfaFailure,
  readFactorState,
  removeFactor,
  startEnrolment,
  verifyCode,
  type OperatorMfaClient,
} from "../../../packages/auth/operator-mfa";

const USER = "00000000-0000-4000-8000-0000000000a1";

type Factor = {
  id: string;
  friendly_name?: string;
  factor_type: string;
  status: "verified" | "unverified";
  created_at: string;
  updated_at: string;
};

function factor(
  id: string,
  status: Factor["status"] = "verified",
  factorType = "totp",
): Factor {
  return {
    id,
    friendly_name: `Authenticator ${id}`,
    factor_type: factorType,
    status,
    created_at: `2026-11-2${id.length % 9}T10:00:00Z`,
    updated_at: "2026-11-26T10:00:00Z",
  };
}

function fakeClient(
  options: {
    factors?: Factor[][];
    levels?: string[];
    rpc?: { data: unknown; error: { code?: string; message?: string } | null };
    enroll?: Array<{
      data: unknown;
      error: { code?: string; status?: number } | null;
    }>;
    verify?: { code?: string; status?: number } | null;
    unenroll?: { code?: string; status?: number } | null;
    listError?: { code?: string; status?: number } | null;
  } = {},
) {
  const calls: string[] = [];
  const factorReads = [...(options.factors ?? [[]])];
  const levels = [...(options.levels ?? ["aal1"])];
  const enrolAnswers = [...(options.enroll ?? [])];
  const client = {
    auth: {
      getUser: vi.fn(async () => {
        calls.push("getUser");
        return { data: { user: { id: USER } }, error: null };
      }),
      refreshSession: vi.fn(async () => {
        calls.push("refreshSession");
        return { data: {}, error: null };
      }),
      mfa: {
        listFactors: vi.fn(async () => {
          calls.push("listFactors");
          if (options.listError)
            return { data: null, error: options.listError };
          const all =
            factorReads.length > 1 ? factorReads.shift()! : factorReads[0]!;
          return {
            data: {
              all,
              totp: all.filter(
                (f) => f.factor_type === "totp" && f.status === "verified",
              ),
            },
            error: null,
          };
        }),
        getAuthenticatorAssuranceLevel: vi.fn(async () => {
          calls.push("getAuthenticatorAssuranceLevel");
          const currentLevel = levels.length > 1 ? levels.shift()! : levels[0]!;
          return {
            data: {
              currentLevel,
              nextLevel: "aal2",
              currentAuthenticationMethods: [],
            },
            error: null,
          };
        }),
        enroll: vi.fn(async (params: unknown) => {
          calls.push(`enroll:${JSON.stringify(params)}`);
          return (
            enrolAnswers.shift() ?? {
              data: {
                id: "new-factor",
                type: "totp",
                totp: {
                  qr_code: "data:image/svg+xml;utf-8,<svg></svg>",
                  secret: "TESTSECRETNOTREAL",
                  uri: "otpauth://totp/x",
                },
              },
              error: null,
            }
          );
        }),
        challengeAndVerify: vi.fn(async (params: unknown) => {
          calls.push(`challengeAndVerify:${JSON.stringify(params)}`);
          return options.verify
            ? { data: null, error: options.verify }
            : { data: {}, error: null };
        }),
        unenroll: vi.fn(async (params: { factorId: string }) => {
          calls.push(`unenroll:${params.factorId}`);
          return options.unenroll
            ? { data: null, error: options.unenroll }
            : { data: { id: params.factorId }, error: null };
        }),
      },
    },
    rpc: vi.fn(async (fn: string) => {
      calls.push(`rpc:${fn}`);
      return options.rpc ?? { data: { operator_id: USER }, error: null };
    }),
  };
  return { client: client as unknown as OperatorMfaClient, calls, raw: client };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("AL-2675 WP2c part 2a, T4: the factor state, in strict order", () => {
  it("offers enrolment with no verified TOTP factor; at aal2 it refreshes the session first and never asks the database", async () => {
    const { client, calls } = fakeClient({
      factors: [[factor("u1", "unverified")], [factor("u1", "unverified")]],
      levels: ["aal2", "aal1"],
    });
    expect(await readFactorState(client)).toEqual({ kind: "enrol" });
    expect(calls).toEqual([
      "listFactors",
      "getAuthenticatorAssuranceLevel",
      "refreshSession",
      "listFactors",
      "getAuthenticatorAssuranceLevel",
    ]);
  });

  it("still offers only enrolment if the level stays aal2 after the refresh", async () => {
    const { client, calls } = fakeClient({ factors: [[]], levels: ["aal2"] });
    expect(await readFactorState(client)).toEqual({ kind: "enrol" });
    expect(calls).not.toContain("rpc:platform_operator_session");
  });

  it("offers enrolment at aal1 with no verified factor without refreshing", async () => {
    const { client, calls } = fakeClient({
      factors: [[factor("p1", "verified", "phone")]],
    });
    expect(await readFactorState(client)).toEqual({ kind: "enrol" });
    expect(calls).not.toContain("refreshSession");
  });

  it("asks for the challenge when a verified TOTP factor exists and the level is not aal2", async () => {
    const { client, calls } = fakeClient({
      factors: [[factor("v1"), factor("v22"), factor("u1", "unverified")]],
      levels: ["aal1"],
    });
    expect(await readFactorState(client)).toEqual({
      kind: "challenge",
      factorIds: ["v1", "v22"],
    });
    expect(calls).not.toContain("rpc:platform_operator_session");
  });

  it("shows the area only with a verified factor, aal2 and the database's confirmation", async () => {
    const { client, calls } = fakeClient({
      factors: [[factor("v1"), factor("u1", "unverified")]],
      levels: ["aal2"],
    });
    expect(await readFactorState(client)).toEqual({
      kind: "area",
      factors: [
        {
          id: "v1",
          friendlyName: "Authenticator v1",
          createdAt: factor("v1").created_at,
        },
      ],
    });
    expect(calls).toContain("rpc:platform_operator_session");
  });

  it.each([
    ["refuses", { data: null, error: { code: "42501", message: "x" } }],
    [
      "names another login",
      { data: { operator_id: "someone-else" }, error: null },
    ],
    ["answers nothing", { data: null, error: null }],
  ])(
    "reports the refusal, never the area, when the database %s",
    async (_label, rpc) => {
      const { client } = fakeClient({
        factors: [[factor("v1")]],
        levels: ["aal2"],
        rpc,
      });
      expect(await readFactorState(client)).toEqual({ kind: "refused" });
    },
  );

  it("reports a fixed message when the factor list cannot be read", async () => {
    const { client } = fakeClient({
      listError: { code: "unexpected_failure", status: 500 },
    });
    expect(await readFactorState(client)).toEqual({
      kind: "failed",
      message: OPERATOR_MFA_MESSAGES.generic,
    });
  });
});

describe("AL-2675 WP2c part 2a, T4: enrolment", () => {
  it("removes the caller's own unverified TOTP factors first, then enrols with a dated name and the operations issuer", async () => {
    const { client, calls } = fakeClient({
      factors: [
        [
          factor("u1", "unverified"),
          factor("v1"),
          factor("u2", "unverified"),
          factor("p1", "unverified", "phone"),
        ],
      ],
    });
    const result = await startEnrolment(
      client,
      new Date("2026-11-26T13:05:09.987Z"),
    );
    expect(result).toEqual({
      ok: true,
      factorId: "new-factor",
      qrCode: "data:image/svg+xml;utf-8,<svg></svg>",
      secret: "TESTSECRETNOTREAL",
    });
    expect(calls).toEqual([
      "listFactors",
      "unenroll:u1",
      "unenroll:u2",
      `enroll:${JSON.stringify({ factorType: "totp", friendlyName: "Authenticator 2026-11-26 13:05:09 UTC", issuer: "Asym operations" })}`,
    ]);
  });

  it("retries once with (2) on a name conflict", async () => {
    const { client, calls } = fakeClient({
      enroll: [
        {
          data: null,
          error: { code: "mfa_factor_name_conflict", status: 422 },
        },
      ],
    });
    const result = await startEnrolment(
      client,
      new Date("2026-11-26T13:05:09Z"),
    );
    expect(result.ok).toBe(true);
    expect(calls.filter((call) => call.startsWith("enroll:"))).toEqual([
      `enroll:${JSON.stringify({ factorType: "totp", friendlyName: "Authenticator 2026-11-26 13:05:09 UTC", issuer: "Asym operations" })}`,
      `enroll:${JSON.stringify({ factorType: "totp", friendlyName: "Authenticator 2026-11-26 13:05:09 UTC (2)", issuer: "Asym operations" })}`,
    ]);
  });

  it("asks the person to try again in a minute after a second name conflict", async () => {
    const conflict = {
      data: null,
      error: { code: "mfa_factor_name_conflict", status: 422 },
    };
    const { client } = fakeClient({ enroll: [conflict, conflict] });
    expect(await startEnrolment(client)).toEqual({
      ok: false,
      message: "Try again in a minute.",
      reread: false,
      mismatch: false,
    });
  });

  it.each([
    ["mfa_totp_enroll_not_enabled", OPERATOR_MFA_MESSAGES.switchedOff],
    ["too_many_enrolled_mfa_factors", OPERATOR_MFA_MESSAGES.tooMany],
    ["something_new", OPERATOR_MFA_MESSAGES.generic],
  ])(
    "maps an enrolment refusal %s to its fixed text",
    async (code, message) => {
      const { client } = fakeClient({
        enroll: [{ data: null, error: { code, status: 422 } }],
      });
      expect(await startEnrolment(client)).toEqual({
        ok: false,
        message,
        reread: false,
        mismatch: false,
      });
    },
  );
});

describe("AL-2675 WP2c part 2a, T4: the fixed messages", () => {
  it("uses the brief's exact copy", () => {
    expect(OPERATOR_MFA_MESSAGES).toEqual({
      mismatch:
        "That code did not match. Check that your device's clock is right and enter the current code.",
      expired: "Enter a new code.",
      network: "Your network changed during verification. Enter a new code.",
      rateLimited:
        "Too many attempts from this network. Wait a minute, then enter a new code.",
      switchedOff:
        "Two-step sign-in is switched off for this project. Ask the release owner to switch on TOTP.",
      tooMany:
        "This account has the most authenticators allowed. Remove one first.",
      nameConflict: "Try again in a minute.",
      generic: "Something went wrong. Try again.",
    });
  });

  it.each([
    [{ code: "mfa_verification_failed", status: 422 }, "mismatch", true],
    [{ code: "mfa_verification_rejected", status: 422 }, "mismatch", true],
    [{ code: "mfa_challenge_expired", status: 422 }, "expired", false],
    [{ code: "mfa_ip_address_mismatch", status: 422 }, "network", false],
    [{ code: "over_request_rate_limit", status: 429 }, "rateLimited", false],
    [{ status: 429 }, "rateLimited", false],
    [
      { code: "mfa_totp_enroll_not_enabled", status: 422 },
      "switchedOff",
      false,
    ],
    [
      { code: "mfa_totp_verify_not_enabled", status: 422 },
      "switchedOff",
      false,
    ],
    [{ code: "too_many_enrolled_mfa_factors", status: 422 }, "tooMany", false],
    [{ code: "mfa_factor_name_conflict", status: 422 }, "nameConflict", false],
    [{ code: "unexpected_failure", status: 500 }, "generic", false],
    [{ message: "Auth's own words: secret ABCD" }, "generic", false],
  ] as const)(
    "maps %j to %s, and calls only a wrong code a mismatch (R4)",
    (error, key, mismatch) => {
      expect(operatorMfaFailure(error)).toEqual({
        ok: false,
        message: OPERATOR_MFA_MESSAGES[key],
        reread: false,
        mismatch,
      });
    },
  );

  it("re-reads the state on insufficient_aal instead of showing a message", () => {
    expect(
      operatorMfaFailure({ code: "insufficient_aal", status: 403 }),
    ).toEqual({ ok: false, message: "", reread: true, mismatch: false });
  });
});

describe("AL-2675 WP2c part 2a, T4: verification, removal and the database's confirmation", () => {
  it("verifies a code through challengeAndVerify on the browser's Auth client", async () => {
    const { client, calls } = fakeClient();
    expect(await verifyCode("v1", "123456", client)).toEqual({ ok: true });
    expect(calls).toEqual([
      `challengeAndVerify:${JSON.stringify({ factorId: "v1", code: "123456" })}`,
    ]);
  });

  it("maps a refused code to the fixed text", async () => {
    const { client } = fakeClient({
      verify: { code: "mfa_verification_failed", status: 422 },
    });
    expect(await verifyCode("v1", "000000", client)).toEqual({
      ok: false,
      message: OPERATOR_MFA_MESSAGES.mismatch,
      reread: false,
      mismatch: true,
    });
  });

  it("removes a factor, then refreshes the session at once", async () => {
    const { client, calls } = fakeClient();
    expect(await removeFactor("v2", client)).toEqual({ ok: true });
    expect(calls).toEqual(["unenroll:v2", "refreshSession"]);
  });

  it("does not refresh when the removal is refused", async () => {
    const { client, calls } = fakeClient({
      unenroll: { code: "insufficient_aal", status: 403 },
    });
    expect(await removeFactor("v2", client)).toEqual({
      ok: false,
      message: "",
      reread: true,
      mismatch: false,
    });
    expect(calls).toEqual(["unenroll:v2"]);
  });

  it("asks for a fresh read, never a second removal, when the factor went but the session refresh failed (B2)", async () => {
    const { client, calls, raw } = fakeClient();
    raw.auth.refreshSession.mockResolvedValueOnce({
      data: {},
      error: { code: "unexpected_failure", status: 500 },
    } as never);
    expect(await removeFactor("v2", client)).toEqual({
      ok: false,
      message: OPERATOR_MFA_MESSAGES.generic,
      reread: true,
      mismatch: false,
    });
    expect(calls).toEqual(["unenroll:v2"]);
  });

  it("confirms the operator session only when the database returns the caller's own login", async () => {
    expect(await confirmOperatorSession(fakeClient().client)).toBe(true);
    for (const rpc of [
      { data: { operator_id: "other" }, error: null },
      { data: null, error: { code: "42501", message: "x" } },
      { data: USER, error: null },
      { data: null, error: null },
    ]) {
      expect(await confirmOperatorSession(fakeClient({ rpc }).client)).toBe(
        false,
      );
    }
  });

  it("never writes to the console", async () => {
    const spies = (["log", "info", "warn", "error", "debug"] as const).map(
      (method) => vi.spyOn(console, method).mockImplementation(() => undefined),
    );
    const { client } = fakeClient({
      factors: [[factor("v1")]],
      levels: ["aal2"],
    });
    await startEnrolment(client);
    await verifyCode("new-factor", "123456", client);
    await readFactorState(client);
    for (const spy of spies) expect(spy).not.toHaveBeenCalled();
  });
});
