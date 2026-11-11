// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

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

// eslint-disable-next-line no-restricted-imports -- The real donor settings page at its app boundary.
import DonorSettingsPage from "../../../../apps/donor/app/(dashboard)/donor-dashboard/settings/page-client";

afterEach(cleanup);

/** The gap utilities on an element, so two grids can be compared. */
function gaps(element: Element) {
  return [...element.classList].filter((name) => /(^|:)gap-/.test(name));
}

it("heads the mailing address with a legend and a separate hint, not one run-on label", () => {
  render(<DonorSettingsPage />);

  const address = screen.getByRole("group", { name: "Mailing address" });
  expect(address.tagName).toBe("FIELDSET");
  expect(address.getAttribute("data-slot")).toBe("field-set");
  const hintId = address.getAttribute("aria-describedby");
  expect(hintId).toBeTruthy();
  expect(document.getElementById(hintId!)?.textContent).toBe(
    "Optional. Missionaries you support can use it to send you letters.",
  );
});

it("spaces every row of the details form on one rhythm", () => {
  render(<DonorSettingsPage />);

  const firstName = screen.getByRole("textbox", { name: "First name" });
  const street = screen.getByRole("textbox", { name: "Street address" });
  const country = screen.getByRole("textbox", { name: "Country" });

  // Contact details and the address are two sections of one field group.
  const group = firstName.closest('[data-slot="field-group"]');
  expect(group).not.toBeNull();
  expect(group!.contains(street)).toBe(true);

  // The whole address sits in one grid, so its rows share one gap...
  const addressGrid = street.closest(".grid")!;
  expect(addressGrid.contains(country)).toBe(true);
  // ...and that gap is the same as between the contact rows.
  const contactGrid = firstName.closest(".grid")!;
  expect(contactGrid).not.toBe(addressGrid);
  expect(gaps(contactGrid)).toEqual(gaps(addressGrid));
});

it("puts the read-only sign-in email after the fields people can edit", () => {
  render(<DonorSettingsPage />);

  const phone = screen.getByRole("textbox", { name: "Phone" });
  const email = screen.getByRole("group", { name: "Sign-in email" });
  expect(
    phone.compareDocumentPosition(email) & Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
});
