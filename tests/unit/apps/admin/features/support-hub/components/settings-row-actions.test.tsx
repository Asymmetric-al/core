// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) Round 12: the settings list is exercised at its public UI boundary.
import { SlaPolicyList } from "../../../../../../../apps/admin/features/support-hub/components/settings/sla/SlaPolicyList";

// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) Round 12: fixtures use the app's public wire-format types.
import type { SupportSlaPolicy } from "../../../../../../../apps/admin/features/support-hub/types";

const hooks = vi.hoisted(() => ({
  setDefault: vi.fn(),
  setDefaultPending: false,
  confirm: vi.fn(),
}));

function policy(id: string, name: string, isDefault: boolean) {
  return {
    id,
    tenantId: "tenant-1",
    name,
    description: null,
    firstResponseMinutes: 480,
    nextResponseMinutes: 720,
    resolutionMinutes: 7200,
    businessHoursId: null,
    isDefault,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  } as SupportSlaPolicy;
}

vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-inbox-settings",
  () => ({
    useSupportSlaPolicies: () => ({
      data: [
        policy("sla-standard", "Standard", true),
        policy("sla-urgent", "Urgent", false),
      ],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    }),
    useSupportBusinessHours: () => ({ data: [], isLoading: false }),
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-mutations",
  () => ({
    useDeleteSupportSlaPolicy: () => ({
      mutateAsync: vi.fn(),
      isPending: false,
    }),
    useSetDefaultSupportSlaPolicy: () => ({
      mutateAsync: hooks.setDefault,
      isPending: hooks.setDefaultPending,
    }),
    useSaveSupportSlaPolicy: () => ({ mutateAsync: vi.fn(), isPending: false }),
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/components/workspace/confirm-provider",
  () => ({ useConfirm: () => hooks.confirm }),
);
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

beforeEach(() => {
  hooks.setDefault.mockReset().mockResolvedValue(undefined);
  hooks.setDefaultPending = false;
  hooks.confirm.mockReset().mockResolvedValue(false);
});
afterEach(cleanup);

describe("SLA policy row actions", () => {
  it("keeps Edit visible and names each row's actions", () => {
    render(<SlaPolicyList />);
    expect(screen.getByRole("button", { name: "Edit Standard" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Edit Urgent" })).toBeTruthy();
  });

  it("offers Make default only for a policy that isn't the default", async () => {
    render(<SlaPolicyList />);
    expect(
      screen.queryByRole("button", { name: "Make Standard default" }),
    ).toBeNull();
    fireEvent.click(
      screen.getByRole("button", { name: "Make Urgent default" }),
    );
    await waitFor(() =>
      expect(hooks.setDefault).toHaveBeenCalledWith({ id: "sla-urgent" }),
    );
  });

  it("disables Make default while a default change is saving", async () => {
    hooks.setDefaultPending = true;
    render(<SlaPolicyList />);
    expect(
      screen
        .getByRole("button", { name: "Make Urgent default" })
        .hasAttribute("disabled"),
    ).toBe(true);
  });

  it("keeps Delete visible and behind the confirmation", async () => {
    render(<SlaPolicyList />);
    const remove = screen.getByRole("button", { name: "Delete Urgent" });
    fireEvent.click(remove);
    await waitFor(() => expect(hooks.confirm).toHaveBeenCalledOnce());
    expect(hooks.confirm.mock.calls[0]?.[0]).toMatchObject({
      title: "Delete the Urgent SLA policy?",
    });
  });
});
