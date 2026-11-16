// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  AuthButton,
  AuthCard,
  AuthInput,
  AuthLabel,
  AuthMark,
  AuthMessage,
} from "../../../../packages/ui/components/auth/auth-primitives";
import { DemoOnlyLoginCard } from "../../../../packages/ui/components/auth/DemoOnlyLoginCard";
import { FullLoginCard } from "../../../../packages/ui/components/auth/FullLoginCard";
import { RegisterScreen } from "../../../../packages/ui/components/auth/RegisterScreen";

vi.mock("@asym/database/supabase", () => ({
  createBrowserClient: () => ({ auth: {} }),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }),
}));

afterEach(cleanup);

function renderFullLogin(
  props: Partial<React.ComponentProps<typeof FullLoginCard>> = {},
) {
  return render(
    <FullLoginCard
      title="Sign in"
      email=""
      password=""
      onEmailChange={vi.fn()}
      onPasswordChange={vi.fn()}
      onSubmit={vi.fn()}
      {...props}
    />,
  );
}

describe("auth primitives on base-maia owners", () => {
  it("compose the shared Card, Input, Label, Button and Alert", () => {
    const { container } = render(
      <AuthCard>
        <AuthLabel htmlFor="probe">Probe</AuthLabel>
        <AuthInput id="probe" />
        <AuthButton>Continue</AuthButton>
        <AuthMessage tone="error">Wrong password</AuthMessage>
      </AuthCard>,
    );
    expect(container.querySelector('[data-slot="card"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="input"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="label"]')).not.toBeNull();
    expect(screen.getByRole("alert").getAttribute("data-slot")).toBe("alert");
    // No hand-rolled radius or ring classes left on the auth controls.
    const button = screen.getByRole("button", { name: "Continue" });
    expect(button.className).not.toContain("rounded-xl");
    expect(
      container.querySelector('[data-slot="input"]')!.className,
    ).not.toContain("rounded-xl");
    expect(button.className).toContain("w-full");
  });

  it("announces a notice as a status, not an alert", () => {
    render(<AuthMessage tone="success">Account created.</AuthMessage>);
    expect(screen.getByRole("status").textContent).toBe("Account created.");
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("keeps the link variant inline instead of full width", () => {
    render(<AuthButton variant="link">Resend</AuthButton>);
    expect(
      screen.getByRole("button", { name: "Resend" }).className,
    ).not.toContain("w-full");
  });

  it("shows a neutral, decorative mark", () => {
    const { container } = render(<AuthMark />);
    const mark = container.firstElementChild!;
    expect(mark.getAttribute("aria-hidden")).toBe("true");
    expect(mark.querySelector("svg")).not.toBeNull();
  });
});

describe("sign-in card", () => {
  it("never shows another organization's initials before sign-in", () => {
    const { container } = renderFullLogin();
    expect(container.textContent).not.toContain("GH");
    expect(container.querySelector('[aria-hidden="true"] svg')).not.toBeNull();
  });

  it("uses sentence case for its actions", () => {
    renderFullLogin({ demoEnabled: true, onDemoLogin: vi.fn() });
    expect(screen.getByRole("button", { name: "Sign in" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Demo access" })).toBeTruthy();
  });

  it("ties a sign-in error to both fields", () => {
    renderFullLogin({ error: "Invalid login credentials" });
    const alert = screen.getByRole("alert");
    expect(alert.textContent).toBe("Invalid login credentials");
    for (const field of [
      screen.getByLabelText("Email"),
      screen.getByLabelText("Password"),
    ]) {
      expect(field.getAttribute("aria-invalid")).toBe("true");
      expect(field.getAttribute("aria-describedby")).toBe(alert.id);
    }
  });

  it("keeps hiding the reset link where reset is not offered", () => {
    renderFullLogin({ forgotPasswordHref: null });
    expect(screen.queryByRole("link", { name: "Forgot password?" })).toBeNull();
  });

  it("toggles the password visibility with a named control", () => {
    renderFullLogin();
    const toggle = screen.getByRole("button", { name: "Show password" });
    fireEvent.click(toggle);
    expect(screen.getByLabelText("Password").getAttribute("type")).toBe("text");
  });
});

describe("demo-only card", () => {
  it("uses the neutral mark and a sentence-case default action", () => {
    const { container } = render(
      <DemoOnlyLoginCard title="Sign in" onDemoLogin={vi.fn()} />,
    );
    expect(screen.getByRole("button", { name: "Demo access" })).toBeTruthy();
    expect(container.querySelector('[aria-hidden="true"] svg')).not.toBeNull();
  });
});

describe("registration", () => {
  it("uses sentence-case labels and describes the password rule", () => {
    render(<RegisterScreen appId="donor" enabled />);
    expect(screen.getByLabelText("First name")).toBeTruthy();
    expect(screen.getByLabelText("Last name")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Create account" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Sign in" })).toBeTruthy();
    const password = screen.getByLabelText("Password");
    const hint = document.getElementById(
      password.getAttribute("aria-describedby") ?? "",
    );
    expect(hint?.textContent).toBe("At least 8 characters.");
  });

  it("explains closed registration as a notice", () => {
    render(<RegisterScreen appId="missionary" enabled={false} />);
    expect(screen.getByRole("status").textContent).toContain(
      "Self-service registration is not available",
    );
    expect(screen.queryByRole("button", { name: "Create account" })).toBeNull();
  });
});
