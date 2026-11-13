// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { InboxToolbar } from "../../../../../../../apps/admin/features/support-hub/components/toolbar/InboxToolbar";
import { RelativeTime } from "../../../../../../../apps/admin/features/support-hub/components/RelativeTime";
const mocks = vi.hoisted(() => ({
  setState: vi.fn(),
  state: {
    q: "donor",
    status: "open",
    labelSlugs: ["care"],
    assignee: "me",
    view: "mine",
    layout: "table",
  },
}));
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/lib/route-state",
  () => ({ useSupportInboxState: () => mocks }),
);
vi.mock("../../../../../../../apps/admin/features/support-hub/lib/now", () => ({
  useSupportNow: () => "2026-11-11T12:00:00.000Z",
}));
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/components/toolbar/AssigneeFilter",
  () => ({ AssigneeFilter: () => null }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/components/toolbar/LabelFilter",
  () => ({ LabelFilter: () => null }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/components/toolbar/StatusFilter",
  () => ({ StatusFilter: () => null }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/components/toolbar/LayoutToggle",
  () => ({ LayoutToggle: () => null }),
);
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
describe("Inbox refinements", () => {
  it("clears every facet in one update without changing layout or view", () => {
    render(<InboxToolbar />);
    fireEvent.click(screen.getByRole("button", { name: "Reset filters" }));
    expect(mocks.setState).toHaveBeenCalledWith({
      q: "",
      status: "all",
      labelSlugs: [],
      assignee: "",
    });
    expect(mocks.setState).toHaveBeenCalledTimes(1);
  });
  it("keeps native time semantics, an exact date tooltip and directional context", () => {
    const { container, rerender } = render(
      <RelativeTime value="2026-11-11T09:00:00.000Z" />,
    );
    expect(container.querySelector("time")?.textContent).toBe("3h ago");
    expect(container.querySelector("time")?.dateTime).toBe(
      "2026-11-11T09:00:00.000Z",
    );
    expect(
      container.querySelector("time")?.getAttribute("aria-label"),
    ).toBeNull();
    expect(container.querySelector("time")?.title).toContain("2026");
    rerender(<RelativeTime value="2026-11-13T12:00:00.000Z" compact />);
    expect(container.querySelector("time")?.textContent).toBe("2d");
    expect(container.querySelector("time")?.title).toContain("2026");
  });
});
