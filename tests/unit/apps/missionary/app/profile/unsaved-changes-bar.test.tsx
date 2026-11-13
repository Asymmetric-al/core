/** @vitest-environment jsdom */

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import React, { useRef } from "react";
import { afterEach, expect, it } from "vitest";

import { UnsavedChangesBar } from "../../../../../../apps/missionary/app/profile/profile-primitives";

function Page({ dirty }: { dirty: boolean }) {
  const header = useRef<HTMLDivElement>(null);
  return (
    <>
      <div ref={header} tabIndex={-1} data-testid="header">
        Giving page
      </div>
      {dirty ? (
        <UnsavedChangesBar returnFocusTo={header}>
          <button type="button">Save changes</button>
        </UnsavedChangesBar>
      ) : null}
    </>
  );
}

afterEach(cleanup);

it("hands focus back to the page when saving or discarding removes the bar", async () => {
  const view = render(<Page dirty />);
  screen.getByRole("button", { name: "Save changes" }).focus();
  view.rerender(<Page dirty={false} />);
  await waitFor(() =>
    expect(document.activeElement).toBe(screen.getByTestId("header")),
  );
});

it("leaves focus alone when it was elsewhere", async () => {
  const view = render(
    <>
      <input aria-label="Tagline" />
      <Page dirty />
    </>,
  );
  const tagline = screen.getByRole("textbox", { name: "Tagline" });
  tagline.focus();
  view.rerender(
    <>
      <input aria-label="Tagline" />
      <Page dirty={false} />
    </>,
  );
  await new Promise((resolve) => requestAnimationFrame(resolve));
  expect(document.activeElement).toBe(tagline);
});
