/** @vitest-environment jsdom */

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
import { afterEach, expect, it, vi } from "vitest";

import { TaskKanbanBoard } from "../../../../packages/missionary/components/task-kanban-board";

import type { Task, TaskStatus } from "../../../../packages/missionary/types";

afterEach(cleanup);

// dnd-kit measures the page and waits on animations while dragging; jsdom
// has none of these, so the board gets inert observers and a fixed layout.
class NoopObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
vi.stubGlobal("IntersectionObserver", NoopObserver);
if (!("ResizeObserver" in globalThis)) {
  vi.stubGlobal("ResizeObserver", NoopObserver);
}
vi.stubGlobal("matchMedia", (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener() {},
  removeEventListener() {},
  addListener() {},
  removeListener() {},
  dispatchEvent: () => false,
}));
Object.defineProperty(document, "getAnimations", {
  configurable: true,
  value: () => [],
});

// Lay the board out: columns side by side, cards stacked inside them. The
// drag overlay sits where its card started.
function layout(element: Element): [number, number, number, number] {
  const overlay =
    element.closest('[data-drag-overlay="true"]') ??
    element.querySelector('[data-drag-overlay="true"]');
  if (overlay) {
    const title = overlay.querySelector("h4")?.textContent;
    const source = Array.from(
      document.querySelectorAll("section[aria-label] h4"),
    ).find((heading) => heading.textContent === title);
    const card = source?.closest("section > div:last-child > div");
    return card ? layout(card) : [0, 0, 0, 0];
  }
  const section = element.closest("section[aria-label]");
  if (!section) return [0, 0, 1200, 1000];
  const column = Array.from(
    document.querySelectorAll("section[aria-label]"),
  ).indexOf(section);
  const list = section.querySelector(":scope > div:last-child");
  if (element === list) return [column * 250, 60, 230, 900];
  const card = Array.from(list?.children ?? []).find((child) =>
    child.contains(element),
  );
  if (!card) return [0, 0, 0, 0];
  const index = Array.from(list!.children).indexOf(card);
  return [column * 250 + 10, 70 + index * 110, 210, 100];
}
vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(
  function (this: Element) {
    const [x, y, width, height] = layout(this);
    return {
      x,
      y,
      width,
      height,
      top: y,
      left: x,
      right: x + width,
      bottom: y + height,
      toJSON: () => ({}),
    } as DOMRect;
  },
);

function makeTask(
  id: string,
  title: string,
  status: TaskStatus,
  sortKey: number,
): Task {
  return {
    id,
    missionary_id: "missionary-board-fixture",
    title,
    task_type: "call",
    status,
    priority: "none",
    sort_key: sortKey,
    is_auto_generated: false,
    created_at: "2026-10-04T00:00:00Z",
    updated_at: "2026-10-04T00:00:00Z",
  } as Task;
}

const initialTasks = [
  makeTask("task-anna", "Call Anna", "not_started", 100),
  makeTask("task-ben", "Email Ben", "not_started", 200),
  makeTask("task-cara", "Thank Cara", "waiting", 100),
];

type Controls = {
  setStatus?: (id: string, status: TaskStatus) => void;
};

function toggled(task: Task): TaskStatus {
  return task.status === "completed" ? "not_started" : "completed";
}

function Board({
  saves = true,
  controls = {},
  onMoveTask = vi.fn().mockResolvedValue(true),
}: {
  saves?: boolean;
  controls?: Controls;
  onMoveTask?: React.ComponentProps<typeof TaskKanbanBoard>["onMoveTask"];
}) {
  const [tasks, setTasks] = React.useState(initialTasks);
  controls.setStatus = (id, status) =>
    setTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, status } : task)),
    );
  return (
    <TaskKanbanBoard
      tasks={tasks}
      onMoveTask={onMoveTask}
      onEditTask={vi.fn()}
      // Like the page: the status flips after the request, then it resolves.
      onCompleteTask={async (task) => {
        await Promise.resolve();
        if (!saves) return false;
        controls.setStatus?.(task.id, toggled(task));
        return true;
      }}
      onDeleteTask={vi.fn()}
    />
  );
}

