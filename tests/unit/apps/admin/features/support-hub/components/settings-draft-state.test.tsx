// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
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
  optionState: {
    signatures: { isLoading: false, isError: false, refetch: vi.fn() },
    sla: { isLoading: false, isError: false, refetch: vi.fn() },
    hours: { isLoading: false, isError: false, refetch: vi.fn() },
  },
  settingsLoading: false,
  settingsError: false,
  settingsRefetch: vi.fn().mockResolvedValue(undefined),
  inboxes: [{ id: "inbox-1", name: "Donor Care" }] as Array<{
    id: string;
    name: string;
  }>,
  agents: [] as SupportAssignee[],
  currentAgentId: null as string | null,
  preferences: [] as SupportNotificationPreferences[],
  preferencesLoading: false,
  preferencesError: false,
  agentsLoading: false,
  access: { agentId: null, canManageAll: true } as {
    agentId: string | null;
    canManageAll: boolean;
  },
  saveSettings: vi.fn().mockResolvedValue({}),
  savePreferences: vi.fn().mockResolvedValue({}),
}));

vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-inbox-settings",
  () => ({
    useSupportInboxSettings: () => ({
      data: hooks.settings,
      isLoading: hooks.settingsLoading,
      isError: hooks.settingsError,
      refetch: hooks.settingsRefetch,
    }),
    useSupportInboxes: () => ({ data: hooks.inboxes }),
    useSupportSlaPolicies: () => ({ data: [], ...hooks.optionState.sla }),
    useSupportBusinessHours: () => ({ data: [], ...hooks.optionState.hours }),
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-agents",
  () => ({
    useSupportAgents: () => ({
      data: hooks.agents,
      isLoading: hooks.agentsLoading,
      isError: false,
      refetch: vi.fn(),
    }),
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-signatures",
  () => ({
    useSupportSignatures: () => ({ data: [], ...hooks.optionState.signatures }),
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/lib/current-agent",
  () => ({ useCurrentSupportAgentId: () => hooks.currentAgentId }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-notification-preferences",
  () => ({
    useSupportNotificationPreferences: () => ({
      data: hooks.preferences,
      for: (agentId: string) =>
        hooks.preferences.find((row) => row.agentId === agentId) ?? null,
      access: hooks.access,
      isLoading: hooks.preferencesLoading,
      isError: hooks.preferencesError,
      refetch: vi.fn().mockResolvedValue(undefined),
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

function describedText(element: HTMLElement): string {
  return (element.getAttribute("aria-describedby") ?? "")
    .split(" ")
    .filter(Boolean)
    .map((id) => document.getElementById(id)?.textContent ?? "")
    .join(" ");
}

async function chooseAgent(name: string) {
  fireEvent.click(screen.getByRole("combobox", { name: "Agent" }));
  fireEvent.click(await screen.findByRole("option", { name }));
}

beforeEach(() => {
  for (const state of Object.values(hooks.optionState)) {
    state.isLoading = false;
    state.isError = false;
    state.refetch.mockClear();
  }
  hooks.settings = undefined;
  hooks.settingsLoading = false;
  hooks.settingsError = false;
  hooks.settingsRefetch.mockClear();
  hooks.inboxes = [{ id: "inbox-1", name: "Donor Care" }];
  hooks.agents = [];
  hooks.currentAgentId = null;
  hooks.preferences = [];
  hooks.preferencesLoading = false;
  hooks.preferencesError = false;
  hooks.agentsLoading = false;
  hooks.access = { agentId: null, canManageAll: true };
  hooks.savePreferences.mockClear();
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
  it("says the in-app choices feed the inbox's For you note, with no promise about alerts that are not sent", () => {
    hooks.agents = [agent("agent-a", "Alex")];
    render(<NotificationPreferencesForm />);
    const form = screen.getByRole("region", {
      name: "Notification preferences",
    });
    expect(form.textContent).toMatch(/For you/);
    expect(screen.queryByText(/saved for when/i)).toBeNull();
    expect(screen.queryByText(/bell/i)).toBeNull();
  });

  it("explains how conversations reach an agent, with no controls that change nothing", () => {
    hooks.settings = inboxSettings({ roundRobinEnabled: true });
    render(<AssignmentRulesForm />);
    // Nothing assigns conversations automatically, so there is no switch,
    // field or save button for it, not even a disabled one.
    expect(screen.queryByRole("switch")).toBeNull();
    expect(screen.queryByRole("textbox")).toBeNull();
    expect(screen.queryByRole("button", { name: "Save changes" })).toBeNull();
    expect(screen.queryByText(/not available yet/i)).toBeNull();
    expect(screen.getByText(/Unassigned view/)).toBeTruthy();
  });

  it("loads inbox settings, discards drafts, and reloads a changed persisted record", () => {
    const { rerender } = render(<InboxSettingsForm />);
    hooks.settings = inboxSettings({ showContactSidecar: true });
    rerender(<InboxSettingsForm />);
    const sidecar = screen.getByRole("switch", { name: "Donor panel" });
    expect(sidecar.getAttribute("aria-checked")).toBe("true");
    fireEvent.click(sidecar);
    expect(sidecar.getAttribute("aria-checked")).toBe("false");
    fireEvent.click(screen.getByRole("button", { name: "Discard" }));
    expect(sidecar.getAttribute("aria-checked")).toBe("true");

    fireEvent.click(sidecar);
    hooks.settings = inboxSettings({
      showContactSidecar: false,
      updatedAt: "2026-02-01T00:00:00.000Z",
    });
    rerender(<InboxSettingsForm />);
    expect(sidecar.getAttribute("aria-checked")).toBe("false");
    expect(
      screen
        .getByRole("button", { name: "Save changes" })
        .hasAttribute("disabled"),
    ).toBe(true);
  });

  it("names the inbox once and promises only the settings it has", () => {
    hooks.settings = inboxSettings();
    render(<InboxSettingsForm />);
    // The page heading already reads "Inbox identity"; the panel names the
    // inbox it edits instead of repeating it.
    expect(screen.queryByText(/^Inbox identity —/)).toBeNull();
    // No default-sender control exists, so the copy does not promise one.
    expect(screen.queryByText(/sender/i)).toBeNull();
    expect(screen.queryByText(/\+ off-hours/)).toBeNull();
    expect(
      screen.getByRole("region", { name: "Donor Care inbox" }),
    ).toBeTruthy();
  });

  it("says the inbox defaults are stored but not applied, and keeps the working donor panel out of that note", () => {
    hooks.settings = inboxSettings();
    const { container } = render(<InboxSettingsForm />);
    const note = screen.getByRole("note");
    expect(note.textContent).toContain("Saved, not applied yet");
    expect(note.textContent).toMatch(/signature/i);
    expect(note.textContent).toMatch(/SLA policy/);
    expect(note.textContent).toMatch(/business hours/i);
    expect(note.textContent).not.toMatch(
      /donor panel|sidecar|round-robin|auto-resolve/i,
    );
    expect(container.textContent).not.toMatch(
      /Applied when|Timer applied|off-hours routing|24\/7 coverage/,
    );
    expect(
      screen.getByText("Show the donor's CRM record beside each conversation."),
    ).toBeTruthy();
  });

  it("never invents an inbox name when the inbox list hasn't named it", () => {
    hooks.settings = inboxSettings();
    hooks.inboxes = [];
    render(<InboxSettingsForm />);
    expect(screen.queryByText(/Donor Care/)).toBeNull();
    expect(screen.getByRole("region", { name: "Inbox defaults" })).toBeTruthy();
  });

  it("says plainly when no support inbox exists and that it can't be created here", () => {
    render(<InboxSettingsForm />);
    expect(screen.getByText(/No support inbox exists/)).toBeTruthy();
    expect(screen.getByText(/ask a support admin/i)).toBeTruthy();
    expect(screen.queryByText(/integrations area/)).toBeNull();
  });

  it("shows loading, not 'no inbox', while inbox settings load", () => {
    hooks.settingsLoading = true;
    render(<InboxSettingsForm />);
    expect(screen.getByRole("status").textContent).toContain(
      "Loading inbox settings",
    );
    expect(screen.queryByText(/No support inbox exists/)).toBeNull();
  });

  it("shows a failed inbox settings load with Try again, not 'no inbox'", async () => {
    hooks.settingsError = true;
    render(<InboxSettingsForm />);
    expect(screen.getByRole("alert").textContent).toContain(
      "Couldn’t load inbox settings",
    );
    expect(screen.queryByText(/No support inbox exists/)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    await waitFor(() => expect(hooks.settingsRefetch).toHaveBeenCalledOnce());
  });

  it("saves the edited inbox fields with the loaded inbox identity", () => {
    hooks.settings = inboxSettings();
    render(<InboxSettingsForm />);
    fireEvent.click(screen.getByRole("switch", { name: "Donor panel" }));
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    expect(hooks.saveSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "settings-1",
        inboxId: "inbox-1",
        showContactSidecar: false,
      }),
    );
  });

  it("offers no round-robin or auto-resolve controls, since nothing runs them", () => {
    hooks.settings = inboxSettings({
      autoResolveAfterDays: 14,
      roundRobinEnabled: true,
    });
    render(<InboxSettingsForm />);
    expect(
      screen.queryByRole("spinbutton", { name: /auto-resolve/i }),
    ).toBeNull();
    expect(screen.queryByRole("switch", { name: /round-robin/i })).toBeNull();
    expect(screen.queryByText(/not available yet/i)).toBeNull();
    // The settings that do work stay.
    expect(screen.getByRole("switch", { name: "Donor panel" })).toBeTruthy();
  });

  it("keeps unsaved inbox edits when the cache returns an equivalent settings snapshot", () => {
    hooks.settings = inboxSettings({ showContactSidecar: true });
    const { rerender } = render(<InboxSettingsForm />);
    const sidecar = screen.getByRole("switch", { name: "Donor panel" });
    fireEvent.click(sidecar);
    hooks.settings = { ...hooks.settings };
    rerender(<InboxSettingsForm />);
    expect(sidecar.getAttribute("aria-checked")).toBe("false");
    expect(screen.getByText("You have unsaved changes.")).toBeTruthy();
  });

  it("defaults to the current agent and resets drafts when the selected agent or saved preferences change", async () => {
    hooks.agents = [agent("agent-1", "Alex"), agent("agent-2", "Blair")];
    hooks.currentAgentId = "agent-2";
    hooks.preferences = [
      preferences("agent-1"),
      preferences("agent-2", { inAppSlaWarnings: false }),
    ];
    const { rerender } = render(<NotificationPreferencesForm />);
    expect(
      screen.getByRole("combobox", { name: "Agent" }).textContent,
    ).toContain("Blair");
    const sla = screen.getByRole("switch", { name: "SLA warnings" });
    expect(sla.getAttribute("aria-checked")).toBe("false");
    fireEvent.click(sla);
    fireEvent.click(screen.getByRole("button", { name: "Discard" }));
    expect(sla.getAttribute("aria-checked")).toBe("false");

    await chooseAgent("Alex");
    expect(sla.getAttribute("aria-checked")).toBe("true");
    fireEvent.click(sla);
    hooks.preferences = [preferences("agent-1", { inAppAssignments: false })];
    rerender(<NotificationPreferencesForm />);
    expect(sla.getAttribute("aria-checked")).toBe("true");
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
        .getByRole("switch", { name: "SLA warnings" })
        .getAttribute("aria-checked"),
    ).toBe("true");
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
      const sla = screen.getByRole("switch", { name: "SLA warnings" });
      fireEvent.click(sla);

      hooks.agents = [blair, { ...alex, name: "Alex updated" }];
      hooks.preferences = hooks.preferences.map((row) => ({ ...row }));
      rerender(<NotificationPreferencesForm />);
      expect(
        screen.getByRole("combobox", { name: "Agent" }).textContent,
      ).toContain("Alex updated");
      expect(sla.getAttribute("aria-checked")).toBe("false");
      fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
      expect(hooks.savePreferences).toHaveBeenCalledWith(
        expect.objectContaining({
          agentId: "agent-1",
          inAppSlaWarnings: false,
        }),
      );
    },
  );

  it("starts a separate default draft when switching between agents without saved preferences", async () => {
    hooks.agents = [agent("agent-1", "Alex"), agent("agent-2", "Blair")];
    render(<NotificationPreferencesForm />);
    const sla = screen.getByRole("switch", { name: "SLA warnings" });
    fireEvent.click(sla);
    await chooseAgent("Blair");
    expect(sla.getAttribute("aria-checked")).toBe("true");
    // Blair is on the defaults and hasn't changed anything.
    expect(screen.getByText("Using default preferences")).toBeTruthy();
    expect(
      screen
        .getByRole("button", { name: "Save changes" })
        .hasAttribute("disabled"),
    ).toBe(true);
    fireEvent.click(sla);
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    expect(hooks.savePreferences).toHaveBeenCalledWith(
      expect.objectContaining({ agentId: "agent-2", inAppSlaWarnings: false }),
    );
  });

  it("treats an agent without saved preferences as using the defaults, not as unsaved changes", () => {
    hooks.agents = [agent("agent-1", "Alex")];
    render(<NotificationPreferencesForm />);
    expect(screen.queryByText("You have unsaved changes.")).toBeNull();
    expect(screen.getByRole("status").textContent).toBe(
      "Using default preferences",
    );
    expect(
      screen
        .getByRole("button", { name: "Save changes" })
        .hasAttribute("disabled"),
    ).toBe(true);
  });

  it.each([
    ["saved preferences load", { preferencesLoading: true }],
    ["agents load", { agentsLoading: true }],
  ])(
    "offers no switches, Save or 'No agents yet' while %s",
    (_label, state) => {
      Object.assign(hooks, state);
      if (!("agentsLoading" in state))
        hooks.agents = [agent("agent-1", "Alex")];
      render(<NotificationPreferencesForm />);
      expect(screen.queryByRole("switch")).toBeNull();
      expect(screen.queryByRole("button", { name: "Save changes" })).toBeNull();
      expect(screen.queryByText("No agents yet.")).toBeNull();
      expect(
        screen
          .getAllByRole("status")
          .some((node) =>
            node.textContent?.includes("Loading notification preferences"),
          ),
      ).toBe(true);
    },
  );

  it("never offers defaults over saved preferences that failed to load", () => {
    hooks.agents = [agent("agent-1", "Alex")];
    hooks.preferencesError = true;
    render(<NotificationPreferencesForm />);
    expect(screen.getByRole("alert").textContent).toContain(
      "Couldn’t load notification preferences",
    );
    expect(screen.queryByRole("switch")).toBeNull();
    expect(screen.queryByRole("button", { name: "Save changes" })).toBeNull();
  });

  it("lets staff who aren't support admins edit only their own preferences", () => {
    hooks.agents = [agent("agent-1", "Alex"), agent("agent-2", "Blair")];
    hooks.access = { agentId: "agent-2", canManageAll: false };
    hooks.preferences = [preferences("agent-2", { inAppSlaWarnings: false })];
    render(<NotificationPreferencesForm />);
    expect(screen.queryByRole("combobox", { name: "Agent" })).toBeNull();
    const sla = screen.getByRole("switch", { name: "SLA warnings" });
    expect(sla.getAttribute("aria-checked")).toBe("false");
    fireEvent.click(sla);
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    expect(hooks.savePreferences).toHaveBeenCalledWith(
      expect.objectContaining({ agentId: "agent-2", inAppSlaWarnings: true }),
    );
  });

  it("describes each alert switch by whose For you note it counts in", () => {
    hooks.agents = [agent("agent-1", "Alex"), agent("agent-2", "Blair")];
    hooks.currentAgentId = "agent-2";
    render(<NotificationPreferencesForm />);
    for (const name of ["Assignments", "SLA warnings"]) {
      const description = describedText(screen.getByRole("switch", { name }));
      expect(description).toContain("Blair’s For you note");
      expect(description).not.toMatch(/my/i);
    }
  });

  it("speaks to staff about their own alerts as theirs", () => {
    hooks.agents = [agent("agent-1", "Alex")];
    hooks.access = { agentId: "agent-1", canManageAll: false };
    render(<NotificationPreferencesForm />);
    expect(
      describedText(screen.getByRole("switch", { name: "SLA warnings" })),
    ).toContain("your For you note");
  });

  it("tells staff plainly when they aren't set up as a support agent", () => {
    hooks.agents = [agent("agent-1", "Alex")];
    hooks.access = { agentId: null, canManageAll: false };
    render(<NotificationPreferencesForm />);
    expect(screen.getByText(/not set up as a support agent/)).toBeTruthy();
    expect(screen.queryByRole("switch")).toBeNull();
    expect(screen.queryByRole("combobox", { name: "Agent" })).toBeNull();
  });

  it("offers switches only for the alerts the inbox shows today", () => {
    hooks.agents = [agent("agent-1", "Alex")];
    render(<NotificationPreferencesForm />);
    const form = screen.getByRole("region", {
      name: "Notification preferences",
    });
    const switches = screen.getAllByRole("switch");
    expect(switches.map((node) => node.getAttribute("aria-label"))).toEqual([
      "Assignments",
      "SLA warnings",
    ]);
    for (const node of switches) expect(form.contains(node)).toBe(true);
    expect(screen.queryByRole("switch", { name: "Daily digest" })).toBeNull();
    expect(screen.queryByRole("switch", { name: "Mentions" })).toBeNull();
  });

  it("states the alerts that are not available yet as plain text outside the form", () => {
    hooks.agents = [agent("agent-1", "Alex")];
    render(<NotificationPreferencesForm />);
    const form = screen.getByRole("region", {
      name: "Notification preferences",
    });
    const unavailable = screen.getByRole("region", {
      name: "Not available yet",
    });
    expect(form.contains(unavailable)).toBe(false);
    expect(unavailable.textContent).toMatch(/mention/i);
    expect(unavailable.textContent).toMatch(/assign/i);
    expect(unavailable.textContent).toMatch(/daily digest/i);
    expect(
      unavailable.querySelector("button, input, [role='switch']"),
    ).toBeNull();
  });

  it("saves the two in-app choices and leaves the stored values for alerts that are not sent untouched", () => {
    hooks.agents = [agent("agent-1", "Alex")];
    hooks.preferences = [
      preferences("agent-1", {
        emailMentions: false,
        emailAssignments: true,
        emailDailyDigest: true,
        inAppMentions: false,
      }),
    ];
    render(<NotificationPreferencesForm />);
    fireEvent.click(screen.getByRole("switch", { name: "Assignments" }));
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    expect(hooks.savePreferences).toHaveBeenCalledWith({
      agentId: "agent-1",
      emailMentions: false,
      emailAssignments: true,
      emailDailyDigest: true,
      inAppMentions: false,
      inAppAssignments: false,
      inAppSlaWarnings: true,
    });
  });
});

it.each([
  ["signatures", "Default signature", "signatures"],
  ["sla", "Default SLA policy", "SLA policies"],
  ["hours", "Business hours", "business hours"],
] as const)(
  "shows and retries a failed %s picker while preserving the draft",
  async (key, label, noun) => {
    hooks.settings = inboxSettings();
    hooks.optionState[key].isError = true;
    const view = render(<InboxSettingsForm />);
    expect(screen.getByText(`Couldn’t load ${noun}`)).toBeTruthy();
    expect(screen.queryByRole("combobox", { name: label })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(hooks.optionState[key].refetch).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("switch", { name: "Donor panel" }));
    hooks.optionState[key].isError = false;
    view.rerender(<InboxSettingsForm />);
    expect(
      screen
        .getByRole("switch", { name: "Donor panel" })
        .getAttribute("aria-checked"),
    ).toBe("false");
    expect(screen.getByRole("combobox", { name: label })).toBeTruthy();
  },
);
