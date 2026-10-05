/** @vitest-environment jsdom */

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

const boundaries = vi.hoisted(() => {
  const taskWrites = {
    insert: vi.fn(),
    update: vi.fn(),
    upsert: vi.fn(),
    delete: vi.fn(),
  };
  const donorRead = {
    select: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
  };
  donorRead.select.mockReturnValue(donorRead);
  donorRead.eq.mockReturnValue(donorRead);
  donorRead.order.mockResolvedValue({
    data: [
      {
        id: "donor-anna-fixture",
        name: "Anna Fixture",
        email: "anna@example.test",
        avatar_url: null,
      },
    ],
    error: null,
  });

  return {
    profile: { id: "missionary-fixture" },
    taskWrites,
    donorRead,
    from: vi.fn((table: string) => {
      if (table === "donors") return donorRead;
      if (table === "missionary_tasks") return taskWrites;
      throw new Error(`Unexpected browser table: ${table}`);
    }),
    completeTask: vi.fn(),
    reopenTask: vi.fn(),
    deleteTask: vi.fn(),
    refresh: vi.fn(),
  };
});

vi.mock("@asym/lib/hooks", () => ({
  useAuth: () => ({ profile: boundaries.profile }),
  useTasks: () => ({
    filteredTasks: [],
    loading: false,
    completeTask: boundaries.completeTask,
    reopenTask: boundaries.reopenTask,
    deleteTask: boundaries.deleteTask,
    refresh: boundaries.refresh,
  }),
}));
vi.mock("@asym/database/supabase", () => ({
  createBrowserClient: () => ({ from: boundaries.from }),
}));

const { DonorTasks } =
  await import("../../../../apps/missionary/app/donors/donor-tasks");

beforeEach(() => {
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
  vi.unstubAllGlobals();
});

function activateNativeButtonByKeyboard(button: HTMLElement) {
  expect(button.tagName).toBe("BUTTON");
  expect(button.getAttribute("aria-disabled")).not.toBe("true");
  expect(button.hasAttribute("disabled")).toBe(false);
  button.focus();
  expect(document.activeElement).toBe(button);
  expect(fireEvent.keyDown(button, { key: "Enter", code: "Enter" })).toBe(true);
  // jsdom omits native button keyboard activation. Supply its default click
  // only after an uncanceled Enter, preserving Base UI's keyboard open method.
  fireEvent.click(button, { detail: 0 });
  fireEvent.keyUp(button, { key: "Enter", code: "Enter" });
}

function expectNoTaskWrites() {
  for (const write of Object.values(boundaries.taskWrites)) {
    expect(write).not.toHaveBeenCalled();
  }
  expect(boundaries.completeTask).not.toHaveBeenCalled();
  expect(boundaries.reopenTask).not.toHaveBeenCalled();
  expect(boundaries.deleteTask).not.toHaveBeenCalled();
  expect(boundaries.refresh).not.toHaveBeenCalled();
  expect(boundaries.from).not.toHaveBeenCalledWith("missionary_tasks");
}

it.each(["Escape", "Cancel"] as const)(
  "opens the real Create Task dialog from Add Task keyboard activation and returns focus after %s without writes",
  async (dismissal) => {
    render(
      <DonorTasks donorId="donor-anna-fixture" donorName="Anna Fixture" />,
    );
    const trigger = screen.getByRole("button", { name: "Add Task" });
    expect(trigger.getAttribute("aria-haspopup")).toBe("dialog");
    expect(screen.queryByRole("dialog")).toBeNull();
    expectNoTaskWrites();

    activateNativeButtonByKeyboard(trigger);

    const dialog = await screen.findByRole("dialog", {
      name: "Create Task",
    });
    expect(
      within(dialog).getByRole("textbox", { name: "Task Title *" }),
    ).toBeTruthy();
    const partner = within(dialog).getByRole("combobox", {
      name: "Associated Partner",
    });
    await waitFor(() => expect(partner.textContent).toContain("Anna Fixture"));
    expect(boundaries.donorRead.eq).toHaveBeenCalledWith(
      "missionary_id",
      "missionary-fixture",
    );
    await waitFor(() =>
      expect(dialog.contains(document.activeElement)).toBe(true),
    );
    expectNoTaskWrites();

    if (dismissal === "Escape") {
      fireEvent.keyDown(dialog, { key: "Escape", code: "Escape" });
    } else {
      activateNativeButtonByKeyboard(
        within(dialog).getByRole("button", { name: "Cancel" }),
      );
    }

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(trigger));
    expectNoTaskWrites();
  },
);
