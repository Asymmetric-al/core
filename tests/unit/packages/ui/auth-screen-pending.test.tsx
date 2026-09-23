// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
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
  fireEvent.change(screen.getByLabelText("First Name"), {
    target: { value: "Fixture" },
  });
  fireEvent.change(screen.getByLabelText("Last Name"), {
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
  it("locks login before rerender and unlocks after failure without losing button focus", async () => {
    const pending = deferred<{ error: { message: string } }>();
    auth.signInWithPassword.mockReturnValueOnce(pending.promise);
    auth.signInWithPassword.mockResolvedValueOnce({ error: null });
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
    const button = screen.getByRole("button", { name: "Sign In" });
    const form = view.container.querySelector("form")!;
    button.focus();
    act(() => {
      form.requestSubmit();
      form.requestSubmit();
    });

    expect(auth.signInWithPassword).toHaveBeenCalledTimes(1);
    expect(auth.signInWithPassword).toHaveBeenCalledWith({
      email: "fixture@example.test",
      password: "fixture-password",
    });
    expect(button.getAttribute("aria-disabled")).toBe("true");
    expect(document.activeElement).toBe(button);
    act(() => {
      form.requestSubmit();
    });
    expect(auth.signInWithPassword).toHaveBeenCalledTimes(1);

    await act(async () => {
      pending.resolve({ error: { message: "Try again" } });
    });
    expect(screen.getByText("Try again")).toBeTruthy();
    expect(button.getAttribute("aria-disabled")).not.toBe("true");
    await act(async () => {
      form.requestSubmit();
    });
    expect(auth.signInWithPassword).toHaveBeenCalledTimes(2);
    expect(auth.replace).toHaveBeenCalledWith("/donor-dashboard");
    expect(auth.refresh).toHaveBeenCalledTimes(1);
  });

  it("keeps registration loading until the signup promise settles", async () => {
    const pending = deferred<{ data: { session: null }; error: null }>();
    auth.signUp.mockReturnValueOnce(pending.promise);
    const view = renderRegistration();
    const button = screen.getByRole("button", { name: "Create Account" });
    button.focus();
    await act(async () => {
      view.container.querySelector("form")!.requestSubmit();
    });

    expect(button.getAttribute("aria-disabled")).toBe("true");
    expect(document.activeElement).toBe(button);
    expect(auth.signUp).toHaveBeenCalledTimes(1);

    await act(async () => {
      pending.resolve({ data: { session: null }, error: null });
    });
    expect(button.getAttribute("aria-disabled")).not.toBe("true");
    expect(screen.getByText(/check your email for verification/i)).toBeTruthy();
    expect(auth.replace).not.toHaveBeenCalled();
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
    expect(screen.getByText("Signup failed")).toBeTruthy();
    await act(async () => {
      form.requestSubmit();
    });
    expect(auth.signUp).toHaveBeenCalledTimes(2);
    expect(screen.getByText(/check your email for verification/i)).toBeTruthy();
  });
});
