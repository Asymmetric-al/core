/** @vitest-environment jsdom */

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import * as React from "react";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { getQueryClient } from "../../../../../packages/database/providers/query-client";
import { QueryProvider } from "../../../../../packages/database/providers/query-provider";

import type { EveAdminMemoryAdminView } from "../../../../../packages/api/src/eve/admin-memory/types";

let EveAdminMemoryPanel: React.ComponentType;
beforeAll(async () => {
  const module =
    await import("../../../../../apps/admin/app/(app)/admin/eve/admin-memory-panel");
  EveAdminMemoryPanel = module.EveAdminMemoryPanel;
});

vi.mock("@asym/ui/components/shadcn/alert", () => ({
  Alert: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  AlertDescription: ({ children }: React.PropsWithChildren) => (
    <p>{children}</p>
  ),
  AlertTitle: ({ children }: React.PropsWithChildren) => <h3>{children}</h3>,
}));

vi.mock("@asym/ui/components/shadcn/alert-dialog", () => ({
  AlertDialog: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  AlertDialogAction: (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button type="button" {...props} />
  ),
  AlertDialogCancel: (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button type="button" {...props} />
  ),
  AlertDialogContent: ({ children }: React.PropsWithChildren) => (
    <div>{children}</div>
  ),
  AlertDialogDescription: ({ children }: React.PropsWithChildren) => (
    <p>{children}</p>
  ),
  AlertDialogFooter: ({ children }: React.PropsWithChildren) => (
    <footer>{children}</footer>
  ),
  AlertDialogHeader: ({ children }: React.PropsWithChildren) => (
    <header>{children}</header>
  ),
  AlertDialogTitle: ({ children }: React.PropsWithChildren) => (
    <h2>{children}</h2>
  ),
  AlertDialogTrigger: ({
    onClick,
    render: trigger,
  }: {
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    render: React.ReactElement<React.ButtonHTMLAttributes<HTMLButtonElement>>;
  }) => React.cloneElement(trigger, { onClick }),
}));

vi.mock("@asym/ui/components/shadcn/badge", () => ({
  Badge: ({ children }: React.PropsWithChildren) => <span>{children}</span>,
}));

vi.mock("@asym/ui/components/shadcn/button", () => ({
  Button: ({
    focusableWhenDisabled: _focusableWhenDisabled,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    focusableWhenDisabled?: boolean;
  }) => <button type="button" {...props} />,
}));

vi.mock("@asym/ui/components/shadcn/card", () => ({
  Card: ({ children }: React.PropsWithChildren) => (
    <section>{children}</section>
  ),
  CardContent: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  CardDescription: ({ children }: React.PropsWithChildren) => <p>{children}</p>,
  CardHeader: ({ children }: React.PropsWithChildren) => (
    <header>{children}</header>
  ),
  CardTitle: ({ children, ...props }: React.PropsWithChildren) => (
    <h2 {...props}>{children}</h2>
  ),
}));

vi.mock("@asym/ui/components/shadcn/input", () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} />
  ),
}));

vi.mock("@asym/ui/components/shadcn/label", () => ({
  Label: (props: React.LabelHTMLAttributes<HTMLLabelElement>) => (
    <label {...props} />
  ),
}));

vi.mock("@asym/ui/components/shadcn/skeleton", () => ({
  Skeleton: () => <div />,
}));

vi.mock("@asym/ui/components/shadcn/textarea", () => ({
  Textarea: (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea {...props} />
  ),
}));

const queryKey = ["admin", "eve", "admin-memory"] as const;
const timestamp = "2026-07-19T12:00:00.000Z";

function createView(version: number): EveAdminMemoryAdminView & {
  requestId: string;
} {
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
        title: `Title version ${version}`,
        updatedAt: timestamp,
        version,
      },
    ],
    history: [],
    settings: [],
  };
}

function response(body: EveAdminMemoryAdminView & { requestId: string }) {
  return {
    ok: true,
    json: async () => body,
  };
}

function getMutationBodies(fetchMock: ReturnType<typeof vi.fn>) {
  return fetchMock.mock.calls
    .map(([, init]) => init as RequestInit | undefined)
    .filter((init) => init?.method)
    .map((init) => JSON.parse(String(init?.body)) as Record<string, unknown>);
}

function renderPanel() {
  return render(
    <QueryProvider>
      <EveAdminMemoryPanel />
    </QueryProvider>,
  );
}

beforeEach(() => {
  getQueryClient().clear();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  getQueryClient().clear();
});

