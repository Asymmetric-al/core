/** @vitest-environment jsdom */

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import React from "react";
import { toast } from "sonner";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { DraftTestProvider } from "../../../../fixtures/retained-drafts";

import type * as NextNavigation from "next/navigation";

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn() },
}));

// The upload dialog needs storage; render only its trigger.
vi.mock("@asym/ui/components/primitives/image-upload", () => ({
  ImageUpload: ({ children }: { children: React.ReactNode }) => <>{children}</>,
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

beforeEach(() => {
  getQueryClient().clear();
  fetchMock.mockImplementation(
    async () =>
      new Response(JSON.stringify(apiProfile), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
  );
  vi.stubGlobal("fetch", fetchMock);
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
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

async function renderPage() {
  render(
    <DraftTestProvider>
      <QueryProvider>
        <ProfilePageClient />
      </QueryProvider>
    </DraftTestProvider>,
  );
  return screen.findByRole<HTMLInputElement>("textbox", { name: "Phone" });
}

function patchCount() {
  return fetchMock.mock.calls.filter(([, init]) => init?.method === "PATCH")
    .length;
}

// jsdom has no implicit submission; a browser answers Enter in a text field
// by clicking the form's first submit button unless that button is disabled.
function pressEnterIn(field: HTMLInputElement) {
  field.focus();
  fireEvent.keyDown(field, { key: "Enter" });
  const defaultButton = Array.from(field.form?.elements ?? []).find(
    (element): element is HTMLButtonElement =>
      element instanceof HTMLButtonElement && element.type === "submit",
  );
  if (defaultButton && !defaultButton.disabled) defaultButton.click();
}

it("saves once when Enter is pressed in a field", async () => {
  const phone = await renderPage();
  fireEvent.change(phone, { target: { value: "+1 555 0100" } });

  const form = phone.form;
  expect(form).not.toBeNull();
  const saves = screen.getAllByRole<HTMLButtonElement>("button", {
    name: "Save changes",
  });
  expect(saves).toHaveLength(2);
  for (const save of saves) {
    expect(save.type).toBe("submit");
    expect(save.form).toBe(form);
  }
  // Only the Save buttons submit; every other button in the form is inert.
  for (const button of form!.querySelectorAll("button")) {
    expect(button.type).toBe("button");
  }

  pressEnterIn(phone);
  await waitFor(() =>
    expect(toast.success).toHaveBeenCalledWith("Profile saved"),
  );
  expect(patchCount()).toBe(1);
  const [, init] = fetchMock.mock.calls.find(
    ([, request]) => request?.method === "PATCH",
  )!;
  expect(JSON.parse(String(init!.body))).toMatchObject({
    phone: "+1 555 0100",
  });
  expect(document.activeElement).toBe(phone);
});

it("moves focus to the invalid field when Enter is pressed elsewhere", async () => {
  const phone = await renderPage();
  const website = screen.getByRole("textbox", { name: "Website" });
  fireEvent.change(website, { target: { value: "example.org" } });

  pressEnterIn(phone);
  await waitFor(() => expect(document.activeElement).toBe(website));
  expect(toast.error).toHaveBeenCalledWith(
    "Please fix the errors before saving",
  );
  expect(patchCount()).toBe(0);
});

it("saves once from a Save click", async () => {
  const phone = await renderPage();
  fireEvent.change(phone, { target: { value: "+1 555 0100" } });

  const save = screen.getAllByRole("button", { name: "Save changes" }).at(-1)!;
  save.focus();
  fireEvent.click(save);
  await waitFor(() =>
    expect(toast.success).toHaveBeenCalledWith("Profile saved"),
  );
  expect(patchCount()).toBe(1);
});

it("does not start a second save while one is in flight", async () => {
  const phone = await renderPage();
  let finishPatch!: () => void;
  fetchMock.mockImplementation(async (_input, init) => {
    if (init?.method === "PATCH") {
      await new Promise<void>((resolve) => {
        finishPatch = resolve;
      });
    }
    return new Response(JSON.stringify(apiProfile), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });
  fireEvent.change(phone, { target: { value: "+1 555 0100" } });

  pressEnterIn(phone);
  await waitFor(() => expect(patchCount()).toBe(1));
  const pending = await screen.findAllByRole("button", { name: "Saving…" });

  pressEnterIn(phone);
  for (const save of pending) fireEvent.click(save);

  await act(async () => {
    finishPatch();
  });
  await waitFor(() =>
    expect(toast.success).toHaveBeenCalledWith("Profile saved"),
  );
  expect(patchCount()).toBe(1);
});

function holdPatch() {
  let finish!: (response: Response) => void;
  fetchMock.mockImplementation(async (_input, init) => {
    if (init?.method === "PATCH") {
      return new Promise<Response>((resolve) => {
        finish = resolve;
      });
    }
    return new Response(JSON.stringify(apiProfile), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });
  return (response: Response) => finish(response);
}

// A browser moves focus off an element once it becomes natively disabled.
function expectUsableFocus() {
  const active = document.activeElement;
  expect(active).not.toBe(document.body);
  expect(active?.matches(":disabled")).toBe(false);
}

it("keeps focus while a save runs and returns it to that Save after a failure", async () => {
  const phone = await renderPage();
  const finishPatch = holdPatch();
  fireEvent.change(phone, { target: { value: "+1 555 0100" } });

  const [headerSave] = screen.getAllByRole("button", { name: "Save changes" });
  headerSave!.focus();
  fireEvent.click(headerSave!);
  await screen.findAllByRole("button", { name: "Saving…" });
  expectUsableFocus();
  expect(document.activeElement).toBe(phone.form);

  await act(async () => {
    finishPatch(
      new Response(JSON.stringify({ error: "Server unavailable" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }),
    );
  });
  await waitFor(() =>
    expect(toast.error).toHaveBeenCalledWith("Server unavailable"),
  );
  expect(document.activeElement).toBe(headerSave);
  expect(headerSave!.matches(":disabled")).toBe(false);
});

it("leaves focus on the page when a save from the bar succeeds", async () => {
  const phone = await renderPage();
  const finishPatch = holdPatch();
  fireEvent.change(phone, { target: { value: "+1 555 0100" } });

  const barSave = screen
    .getAllByRole("button", { name: "Save changes" })
    .at(-1)!;
  barSave.focus();
  fireEvent.click(barSave);
  await screen.findAllByRole("button", { name: "Saving…" });
  expectUsableFocus();

  await act(async () => {
    finishPatch(
      new Response(JSON.stringify(apiProfile), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
  });
  await waitFor(() =>
    expect(toast.success).toHaveBeenCalledWith("Profile saved"),
  );
  expect(barSave.isConnected).toBe(false);
  const header = screen
    .getByRole("heading", { name: "Giving page" })
    .closest('[tabindex="-1"]');
  await waitFor(() =>
    expect([phone.form, header]).toContain(document.activeElement),
  );
  expectUsableFocus();
});

it("moves focus to the first invalid field when a save fails validation", async () => {
  const phone = await renderPage();
  const website = screen.getByRole("textbox", { name: "Website" });
  fireEvent.change(website, { target: { value: "example.org" } });
  fireEvent.change(phone, { target: { value: "call me" } });

  const [save] = screen.getAllByRole("button", { name: "Save changes" });
  save!.focus();
  fireEvent.click(save!);

  await waitFor(() => expect(document.activeElement).toBe(phone));
  expect(phone.getAttribute("aria-invalid")).toBe("true");
  expect(website.getAttribute("aria-invalid")).toBe("true");
  expect(toast.error).toHaveBeenCalledWith(
    "Please fix the errors before saving",
  );
  expect(patchCount()).toBe(0);
});

it("moves focus there again on every failed save", async () => {
  await renderPage();
  const website = screen.getByRole("textbox", { name: "Website" });
  fireEvent.change(website, { target: { value: "example.org" } });

  const saves = screen.getAllByRole("button", { name: "Save changes" });
  fireEvent.click(saves[0]!);
  await waitFor(() => expect(document.activeElement).toBe(website));

  const lastSave = saves.at(-1)!;
  lastSave.focus();
  fireEvent.click(lastSave);
  await waitFor(() => expect(document.activeElement).toBe(website));
  expect(patchCount()).toBe(0);
});

it("leaves focus alone while the page loads and edits are valid", async () => {
  const phone = await renderPage();
  expect(document.activeElement).toBe(document.body);
  phone.focus();
  fireEvent.change(phone, { target: { value: "+1 555 0100" } });
  expect(document.activeElement).toBe(phone);
});
