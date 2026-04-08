/** @vitest-environment jsdom */

import React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@asym/ui/components/shadcn/data-table", async (importOriginal) => {
  const mod =
    await importOriginal<
      typeof import("@asym/ui/components/shadcn/data-table")
    >();

  return {
    ...mod,
    useDataTableWithLiveQuery: () => ({
      data: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    }),
  };
});

vi.mock("sonner", () => ({
  toast: { info: vi.fn(), error: vi.fn(), success: vi.fn() },
}));

import ContributionsPage from "../../../../../apps/admin/app/contributions/page";

describe("apps/admin/app/contributions/page", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL ??= "http://127.0.0.1:54321";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= "test-anon-key";

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

  it("renders the live-query contributions shell after mount", async () => {
    render(<ContributionsPage />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Contributions" })).toBeTruthy();
    });

    expect(screen.getByTestId("mc-contributions-live")).toBeTruthy();
    expect(screen.getByText("No contributions found")).toBeTruthy();
  });
});
