// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";

// eslint-disable-next-line no-restricted-imports -- Unit test of the donor app's own focus helper at its app boundary.
import {
  focusHeadingIfLost,
  focusIsLost,
} from "../../../../apps/donor/features/donor/focus-recovery";

function page() {
  const container = document.createElement("div");
  container.innerHTML = `<h1>Recurring gifts</h1><button type="button">Try again</button>`;
  document.body.append(container);
  return {
    container,
    heading: container.querySelector("h1")!,
    button: container.querySelector("button")!,
  };
}

afterEach(() => {
  document.body.replaceChildren();
});

it("treats focus on the body as lost", () => {
  const { button } = page();
  expect(focusIsLost()).toBe(true);
  button.focus();
  expect(focusIsLost()).toBe(false);
  button.remove();
  expect(focusIsLost()).toBe(true);
});

it("moves lost focus to the container's main heading", () => {
  const { container, heading } = page();
  expect(focusHeadingIfLost(container)).toBe(true);
  expect(document.activeElement).toBe(heading);
  expect(heading.tabIndex).toBe(-1);
});

it("leaves focus alone when something still holds it", () => {
  const { container, heading, button } = page();
  button.focus();
  expect(focusHeadingIfLost(container)).toBe(true);
  expect(document.activeElement).toBe(button);
  expect(heading.hasAttribute("tabindex")).toBe(false);
});

it("says focus is still lost without a container or a heading", () => {
  const { container, heading } = page();
  heading.remove();
  expect(focusHeadingIfLost(container)).toBe(false);
  expect(focusHeadingIfLost(null)).toBe(false);
  expect(focusHeadingIfLost(undefined)).toBe(false);
  expect(document.activeElement).toBe(document.body);
});
