/** @vitest-environment jsdom */

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { StandardPageFromTemplateView } from "../../../../apps/admin/src/cms-ui/web-studio/flows/StandardPageFromTemplateView";
import { TemplateGalleryView } from "../../../../apps/admin/src/cms-ui/web-studio/flows/TemplateGalleryView";

vi.mock("../../../../apps/admin/src/cms-ui/web-studio/routing", () => ({
  Link: () => null,
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => {
    throw new Promise(() => {});
  },
}));
afterEach(cleanup);

describe("Web Studio route-state loading (D-18: WP6 part 2b folds the giving, project and update create views into New page)", () => {
  it.each([
    ["new page", StandardPageFromTemplateView],
    ["template gallery", TemplateGalleryView],
  ] as const)(
    "shows named visible loading feedback while %s awaits routing state",
    (_label, View) => {
      const view = render(<View />);
      expect(view.getByRole("status").textContent).toContain(
        "Loading Web Studio…",
      );
      expect(view.getByRole("status").closest('[aria-busy="true"]')).toBeNull();
    },
  );
});
