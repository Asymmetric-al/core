/** @vitest-environment jsdom */

import {
  getNavItemsByRole,
  getNavSectionsByRole,
} from "@asym/config/navigation";
import { createMCBootstrapState } from "@asym/lib/mission-control/bootstrap";
import { MCProvider } from "@asym/lib/mission-control/context";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import CareProfilePage from "../../../../../../apps/admin/app/(app)/care/directory/[id]/page-client";
import CareDirectoryPage from "../../../../../../apps/admin/app/(app)/care/directory/page-client";
import MemberCareDashboardPage from "../../../../../../apps/admin/app/(app)/care/page-client";
import CareSettingsPage from "../../../../../../apps/admin/app/(app)/care/settings/page-client";
import { MissionControlNavigationSearch } from "../../../../../../apps/admin/features/mission-control/components/navigation-search";
import { MissionControlHome } from "../../../../../../apps/admin/features/mission-control/components/tiles/mission-control-home";

const hooks = vi.hoisted(() => ({
  useCareDashboard: vi.fn(),
  useCarePersonnel: vi.fn(),
  useMemberCareDetailQuery: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "missionary-1" }),
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("@asym/database/hooks", () => ({
  useCareDashboard: hooks.useCareDashboard,
  useCarePersonnel: hooks.useCarePersonnel,
  useMemberCareDetailQuery: hooks.useMemberCareDetailQuery,
  useMissionControlNeedsAttention: () => ({
    data: undefined,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useUnreviewedWorkersCount: () => ({
    data: 0,
    isPending: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useCareProfile: vi.fn(),
  useCareActivity: vi.fn(),
  useCarePrivateNotes: vi.fn(),
  useCreateCareThreadPost: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useCreateCarePrivateNote: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useCreatePrivateNote: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useCreateOrUpdateCareGoal: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useLogCareActivity: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useUpsertCareRequirement: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useSetManualAttentionFlag: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useLogActivity: () => ({ isPending: false, mutateAsync: vi.fn() }),
}));

vi.mock("@asym/auth/client-session", () => ({
  subscribeToClientAuthState: () => () => undefined,
  signOutClientSession: vi.fn(),
}));

function renderWithBootstrap(
  ui: React.ReactNode,
  opts: { role: string; capabilities: string[] },
) {
  const initialState = createMCBootstrapState({
    userId: "user-1",
    tenantId: "tenant-1",
    email: "staff@example.test",
    firstName: "Staff",
    lastName: "User",
    role: opts.role,
    capabilities: opts.capabilities,
    tenant: { id: "tenant-1", name: "Test Org", slug: "test-org" },
  } as Parameters<typeof createMCBootstrapState>[0]);

  return render(<MCProvider initialState={initialState}>{ui}</MCProvider>);
}

beforeEach(() => {
  vi.clearAllMocks();
  hooks.useCareDashboard.mockReturnValue({
    isLoading: false,
    isError: false,
    data: {
      personnel: [],
      personnelTotal: 0,
      activities: [],
      requirements: [],
      goals: [],
      lastContacts: {},
    },
    refetch: vi.fn(),
  });
  hooks.useCarePersonnel.mockReturnValue({
    isLoading: false,
    isError: false,
    data: [],
    personnelTotal: 0,
    activities: [],
    requirements: [],
    lastContacts: {},
    refetch: vi.fn(),
  });
  hooks.useMemberCareDetailQuery.mockReturnValue({
    isPending: false,
    isError: false,
    data: null,
    refetch: vi.fn(),
  });
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
    configurable: true,
    value: vi.fn(),
  });
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("Member Care capability-aware navigation and Home (W4b-R14)", () => {
  it("hides Care from development admin without care.access and shows Care to non-admin member_care worker", () => {
    const adminIds = (
      getNavItemsByRole as (
        role: "admin" | "staff",
        capabilities?: readonly string[],
      ) => ReturnType<typeof getNavItemsByRole>
    )("admin", ["admin.dashboard.access"]).map((item) => item.id);
    expect(adminIds).not.toContain("care");

    const careWorkerIds = (
      getNavSectionsByRole as (
        role: "admin" | "staff",
        capabilities?: readonly string[],
      ) => ReturnType<typeof getNavSectionsByRole>
    )("staff", ["admin.dashboard.access", "care.access"]).flatMap((group) =>
      group.items.map((item) => item.id),
    );
    expect(careWorkerIds).toContain("care");
  });

  it("gates navigation search results on care.access", async () => {
    const Search = MissionControlNavigationSearch as React.ComponentType<{
      role: "admin" | "staff";
      capabilities?: readonly string[];
      onNavigate: (href: string) => void;
    }>;

    const adminView = render(
      <Search
        role="admin"
        capabilities={["admin.dashboard.access"]}
        onNavigate={vi.fn()}
      />,
    );
    fireEvent.click(
      adminView.getAllByRole("button", {
        name: "Open Mission Control search",
      })[0]!,
    );
    const adminInput = await adminView.findByRole("combobox", {
      name: "Search Mission Control pages",
    });
    fireEvent.change(adminInput, { target: { value: "Member Care" } });
    expect(adminView.queryByRole("option", { name: /Member Care/ })).toBeNull();
    cleanup();

    const careView = render(
      <Search
        role="staff"
        capabilities={["admin.dashboard.access", "care.access"]}
        onNavigate={vi.fn()}
      />,
    );
    fireEvent.click(
      careView.getAllByRole("button", {
        name: "Open Mission Control search",
      })[0]!,
    );
    const careInput = await careView.findByRole("combobox", {
      name: "Search Mission Control pages",
    });
    fireEvent.change(careInput, { target: { value: "Member Care" } });
    expect(
      await careView.findByRole("option", { name: "Member Care" }),
    ).toBeTruthy();
  });

  it("hides Member Care tile and workflow for admin without care.access and shows them for staff with care.access", () => {
    renderWithBootstrap(<MissionControlHome />, {
      role: "admin",
      capabilities: ["admin.dashboard.access"],
    });
    const adminModules = screen.getByRole("list", {
      name: "Workspace modules",
    });
    expect(
      within(adminModules).queryByRole("link", { name: /Member Care/ }),
    ).toBeNull();
    expect(
      screen.queryByRole("link", { name: /Follow up on member care/ }),
    ).toBeNull();
    cleanup();

    renderWithBootstrap(<MissionControlHome />, {
      role: "staff",
      capabilities: ["admin.dashboard.access", "care.access"],
    });
    const staffModules = screen.getByRole("list", {
      name: "Workspace modules",
    });
    expect(
      within(staffModules).getByRole("link", { name: /Open Member Care/ }),
    ).toBeTruthy();
    expect(
      screen.getByRole("link", { name: /Follow up on member care/ }),
    ).toBeTruthy();
    const quickSection = screen
      .getByRole("heading", { name: "Quick actions" })
      .closest("section")!;
    expect(
      within(quickSection).getByRole("link", { name: "Open Member Care" }),
    ).toBeTruthy();
  });
});

describe("Member Care pages no-access state (W4b-R14)", () => {
  const pages: Array<[string, () => React.ReactNode]> = [
    ["/care", () => <MemberCareDashboardPage />],
    ["/care/directory", () => <CareDirectoryPage />],
    ["/care/directory/[id]", () => <CareProfilePage />],
    ["/care/settings", () => <CareSettingsPage />],
  ];

  it.each(pages)(
    "renders explicit no-access state on %s without care.access and makes zero care data queries",
    (_route, makePage) => {
      renderWithBootstrap(makePage(), {
        role: "admin",
        capabilities: ["admin.dashboard.access"],
      });

      const note = screen.getByRole("note");
      expect(note.textContent).toMatch(/Member Care/i);
      const homeLink = within(note).getByRole("link", { name: "Go to home" });
      expect(homeLink.getAttribute("href")).toBe("/");
      expect(
        screen.queryByText(/Check your connection and try again/i),
      ).toBeNull();
      expect(screen.queryByRole("button", { name: /Try again/i })).toBeNull();
      expect(hooks.useCareDashboard).not.toHaveBeenCalled();
      expect(hooks.useCarePersonnel).not.toHaveBeenCalled();
      expect(hooks.useMemberCareDetailQuery).not.toHaveBeenCalled();
    },
  );

  it("renders explicit no-access state on mid-session 403 error across dashboard, directory, and profile", () => {
    const forbidden = Object.assign(new Error("Forbidden"), { status: 403 });

    hooks.useCareDashboard.mockReturnValue({
      isLoading: false,
      isError: true,
      error: forbidden,
      refetch: vi.fn(),
    });
    renderWithBootstrap(<MemberCareDashboardPage />, {
      role: "staff",
      capabilities: ["admin.dashboard.access", "care.access"],
    });
    expect(screen.getByRole("note").textContent).toMatch(/Member Care/i);
    expect(
      screen.queryByText(/Check your connection and try again/i),
    ).toBeNull();
    expect(screen.queryByRole("button", { name: /Try again/i })).toBeNull();
    cleanup();

    hooks.useCarePersonnel.mockReturnValue({
      isLoading: false,
      isError: true,
      error: forbidden,
      data: [],
      personnelTotal: 0,
      activities: [],
      requirements: [],
      lastContacts: {},
      refetch: vi.fn(),
    });
    renderWithBootstrap(<CareDirectoryPage />, {
      role: "staff",
      capabilities: ["admin.dashboard.access", "care.access"],
    });
    expect(screen.getByRole("note").textContent).toMatch(/Member Care/i);
    expect(
      screen.queryByText(/Check your connection and try again/i),
    ).toBeNull();
    expect(screen.queryByRole("button", { name: /Try again/i })).toBeNull();
    cleanup();

    hooks.useMemberCareDetailQuery.mockReturnValue({
      isPending: false,
      isError: true,
      error: forbidden,
      data: undefined,
      refetch: vi.fn(),
    });
    renderWithBootstrap(<CareProfilePage />, {
      role: "staff",
      capabilities: ["admin.dashboard.access", "care.access"],
    });
    expect(screen.getByRole("note").textContent).toMatch(/Member Care/i);
    expect(
      screen.queryByText(/Check your connection and try again/i),
    ).toBeNull();
    expect(screen.queryByRole("button", { name: /Try again/i })).toBeNull();
  });
});
