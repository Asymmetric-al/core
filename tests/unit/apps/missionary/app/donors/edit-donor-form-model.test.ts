import { describe, expect, it } from "vitest";

import {
  createInitialEditDonorFormValues,
  editDonorSchema,
} from "../../../../../../apps/missionary/app/donors/edit-donor-form-model";

describe("apps/missionary/app/donors/edit-donor-form-model", () => {
  it("creates empty defaults when no donor is selected, with no e-mail and no preferred channel (fix round F17 case 4: the edit has no e-mail field; fix round F2 of 2859: no preference)", () => {
    expect(createInitialEditDonorFormValues()).toEqual({
      name: "",
      phone: "",
      mobile: "",
      work_phone: "",
      preferred_contact: null,
      type: "Individual",
      status: "Active",
      frequency: "Monthly",
      location: "",
      website: "",
      organization: "",
      title: "",
      spouse: "",
      birthday: "",
      anniversary: "",
      notes: "",
      street: "",
      street2: "",
      city: "",
      state: "",
      zip: "",
    });
  });

  it("hydrates defaults from the selected donor, without its e-mail (fix round F17 case 4)", () => {
    const values = createInitialEditDonorFormValues({
      name: "Alice Johnson",
      phone: "555-111-2222",
      mobile: "555-333-4444",
      work_phone: "555-888-9999",
      preferred_contact: "text",
      type: "Organization",
      status: "At Risk",
      frequency: "Quarterly",
      location: "Denver, CO",
      website: "https://example.com",
      organization: "Example Org",
      title: "Director",
      spouse: "Bob",
      birthday: "1985-04-12",
      anniversary: "2010-06-01",
      notes: "Loves quarterly updates.",
      address: {
        street: "123 Main St",
        street2: "Suite 4",
        city: "Denver",
        state: "CO",
        zip: "80202",
      },
    });

    expect(values).not.toHaveProperty("email");
    expect(values).toMatchObject({
      name: "Alice Johnson",
      preferred_contact: "text",
      type: "Organization",
      status: "At Risk",
      frequency: "Quarterly",
      street: "123 Main St",
      street2: "Suite 4",
      city: "Denver",
      state: "CO",
      zip: "80202",
    });
  });

  it("accepts a partner with no e-mail whose name alone was typed (fix round F17 case 4; red: the required e-mail refuses it)", () => {
    expect(Object.keys(editDonorSchema.shape)).not.toContain("email");
    expect(
      editDonorSchema.safeParse(
        createInitialEditDonorFormValues({ name: "Hand Added" }),
      ).success,
    ).toBe(true);
  });

  it("keeps a partner's missing preferred channel missing, and saves none when the edit does not touch it (fix round F2 of 2859; red: email)", () => {
    const values = createInitialEditDonorFormValues({
      name: "No Phone",
      preferred_contact: null,
    });
    expect(values.preferred_contact).toBeNull();
    const parsed = editDonorSchema.safeParse({ ...values, notes: "Met" });
    expect(parsed.success && parsed.data.preferred_contact).toBeNull();
    expect(
      createInitialEditDonorFormValues({
        name: "Phone",
        preferred_contact: "phone",
      }).preferred_contact,
    ).toBe("phone");
  });
});
