import { describe, expect, it, vi } from "vitest";

const redirectMock = vi.fn((url: string) => {
  throw new Error(`NEXT_REDIRECT:${url}`);
});

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

describe("canonical contribution route", () => {
  it("opens the shared contribution detail overlay for a donation id without requiring CRM context", async () => {
    const { default: Page } =
      await import("../../../../../apps/admin/app/contributions/[contributionId]/page");

    await expect(
      Page({
        params: Promise.resolve({ contributionId: "donation-123" }),
      }),
    ).rejects.toThrow("NEXT_REDIRECT:/contributions?gift=donation-123");

    expect(redirectMock).toHaveBeenCalledWith(
      "/contributions?gift=donation-123",
    );
  });
});
