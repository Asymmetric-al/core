/** @vitest-environment jsdom */

import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { createMCBootstrapState } from "../../../../../packages/lib/mission-control/bootstrap";
import {
  MCProvider,
  useMC,
} from "../../../../../packages/lib/mission-control/context";

import type { PropsWithChildren } from "react";

const signedInAdmin = {
  userId: "user-1",
  tenantId: "tenant-9",
  email: "jordan@hope.test",
  firstName: "Jordan",
  lastName: "Hale",
  profileRole: "admin",
} as const;

// The shell and Eve show the signed-in tenant. When the tenant row could not
// be joined, they must not invent an organization name or id.
describe("Mission Control tenant identity", () => {
  it("keeps the real tenant id but no invented name when the join is missing", () => {
    const state = createMCBootstrapState({
      ...signedInAdmin,
      tenant: null,
    } as Parameters<typeof createMCBootstrapState>[0]);
    expect(state.tenant).toEqual({ id: "tenant-9", name: "", slug: "" });
  });

  it("has no tenant in the client context until one is known", () => {
    const wrapper = ({ children }: PropsWithChildren) => (
      <MCProvider initialState={null}>{children}</MCProvider>
    );
    const { result } = renderHook(() => useMC(), { wrapper });
    expect(result.current.tenant).toBeNull();
  });

  it("keeps a bootstrap without a tenant tenant-less", () => {
    const initialState = createMCBootstrapState({
      ...signedInAdmin,
      tenantId: null,
      tenant: null,
    } as Parameters<typeof createMCBootstrapState>[0]);
    const wrapper = ({ children }: PropsWithChildren) => (
      <MCProvider initialState={initialState}>{children}</MCProvider>
    );
    const { result } = renderHook(() => useMC(), { wrapper });
    expect(result.current.tenant).toBeNull();
  });
});
