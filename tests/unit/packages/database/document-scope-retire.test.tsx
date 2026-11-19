// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Plan 5.2: "a refused assignment or a change of signed-in user reloads
 * too" (council on the joined release, JB1), through the one bounded reload
 * every guard shares, with no page content of the wrong scope on screen
 * meanwhile and a way out when the reload does not happen (JB2).
 */

const reloadDocument = vi.hoisted(() => vi.fn());
vi.mock("../../../../packages/database/document-reload", () => ({
  reloadDocument,
  loadDocument: vi.fn(),
}));

const TENANT = "00000000-0000-0000-0000-000000000001";
const SCOPE = {
  userId: "00000000-0000-4000-8000-0000000000a1",
  tenantId: TENANT,
  assignmentId: "00000000-0000-4000-8000-000000000101",
  addressPrefix: `/${TENANT}`,
};
const PERSON_A = SCOPE.userId;
const PERSON_B = "00000000-0000-4000-8000-0000000000b2";

/** The browser client's session cookie for `userId`, as @supabase/ssr writes it. */
function signInBrowserAs(userId: string | null) {
  document.cookie = "sb-test-auth-token=; max-age=0; path=/";
  if (userId === null) return;
  const json = JSON.stringify({ access_token: "t", user: { id: userId } });
  const value = `base64-${Buffer.from(json).toString("base64url")}`;
  document.cookie = `sb-test-auth-token=${value}; path=/`;
}

async function load() {
  vi.resetModules();
  const scope = await import("../../../../packages/database/document-scope");
  const ownApi = await import("../../../../packages/database/own-api");
  const claim =
    await import("../../../../packages/database/document-reload-claim");
  return { ...scope, ...ownApi, ...claim };
}

const fetchMock = vi.fn(async () => Response.json({}));
function sent(call: number): Headers {
  return (fetchMock.mock.calls[call] as unknown as [string, RequestInit])[1]
    .headers as Headers;
}

async function renderCarePage(
  mod: Awaited<ReturnType<typeof load>>,
): Promise<void> {
  render(
    <mod.DocumentScopeProvider scope={SCOPE}>
      <p>care rows of the first organization</p>
    </mod.DocumentScopeProvider>,
  );
  expect(screen.getByText("care rows of the first organization")).toBeTruthy();
}

beforeEach(() => {
  reloadDocument.mockReset();
  fetchMock.mockReset();
  fetchMock.mockImplementation(async () => Response.json({}));
  vi.stubGlobal("fetch", fetchMock);
  window.sessionStorage.clear();
  window.history.replaceState(null, "", `${SCOPE.addressPrefix}/care`);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  signInBrowserAs(null);
  window.history.replaceState(null, "", "/");
});

describe("a change of signed-in person", () => {
  it("retires the scope: the next request carries none, the page gives way to the notice, and the document reloads once", async () => {
    signInBrowserAs(PERSON_A);
    const mod = await load();
    await renderCarePage(mod);

    // Another tab signs in as someone else; the session cookie is shared.
    signInBrowserAs(PERSON_B);
    await act(async () => {
      await mod.ownApiFetch("/api/admin/member-care/dashboard");
    });

    expect(sent(0).has("x-asym-tenant")).toBe(false);
    expect(sent(0).has("x-asym-assignment")).toBe(false);
    expect(mod.getDocumentScope()).toBeNull();
    expect(
      screen.queryByText("care rows of the first organization"),
    ).toBeNull();
    expect(screen.getByRole("status").textContent).toBe(
      "Loading this page again…",
    );
    expect(reloadDocument).toHaveBeenCalledTimes(1);
  });

  it("retires the scope when the person signed out in another tab, on returning to the tab, with no request made", async () => {
    signInBrowserAs(PERSON_A);
    const mod = await load();
    await renderCarePage(mod);

    signInBrowserAs(null);
    act(() => {
      window.dispatchEvent(new Event("focus"));
    });

    expect(
      screen.queryByText("care rows of the first organization"),
    ).toBeNull();
    expect(reloadDocument).toHaveBeenCalledTimes(1);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("keeps the scope of an identity the browser cannot see (no session cookie when it loaded)", async () => {
    signInBrowserAs(null);
    const mod = await load();
    await renderCarePage(mod);

    await mod.ownApiFetch("/api/admin/member-care/dashboard");
    act(() => {
      window.dispatchEvent(new Event("focus"));
    });

    expect(sent(0).get("x-asym-assignment")).toBe(SCOPE.assignmentId);
    expect(
      screen.getByText("care rows of the first organization"),
    ).toBeTruthy();
    expect(reloadDocument).not.toHaveBeenCalled();
  });
});

describe("a refused assignment", () => {
  it("retires the scope on a response marked x-asym-scope-refused, and on no other 401 or 403", async () => {
    signInBrowserAs(PERSON_A);
    const mod = await load();
    await renderCarePage(mod);

    for (const status of [401, 403]) {
      fetchMock.mockImplementationOnce(async () =>
        Response.json({ error: "Forbidden" }, { status }),
      );
      await act(async () => {
        await mod.ownApiFetch("/api/admin/member-care/dashboard");
      });
    }
    expect(
      screen.getByText("care rows of the first organization"),
    ).toBeTruthy();
    expect(reloadDocument).not.toHaveBeenCalled();

    fetchMock.mockImplementationOnce(async () =>
      Response.json(
        { error: "Unauthorized" },
        {
          status: 401,
          headers: { "x-asym-scope-refused": "not_owned_or_inactive" },
        },
      ),
    );
    await act(async () => {
      await mod.ownApiFetch("/api/admin/member-care/dashboard");
    });

    expect(
      screen.queryByText("care rows of the first organization"),
    ).toBeNull();
    expect(reloadDocument).toHaveBeenCalledTimes(1);
    await mod.ownApiFetch("/api/admin/member-care/dashboard");
    expect(sent(3).has("x-asym-assignment")).toBe(false);
  });
});

describe("the bounded reload", () => {
  it("reloads at most once; then the notice offers a way out and takes focus", async () => {
    signInBrowserAs(PERSON_A);
    const mod = await load();
    await renderCarePage(mod);
    // This address was already reloaded a moment ago.
    expect(mod.claimDocumentReload()).toBe(true);

    signInBrowserAs(PERSON_B);
    act(() => {
      window.dispatchEvent(new Event("focus"));
    });

    expect(reloadDocument).not.toHaveBeenCalled();
    expect(screen.getByRole("status").textContent).toBe(
      "This page could not load again.",
    );
    const reload = screen.getByRole("button", { name: "Reload" });
    expect(document.activeElement).toBe(reload);
    expect(
      screen.getByRole("link", { name: "Go to home" }).getAttribute("href"),
    ).toBe("/");
    expect(
      screen.queryByText("care rows of the first organization"),
    ).toBeNull();
  });

  it("offers the way out when the reload has not happened after a while (Stop, offline)", async () => {
    vi.useFakeTimers();
    try {
      signInBrowserAs(PERSON_A);
      const mod = await load();
      await renderCarePage(mod);
      signInBrowserAs(PERSON_B);
      act(() => {
        window.dispatchEvent(new Event("focus"));
      });
      expect(reloadDocument).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole("button", { name: "Reload" })).toBeNull();

      act(() => {
        vi.advanceTimersByTime(6_000);
      });
      expect(screen.getByRole("button", { name: "Reload" })).toBeTruthy();
    } finally {
      vi.useRealTimers();
    }
  });
});
