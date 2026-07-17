import { beforeEach, describe, expect, it, vi } from "vitest";

import type { User } from "@supabase/supabase-js";

const { clearQueryClientMock, getQueryClientMock } = vi.hoisted(() => ({
  clearQueryClientMock: vi.fn(),
  getQueryClientMock: vi.fn(),
}));

vi.mock("@asym/database/providers", () => ({
  getQueryClient: getQueryClientMock,
}));

beforeEach(() => {
  vi.resetModules();
  clearQueryClientMock.mockReset();
  getQueryClientMock.mockReset();
  getQueryClientMock.mockReturnValue({ clear: clearQueryClientMock });
});

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
};

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((innerResolve) => {
    resolve = innerResolve;
  });
  return { promise, resolve };
}

async function flushPromises() {
  await Promise.resolve();
  await Promise.resolve();
}

function createProfileClient(profile: unknown) {
  const single = vi.fn(async () => ({ data: profile, error: null }));
  const eq = vi.fn(() => ({ single }));
  const select = vi.fn(() => ({ eq }));
  const from = vi.fn(() => ({ select }));
  return { from, select, eq, single };
}

describe("client session auth state", () => {
  it("loads the current user and profile through one module interface", async () => {
    const user = { id: "user-1", email: "donor@example.com" } as User;
    const profile = { id: "profile-1", user_id: "user-1", role: "donor" };
    const profileClient = createProfileClient(profile);
    const supabase = {
      auth: {
        getUser: vi.fn(async () => ({
          data: { user },
          error: null,
        })),
      },
      from: profileClient.from,
    };
    const { loadClientAuthState } =
      await import("../../../packages/auth/client-session");

    const state = await loadClientAuthState(supabase as never);

    expect(state).toEqual({ user, profile, loading: false });
    expect(profileClient.from).toHaveBeenCalledWith("profiles");
    expect(profileClient.select).toHaveBeenCalledWith("*");
    expect(profileClient.eq).toHaveBeenCalledWith("user_id", "user-1");
  });

  it("does not query profiles when there is no current user", async () => {
    const from = vi.fn();
    const supabase = {
      auth: {
        getUser: vi.fn(async () => ({
          data: { user: null },
          error: null,
        })),
      },
      from,
    };
    const { loadClientAuthState } =
      await import("../../../packages/auth/client-session");

    const state = await loadClientAuthState(supabase as never);

    expect(state).toEqual({ user: null, profile: null, loading: false });
    expect(from).not.toHaveBeenCalled();
  });

  it("ignores a stale initial profile load after a later signed-out event", async () => {
    const user = { id: "old-user" } as User;
    const initialUser = deferred<{ data: { user: User }; error: null }>();
    const profileClient = createProfileClient({ id: "old-profile" });
    const unsubscribe = vi.fn();
    let authCallback: ((event: string, session: null) => void) | null = null;
    const supabase = {
      auth: {
        getUser: vi.fn(() => initialUser.promise),
        onAuthStateChange: vi.fn((callback) => {
          authCallback = callback;
          return { data: { subscription: { unsubscribe } } };
        }),
      },
      from: profileClient.from,
    };
    const states: unknown[] = [];
    const { subscribeToClientAuthState } =
      await import("../../../packages/auth/client-session");

    const stop = subscribeToClientAuthState(
      (state) => {
        states.push(state);
      },
      { supabase: supabase as never },
    );

    authCallback?.("SIGNED_OUT", null);
    initialUser.resolve({ data: { user }, error: null });
    await flushPromises();
    stop();

    expect(states).toEqual([{ user: null, profile: null, loading: false }]);
    expect(clearQueryClientMock).toHaveBeenCalledOnce();
    expect(unsubscribe).toHaveBeenCalled();
  });

  it("clears cached queries when the authenticated user changes", async () => {
    const firstUser = { id: "user-1" } as User;
    const secondUser = { id: "user-2" } as User;
    const profileClient = createProfileClient(null);
    let authCallback:
      | ((event: string, session: { user: User } | null) => void)
      | null = null;
    const supabase = {
      auth: {
        getUser: vi.fn(async () => ({
          data: { user: firstUser },
          error: null,
        })),
        onAuthStateChange: vi.fn((callback) => {
          authCallback = callback;
          return {
            data: { subscription: { unsubscribe: vi.fn() } },
          };
        }),
      },
      from: profileClient.from,
    };
    const { subscribeToClientAuthState } =
      await import("../../../packages/auth/client-session");

    const stop = subscribeToClientAuthState(vi.fn(), {
      includeProfile: false,
      supabase: supabase as never,
    });
    await flushPromises();

    authCallback?.("TOKEN_REFRESHED", { user: firstUser });
    await flushPromises();
    expect(clearQueryClientMock).not.toHaveBeenCalled();

    authCallback?.("SIGNED_IN", { user: secondUser });
    await flushPromises();
    expect(clearQueryClientMock).toHaveBeenCalledOnce();

    stop();
  });
});

