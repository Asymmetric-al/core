// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- AL-1894: Exercise actual location relationship state and mutation payload.
import { LocationEditor } from "../../../../apps/admin/features/mission-control/locations/components/LocationEditor";
// eslint-disable-next-line no-restricted-imports -- AL-1894: Exercise actual settings drafts at the nullable callback boundary.
import { InboxSettingsForm } from "../../../../apps/admin/features/support-hub/components/settings/inbox/InboxSettingsForm";
// eslint-disable-next-line no-restricted-imports -- AL-1894: Exercise actual agent preference draft ownership.
import { NotificationPreferencesForm } from "../../../../apps/admin/features/support-hub/components/settings/notifications/NotificationPreferencesForm";
// eslint-disable-next-line no-restricted-imports -- AL-1894: Exercise actual signature ownership mutation payload.
import { SignatureForm } from "../../../../apps/admin/features/support-hub/components/settings/signatures/SignatureForm";
// eslint-disable-next-line no-restricted-imports -- AL-1894: Exercise actual SLA policy mutation payload.
import { SlaPolicyForm } from "../../../../apps/admin/features/support-hub/components/settings/sla/SlaPolicyForm";

import type {
  SupportInboxSettings,
  SupportNotificationPreferences,
  SupportSignature,
  SupportSlaPolicy,
} from "@asym/database/collections/support-hub";
import type * as SearchableModule from "@asym/ui/components/shadcn/searchable-select";
import type { ComponentProps } from "react";

const { emitNull, saves, agentRows } = vi.hoisted(() => ({
  emitNull: new Map<string, () => void>(),
  saves: {
    notifications: vi.fn(),
    inbox: vi.fn(),
    signature: vi.fn(),
    sla: vi.fn(),
    location: vi.fn(),
  },
  agentRows: { current: [] as Array<{ id: string; name: string }> },
}));

// Keep real controls and inject only the documented nullable callback. A
// callback-boundary regression does not claim searching or loading emits null.
vi.mock(
  "@asym/ui/components/shadcn/searchable-select",
  async (importOriginal) => {
    const actual = await importOriginal<typeof SearchableModule>();
    return {
      ...actual,
      SearchableSelect: (
        props: ComponentProps<typeof SearchableModule.SearchableSelect>,
      ) => {
        emitNull.set(props["aria-label"] ?? "", () =>
          props.onValueChange?.(null, {
            reason: "none",
            event: new Event("change"),
            cancel() {},
            allowPropagation() {},
            isCanceled: false,
            isPropagationAllowed: false,
            trigger: undefined,
          }),
        );
        return <actual.SearchableSelect {...props} />;
      },
    };
  },
);

const agents = [
  { id: "agent-1", name: "Ada" },
  { id: "agent-2", name: "Grace" },
];
const timestamp = "2026-09-23T00:00:00Z";
const preferences: SupportNotificationPreferences[] = agents.map((agent) => ({
  id: `preferences-${agent.id}`,
  tenantId: "tenant-1",
  agentId: agent.id,
  emailMentions: true,
  emailAssignments: true,
  emailDailyDigest: false,
  inAppMentions: true,
  inAppAssignments: true,
  inAppSlaWarnings: true,
  createdAt: timestamp,
  updatedAt: timestamp,
}));
const settings: SupportInboxSettings = {
  id: "settings-1",
  tenantId: "tenant-1",
  inboxId: "inbox-1",
  defaultSignatureId: "signature-1",
  defaultSlaPolicyId: "policy-1",
  defaultBusinessHoursId: "hours-1",
  roundRobinEnabled: false,
  autoResolveAfterDays: 7,
  showContactSidecar: true,
  createdAt: timestamp,
  updatedAt: timestamp,
};
const signature: SupportSignature = {
  id: "signature-1",
  tenantId: "tenant-1",
  ownerAgentId: "agent-2",
  name: "Agent signature",
  bodyText: "Kind regards",
  bodyHtml: "<p>Kind regards</p>",
  isDefault: false,
  createdAt: timestamp,
  updatedAt: timestamp,
};
const policy: SupportSlaPolicy = {
  id: "policy-1",
  tenantId: "tenant-1",
  name: "Standard",
  description: null,
  firstResponseMinutes: 60,
  nextResponseMinutes: 120,
  resolutionMinutes: 240,
  businessHoursId: "hours-1",
  isDefault: false,
  createdAt: timestamp,
  updatedAt: timestamp,
};
const hours = [{ id: "hours-1", name: "Weekdays" }];

