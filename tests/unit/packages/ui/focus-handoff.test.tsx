// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { useFocusHandoff } from "../../../../packages/ui/hooks/load-retry";

afterEach(cleanup);

function Page({
  showView,
  land,
}: {
  showView: boolean;
  land: (from: HTMLElement) => boolean;
}) {
  const view = useFocusHandoff(land);
  return (
    <section aria-label="Page">
      <button type="button">Elsewhere</button>
      {showView ? (
        <div ref={view}>
          <button type="button">Try again</button>
        </div>
      ) : null}
    </section>
  );
}

it("lands once a view that had focus is removed, from the element it left", () => {
  const land = vi.fn(() => true);
  const view = render(<Page showView land={land} />);
  act(() => screen.getByRole("button", { name: "Try again" }).focus());

  view.rerender(<Page showView={false} land={land} />);
  expect(land).toHaveBeenCalledTimes(1);
  expect(land).toHaveBeenCalledWith(screen.getByRole("region"));
});

it("lands only once, though focus moves on only after the page renders", () => {
  // A page may queue the landing for an effect, so focus is still lost when
  // the hand-off is done.
  const land = vi.fn(() => true);
  const view = render(<Page showView land={land} />);
  act(() => screen.getByRole("button", { name: "Try again" }).focus());
  view.rerender(<Page showView={false} land={land} />);
  expect(land).toHaveBeenCalledTimes(1);

  // Later renders with focus lost are not a removal, so they land nowhere.
  view.rerender(<Page showView={false} land={land} />);
  view.rerender(<Page showView={false} land={land} />);
  expect(land).toHaveBeenCalledTimes(1);
});

it("tries again after the next render while there is nowhere to land", () => {
  const land = vi.fn(() => false);
  const view = render(<Page showView land={land} />);
  act(() => screen.getByRole("button", { name: "Try again" }).focus());
  view.rerender(<Page showView={false} land={land} />);
  view.rerender(<Page showView={false} land={land} />);
  expect(land).toHaveBeenCalledTimes(2);

  // Once the donor puts focus somewhere, it is theirs.
  act(() => screen.getByRole("button", { name: "Elsewhere" }).focus());
  view.rerender(<Page showView={false} land={land} />);
  act(() => screen.getByRole("button", { name: "Elsewhere" }).blur());
  view.rerender(<Page showView={false} land={land} />);
  expect(land).toHaveBeenCalledTimes(2);
});

it("leaves focus that is elsewhere, or nowhere, where it is", () => {
  const land = vi.fn(() => true);
  const view = render(<Page showView land={land} />);
  const elsewhere = screen.getByRole("button", { name: "Elsewhere" });
  act(() => elsewhere.focus());

  view.rerender(<Page showView={false} land={land} />);
  expect(document.activeElement).toBe(elsewhere);
  view.rerender(<Page showView land={land} />);
  act(() => elsewhere.blur());
  view.rerender(<Page showView={false} land={land} />);
  expect(land).not.toHaveBeenCalled();
});
