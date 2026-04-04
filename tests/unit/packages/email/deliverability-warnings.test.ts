import { describe, expect, it } from "vitest";

import {
  getFirstBlockingDeliverabilityWarning,
  toTestSendBlockingErrorCode,
} from "../../../../packages/email/deliverability-warnings";

describe("@asym/email deliverability warnings", () => {
  it("returns undefined when there are no blocking warnings", () => {
    expect(getFirstBlockingDeliverabilityWarning(undefined)).toBeUndefined();
    expect(
      getFirstBlockingDeliverabilityWarning([
        {
          code: "INFO_WARNING",
          message: "Informational warning",
          severity: "info",
        },
        {
          code: "DELIVERABILITY_WARNING",
          message: "Non-blocking warning",
          severity: "warning",
        },
      ]),
    ).toBeUndefined();
  });

  it("returns the first blocking warning in array order", () => {
    expect(
      getFirstBlockingDeliverabilityWarning([
        {
          code: "INFO_WARNING",
          message: "Informational warning",
          severity: "info",
        },
        {
          code: "BLOCKING_WARNING",
          message: "First blocking warning",
          severity: "error",
        },
        {
          code: "SECOND_BLOCKING_WARNING",
          message: "Second blocking warning",
          severity: "error",
        },
      ]),
    ).toEqual(
      expect.objectContaining({
        code: "BLOCKING_WARNING",
      }),
    );
  });

  it("maps known blocking warning codes to honest API codes", () => {
    expect(
      toTestSendBlockingErrorCode({
        code: "DEFAULT_FROM_EMAIL_DOMAIN_NOT_VERIFIED",
        message: "Sender domain mismatch",
        severity: "error",
      }),
    ).toBe("default_from_email_domain_not_verified");
  });

  it("falls back to domain_not_authenticated for unknown blocking warning codes", () => {
    expect(
      toTestSendBlockingErrorCode({
        code: "FUTURE_BLOCKING_WARNING",
        message: "Future blocking warning",
        severity: "error",
      }),
    ).toBe("domain_not_authenticated");
  });
});
