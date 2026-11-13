/** @vitest-environment jsdom */

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, expect, it } from "vitest";

import { UnsavedChangesGuard } from "../../../../packages/ui/components/primitives/unsaved-changes-guard";

// Each click on a link, and whether it was let through to navigate.
let clicks: Array<{ href: string; allowed: boolean }> = [];
const record = (event: MouseEvent) => {
  const link = (event.target as Element).closest("a");
  if (link) {
    clicks.push({
      href: link.getAttribute("href") ?? "",
      allowed: !event.defaultPrevented,
    });
  }
  // jsdom can't navigate; stop it from trying once recorded.
  event.preventDefault();
};

beforeEach(() => {
  clicks = [];
  document.addEventListener("click", record);
});
afterEach(() => {
  document.removeEventListener("click", record);
  cleanup();
});

function Page({ dirty }: { dirty: boolean }) {
  return (
    <>
      <a href="/tasks">Tasks</a>
      <a href="https://example.org/elsewhere">Elsewhere</a>
      <UnsavedChangesGuard when={dirty} />
    </>
  );
}

it("holds an in-app link while changes are unsaved and follows it on request", async () => {
  render(<Page dirty />);
  fireEvent.click(screen.getByRole("link", { name: "Tasks" }));
  expect(clicks).toEqual([{ href: "/tasks", allowed: false }]);
  expect(
    await screen.findByRole("alertdialog", { name: "Leave without saving?" }),
  ).toBeTruthy();

  fireEvent.click(screen.getByRole("button", { name: "Leave" }));
  await waitFor(() =>
    expect(clicks.at(-1)).toEqual({ href: "/tasks", allowed: true }),
  );
});

it("stays on the page when the writer keeps editing", async () => {
  render(<Page dirty />);
  fireEvent.click(screen.getByRole("link", { name: "Tasks" }));
  fireEvent.click(await screen.findByRole("button", { name: "Keep editing" }));
  await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
  expect(clicks).toEqual([{ href: "/tasks", allowed: false }]);
});

it("lets links through when nothing is unsaved, and never holds other sites", () => {
  const view = render(<Page dirty={false} />);
  fireEvent.click(screen.getByRole("link", { name: "Tasks" }));
  view.rerender(<Page dirty />);
  fireEvent.click(screen.getByRole("link", { name: "Elsewhere" }));
  expect(clicks).toEqual([
    { href: "/tasks", allowed: true },
    { href: "https://example.org/elsewhere", allowed: true },
  ]);
  expect(screen.queryByRole("alertdialog")).toBeNull();
});