// dnd-kit appends its live region to the body; the newest is this board's.
function announcement() {
  const regions = document.querySelectorAll(
    'body > [role="status"][aria-live="polite"]',
  );
  return regions[regions.length - 1]?.textContent ?? "";
}

function press(key: string) {
  const target = document.activeElement ?? document.body;
  fireEvent.keyDown(target, { key, code: key === " " ? "Space" : key });
}

// fireEvent runs inside act(), which commits the transition dnd-kit wraps
// onDragEnd in at once. A real key press does not: React commits the board's
// own updates after the save first, then the page's move.
function pressOutsideAct(key: string) {
  (document.activeElement ?? document.body).dispatchEvent(
    new KeyboardEvent("keydown", {
      key,
      code: key === " " ? "Space" : key,
      bubbles: true,
      cancelable: true,
    }),
  );
}

// dnd-kit adds its live region a frame after the handles mount; a key press
// before that starts the drag but has nowhere to announce it.
async function pickUp(name: string) {
  const handle = screen.getByRole("button", { name });
  await waitFor(() =>
    expect(handle.getAttribute("aria-describedby")).toBeTruthy(),
  );
  handle.focus();
  press(" ");
  return handle;
}

it("tells keyboard users that the left and right arrows change column", async () => {
  render(<Board />);
  const handle = screen.getByRole("button", { name: "Move Call Anna" });
  await waitFor(() =>
    expect(handle.getAttribute("aria-describedby")).toBeTruthy(),
  );
  const instructions = document.getElementById(
    handle.getAttribute("aria-describedby")!,
  )?.textContent;
  expect(instructions).toMatch(/left and right arrow keys/i);
  expect(instructions).toMatch(/column/i);
  expect(instructions).toMatch(/escape/i);
});

it("names the task, its column and its position when a card is picked up", async () => {
  render(<Board />);
  await pickUp("Move Email Ben");

  await waitFor(() =>
    expect(announcement()).toBe("Picked up Email Ben. To do, position 2 of 2."),
  );
});

it("says which column and position a card moves to, then where it was dropped", async () => {
  const onMoveTask = vi.fn().mockResolvedValue(true);
  render(<Board onMoveTask={onMoveTask} />);
  await pickUp("Move Call Anna");
  await waitFor(() => expect(announcement()).toContain("Picked up Call Anna"));

  press("ArrowRight");
  await waitFor(
    () =>
      expect(announcement()).toBe("Call Anna is in Waiting, position 1 of 2."),
    { timeout: 2000 },
  );

  press(" ");
  await waitFor(() =>
    expect(announcement()).toBe(
      "Dropped Call Anna in Waiting, position 1 of 2.",
    ),
  );
  await waitFor(() =>
    expect(onMoveTask).toHaveBeenCalledWith("task-anna", "waiting", 0),
  );
});

it("says where a cancelled card went back to", async () => {
  const onMoveTask = vi.fn().mockResolvedValue(true);
  render(<Board onMoveTask={onMoveTask} />);
  await pickUp("Move Call Anna");
  press("ArrowRight");
  await waitFor(() => expect(announcement()).toContain("Waiting"), {
    timeout: 2000,
  });

  press("Escape");
  await waitFor(() =>
    expect(announcement()).toBe(
      "Move cancelled. Call Anna returned to To do, position 1 of 2.",
    ),
  );
  expect(onMoveTask).not.toHaveBeenCalled();
});

it.each([
  ["Mark done: Call Anna", "Reopen: Call Anna"],
  ["Reopen: Call Anna", "Mark done: Call Anna"],
])(
  "keeps focus on the card after %s moves it to another column",
  async (action, after) => {
    const controls: Controls = {};
    render(<Board controls={controls} />);
    if (action.startsWith("Reopen")) {
      act(() => controls.setStatus?.("task-anna", "completed"));
    }
    const button = await screen.findByRole("button", { name: action });
    button.focus();
    fireEvent.click(button);

    await waitFor(() =>
      expect(screen.queryByRole("button", { name: action })).toBeNull(),
    );
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: after }),
    );
  },
);