describe("Eve admin-memory concurrency intents", () => {
  it("keeps an edit version immutable across refetches and recaptures after cancel", async () => {
    let currentView = createView(1);
    const fetchMock = vi.fn(
      async (_input: RequestInfo | URL, _init?: RequestInit) =>
        response(currentView),
    );
    vi.stubGlobal("fetch", fetchMock);
    renderPanel();

    fireEvent.click(await screen.findByRole("button", { name: "Edit" }));
    currentView = createView(2);
    act(() => getQueryClient().setQueryData(queryKey, currentView));
    fireEvent.click(screen.getByRole("button", { name: "Save new version" }));

    await waitFor(() => {
      expect(getMutationBodies(fetchMock)).toContainEqual(
        expect.objectContaining({
          action: "edit",
          entryId: "entry-1",
          expectedVersion: 1,
        }),
      );
    });

    fireEvent.click(await screen.findByRole("button", { name: "Edit" }));
    currentView = createView(3);
    act(() => getQueryClient().setQueryData(queryKey, currentView));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(screen.getByRole("button", { name: "Save new version" }));

    await waitFor(() => {
      expect(getMutationBodies(fetchMock).at(-1)).toEqual(
        expect.objectContaining({
          action: "edit",
          entryId: "entry-1",
          expectedVersion: 3,
        }),
      );
    });
  });

  it("keeps a delete version immutable across refetches and recaptures after cancel", async () => {
    let currentView = createView(1);
    const fetchMock = vi.fn(
      async (_input: RequestInfo | URL, _init?: RequestInit) =>
        response(currentView),
    );
    vi.stubGlobal("fetch", fetchMock);
    renderPanel();

    fireEvent.click(await screen.findByRole("button", { name: "Delete" }));
    currentView = createView(2);
    act(() => getQueryClient().setQueryData(queryKey, currentView));
    fireEvent.click(screen.getByRole("button", { name: "Confirm delete" }));

    await waitFor(() => {
      expect(getMutationBodies(fetchMock)).toContainEqual({
        entryId: "entry-1",
        expectedVersion: 1,
      });
    });

    fireEvent.click(await screen.findByRole("button", { name: "Delete" }));
    currentView = createView(3);
    act(() => getQueryClient().setQueryData(queryKey, currentView));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm delete" }));

    await waitFor(() => {
      expect(getMutationBodies(fetchMock).at(-1)).toEqual({
        entryId: "entry-1",
        expectedVersion: 3,
      });
    });
  });
});

describe("Eve admin-memory category controls", () => {
  it("submits the selected category when creating private memory", async () => {
    const fetchMock = vi.fn(
      async (_input: RequestInfo | URL, _init?: RequestInit) =>
        response(createView(1)),
    );
    vi.stubGlobal("fetch", fetchMock);
    renderPanel();
    const category = await screen.findByRole("combobox", { name: /Category/ });
    fireEvent.click(category);
    expect(screen.getByRole("listbox")).toBeTruthy();
    fireEvent.pointerDown(
      screen.getByRole("option", { name: "Project context" }),
      { pointerType: "mouse" },
    );
    fireEvent.click(screen.getByRole("option", { name: "Project context" }));
    await waitFor(() => expect(document.activeElement).toBe(category));
    expect(category.textContent).toContain("Project context");
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Project convention" },
    });
    fireEvent.change(screen.getByLabelText("Advisory context"), {
      target: { value: "Use the shared design system." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add private memory" }));
    await waitFor(() =>
      expect(getMutationBodies(fetchMock)).toContainEqual({
        category: "project_context",
        title: "Project convention",
        content: "Use the shared design system.",
      }),
    );
  });

  it("changes an existing category and preserves its version intent", async () => {
    const fetchMock = vi.fn(
      async (_input: RequestInfo | URL, _init?: RequestInit) =>
        response(createView(1)),
    );
    vi.stubGlobal("fetch", fetchMock);
    renderPanel();
    fireEvent.click(await screen.findByRole("button", { name: "Edit" }));
    const category = screen.getAllByRole("combobox", { name: /Category/ })[1];
    if (!category) throw new Error("An editing category control is required");
    category.focus();
    fireEvent.click(category);
    expect(screen.getByRole("listbox")).toBeTruthy();
    fireEvent.pointerDown(screen.getByRole("option", { name: "Decisions" }), {
      pointerType: "mouse",
    });
    fireEvent.click(screen.getByRole("option", { name: "Decisions" }));
    await waitFor(() => expect(category.textContent).toContain("Decisions"));
    await waitFor(() => expect(document.activeElement).toBe(category));
    fireEvent.click(screen.getByRole("button", { name: "Save new version" }));
    await waitFor(() =>
      expect(getMutationBodies(fetchMock)).toContainEqual({
        action: "edit",
        entryId: "entry-1",
        expectedVersion: 1,
        category: "decision",
        title: "Title version 1",
        content: "Content version 1",
      }),
    );
  });
});
