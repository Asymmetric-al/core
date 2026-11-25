/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import TeamsPage from "../../../../../apps/admin/app/(app)/settings/teams/page-client";
import {
  QueryClient,
  QueryClientProvider,
} from "../../../../../apps/admin/node_modules/@tanstack/react-query/build/modern/index.js";

const workspace = vi.hoisted(() => ({
  role: "admin" as string,
  canManageMembers: true as boolean | undefined,
  currentMembershipId: "m-self" as string | null,
  userId: "u-self" as string | null,
  pathname: "/00000000-0000-4000-8000-000000000001/settings/teams",
}));

vi.mock("@asym/auth/tenant-navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@asym/auth/tenant-navigation")>()),
  useRoutePathname: () => workspace.pathname,
}));

vi.mock("@asym/lib/mission-control/context", () => ({
  useMC: () => ({
    role: workspace.role,
    canManageMembers: workspace.canManageMembers,
    currentMembershipId: workspace.currentMembershipId,
    user: workspace.userId ? { id: workspace.userId } : null,
  }),
}));

const fetchMock = vi.fn();
let client: QueryClient;

beforeEach(() => {
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset().mockImplementation(async (url: string) => {
    if (String(url).startsWith("/api/admin/members/invitations")) {
      return { ok: true, json: async () => ({ invitations: [] }) };
    }
    return { ok: true, json: async () => ({ users: [] }) };
  });
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  vi.stubGlobal("matchMedia", (media: string) => ({
    media,
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  }));
});

