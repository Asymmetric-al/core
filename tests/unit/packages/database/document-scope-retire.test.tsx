// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Plan 5.2: "a refused assignment or a change of signed-in user reloads
 * too" (council on the joined release, JB1), through the one bounded reload
 * every guard shares, with no page content of the wrong scope on screen
 * meanwhile and a way out when the reload does not happen (JB2).
 *
 * A retired scope sends nothing more (check of the fix lists, JR1): a
 * request with no scope would be resolved to the new person's only row, so
 * a delayed save or a poll of a document rendered for the first person would
 * run as the second, in the second person's organization. The own-API
 * wrapper and the browser client's Data API fetch answer it in the browser
 * with the refusal their callers already know: a 401 marked
 * `x-asym-scope-refused`.
 */

const reloadDocument = vi.hoisted(() => vi.fn());
vi.mock(
  "../../../../packages/database/document-reload",
  async (importOriginal) => {
    const actual = await importOriginal<Record<string, unknown>>();
    return {
      ...actual,
      reloadDocument,
      loadDocument: vi.fn(),
    };
  },
);

const TENANT = "00000000-0000-0000-0000-000000000001";
const SCOPE = {
  userId: "00000000-0000-4000-8000-0000000000a1",
  tenantId: TENANT,
  assignmentId: "00000000-0000-4000-8000-000000000101",
  addressPrefix: `/${TENANT}`,
};
const PERSON_A = SCOPE.userId;
const PERSON_B = "00000000-0000-4000-8000-0000000000b2";

/**
 * The configured project's session cookie, named as supabase-js names it
 * (`sb-<first label of the project's host>-auth-token`); only this one says
 * who is signed in (last read of the first release, L2).
 */
const SESSION_COOKIE = `sb-${new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname.split(".")[0]}-auth-token`;

/** The browser client's session cookie for `userId`, as @supabase/ssr writes it. */
function signInBrowserAs(userId: string | null) {
  document.cookie = `${SESSION_COOKIE}=; max-age=0; path=/`;
  if (userId === null) return;
  const json = JSON.stringify({ access_token: "t", user: { id: userId } });
  const value = `base64-${Buffer.from(json).toString("base64url")}`;
  document.cookie = `${SESSION_COOKIE}=${value}; path=/`;
}

async function load() {
  vi.resetModules();
  const scope = await import("../../../../packages/database/document-scope");
  const ownApi = await import("../../../../packages/database/own-api");
  const claim =
    await import("../../../../packages/database/document-reload-claim");
  const browser = await import("../../../../packages/database/supabase/client");
  return {
    ...scope,
    ...ownApi,
    ...claim,
    createBrowserClient: browser.createClient,
  };
}

/** Whether any request reached the network, to a path containing `part`. */
function reached(part: string): boolean {
  return fetchMock.mock.calls.some((call) => {
    const [input] = call as unknown as [RequestInfo | URL];
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input.url;
    return url.includes(part);
  });
}

