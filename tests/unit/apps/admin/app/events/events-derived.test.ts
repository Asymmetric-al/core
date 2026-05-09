import { describe, expect, it } from "vitest";

import { deriveRegistrationCapacity } from "../../../../../../apps/admin/app/events/events-derived";

describe("events registration capacity helpers", () => {
  it("clamps normal capacity progress and remaining seats", () => {
    expect(
      deriveRegistrationCapacity({
        capacity: 1200,
        registrants: 450,
      }),
    ).toEqual({
      capacityLabel: "1,200",
      progressValue: 37.5,
      seatsRemainingLabel: "750 seats remaining",
    });
  });

  it("renders zero capacity without dividing by zero", () => {
    expect(
      deriveRegistrationCapacity({
        capacity: 0,
        registrants: 12,
      }),
    ).toEqual({
      capacityLabel: "Capacity not set",
      progressValue: 0,
      seatsRemainingLabel: "Capacity not set",
    });
  });

  it("caps over-registration progress at 100 percent", () => {
    expect(
      deriveRegistrationCapacity({
        capacity: 10,
        registrants: 12,
      }),
    ).toMatchObject({
      progressValue: 100,
      seatsRemainingLabel: "0 seats remaining",
    });
  });
});
