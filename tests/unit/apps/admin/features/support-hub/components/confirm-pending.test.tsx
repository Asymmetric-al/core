// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import {
  ConfirmProvider,
  useConfirm,
} from "../../../../../../../apps/admin/features/support-hub/components/workspace/confirm-provider";
afterEach(cleanup);
function Harness({ action }: { action: () => Promise<void> }) {
  const confirm = useConfirm();
  return (
    <button
      onClick={() =>
        void confirm({
          title: "Delete this label?",
          confirmLabel: "Delete label",
          action,
        })
      }
    >
      Ask
    </button>
  );
}
it("keeps destructive confirmation open and blocks duplicates until its action completes", async () => {
  let finish!: () => void;
  const action = vi.fn(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
  );
  render(
    <ConfirmProvider>
      <Harness action={action} />
    </ConfirmProvider>,
  );
  fireEvent.click(screen.getByText("Ask"));
  fireEvent.click(await screen.findByRole("button", { name: "Delete label" }));
  expect(screen.getByRole("alertdialog")).toBeTruthy();
  expect(
    screen
      .getByRole("button", { name: "Delete label" })
      .hasAttribute("disabled"),
  ).toBe(true);
  expect(
    screen.getByRole("button", { name: "Cancel" }).hasAttribute("disabled"),
  ).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "Delete label" }));
  expect(action).toHaveBeenCalledTimes(1);
  finish();
  await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
});

it("keeps a failed deletion open for retry and blocks Escape while pending", async () => {
  let reject!: (error: Error) => void;
  const action = vi
    .fn()
    .mockImplementationOnce(
      () =>
        new Promise<void>((_resolve, rejectPromise) => {
          reject = rejectPromise;
        }),
    )
    .mockResolvedValueOnce(undefined);
  render(
    <ConfirmProvider>
      <Harness action={action} />
    </ConfirmProvider>,
  );
  fireEvent.click(screen.getByText("Ask"));
  fireEvent.click(await screen.findByRole("button", { name: "Delete label" }));
  fireEvent.keyDown(screen.getByRole("alertdialog"), { key: "Escape" });
  expect(screen.getByRole("alertdialog")).toBeTruthy();
  reject(new Error("network failed"));
  expect(await screen.findByRole("alert")).toBeTruthy();
  expect(
    screen.getByRole("button", { name: "Cancel" }).hasAttribute("disabled"),
  ).toBe(false);
  fireEvent.click(screen.getByRole("button", { name: "Delete label" }));
  await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
  expect(action).toHaveBeenCalledTimes(2);
});
