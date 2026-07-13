/** @vitest-environment jsdom */

import { getQueryClient, QueryProvider } from "@asym/database/providers";
import { act, renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { isCrmNamedViewsQueryEnabled } from "../../../../packages/database/hooks/admin-crm-named-views";
import {
  ADMIN_CRM_TABLE_PREFERENCES_QUERY_KEY,
  isCrmTablePreferencesQueryEnabled,
  useSaveCrmTenantDefault,
} from "../../../../packages/database/hooks/admin-crm-table-preferences";

describe("CRM table preference query guards", () => {
  it("disables table-scoped queries before tableId is known", () => {
    expect(isCrmTablePreferencesQueryEnabled("")).toBe(false);
    expect(isCrmNamedViewsQueryEnabled("")).toBe(false);
  });

  it("enables table-scoped queries once tableId is known", () => {
    expect(isCrmTablePreferencesQueryEnabled("crm-gift-history")).toBe(true);
    expect(isCrmNamedViewsQueryEnabled("crm-gift-history")).toBe(true);
  });
});

describe("useSaveCrmTenantDefault", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    getQueryClient().clear();
  });

  function renderTenantDefaultHook() {
    // In jsdom the provider reuses the browser query-client singleton, so the
    // invalidation spy observes the same client the hook talks to.
    const queryClient = getQueryClient();
    queryClient.clear();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryProvider, null, children);
    const rendered = renderHook(
      () => useSaveCrmTenantDefault("crm.giftHistory"),
      { wrapper },
    );

    return { ...rendered, invalidateSpy };
  }

  it("PUTs the tenant-default patch and refreshes the table-preferences query", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        tenantDefault: {
          actionId: "resend_receipt",
          schemaVersion: 1,
          settings: {},
        },
        requestId: "req-1",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { invalidateSpy, result } = renderTenantDefaultHook();

    act(() => {
      result.current.mutate({
        columns: { designation: false, statusLine: true },
        filtersSort: {
          sortField: "amountCents",
          sortDirection: "asc",
          paymentStatus: "all",
          issue: "all",
        },
        pinnedActionId: "resend_receipt",
        delegatedManagerProfileIds: null,
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/crm/table-preferences/tenant-default",
      expect.objectContaining({ method: "PUT" }),
    );
    const requestInit = fetchMock.mock.calls[0]![1] as RequestInit;
    expect(JSON.parse(requestInit.body as string)).toEqual({
      tableId: "crm.giftHistory",
      columns: { designation: false, statusLine: true },
      filtersSort: {
        sortField: "amountCents",
        sortDirection: "asc",
        paymentStatus: "all",
        issue: "all",
      },
      pinnedActionId: "resend_receipt",
      delegatedManagerProfileIds: null,
    });

    // The resolved user → tenant → system fallback refreshes from the server.
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: [...ADMIN_CRM_TABLE_PREFERENCES_QUERY_KEY, "crm.giftHistory"],
    });
  });

  it("surfaces the server error message on rejected saves", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        json: async () => ({
          error: "Forbidden: requires crm.gift_history.manage_view_defaults",
        }),
      }),
    );

    const { result } = renderTenantDefaultHook();

    act(() => {
      result.current.mutate({ pinnedActionId: "resend_receipt" });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(result.current.error?.message).toBe(
      "Forbidden: requires crm.gift_history.manage_view_defaults",
    );
  });
});
