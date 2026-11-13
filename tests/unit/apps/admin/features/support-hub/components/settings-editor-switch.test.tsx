// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) Round 12: the list and its editor are exercised together at the public UI boundary.
import { CannedResponseList } from "../../../../../../../apps/admin/features/support-hub/components/settings/canned-responses/CannedResponseList";

// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) Round 12: fixtures use the app's public wire-format types.
import type { SupportCannedResponse } from "../../../../../../../apps/admin/features/support-hub/types";

const hooks = vi.hoisted(() => ({
  rows: [] as SupportCannedResponse[],
  save: vi.fn(),
  confirm: vi.fn(),
}));

vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-canned-responses",
  () => ({
    useSupportCannedResponses: () => ({
      data: hooks.rows,
      isLoading: false,
      isError: false,
      isReady: true,
      refetch: vi.fn(),
    }),
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-mutations",
  () => ({
    useSaveSupportCannedResponse: () => ({
      mutateAsync: hooks.save,
      isPending: false,
    }),
    useDeleteSupportCannedResponse: () => ({
      mutateAsync: vi.fn(),
      isPending: false,
    }),
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/components/workspace/confirm-provider",
  () => ({ useConfirm: () => hooks.confirm }),
);
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

function response(
  id: string,
  title: string,
  shortCode: string,
): SupportCannedResponse {
  return {
    id,
    tenantId: "tenant-1",
    title,
    shortCode,
    bodyText: `${title} body`,
    bodyHtml: `<p>${title} body</p>`,
    ownerAgentId: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  } as SupportCannedResponse;
}

function titleField(): HTMLInputElement {
  return within(screen.getByRole("dialog")).getByRole("textbox", {
    name: "Title",
  }) as HTMLInputElement;
}

async function waitForClosed() {
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
}

function clickCancel() {
  fireEvent.click(
    within(screen.getByRole("dialog")).getByRole("button", {
      name: "Cancel",
    }),
  );
}

/** Cancel an edited form and answer the discard question. */
async function cancelAndDiscard() {
  clickCancel();
  const prompt = await screen.findByRole("alertdialog", {
    name: "Discard unsaved changes?",
  });
  fireEvent.click(
    within(prompt).getByRole("button", { name: "Discard changes" }),
  );
  await waitForClosed();
}

beforeEach(() => {
  hooks.rows = [
    response("canned-receipt", "Receipt resend", "receipt"),
    response("canned-address", "Address change", "address"),
  ];
  hooks.save.mockReset().mockResolvedValue({});
  hooks.confirm.mockReset().mockResolvedValue(false);
});
afterEach(cleanup);

describe("Settings record editor sheet", () => {
  it("opens an edit beside the list, titled with the record, with one Cancel and one Save", () => {
    render(<CannedResponseList />);
    fireEvent.click(
      screen.getByRole("button", { name: "Edit Receipt resend" }),
    );
    const sheet = screen.getByRole("dialog", {
      name: "Edit “Receipt resend”",
    });
    expect(
      within(sheet).getAllByRole("button", { name: "Cancel" }),
    ).toHaveLength(1);
    expect(within(sheet).queryByRole("button", { name: "Discard" })).toBeNull();
    const save = within(sheet).getByRole("button", { name: "Save changes" });
    // Nothing to save until a field changes.
    expect(save.hasAttribute("disabled")).toBe(true);
    // The list stays where it was, behind the sheet.
    expect(screen.getByText("Address change")).toBeTruthy();
  });

  it("closes an unchanged editor at once", async () => {
    render(<CannedResponseList />);
    fireEvent.click(
      screen.getByRole("button", { name: "Edit Receipt resend" }),
    );
    clickCancel();
    await waitForClosed();
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });

  it("asks before dropping unsaved changes, and keeps them when staff stay", async () => {
    render(<CannedResponseList />);
    fireEvent.click(
      screen.getByRole("button", { name: "Edit Receipt resend" }),
    );
    fireEvent.change(titleField(), { target: { value: "Receipt (edited)" } });

    clickCancel();
    const prompt = await screen.findByRole("alertdialog", {
      name: "Discard unsaved changes?",
    });
    fireEvent.click(
      within(prompt).getByRole("button", { name: "Keep editing" }),
    );
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
    expect(titleField().value).toBe("Receipt (edited)");

    // Escape asks the same question instead of closing.
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(
      await screen.findByRole("alertdialog", {
        name: "Discard unsaved changes?",
      }),
    ).toBeTruthy();
    // The sheet stays open (hidden from the accessibility tree behind the
    // question) with the draft intact.
    expect(
      (
        within(screen.getByRole("dialog", { hidden: true })).getByRole(
          "textbox",
          { name: "Title", hidden: true },
        ) as HTMLInputElement
      ).value,
    ).toBe("Receipt (edited)");
  });

  it("starts the next record from its own saved values and saves it under its own id", async () => {
    render(<CannedResponseList />);
    fireEvent.click(
      screen.getByRole("button", { name: "Edit Receipt resend" }),
    );
    fireEvent.change(titleField(), {
      target: { value: "Receipt resend (edited)" },
    });
    await cancelAndDiscard();

    fireEvent.click(
      screen.getByRole("button", { name: "Edit Address change" }),
    );
    expect(titleField().value).toBe("Address change");
    expect(
      (
        within(screen.getByRole("dialog")).getByRole("textbox", {
          name: "Shortcode",
        }) as HTMLInputElement
      ).value,
    ).toBe("address");

    fireEvent.change(titleField(), { target: { value: "Address update" } });
    fireEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "Save changes",
      }),
    );
    await waitFor(() =>
      expect(hooks.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "canned-address",
          title: "Address update",
          shortCode: "address",
          bodyText: "Address change body",
        }),
      ),
    );
    await waitForClosed();
  });

  it("reopens a discarded record with its saved values", async () => {
    render(<CannedResponseList />);
    fireEvent.click(
      screen.getByRole("button", { name: "Edit Receipt resend" }),
    );
    fireEvent.change(titleField(), { target: { value: "Thrown away" } });
    await cancelAndDiscard();
    fireEvent.click(
      screen.getByRole("button", { name: "Edit Receipt resend" }),
    );
    expect(titleField().value).toBe("Receipt resend");
  });

  it("starts a blank draft for a new response, ready to create", async () => {
    render(<CannedResponseList />);
    fireEvent.click(
      screen.getByRole("button", { name: "Edit Receipt resend" }),
    );
    clickCancel();
    await waitForClosed();
    fireEvent.click(screen.getByRole("button", { name: "New response" }));
    const sheet = screen.getByRole("dialog", { name: "New canned response" });
    expect(titleField().value).toBe("");
    expect(
      within(sheet)
        .getByRole("button", { name: "Create response" })
        .hasAttribute("disabled"),
    ).toBe(false);
  });
});
