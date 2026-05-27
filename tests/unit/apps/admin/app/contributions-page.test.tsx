/** @vitest-environment jsdom */

import React from "react";
import { QueryProvider } from "@asym/database/providers";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { useAdminContributionsMock, useContributionNeedsAttentionMock } =
  vi.hoisted(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL ??= "http://127.0.0.1:54321";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= "test-anon-key";

    return {
      useAdminContributionsMock: vi.fn(),
      useContributionNeedsAttentionMock: vi.fn(),
    };
  });

vi.mock("@asym/database/hooks", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@asym/database/hooks")>();
  return {
    ...actual,
    useContributionNeedsAttention: useContributionNeedsAttentionMock,
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
import { invalidateContributionOperationQueries } from "../../../../../apps/admin/app/contributions/page-client";
import {
  boneyardContributionsFixture,
  mockContributions,
} from "../../../../../apps/admin/app/contributions/data";
import { loadMockAdminContributions } from "../../../../../apps/admin/app/contributions/use-admin-contributions";
import { ADMIN_CONTRIBUTIONS_QUERY_KEY } from "../../../../../apps/admin/app/contributions/use-admin-contributions";
import { MISSION_CONTROL_NEEDS_ATTENTION_QUERY_KEY } from "@asym/database/hooks";

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

function renderContributionsPage() {
  return render(
    <QueryProvider>
      <ContributionsPage />
    </QueryProvider>,
  );
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
    useContributionNeedsAttentionMock.mockReturnValue(
      mockQuery({
        data: { groups: [], items: [] },
        isError: false,
        isPending: false,
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
    renderContributionsPage();

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

    renderContributionsPage();

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

    renderContributionsPage();

    expect(screen.getByText(rows[0]!.donorName!)).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Load failed" })).toBeNull();
  });

  it("renders Needs Attention groups from Mission Control task state", () => {
    const rows = boneyardContributionsFixture;
    useAdminContributionsMock.mockReturnValue(
      mockQuery({
        isError: false,
        isPending: false,
        data: rows,
        error: null,
      }),
    );
    useContributionNeedsAttentionMock.mockReturnValue(
      mockQuery({
        data: {
          groups: [
            {
              key: "critical:donor_notification_failed",
              title: "Donor notification",
              urgency: "critical",
              count: 1,
              items: [
                {
                  id: "attention_1",
                  taskId: "task_1",
                  issueType: "donor_notification_failed",
                  issueLabel: "Donor notification",
                  urgency: "critical",
                  status: "open",
                  summary: "Donor correction email failed",
                  contributionId: rows[0]!.id,
                  donorId: rows[0]!.donorId,
                  firstSeenAt: "2026-05-26T00:00:00.000Z",
                  lastSeenAt: "2026-05-26T01:00:00.000Z",
                },
              ],
            },
          ],
          items: [],
        },
        isError: false,
        isPending: false,
      }),
    );

    renderContributionsPage();

    expect(screen.getByText("Needs Attention")).toBeTruthy();
    expect(screen.getByText("Donor notification")).toBeTruthy();
    expect(screen.getByText("Donor correction email failed")).toBeTruthy();
  });

  it("invalidates contributions and Needs Attention after contribution mutations", async () => {
    const queryClient = {
      invalidateQueries: vi.fn().mockResolvedValue(undefined),
    };

    await invalidateContributionOperationQueries(queryClient as never);

    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ADMIN_CONTRIBUTIONS_QUERY_KEY,
    });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: MISSION_CONTROL_NEEDS_ATTENTION_QUERY_KEY,
    });
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

    const { container } = renderContributionsPage();

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

  it("keeps boneyard fixture timestamps deterministic", () => {
    expect(boneyardContributionsFixture).toMatchObject([
      {
        date: "2026-04-16T12:00:00.000Z",
        contributionDate: "2026-04-16T12:00:00.000Z",
        createdAt: "2026-04-16T12:00:00.000Z",
        updatedAt: "2026-04-16T12:00:00.000Z",
      },
      {
        date: "2026-04-16T12:00:00.000Z",
        contributionDate: "2026-04-16T12:00:00.000Z",
        createdAt: "2026-04-16T12:00:00.000Z",
        updatedAt: "2026-04-16T12:00:00.000Z",
      },
    ]);
  });
});
