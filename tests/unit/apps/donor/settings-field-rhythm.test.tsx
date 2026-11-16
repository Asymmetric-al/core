// @vitest-environment jsdom
import { cleanup, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { renderWithDrafts as render } from "../../fixtures/retained-drafts";

vi.mock("@asym/database/hooks", () => ({
  useDonorPortalSnapshot: () => ({
    isLoading: false,
    error: null,
    data: {
      profile: {
        displayName: "Fixture Donor",
        email: "fixture@example.test",
        phone: null,
        avatarUrl: null,
      },
      donor: {
        doNotEmail: false,
        givingPreferences: {},
        address: {
          street: "12 Elm St",
          street2: "",
          city: "Portland",
          state: "OR",
          zip: "97201",
          country: "",
        },
      },
    },
  }),
  useUpdateDonorPortal: () => ({ isPending: false, mutateAsync: vi.fn() }),
}));
vi.mock("@asym/database/supabase", () => ({
  createBrowserClient: () => ({ auth: {} }),
}));
vi.mock("@asym/lib/view-transitions", () => ({
  useWithinViewTransitionRouteLayer: () => false,
}));
vi.mock("@asym/lib/hooks/use-mobile", () => ({
  useMediaQuery: () => false,
  useIsDesktop: () => false,
}));
vi.mock("@asym/ui/components/primitives/image-upload", () => ({
  ImageUpload: () => null,
}));

// eslint-disable-next-line no-restricted-imports -- AL-1931: The real donor settings page at its app boundary.
import DonorSettingsPage from "../../../../apps/donor/app/(dashboard)/donor-dashboard/settings/page-client";

afterEach(cleanup);

/** The gap utilities on an element, so two grids can be compared. */
function gaps(element: Element) {
  return [...element.classList].filter((name) => /(^|:)gap-/.test(name));
}

// Postal changes belong to the postal record's own command, so the profile
// form does not edit the mailing address.
it("offers no mailing-address editor in the profile form", () => {
  render(<DonorSettingsPage />);
  expect(screen.queryByRole("group", { name: "Mailing address" })).toBeNull();
  expect(screen.queryByRole("textbox", { name: "Street address" })).toBeNull();
});

it("spaces the details form on one rhythm inside one field group", () => {
  render(<DonorSettingsPage />);

  const firstName = screen.getByRole("textbox", { name: "First name" });
  const phone = screen.getByRole("textbox", { name: "Phone" });
  const group = firstName.closest('[data-slot="field-group"]');
  expect(group).not.toBeNull();
  const contactGrid = firstName.closest(".grid")!;
  expect(contactGrid.contains(phone)).toBe(true);
  expect(gaps(contactGrid)).toEqual(["gap-4"]);
});

it("puts the read-only sign-in email after the fields people can edit", () => {
  render(<DonorSettingsPage />);

  const phone = screen.getByRole("textbox", { name: "Phone" });
  const email = screen.getByRole("group", { name: "Sign-in email" });
  expect(
    phone.compareDocumentPosition(email) & Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
});

// Each field is tied to its visible label by `for`/`id`, which assistive
// technology and static audits both read, not only through a wrapper.
it("ties every details field to its visible label explicitly", () => {
  render(<DonorSettingsPage />);
  for (const name of ["First name", "Last name", "Phone"]) {
    const field = screen.getByRole("textbox", { name });
    expect(field.id, name).toMatch(/^settings-/);
    const label = document.querySelector(`label[for="${field.id}"]`);
    expect(label?.textContent, name).toBe(name);
  }
});
