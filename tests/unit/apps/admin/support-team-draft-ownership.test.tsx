/** @vitest-environment jsdom */
import {
  cleanup,
  fireEvent,
  render,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AgentsList } from "../../../../apps/admin/features/support-hub/components/settings/collaborators/AgentsList";
import { TeamList } from "../../../../apps/admin/features/support-hub/components/settings/collaborators/TeamList";
const { save, confirm } = vi.hoisted(() => ({
  save: vi.fn().mockResolvedValue("team-b"),
  confirm: vi.fn().mockResolvedValue(true),
}));
vi.mock(
  "../../../../apps/admin/features/support-hub/hooks/use-support-agents",
  () => ({
    useSupportAgents: () => ({
      data: [
        {
          id: "agent-1",
          name: "sam lee",
          email: "sam@example.org",
          title: null,
          avatarUrl: null,
        },
        {
          id: "agent-2",
          name: "Ana Ruiz",
          email: "ana@example.org",
          title: "Care coordinator",
          avatarUrl: null,
        },
      ],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    }),
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
vi.mock(
  "../../../../apps/admin/features/support-hub/components/workspace/confirm-provider",
  () => ({ useConfirm: () => confirm }),
);
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
describe("support team draft ownership", () => {
  async function discardEdit(view: ReturnType<typeof render>) {
    fireEvent.click(
      within(view.getByRole("dialog")).getByRole("button", { name: "Cancel" }),
    );
    const prompt = await view.findByRole("alertdialog", {
      name: "Discard unsaved changes?",
    });
    fireEvent.click(
      within(prompt).getByRole("button", { name: "Discard changes" }),
    );
    await waitFor(() => expect(view.queryByRole("dialog")).toBeNull());
  }

  it("starts the second team's own draft when selection changes and saves its own slug", async () => {
    const view = render(<TeamList />);
    fireEvent.click(view.getByRole("button", { name: "Edit Alpha" }));
    fireEvent.change(view.getByLabelText("Name"), {
      target: { value: "Unfinished Alpha draft" },
    });
    await discardEdit(view);
    fireEvent.click(view.getByRole("button", { name: "Edit Beta" }));
    expect(view.getByLabelText("Name")).toHaveProperty("value", "Beta");
    expect(view.getByLabelText("Initials")).toHaveProperty("value", "BB");
    // Nothing changed yet, so there is nothing to save.
    expect(
      view
        .getByRole("button", { name: "Save changes" })
        .hasAttribute("disabled"),
    ).toBe(true);
    fireEvent.change(view.getByLabelText("Description"), {
      target: { value: "Second team, renamed" },
    });
    fireEvent.click(view.getByRole("button", { name: "Save changes" }));
    await waitFor(() =>
      expect(save).toHaveBeenCalledWith({
        id: "team-b",
        name: "Beta",
        slug: "beta",
        initials: "BB",
        description: "Second team, renamed",
      }),
    );
  });
  it("starts an empty new-team draft after leaving an edited record", async () => {
    const view = render(<TeamList />);
    fireEvent.click(view.getByRole("button", { name: "Edit Alpha" }));
    fireEvent.change(view.getByLabelText("Name"), {
      target: { value: "Unfinished Alpha draft" },
    });
    await discardEdit(view);
    fireEvent.click(view.getByRole("button", { name: "New team" }));
    expect(view.getByLabelText("Name")).toHaveProperty("value", "");
  });
  it("never sends an empty slug when a new team's name has no Latin letters", async () => {
    const view = render(<TeamList />);
    fireEvent.click(view.getByRole("button", { name: "New team" }));
    fireEvent.change(view.getByLabelText("Name"), {
      target: { value: "日本チーム" },
    });
    fireEvent.click(view.getByRole("button", { name: "Create team" }));
    await waitFor(() => expect(save).toHaveBeenCalledOnce());
    const [input] = save.mock.calls[0] as [{ slug: string; name: string }];
    expect(input.name).toBe("日本チーム");
    expect(input.slug).toMatch(/^team-[0-9a-f]{8}$/);
  });
});

describe("support collaborators", () => {
  it("lists collaborators without inventing a job title", () => {
    const view = render(<AgentsList />);
    expect(view.getByText("sam@example.org")).toBeTruthy();
    expect(view.getByText("Care coordinator · ana@example.org")).toBeTruthy();
    expect(view.queryByText(/Support team member/)).toBeNull();
    expect(view.queryByText(/Roles are managed/)).toBeNull();
    // Initials read as initials even when a name is lower case.
    expect(view.getByText("SL")).toBeTruthy();
  });
});
