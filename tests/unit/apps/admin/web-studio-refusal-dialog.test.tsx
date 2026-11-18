// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterAll, afterEach, beforeAll, expect, it, vi } from "vitest";

/**
 * A Web Studio REST call the server refuses (an ended session, no usable
 * organization, or a page opened for another organization than the one now
 * chosen) reaches the person on every screen, not only where Payload shows
 * its error toast: the Web Studio document's fetch wrapper recognizes the
 * refusal by its header and opens one dialog with a Reload action, once per
 * document (AL-2675, council C2). The response itself reaches Payload as
 * the server sent it.
 */

const reload = vi.hoisted(() => vi.fn());
vi.mock("../../../../packages/database/document-reload", () => ({
  reloadDocument: reload,
}));

const SCOPE = {
  userId: "00000000-0000-4000-8000-0000000000c1",
  tenantId: "00000000-0000-0000-0000-000000000001",
  assignmentId: "00000000-0000-4000-8000-0000000000a1",
  addressPrefix: "",
};
const MESSAGE =
  "This page was opened for a different organization. Reload the page to continue; nothing was saved.";

const underlyingFetch = vi.fn(
  async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : String(input);
    if (url.startsWith("/web-studio/api/") && init?.method === "PATCH") {
      return Response.json(
        { message: MESSAGE, errors: [{ message: MESSAGE }] },
        {
          status: 409,
          headers: { "x-asym-web-studio-refusal": "scope_mismatch" },
        },
      );
    }
    return Response.json({ docs: [] });
  },
);
const originalFetch = window.fetch;

let WebStudioDocument: typeof import("../../../../apps/admin/src/cms-ui/web-studio/shell/web-studio-document").WebStudioDocument;

beforeAll(async () => {
  window.fetch = underlyingFetch as typeof fetch;
  ({ WebStudioDocument } =
    await import("../../../../apps/admin/src/cms-ui/web-studio/shell/web-studio-document"));
});
afterAll(() => {
  window.fetch = originalFetch;
});
afterEach(cleanup);

function openDocument() {
  render(
    <WebStudioDocument
      scope={SCOPE}
      organization={{ name: "Alpha Mission", canSwitch: true }}
    >
      <p>Editing a page</p>
    </WebStudioDocument>,
  );
}

async function save() {
  let response: Response | undefined;
  await act(async () => {
    response = await window.fetch("/web-studio/api/pages/7", {
      method: "PATCH",
      body: "{}",
    });
  });
  return response!;
}

it("says nothing while calls succeed", async () => {
  openDocument();
  await act(async () => {
    await window.fetch("/web-studio/api/pages?limit=10");
  });
  expect(screen.queryByRole("alertdialog")).toBeNull();
});

it("opens one dialog with a Reload action when a call is refused, and leaves the response to Payload", async () => {
  openDocument();
  const response = await save();

  expect(response.status).toBe(409);
  await expect(response.json()).resolves.toMatchObject({ message: MESSAGE });
  const dialog = await screen.findByRole("alertdialog");
  expect(dialog.textContent).toContain(MESSAGE);
  expect(screen.getByRole("button", { name: "Not now" })).toBeTruthy();

  // A second refusal, as from a bulk action, opens no second dialog.
  await save();
  expect(screen.getAllByRole("alertdialog")).toHaveLength(1);

  fireEvent.click(screen.getByRole("button", { name: "Reload" }));
  expect(reload).toHaveBeenCalledTimes(1);
});

it("opens it only once in a document", async () => {
  openDocument();
  await save();
  await waitFor(() => expect(underlyingFetch).toHaveBeenCalled());
  expect(screen.queryByRole("alertdialog")).toBeNull();
});

// Council round 2, CR5: once the person has closed the dialog, one notice
// stays, and refused autosaves raise no toast on every pause.

it("keeps one notice with a Reload action once the dialog is closed", () => {
  openDocument();
  const notice = screen.getByRole("status");
  expect(notice.textContent).toContain(MESSAGE);
  reload.mockClear();
  fireEvent.click(within(notice).getByRole("button", { name: "Reload" }));
  expect(reload).toHaveBeenCalledTimes(1);
});

it("hands Payload a refused autosave without a message, so it raises no toast per pause; an explicit save keeps it", async () => {
  openDocument();
  let autosave: Response | undefined;
  await act(async () => {
    autosave = await window.fetch(
      "/web-studio/api/pages/7?autosave=true&depth=0&draft=true",
      { method: "PATCH", body: "{}" },
    );
  });
  expect(autosave!.status).toBe(409);
  expect(autosave!.headers.get("x-asym-web-studio-refusal")).toBe(
    "scope_mismatch",
  );
  await expect(autosave!.json()).resolves.toEqual({ errors: [] });

  const explicit = await save();
  await expect(explicit.json()).resolves.toMatchObject({ message: MESSAGE });
  expect(screen.getAllByRole("status")).toHaveLength(1);
});
