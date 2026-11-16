// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";

import { usePopupTriggerRoles } from "../../../../apps/admin/src/cms-ui/web-studio/collections/shared/document-workspace/popup-trigger-roles";

afterEach(cleanup);

/** Payload's FileToolbar trigger: a span given aria-haspopup but no role. */
function FilenameTrigger() {
  return (
    <span
      aria-controls="popup-content"
      aria-expanded="false"
      aria-haspopup="menu"
      className="popup-button popup-button--custom file-toolbar__filename-btn"
      data-testid="filename-trigger"
      tabIndex={0}
    >
      photo.png
    </span>
  );
}

function Editor({ showLate = false }: { showLate?: boolean }) {
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  usePopupTriggerRoles(root);
  return (
    <div ref={setRoot}>
      <FilenameTrigger />
      <button
        aria-haspopup="menu"
        className="popup-button popup-button--custom"
        data-testid="native-button"
        type="button"
      >
        More
      </button>
      <span
        aria-haspopup="menu"
        className="popup-button popup-button--custom"
        data-testid="menu-item"
        role="menuitem"
      >
        Item
      </span>
      {showLate ? (
        <span
          aria-haspopup="menu"
          className="popup-button popup-button--custom"
          data-testid="late-trigger"
          tabIndex={0}
        >
          late.png
        </span>
      ) : null}
    </div>
  );
}

describe("usePopupTriggerRoles", () => {
  it("names Payload's span popup triggers as buttons", async () => {
    render(<Editor />);
    await waitFor(() =>
      expect(screen.getByTestId("filename-trigger").getAttribute("role")).toBe(
        "button",
      ),
    );
    expect(screen.getByRole("button", { name: "photo.png" })).toBeTruthy();
  });

  it("leaves native buttons and triggers that already have a role alone", async () => {
    render(<Editor />);
    await waitFor(() =>
      expect(screen.getByTestId("filename-trigger").getAttribute("role")).toBe(
        "button",
      ),
    );
    expect(screen.getByTestId("native-button").hasAttribute("role")).toBe(
      false,
    );
    expect(screen.getByTestId("menu-item").getAttribute("role")).toBe(
      "menuitem",
    );
  });

  it("covers triggers Payload mounts after the editor renders", async () => {
    const view = render(<Editor />);
    view.rerender(<Editor showLate />);
    await waitFor(() =>
      expect(screen.getByTestId("late-trigger").getAttribute("role")).toBe(
        "button",
      ),
    );
  });
});
