import { beforeEach, describe, expect, it, vi } from "vitest";

const redirectMock = vi.fn((url: string) => {
  throw new Error(`NEXT_REDIRECT:${url}`);
});
const requestHeaders = new Map<string, string>();

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));
vi.mock("next/headers", () => ({
  headers: async () => ({
    get: (name: string) => requestHeaders.get(name) ?? null,
  }),
}));

const TENANT = "00000000-0000-0000-0000-000000000001";

describe("canonical contribution route", () => {
  beforeEach(() => {
    requestHeaders.clear();
    redirectMock.mockClear();
  });

  it("opens the shared contribution detail overlay for a donation id without requiring CRM context", async () => {
    const { default: Page } =
      await import("../../../../../apps/admin/app/(app)/contributions/[contributionId]/page");

    await expect(
      Page({
        params: Promise.resolve({ contributionId: "donation-123" }),
      }),
    ).rejects.toThrow("NEXT_REDIRECT:/contributions?gift=donation-123");

    expect(redirectMock).toHaveBeenCalledWith(
      "/contributions?gift=donation-123",
    );
  });

  it("keeps the tenant in the page address (plan 5.2)", async () => {
    requestHeaders.set("x-asym-address-prefix", `/${TENANT}~finance`);
    const { default: Page } =
      await import("../../../../../apps/admin/app/(app)/contributions/[contributionId]/page");

    await expect(
      Page({
        params: Promise.resolve({ contributionId: "donation-123" }),
      }),
    ).rejects.toThrow(
      `NEXT_REDIRECT:/${TENANT}~finance/contributions?gift=donation-123`,
    );
  });
});
