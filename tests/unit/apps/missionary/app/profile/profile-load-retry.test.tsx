/** @vitest-environment jsdom */

import { RetainedDraftProvider } from "@asym/ui/hooks";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import React from "react";
import { toast } from "sonner";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import {
  DraftTestProvider,
  draftTestOwner,
} from "../../../../fixtures/retained-drafts";

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

const failure = () => json(500, { error: "Profile service unavailable" });

const unavailableText = "Your giving page is unavailable in this account.";

/** Waits past one animation frame, where returned focus lands. */
const nextFrame = () =>
  act(async () => {
    await new Promise((resolve) => requestAnimationFrame(resolve));
  });

beforeEach(() => {
  getQueryClient().clear();
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
  fetchMock.mockReset();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function renderPage() {
  return render(
    <DraftTestProvider>
      <QueryProvider>
        <ProfilePageClient />
      </QueryProvider>
    </DraftTestProvider>,
  );
}

/** Renders the page with a failed first load and a held second request. */
async function failThenHoldRetry() {
  let answerRetry!: (response: Response) => void;
  fetchMock
    .mockImplementationOnce(async () => failure())
    .mockImplementationOnce(
      () =>
        new Promise<Response>((resolve) => {
          answerRetry = resolve;
        }),
    );
  renderPage();
  const firstAlert = await screen.findByRole("alert");
  expect(firstAlert.textContent).toContain("Profile service unavailable");
  const button = screen.getByRole("button", { name: "Try again" });
  button.focus();
  fireEvent.click(button);
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  // The error view stays up, with focus on its busy button.
  expect(button.isConnected).toBe(true);
  expect(document.activeElement).toBe(button);
  expect(button.getAttribute("aria-disabled")).toBe("true");
  expect(button.textContent).toBe("Trying again…");
  return {
    firstAlert,
    button,
    answer: (response: Response) =>
      act(async () => {
        answerRetry(response);
      }),
  };
}

it("retries the profile request in place, then lands on the page heading", async () => {
  const reload = vi.fn();
  vi.stubGlobal("location", { ...window.location, reload });
  const { button, answer } = await failThenHoldRetry();
  expect(reload).not.toHaveBeenCalled();

  await answer(json(200, apiProfile));
  await screen.findByRole("textbox", { name: "Phone" });
  await waitFor(() =>
    expect(document.activeElement).toBe(
      screen.getByRole("heading", { level: 1, name: "Giving page" }),
    ),
  );
  expect(button.isConnected).toBe(false);
});

it("announces a load failure once, in the page, on the first failure and on a failed retry", async () => {
  const { answer } = await failThenHoldRetry();
  // The inline alert speaks for the failure; no toast repeats it.
  expect(screen.getAllByRole("alert")).toHaveLength(1);
  expect(toast.error).not.toHaveBeenCalled();

  await answer(failure());
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "Try again" })).toBeTruthy(),
  );
  expect(screen.getAllByRole("alert")).toHaveLength(1);
  expect(toast.error).not.toHaveBeenCalled();
});

it("leaves focus on the button and announces again when the retry fails again", async () => {
  const { firstAlert, button, answer } = await failThenHoldRetry();

  await answer(failure());
  await waitFor(() => expect(button.textContent).toBe("Try again"));
  expect(document.activeElement).toBe(button);
  expect(button.getAttribute("aria-disabled")).not.toBe("true");
  // A new alert node, so the unchanged message is read out again.
  const alert = screen.getByRole("alert");
  expect(alert).not.toBe(firstAlert);
  expect(alert.textContent).toContain("Profile service unavailable");
});

it.each([401, 403])(
  "keeps the page heading and lands on the unavailable notice when a retry is answered %i",
  async (status) => {
    const { button, answer } = await failThenHoldRetry();
    const heading = screen.getByRole("heading", {
      level: 1,
      name: "Giving page",
    });

    await answer(json(status, { error: "Forbidden" }));
    const notice = await screen.findByText(
      "Your giving page is unavailable in this account.",
    );
    // The notice replaces the error view inside the page frame, and focus
    // lands on it, so the outcome is read out rather than only the heading.
    await waitFor(() => expect(document.activeElement).toBe(notice));
    // Wait past the retry's settling: nothing moves focus off the notice.
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20));
    });
    expect(document.activeElement?.textContent).toBe(
      "Your giving page is unavailable in this account.",
    );
    expect(heading.isConnected).toBe(true);
    expect(button.isConnected).toBe(false);
    expect(screen.queryByRole("button", { name: /Save|Discard/ })).toBeNull();
  },
);

