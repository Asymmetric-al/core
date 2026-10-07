/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TeamList } from "../../../../apps/admin/features/support-hub/components/settings/collaborators/TeamList";
const { save } = vi.hoisted(() => ({
  save: vi.fn().mockResolvedValue("team-b"),
}));
vi.mock(
  "../../../../apps/admin/features/support-hub/hooks/use-support-agents",
  () => ({
    useSupportTeams: () => ({
      data: [
        {
          id: "team-a",
          name: "Alpha",
          slug: "alpha",
          initials: "AA",
          description: "First team",
        },
        {
          id: "team-b",
          name: "Beta",
          slug: "beta",
          initials: "BB",
          description: "Second team",
        },
      ],
    }),
  }),
);
vi.mock(
  "../../../../apps/admin/features/support-hub/hooks/use-support-mutations",
  () => ({
    useSaveSupportTeam: () => ({ mutateAsync: save, isPending: false }),
    useDeleteSupportTeam: () => ({ mutateAsync: vi.fn(), isPending: false }),
  }),
);
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
describe("support team draft ownership", () => {
  it("starts the second team's own draft when selection changes and saves its own slug", async () => {
    const view = render(<TeamList />);
    fireEvent.click(view.getByRole("button", { name: "Edit Alpha" }));
    fireEvent.change(view.getByLabelText("Name"), {
      target: { value: "Unfinished Alpha draft" },
    });
    fireEvent.click(view.getByRole("button", { name: "Edit Beta" }));
    expect(view.getByLabelText("Name")).toHaveProperty("value", "Beta");
    expect(view.getByLabelText("Initials")).toHaveProperty("value", "BB");
    fireEvent.click(view.getByRole("button", { name: "Save changes" }));
    await waitFor(() =>
      expect(save).toHaveBeenCalledWith({
        id: "team-b",
        name: "Beta",
        slug: "beta",
        initials: "BB",
        description: "Second team",
      }),
    );
  });
  it("starts an empty new-team draft after leaving an edited record", () => {
    const view = render(<TeamList />);
    fireEvent.click(view.getByRole("button", { name: "Edit Alpha" }));
    fireEvent.change(view.getByLabelText("Name"), {
      target: { value: "Unfinished Alpha draft" },
    });
    fireEvent.click(view.getByRole("button", { name: "New team" }));
    expect(view.getByLabelText("Name")).toHaveProperty("value", "");
  });
});
