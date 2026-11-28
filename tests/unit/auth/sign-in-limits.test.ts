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

import { signInAccountKey } from "../../../packages/api/src/auth/sign-in-answers";
import {
  clearSignInAccount,
  releaseSignInAttempt,
  SignInLimitsUnavailableError,
  takeSignInAttempt,
} from "../../../packages/api/src/identity/sign-in-limits";

function databaseRpcRefusingBlankKeys(answer: boolean) {
  return async (name: string, args: Record<string, unknown>) => {
    const account = String(args.p_account ?? "").trim();
    const address = String(args.p_address ?? "").trim();
    const needsAddress = name !== "clear_sign_in_account";
    if (
      !account ||
      account.length > 320 ||
      (needsAddress && (!address || address.length > 100))
    )
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

  it("gives a reservation back, clearing the account when the password was accepted", async () => {
    admin.rpc.mockImplementation(databaseRpcRefusingBlankKeys(true));
    const key = { account: "known@example.test", address: "198.51.100.7" };
    await releaseSignInAttempt(key, { cleared: true });
    expect(admin.rpc).toHaveBeenLastCalledWith("release_sign_in_attempt", {
      p_account: "known@example.test",
      p_address: "198.51.100.7",
      p_cleared: true,
    });
    await releaseSignInAttempt(key, { cleared: false });
    expect(admin.rpc).toHaveBeenLastCalledWith("release_sign_in_attempt", {
      p_account: "known@example.test",
      p_address: "198.51.100.7",
      p_cleared: false,
    });
  });

  it("clears an account after a recovery", async () => {
    admin.rpc.mockImplementation(databaseRpcRefusingBlankKeys(true));
    await clearSignInAccount("known@example.test");
    expect(admin.rpc).toHaveBeenLastCalledWith("clear_sign_in_account", {
      p_account: "known@example.test",
    });
  });

  it("fails closed: a database refusal, an error or no service client is unavailable, never a pass", async () => {
    admin.rpc.mockImplementation(databaseRpcRefusingBlankKeys(true));
    await expect(
      takeSignInAttempt({ account: " ", address: "198.51.100.7" }),
    ).rejects.toBeInstanceOf(SignInLimitsUnavailableError);
    await expect(
      releaseSignInAttempt(
        { account: "known@example.test", address: "" },
        { cleared: true },
      ),
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
