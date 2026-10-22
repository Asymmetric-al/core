import { afterEach, describe, expect, it, vi } from "vitest";

import {
  isDeniedSelfRoleUpdate,
  runFixtureCleanup,
} from "../../integration/supabase/client-runtime-checks.mjs";

describe("local Supabase SDK qualification checks", () => {
  afterEach(() => vi.useRealTimers());
  it("attempts later cleanup and census after earlier cleanup fails", async () => {
    const attempted: string[] = [];
    const failures = await runFixtureCleanup(
      ["channels", "user", "tenant", "census"].map((label) => ({
        label,
        run: async () => {
          attempted.push(label);
          if (label === "channels" || label === "user")
            throw new Error("Synthetic provider detail must stay private");
        },
      })),
    );
    expect(attempted).toEqual(["channels", "user", "tenant", "census"]);
    expect(failures).toEqual([
      { label: "channels", reason: "failed" },
      { label: "user", reason: "failed" },
    ]);
  });

  it("does not count a server error as a denied role mutation", () => {
    expect(
      isDeniedSelfRoleUpdate(
        { status: 500, error: { code: "unexpected_failure" }, data: null },
        "donor",
      ),
    ).toBe(false);
  });

  it("bounds a stalled cleanup and still attempts the remaining operations", async () => {
    vi.useFakeTimers();
    const next = vi.fn();
    const cleanup = runFixtureCleanup(
      [
        { label: "channels", run: () => new Promise(() => {}) },
        { label: "census", run: next },
      ],
      { timeoutMs: 20 },
    );
    await vi.advanceTimersByTimeAsync(20);
    await expect(cleanup).resolves.toEqual([
      { label: "channels", reason: "timeout" },
    ]);
    expect(next).toHaveBeenCalledOnce();
  });

  it.each([
    { status: 403, error: { code: "42501" }, data: null },
    { status: 200, error: null, data: [] },
  ])(
    "requires a valid denied response and an unchanged role: $status",
    (result) => {
      expect(isDeniedSelfRoleUpdate(result, "donor")).toBe(true);
      expect(isDeniedSelfRoleUpdate(result, "super_admin")).toBe(false);
    },
  );

  it.each([
    { status: 500, error: { code: "42501" }, data: null },
    { status: 403, error: { code: "unexpected_failure" }, data: null },
    { status: 200, error: null, data: [{ role: "donor" }] },
    { status: 0, error: null, data: null },
  ])(
    "rejects an ambiguous or successful mutation response: $status",
    (result) => {
      expect(isDeniedSelfRoleUpdate(result, "donor")).toBe(false);
    },
  );
});
