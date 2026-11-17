/** @vitest-environment jsdom */

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { DraftTestProvider } from "../../../../fixtures/retained-drafts";

import type * as NextNavigation from "next/navigation";

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn() },
}));

// The real uploader renders its trigger; only its storage client is stubbed.
vi.mock("@asym/database/supabase", () => ({
  createBrowserClient: () => ({ auth: {}, storage: {} }),
}));

// The live preview's give button reads the router.
vi.mock("next/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof NextNavigation>()),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}));

const { ProfilePageClient } =
  await import("../../../../../../apps/missionary/app/profile/profile-page-client");
const { getQueryClient } =
  await import("../../../../../../packages/database/providers/query-client");
const { QueryProvider } =
  await import("../../../../../../packages/database/providers/query-provider");

const fetchMock = vi.fn<typeof fetch>();

const apiProfile = {
  profile: {
    first_name: "Ada",
    last_name: "Lovelace",
    email: "ada@example.org",
    avatar_url: "",
    missionary: {
      phone: "",
      location: "London",
      tagline: "Analytical engines",
      bio: "",
      cover_url: "",
      social_links: {},
    },
  },
};

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

beforeEach(() => {
  getQueryClient().clear();
  fetchMock.mockImplementation(async (_input, init) =>
    init?.method === "PATCH"
      ? json(403, { error: "Access removed" })
      : json(200, apiProfile),
  );
  vi.stubGlobal("fetch", fetchMock);
  // The refused save is logged; that is expected here.
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  cleanup();
  getQueryClient().clear();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function describedBy(element: HTMLElement) {
  return (element.getAttribute("aria-describedby") ?? "").split(/\s+/);
}

async function loseWriteAccess() {
  render(
    <DraftTestProvider>
      <QueryProvider>
        <ProfilePageClient />
      </QueryProvider>
    </DraftTestProvider>,
  );
  const phone = await screen.findByRole<HTMLInputElement>("textbox", {
    name: "Phone",
  });
  const form = phone.form!;
  expect(phone.readOnly).toBe(false);
  expect(
    screen
      .getByRole("button", { name: "Upload photo" })
      .getAttribute("aria-disabled"),
  ).toBeNull();

  fireEvent.change(phone, { target: { value: "+1 555 0100" } });
  fireEvent.click(
    screen.getAllByRole("button", { name: "Save changes" }).at(-1)!,
  );
  const notice = await screen.findByText(/Your giving page is read-only/);
  expect(notice.id).not.toBe("");
  return { form, notice };
}

it("makes every text field read-only once write access is revoked", async () => {
  const { form } = await loseWriteAccess();

  const fields = within(form).getAllByRole<
    HTMLInputElement | HTMLTextAreaElement
  >("textbox");
  expect(fields).toHaveLength(11);
  for (const field of fields) expect(field.readOnly).toBe(true);
  // The kept draft is still shown.
  expect(
    within(form).getByRole<HTMLInputElement>("textbox", { name: "Phone" })
      .value,
  ).toBe("+1 555 0100");
});

it("keeps the photo uploads focusable but unusable, and says why", async () => {
  const { notice } = await loseWriteAccess();
  const openPicker = vi.spyOn(HTMLInputElement.prototype, "click");

  const avatar = screen.getByRole<HTMLButtonElement>("button", {
    name: "Upload photo",
  });
  expect(avatar.getAttribute("aria-disabled")).toBe("true");
  expect(avatar.disabled).toBe(false);
  expect(describedBy(avatar)).toContain(notice.id);
  avatar.focus();
  expect(document.activeElement).toBe(avatar);
  fireEvent.click(avatar);

  const cover = screen.getByRole("button", { name: /Cover photo/ });
  expect(cover.getAttribute("aria-disabled")).toBe("true");
  expect(cover.tabIndex).toBe(0);
  expect(describedBy(cover)).toContain(notice.id);
  expect(describedBy(cover)).toHaveLength(2);
  fireEvent.click(cover);
  fireEvent.keyDown(cover, { key: "Enter" });

  await waitFor(() => expect(openPicker).not.toHaveBeenCalled());
});
