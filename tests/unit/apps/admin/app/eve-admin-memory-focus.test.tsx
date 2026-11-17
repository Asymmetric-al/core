/** @vitest-environment jsdom */

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- Component integration tests exercise the actual admin panel.
import { EveAdminMemoryPanel } from "../../../../../apps/admin/app/(app)/admin/eve/admin-memory-panel";
import { getQueryClient } from "../../../../../packages/database/providers/query-client";
import { QueryProvider } from "../../../../../packages/database/providers/query-provider";

import type { EveAdminMemoryAdminView } from "../../../../../packages/api/src/eve/admin-memory/types";

const timestamp = "2026-11-01T12:00:00.000Z";
type View = EveAdminMemoryAdminView & { requestId: string };

function createView(
  overrides: Partial<View["entries"][number]> = {},
  version = 1,
): View {
  return {
    requestId: `request-${version}`,
    entries: [
      {
        category: "preference",
        content: `Content version ${version}`,
        createdAt: timestamp,
        id: "entry-1",
        isDeleted: false,
        ownerProfileId: "profile-1",
        scopeType: "admin_private",
        source: "manual",
        tenantId: "tenant-1",
        title: "Project convention",
        updatedAt: timestamp,
        version,
        ...overrides,
      },
    ],
    history: [],
    settings: [],
  };
}

function ok(body: View) {
  return { ok: true, json: async () => body };
}

function stubFetch(onMutation: () => View = () => createView({}, 2)) {
  const fetchMock = vi.fn(
    async (_input: RequestInfo | URL, init?: RequestInit) =>
      init?.method ? ok(onMutation()) : ok(createView()),
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function mutationBodies(fetchMock: ReturnType<typeof stubFetch>) {
  return fetchMock.mock.calls
    .filter(([, init]) => init?.method)
    .map(([, init]) => JSON.parse(String(init?.body)) as unknown);
}

function renderPanel() {
  return render(
    <QueryProvider>
      <EveAdminMemoryPanel />
    </QueryProvider>,
  );
}

beforeEach(() => getQueryClient().clear());

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  getQueryClient().clear();
});

describe("Eve memory entry inline edit focus", () => {
  it("moves focus into the editor and back to the entry's Edit button on cancel", async () => {
    stubFetch();
    renderPanel();
    const edit = await screen.findByRole("button", {
      name: "Edit: Project convention",
    });
    edit.focus();
    fireEvent.click(edit);

    const title = await screen.findByDisplayValue("Project convention");
    await waitFor(() => expect(document.activeElement).toBe(title));

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Edit: Project convention" }),
      ),
    );
  });

  it("returns focus to the entry's Edit button after a successful save", async () => {
    const fetchMock = stubFetch(() =>
      createView({ title: "Renamed convention" }, 2),
    );
    renderPanel();
    fireEvent.click(
      await screen.findByRole("button", { name: "Edit: Project convention" }),
    );
    const title = await screen.findByDisplayValue("Project convention");
    fireEvent.change(title, { target: { value: "Renamed convention" } });
    fireEvent.submit(title);

    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Edit: Renamed convention" }),
      ),
    );
    expect(mutationBodies(fetchMock)).toHaveLength(1);
  });

  it("keeps focus on the deleted entry after the delete confirmation closes", async () => {
    stubFetch(() => createView({ isDeleted: true }, 2));
    renderPanel();
    const remove = await screen.findByRole("button", {
      name: "Delete: Project convention",
    });
    remove.focus();
    fireEvent.click(remove);
    fireEvent.click(
      await screen.findByRole("button", { name: "Confirm delete" }),
    );

    await screen.findByText("Deleted");
    await waitFor(() => {
      const active = document.activeElement;
      expect(active).not.toBe(document.body);
      expect(active?.textContent).toContain("Project convention");
      expect(active?.textContent).toContain("Deleted");
    });
  });

  it("keeps focus on the Delete button while the delete is pending and after it fails", async () => {
    let resolveDelete: (value: unknown) => void = () => {};
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) =>
        init?.method === "DELETE"
          ? new Promise((resolve) => {
              resolveDelete = resolve;
            })
          : ok(createView()),
      ),
    );
    renderPanel();
    const remove = await screen.findByRole("button", {
      name: "Delete: Project convention",
    });
    remove.focus();
    fireEvent.click(remove);
    fireEvent.click(
      await screen.findByRole("button", { name: "Confirm delete" }),
    );

    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(remove));

    await act(async () => {
      resolveDelete({
        ok: false,
        json: async () => ({ error: "Synthetic delete failure" }),
      });
    });
    expect(await screen.findByText("Synthetic delete failure")).toBeTruthy();
    expect(document.activeElement).toBe(remove);
  });

  it("moves focus to the memory search when the deleted entry is hidden", async () => {
    stubFetch(() => createView({ isDeleted: true }, 2));
    renderPanel();
    fireEvent.click(
      await screen.findByRole("button", { name: "Hide deleted" }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Delete: Project convention" }),
    );
    fireEvent.click(
      await screen.findByRole("button", { name: "Confirm delete" }),
    );

    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole("textbox", { name: "Search private memory" }),
      ),
    );
  });
});

