/** @vitest-environment jsdom */
import { cleanup, render, waitFor } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  search: "",
  replace: vi.fn(),
  selectById: vi.fn(),
  loadMore: vi.fn(),
  toastError: vi.fn(),
  view: {
    status: { isLoading: false, error: null as string | null },
    donors: {
      all: [] as Array<{ id: string }>,
      hasMore: false,
      isLoadingMore: false,
    },
  },
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/donors",
  useRouter: () => ({ replace: mocks.replace }),
  useSearchParams: () => new URLSearchParams(mocks.search),
}));
vi.mock("sonner", () => ({ toast: { error: mocks.toastError } }));
vi.mock("../../../../apps/missionary/app/donors/use-donors-page-view", () => ({
  useDonorsPageViewFields: () => ({
    status: mocks.view.status,
    donors: {
      ...mocks.view.donors,
      selectById: mocks.selectById,
      loadMore: mocks.loadMore,
    },
  }),
}));

import { OpenPartnerFromLink } from "../../../../apps/missionary/app/donors/open-partner-from-link";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  mocks.search = "";
  mocks.view.status = { isLoading: false, error: null };
  mocks.view.donors = { all: [], hasMore: false, isLoadingMore: false };
});

describe("Partners page partner link", () => {
  it("opens the partner a link names, then clears the request", async () => {
    mocks.search = "partner=grace&view=monthly";
    mocks.view.donors.all = [{ id: "avery" }, { id: "grace" }];
    render(<OpenPartnerFromLink />);
    await waitFor(() => expect(mocks.selectById).toHaveBeenCalledWith("grace"));
    expect(mocks.replace).toHaveBeenCalledWith("/donors?view=monthly", {
      scroll: false,
    });
    expect(mocks.toastError).not.toHaveBeenCalled();
  });

  it("loads more partners when the named partner isn't loaded yet", async () => {
    mocks.search = "partner=grace";
    mocks.view.donors.all = [{ id: "avery" }];
    mocks.view.donors.hasMore = true;
    const { rerender } = render(<OpenPartnerFromLink />);
    await waitFor(() => expect(mocks.loadMore).toHaveBeenCalledTimes(1));
    // A re-render before the page arrives must not ask for it twice.
    rerender(<OpenPartnerFromLink />);
    expect(mocks.loadMore).toHaveBeenCalledTimes(1);
    expect(mocks.selectById).not.toHaveBeenCalled();
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("says so when the partner isn't in the list, and clears the request", async () => {
    mocks.search = "partner=gone";
    mocks.view.donors.all = [{ id: "avery" }];
    render(<OpenPartnerFromLink />);
    await waitFor(() =>
      expect(mocks.toastError).toHaveBeenCalledWith(
        "That partner isn’t in your list any more.",
      ),
    );
    expect(mocks.selectById).not.toHaveBeenCalled();
    expect(mocks.replace).toHaveBeenCalledWith("/donors", { scroll: false });
  });

  it("honours a link once, even if the page re-renders before the URL clears", async () => {
    mocks.search = "partner=gone";
    mocks.view.donors.all = [{ id: "avery" }];
    const { rerender } = render(<OpenPartnerFromLink />);
    await waitFor(() => expect(mocks.toastError).toHaveBeenCalledTimes(1));
    mocks.view.donors.all = [{ id: "avery" }];
    rerender(<OpenPartnerFromLink />);
    expect(mocks.toastError).toHaveBeenCalledTimes(1);
    expect(mocks.replace).toHaveBeenCalledTimes(1);
  });

  it("does nothing while the list loads, or on a plain visit", () => {
    mocks.search = "partner=grace";
    mocks.view.status.isLoading = true;
    const { unmount } = render(<OpenPartnerFromLink />);
    unmount();
    mocks.search = "";
    mocks.view.status.isLoading = false;
    render(<OpenPartnerFromLink />);
    expect(mocks.selectById).not.toHaveBeenCalled();
    expect(mocks.loadMore).not.toHaveBeenCalled();
    expect(mocks.replace).not.toHaveBeenCalled();
  });
});