vi.mock(
  "../../../../apps/admin/features/support-hub/hooks/use-support-agents",
  () => ({ useSupportAgents: () => ({ data: agentRows.current }) }),
);
vi.mock(
  "../../../../apps/admin/features/support-hub/lib/current-agent",
  () => ({ useCurrentSupportAgentId: () => "agent-2" }),
);
vi.mock(
  "../../../../apps/admin/features/support-hub/hooks/use-support-notification-preferences",
  () => ({
    useSupportNotificationPreferences: () => ({
      for: (id: string) =>
        preferences.find((row) => row.agentId === id) ?? null,
    }),
  }),
);
vi.mock(
  "../../../../apps/admin/features/support-hub/hooks/use-support-inbox-settings",
  () => ({
    useSupportInboxes: () => ({ data: [{ id: "inbox-1", name: "Inbox" }] }),
    useSupportInboxSettings: () => ({ data: settings }),
    useSupportSlaPolicies: () => ({ data: [policy] }),
    useSupportBusinessHours: () => ({ data: hours }),
  }),
);
vi.mock(
  "../../../../apps/admin/features/support-hub/hooks/use-support-signatures",
  () => ({ useSupportSignatures: () => ({ data: [signature] }) }),
);
vi.mock(
  "../../../../apps/admin/features/support-hub/hooks/use-support-mutations",
  () => ({
    useSaveSupportNotificationPreferences: () => ({
      mutateAsync: saves.notifications,
      isPending: false,
    }),
    useSaveSupportInboxSettings: () => ({
      mutateAsync: saves.inbox,
      isPending: false,
    }),
    useSaveSupportSignature: () => ({
      mutateAsync: saves.signature,
      isPending: false,
    }),
    useSaveSupportSlaPolicy: () => ({
      mutateAsync: saves.sla,
      isPending: false,
    }),
  }),
);
vi.mock(
  "../../../../apps/admin/features/mission-control/locations/hooks/use-locations",
  () => ({
    useUpsertLocation: () => ({
      mutateAsync: saves.location,
      isPending: false,
    }),
    useLinkedEntities: () => ({
      data: { missionaries: [{ id: "missionary-1", full_name: "Map worker" }] },
    }),
  }),
);