describe("client session sign-out", () => {
  it("does not clear browser auth or redirect when server sign-out fails", async () => {
    const browserSignOut = vi.fn();
    const notify = vi.fn();
    const redirect = vi.fn();
    const signOutOnServer = vi.fn(async () => ({
      ok: false,
      message: "Invalid sign-out request origin.",
    }));
    const { signOutClientSession } =
      await import("../../../packages/auth/client-session");

    const result = await signOutClientSession({
      createClient: () => ({ auth: { signOut: browserSignOut } }) as never,
      notify,
      redirect,
      signOutOnServer,
    });

    expect(result).toEqual({
      ok: false,
      redirected: false,
      message: "Invalid sign-out request origin.",
    });
    expect(notify).toHaveBeenCalledWith("Invalid sign-out request origin.");
    expect(browserSignOut).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it("fails closed when server sign-out rejects unexpectedly", async () => {
    const browserSignOut = vi.fn();
    const logger = { warn: vi.fn() };
    const notify = vi.fn();
    const redirect = vi.fn();
    const error = new Error("network unavailable");
    const signOutOnServer = vi.fn(async () => {
      throw error;
    });
    const { signOutClientSession } =
      await import("../../../packages/auth/client-session");

    const result = await signOutClientSession({
      createClient: () => ({ auth: { signOut: browserSignOut } }) as never,
      logger,
      notify,
      redirect,
      signOutOnServer,
    });

    expect(result).toEqual({
      ok: false,
      redirected: false,
      message: "Unable to sign out. Please try again.",
    });
    expect(logger.warn).toHaveBeenCalledWith(
      "[auth] server signout request failed",
      error,
    );
    expect(notify).toHaveBeenCalledWith(
      "Unable to sign out. Please try again.",
    );
    expect(browserSignOut).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it("clears browser auth with local scope and redirects after server sign-out succeeds", async () => {
    const browserSignOut = vi.fn(async () => ({ error: null }));
    const redirect = vi.fn();
    const signOutOnServer = vi.fn(async () => ({ ok: true }));
    const { signOutClientSession } =
      await import("../../../packages/auth/client-session");

    const result = await signOutClientSession({
      createClient: () => ({ auth: { signOut: browserSignOut } }) as never,
      redirect,
      signOutOnServer,
    });

    expect(result).toEqual({ ok: true, redirected: true });
    expect(browserSignOut).toHaveBeenCalledWith({ scope: "local" });
    expect(clearQueryClientMock).toHaveBeenCalledOnce();
    expect(redirect).toHaveBeenCalledWith("/login");
  });

  it("still redirects when confirmed server sign-out succeeds but browser cleanup fails", async () => {
    const browserSignOut = vi.fn(async () => {
      throw new Error("local storage unavailable");
    });
    const logger = { warn: vi.fn(), error: vi.fn() };
    const redirect = vi.fn();
    const signOutOnServer = vi.fn(async () => ({ ok: true }));
    const { signOutClientSession } =
      await import("../../../packages/auth/client-session");

    const result = await signOutClientSession({
      createClient: () => ({ auth: { signOut: browserSignOut } }) as never,
      logger,
      redirect,
      signOutOnServer,
    });

    expect(result).toEqual({ ok: true, redirected: true });
    expect(logger.warn).toHaveBeenCalledWith(
      "[auth] browser signout cleanup failed",
      expect.any(Error),
    );
    expect(clearQueryClientMock).toHaveBeenCalledOnce();
    expect(redirect).toHaveBeenCalledWith("/login");
  });
});