it("leaves focus alone when completing fails and when the card moves later", async () => {
  const controls: Controls = {};
  render(<Board saves={false} controls={controls} />);
  const button = screen.getByRole("button", { name: "Mark done: Call Anna" });
  button.focus();
  fireEvent.click(button);
  await act(async () => {});
  expect(document.activeElement).toBe(button);

  button.blur();
  act(() => controls.setStatus?.("task-anna", "completed"));

  expect(
    screen.getByRole("button", { name: "Reopen: Call Anna" }),
  ).toBeTruthy();
  expect(document.activeElement).toBe(document.body);
});

async function dropCallAnnaInWaiting(drop = press) {
  await pickUp("Move Call Anna");
  await waitFor(() => expect(announcement()).toContain("Picked up Call Anna"));
  press("ArrowRight");
  await waitFor(
    () =>
      expect(announcement()).toBe("Call Anna is in Waiting, position 1 of 2."),
    { timeout: 2000 },
  );
  drop(" ");
}

it.each([
  ["saved", true],
  ["failed", false],
])(
  "keeps focus on the moved card's handle after a %s cross-column keyboard drop",
  async (_outcome, saves) => {
    const controls: Controls = {};
    // Like the page: the card changes column before the save resolves.
    const onMoveTask = vi.fn(async (id: string, status: TaskStatus) => {
      if (saves) controls.setStatus?.(id, status);
      await Promise.resolve();
      return saves;
    });
    render(<Board controls={controls} onMoveTask={onMoveTask} />);
    await dropCallAnnaInWaiting(pressOutsideAct);

    await waitFor(() => expect(onMoveTask).toHaveBeenCalled());
    const column = screen.getByRole("region", {
      name: saves ? "Waiting" : "To do",
    });
    await waitFor(() =>
      expect(document.activeElement).toBe(
        within(column).getByRole("button", { name: "Move Call Anna" }),
      ),
    );
  },
);

it("moves focus to the card's new handle when the saved move reaches the board after the drop", async () => {
  const controls: Controls = {};
  const onMoveTask = vi.fn().mockResolvedValue(true);
  render(<Board controls={controls} onMoveTask={onMoveTask} />);
  await dropCallAnnaInWaiting();
  await waitFor(() =>
    expect(onMoveTask).toHaveBeenCalledWith("task-anna", "waiting", 0),
  );
  await waitFor(() =>
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Move Call Anna" }),
    ),
  );

  // In a browser dnd-kit runs onDragEnd in a transition, so the page's
  // optimistic move commits after the board has cleared its preview.
  act(() => controls.setStatus?.("task-anna", "waiting"));

  const handle = screen.getByRole("button", { name: "Move Call Anna" });
  expect(document.activeElement).toBe(handle);
  expect(screen.getByRole("region", { name: "Waiting" }).contains(handle)).toBe(
    true,
  );
});

it("does not take focus back when the saved move arrives after the user moved on", async () => {
  const controls: Controls = {};
  const onMoveTask = vi.fn().mockResolvedValue(true);
  render(<Board controls={controls} onMoveTask={onMoveTask} />);
  await dropCallAnnaInWaiting();
  await waitFor(() =>
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Move Call Anna" }),
    ),
  );
  const elsewhere = screen.getByRole("button", { name: "Move Email Ben" });
  elsewhere.focus();

  act(() => controls.setStatus?.("task-anna", "waiting"));

  expect(document.activeElement).toBe(elsewhere);
});

it("keeps focus on the handle after a same-column keyboard drop", async () => {
  const onMoveTask = vi.fn().mockResolvedValue(true);
  render(<Board onMoveTask={onMoveTask} />);
  const handle = await pickUp("Move Call Anna");
  await waitFor(() => expect(announcement()).toContain("Picked up Call Anna"));

  press("ArrowDown");
  await waitFor(
    () =>
      expect(announcement()).toBe("Call Anna is in To do, position 2 of 2."),
    { timeout: 2000 },
  );

  press(" ");
  await waitFor(() =>
    expect(onMoveTask).toHaveBeenCalledWith("task-anna", "not_started", 1),
  );
  await waitFor(() => expect(document.activeElement).toBe(handle));
});
