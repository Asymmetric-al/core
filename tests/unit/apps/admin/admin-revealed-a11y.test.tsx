/** @vitest-environment jsdom */

import { cleanup, render } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import SignStudioPage from "../../../../apps/admin/app/(app)/sign/page-client";
import { WebStudioEditorPanel } from "../../../../apps/admin/app/web-studio/web-studio-sections";

vi.mock(
  "../../../../apps/admin/features/mission-control/components/tiles/tile-page",
  () => ({
    TilePage: ({ children }: PropsWithChildren) => (
      <section>{children}</section>
    ),
  }),
);
afterEach(cleanup);

describe("Revealed admin accessibility findings", () => {
  it("exposes named document search and a single interactive element per Sign navigation action", () => {
    const view = render(<SignStudioPage />);
    expect(
      view.getByRole("textbox", { name: "Search documents" }),
    ).toBeTruthy();
    for (const label of [
      "Manage Templates",
      "View Active",
      "View Completed",
      "Export Documents",
    ]) {
      expect(
        view.getByRole("link", { name: label }).querySelector("button"),
      ).toBeNull();
    }
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
