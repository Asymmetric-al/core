// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { SupportAgentSetupNotice } from "../../../../../../../apps/admin/features/support-hub/components/alerts/SupportAgentSetupNotice";

const state = vi.hoisted(() => ({
  agentId: null as string | null,
  ready: true,
  canManageAll: true,
}));
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/lib/current-agent",
  () => ({
    useCurrentSupportAgentId: () => state.agentId,
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-agents",
  () => ({
    useSupportAgents: () => ({ isReady: state.ready }),
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-saved-views",
  () => ({
    useSupportSavedViews: () => ({
      isReady: state.ready,
      access: { canManageAll: state.canManageAll },
    }),
  }),
);
afterEach(() => {
  cleanup();
  Object.assign(state, { agentId: null, ready: true, canManageAll: true });
});

it("directs an admin to collaborators without asking them to find another admin, and can be dismissed", () => {
  render(<SupportAgentSetupNotice />);
  expect(
    screen
      .getByRole("link", { name: "Review agent settings" })
      .getAttribute("href"),
  ).toBe("/support/settings/collaborators");
  expect(screen.queryByText(/Ask a support admin/)).toBeNull();
  fireEvent.click(
    screen.getByRole("button", { name: "Dismiss support agent setup" }),
  );
  expect(screen.queryByText("Support agent setup")).toBeNull();
});

it("gives non-admins the support-admin handoff without offering administrative setup", () => {
  state.canManageAll = false;
  render(<SupportAgentSetupNotice />);
  expect(screen.getByText(/Ask a support admin/)).toBeTruthy();
  expect(
    screen.queryByRole("link", { name: "Review agent settings" }),
  ).toBeNull();
});

it("waits for identity and permission data and stays hidden for agents", () => {
  state.ready = false;
  const { rerender } = render(<SupportAgentSetupNotice />);
  expect(screen.queryByText("Support agent setup")).toBeNull();
  state.ready = true;
  state.agentId = "agent-1";
  rerender(<SupportAgentSetupNotice />);
  expect(screen.queryByText("Support agent setup")).toBeNull();
});