describe("Eve memory forms", () => {
  it("submits a new private memory with Enter from the title field", async () => {
    const fetchMock = stubFetch(() => createView());
    renderPanel();
    await screen.findByRole("button", { name: "Edit: Project convention" });
    const title = screen.getByRole("textbox", { name: "Title" });
    fireEvent.change(title, { target: { value: "Release notes" } });
    fireEvent.change(
      screen.getByRole("textbox", { name: "Advisory context" }),
      { target: { value: "Keep them short." } },
    );
    expect(title.closest("form")).not.toBeNull();
    fireEvent.submit(title);

    await waitFor(() =>
      expect(mutationBodies(fetchMock)).toEqual([
        {
          category: "preference",
          content: "Keep them short.",
          title: "Release notes",
        },
      ]),
    );
  });

  it("keeps Add private memory reachable and reports missing fields on the inputs", async () => {
    const fetchMock = stubFetch();
    renderPanel();
    await screen.findByRole("button", { name: "Edit: Project convention" });
    const add = screen.getByRole("button", { name: "Add private memory" });
    expect(add.hasAttribute("disabled")).toBe(false);
    expect(add.getAttribute("type")).toBe("submit");

    fireEvent.click(add);

    const title = screen.getByRole("textbox", { name: "Title" });
    const content = screen.getByRole("textbox", { name: "Advisory context" });
    await waitFor(() => expect(document.activeElement).toBe(title));
    expect(title.getAttribute("aria-invalid")).toBe("true");
    expect(content.getAttribute("aria-invalid")).toBe("true");
    const titleError = document.getElementById(
      title.getAttribute("aria-describedby") ?? "",
    );
    expect(titleError?.textContent).toBe("Enter a title.");
    const contentError = document.getElementById(
      content.getAttribute("aria-describedby") ?? "",
    );
    expect(contentError?.textContent).toBe("Enter the advisory context.");
    expect(mutationBodies(fetchMock)).toHaveLength(0);

    fireEvent.change(title, { target: { value: "Release notes" } });
    expect(title.hasAttribute("aria-invalid")).toBe(false);
    expect(content.getAttribute("aria-invalid")).toBe("true");
  });

  it("reports a blank edit on the editor's fields instead of a disabled save", async () => {
    const fetchMock = stubFetch();
    renderPanel();
    fireEvent.click(
      await screen.findByRole("button", { name: "Edit: Project convention" }),
    );
    const title = await screen.findByDisplayValue("Project convention");
    fireEvent.change(title, { target: { value: "  " } });
    const save = screen.getByRole("button", { name: "Save new version" });
    expect(save.hasAttribute("disabled")).toBe(false);

    await act(async () => {
      fireEvent.click(save);
    });

    expect(title.getAttribute("aria-invalid")).toBe("true");
    expect(
      document.getElementById(title.getAttribute("aria-describedby") ?? "")
        ?.textContent,
    ).toBe("Enter a title.");
    expect(document.activeElement).toBe(title);
    expect(mutationBodies(fetchMock)).toHaveLength(0);
  });

  it("caps the editor's fields at the lengths the memory API accepts", async () => {
    stubFetch();
    renderPanel();
    fireEvent.click(
      await screen.findByRole("button", { name: "Edit: Project convention" }),
    );
    // updateEveAdminMemorySchema: title up to 120 characters, content up to 4,000.
    const title = (await screen.findByDisplayValue(
      "Project convention",
    )) as HTMLInputElement;
    expect(title.maxLength).toBe(120);
    const editor = title.closest("form");
    const content = editor?.querySelector("textarea");
    expect(content?.maxLength).toBe(4000);
  });
});
