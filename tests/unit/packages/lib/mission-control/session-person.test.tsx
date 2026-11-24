/** @vitest-environment jsdom */

import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { PropsWithChildren } from "react";

/**
 * Council on the joined release, JB1 (a): Mission Control's client context
 * must not keep the person it was rendered for when the browser's session
 * becomes someone else's (another tab signed in as another person). It drops
 * that person and retires the document's scope, which reloads the document
 * once through the shared bounded claim (JB2).
 */

const h = vi.hoisted(() => ({
  onState: null as
    null | ((state: { user: { id: string } | null; loading: boolean }) => void),
  retireDocumentScope: vi.fn(),
}));

vi.mock("@asym/auth/client-session", () => ({
  subscribeToClientAuthState: (onState: typeof h.onState) => {
    h.onState = onState;
    return () => undefined;
  },
  signOutClientSession: vi.fn(),
}));
vi.mock("@asym/database/document-scope", () => ({
  retireDocumentScope: h.retireDocumentScope,
}));

const { createMCBootstrapState } =
  await import("../../../../../packages/lib/mission-control/bootstrap");
const { MCProvider, useMC } =
  await import("../../../../../packages/lib/mission-control/context");

const FIRST = "00000000-0000-4000-9000-0000000000a1";
const SECOND = "00000000-0000-4000-9000-0000000000b2";

function renderMissionControl() {
  const initialState = createMCBootstrapState({
    userId: FIRST,
    tenantId: "00000000-0000-0000-0000-000000000001",
    email: "first@example.test",
    firstName: "First",
    lastName: "Person",
    role: "admin",
    capabilities: ["care.access", "people.manage_members"],
    canManageMembers: true,
    currentMembershipId: "00000000-0000-4000-9000-0000000000m1",
    tenant: null,
  } as Parameters<typeof createMCBootstrapState>[0]);
  const wrapper = ({ children }: PropsWithChildren) => (
    <MCProvider initialState={initialState}>{children}</MCProvider>
  );
  return renderHook(() => useMC(), { wrapper });
}

beforeEach(() => {
  h.onState = null;
  h.retireDocumentScope.mockReset();
});

describe("Mission Control when the session's person changes", () => {
  it("keeps the person while the session is theirs", () => {
    const { result } = renderMissionControl();

    act(() => h.onState!({ user: { id: FIRST }, loading: false }));

    expect(result.current.user?.id).toBe(FIRST);
    expect(result.current.capabilities).toEqual([
      "care.access",
      "people.manage_members",
    ]);
    expect(result.current.canManageMembers).toBe(true);
    expect(result.current.currentMembershipId).toBe(
      "00000000-0000-4000-9000-0000000000m1",
    );
    expect(h.retireDocumentScope).not.toHaveBeenCalled();
  });

  it("drops the first person, clears capabilities, and retires the document's scope when another person's session arrives", () => {
    const { result } = renderMissionControl();
    expect(result.current.user?.id).toBe(FIRST);

    act(() => h.onState!({ user: { id: SECOND }, loading: false }));

    expect(result.current.user).toBeNull();
    expect(result.current.capabilities).toEqual([]);
    expect(result.current.canManageMembers).toBe(false);
    expect(result.current.currentMembershipId).toBeNull();
    expect(h.retireDocumentScope).toHaveBeenCalledTimes(1);
  });

  it("clears capabilities when an active browser session signs out", () => {
    const { result } = renderMissionControl();

    act(() => h.onState!({ user: { id: FIRST }, loading: false }));
    expect(result.current.capabilities).toEqual([
      "care.access",
      "people.manage_members",
    ]);

    act(() => h.onState!({ user: null, loading: false }));

    expect(result.current.user).toBeNull();
    expect(result.current.capabilities).toEqual([]);
    expect(result.current.canManageMembers).toBe(false);
    expect(result.current.currentMembershipId).toBeNull();
  });

  it("preserves server-bootstrapped capabilities when no browser session existed (httpOnly E2E bypass)", () => {
    const { result } = renderMissionControl();

    act(() => h.onState!({ user: null, loading: false }));

    expect(result.current.user).toBeNull();
    expect(result.current.capabilities).toEqual([
      "care.access",
      "people.manage_members",
    ]);
    expect(result.current.canManageMembers).toBe(true);
    expect(result.current.currentMembershipId).toBe(
      "00000000-0000-4000-9000-0000000000m1",
    );
  });
});
