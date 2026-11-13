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

// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) Round 12: settings lists are exercised at their public UI boundary.
import { AutomationRuleList } from "../../../../../../../apps/admin/features/support-hub/components/settings/automations/AutomationRuleList";
// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) Round 12: settings lists are exercised at their public UI boundary.
import { BusinessHoursList } from "../../../../../../../apps/admin/features/support-hub/components/settings/business-hours/BusinessHoursList";
// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) Round 12: settings lists are exercised at their public UI boundary.
import { CannedResponseList } from "../../../../../../../apps/admin/features/support-hub/components/settings/canned-responses/CannedResponseList";
// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) Round 12: settings lists are exercised at their public UI boundary.
import { AgentsList } from "../../../../../../../apps/admin/features/support-hub/components/settings/collaborators/AgentsList";
// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) Round 12: settings lists are exercised at their public UI boundary.
import { TeamList } from "../../../../../../../apps/admin/features/support-hub/components/settings/collaborators/TeamList";
// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) Round 12: settings lists are exercised at their public UI boundary.
import { LabelsSettingsPanel } from "../../../../../../../apps/admin/features/support-hub/components/settings/labels/LabelsSettingsPanel";
// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) Round 12: settings lists are exercised at their public UI boundary.
import { MacroList } from "../../../../../../../apps/admin/features/support-hub/components/settings/macros/MacroList";
// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) Round 12: settings lists are exercised at their public UI boundary.
import { SavedViewsList } from "../../../../../../../apps/admin/features/support-hub/components/settings/saved-views/SavedViewsList";
// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) Round 12: the shared settings load state is exercised directly.
import { SettingsListState } from "../../../../../../../apps/admin/features/support-hub/components/settings/SettingsListState";
// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) Round 12: settings lists are exercised at their public UI boundary.
import { SignatureList } from "../../../../../../../apps/admin/features/support-hub/components/settings/signatures/SignatureList";
// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) Round 12: settings lists are exercised at their public UI boundary.
import { SlaPolicyList } from "../../../../../../../apps/admin/features/support-hub/components/settings/sla/SlaPolicyList";

import type * as React from "react";

interface HookState {
  data: unknown[];
  isLoading: boolean;
  isError: boolean;
  refetch: ReturnType<typeof vi.fn>;
}

const hooks = vi.hoisted(() => {
  const state: Record<string, HookState> = {};
  const read = (name: string) => () => {
    const entry = state[name];
    return {
      data: entry?.data ?? [],
      isLoading: entry?.isLoading ?? false,
      isError: entry?.isError ?? false,
      isReady: !(entry?.isLoading || entry?.isError),
      refetch: entry?.refetch,
      access: { agentId: null, canManageAll: true },
    };
  };
  return { state, read };
});

vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-agents",
  () => ({
    useSupportAgents: hooks.read("useSupportAgents"),
    useSupportTeams: hooks.read("useSupportTeams"),
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-automation-rules",
  () => ({
    useSupportAutomationRules: hooks.read("useSupportAutomationRules"),
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-inbox-settings",
  () => ({
    useSupportBusinessHours: hooks.read("useSupportBusinessHours"),
    useSupportSlaPolicies: hooks.read("useSupportSlaPolicies"),
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-canned-responses",
  () => ({
    useSupportCannedResponses: hooks.read("useSupportCannedResponses"),
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-labels",
  () => ({ useSupportLabels: hooks.read("useSupportLabels") }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-macros",
  () => ({ useSupportMacros: hooks.read("useSupportMacros") }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-saved-views",
  () => ({ useSupportSavedViews: hooks.read("useSupportSavedViews") }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-signatures",
  () => ({ useSupportSignatures: hooks.read("useSupportSignatures") }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-mutations",
  () => {
    const mutation = () => ({ mutateAsync: vi.fn(), isPending: false });
    return {
      useDeleteSupportAutomationRule: mutation,
      useDeleteSupportBusinessHours: mutation,
      useDeleteSupportCannedResponse: mutation,
      useDeleteSupportLabel: mutation,
      useDeleteSupportMacro: mutation,
      useDeleteSupportSavedView: mutation,
      useDeleteSupportSignature: mutation,
      useDeleteSupportSlaPolicy: mutation,
      useDeleteSupportTeam: mutation,
      useSetDefaultSupportSignature: mutation,
      useSetDefaultSupportSlaPolicy: mutation,
      useSaveSupportBusinessHours: mutation,
      useSaveSupportSignature: mutation,
      useSaveSupportSlaPolicy: mutation,
    };
  },
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/components/workspace/confirm-provider",
  () => ({ useConfirm: () => vi.fn().mockResolvedValue(false) }),
);
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

interface ListCase {
  name: string;
  Component: () => React.ReactElement;
  hook: string;
  noun: string;
  emptyTitle: RegExp;
  createButton: string | null;
}

const LISTS: ListCase[] = [
  {
    name: "collaborators",
    Component: AgentsList,
    hook: "useSupportAgents",
    noun: "collaborators",
    emptyTitle: /No collaborators yet/,
    createButton: null,
  },
  {
    name: "teams",
    Component: TeamList,
    hook: "useSupportTeams",
    noun: "teams",
    emptyTitle: /No teams yet/,
    createButton: "New team",
  },
  {
    name: "SLA policies",
    Component: SlaPolicyList,
    hook: "useSupportSlaPolicies",
    noun: "SLA policies",
    emptyTitle: /No SLA policies yet/,
    createButton: "New policy",
  },
  {
    name: "inbox rules",
    Component: AutomationRuleList,
    hook: "useSupportAutomationRules",
    noun: "inbox rules",
    emptyTitle: /No inbox rules yet/,
    createButton: "New rule",
  },
  {
    name: "labels",
    Component: LabelsSettingsPanel,
    hook: "useSupportLabels",
    noun: "labels",
    emptyTitle: /No labels yet/,
    createButton: "New label",
  },
  {
    name: "macros",
    Component: MacroList,
    hook: "useSupportMacros",
    noun: "macros",
    emptyTitle: /No macros yet/,
    createButton: "New macro",
  },
  {
    name: "canned responses",
    Component: CannedResponseList,
    hook: "useSupportCannedResponses",
    noun: "canned responses",
    emptyTitle: /No canned responses yet/,
    createButton: "New response",
  },
  {
    name: "business hours",
    Component: BusinessHoursList,
    hook: "useSupportBusinessHours",
    noun: "business hours",
    emptyTitle: /No business hours yet/,
    createButton: "New schedule",
  },
  {
    name: "signatures",
    Component: SignatureList,
    hook: "useSupportSignatures",
    noun: "signatures",
    emptyTitle: /No signatures yet/,
    createButton: "New signature",
  },
  {
    name: "saved views",
    Component: SavedViewsList,
    hook: "useSupportSavedViews",
    noun: "saved views",
    emptyTitle: /No saved views yet/,
    createButton: null,
  },
];

function setHook(name: string, patch: Partial<HookState>) {
  hooks.state[name] = {
    data: [],
    isLoading: false,
    isError: false,
    refetch: vi.fn().mockResolvedValue(undefined),
    ...patch,
  };
}

beforeEach(() => {
  for (const key of Object.keys(hooks.state)) delete hooks.state[key];
});
afterEach(cleanup);

describe("Support settings lists while loading or after a failed load", () => {
  it.each(LISTS)(
    "$name: shows a loading status, not the empty state, during the first load",
    ({ Component, hook, noun, emptyTitle, createButton }) => {
      setHook(hook, { isLoading: true });
      render(<Component />);
      expect(screen.getByRole("status").textContent).toContain(
        `Loading ${noun}`,
      );
      expect(screen.queryByText(emptyTitle)).toBeNull();
      if (createButton) {
        expect(
          screen.getByRole("button", { name: createButton }),
        ).toHaveProperty("disabled", true);
      }
    },
  );

  it.each(LISTS)(
    "$name: shows the failure with Try again instead of the empty state",
    async ({ Component, hook, noun, emptyTitle, createButton }) => {
      setHook(hook, { isError: true });
      render(<Component />);
      const alert = screen.getByRole("alert");
      expect(alert.textContent).toContain(`Couldn’t load ${noun}`);
      expect(screen.queryByText(emptyTitle)).toBeNull();
      // A failed read must not lead staff into creating a duplicate.
      if (createButton) {
        expect(
          screen.getByRole("button", { name: createButton }),
        ).toHaveProperty("disabled", true);
      }
      fireEvent.click(within(alert).getByRole("button", { name: "Try again" }));
      await waitFor(() =>
        expect(hooks.state[hook]?.refetch).toHaveBeenCalledOnce(),
      );
    },
  );

  it.each(LISTS)(
    "$name: shows the empty state only once an empty load succeeded",
    ({ Component, hook, emptyTitle }) => {
      setHook(hook, {});
      render(<Component />);
      expect(screen.getAllByText(emptyTitle).length).toBeGreaterThan(0);
      expect(screen.queryByRole("alert")).toBeNull();
      expect(screen.queryByRole("status")).toBeNull();
    },
  );

  it.each(LISTS.filter((list) => list.createButton !== null))(
    "$name: offers create once, from the empty state, when there is nothing yet",
    ({ Component, hook, createButton }) => {
      setHook(hook, {});
      render(<Component />);
      const buttons = screen.getAllByRole("button", { name: createButton! });
      expect(buttons).toHaveLength(1);
      expect(buttons[0]).toHaveProperty("disabled", false);
    },
  );

  it("shows each label in its own colour, as the inbox does", () => {
    setHook("useSupportLabels", {
      data: [
        {
          id: "label-1",
          tenantId: "tenant-1",
          name: "Receipts",
          slug: "receipts",
          tone: "blue",
          description: null,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ],
    });
    render(<LabelsSettingsPanel />);
    const badge = screen.getByText("Receipts");
    expect(badge.getAttribute("data-slot")).toBe("badge");
    expect(badge.className).toContain("text-info");
  });

  it("keeps loaded rows visible when a background refresh fails", () => {
    setHook("useSupportLabels", {
      isError: true,
      data: [
        {
          id: "label-1",
          tenantId: "tenant-1",
          name: "Receipts",
          slug: "receipts",
          tone: "blue",
          description: null,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ],
    });
    render(<LabelsSettingsPanel />);
    expect(screen.getByText("Receipts")).toBeTruthy();
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByRole("button", { name: "New label" })).toHaveProperty(
      "disabled",
      false,
    );
  });
});

describe("SettingsListState", () => {
  it("disables Try again while the retry runs", async () => {
    let finish: () => void = () => undefined;
    const onRetry = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    render(
      <SettingsListState
        noun="labels"
        isLoading={false}
        isError
        itemCount={0}
        onRetry={onRetry}
      >
        <p>rows</p>
      </SettingsListState>,
    );
    const retry = screen.getByRole("button", { name: "Try again" });
    fireEvent.click(retry);
    await waitFor(() =>
      expect(retry.getAttribute("aria-disabled")).toBe("true"),
    );
    fireEvent.click(retry);
    expect(onRetry).toHaveBeenCalledOnce();
    finish();
    await waitFor(() =>
      expect(retry.getAttribute("aria-disabled")).not.toBe("true"),
    );
    expect(screen.queryByText("rows")).toBeNull();
  });

  it("renders its children once rows are on hand", () => {
    render(
      <SettingsListState
        noun="labels"
        isLoading
        isError={false}
        itemCount={2}
        onRetry={vi.fn()}
      >
        <p>rows</p>
      </SettingsListState>,
    );
    expect(screen.getByText("rows")).toBeTruthy();
    expect(screen.queryByRole("status")).toBeNull();
  });
});

describe("Support settings that are stored but not applied yet", () => {
  const OVERCLAIMS =
    /Drives SLA timers|enable SLA timers|used by SLA timers|append the default signature|override the workspace default|Applied to (new conversations|inboxes)|fall back to the default/i;

  it.each([
    {
      name: "business hours",
      Component: BusinessHoursList,
      create: "New schedule",
      note: /reports business-hours filter/,
    },
    {
      name: "SLA policies",
      Component: SlaPolicyList,
      create: "New policy",
      note: /not attached to conversations yet, so no timers run/,
    },
    {
      name: "signatures",
      Component: SignatureList,
      create: "New signature",
      note: /Saved signatures aren’t added to replies yet/,
    },
  ])(
    "$name: says once what is not applied and promises nothing that doesn't run",
    ({ Component, create, note }) => {
      const { container } = render(<Component />);
      const notes = screen.getAllByRole("note");
      expect(notes).toHaveLength(1);
      expect(notes[0]?.textContent).toContain("Saved, not applied yet");
      expect(notes[0]?.textContent).toMatch(note);
      expect(container.textContent).not.toMatch(OVERCLAIMS);

      fireEvent.click(screen.getByRole("button", { name: create }));
      // The editor opens in a sheet outside the list's container.
      const editor = screen.getByRole("dialog");
      expect(editor.textContent).not.toMatch(OVERCLAIMS);
      // The editor doesn't repeat the page's note.
      expect(within(editor).queryAllByRole("note")).toHaveLength(0);
    },
  );

  it.each([
    {
      name: "automation rules",
      Component: AutomationRuleList,
      note: /Rules don’t run on their own yet/,
    },
    {
      name: "teams",
      Component: TeamList,
      note: /can’t be assigned to a team yet/,
    },
  ])("$name: says once what doesn't run yet", ({ Component, note }) => {
    const { container } = render(<Component />);
    const notes = screen.getAllByRole("note");
    expect(notes).toHaveLength(1);
    expect(notes[0]?.textContent).toContain("Saved, not applied yet");
    expect(notes[0]?.textContent).toMatch(note);
    expect(container.textContent).not.toMatch(/route by function|routing/i);
  });

  it("macros: notes skipped team steps only when a macro has one", () => {
    const macro = (actions: unknown[]) => ({
      id: `macro-${actions.length}`,
      name: "Receipt resend",
      description: null,
      actions,
    });
    setHook("useSupportMacros", {
      data: [macro([{ kind: "set_status", status: "resolved" }])],
    });
    const { unmount } = render(<MacroList />);
    expect(screen.queryByRole("note")).toBeNull();
    unmount();

    setHook("useSupportMacros", {
      data: [macro([{ kind: "assign_team", teamId: "team-1" }])],
    });
    render(<MacroList />);
    expect(screen.getByRole("note").textContent).toMatch(
      /Assign team steps are skipped when a macro runs/,
    );
  });

  it("says business hours are read as UTC instead of promising time zones", () => {
    render(<BusinessHoursList />);
    fireEvent.click(screen.getByRole("button", { name: "New schedule" }));
    const timezone = screen.getByRole("textbox", { name: "Timezone" });
    const describedBy = (timezone.getAttribute("aria-describedby") ?? "")
      .split(" ")
      .map((id) => document.getElementById(id)?.textContent ?? "")
      .join(" ");
    expect(describedBy).toMatch(/reads the times as UTC/);
  });
});
