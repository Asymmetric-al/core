// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useLayoutEffect } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- AL-1958: Regression exercises the app's public provider, not a cross-app runtime dependency.
import {
  DonorsPageViewProvider,
  useDonorsPageViewFields,
} from "../../../../../../apps/missionary/app/donors/use-donors-page-view";
// eslint-disable-next-line no-restricted-imports -- AL-1958: Bun peer isolation requires the same public React Query entry as the app provider.
import {
  QueryClient,
  QueryClientProvider,
} from "../../../../../../apps/missionary/node_modules/@tanstack/react-query/build/modern/index.js";

// eslint-disable-next-line no-restricted-imports -- AL-1958: Typed fixture for the public donor view-model regression.
import type { Donor } from "../../../../../../apps/missionary/app/donors/donor-types";

const boundary = vi.hoisted(() => ({ rows: [] as Donor[] }));

vi.mock("@asym/database/hooks", () => ({
  useMissionaryDonorRows: () => ({
    data: boundary.rows,
    isLoading: false,
    error: null,
    hasMore: false,
    isLoadingMore: false,
    loadMore: async () => {},
  }),
}));
vi.mock("@asym/lib/hooks", () => ({
  useAuth: () => ({ profile: { id: "missionary-1" }, loading: false }),
}));
vi.mock("@asym/database/query-keys", () => ({
  invalidateSupabaseTableQuery: async () => {},
}));

function donor(id: string, tags: string[]): Donor {
  return {
    id,
    name: id,
    initials: "PT",
    type: "Individual",
    status: "Active",
    total_given: 100,
    last_gift_date: null,
    last_gift_amount: null,
    frequency: "One-time",
    email: "partner@example.test",
    phone: "",
    preferred_contact: "email",
    location: "Test City",
    address: {},
    joined_date: "2026-01-01T00:00:00.000Z",
    tags,
    score: 0,
    activities: [],
    recurring_donations: [],
    has_active_pledge: false,
  };
}

type Selection = { donorId: string | null; tags: string[] };

function TagEditorProbe({
  onCommit,
}: {
  onCommit: (value: Selection) => void;
}) {
  const view = useDonorsPageViewFields();
  useLayoutEffect(() => {
    onCommit({
      donorId: view.donors.selected?.id ?? null,
      tags: view.tagEditor.selectedTags,
    });
  });
  return (
    <>
      <button type="button" onClick={() => view.donors.selectById("first")}>
        Select first
      </button>
      <button type="button" onClick={() => view.donors.selectById("second")}>
        Select second
      </button>
      <button type="button" onClick={view.donors.clearSelection}>
        Clear selection
      </button>
      <button type="button" onClick={view.tagEditor.open}>
        Open tags
      </button>
      <button type="button" onClick={view.tagEditor.close}>
        Cancel tags
      </button>
      <button
        type="button"
        onClick={() => view.tagEditor.toggleTag("draft-tag")}
      >
        Toggle draft tag
      </button>
      <output>{view.tagEditor.selectedTags.join(",")}</output>
    </>
  );
}

function TestPage({ onCommit }: { onCommit: (value: Selection) => void }) {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <DonorsPageViewProvider>
        <TagEditorProbe onCommit={onCommit} />
      </DonorsPageViewProvider>
    </QueryClientProvider>
  );
}

beforeEach(() => {
  boundary.rows = [
    donor("first", ["first-tag"]),
    donor("second", ["second-tag"]),
  ];
});
afterEach(cleanup);

describe("partner tag drafts", () => {
  it("derives committed tags immediately when the selected row arrives later", () => {
    boundary.rows = [];
    const onCommit = vi.fn<(value: Selection) => void>();
    const page = render(<TestPage onCommit={onCommit} />);
    fireEvent.click(screen.getByRole("button", { name: "Select first" }));
    onCommit.mockClear();
    boundary.rows = [donor("first", ["arrived-tag"])];
    page.rerender(<TestPage onCommit={onCommit} />);
    expect(onCommit).toHaveBeenCalled();
    for (const [selection] of onCommit.mock.calls) {
      expect(selection).toEqual({ donorId: "first", tags: ["arrived-tag"] });
    }
  });

  it("never commits another partner's tags when the selected partner changes", () => {
    const onCommit = vi.fn<(value: Selection) => void>();
    render(<TestPage onCommit={onCommit} />);
    fireEvent.click(screen.getByRole("button", { name: "Select first" }));
    fireEvent.click(screen.getByRole("button", { name: "Open tags" }));
    fireEvent.click(screen.getByRole("button", { name: "Toggle draft tag" }));
    onCommit.mockClear();
    fireEvent.click(screen.getByRole("button", { name: "Select second" }));
    expect(onCommit).toHaveBeenCalled();
    for (const [selection] of onCommit.mock.calls) {
      expect(selection).toEqual({ donorId: "second", tags: ["second-tag"] });
    }
  });

  it("preserves an open draft across server refreshes and same-partner selection, then cancels to current server tags", () => {
    const onCommit = vi.fn<(value: Selection) => void>();
    const page = render(<TestPage onCommit={onCommit} />);
    fireEvent.click(screen.getByRole("button", { name: "Select first" }));
    fireEvent.click(screen.getByRole("button", { name: "Open tags" }));
    fireEvent.click(screen.getByRole("button", { name: "Toggle draft tag" }));

    boundary.rows = [
      donor("first", ["refreshed-tag"]),
      donor("second", ["second-tag"]),
    ];
    page.rerender(<TestPage onCommit={onCommit} />);
    fireEvent.click(screen.getByRole("button", { name: "Select first" }));
    expect(screen.getByRole("status").textContent).toBe("first-tag,draft-tag");

    fireEvent.click(screen.getByRole("button", { name: "Cancel tags" }));
    expect(screen.getByRole("status").textContent).toBe("refreshed-tag");
    fireEvent.click(screen.getByRole("button", { name: "Open tags" }));
    expect(screen.getByRole("status").textContent).toBe("refreshed-tag");
  });

  it.each(["Select second", "Clear selection"])(
    "discards a draft after %s, including when returning to the previous partner",
    (action) => {
      const onCommit = vi.fn<(value: Selection) => void>();
      render(<TestPage onCommit={onCommit} />);
      fireEvent.click(screen.getByRole("button", { name: "Select first" }));
      fireEvent.click(screen.getByRole("button", { name: "Open tags" }));
      fireEvent.click(screen.getByRole("button", { name: "Toggle draft tag" }));
      fireEvent.click(screen.getByRole("button", { name: action }));
      fireEvent.click(screen.getByRole("button", { name: "Select first" }));
      expect(screen.getByRole("status").textContent).toBe("first-tag");
    },
  );
});
