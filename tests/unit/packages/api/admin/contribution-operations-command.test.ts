import { describe, expect, it } from "vitest";

import {
  parseContributionCommand,
  serializeContributionCommand,
  withCommandPayload,
} from "../../../../../packages/api/src/admin/contribution-operations/command";

describe("parseContributionCommand", () => {
  it("rejects unsupported action types with a 400 message", () => {
    expect(() => parseContributionCommand("not_an_action", {})).toThrow(
      "Unsupported contribution action: not_an_action",
    );
  });

  it("does not trim or 400 on empty strings", () => {
    const command = parseContributionCommand("resend_receipt", {
      stagedGiftId: "",
    });

    expect(command).toEqual({
      type: "resend_receipt",
      stagedGiftId: "",
      extras: {},
    });
  });

  it("keeps surrounding whitespace on typed string fields", () => {
    const command = parseContributionCommand("stripe_replay", {
      stripeEventId: "  evt_1  ",
    });

    expect(command).toEqual({
      type: "stripe_replay",
      stripeEventId: "  evt_1  ",
      extras: {},
    });
  });

  it("keeps unknown keys in extras so fingerprints round-trip", () => {
    const payload = {
      stagedGiftId: "staged_1",
      fingerprintNote: "keep-me",
    };
    const command = parseContributionCommand("approve_staged_gift", payload);

    expect(command).toEqual({
      type: "approve_staged_gift",
      stagedGiftId: "staged_1",
      extras: { fingerprintNote: "keep-me" },
    });
    expect(serializeContributionCommand(command)).toEqual(payload);
  });

  it("leaves a string refund amount in extras instead of coercing it", () => {
    const payload = { amount: "1000", reason: "typo-shape" };
    const command = parseContributionCommand("refund", payload);

    expect(command.type).toBe("refund");
    if (command.type !== "refund") {
      throw new Error("expected refund command");
    }
    expect(command.amount).toBeUndefined();
    expect(command.extras).toEqual({ amount: "1000", reason: "typo-shape" });
    expect(serializeContributionCommand(command)).toEqual(payload);
  });

  it("accepts only parent or designation for CRM retry scope", () => {
    const parent = parseContributionCommand("retry_staged_gift", {
      scope: "parent",
    });
    expect(parent).toMatchObject({
      type: "retry_staged_gift",
      scope: "parent",
      extras: {},
    });

    const designation = parseContributionCommand("crm_repost", {
      scope: "designation",
      allocationId: "alloc_1",
    });
    expect(designation).toMatchObject({
      type: "crm_repost",
      scope: "designation",
      allocationId: "alloc_1",
      extras: {},
    });

    const unknownScope = parseContributionCommand("retry_staged_gift", {
      scope: "foo",
    });
    expect(unknownScope).toMatchObject({
      type: "retry_staged_gift",
      extras: { scope: "foo" },
    });
    if (unknownScope.type !== "retry_staged_gift") {
      throw new Error("expected retry_staged_gift command");
    }
    expect(unknownScope.scope).toBeUndefined();
  });

  it("preserves untyped correction fields including non-string fund ids", () => {
    const payload = { fundId: 12, extraLine: true };
    const command = parseContributionCommand("fund_correction", payload);

    expect(command).toEqual({
      type: "fund_correction",
      fundId: 12,
      extras: { extraLine: true },
    });
    expect(serializeContributionCommand(command)).toEqual(payload);
  });
});

describe("serializeContributionCommand", () => {
  it("overlays typed fields over extras without dropping either", () => {
    const command = parseContributionCommand("donor_relink", {
      donorId: "donor_1",
      priorDonorId: "donor_0",
    });

    expect(serializeContributionCommand(command)).toEqual({
      donorId: "donor_1",
      priorDonorId: "donor_0",
    });
  });

  it("round-trips an empty payload as an empty bag", () => {
    const command = parseContributionCommand("metadata_update");
    expect(serializeContributionCommand(command)).toEqual({});
  });
});

describe("withCommandPayload", () => {
  it("re-parses the same action type against a new bag", () => {
    const original = parseContributionCommand("refund", { amount: 500 });
    const next = withCommandPayload(original, { amount: 750, note: "bump" });

    expect(next).toEqual({
      type: "refund",
      amount: 750,
      extras: { note: "bump" },
    });
  });
});
