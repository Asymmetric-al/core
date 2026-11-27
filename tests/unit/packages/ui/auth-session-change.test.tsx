// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  registerSessionChangeCleanup,
  runSessionChangeCleanups,
} from "../../../../packages/auth/client-session";
import { LoginScreen } from "../../../../packages/ui/components/auth/LoginScreen";
import { OrganizationChoiceSubmit } from "../../../../packages/ui/components/auth/organization-choice-submit";
import { ResetPasswordScreen } from "../../../../packages/ui/components/auth/ResetPasswordScreen";
import {
  QueryClient,
  QueryClientProvider,
} from "../../../../packages/ui/node_modules/@tanstack/react-query/build/modern/index.js";

const auth = vi.hoisted(() => ({
  signInWithPassword: vi.fn(),
  updateUser: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
}));
vi.mock("@asym/database/supabase", () => ({
  createBrowserClient: () => ({
    auth: { ...auth, getUser: async () => ({ data: { user: null } }) },
  }),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: auth.replace, refresh: auth.refresh }),
}));

let unregister: (() => void) | null = null;
const navigationsAtCleanup: number[] = [];

function watchCleanups() {
  unregister = registerSessionChangeCleanup(() => {
    navigationsAtCleanup.push(auth.replace.mock.calls.length);
  });
}

function renderLogin(demoOnly: boolean) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <LoginScreen appId="admin" nextPath="/web-studio" demoOnly={demoOnly} />
    </QueryClientProvider>,
  );
}

function signInWithPassword() {
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "fixture@example.test" },
  });
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: "fixture-password" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
}

beforeEach(() => {
  vi.resetAllMocks();
  navigationsAtCleanup.length = 0;
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => Response.json({ ok: true, roles: {} })),
  );
});
afterEach(() => {
  unregister?.();
  unregister = null;
  cleanup();
  vi.unstubAllGlobals();
});

describe("a change of person or organization runs the session-change cleanups when it completes (WP6 rest, pull request 2, round 2, G1)", () => {
  it("runs every registered cleanup, and none once it is unregistered", () => {
    const first = vi.fn();
    const second = vi.fn();
    const dropFirst = registerSessionChangeCleanup(first);
    const dropSecond = registerSessionChangeCleanup(second);
    runSessionChangeCleanups();
    dropFirst();
    runSessionChangeCleanups();
    dropSecond();
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(2);
  });

  it("runs them when a password sign-in succeeds, before the page moves on", async () => {
    auth.signInWithPassword.mockResolvedValueOnce({ error: null });
    watchCleanups();
    renderLogin(false);
    signInWithPassword();
    await waitFor(() => expect(auth.replace).toHaveBeenCalled());
    expect(navigationsAtCleanup).toEqual([0]);
  });

  it("does not run them when the password sign-in is refused", async () => {
    auth.signInWithPassword.mockResolvedValueOnce({
      error: { message: "Invalid login credentials" },
    });
    watchCleanups();
    renderLogin(false);
    signInWithPassword();
    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(navigationsAtCleanup).toEqual([]);
  });

  it("runs them when the demo sign-in succeeds, before the page moves on", async () => {
    watchCleanups();
    renderLogin(true);
    fireEvent.click(screen.getByRole("button", { name: "Demo access" }));
    await waitFor(() => expect(auth.replace).toHaveBeenCalled());
    expect(navigationsAtCleanup).toEqual([0]);
  });

  it("runs them when a new password is saved, before the page moves on", async () => {
    auth.updateUser.mockResolvedValueOnce({ data: {}, error: null });
    watchCleanups();
    render(
      <ResetPasswordScreen
        appId="admin"
        recovery={{ email: "ada@example.com", secondsLeft: 3600 }}
      />,
    );
    fireEvent.change(screen.getByLabelText("New password"), {
      target: { value: "long enough phrase" },
    });
    fireEvent.change(screen.getByLabelText("Confirm new password"), {
      target: { value: "long enough phrase" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save new password" }));
    await waitFor(() => expect(auth.replace).toHaveBeenCalled());
    expect(navigationsAtCleanup).toEqual([0]);
  });

  it("runs them when an organization is chosen", () => {
    watchCleanups();
    const choose = vi.fn((event: Event) => event.preventDefault());
    render(
      <form onSubmit={(event) => choose(event.nativeEvent)}>
        <OrganizationChoiceSubmit>Open Second Tenant</OrganizationChoiceSubmit>
      </form>,
    );
    act(() => {
      fireEvent.click(
        screen.getByRole("button", { name: "Open Second Tenant" }),
      );
    });
    expect(navigationsAtCleanup).toEqual([0]);
    expect(choose).toHaveBeenCalledTimes(1);
  });
});
