// @vitest-environment jsdom

import { execFileSync } from "node:child_process";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { act } from "react";
import { hydrateRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Rating } from "../../../../../../packages/ui/components/primitives/rating";

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

let hydrated: Root | undefined;
afterEach(async () => {
  cleanup();
  await act(async () => hydrated?.unmount());
  hydrated = undefined;
  vi.restoreAllMocks();
});

const star = (name: string) => screen.getByRole("radio", { name });

describe("Rating (UI SDK behavior, Maia styling)", () => {
  it("is a named radio group with one tab stop on the current score", () => {
    render(<Rating aria-label="Visit quality" defaultValue={3} />);

    const group = screen.getByRole("radiogroup", { name: "Visit quality" });
    expect(group.getAttribute("data-slot")).toBe("rating");
    const stars = screen.getAllByRole("radio");
    expect(stars.map((radio) => radio.getAttribute("aria-label"))).toEqual([
      "1 star",
      "2 stars",
      "3 stars",
      "4 stars",
      "5 stars",
    ]);
    expect(star("3 stars").getAttribute("aria-checked")).toBe("true");
    expect(
      stars.filter((radio) => radio.getAttribute("tabindex") === "0"),
    ).toEqual([star("3 stars")]);
  });

  it("moves and checks the score with arrow keys, reporting list navigation", () => {
    const onValueChange = vi.fn();
    render(
      <Rating
        aria-label="Visit quality"
        defaultValue={3}
        onValueChange={onValueChange}
      />,
    );

    star("3 stars").focus();
    fireEvent.keyDown(star("3 stars"), { key: "ArrowRight" });

    expect(onValueChange).toHaveBeenLastCalledWith(
      4,
      expect.objectContaining({ reason: "list-navigation" }),
    );
    expect(star("4 stars").getAttribute("aria-checked")).toBe("true");
    expect(document.activeElement).toBe(star("4 stars"));
  });

  it("submits the score under its name, like native radios", () => {
    render(
      <form aria-label="Feedback">
        <Rating aria-label="Visit quality" name="visit" defaultValue={2} />
      </form>,
    );
    const form = screen.getByRole("form", { name: "Feedback" });

    expect(new FormData(form as HTMLFormElement).get("visit")).toBe("2");
    star("2 stars").focus();
    fireEvent.keyDown(star("2 stars"), { key: "ArrowRight" });
    expect(new FormData(form as HTMLFormElement).get("visit")).toBe("3");
  });

  it("marks the stars the score covers so Maia tokens can paint them", () => {
    render(<Rating aria-label="Visit quality" defaultValue={2} />);

    const items = Array.from(
      document.querySelectorAll('[data-slot="rating-item"]'),
    );
    expect(items).toHaveLength(5);
    expect(items.map((item) => item.hasAttribute("data-filled"))).toEqual([
      true,
      true,
      false,
      false,
      false,
    ]);
    for (const icon of document.querySelectorAll(
      '[data-slot="rating-item"] svg',
    )) {
      expect(icon.getAttribute("aria-hidden")).toBe("true");
    }
  });

  it("hydrates its server HTML without a mismatch and stays interactive", async () => {
    const container = document.createElement("div");
    // Render in a DOM-free process: the same path Next.js takes for a Server
    // Component that renders this client component.
    container.innerHTML = execFileSync(
      "bun",
      [
        "-e",
        `
        import React from "react";
        import { renderToString } from "react-dom/server";
        import { Rating } from "./packages/ui/components/primitives/rating.tsx";
        console.log(renderToString(React.createElement(Rating, { "aria-label": "Visit quality", name: "visit", defaultValue: 3 })));
      `,
      ],
      { cwd: process.cwd(), encoding: "utf8" },
    ).trim();
    document.body.append(container);
    const serverStar = container.querySelector('[aria-label="3 stars"]');
    expect(serverStar?.getAttribute("aria-checked")).toBe("true");
    expect(serverStar?.getAttribute("tabindex")).toBe("0");

    const errors: unknown[] = [];
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    await act(async () => {
      hydrated = hydrateRoot(
        container,
        <Rating aria-label="Visit quality" name="visit" defaultValue={3} />,
        { onRecoverableError: (error) => errors.push(error) },
      );
    });

    expect(errors).toEqual([]);
    expect(
      consoleError.mock.calls
        .map((args) => args.join(" "))
        .filter((message) =>
          /hydrated|hydration|server rendered|didn't match/i.test(message),
        ),
    ).toEqual([]);
    expect(container.querySelector('[aria-label="3 stars"]')).toBe(serverStar);

    (serverStar as HTMLElement).focus();
    await act(async () => {
      fireEvent.keyDown(serverStar!, { key: "ArrowLeft" });
    });
    expect(
      container
        .querySelector('[aria-label="2 stars"]')
        ?.getAttribute("aria-checked"),
    ).toBe("true");
    container.remove();
  });
});
