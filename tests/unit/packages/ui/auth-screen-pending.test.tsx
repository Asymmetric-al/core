// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { AuthApiError } from "@supabase/supabase-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LoginScreen } from "../../../../packages/ui/components/auth/LoginScreen";
import { RegisterScreen } from "../../../../packages/ui/components/auth/RegisterScreen";
import {
  QueryClient,
  QueryClientProvider,
} from "../../../../packages/ui/node_modules/@tanstack/react-query/build/modern/index.js";

const auth = vi.hoisted(() => ({
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
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

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

function fillCredentials() {
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "fixture@example.test" },
  });
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: "fixture-password" },
  });
}

function renderRegistration() {
  const view = render(<RegisterScreen appId="donor" enabled />);
  fireEvent.change(screen.getByLabelText("First name"), {
    target: { value: "Fixture" },
  });
  fireEvent.change(screen.getByLabelText("Last name"), {
    target: { value: "User" },
  });
  fillCredentials();
  return view;
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => Response.json({ roles: {} })),
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("auth form pending submissions", () => {
  it("marks the shared browser when registration immediately establishes a session", async () => {
    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "1");
    try {
      auth.signUp.mockResolvedValueOnce({ data: { session: {} }, error: null });
      renderRegistration();
      fireEvent.click(screen.getByRole("button", { name: "Create account" }));
      await waitFor(() =>
        expect(document.cookie).toContain("asym_clipboard_reset=1"),
      );
    } finally {
      document.cookie = "asym_clipboard_reset=; Path=/; Max-Age=0";
      vi.unstubAllEnvs();
    }
  });

  it("locks login with a natively disabled submit button and unlocks after failure", async () => {
    const pending = deferred<Response>();
    const signIn = vi
      .fn<(body: unknown) => Promise<Response>>()
      .mockReturnValueOnce(pending.promise)
      .mockResolvedValueOnce(Response.json({ ok: true }));
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) =>
        String(input).endsWith("/api/auth/sign-in")
          ? signIn(JSON.parse(String(init?.body)))
          : String(input).endsWith("/api/auth/session")
            ? Response.json({ user: null })
            : Response.json({ roles: {} }),
      ),
    );
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const view = render(
      <QueryClientProvider client={client}>
        <LoginScreen
          appId="donor"
          nextPath="/donor-dashboard"
          demoOnly={false}
        />
      </QueryClientProvider>,
    );
    fillCredentials();
    const button = screen.getByRole("button", { name: "Sign in" });
    const form = view.container.querySelector("form")!;
    button.focus();
    act(() => {
      form.requestSubmit();
      form.requestSubmit();
    });

    expect(signIn).toHaveBeenCalledTimes(1);
    expect(signIn).toHaveBeenCalledWith({
      email: "fixture@example.test",
      password: "fixture-password",
    });
    expect(button.hasAttribute("disabled")).toBe(true);
    expect(button.getAttribute("aria-disabled")).not.toBe("true");
    act(() => {
      form.requestSubmit();
    });
    expect(signIn).toHaveBeenCalledTimes(1);

    await act(async () => {
      pending.resolve(
        Response.json({ ok: false, error: "Try again" }, { status: 401 }),
      );
    });
    expect(await screen.findByText("Try again")).toBeTruthy();
    expect(button.hasAttribute("disabled")).toBe(false);
    expect(button.getAttribute("aria-disabled")).not.toBe("true");
    await act(async () => {
      form.requestSubmit();
    });
    await waitFor(() => expect(signIn).toHaveBeenCalledTimes(2));
    expect(auth.signInWithPassword).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(auth.replace).toHaveBeenCalledWith("/donor-dashboard"),
    );
    expect(auth.replace).toHaveBeenCalledWith("/donor-dashboard");
    expect(auth.refresh).toHaveBeenCalledTimes(1);
  });

  it("keeps registration loading until the signup promise settles", async () => {
    const pending = deferred<{ data: { session: null }; error: null }>();
    auth.signUp.mockReturnValueOnce(pending.promise);
    const view = renderRegistration();
    const button = screen.getByRole("button", { name: "Create account" });
    button.focus();
    await act(async () => {
      view.container.querySelector("form")!.requestSubmit();
    });

    expect(button.hasAttribute("disabled")).toBe(true);
    expect(button.getAttribute("aria-disabled")).not.toBe("true");
    expect(auth.signUp).toHaveBeenCalledTimes(1);

    await act(async () => {
      pending.resolve({ data: { session: null }, error: null });
    });
    expect(button.hasAttribute("disabled")).toBe(false);
    expect(button.getAttribute("aria-disabled")).not.toBe("true");
    expect(screen.getByRole("status").textContent).toContain(
      "Check your email: we’ve sent a link to fixture@example.test.",
    );
    expect(auth.replace).not.toHaveBeenCalled();
  });

  it("asks for the confirmation to return to the host the screen was opened on", async () => {
    auth.signUp.mockResolvedValueOnce({ data: { session: null }, error: null });
    const view = renderRegistration();
    await act(async () => {
      view.container.querySelector("form")!.requestSubmit();
    });

    expect(auth.signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "fixture@example.test",
        options: expect.objectContaining({
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }),
      }),
    );
    // Confirmation is required: no session, so no navigation yet.
    expect(auth.replace).not.toHaveBeenCalled();
    expect(screen.getByRole("status").textContent).toContain(
      "Open it in this browser",
    );
  });

  it("blocks repeated signup submissions and allows retry after rejection", async () => {
    const pending = deferred<{
      data: { session: null };
      error: { message: string };
    }>();
    auth.signUp.mockReturnValueOnce(pending.promise);
    auth.signUp.mockResolvedValueOnce({ data: { session: null }, error: null });
    const view = renderRegistration();
    const form = view.container.querySelector("form")!;
    act(() => {
      form.requestSubmit();
      form.requestSubmit();
    });
    expect(auth.signUp).toHaveBeenCalledTimes(1);
    await act(async () => {
      pending.resolve({
        data: { session: null },
        error: { message: "Signup failed" },
      });
    });
    expect(screen.getByRole("alert").textContent).toBe(
      "Your account couldn’t be created. Try again in a moment.",
    );
    await act(async () => {
      form.requestSubmit();
    });
    expect(auth.signUp).toHaveBeenCalledTimes(2);
    expect(
      screen.getByText(/check your email: we’ve sent a link/i),
    ).toBeTruthy();
  });

  // Council round 2, B1 (plan 5.4): registration answers the same whether or
  // not the address already has an account. Auth sends an unconfirmed account
  // its link again, so a second request within the email frequency gets a
  // rate limit that a new address never gets.
  it.each([
    [
      "a rate limit",
      new AuthApiError(
        "For security purposes, you can only request this after 52 seconds.",
        429,
        "over_email_send_rate_limit",
      ),
    ],
    [
      "an address that already has an account",
      new AuthApiError("User already registered", 422, "user_already_exists"),
    ],
  ])("answers %s exactly as it answers a sent link", async (_label, error) => {
    auth.signUp.mockResolvedValueOnce({ data: { session: null }, error: null });
    let view = renderRegistration();
    await act(async () => {
      view.container.querySelector("form")!.requestSubmit();
    });
    const sent = screen.getByRole("status").textContent;
    expect(sent).toContain("in a few minutes");
    cleanup();

    auth.signUp.mockResolvedValueOnce({
      data: { user: null, session: null },
      error,
    });
    view = renderRegistration();
    await act(async () => {
      view.container.querySelector("form")!.requestSubmit();
    });
    expect(screen.getByRole("status").textContent).toBe(sent);
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("says what is wrong with the password, which is the same for every address", async () => {
    auth.signUp.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: new AuthApiError(
        "Password is known to be weak and easy to guess, please choose a different one.",
        422,
        "weak_password",
      ),
    });
    const view = renderRegistration();
    await act(async () => {
      view.container.querySelector("form")!.requestSubmit();
    });
    expect(screen.getByRole("alert").textContent).toContain("known to be weak");
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("gives a general message for any other refusal, without Auth's wording", async () => {
    auth.signUp.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: new AuthApiError(
        "Database error saving new user",
        500,
        "unexpected_failure",
      ),
    });
    const view = renderRegistration();
    await act(async () => {
      view.container.querySelector("form")!.requestSubmit();
    });
    expect(screen.getByRole("alert").textContent).toBe(
      "Your account couldn’t be created. Try again in a moment.",
    );
    expect(screen.queryByRole("status")).toBeNull();
  });
});
