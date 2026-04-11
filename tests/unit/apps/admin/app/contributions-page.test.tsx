/** @vitest-environment jsdom */

import React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { useAdminContributionsMock } = vi.hoisted(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL ??= "http://127.0.0.1:54321";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= "test-anon-key";

  return {
    useAdminContributionsMock: vi.fn(),
  };
});

vi.mock(
  "../../../../../apps/admin/app/contributions/use-admin-contributions",
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import("../../../../../apps/admin/app/contributions/use-admin-contributions")
      >();

    return {
      ...actual,
      useAdminContributions: useAdminContributionsMock,
    };
  },
);

vi.mock("sonner", () => ({
  toast: { info: vi.fn(), error: vi.fn(), success: vi.fn() },
}));

import ContributionsPage from "../../../../../apps/admin/app/contributions/page";
import {
  boneyardContributionsFixture,
  mockContributions,
} from "../../../../../apps/admin/app/contributions/data";
import { loadMockAdminContributions } from "../../../../../apps/admin/app/contributions/use-admin-contributions";

function mockQuery(partial: Record<string, unknown>) {
  return {
    isError: false,
    isPending: false,
    data: undefined as typeof mockContributions | undefined,
    error: null as Error | null,
    refetch: vi.fn().mockResolvedValue({}),
    ...partial,
  };
}

describe("apps/admin/app/contributions/page", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_ADMIN_CONTRIBUTIONS_USE_MOCK;
    useAdminContributionsMock.mockReset();
    useAdminContributionsMock.mockReturnValue(
      mockQuery({
        isError: false,
        isPending: false,
        data: [],
        error: null,
      }),
    );

    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );

    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
  });

  it("exports a client component (function) that renders the contributions UI", () => {
    expect(typeof ContributionsPage).toBe("function");
  });

  it("renders contributions shell with empty data", async () => {
    render(<ContributionsPage />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Contributions" }),
      ).toBeTruthy();
    });

    expect(screen.getByTestId("mc-contributions-live")).toBeTruthy();
    expect(screen.getByText("No contributions found")).toBeTruthy();
  });

  it("shows load failed and retry when the query is in error state", () => {
    useAdminContributionsMock.mockReturnValue(
      mockQuery({
        isError: true,
        isPending: false,
        data: undefined,
        error: new Error("Upstream unavailable"),
      }),
    );

    render(<ContributionsPage />);

    expect(screen.getByRole("heading", { name: "Load failed" })).toBeTruthy();
    expect(screen.getByText("Upstream unavailable")).toBeTruthy();
    expect(screen.getByRole("button", { name: /retry/i })).toBeTruthy();
    expect(screen.queryByText("Sarah Mitchell")).toBeNull();
  });

  it("renders contribution rows when the query succeeds", () => {
    const rows = boneyardContributionsFixture;
    useAdminContributionsMock.mockReturnValue(
      mockQuery({
        isError: false,
        isPending: false,
        data: rows,
        error: null,
      }),
    );

    render(<ContributionsPage />);

    expect(screen.getByText(rows[0]!.donorName!)).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Load failed" })).toBeNull();
  });

  it("does not show load failed while the query is pending", () => {
    useAdminContributionsMock.mockReturnValue(
      mockQuery({
        isError: false,
        isPending: true,
        data: undefined,
        error: null,
      }),
    );

    const { container } = render(<ContributionsPage />);

    expect(screen.queryByRole("heading", { name: "Load failed" })).toBeNull();
    expect(
      container.querySelector('[data-boneyard="admin-contributions-content"]'),
    ).toBeTruthy();
  });

  it("loadMockAdminContributions returns shallow-cloned rows from mockContributions", () => {
    const data = loadMockAdminContributions();
    expect(data).toEqual(mockContributions);
    for (let i = 0; i < data.length; i++) {
      expect(data[i]).not.toBe(mockContributions[i]);
    }
  });
});
