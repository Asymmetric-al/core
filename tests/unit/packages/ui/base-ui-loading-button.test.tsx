// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { AuthButton } from "../../../../packages/ui/components/auth/auth-primitives";
afterEach(cleanup);
it("retains focus and changing names while an auth action is loading, without duplicate activation", () => {
  const click = vi.fn();
  const view = render(
    <AuthButton disabled={false} onClick={click}>
      Sign in
    </AuthButton>,
  );
  const button = screen.getByRole("button", { name: "Sign in" });
  button.focus();
  fireEvent.click(button);
  view.rerender(
    <AuthButton loading disabled={false} onClick={click}>
      Signing in
    </AuthButton>,
  );
  expect(document.activeElement).toBe(button);
  expect(button.getAttribute("aria-disabled")).toBe("true");
  expect(button.hasAttribute("disabled")).toBe(false);
  const id = button.getAttribute("aria-labelledby");
  expect(id).not.toBeNull();
  expect(document.getElementById(id!)?.textContent).toBe("Signing in");
  fireEvent.click(button);
  expect(click).toHaveBeenCalledOnce();
});
it("keeps ordinary disabled auth actions unfocusable", () => {
  render(<AuthButton disabled>Sign in</AuthButton>);
  expect(
    screen.getByRole("button", { name: "Sign in" }).hasAttribute("disabled"),
  ).toBe(true);
});
it("natively disables a loading submit AuthButton so implicit form submit cannot start a second auth request", () => {
  render(
    <form
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <AuthButton type="submit" loading>
        Signing in
      </AuthButton>
    </form>,
  );
  const button = screen.getByRole("button", { name: "Signing in" });
  expect(button.getAttribute("type")).toBe("submit");
  expect(button.hasAttribute("disabled")).toBe(true);
});
