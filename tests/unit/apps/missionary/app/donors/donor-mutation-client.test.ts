import { afterEach, describe, expect, it, vi } from "vitest";

import {
  insertDonorActivity,
  updateDonorDetails,
  updateDonorTags,
} from "../../../../../../apps/missionary/app/donors/donor-mutation-client";

import type { EditDonorFormValues } from "../../../../../../apps/missionary/app/donors/edit-donor-form-model";

const donorFormValues: EditDonorFormValues = {
  name: "Ada Lovelace",
  email: "ada@example.org",
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
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("donor mutation client", () => {
  it("posts donor activities through the missionary API boundary", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), { status: 201 }),
      );

    const result = await insertDonorActivity({
      donorId: "donor-1",
      activityType: "call",
      note: "Left voicemail",
    });

    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/missionary/donors/donor-1/activities",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activityType: "call",
          note: "Left voicemail",
        }),
      }),
    );
  });

  it("patches donor tags through the missionary API boundary", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), { status: 200 }),
      );

    const result = await updateDonorTags({
      donorId: "donor-1",
      tags: ["monthly-partner"],
    });

    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/missionary/donors/donor-1",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ tags: ["monthly-partner"] }),
      }),
    );
  });

  it("returns API error messages for donor detail updates", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "Donor relationship not found" }), {
        status: 404,
      }),
    );

    const result = await updateDonorDetails({
      donorId: "donor-1",
      value: donorFormValues,
    });

    expect(result).toEqual({
      ok: false,
      error: "Donor relationship not found",
    });
  });
});
