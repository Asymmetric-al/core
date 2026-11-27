import { beforeEach, describe, expect, it, vi } from "vitest";

const admin = vi.hoisted(() => ({
  rpc: vi.fn(),
  available: true,
}));

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: () =>
    admin.available
      ? { client: { rpc: admin.rpc }, error: null }
      : { client: null, error: "Admin client unavailable." },
}));

import {
  recordSignInFailure,
  signInAccountKey,
  SignInLimitsUnavailableError,
  takeSignInAttempt,
} from "../../../packages/api/src/identity/sign-in-limits";

function databaseRpcRefusingBlankKeys(answer: boolean) {
  return async (name: string, args: Record<string, string>) => {
    const account = args.p_account?.trim() ?? "";
    const address = args.p_address?.trim() ?? "";
    if (!account || account.length > 320 || !address || address.length > 100)
      return {
        data: null,
        error: { code: "22023", message: "sign_in_account_required" },
      };
    if (name === "take_sign_in_attempt") return { data: answer, error: null };
    return { data: null, error: null };
  };
}

beforeEach(() => {
  admin.rpc.mockReset();
  admin.available = true;
});

describe("Core's sign-in limits adapter (AL-2671 N4 PR 1)", () => {
  it("keys the account by the address in the provider's normalisation: trimmed, case folded, non-ASCII capitals included", () => {
    expect(signInAccountKey("  Mixed.Case@Example.TEST ")).toBe(
      "mixed.case@example.test",
    );
    expect(signInAccountKey("ÉCOLE.Ünique@Example.test")).toBe(
      "école.ünique@example.test",
    );
    expect(signInAccountKey("école.ünique@example.test")).toBe(
      signInAccountKey("ÉCOLE.ÜNIQUE@EXAMPLE.TEST"),
    );
  });

  it("asks the database whether an attempt may go to the provider, by account and client address", async () => {
    admin.rpc.mockImplementation(databaseRpcRefusingBlankKeys(true));
    await expect(
      takeSignInAttempt({
        account: "known@example.test",
        address: "198.51.100.7",
      }),
    ).resolves.toBe(true);
    expect(admin.rpc).toHaveBeenCalledWith("take_sign_in_attempt", {
      p_account: "known@example.test",
      p_address: "198.51.100.7",
    });

    admin.rpc.mockImplementation(databaseRpcRefusingBlankKeys(false));
    await expect(
      takeSignInAttempt({
        account: "known@example.test",
        address: "198.51.100.7",
      }),
    ).resolves.toBe(false);
  });

  it("records one refused password against the account and the client address", async () => {
    admin.rpc.mockImplementation(databaseRpcRefusingBlankKeys(true));
    await recordSignInFailure({
      account: "known@example.test",
      address: "198.51.100.7",
    });
    expect(admin.rpc).toHaveBeenCalledWith("record_sign_in_failure", {
      p_account: "known@example.test",
      p_address: "198.51.100.7",
    });
  });

  it("fails closed: a database refusal, an error or no service client is unavailable, never a pass", async () => {
    admin.rpc.mockImplementation(databaseRpcRefusingBlankKeys(true));
    await expect(
      takeSignInAttempt({ account: " ", address: "198.51.100.7" }),
    ).rejects.toBeInstanceOf(SignInLimitsUnavailableError);
    await expect(
      recordSignInFailure({ account: "known@example.test", address: "" }),
    ).rejects.toBeInstanceOf(SignInLimitsUnavailableError);

    admin.rpc.mockResolvedValue({ data: null, error: null });
    await expect(
      takeSignInAttempt({
        account: "known@example.test",
        address: "198.51.100.7",
      }),
    ).rejects.toBeInstanceOf(SignInLimitsUnavailableError);

    admin.rpc.mockRejectedValue(new TypeError("fetch failed"));
    await expect(
      takeSignInAttempt({
        account: "known@example.test",
        address: "198.51.100.7",
      }),
    ).rejects.toBeInstanceOf(SignInLimitsUnavailableError);

    admin.available = false;
    await expect(
      takeSignInAttempt({
        account: "known@example.test",
        address: "198.51.100.7",
      }),
    ).rejects.toBeInstanceOf(SignInLimitsUnavailableError);
  });
});
