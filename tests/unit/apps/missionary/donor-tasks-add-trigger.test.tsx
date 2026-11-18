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

// WP2b, AL-2675: the dialog reads partners from the workspace's redacted
// partner route and saves through the task routes, both behind the own-API
// wrapper, instead of the browser client's `donors` and `missionary_tasks`
// tables. The boundary is the wrapper: `donorRead` records partner reads,
// `taskWrites` any task route request.
const boundaries = vi.hoisted(() => {
  const taskWrites = {
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  };
  const donorRead = vi.fn();

  return {
    profile: { id: "missionary-fixture" },
    taskWrites,
    donorRead,
    ownApiFetch: vi.fn(async (path: string, init: RequestInit = {}) => {
      if (path.startsWith("/api/missionary/donors")) {
        donorRead(path);
        return Response.json({
          donors: [
            {
              id: "donor-anna-fixture",
              name: "Anna Fixture",
              email: "anna@example.test",
              avatar_url: null,
            },
          ],
          hasMore: false,
          nextOffset: null,
        });
      }
      if (path.startsWith("/api/missionary/tasks")) {
        const method = (init.method ?? "GET").toLowerCase();
        taskWrites[method as keyof typeof taskWrites]?.(path, init);
        return Response.json(
          { error: "Unexpected task write" },
          { status: 500 },
        );
      }
      throw new Error(`Unexpected own-API path: ${path}`);
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
vi.mock("@asym/database/own-api", () => ({
  ownApiFetch: boundaries.ownApiFetch,
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
  expect(boundaries.ownApiFetch).not.toHaveBeenCalledWith(
    expect.stringMatching(/^\/api\/missionary\/tasks/),
    expect.anything(),
  );
}

it.each(["Escape", "Cancel"] as const)(
  "opens the real Create Task dialog from Add Task keyboard activation and returns focus after %s without writes",
  async (dismissal) => {
    render(
      <DonorTasks donorId="donor-anna-fixture" donorName="Anna Fixture" />,
    );
    const trigger = screen.getByRole("button", { name: "Add task" });
    expect(trigger.getAttribute("aria-haspopup")).toBe("dialog");
    expect(screen.queryByRole("dialog")).toBeNull();
    expectNoTaskWrites();

    activateNativeButtonByKeyboard(trigger);

    const dialog = await screen.findByRole("dialog", {
      name: "Create Task",
    });
    expect(
      within(dialog).getByRole("textbox", { name: "Title *" }),
    ).toBeTruthy();
    const partner = within(dialog).getByRole("combobox", {
      name: "Partner",
    });
    await waitFor(() => expect(partner.textContent).toContain("Anna Fixture"));
    // The route takes the missionary from the resolved assignment.
    expect(boundaries.donorRead).toHaveBeenCalledWith(
      "/api/missionary/donors?limit=100&offset=0",
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
