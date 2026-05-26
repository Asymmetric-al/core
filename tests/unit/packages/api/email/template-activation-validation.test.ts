import { describe, expect, it } from "vitest";

import { ApiHttpError } from "../../../../../packages/api/src/shared/http-errors";
import { validateEmailTemplateForActivation } from "../../../../../packages/api/src/email/templates";

describe("email template activation validation", () => {
  it("blocks active contribution correction templates missing required tags", () => {
    expect(() =>
      validateEmailTemplateForActivation({
        htmlContent: "<p>Hello {{full_name}}</p>",
        textContent: "Hello {{full_name}}",
        isActive: true,
        editorMetadata: {
          contributionCorrection: {
            family: "refund_notification",
            variant: "refund_completed",
          },
        },
      }),
    ).toThrow(ApiHttpError);
  });

  it("allows contribution correction drafts with missing required tags", () => {
    expect(() =>
      validateEmailTemplateForActivation({
        htmlContent: "<p>Hello {{full_name}}</p>",
        textContent: "Hello {{full_name}}",
        isActive: false,
        editorMetadata: {
          contributionCorrection: {
            family: "refund_notification",
            variant: "refund_completed",
          },
        },
      }),
    ).not.toThrow();
  });
});
