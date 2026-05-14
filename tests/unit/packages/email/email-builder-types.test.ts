import { describe, expect, it } from "vitest";

import {
  EMPTY_REACT_EMAIL_DESIGN,
  createEmailDesignEnvelope,
  isEmailBuilderKind,
  isEmailDesignEnvelope,
  isReactEmailDesignJSON,
  normalizeEmailBuilderKind,
} from "../../../../packages/email/email-builder-types";

describe("@asym/email email builder types", () => {
  it("guards supported builder kinds", () => {
    expect(isEmailBuilderKind("react_email")).toBe(true);
    expect(isEmailBuilderKind("unlayer")).toBe(true);
    expect(isEmailBuilderKind("resend")).toBe(false);
  });

  it("normalizes unknown builder values to the requested fallback", () => {
    expect(normalizeEmailBuilderKind("react_email", "unlayer")).toBe(
      "react_email",
    );
    expect(normalizeEmailBuilderKind("unknown", "unlayer")).toBe("unlayer");
  });

  it("guards React Email editor JSON", () => {
    expect(isReactEmailDesignJSON(EMPTY_REACT_EMAIL_DESIGN)).toBe(true);
    expect(isReactEmailDesignJSON({ type: "paragraph" })).toBe(false);
    expect(isReactEmailDesignJSON(null)).toBe(false);
  });

  it("creates and validates provider-neutral design envelopes", () => {
    const envelope = createEmailDesignEnvelope({
      builder: "react_email",
      builderVersion: null,
      design: EMPTY_REACT_EMAIL_DESIGN,
      html: "<p>Hello</p>",
      text: "Hello",
    });

    expect(envelope.builderVersion).toBe("unknown");
    expect(isEmailDesignEnvelope(envelope)).toBe(true);
    expect(isEmailDesignEnvelope({ ...envelope, builder: "resend" })).toBe(
      false,
    );
  });
});
