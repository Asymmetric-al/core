/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { initialProfile } from "../../../../apps/missionary/app/profile/profile-model";
import { ProfileHeaderActions } from "../../../../apps/missionary/app/profile/profile-primitives";
import { ProfilePreviewColumn } from "../../../../apps/missionary/app/profile/profile-preview";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

afterEach(cleanup);

globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

const profile = { ...initialProfile, firstName: "Jane", lastName: "Doe" };

// The donor app has no published page per missionary yet, so a copied
// `/workers/jane-doe` link or a "View Public Page" tab would lead supporters
// to a missing page. The profile says so plainly instead.
it("offers no copy-link or public-page action while no public page exists", () => {
  render(
    <ProfileHeaderActions
      hasChanges={false}
      isSaving={false}
      saveSuccess={false}
      onDiscard={vi.fn()}
      onSave={vi.fn()}
    />,
  );
  expect(screen.queryByRole("button", { name: /copy profile link/i })).toBe(
    null,
  );
  expect(screen.queryByRole("link")).toBe(null);
  expect(document.querySelector('a[href*="/workers/"]')).toBe(null);
  expect(screen.getByRole("button", { name: "Save changes" })).toBeTruthy();
});

it("tells the missionary their public giving page isn't published yet", () => {
  render(
    <ProfilePreviewColumn
      profile={profile}
      previewMode="mobile"
      initials="JD"
      setPreviewMode={vi.fn()}
    />,
  );
  expect(
    screen.getByText(/Your giving page isn’t live for supporters yet\./),
  ).toBeTruthy();
});

// The preview shows how the page will look; its give box and tabs must not
// act (there is no checkout in the missionary app), while the size toggle
// stays usable.
it.each(["mobile", "desktop"] as const)(
  "keeps the %s preview look-only",
  (previewMode) => {
    render(
      <ProfilePreviewColumn
        profile={profile}
        previewMode={previewMode}
        initials="JD"
        setPreviewMode={vi.fn()}
      />,
    );
    const preview = document.querySelector("[data-giving-page-preview]");
    expect(preview?.hasAttribute("inert")).toBe(true);
    // The give box is inside the look-only preview…
    expect(preview?.querySelector("input")).not.toBeNull();
    // …and every control outside it (the size toggle) stays usable.
    for (const button of document.querySelectorAll("button")) {
      if (!preview?.contains(button))
        expect(button.closest("[inert]")).toBeNull();
    }
  },
);
