import { RESEND_ERROR_CODES, type ResendErrorCode } from "./constants";

import type { DeliverabilityWarning } from "./types";

const TEST_SEND_BLOCKING_WARNING_CODE_MAP: Readonly<
  Record<string, ResendErrorCode>
> = {
  DEFAULT_FROM_EMAIL_DOMAIN_NOT_VERIFIED:
    RESEND_ERROR_CODES.DEFAULT_FROM_EMAIL_DOMAIN_NOT_VERIFIED,
};

export function getFirstBlockingDeliverabilityWarning(
  warnings: DeliverabilityWarning[] | undefined,
): DeliverabilityWarning | undefined {
  return warnings?.find((warning) => warning.severity === "error");
}

export function toTestSendBlockingErrorCode(
  warning: DeliverabilityWarning,
): ResendErrorCode {
  // Forward-compatible fallback for future blocking warning codes.
  return (
    TEST_SEND_BLOCKING_WARNING_CODE_MAP[warning.code] ??
    RESEND_ERROR_CODES.DOMAIN_NOT_AUTHENTICATED
  );
}
