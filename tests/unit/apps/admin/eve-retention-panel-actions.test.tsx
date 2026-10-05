// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- AL-1931 Component integration tests exercise the actual admin panel, not an application dependency.
import { EveRetentionPanel } from "../../../../apps/admin/app/(app)/admin/eve/retention-panel";
import { getQueryClient } from "../../../../packages/database/providers/query-client";
import { QueryProvider } from "../../../../packages/database/providers/query-provider";

beforeEach(() => getQueryClient().clear());

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  getQueryClient().clear();
});

it("preserves the expiry action and blocks duplicate activation while pending", async () => {
  let completeExpiry: ((response: Response) => void) | undefined;
  const pendingExpiry = new Promise<Response>((resolve) => {
    completeExpiry = resolve;
  });
  const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    expect(input).toBe("/api/admin/eve/retention");
    if (init?.method === "POST") return pendingExpiry;
    return Promise.resolve(
      new Response(
        JSON.stringify({
          categories: [],
          artifacts: [],
          holds: [],
          lifecycle: [],
          requestId: "fixture-request",
        }),
        { status: 200 },
      ),
    );
  });
  vi.stubGlobal("fetch", fetchMock);
  const queryClient = getQueryClient();

  try {
    const view = render(
      <QueryProvider>
        <EveRetentionPanel />
      </QueryProvider>,
    );
    await waitFor(() =>
      expect(view.getByText("No replay artifacts.")).toBeTruthy(),
    );
    const button = view.getByRole("button", { name: "Run expiry" });

    fireEvent.click(button);
    await waitFor(() => {
      expect(
        fetchMock.mock.calls.filter(([, init]) => init?.method === "POST"),
      ).toHaveLength(1);
      expect(button.getAttribute("aria-disabled")).toBe("true");
    });
    fireEvent.click(button);
    expect(
      fetchMock.mock.calls.filter(([, init]) => init?.method === "POST"),
    ).toHaveLength(1);
    const [, request] =
      fetchMock.mock.calls.find(([, init]) => init?.method === "POST") ?? [];
    expect(request?.credentials).toBe("same-origin");
    expect(JSON.parse(String(request?.body))).toEqual({
      action: "run_expiry",
      limit: 100,
    });

    await act(async () => {
      completeExpiry?.(
        new Response(JSON.stringify({ ok: true }), { status: 200 }),
      );
      await pendingExpiry;
    });
    await waitFor(() =>
      expect(button.getAttribute("aria-disabled")).not.toBe("true"),
    );
  } finally {
    queryClient.clear();
  }
});

it("keeps the existing permission-error response visible without inventing success", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      expect(input).toBe("/api/admin/eve/retention");
      const payload =
        init?.method === "POST"
          ? { error: "Forbidden" }
          : {
              categories: [],
              artifacts: [],
              holds: [],
              lifecycle: [],
              requestId: "fixture-request",
            };
      return Promise.resolve(
        new Response(JSON.stringify(payload), {
          status: init?.method === "POST" ? 403 : 200,
        }),
      );
    }),
  );
  const queryClient = getQueryClient();
  try {
    const view = render(
      <QueryProvider>
        <EveRetentionPanel />
      </QueryProvider>,
    );
    await waitFor(() =>
      expect(view.getByText("No replay artifacts.")).toBeTruthy(),
    );
    fireEvent.click(view.getByRole("button", { name: "Run expiry" }));
    await waitFor(() => expect(view.getByText("Forbidden")).toBeTruthy());
  } finally {
    queryClient.clear();
  }
});
