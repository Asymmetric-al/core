// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- AL-1965: App regression test at the settings form's public UI boundary.
import { AssignmentRulesForm } from "../../../../../../../apps/admin/features/support-hub/components/settings/assignment/AssignmentRulesForm";
// eslint-disable-next-line no-restricted-imports -- AL-1965: App regression test at the settings form's public UI boundary.
import { InboxSettingsForm } from "../../../../../../../apps/admin/features/support-hub/components/settings/inbox/InboxSettingsForm";
// eslint-disable-next-line no-restricted-imports -- AL-1965: App regression test at the settings form's public UI boundary.
import { NotificationPreferencesForm } from "../../../../../../../apps/admin/features/support-hub/components/settings/notifications/NotificationPreferencesForm";

// eslint-disable-next-line no-restricted-imports -- AL-1965: Fixtures use the app's public wire-format types.
import type {
  SupportAssignee,
  SupportInboxSettings,
  SupportNotificationPreferences,
} from "../../../../../../../apps/admin/features/support-hub/types";

const hooks = vi.hoisted(() => ({
  settings: undefined as SupportInboxSettings | undefined,
  agents: [] as SupportAssignee[],
  currentAgentId: null as string | null,
  preferences: [] as SupportNotificationPreferences[],
  saveSettings: vi.fn().mockResolvedValue({}),
  savePreferences: vi.fn().mockResolvedValue({}),
}));

vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-inbox-settings",
  () => ({
    useSupportInboxSettings: () => ({ data: hooks.settings }),
    useSupportInboxes: () => ({
      data: [{ id: "inbox-1", name: "Donor Care" }],
    }),
    useSupportSlaPolicies: () => ({ data: [] }),
    useSupportBusinessHours: () => ({ data: [] }),
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-agents",
  () => ({ useSupportAgents: () => ({ data: hooks.agents }) }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-signatures",
  () => ({ useSupportSignatures: () => ({ data: [] }) }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/lib/current-agent",
  () => ({ useCurrentSupportAgentId: () => hooks.currentAgentId }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-notification-preferences",
  () => ({
    useSupportNotificationPreferences: () => ({
      for: (agentId: string) =>
        hooks.preferences.find((row) => row.agentId === agentId) ?? null,
    }),
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-mutations",
  () => ({
    useSaveSupportInboxSettings: () => ({
      mutateAsync: hooks.saveSettings,
      isPending: false,
    }),
    useSaveSupportNotificationPreferences: () => ({
      mutateAsync: hooks.savePreferences,
      isPending: false,
    }),
  }),
);
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

function inboxSettings(
  overrides: Partial<SupportInboxSettings> = {},
): SupportInboxSettings {
  return {
    id: "settings-1",
    tenantId: "tenant-1",
    inboxId: "inbox-1",
    defaultSignatureId: null,
    defaultSlaPolicyId: null,
    defaultBusinessHoursId: null,
    roundRobinEnabled: false,
    autoResolveAfterDays: null,
    showContactSidecar: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function agent(id: string, name: string): SupportAssignee {
  return { id, name, email: `${id}@example.org`, avatarUrl: null, title: null };
}

function preferences(
  agentId: string,
  overrides: Partial<SupportNotificationPreferences> = {},
): SupportNotificationPreferences {
  return {
    id: `preferences-${agentId}`,
    tenantId: "tenant-1",
    agentId,
    emailMentions: true,
    emailAssignments: true,
    emailDailyDigest: false,
    inAppMentions: true,
    inAppAssignments: true,
    inAppSlaWarnings: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

async function chooseAgent(name: string) {
  fireEvent.click(screen.getByRole("combobox", { name: "Agent" }));
  fireEvent.click(await screen.findByRole("option", { name }));
}

beforeEach(() => {
  hooks.settings = undefined;
  hooks.agents = [];
  hooks.currentAgentId = null;
  hooks.preferences = [];
});
afterEach(cleanup);

describe("Support Hub settings drafts", () => {
  it("keeps the initial fallback agent when loaded agents change order", () => {
    hooks.currentAgentId = null;
    hooks.agents = [agent("agent-a", "Alex"), agent("agent-b", "Blair")];
    const { rerender } = render(<NotificationPreferencesForm />);
    expect(
      screen.getByRole("combobox", { name: "Agent" }).textContent,
    ).toContain("Alex");
    hooks.agents = [hooks.agents[1], hooks.agents[0]];
    rerender(<NotificationPreferencesForm />);
    expect(
      screen.getByRole("combobox", { name: "Agent" }).textContent,
    ).toContain("Alex");
  });
  it("loads assignment defaults, discards edits, and follows saved assignment changes", () => {
    const { rerender } = render(<AssignmentRulesForm />);
    expect(
      screen.getByText("Configure the inbox first", { exact: false }),
    ).toBeTruthy();

    hooks.settings = inboxSettings({ roundRobinEnabled: true });
    rerender(<AssignmentRulesForm />);
    const roundRobin = screen.getByRole("switch", { name: "Round-robin" });
    expect(roundRobin.getAttribute("aria-checked")).toBe("true");
    fireEvent.click(roundRobin);
    expect(screen.getByText("You have unsaved changes.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Discard" }));
    expect(roundRobin.getAttribute("aria-checked")).toBe("true");

    hooks.settings = inboxSettings({ roundRobinEnabled: false });
    rerender(<AssignmentRulesForm />);
    expect(roundRobin.getAttribute("aria-checked")).toBe("false");
    expect(
      screen
        .getByRole("button", { name: "Save changes" })
        .hasAttribute("disabled"),
    ).toBe(true);
  });

  it("loads inbox settings, discards drafts, and reloads a changed persisted record", () => {
    const { rerender } = render(<InboxSettingsForm />);
    hooks.settings = inboxSettings({ autoResolveAfterDays: 14 });
    rerender(<InboxSettingsForm />);
    const days = screen.getByRole("spinbutton") as HTMLInputElement;
    expect(days.value).toBe("14");
    fireEvent.change(days, { target: { value: "7" } });
    fireEvent.click(screen.getByRole("button", { name: "Discard" }));
    expect(days.value).toBe("14");

    fireEvent.change(days, { target: { value: "7" } });
    hooks.settings = inboxSettings({ autoResolveAfterDays: 21 });
    rerender(<InboxSettingsForm />);
    expect(days.value).toBe("21");
    expect(
      screen
        .getByRole("button", { name: "Save changes" })
        .hasAttribute("disabled"),
    ).toBe(true);
  });

  it("resets assignment edits when a different inbox settings record becomes active", () => {
    hooks.settings = inboxSettings();
    const { rerender } = render(<AssignmentRulesForm />);
    const roundRobin = screen.getByRole("switch", { name: "Round-robin" });
    fireEvent.click(roundRobin);
    expect(roundRobin.getAttribute("aria-checked")).toBe("true");
    hooks.settings = inboxSettings({ id: "settings-2", inboxId: "inbox-2" });
    rerender(<AssignmentRulesForm />);
    expect(roundRobin.getAttribute("aria-checked")).toBe("false");
    expect(screen.getByText("Saved")).toBeTruthy();
  });

  it("saves the edited inbox fields with the loaded inbox identity", () => {
    hooks.settings = inboxSettings();
    render(<InboxSettingsForm />);
    fireEvent.change(screen.getByRole("spinbutton"), {
      target: { value: "7" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    expect(hooks.saveSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "settings-1",
        inboxId: "inbox-1",
        autoResolveAfterDays: 7,
      }),
    );
  });

  it("keeps unsaved inbox edits when the cache returns an equivalent settings snapshot", () => {
    hooks.settings = inboxSettings({ autoResolveAfterDays: 14 });
    const { rerender } = render(<InboxSettingsForm />);
    const days = screen.getByRole("spinbutton") as HTMLInputElement;
    fireEvent.change(days, { target: { value: "7" } });
    hooks.settings = { ...hooks.settings };
    rerender(<InboxSettingsForm />);
    expect(days.value).toBe("7");
    expect(screen.getByText("You have unsaved changes.")).toBeTruthy();
  });

  it("defaults to the current agent and resets drafts when the selected agent or saved preferences change", async () => {
    hooks.agents = [agent("agent-1", "Alex"), agent("agent-2", "Blair")];
    hooks.currentAgentId = "agent-2";
    hooks.preferences = [
      preferences("agent-1"),
      preferences("agent-2", { emailDailyDigest: true }),
    ];
    const { rerender } = render(<NotificationPreferencesForm />);
    expect(
      screen.getByRole("combobox", { name: "Agent" }).textContent,
    ).toContain("Blair");
    const digest = screen.getByRole("switch", { name: "Daily digest" });
    expect(digest.getAttribute("aria-checked")).toBe("true");
    fireEvent.click(digest);
    fireEvent.click(screen.getByRole("button", { name: "Discard" }));
    expect(digest.getAttribute("aria-checked")).toBe("true");

    await chooseAgent("Alex");
    expect(digest.getAttribute("aria-checked")).toBe("false");
    fireEvent.click(digest);
    hooks.preferences = [preferences("agent-1", { emailAssignments: false })];
    rerender(<NotificationPreferencesForm />);
    expect(digest.getAttribute("aria-checked")).toBe("false");
    expect(
      screen
        .getByRole("button", { name: "Save changes" })
        .hasAttribute("disabled"),
    ).toBe(true);
  });

  it("selects a newly loaded first agent when there is no current agent", () => {
    const { rerender } = render(<NotificationPreferencesForm />);
    expect(screen.getByText("No agents yet.")).toBeTruthy();
    hooks.agents = [agent("agent-1", "Alex")];
    rerender(<NotificationPreferencesForm />);
    expect(
      screen.getByRole("combobox", { name: "Agent" }).textContent,
    ).toContain("Alex");
    expect(
      screen
        .getByRole("switch", { name: "Daily digest" })
        .getAttribute("aria-checked"),
    ).toBe("false");
  });

  it.each([true, false])(
    "keeps the default agent and their draft when a refresh reorders agents (initially loaded: %s)",
    (initiallyLoaded) => {
      const alex = agent("agent-1", "Alex");
      const blair = agent("agent-2", "Blair");
      hooks.agents = initiallyLoaded ? [alex, blair] : [];
      hooks.preferences = [preferences("agent-1"), preferences("agent-2")];
      const { rerender } = render(<NotificationPreferencesForm />);
      if (!initiallyLoaded) {
        hooks.agents = [alex, blair];
        rerender(<NotificationPreferencesForm />);
      }
      expect(
        screen.getByRole("combobox", { name: "Agent" }).textContent,
      ).toContain("Alex");
      const digest = screen.getByRole("switch", { name: "Daily digest" });
      fireEvent.click(digest);

      hooks.agents = [blair, { ...alex, name: "Alex updated" }];
      hooks.preferences = hooks.preferences.map((row) => ({ ...row }));
      rerender(<NotificationPreferencesForm />);
      expect(
        screen.getByRole("combobox", { name: "Agent" }).textContent,
      ).toContain("Alex updated");
      expect(digest.getAttribute("aria-checked")).toBe("true");
      fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
      expect(hooks.savePreferences).toHaveBeenCalledWith(
        expect.objectContaining({ agentId: "agent-1", emailDailyDigest: true }),
      );
    },
  );

  it("starts a separate default draft when switching between agents without saved preferences", async () => {
    hooks.agents = [agent("agent-1", "Alex"), agent("agent-2", "Blair")];
    render(<NotificationPreferencesForm />);
    const digest = screen.getByRole("switch", { name: "Daily digest" });
    fireEvent.click(digest);
    await chooseAgent("Blair");
    expect(digest.getAttribute("aria-checked")).toBe("false");
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    expect(hooks.savePreferences).toHaveBeenCalledWith(
      expect.objectContaining({ agentId: "agent-2", emailDailyDigest: false }),
    );
  });
});
