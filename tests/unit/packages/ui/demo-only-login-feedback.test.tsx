/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { DemoOnlyLoginCard } from "../../../../packages/ui/components/auth/DemoOnlyLoginCard";

afterEach(cleanup);

it("announces demo access progress without changing the button name", () => {
  const onDemoLogin = vi.fn();
  const view = render(
    <DemoOnlyLoginCard title="Try Core" onDemoLogin={onDemoLogin} />,
  );
  expect(screen.getByRole("status").textContent).toBe("");
  view.rerender(
    <DemoOnlyLoginCard title="Try Core" onDemoLogin={onDemoLogin} isLoading />,
  );
  expect(screen.getByRole("status").textContent).toBe("Opening demo…");
  expect(
    screen
      .getByRole("button", { name: "Demo access" })
      .getAttribute("aria-disabled"),
  ).toBe("true");
  view.rerender(
    <DemoOnlyLoginCard
      title="Try Core"
      onDemoLogin={onDemoLogin}
      error="Try again later"
    />,
  );
  expect(screen.getByRole("status").textContent).toBe("");
  expect(screen.getByRole("alert").textContent).toContain("Try again later");
});
