/** @vitest-environment jsdom */

import { cleanup, render } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import SignStudioPage from "../../../../apps/admin/app/(app)/sign/page-client";

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
});
