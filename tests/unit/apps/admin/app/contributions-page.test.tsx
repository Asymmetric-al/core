/** @vitest-environment jsdom */

import React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockUseAdminContributions = vi.fn(() => ({
  data: [],
  isPending: false,
  isError: false,
  error: null as Error | null,
  refetch: vi.fn(),
}));

vi.mock(
  "../../../../../apps/admin/app/contributions/use-admin-contributions",
  () => ({
    useAdminContributions: () => mockUseAdminContributions(),
  }),
);

vi.mock("sonner", () => ({
  toast: { info: vi.fn(), error: vi.fn(), success: vi.fn() },
}));

import ContributionsPage from "../../../../../apps/admin/app/contributions/page";

describe("apps/admin/app/contributions/page", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL ??= "http://127.0.0.1:54321";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= "test-anon-key";
    delete process.env.NEXT_PUBLIC_ADMIN_CONTRIBUTIONS_USE_MOCK;

    mockUseAdminContributions.mockReturnValue({
      data: [],
      isPending: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

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

  it("exports a client component (function)", () => {
    expect(typeof ContributionsPage).toBe("function");
  });

  it("renders contributions shell when query succeeds with empty data", async () => {
    render(<ContributionsPage />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Contributions" }),
      ).toBeTruthy();
    });

    expect(screen.getByText("No contributions found")).toBeTruthy();
  });

  it("shows error UI with retry when query is in error state (no table fallback)", async () => {
    mockUseAdminContributions.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
      error: new Error("Network down"),
      refetch: vi.fn(),
    });

    render(<ContributionsPage />);

    await waitFor(() => {
      expect(screen.getByText("Load failed")).toBeTruthy();
    });

    expect(screen.getByText("Network down")).toBeTruthy();
    expect(screen.getByRole("button", { name: /retry/i })).toBeTruthy();
    expect(screen.queryByText("No contributions found")).toBeNull();
  });
});