beforeEach(() => {
  emitNull.clear();
  agentRows.current = agents;
  for (const save of Object.values(saves)) {
    save.mockReset();
    save.mockResolvedValue(undefined);
  }
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  Element.prototype.scrollIntoView ??= () => {};
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
function emitImplicitNull(label: string) {
  const emit = emitNull.get(label);
  expect(emit).toBeDefined();
  act(() => emit?.());
}
async function choose(label: string, option: string) {
  fireEvent.click(screen.getByRole("combobox", { name: label, exact: true }));
  fireEvent.click(
    await screen.findByRole("option", { name: option, exact: true }),
  );
}
function saveChanges() {
  fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
}

describe("SearchableSelect consumer null policies", () => {
  it("keeps the selected agent and unsaved preferences on implicit null", async () => {
    const view = render(<NotificationPreferencesForm />);
    fireEvent.click(screen.getByRole("switch", { name: "Daily digest" }));
    agentRows.current = [];
    view.rerender(<NotificationPreferencesForm />);
    emitImplicitNull("Agent");
    expect(
      screen
        .getByRole("switch", { name: "Daily digest" })
        .getAttribute("aria-checked"),
    ).toBe("true");
    agentRows.current = agents;
    view.rerender(<NotificationPreferencesForm />);
    expect(
      screen.getByRole("combobox", { name: "Agent", exact: true }).textContent,
    ).toContain("Grace");
    expect(
      screen
        .getByRole("switch", { name: "Daily digest" })
        .getAttribute("aria-checked"),
    ).toBe("true");
    saveChanges();
    await waitFor(() =>
      expect(saves.notifications).toHaveBeenCalledWith(
        expect.objectContaining({ agentId: "agent-2", emailDailyDigest: true }),
      ),
    );
    await choose("Agent", "Ada");
    expect(
      screen.getByRole("combobox", { name: "Agent", exact: true }).textContent,
    ).toContain("Ada");
    expect(
      screen
        .getByRole("switch", { name: "Daily digest" })
        .getAttribute("aria-checked"),
    ).toBe("false");
  });

  it.each([
    {
      label: "Default signature",
      field: "defaultSignatureId",
      value: "signature-1",
      empty: "No default signature",
    },
    {
      label: "Default SLA policy",
      field: "defaultSlaPolicyId",
      value: "policy-1",
      empty: "No SLA policy",
    },
    {
      label: "Business hours",
      field: "defaultBusinessHoursId",
      value: "hours-1",
      empty: "24/7 coverage",
    },
  ])(
    "preserves $label unless its explicit empty choice is selected",
    async ({ label, field, value, empty }) => {
      render(<InboxSettingsForm />);
      fireEvent.click(
        screen.getByRole("switch", { name: "Round-robin assignment" }),
      );
      emitImplicitNull(label);
      saveChanges();
      await waitFor(() =>
        expect(saves.inbox).toHaveBeenCalledWith(
          expect.objectContaining({ [field]: value, roundRobinEnabled: true }),
        ),
      );
      saves.inbox.mockClear();
      await choose(label, empty);
      saveChanges();
      await waitFor(() =>
        expect(saves.inbox).toHaveBeenCalledWith(
          expect.objectContaining({ [field]: null }),
        ),
      );
    },
  );

  it("changes signature ownership to workspace only through the explicit choice", async () => {
    render(
      <SignatureForm
        signature={signature}
        onSaved={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    fireEvent.change(screen.getByRole("textbox", { name: "Name" }), {
      target: { value: "Edited signature" },
    });
    emitImplicitNull("Owner");
    saveChanges();
    await waitFor(() =>
      expect(saves.signature).toHaveBeenCalledWith(
        expect.objectContaining({
          ownerAgentId: "agent-2",
          name: "Edited signature",
        }),
      ),
    );
    saves.signature.mockClear();
    await choose("Owner", "Workspace");
    saveChanges();
    await waitFor(() =>
      expect(saves.signature).toHaveBeenCalledWith(
        expect.objectContaining({ ownerAgentId: null }),
      ),
    );
  });

  it("changes SLA coverage only through the explicit 24/7 choice", async () => {
    render(
      <SlaPolicyForm policy={policy} onSaved={vi.fn()} onCancel={vi.fn()} />,
    );
    fireEvent.change(screen.getByRole("textbox", { name: "Name" }), {
      target: { value: "Edited SLA" },
    });
    emitImplicitNull("Business hours");
    saveChanges();
    await waitFor(() =>
      expect(saves.sla).toHaveBeenCalledWith(
        expect.objectContaining({
          businessHoursId: "hours-1",
          name: "Edited SLA",
        }),
      ),
    );
    saves.sla.mockClear();
    await choose("Business hours", "24/7 coverage");
    saveChanges();
    await waitFor(() =>
      expect(saves.sla).toHaveBeenCalledWith(
        expect.objectContaining({ businessHoursId: null }),
      ),
    );
  });

  it("does not clear a saved location relationship on implicit null", async () => {
    render(
      <LocationEditor
        isOpen
        location={{
          id: "location-1",
          type: "missionary",
          linked_id: "missionary-1",
          title: "Map marker",
        }}
        onOpenChange={vi.fn()}
      />,
    );
    emitImplicitNull("Link to Missionary");
    fireEvent.click(screen.getByRole("button", { name: "Update Location" }));
    await waitFor(() =>
      expect(saves.location).toHaveBeenCalledWith(
        expect.objectContaining({ linked_id: "missionary-1" }),
      ),
    );
  });
});