/** The refusal the wrappers answer a retired scope with, made in the browser. */
async function expectRefusedInBrowser(response: Response) {
  expect(response.status).toBe(401);
  expect(response.headers.get("x-asym-scope-refused")).toBe("retired");
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

// Each case loads the modules afresh, and each copy watches the tab's focus
// and visibility; a copy left from an earlier case must not act in the next.
type ListenerCall = [
  string,
  EventListenerOrEventListenerObject,
  boolean | AddEventListenerOptions | undefined,
];
let listenerSpies: Array<
  [EventTarget, { mock: { calls: unknown[][] }; mockRestore(): void }]
> = [];

beforeEach(() => {
  listenerSpies = [
    [window, vi.spyOn(window, "addEventListener")],
    [document, vi.spyOn(document, "addEventListener")],
  ];
  reloadDocument.mockReset();
  fetchMock.mockReset();
  fetchMock.mockImplementation(async () => Response.json({}));
  vi.stubGlobal("fetch", fetchMock);
  window.sessionStorage.clear();
  window.history.replaceState(null, "", `${SCOPE.addressPrefix}/care`);
});

afterEach(() => {
  for (const [target, spy] of listenerSpies) {
    for (const [type, listener, options] of spy.mock.calls as ListenerCall[]) {
      target.removeEventListener(type, listener, options);
    }
    spy.mockRestore();
  }
  cleanup();
  vi.unstubAllGlobals();
  signInBrowserAs(null);
  // The real browser client of the Data API case may keep cookies of its own.
  for (const pair of document.cookie.split(";")) {
    const name = pair.trim().split("=")[0];
    if (name?.startsWith("sb-"))
      document.cookie = `${name}=; max-age=0; path=/`;
  }
  window.history.replaceState(null, "", "/");
});

describe("a change of signed-in person", () => {
  // Last read of the first release, L2: only this project's cookie names the
  // person. Another project's on the same host must not retire the scope.
  it("reads only this project's cookie: another project's beside it retires nothing", async () => {
    const json = JSON.stringify({ access_token: "t", user: { id: PERSON_B } });
    // Set first, so a reader taking the first sb-…-auth-token finds it.
    document.cookie = `sb-otherproject-auth-token=base64-${Buffer.from(json).toString("base64url")}; path=/`;
    signInBrowserAs(PERSON_A);
    try {
      const mod = await load();
      await renderCarePage(mod);
      act(() => {
        window.dispatchEvent(new Event("focus"));
      });
      await act(async () => {
        await mod.ownApiFetch("/api/admin/member-care/dashboard");
      });

      expect(reloadDocument).not.toHaveBeenCalled();
      expect(sent(0).get("x-asym-assignment")).toBe(SCOPE.assignmentId);
    } finally {
      document.cookie = "sb-otherproject-auth-token=; max-age=0; path=/";
    }
  });

  // L2: a cookie that cannot be read at hydration leaves no baseline; the
  // next check tries again, so the check is not blind for the page's life.
  it.each([
    [PERSON_B, true],
    [PERSON_A, false],
  ] as const)(
    "takes the baseline at the next check when the cookie was unreadable at hydration (later %s)",
    async (later, retires) => {
      document.cookie = `${SESSION_COOKIE}=base64-%%%not-base64%%%; path=/`;
      const mod = await load();
      await renderCarePage(mod);

      signInBrowserAs(later);
      act(() => {
        window.dispatchEvent(new Event("focus"));
      });

      expect(reloadDocument).toHaveBeenCalledTimes(retires ? 1 : 0);
    },
  );

  it("retires the scope: the next request is never sent, the page gives way to the notice, and the document reloads once", async () => {
    signInBrowserAs(PERSON_A);
    const mod = await load();
    await renderCarePage(mod);

    // Another tab signs in as someone else; the session cookie is shared.
    signInBrowserAs(PERSON_B);
    let response: Response | undefined;
    await act(async () => {
      response = await mod.ownApiFetch("/api/admin/member-care/dashboard", {
        method: "POST",
        body: "{}",
      });
    });

    expect(fetchMock).not.toHaveBeenCalled();
    await expectRefusedInBrowser(response!);
    expect(await response!.json()).toEqual({ error: "Unauthorized" });
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

  it("the browser client's Data API fetch sends nothing either; Auth requests still go out", async () => {
    signInBrowserAs(PERSON_A);
    const mod = await load();
    await renderCarePage(mod);
    const supabase = mod.createBrowserClient();

    signInBrowserAs(PERSON_B);
    let result: Awaited<ReturnType<typeof supabase.from>> | undefined;
    await act(async () => {
      result = (await supabase
        .from("care_notes")
        .insert({ body: "for the first organization" })) as never;
    });

    expect(reached("/rest/v1/")).toBe(false);
    const error = (
      result as unknown as { error: { message: string } | null; status: number }
    ).error;
    expect(error?.message).toBe("Unauthorized");
    expect((result as unknown as { status: number }).status).toBe(401);
    expect(reloadDocument).toHaveBeenCalledTimes(1);
  });

  it("a person who changed before the page hydrated: the first request is never sent", async () => {
    // The page was rendered on the server for person A; by the time it
    // hydrates, the browser's session is person B's.
    signInBrowserAs(PERSON_B);
    const mod = await load();
    await renderCarePage(mod);

    let response: Response | undefined;
    await act(async () => {
      response = await mod.ownApiFetch("/api/admin/member-care/dashboard");
    });

    expect(fetchMock).not.toHaveBeenCalled();
    await expectRefusedInBrowser(response!);
    expect(
      screen.queryByText("care rows of the first organization"),
    ).toBeNull();
  });

  it("a page outside the segment still calls without a scope, as before, while the scope is not retired", async () => {
    signInBrowserAs(PERSON_A);
    const mod = await load();
    await renderCarePage(mod);

    window.history.replaceState(null, "", "/login");
    await mod.ownApiFetch("/api/auth/session");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(sent(0).has("x-asym-tenant")).toBe(false);
    expect(sent(0).has("x-asym-assignment")).toBe(false);
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
    // Retired: the next request is answered in the browser, never sent.
    await expectRefusedInBrowser(
      await mod.ownApiFetch("/api/admin/member-care/dashboard"),
    );
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});

describe("the bounded reload", () => {
  it("reloads at most once; then the notice offers a way out and takes focus", async () => {
    signInBrowserAs(PERSON_A);
    const mod = await load();
    await renderCarePage(mod);
    // This address was already reloaded a moment ago, for a retired scope
    // (a crossing's claim would not bound it; JR3).
    expect(mod.claimDocumentReload("refused")).toBe(true);

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

  // Check of the fix lists, JR3: a render no longer forgets the reload, so
  // a page whose first scoped call is refused every time does not reload
  // for ever (claim, reload, render, forget, refuse).
  it("render, refuse, reload, render, refuse: the second refusal does not reload", async () => {
    signInBrowserAs(PERSON_A);
    const refuse = async () =>
      Response.json(
        { error: "Unauthorized" },
        {
          status: 401,
          headers: { "x-asym-scope-refused": "not_owned_or_inactive" },
        },
      );

    const first = await load();
    await renderCarePage(first);
    fetchMock.mockImplementationOnce(refuse);
    await act(async () => {
      await first.ownApiFetch("/api/admin/member-care/dashboard");
    });
    expect(reloadDocument).toHaveBeenCalledTimes(1);

    // The reload: a new document at the same address renders in its scope,
    // and its first scoped call is refused again.
    cleanup();
    const second = await load();
    await renderCarePage(second);
    fetchMock.mockImplementationOnce(refuse);
    await act(async () => {
      await second.ownApiFetch("/api/admin/member-care/dashboard");
    });

    expect(reloadDocument).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("status").textContent).toBe(
      "This page could not load again.",
    );
    expect(screen.getByRole("button", { name: "Reload" })).toBeTruthy();
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
