/** @vitest-environment jsdom */

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import SignStudioPage from "../../../../apps/admin/app/(app)/sign/page-client";
import { WebStudioEditorPanel } from "../../../../apps/admin/app/web-studio/web-studio-sections";

afterEach(cleanup);

describe("Revealed admin accessibility findings", () => {
  it("says Sign Studio is not set up instead of showing sample documents", () => {
    const view = render(<SignStudioPage />);
    expect(view.getByText("Sign Studio is not set up yet")).toBeTruthy();
    // No invented counts or links to pages that do not exist.
    expect(view.queryByRole("textbox")).toBeNull();
    expect(
      view.getAllByRole("link").map((link) => link.getAttribute("href")),
    ).toEqual(["/crm"]);
  });

  it("associates Web Studio's branding controls with their visible labels", () => {
    const view = render(
      <WebStudioEditorPanel
        view="content"
        basicInfo={{
          displayName: "Jane",
          location: "Thailand",
          bio: "Mission work",
        }}
        projects={[]}
        onBasicInfoChange={vi.fn()}
      />,
    );
    for (const name of ["Public Display Name", "Location Base", "Public Bio"]) {
      expect(view.getByRole("textbox", { name })).toBeTruthy();
    }
  });
});
