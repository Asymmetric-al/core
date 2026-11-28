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

import { LoginScreen } from "../../../../packages/ui/components/auth/LoginScreen";
import {
  QueryClient,
  QueryClientProvider,
} from "../../../../packages/ui/node_modules/@tanstack/react-query/build/modern/index.js";

const provider = vi.hoisted(() => ({
  signInWithPassword: vi.fn(),
  getUser: vi.fn(),
  getSession: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
}));
vi.mock("@asym/database/supabase", () => ({
  createBrowserClient: () => ({
    auth: {
      signInWithPassword: provider.signInWithPassword,
      getUser: provider.getUser,
      getSession: provider.getSession,
    },
  }),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: provider.replace, refresh: provider.refresh }),
}));

type Sent = { url: string; method: string; body: unknown };

function coreRoutes(answers: {
  signIn?: () => Promise<Response> | Response;
  session?: () => Promise<Response> | Response;
}) {
  const sent: Sent[] = [];
  const fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const method = init?.method ?? "GET";
    sent.push({
      url,
      method,
      body: init?.body ? JSON.parse(String(init.body)) : null,
    });
    if (url.endsWith("/api/auth/sign-in") && method === "POST")
      return (answers.signIn ?? (() => Response.json({ ok: true })))();
    if (url.endsWith("/api/auth/session"))
      return (answers.session ?? (() => Response.json({ user: null })))();
    if (url.endsWith("/api/auth/demo-account"))
      return Response.json({ roles: {} });
    throw new Error(`Unexpected request from the sign-in screen: ${url}`);
  });
  return { fetch, sent };
}

function renderLogin(nextPath: string | null = "/donor-dashboard") {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <LoginScreen appId="donor" nextPath={nextPath} demoOnly={false} />
    </QueryClientProvider>,
  );
}

function signIn(view: ReturnType<typeof render>) {
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "fixture@example.test" },
  });
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: "fixture-password" },
  });
  act(() => {
    view.container.querySelector("form")!.requestSubmit();
  });
}

const providerCalls = () =>
  provider.signInWithPassword.mock.calls.length +
  provider.getUser.mock.calls.length +
  provider.getSession.mock.calls.length;

beforeEach(() => {
  vi.resetAllMocks();
  for (const call of [
    provider.signInWithPassword,
    provider.getUser,
    provider.getSession,
  ])
    call.mockRejectedValue(new Error("The browser called the provider."));
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("the sign-in screen goes through Core (AL-2671 N4 PR 1)", () => {
  it("sends the email and password to Core's sign-in route only, then continues to the page asked for", async () => {
    const routes = coreRoutes({});
    vi.stubGlobal("fetch", routes.fetch);
    const view = renderLogin();
    signIn(view);

    await waitFor(() =>
      expect(provider.replace).toHaveBeenCalledWith("/donor-dashboard"),
    );
    expect(provider.refresh).toHaveBeenCalledTimes(1);
    const passwordSends = routes.sent.filter((request) =>
      JSON.stringify(request.body ?? "").includes("fixture-password"),
    );
    expect(passwordSends).toEqual([
      {
        url: "/api/auth/sign-in",
        method: "POST",
        body: { email: "fixture@example.test", password: "fixture-password" },
      },
    ]);
    expect(providerCalls()).toBe(0);
  });

  it("shows Core's own answer to a refusal and stays on the form", async () => {
    vi.stubGlobal(
      "fetch",
      coreRoutes({
        signIn: () =>
          Response.json(
            {
              ok: false,
              code: "SIGN_IN_REFUSED",
              error: "We couldn’t sign you in with that email and password.",
            },
            { status: 401 },
          ),
      }).fetch,
    );
    const view = renderLogin();
    signIn(view);

    expect(
      await screen.findByText(
        "We couldn’t sign you in with that email and password.",
      ),
    ).toBeTruthy();
    expect(provider.replace).not.toHaveBeenCalled();
    expect(providerCalls()).toBe(0);
  });

  it("says sign-in is unavailable when Core's route cannot be reached, without a technical message", async () => {
    vi.stubGlobal(
      "fetch",
      coreRoutes({
        signIn: () => {
          throw new TypeError("Failed to fetch");
        },
      }).fetch,
    );
    const view = renderLogin();
    signIn(view);

    expect(await screen.findByText("Unable to sign in.")).toBeTruthy();
    expect(screen.queryByText(/failed to fetch/i)).toBeNull();
  });

  it("reads an existing session from Core's session route, never the provider, and continues", async () => {
    const routes = coreRoutes({
      session: () => Response.json({ user: { id: "signed-in" } }),
    });
    vi.stubGlobal("fetch", routes.fetch);
    renderLogin("/donor-dashboard/giving");

    await waitFor(() =>
      expect(provider.replace).toHaveBeenCalledWith("/donor-dashboard/giving"),
    );
    expect(routes.sent.some(({ url }) => url === "/api/auth/session")).toBe(
      true,
    );
    expect(providerCalls()).toBe(0);
  });
});
