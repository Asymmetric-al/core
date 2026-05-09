// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ComposerActions } from "../../../../../../../apps/admin/features/support-hub/components/detail/composer/ComposerActions";

afterEach(() => {
  cleanup();
});

describe("ComposerActions a11y / mode switch", () => {
  it("uses the Reply send label when mode is 'reply'", () => {
    render(
      <ComposerActions
        mode="reply"
        isPending={false}
        isDirty
        onSend={() => undefined}
        onSaveDraft={() => undefined}
      />,
    );
    expect(
      screen.getByRole("button", { name: /Send reply to donor/i }),
    ).toBeTruthy();
    // Reply mode also exposes Save draft.
    expect(screen.getByRole("button", { name: /Save draft/i })).toBeTruthy();
  });

  it("uses the Note send label when mode is 'note'", () => {
    render(
      <ComposerActions
        mode="note"
        isPending={false}
        isDirty
        onSend={() => undefined}
        onSaveDraft={() => undefined}
      />,
    );
    expect(
      screen.getByRole("button", { name: /Add internal note/i }),
    ).toBeTruthy();
    // Note mode does NOT show the Save draft button.
    expect(screen.queryByRole("button", { name: /Save draft/i })).toBeNull();
  });

  it("disables + announces busy when isPending is true", () => {
    render(
      <ComposerActions
        mode="reply"
        isPending
        isDirty
        onSend={() => undefined}
        onSaveDraft={() => undefined}
      />,
    );
    const sendButton = screen.getByRole("button", {
      name: /Send reply to donor/i,
    });
    expect(sendButton.getAttribute("aria-busy")).toBe("true");
    expect((sendButton as HTMLButtonElement).disabled).toBe(true);
  });

  it("disables Send when the body is empty", () => {
    render(
      <ComposerActions
        mode="reply"
        isPending={false}
        isDirty={false}
        onSend={() => undefined}
        onSaveDraft={() => undefined}
      />,
    );
    const sendButton = screen.getByRole("button", {
      name: /Send reply to donor/i,
    });
    expect((sendButton as HTMLButtonElement).disabled).toBe(true);
  });
});
