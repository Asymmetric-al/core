/** @vitest-environment jsdom */
import { MotionProvider } from "@asym/lib/motion-provider";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import React from "react";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";

// eslint-disable-next-line no-restricted-imports -- AL-1931 This integration test mounts the real page; no app imports another app.
import { FAQPageClient } from "../../../../apps/donor/app/(public)/(hero)/faq/faq-client";

beforeAll(() => {
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
  }));
});

afterEach(cleanup);
afterAll(() => vi.unstubAllGlobals());

function showFAQ() {
  return render(
    <MotionProvider>
      <FAQPageClient />
    </MotionProvider>,
  );
}

describe("donor FAQ accessibility", () => {
  it("exposes the initially open answer through its question's expanded state and named region", () => {
    showFAQ();

    const question = screen.getByRole("button", {
      name: "How much of my donation actually goes to the field?",
      exact: true,
    });
    expect(question.getAttribute("aria-expanded")).toBe("true");

    const answer = screen.getByRole("region", {
      name: "How much of my donation actually goes to the field?",
      exact: true,
    });
    expect(question.getAttribute("aria-controls")).toBe(answer.id);
    expect(answer.textContent).toContain("85%");
    expect(
      screen
        .getByRole("button", {
          name: "How do you ensure financial accountability?",
          exact: true,
        })
        .getAttribute("aria-expanded"),
    ).toBe("false");
  });

  it("opens one answer at a time and allows the open answer to collapse", async () => {
    showFAQ();
    const first = screen.getByRole("button", {
      name: "How much of my donation actually goes to the field?",
    });
    const second = screen.getByRole("button", {
      name: "How do you ensure financial accountability?",
    });
    fireEvent.click(second);
    expect(first.getAttribute("aria-expanded")).toBe("false");
    expect(second.getAttribute("aria-expanded")).toBe("true");
    await waitFor(() => expect(screen.getAllByRole("region")).toHaveLength(1));
    expect(screen.getByRole("region").textContent).toContain(
      "annual independent audits",
    );
    fireEvent.click(second);
    expect(second.getAttribute("aria-expanded")).toBe("false");
    await waitFor(() => expect(screen.queryByRole("region")).toBeNull());
  });

  it("combines category and answer searches, clears search, and restores all questions from the empty state", () => {
    showFAQ();
    const search = screen.getByRole("textbox", {
      name: "Search frequently asked questions",
    });
    fireEvent.click(
      screen.getByRole("button", { name: "My Account", exact: true }),
    );
    expect(
      screen.queryByRole("button", {
        name: "How much of my donation actually goes to the field?",
      }),
    ).toBeNull();
    expect(
      screen.getByRole("button", {
        name: "How do I update my credit card information?",
      }),
    ).toBeTruthy();

    fireEvent.change(search, { target: { value: "January 31st" } });
    expect(
      screen.getByRole("button", {
        name: "Where can I find my year-end tax statement?",
      }),
    ).toBeTruthy();
    expect(
      screen.queryByRole("button", {
        name: "How do I update my credit card information?",
      }),
    ).toBeNull();

    const clear = screen.getByRole("button", { name: /^Clear/ });
    clear.focus();
    fireEvent.click(clear);
    expect(document.activeElement).toBe(search);
    expect(
      screen.getByRole("button", {
        name: "How do I update my credit card information?",
      }),
    ).toBeTruthy();
    fireEvent.change(search, { target: { value: "no matching question" } });
    expect(
      screen.getByRole("heading", { name: "No results found" }),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "View all questions" }));
    expect(search.getAttribute("value")).toBe("");
    expect(
      screen.getByRole("button", {
        name: "How much of my donation actually goes to the field?",
      }),
    ).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "Email Support" }).getAttribute("href"),
    ).toBe("/contact");
  });

  it("communicates which category is selected after filtering", () => {
    showFAQ();
    const all = screen.getByRole("button", {
      name: "All Questions",
      exact: true,
    });
    const account = screen.getByRole("button", {
      name: "My Account",
      exact: true,
    });
    expect(all.getAttribute("aria-pressed")).toBe("true");
    expect(account.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(account);
    expect(all.getAttribute("aria-pressed")).toBe("false");
    expect(account.getAttribute("aria-pressed")).toBe("true");
  });

  it("offers working email support without an unavailable chat control", () => {
    showFAQ();
    expect(
      screen.queryByRole("button", { name: "Chat with Us", exact: true }),
    ).toBeNull();
    expect(
      screen
        .getByRole("link", { name: "Email Support", exact: true })
        .getAttribute("href"),
    ).toBe("/contact");
  });
});
