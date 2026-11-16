// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) Round 12: the settings list is exercised at its public UI boundary.
import { SavedViewsList } from "../../../../../../../apps/admin/features/support-hub/components/settings/saved-views/SavedViewsList";

// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) Round 12: fixtures use the app's public wire-format types.
import type { SupportSavedView } from "../../../../../../../apps/admin/features/support-hub/types";

const hooks = vi.hoisted(() => ({
  views: [] as SupportSavedView[],
  access: { agentId: null as string | null, canManageAll: false },
  isLoading: false,
  isError: false,
  confirm: (() => Promise.resolve(false)) as (
    options: unknown,
  ) => Promise<boolean>,
}));
const toasts = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
}));

vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-saved-views",
  () => ({
    useSupportSavedViews: () => ({
      data: hooks.views,
      access: hooks.access,
      isLoading: hooks.isLoading,
      isError: hooks.isError,
      isReady: !hooks.isLoading && !hooks.isError,
      refetch: vi.fn(),
    }),
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-mutations",
  () => ({
    useDeleteSupportSavedView: () => ({
      mutateAsync: vi.fn(),
      isPending: false,
    }),
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-agents",
  () => ({
    useSupportAgents: () => ({
      data: [
        {
          id: "agent-david",
          name: "David",
          email: "david@example.org",
          avatarUrl: null,
          title: null,
        },
        {
          id: "agent-emily",
          name: "Emily",
          email: "emily@example.org",
          avatarUrl: null,
          title: null,
        },
      ],
      isLoading: false,
      isError: false,
      isReady: true,
      refetch: vi.fn(),
    }),
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/components/workspace/confirm-provider",
  () => ({ useConfirm: () => hooks.confirm }),
);
vi.mock("sonner", () => ({ toast: toasts }));

function view(
  id: string,
  name: string,
  scope: SupportSavedView["scope"],
  ownerAgentId: string | null,
): SupportSavedView {
  return {
    id,
    tenantId: "tenant-1",
    name,
    slug: id,
    scope,
    ownerAgentId,
    filter: {
      view: "mine",
      layout: "table",
      status: "open",
      q: "",
      labelSlugs: [],
      assignee: "",
    },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  } as SupportSavedView;
}

const MY_OPEN_HREF = "/support?view=mine&layout=table&status=open";

beforeEach(() => {
  hooks.isLoading = false;
  hooks.isError = false;
  hooks.access = { agentId: "agent-david", canManageAll: false };
  hooks.confirm = vi.fn().mockResolvedValue(false);
  toasts.success.mockReset();
  toasts.error.mockReset();
  hooks.views = [
    view("mine", "My open", "personal", "agent-david"),
    view("theirs", "Emily only", "personal", "agent-emily"),
    view("shared", "Team queue", "workspace", null),
  ];
});
afterEach(cleanup);

async function menuItemsFor(name: string): Promise<string[]> {
  fireEvent.click(screen.getByRole("button", { name: `Actions for ${name}` }));
  const menu = await screen.findByRole("menu");
  const items = within(menu)
    .getAllByRole("menuitem")
    .map((item) => item.textContent?.trim() ?? "");
  fireEvent.keyDown(menu, { key: "Escape" });
  await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  return items;
}

describe("Saved views settings access", () => {
  it("offers Delete only on the agent's own personal view", async () => {
    render(<SavedViewsList />);
    expect(screen.getByRole("button", { name: "Delete My open" })).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: "Delete Emily only" }),
    ).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Delete Team queue" }),
    ).toBeNull();
    expect(await menuItemsFor("My open")).toEqual([
      "Open in inbox",
      "Copy link",
    ]);
    expect(await menuItemsFor("Emily only")).toEqual([
      "Open in inbox",
      "Copy link",
    ]);
    expect(await menuItemsFor("Team queue")).toEqual([
      "Open in inbox",
      "Copy link",
    ]);
  });

  it("lets a support admin delete any view", async () => {
    hooks.access = { agentId: null, canManageAll: true };
    render(<SavedViewsList />);
    for (const name of ["My open", "Emily only", "Team queue"]) {
      expect(
        screen.getByRole("button", { name: `Delete ${name}` }),
      ).toBeTruthy();
    }
  });

  it("asks before deleting, naming the view", async () => {
    render(<SavedViewsList />);
    fireEvent.click(screen.getByRole("button", { name: "Delete My open" }));
    await waitFor(() => expect(hooks.confirm).toHaveBeenCalledOnce());
    expect(vi.mocked(hooks.confirm).mock.calls[0]?.[0]).toMatchObject({
      title: "Delete the My open view?",
    });
  });
});

describe("Saved views settings list", () => {
  it("links each view name, and Open in inbox, to the inbox with its filters", async () => {
    render(<SavedViewsList />);
    expect(
      screen.getByRole("link", { name: "My open" }).getAttribute("href"),
    ).toBe(MY_OPEN_HREF);
    fireEvent.click(
      screen.getByRole("button", { name: "Actions for My open" }),
    );
    const open = await screen.findByRole("menuitem", { name: "Open in inbox" });
    expect(open.getAttribute("href")).toBe(MY_OPEN_HREF);
  });

  it("describes filters in plain words, never raw keys", () => {
    render(<SavedViewsList />);
    expect(
      screen.getAllByText("My conversations · Open · Table layout"),
    ).toHaveLength(3);
    expect(screen.queryByText(/view:|status:|layout:/)).toBeNull();
  });

  it("names the scope, and the owner of someone else's personal view", () => {
    hooks.access = { agentId: "agent-david", canManageAll: true };
    render(<SavedViewsList />);
    expect(screen.getByText("Personal")).toBeTruthy();
    expect(screen.getByText("Personal · Emily")).toBeTruthy();
    expect(screen.getByText("Workspace")).toBeTruthy();
  });

  it("doesn't call personal views shared across the team", () => {
    render(<SavedViewsList />);
    expect(screen.queryByText(/shared across the team/)).toBeNull();
  });

  it("copies the view's full link", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    render(<SavedViewsList />);
    fireEvent.click(
      screen.getByRole("button", { name: "Actions for My open" }),
    );
    fireEvent.click(await screen.findByRole("menuitem", { name: "Copy link" }));
    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith(
        `${window.location.origin}${MY_OPEN_HREF}`,
      ),
    );
    expect(toasts.success).toHaveBeenCalledWith("Link copied.");
  });

  it("says when the link couldn't be copied", async () => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(new Error("denied")) },
    });
    render(<SavedViewsList />);
    fireEvent.click(
      screen.getByRole("button", { name: "Actions for My open" }),
    );
    fireEvent.click(await screen.findByRole("menuitem", { name: "Copy link" }));
    await waitFor(() => expect(toasts.error).toHaveBeenCalledOnce());
    expect(toasts.success).not.toHaveBeenCalled();
  });

  it("doesn't say there are no views while they load or after a failure", () => {
    hooks.views = [];
    hooks.isLoading = true;
    const { rerender } = render(<SavedViewsList />);
    expect(screen.queryByText("No saved views yet")).toBeNull();
    hooks.isLoading = false;
    hooks.isError = true;
    rerender(<SavedViewsList />);
    expect(screen.queryByText("No saved views yet")).toBeNull();
    expect(screen.getByText("Couldn’t load saved views")).toBeTruthy();
  });
});
