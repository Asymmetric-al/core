/** @vitest-environment jsdom */

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- AL-1894: App component regression test at its public UI boundary.
import { LocationEditor } from "../../../../../../apps/admin/features/mission-control/locations/components/LocationEditor";

/**
 * Saving a location keeps keyboard focus: a natively disabled submit button
 * drops focus to the page, so focus waits on the busy form, returns to Save
 * after a failure, and the closing sheet returns it to what opened it.
 */

const upsert = vi.hoisted(() => vi.fn());

vi.mock("@asym/database/hooks", () => ({
  useLinkedEntities: () => ({ data: { missionaries: [] } }),
  useUpsertLocation: () => ({ mutateAsync: upsert, isPending: false }),
}));
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const LOCATION = {
  id: "loc-1",
  title: "Amazon Medical Center",
  summary: "",
  type: "custom",
  linked_id: null,
  status: "published",
  lat: -3.1,
  lng: -60.02,
} as const;

function deferred() {
  let resolve: () => void = () => undefined;
  let reject: (error: Error) => void = () => undefined;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function expectFocusKept() {
  const active = document.activeElement;
  expect(active).not.toBe(document.body);
  expect(active?.matches(":disabled")).toBe(false);
}

function EditorHost() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Edit Amazon Medical Center
      </button>
      <LocationEditor
        isOpen={open}
        location={LOCATION}
        onOpenChange={setOpen}
      />
    </>
  );
}

async function startSave() {
  const request = deferred();
  upsert.mockReturnValue(request.promise);
  render(<EditorHost />);
  const trigger = screen.getByRole("button", {
    name: "Edit Amazon Medical Center",
  });
  trigger.focus();
  fireEvent.click(trigger);
  const dialog = await screen.findByRole("dialog", { name: "Edit location" });
  // Let the sheet place its initial focus before the press.
  await waitFor(() =>
    expect(dialog.contains(document.activeElement)).toBe(true),
  );
  const save = screen.getByRole("button", { name: "Save changes" });
  const form = save.closest("form");
  if (!form) throw new Error("location form not found");
  save.focus();
  fireEvent.click(save);
  await waitFor(() => expect(upsert).toHaveBeenCalled());
  await waitFor(() => expect(save.hasAttribute("disabled")).toBe(true));
  return { form, request, save, trigger };
}

describe("Location editor save focus", () => {
  beforeEach(() => {
    upsert.mockReset();
    vi.stubGlobal("matchMedia", (media: string) => ({
      media,
      matches: false,
      addEventListener() {},
      removeEventListener() {},
    }));
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

  it("parks focus on the busy form while the location saves", async () => {
    const { form } = await startSave();

    expect(document.activeElement).toBe(form);
    expect(form.getAttribute("aria-busy")).toBe("true");
    expectFocusKept();
  });

  it("returns focus to Save changes when the save fails", async () => {
    const { form, request, save } = await startSave();
    expect(document.activeElement).toBe(form);

    await act(async () => {
      request.reject(new Error("Save failed"));
    });

    expect(await screen.findByText("Save failed")).toBeTruthy();
    await waitFor(() => expect(document.activeElement).toBe(save));
    expect(save.hasAttribute("disabled")).toBe(false);
    expect(form.getAttribute("aria-busy")).not.toBe("true");
  });

  it("returns focus to what opened the sheet after a save", async () => {
    const { form, request, trigger } = await startSave();
    expect(document.activeElement).toBe(form);

    await act(async () => {
      request.resolve();
    });

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });
});
