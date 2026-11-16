// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CannedResponseForm } from "../../../../../../../apps/admin/features/support-hub/components/settings/canned-responses/CannedResponseForm";
import { SlaPolicyForm } from "../../../../../../../apps/admin/features/support-hub/components/settings/sla/SlaPolicyForm";
import { SignatureForm } from "../../../../../../../apps/admin/features/support-hub/components/settings/signatures/SignatureForm";

const hooks = vi.hoisted(() => ({
  save: vi.fn(),
  rows: [] as Array<{
    id: string;
    shortCode: string;
    ownerAgentId: string | null;
  }>,
}));
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-mutations",
  () => ({
    useSaveSupportCannedResponse: () => ({
      mutateAsync: hooks.save,
      isPending: false,
    }),
    useSaveSupportSlaPolicy: () => ({
      mutateAsync: hooks.save,
      isPending: false,
    }),
    useSaveSupportSignature: () => ({
      mutateAsync: hooks.save,
      isPending: false,
    }),
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-canned-responses",
  () => ({ useSupportCannedResponses: () => ({ data: hooks.rows }) }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-agents",
  () => ({ useSupportAgents: () => ({ data: [] }) }),
);
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-inbox-settings",
  () => ({ useSupportBusinessHours: () => ({ data: [] }) }),
);
afterEach(cleanup);
beforeEach(() => {
  hooks.save.mockReset().mockResolvedValue({});
  hooks.rows = [];
});

function fillResponse() {
  fireEvent.change(screen.getByLabelText("Title"), {
    target: { value: "Thank you" },
  });
  fireEvent.change(screen.getByLabelText("Shortcode"), {
    target: { value: "thanks" },
  });
  fireEvent.change(screen.getByLabelText("Response text"), {
    target: { value: "<strong>Thanks</strong> & welcome\nNext line" },
  });
}

describe("Response editors", () => {
  it("saves duration units as whole minutes and focuses an invalid amount", async () => {
    render(<SlaPolicyForm onSaved={vi.fn()} onCancel={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Standard" },
    });
    fireEvent.change(screen.getByLabelText("First reply amount"), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create policy" }));
    expect(
      await screen.findByText("Enter a time of at least 1 minute."),
    ).toBeTruthy();
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByLabelText("First reply amount"),
      ),
    );
    expect(hooks.save).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText("First reply amount"), {
      target: { value: "2" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create policy" }));
    await waitFor(() =>
      expect(hooks.save).toHaveBeenCalledWith(
        expect.objectContaining({ firstResponseMinutes: 120 }),
      ),
    );
  });

  it("saves escaped plain text and inserts merge variables at the selection", async () => {
    render(<CannedResponseForm onSaved={vi.fn()} onCancel={vi.fn()} />);
    fillResponse();
    const body = screen.getByLabelText<HTMLTextAreaElement>("Response text");
    body.focus();
    body.setSelectionRange(0, 0);
    fireEvent.click(screen.getByRole("button", { name: "{{donor.name}}" }));
    expect(body.value).toMatch(/^\{\{donor.name\}\}/);
    fireEvent.click(screen.getByRole("button", { name: "Create response" }));
    await waitFor(() =>
      expect(hooks.save).toHaveBeenCalledWith(
        expect.objectContaining({
          shortCode: "thanks",
          bodyHtml:
            "<p>{{donor.name}}&lt;strong&gt;Thanks&lt;/strong&gt; &amp; welcome<br/>Next line</p>",
        }),
      ),
    );
  });

  it("blocks malformed and duplicate shortcodes inline", async () => {
    hooks.rows = [{ id: "other", shortCode: "THANKS", ownerAgentId: null }];
    render(<CannedResponseForm onSaved={vi.fn()} onCancel={vi.fn()} />);
    fillResponse();
    fireEvent.click(screen.getByRole("button", { name: "Create response" }));
    expect(
      await screen.findByText("This shortcode is already in use."),
    ).toBeTruthy();
    expect(hooks.save).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText("Shortcode"), {
      target: { value: "bad_code" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create response" }));
    expect(
      await screen.findByText("Use lowercase letters, numbers and hyphens."),
    ).toBeTruthy();
  });

  it("keeps signature text plain when it becomes HTML", async () => {
    render(<SignatureForm onSaved={vi.fn()} onCancel={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Staff" },
    });
    fireEvent.change(screen.getByLabelText("Body"), {
      target: { value: "<b>Staff</b> & team" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create signature" }));
    await waitFor(() =>
      expect(hooks.save).toHaveBeenCalledWith(
        expect.objectContaining({
          bodyHtml: "<p>&lt;b&gt;Staff&lt;/b&gt; &amp; team</p>",
        }),
      ),
    );
  });
});
