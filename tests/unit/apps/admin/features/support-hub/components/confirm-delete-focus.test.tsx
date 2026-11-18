// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import * as React from "react";
import { afterEach, expect, it, vi } from "vitest";

import { SlaPolicyList } from "../../../../../../../apps/admin/features/support-hub/components/settings/sla/SlaPolicyList";
import {
  ConfirmProvider,
  useConfirm,
} from "../../../../../../../apps/admin/features/support-hub/components/workspace/confirm-provider";
import {
  QueryClient,
  QueryClientProvider,
} from "../../../../../../../apps/admin/node_modules/@tanstack/react-query/build/modern/index.js";

function policy(id: string, name: string, isDefault: boolean) {
  return {
    id,
    tenantId: "tenant-1",
    name,
    description: null,
    firstResponseMinutes: 480,
    nextResponseMinutes: 720,
    resolutionMinutes: 7200,
    businessHoursId: null,
    isDefault,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

const json = (status: number, body: unknown) => ({
  ok: status < 400,
  status,
  json: async () => body,
});

// The list refetches after a delete (`mutateAsync` awaits the invalidation),
// so the deleted row and its Delete button leave the DOM before the dialog
// closes.
function stubApi(
  names = ["Standard", "Urgent", "VIP"],
  { failDelete = false } = {},
) {
  let policies = names.map((name, index) =>
    policy(`sla-${name.toLowerCase()}`, name, index === 0),
  );
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (init?.method === "DELETE") {
        if (failDelete) return json(500, { error: "Delete failed." });
        policies = policies.filter((row) => row.id !== url.split("/").pop());
        return json(204, {});
      }
      if (url.includes("sla-policies"))
        return json(200, { slaPolicies: policies });
      if (url.includes("business-hours"))
        return json(200, { businessHours: [] });
      return json(200, {});
    }),
  );
}

function renderList() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <ConfirmProvider>
        <button type="button">Unrelated shell control</button>
        <SlaPolicyList />
      </ConfirmProvider>
    </QueryClientProvider>,
  );
}

async function openConfirm(name: string, { focus = true } = {}) {
  const remove = await screen.findByRole("button", { name: `Delete ${name}` });
  if (focus) remove.focus();
  fireEvent.click(remove, { detail: 0 });
  await screen.findByRole("alertdialog");
  return remove;
}

async function confirmDelete(name: string) {
  fireEvent.click(screen.getByRole("button", { name: "Delete policy" }), {
    detail: 0,
  });
  await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
  await waitFor(() =>
    expect(screen.queryByRole("button", { name: `Delete ${name}` })).toBeNull(),
  );
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it("moves focus to the next row after a confirmed delete removes the row", async () => {
  stubApi();
  renderList();
  await openConfirm("Urgent");
  await confirmDelete("Urgent");
  await waitFor(() =>
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Edit VIP" }),
    ),
  );
});

it("ignores whichever popup the page opened earlier", async () => {
  stubApi();
  renderList();
  const edit = await screen.findByRole("button", { name: "Edit Standard" });
  edit.focus();
  fireEvent.click(edit, { detail: 0 });
  const sheet = await screen.findByRole("dialog");
  fireEvent.keyDown(sheet, { key: "Escape" });
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

  await openConfirm("Urgent");
  await confirmDelete("Urgent");
  await waitFor(() =>
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Edit VIP" }),
    ),
  );
});

it("moves focus to the previous row after deleting the last row", async () => {
  stubApi();
  renderList();
  await openConfirm("VIP");
  await confirmDelete("VIP");
  await waitFor(() =>
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Edit Urgent" }),
    ),
  );
});

it("moves focus to the empty state's create button once the list is empty", async () => {
  stubApi(["Standard"]);
  renderList();
  await openConfirm("Standard");
  await confirmDelete("Standard");
  await waitFor(() =>
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "New policy" }),
    ),
  );
});

it("returns focus to the Delete button after Cancel", async () => {
  stubApi();
  renderList();
  const remove = await openConfirm("Urgent");
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }), {
    detail: 0,
  });
  await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
  await waitFor(() => expect(document.activeElement).toBe(remove));
});

it("returns focus to the Delete button after a failed delete is cancelled", async () => {
  stubApi(undefined, { failDelete: true });
  renderList();
  const remove = await openConfirm("Urgent");
  fireEvent.click(screen.getByRole("button", { name: "Delete policy" }), {
    detail: 0,
  });
  expect(await screen.findByRole("alert")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }), {
    detail: 0,
  });
  await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
  await waitFor(() => expect(document.activeElement).toBe(remove));
});

// Safari and macOS Firefox do not focus a clicked button, so focus is still
// wherever it was before the click.
it("uses the clicked Delete button when the click did not focus it", async () => {
  stubApi();
  renderList();
  screen.getByRole("button", { name: "Unrelated shell control" }).focus();
  const remove = await openConfirm("Urgent", { focus: false });
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
  await waitFor(() => expect(document.activeElement).toBe(remove));

  screen.getByRole("button", { name: "Unrelated shell control" }).focus();
  await openConfirm("Urgent", { focus: false });
  await confirmDelete("Urgent");
  await waitFor(() =>
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Edit VIP" }),
    ),
  );
});