it("shows the unavailable notice, not a skeleton, when read access ended before the page mounts", async () => {
  // A 401 ends read access for the session.
  fetchMock.mockImplementationOnce(async () =>
    json(401, { error: "Unauthorized" }),
  );
  const tree = (open: boolean) => (
    <DraftTestProvider>
      <QueryProvider>{open ? <ProfilePageClient /> : null}</QueryProvider>
    </DraftTestProvider>
  );
  const { rerender } = render(tree(true));
  await screen.findByText("Your giving page is unavailable in this account.");

  // Leave the page and let the query cache drop the profile query.
  rerender(tree(false));
  getQueryClient().removeQueries({ queryKey: ["profile"] });

  rerender(tree(true));
  expect(
    await screen.findByText("Your giving page is unavailable in this account."),
  ).toBeTruthy();
  expect(
    screen.getByRole("heading", { level: 1, name: "Giving page" }),
  ).toBeTruthy();
  expect(document.querySelector('[data-slot="skeleton"]')).toBeNull();
  // The query stays off once read access has ended.
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

it("announces the unavailable notice when focus left Try again before a 401 answer", async () => {
  render(<button type="button">Tasks</button>);
  const { answer } = await failThenHoldRetry();
  const elsewhere = screen.getByRole("button", { name: "Tasks" });
  elsewhere.focus();

  await answer(json(401, { error: "Unauthorized" }));
  await waitFor(() =>
    expect(screen.queryByRole("button", { name: "Trying again…" })).toBeNull(),
  );
  // Focus stays where the user put it, so a live region says what happened.
  await waitFor(() =>
    expect(
      screen
        .getAllByRole("status")
        .some((region) => region.textContent === unavailableText),
    ).toBe(true),
  );
  expect(document.activeElement).toBe(elsewhere);
});

it("shows the skeleton, not the unavailable notice, while the session is still loading", async () => {
  fetchMock.mockImplementationOnce(async () => json(200, apiProfile));
  const tree = (owner: typeof draftTestOwner | null) => (
    <RetainedDraftProvider owner={owner}>
      <QueryProvider>
        <ProfilePageClient />
      </QueryProvider>
    </RetainedDraftProvider>
  );
  // No session owns drafts until auth has loaded, as on a hard load.
  const { rerender } = render(tree(null));
  expect(document.querySelector('[data-slot="skeleton"]')).not.toBeNull();
  expect(screen.queryByText(unavailableText)).toBeNull();
  expect(fetchMock).not.toHaveBeenCalled();

  rerender(tree(draftTestOwner));
  expect(await screen.findByRole("textbox", { name: "Phone" })).toBeTruthy();
  expect(screen.queryByText(unavailableText)).toBeNull();
});

it("lands on the unavailable notice when a background 401 removes the focused unsaved-changes bar", async () => {
  fetchMock
    .mockImplementationOnce(async () => json(200, apiProfile))
    .mockImplementationOnce(async () => json(401, { error: "Unauthorized" }));
  renderPage();
  const phone = await screen.findByRole("textbox", { name: "Phone" });
  fireEvent.change(phone, { target: { value: "555 0100" } });
  const bar = (await screen.findByText("You have unsaved changes."))
    .parentElement as HTMLElement;
  within(bar).getByRole("button", { name: "Discard" }).focus();

  await act(async () => {
    await getQueryClient().refetchQueries({ queryKey: ["profile"] });
  });
  const notice = await screen.findByText(unavailableText);
  // The bar hands focus back a frame after it leaves; the notice keeps it.
  await nextFrame();
  expect(document.activeElement).toBe(notice);
});

/** Loads the profile, edits Phone, then fails a background refetch. */
async function editThenFailRefetch() {
  fetchMock
    .mockImplementationOnce(async () => json(200, apiProfile))
    .mockImplementationOnce(async () => failure());
  renderPage();
  const phone = await screen.findByRole("textbox", { name: "Phone" });
  fireEvent.change(phone, { target: { value: "555 0100" } });
  phone.focus();
  await screen.findByText("You have unsaved changes.");

  await act(async () => {
    await getQueryClient().refetchQueries({ queryKey: ["profile"] });
  });
  const alert = await screen.findByRole("alert");
  return { phone, alert };
}

it("keeps the editor, its actions and the unsaved-changes bar when a background refetch fails", async () => {
  const { phone, alert } = await editThenFailRefetch();

  expect(alert.textContent).toContain("Profile service unavailable");
  expect(fetchMock).toHaveBeenCalledTimes(2);
  // The loaded profile and the draft over it stay editable.
  expect(phone.isConnected).toBe(true);
  expect((phone as HTMLInputElement).value).toBe("555 0100");
  expect(document.activeElement).toBe(phone);
  expect(screen.getAllByRole("button", { name: "Save changes" })).toHaveLength(
    2,
  );
  expect(screen.getAllByRole("button", { name: "Discard" })).toHaveLength(2);
  expect(screen.getByText("You have unsaved changes.")).toBeTruthy();
  expect(screen.getByRole("button", { name: "Try again" })).toBeTruthy();
  expect(toast.error).not.toHaveBeenCalled();
});

it("retries a failed background refetch in place and keeps the draft", async () => {
  await editThenFailRefetch();
  let answerRetry!: (response: Response) => void;
  fetchMock.mockImplementationOnce(
    () =>
      new Promise<Response>((resolve) => {
        answerRetry = resolve;
      }),
  );
  const button = screen.getByRole("button", { name: "Try again" });
  button.focus();
  fireEvent.click(button);
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
  expect(document.activeElement).toBe(button);
  expect(button.getAttribute("aria-disabled")).toBe("true");
  expect(button.textContent).toBe("Trying again…");
  // The editor stays usable while the retry runs.
  expect(screen.getByRole("textbox", { name: "Phone" })).toBeTruthy();
  expect(screen.getByText("You have unsaved changes.")).toBeTruthy();

  await act(async () => {
    answerRetry(json(200, apiProfile));
  });
  await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
  await waitFor(() =>
    expect(document.activeElement).toBe(
      screen.getByRole("heading", { level: 1, name: "Giving page" }),
    ),
  );
  expect(button.isConnected).toBe(false);
  expect(
    (screen.getByRole("textbox", { name: "Phone" }) as HTMLInputElement).value,
  ).toBe("555 0100");
  expect(screen.getByText("You have unsaved changes.")).toBeTruthy();
});

it("leaves focus on the refetch Try again and announces again when it fails again", async () => {
  const { alert: firstAlert } = await editThenFailRefetch();
  let answerRetry!: (response: Response) => void;
  fetchMock.mockImplementationOnce(
    () =>
      new Promise<Response>((resolve) => {
        answerRetry = resolve;
      }),
  );
  const button = screen.getByRole("button", { name: "Try again" });
  button.focus();
  fireEvent.click(button);
  await waitFor(() => expect(button.textContent).toBe("Trying again…"));

  await act(async () => {
    answerRetry(failure());
  });
  await waitFor(() => expect(button.textContent).toBe("Try again"));
  expect(document.activeElement).toBe(button);
  expect(button.getAttribute("aria-disabled")).not.toBe("true");
  // A new alert node, so the unchanged message is read out again.
  const alert = screen.getByRole("alert");
  expect(alert).not.toBe(firstAlert);
  expect(alert.textContent).toContain("Profile service unavailable");
  expect(screen.getByRole("textbox", { name: "Phone" })).toBeTruthy();
});

it("does not show an old refresh failure while a new refresh runs", async () => {
  let answerRefresh!: (response: Response) => void;
  fetchMock
    .mockImplementationOnce(async () => json(200, apiProfile))
    .mockImplementationOnce(async () => failure())
    .mockImplementationOnce(
      () =>
        new Promise<Response>((resolve) => {
          answerRefresh = resolve;
        }),
    );
  const tree = (open: boolean) => (
    <DraftTestProvider>
      <QueryProvider>{open ? <ProfilePageClient /> : null}</QueryProvider>
    </DraftTestProvider>
  );
  const { rerender } = render(tree(true));
  await screen.findByRole("textbox", { name: "Phone" });
  await act(async () => {
    await getQueryClient().refetchQueries({ queryKey: ["profile"] });
  });
  await screen.findByRole("alert");

  // Come back once the profile is stale, so the page refetches on mount.
  rerender(tree(false));
  const later = Date.now() + 2 * 60_000;
  vi.spyOn(Date, "now").mockReturnValue(later);
  rerender(tree(true));
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
  expect(screen.getByRole("textbox", { name: "Phone" })).toBeTruthy();
  expect(screen.queryByRole("alert")).toBeNull();
  expect(screen.queryByRole("button", { name: "Try again" })).toBeNull();

  await act(async () => {
    answerRefresh(failure());
  });
  const alert = await screen.findByRole("alert");
  expect(alert.textContent).toContain("Profile service unavailable");
  expect(screen.getByRole("button", { name: "Try again" })).toBeTruthy();
  expect(fetchMock).toHaveBeenCalledTimes(3);
});

it("returns focus to the page when a new refresh hides the focused Try again", async () => {
  await editThenFailRefetch();
  let answerRefresh!: (response: Response) => void;
  fetchMock.mockImplementationOnce(
    () =>
      new Promise<Response>((resolve) => {
        answerRefresh = resolve;
      }),
  );
  screen.getByRole("button", { name: "Try again" }).focus();

  // A refetch the alert did not start, as on reconnect.
  let refresh!: Promise<void>;
  act(() => {
    refresh = getQueryClient().refetchQueries({ queryKey: ["profile"] });
  });
  await waitFor(() =>
    expect(screen.queryByRole("button", { name: "Try again" })).toBeNull(),
  );
  expect(screen.queryByRole("alert")).toBeNull();
  await nextFrame();
  const heading = screen.getByRole("heading", {
    level: 1,
    name: "Giving page",
  });
  expect(document.activeElement).not.toBe(document.body);
  expect(document.activeElement?.contains(heading)).toBe(true);

  await act(async () => {
    answerRefresh(failure());
    await refresh;
  });
  expect((await screen.findByRole("alert")).textContent).toContain(
    "Profile service unavailable",
  );
  expect(screen.getByRole("button", { name: "Try again" })).toBeTruthy();
  expect(document.activeElement?.contains(heading)).toBe(true);
});
