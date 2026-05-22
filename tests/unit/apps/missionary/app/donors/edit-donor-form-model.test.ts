import { describe, expect, it } from "vitest";

import {
  createInitialEditDonorFormValues,
} from "../../../../../../apps/missionary/app/donors/edit-donor-form-model";

describe("apps/missionary/app/donors/edit-donor-form-model", () => {
  it("creates empty defaults when no donor is selected", () => {
    expect(createInitialEditDonorFormValues()).toEqual({
      name: "",
      email: "",
      phone: "",
      mobile: "",
      work_phone: "",
      preferred_contact: "email",
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

  it("hydrates defaults from the selected donor", () => {
    const values = createInitialEditDonorFormValues({
      name: "Alice Johnson",
      email: "alice@example.com",
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

    expect(values).toMatchObject({
      name: "Alice Johnson",
      email: "alice@example.com",
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

});