afterEach(() => {
  cleanup();
  client.clear();
  window.localStorage.clear();
  window.sessionStorage.clear();
  workspace.role = "admin";
  workspace.canManageMembers = true;
  workspace.currentMembershipId = "m-self";
  workspace.userId = "u-self";
  workspace.pathname = "/00000000-0000-4000-8000-000000000001/settings/teams";
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

function show() {
  return render(
    <QueryClientProvider client={client}>
      <TeamsPage />
    </QueryClientProvider>,
  );
}

describe("Members screen", () => {
  it("renders the Members heading, lists staff and missionaries keyed by membership_id, and never collapses multi-row people", async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (String(url).startsWith("/api/admin/members/invitations")) {
        return { ok: true, json: async () => ({ invitations: [] }) };
      }
      return {
        ok: true,
        json: async () => ({
          users: [
            {
              id: "u-dual",
              membership_id: "m-dual-fin",
              display_name: "Alex Dual",
              email: "alex@example.org",
              role: "staff",
              staff_role: "finance",
              is_tenant_admin: false,
              updated_at: "2026-11-23T09:00:00.000Z",
            },
            {
              id: "u-dual",
              membership_id: "m-dual-miss",
              display_name: "Alex Dual",
              email: "alex@example.org",
              role: "missionary",
              staff_role: null,
              is_tenant_admin: false,
              updated_at: "2026-11-23T09:00:01.000Z",
            },
            {
              id: "u-self",
              membership_id: "m-self",
              display_name: "Ada Admin",
              email: "ada@example.org",
              role: "admin",
              staff_role: "development",
              is_tenant_admin: true,
              updated_at: "2026-11-23T09:00:02.000Z",
            },
          ],
        }),
      };
    });

    const view = show();
    expect(
      view.getByRole("heading", { level: 1, name: "Members" }),
    ).toBeTruthy();

    const dualCells = await view.findAllByText("Alex Dual");
    expect(dualCells.length).toBe(2);
    expect(view.getByText("Finance")).toBeTruthy();
    expect(view.getByText("Missionary")).toBeTruthy();
    expect(view.getByText("Administrator")).toBeTruthy();
    expect(view.getByText("Fundraising")).toBeTruthy();
    expect(view.getByRole("button", { name: /invite member/i })).toBeTruthy();
    expect(view.getByRole("button", { name: /give up admin/i })).toBeTruthy();
  });

  it("R3: lets a non-administrator staff member view the Members list read-only with zero management controls and zero invitation fetches", async () => {
    workspace.role = "finance";
    workspace.canManageMembers = false;
    workspace.currentMembershipId = "m-fin";

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        users: [
          {
            id: "u-1",
            membership_id: "m-1",
            display_name: "Zoe Staff",
            email: "zoe@example.org",
            role: "staff",
            staff_role: "development",
            is_tenant_admin: false,
            updated_at: "2026-11-23T09:00:00.000Z",
          },
        ],
      }),
    });

    const view = show();
    expect(await view.findByText("Zoe Staff")).toBeTruthy();
    expect(view.queryByRole("button", { name: /invite member/i })).toBeNull();
    expect(view.queryByRole("button", { name: /change role/i })).toBeNull();
    expect(view.queryByRole("button", { name: /revoke/i })).toBeNull();
    expect(
      view.queryByRole("heading", { name: "Pending invitations" }),
    ).toBeNull();
    expect(
      fetchMock.mock.calls.some(([url]) =>
        String(url).includes("/api/admin/members/invitations"),
      ),
    ).toBe(false);
    expect(view.getByRole("note").textContent).toContain("Read-only directory");
  });

  it("R13: shows exact one-time notice with Copy control, marks replay block, clears on dismiss/navigation/reload, and stores nothing in browser storage or query cache", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    fetchMock.mockImplementation(async (url: string, init?: RequestInit) => {
      if (
        String(url) === "/api/admin/members/invitations" &&
        init?.method === "POST"
      ) {
        return {
          ok: true,
          json: async () => ({
            invitation: {
              invitation_id: "inv-1",
              expires_at: "2026-11-30T00:00:00.000Z",
              role: "staff",
              staff_role: "finance",
              is_tenant_admin: false,
            },
            invitePath: "/invite/selector123#verifier456",
          }),
        };
      }
      if (String(url).startsWith("/api/admin/members/invitations")) {
        return {
          ok: true,
          json: async () => ({
            invitations: [
              {
                id: "inv-1",
                tenant_id: "t-1",
                email: "new-staff@example.org",
                role: "staff",
                staff_role: "finance",
                is_tenant_admin: false,
                purpose: "member_invite",
                delivery_mode: "email",
                status: "issued",
                expires_at: "2099-01-01T00:00:00.000Z",
                created_at: "2026-11-23T09:00:00.000Z",
              },
            ],
          }),
        };
      }
      return { ok: true, json: async () => ({ users: [] }) };
    });

    const view = show();
    await view.findByText("No members found");
    fireEvent.click(view.getByRole("button", { name: /invite member/i }));

    fireEvent.change(view.getByLabelText("Email address"), {
      target: { value: "new-staff@example.org" },
    });
    fireEvent.change(view.getByLabelText("Reason"), {
      target: { value: "New staff hire" },
    });
    fireEvent.click(view.getByRole("button", { name: /create invitation/i }));

    const linkInput = (await view.findByLabelText(
      "Invitation link",
    )) as HTMLInputElement;
    expect(linkInput.value).toBe(
      `${window.location.origin}/invite/selector123#verifier456`,
    );
    expect(linkInput.closest("[data-sentry-block]")).not.toBeNull();
    expect(
      view.getByText(
        "No email was sent. Copy this link now; it cannot be shown again.",
      ),
    ).toBeTruthy();

    fireEvent.click(view.getByRole("button", { name: /copy link/i }));
    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(
        `${window.location.origin}/invite/selector123#verifier456`,
      );
    });

    fireEvent.click(view.getByRole("button", { name: /^done$/i }));
    await waitFor(() => {
      expect(view.queryByLabelText("Invitation link")).toBeNull();
    });
    fireEvent.click(view.getByRole("button", { name: /invite member/i }));
    expect(view.queryByLabelText("Invitation link")).toBeNull();

    fireEvent.change(view.getByLabelText("Email address"), {
      target: { value: "nav-clear@example.org" },
    });
    fireEvent.change(view.getByLabelText("Reason"), {
      target: { value: "Navigation clear proof" },
    });
    fireEvent.click(view.getByRole("button", { name: /create invitation/i }));
    await view.findByLabelText("Invitation link");

    workspace.pathname = "/00000000-0000-4000-8000-000000000001/crm";
    view.rerender(
      <QueryClientProvider client={client}>
        <TeamsPage />
      </QueryClientProvider>,
    );
    await waitFor(() => {
      expect(view.queryByLabelText("Invitation link")).toBeNull();
    });

    view.unmount();
    workspace.pathname = "/00000000-0000-4000-8000-000000000001/settings/teams";
    const reloaded = show();
    await reloaded.findByText("new-staff@example.org");
    expect(reloaded.queryByLabelText("Invitation link")).toBeNull();
    expect(reloaded.container.textContent).not.toContain("verifier456");
    expect(reloaded.container.textContent).not.toContain("selector123");

    const storageDump = JSON.stringify({
      local: Object.entries(window.localStorage),
      session: Object.entries(window.sessionStorage),
      cookies: document.cookie,
      queries: client
        .getQueryCache()
        .getAll()
        .map((q) => q.state.data),
    });
    expect(storageDump).not.toContain("verifier456");
    expect(storageDump).not.toContain("selector123");
  });

  it("ignores an invitation response that resolves after Cancel during Creating and never shows its link on reopen", async () => {
    let resolveInvite!: (value: unknown) => void;
    const pendingInvite = new Promise((resolve) => {
      resolveInvite = resolve;
    });

    fetchMock.mockImplementation(async (url: string, init?: RequestInit) => {
      if (
        String(url) === "/api/admin/members/invitations" &&
        init?.method === "POST"
      ) {
        return pendingInvite;
      }
      if (String(url).startsWith("/api/admin/members/invitations")) {
        return { ok: true, json: async () => ({ invitations: [] }) };
      }
      return { ok: true, json: async () => ({ users: [] }) };
    });

    const view = show();
    await view.findByText("No members found");
    fireEvent.click(view.getByRole("button", { name: /invite member/i }));

    fireEvent.change(view.getByLabelText("Email address"), {
      target: { value: "late-response@example.org" },
    });
    fireEvent.change(view.getByLabelText("Reason"), {
      target: { value: "Dismissed before response" },
    });
    fireEvent.click(view.getByRole("button", { name: /create invitation/i }));

    await view.findByRole("button", { name: /creating/i });
    fireEvent.click(view.getByRole("button", { name: /^cancel$/i }));

    resolveInvite({
      ok: true,
      json: async () => ({
        invitation: {
          invitation_id: "inv-late-1",
          expires_at: "2026-11-30T00:00:00.000Z",
          role: "staff",
          staff_role: "development",
          is_tenant_admin: false,
        },
        invitePath: "/invite/late-selector#late-verifier",
      }),
    });
    await new Promise((resolve) => setTimeout(resolve, 20));

    fireEvent.click(view.getByRole("button", { name: /invite member/i }));
    const emailInput = (await view.findByLabelText(
      "Email address",
    )) as HTMLInputElement;
    expect(emailInput.value).toBe("");
    expect(view.queryByLabelText("Invitation link")).toBeNull();
    expect(
      view.queryByLabelText("Missionary workspace invitation path"),
    ).toBeNull();
    expect(
      view.queryByText(
        "No email was sent. Copy this link now; it cannot be shown again.",
      ),
    ).toBeNull();
    expect(
      view.queryByRole("button", { name: /copy link|copy path/i }),
    ).toBeNull();
    expect(document.body.textContent ?? "").not.toContain("late-selector");
    expect(document.body.textContent ?? "").not.toContain("late-verifier");
  });

  it("R18a: labels a missionary invitation as the path on the missionary workspace address and copies only the path", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    fetchMock.mockImplementation(async (url: string, init?: RequestInit) => {
      if (
        String(url) === "/api/admin/members/invitations" &&
        init?.method === "POST"
      ) {
        return {
          ok: true,
          json: async () => ({
            invitation: {
              invitation_id: "inv-miss-1",
              expires_at: "2026-11-30T00:00:00.000Z",
              role: "missionary",
              staff_role: null,
              is_tenant_admin: false,
            },
            invitePath: "/invite/miss-selector#miss-verifier",
          }),
        };
      }
      if (String(url).startsWith("/api/admin/members/invitations")) {
        return { ok: true, json: async () => ({ invitations: [] }) };
      }
      return { ok: true, json: async () => ({ users: [] }) };
    });

    const view = show();
    await view.findByText("No members found");
    fireEvent.click(view.getByRole("button", { name: /invite member/i }));

    fireEvent.change(view.getByLabelText("Email address"), {
      target: { value: "missionary@example.org" },
    });
    fireEvent.change(view.getByLabelText("Reason"), {
      target: { value: "Missionary onboarding" },
    });
    fireEvent.click(view.getByRole("button", { name: /create invitation/i }));

    const pathInput = (await view.findByLabelText(
      "Missionary workspace invitation path",
    )) as HTMLInputElement;
    expect(pathInput.value).toBe("/invite/miss-selector#miss-verifier");
    expect(pathInput.value).not.toContain(window.location.origin);
    expect(pathInput.closest("[data-sentry-block]")).not.toBeNull();
    expect(
      view.getByText(/open this path on your missionary workspace address/i),
    ).toBeTruthy();

    fireEvent.click(view.getByRole("button", { name: /copy path/i }));
    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(
        "/invite/miss-selector#miss-verifier",
      );
    });
  });

  it("shows link copy without the cross-address hint for a missionary invitation when CORE_SERVE_UNDER_PATHS is on", async () => {
    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "1");
    vi.stubEnv("CORE_APP_BASE_PATH", "/admin");
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    fetchMock.mockImplementation(async (url: string, init?: RequestInit) => {
      if (
        String(url) === "/admin/api/admin/members/invitations" &&
        init?.method === "POST"
      ) {
        return {
          ok: true,
          json: async () => ({
            invitation: {
              invitation_id: "inv-miss-on-1",
              expires_at: "2026-11-30T00:00:00.000Z",
              role: "missionary",
              staff_role: null,
              is_tenant_admin: false,
            },
            invitePath: "/invite/miss-on-selector#miss-on-verifier",
          }),
        };
      }
      if (String(url).startsWith("/admin/api/admin/members/invitations")) {
        return { ok: true, json: async () => ({ invitations: [] }) };
      }
      return { ok: true, json: async () => ({ users: [] }) };
    });

    const view = show();
    await view.findByText("No members found");
    fireEvent.click(view.getByRole("button", { name: /invite member/i }));

    fireEvent.change(view.getByLabelText("Email address"), {
      target: { value: "missionary-on@example.org" },
    });
    fireEvent.change(view.getByLabelText("Reason"), {
      target: { value: "Missionary onboarding under paths" },
    });
    fireEvent.click(view.getByRole("button", { name: /create invitation/i }));

    const linkInput = (await view.findByLabelText(
      "Missionary workspace invitation link",
    )) as HTMLInputElement;
    expect(view.getByText("Missionary workspace invitation link")).toBeTruthy();
    expect(linkInput.getAttribute("aria-label")).toBe(
      "Missionary workspace invitation link",
    );
    expect(view.queryByText("Missionary workspace invitation path")).toBeNull();
    expect(
      view.queryByLabelText("Missionary workspace invitation path"),
    ).toBeNull();
    expect(linkInput.value).toBe(
      `${window.location.origin}/missionary/invite/miss-on-selector#miss-on-verifier`,
    );
    expect(
      view.queryByText(/open this path on your missionary workspace address/i),
    ).toBeNull();
    expect(view.queryByRole("button", { name: /copy path/i })).toBeNull();

    fireEvent.click(view.getByRole("button", { name: /^copy link$/i }));
    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(
        `${window.location.origin}/missionary/invite/miss-on-selector#miss-on-verifier`,
      );
    });
  });

  it("keeps staff invitation copy unchanged in both off and on modes while prefixing the address when on", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    fetchMock.mockImplementation(async (url: string, init?: RequestInit) => {
      const normalized = String(url);
      if (
        (normalized === "/api/admin/members/invitations" ||
          normalized === "/admin/api/admin/members/invitations") &&
        init?.method === "POST"
      ) {
        return {
          ok: true,
          json: async () => ({
            invitation: {
              invitation_id: "inv-staff-mode",
              expires_at: "2026-11-30T00:00:00.000Z",
              role: "staff",
              staff_role: "development",
              is_tenant_admin: false,
            },
            invitePath: "/invite/staff-sel#staff-ver",
          }),
        };
      }
      if (
        normalized.startsWith("/api/admin/members/invitations") ||
        normalized.startsWith("/admin/api/admin/members/invitations")
      ) {
        return { ok: true, json: async () => ({ invitations: [] }) };
      }
      return { ok: true, json: async () => ({ users: [] }) };
    });

    const offView = show();
    await offView.findByText("No members found");
    fireEvent.click(offView.getByRole("button", { name: /invite member/i }));
    fireEvent.change(offView.getByLabelText("Email address"), {
      target: { value: "staff-off@example.org" },
    });
    fireEvent.change(offView.getByLabelText("Reason"), {
      target: { value: "Staff off-mode check" },
    });
    fireEvent.click(
      offView.getByRole("button", { name: /create invitation/i }),
    );
    const offInput = (await offView.findByLabelText(
      "Invitation link",
    )) as HTMLInputElement;
    expect(offInput.value).toBe(
      `${window.location.origin}/invite/staff-sel#staff-ver`,
    );
    expect(offView.getByRole("button", { name: /^copy link$/i })).toBeTruthy();
    expect(
      offView.queryByText(
        /open this path on your missionary workspace address/i,
      ),
    ).toBeNull();
    cleanup();

    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "1");
    vi.stubEnv("CORE_APP_BASE_PATH", "/admin");
    const onView = show();
    await onView.findByText("No members found");
    fireEvent.click(onView.getByRole("button", { name: /invite member/i }));
    fireEvent.change(onView.getByLabelText("Email address"), {
      target: { value: "staff-on@example.org" },
    });
    fireEvent.change(onView.getByLabelText("Reason"), {
      target: { value: "Staff on-mode check" },
    });
    fireEvent.click(onView.getByRole("button", { name: /create invitation/i }));
    const onInput = (await onView.findByLabelText(
      "Invitation link",
    )) as HTMLInputElement;
    expect(onInput.value).toBe(
      `${window.location.origin}/admin/invite/staff-sel#staff-ver`,
    );
    expect(onView.getByRole("button", { name: /^copy link$/i })).toBeTruthy();
    expect(
      onView.queryByText(
        /open this path on your missionary workspace address/i,
      ),
    ).toBeNull();
  });

  it("lists pending invitations for admins, revokes one with a reason, and sends expectedUpdatedAt on role changes", async () => {
    const calls: Array<{ url: string; method: string; body: unknown }> = [];
    fetchMock.mockImplementation(async (url: string, init?: RequestInit) => {
      const method = init?.method ?? "GET";
      calls.push({
        url: String(url),
        method,
        body: init?.body ? JSON.parse(String(init.body)) : null,
      });
      if (
        String(url) === "/api/admin/members/invitations" &&
        method === "GET"
      ) {
        return {
          ok: true,
          json: async () => ({
            invitations: [
              {
                id: "inv-pending-1",
                tenant_id: "t-1",
                email: "pending@example.org",
                role: "missionary",
                staff_role: null,
                is_tenant_admin: false,
                purpose: "member_invite",
                delivery_mode: "email",
                status: "issued",
                expires_at: "2099-01-01T00:00:00.000Z",
                created_at: "2026-11-23T09:00:00.000Z",
              },
            ],
          }),
        };
      }
      if (
        String(url) === "/api/admin/members/invitations/inv-pending-1/revoke" &&
        method === "POST"
      ) {
        return {
          ok: true,
          json: async () => ({ result: { status: "revoked" } }),
        };
      }
      if (String(url) === "/api/admin/members/role" && method === "POST") {
        return { ok: true, json: async () => ({ result: { changed: true } }) };
      }
      return {
        ok: true,
        json: async () => ({
          users: [
            {
              id: "u-other",
              membership_id: "00000000-0000-4000-8000-00000000a0a3",
              display_name: "Sam Staff",
              email: "sam@example.org",
              role: "staff",
              staff_role: "finance",
              is_tenant_admin: false,
              updated_at: "2026-11-23T09:12:34.567890+00:00",
            },
          ],
        }),
      };
    });

    const view = show();
    expect(await view.findByText("pending@example.org")).toBeTruthy();

    fireEvent.click(
      view.getByRole("button", {
        name: "Revoke invitation for pending@example.org",
      }),
    );
    fireEvent.change(view.getByLabelText("Reason"), {
      target: { value: "Mistyped address" },
    });
    fireEvent.click(view.getByRole("button", { name: /^revoke invitation$/i }));
    await waitFor(() => {
      expect(
        calls.some(
          (c) =>
            c.url === "/api/admin/members/invitations/inv-pending-1/revoke" &&
            c.method === "POST",
        ),
      ).toBe(true);
    });
    await waitFor(() => {
      expect(view.queryByRole("dialog")).toBeNull();
    });

    fireEvent.click(
      view.getByRole("button", { name: "Change role for Sam Staff" }),
    );
    fireEvent.change(view.getByLabelText("Reason"), {
      target: { value: "Promote Sam" },
    });
    fireEvent.click(view.getByRole("button", { name: /save role/i }));

    await waitFor(() => {
      const roleCall = calls.find(
        (c) => c.url === "/api/admin/members/role" && c.method === "POST",
      );
      expect(roleCall?.body).toMatchObject({
        membershipId: "00000000-0000-4000-8000-00000000a0a3",
        expectedUpdatedAt: "2026-11-23T09:12:34.567890+00:00",
        reason: "Promote Sam",
      });
    });
  });

  it("offers no Change role or Revoke on any row of the signed-in person, and Give up admin only on the current administrator row", async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (String(url).startsWith("/api/admin/members/invitations")) {
        return { ok: true, json: async () => ({ invitations: [] }) };
      }
      return {
        ok: true,
        json: async () => ({
          users: [
            {
              id: "p-self",
              user_id: "u-self",
              membership_id: "m-self",
              display_name: "Ada Admin",
              email: "ada@example.org",
              role: "admin",
              staff_role: "development",
              is_tenant_admin: true,
              updated_at: "2026-11-24T09:00:00.000Z",
            },
            {
              id: "p-self",
              user_id: "u-self",
              membership_id: "m-self-care",
              display_name: "Ada Admin",
              email: "ada@example.org",
              role: "staff",
              staff_role: "member_care",
              is_tenant_admin: false,
              updated_at: "2026-11-24T09:00:01.000Z",
            },
            {
              id: "p-self",
              user_id: "u-self",
              membership_id: "m-self-miss",
              display_name: "Ada Admin",
              email: "ada@example.org",
              role: "missionary",
              staff_role: null,
              is_tenant_admin: false,
              updated_at: "2026-11-24T09:00:02.000Z",
            },
            {
              id: "p-other",
              user_id: "u-other",
              membership_id: "m-other",
              display_name: "Sam Staff",
              email: "sam@example.org",
              role: "staff",
              staff_role: "finance",
              is_tenant_admin: false,
              updated_at: "2026-11-24T09:00:03.000Z",
            },
          ],
        }),
      };
    });

    const view = show();
    expect(await view.findAllByText("Ada Admin")).toHaveLength(3);
    expect(
      view.getByRole("button", { name: "Change role for Sam Staff" }),
    ).toBeTruthy();
    expect(view.getByRole("button", { name: "Revoke Sam Staff" })).toBeTruthy();
    expect(
      view.queryAllByRole("button", { name: "Change role for Ada Admin" }),
    ).toHaveLength(0);
    expect(
      view.queryAllByRole("button", { name: "Revoke Ada Admin" }),
    ).toHaveLength(0);
    expect(
      view.getAllByRole("button", { name: /give up admin/i }),
    ).toHaveLength(1);
  });

  it("distinguishes a failed load from no members and retries", async () => {
    fetchMock.mockResolvedValue({ ok: false });
    const view = show();
    expect(await view.findByText("Could not load members")).toBeTruthy();
    expect(view.queryByText("No members found")).toBeNull();
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ users: [] }),
    });
    fireEvent.click(view.getAllByRole("button", { name: "Retry" })[0]!);
    await view.findByText("No members found");
  });

  it("reads beyond the first 100-member page", async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (String(url).startsWith("/api/admin/members/invitations")) {
        return { ok: true, json: async () => ({ invitations: [] }) };
      }
      return {
        ok: true,
        json: async () => ({
          users: String(url).includes("offset=0")
            ? Array.from({ length: 100 }, (_, i) => ({
                id: `s${i}`,
                membership_id: `m${i}`,
                full_name: `Staff ${i}`,
                role: "staff",
                staff_role: "development",
              }))
            : [
                {
                  id: "last",
                  membership_id: "m-last",
                  full_name: "Last staff",
                  role: "staff",
                  staff_role: "finance",
                },
              ],
        }),
      };
    });
    show();
    await waitFor(() =>
      expect(
        fetchMock.mock.calls.some(([url]) =>
          String(url).includes("offset=100"),
        ),
      ).toBe(true),
    );
  });
});
