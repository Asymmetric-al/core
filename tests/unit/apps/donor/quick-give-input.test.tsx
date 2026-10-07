/** @vitest-environment jsdom */

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

const navigation = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: navigation.push }),
}));

import { QuickGiveInput } from "../../../../apps/donor/features/giving/components/QuickGiveInput";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

it("keeps the empty amount action reachable when keyboard focus moves within the group", () => {
  render(<QuickGiveInput missionaryId="mission-1" workerId="worker-1" />);
  const amount = screen.getByRole("textbox", { name: "Donation amount" });
  act(() => amount.focus());
  const give = screen.getByRole("button", { name: "Give" });
  act(() => give.focus());
  expect(screen.getByRole("button", { name: "Give" })).toBe(give);
  fireEvent.click(give);
  expect(document.activeElement).toBe(amount);
  expect(navigation.push).not.toHaveBeenCalled();
});

it("preserves decimal validation and the designated worker when submitting by Enter", () => {
  render(<QuickGiveInput missionaryId="mission-1" workerId="worker-1" />);
  const amount = screen.getByRole("textbox", { name: "Donation amount" });
  fireEvent.change(amount, { target: { value: "123.45" } });
  fireEvent.change(amount, { target: { value: "123.456" } });
  expect((amount as HTMLInputElement).value).toBe("123.45");
  fireEvent.keyDown(amount, { key: "Enter" });
  expect(navigation.push).toHaveBeenCalledTimes(1);
  const target = new URL(
    navigation.push.mock.calls[0]![0],
    "https://example.test",
  );
  expect(target.pathname).toBe("/checkout");
  expect(Object.fromEntries(target.searchParams)).toMatchObject({
    amount: "123.45",
    missionary_id: "mission-1",
    workerId: "worker-1",
  });
});