type Removal = "before-close" | "after-close" | "never";

function PlainList({ removal }: { removal: Removal }) {
  const confirm = useConfirm();
  const [rows, setRows] = React.useState(["Billing", "Gifts", "Receipts"]);
  const remove = (name: string) =>
    setRows((current) => current.filter((row) => row !== name));
  return (
    <ul aria-label="Labels">
      {rows.map((name) => (
        <li key={name}>
          <button type="button">Edit {name}</button>
          <button
            type="button"
            onClick={() =>
              void confirm({
                title: `Delete ${name}?`,
                confirmLabel: "Delete label",
                action: async () => {
                  if (removal === "before-close") remove(name);
                  if (removal === "after-close")
                    setTimeout(() => remove(name), 50);
                },
              })
            }
          >
            Delete {name}
          </button>
        </li>
      ))}
    </ul>
  );
}

async function deleteGifts(removal: Removal) {
  render(
    <ConfirmProvider>
      <PlainList removal={removal} />
    </ConfirmProvider>,
  );
  const remove = screen.getByRole("button", { name: "Delete Gifts" });
  remove.focus();
  fireEvent.click(remove, { detail: 0 });
  fireEvent.click(await screen.findByRole("button", { name: "Delete label" }));
  await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
  return remove;
}

it("treats native list items as rows", async () => {
  await deleteGifts("before-close");
  await waitFor(() =>
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Edit Receipts" }),
    ),
  );
});

it("follows the next row when the row is removed just after the dialog closes", async () => {
  await deleteGifts("after-close");
  await waitFor(() =>
    expect(screen.queryByRole("button", { name: "Delete Gifts" })).toBeNull(),
  );
  await waitFor(() =>
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Edit Receipts" }),
    ),
  );
});

it("keeps focus on the Delete button when a confirmed action leaves the row", async () => {
  const remove = await deleteGifts("never");
  await waitFor(() => expect(document.activeElement).toBe(remove));
});

function OnlyLabelDialog() {
  const confirm = useConfirm();
  const [rows, setRows] = React.useState(["Billing"]);
  return (
    <div role="dialog" aria-label="Manage labels">
      <button type="button">New label</button>
      <ul aria-label="Labels">
        {rows.map((name) => (
          <li key={name}>
            <button
              type="button"
              onClick={() =>
                void confirm({
                  title: `Delete ${name}?`,
                  confirmLabel: "Delete label",
                  action: async () => setRows([]),
                })
              }
            >
              Delete {name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

it("moves focus into the surrounding dialog after deleting its only row", async () => {
  render(
    <ConfirmProvider>
      <OnlyLabelDialog />
    </ConfirmProvider>,
  );
  const remove = screen.getByRole("button", { name: "Delete Billing" });
  remove.focus();
  fireEvent.click(remove, { detail: 0 });
  fireEvent.click(await screen.findByRole("button", { name: "Delete label" }));
  await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
  await waitFor(() =>
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "New label" }),
    ),
  );
});

function RowWithUntabbableControls({ late }: { late: boolean }) {
  const confirm = useConfirm();
  const [rows, setRows] = React.useState(["Gifts", "Receipts"]);
  return (
    <ul aria-label="Labels">
      {rows.map((name) => (
        <li key={name}>
          <input type="hidden" name={`label-${name}`} value={name} />
          <input aria-hidden tabIndex={-1} readOnly value={name} />
          <button type="button" tabIndex={-1}>
            Hidden action {name}
          </button>
          <button type="button">Edit {name}</button>
          <button
            type="button"
            onClick={() =>
              void confirm({
                title: `Delete ${name}?`,
                confirmLabel: "Delete label",
                action: async () => {
                  const drop = () =>
                    setRows((current) => current.filter((r) => r !== name));
                  if (late) setTimeout(drop, 50);
                  else drop();
                },
              })
            }
          >
            Delete {name}
          </button>
        </li>
      ))}
    </ul>
  );
}

it("skips hidden and untabbable controls when following a row removed after close", async () => {
  render(
    <ConfirmProvider>
      <RowWithUntabbableControls late />
    </ConfirmProvider>,
  );
  const remove = screen.getByRole("button", { name: "Delete Gifts" });
  remove.focus();
  fireEvent.click(remove, { detail: 0 });
  fireEvent.click(await screen.findByRole("button", { name: "Delete label" }));
  await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
  await waitFor(() =>
    expect(screen.queryByRole("button", { name: "Delete Gifts" })).toBeNull(),
  );
  await waitFor(() =>
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Edit Receipts" }),
    ),
  );
});

it("stops following the opener once the person interacts again", async () => {
  const remove = await deleteGifts("never");
  await waitFor(() => expect(document.activeElement).toBe(remove));
  // The person clicks empty page space: focus leaves for <body> without a
  // focusin, and only later does something else drop the row.
  fireEvent.pointerDown(document.body);
  remove.blur();
  expect(document.activeElement).toBe(document.body);
  remove.closest("li")?.remove();
  await new Promise((resolve) => setTimeout(resolve, 50));
  expect(document.activeElement).toBe(document.body);
});
