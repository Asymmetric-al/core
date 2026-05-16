import { describe, expect, it } from "vitest";

import {
  EMERGENCY_BYPASS_ENV,
  RELEASE_PUSH_ENV,
  RELEASE_REASON_ENV,
  evaluatePrePushGuard,
  parsePrePushUpdates,
} from "../../../scripts/git/pre-push-guard.mjs";

describe("production pre-push guard", () => {
  it("blocks direct pushes to epic outside the release command", () => {
    const updates = parsePrePushUpdates(
      "refs/heads/epic abc123 refs/heads/epic def456\n",
    );

    expect(evaluatePrePushGuard({ updates, env: {} })).toMatchObject({
      allowed: false,
      reason: "direct push to epic is blocked",
    });
  });

  it("allows production pushes from the release command with a reason", () => {
    const updates = parsePrePushUpdates(
      "refs/heads/develop abc123 refs/heads/epic def456\n",
    );

    expect(
      evaluatePrePushGuard({
        updates,
        env: {
          [RELEASE_PUSH_ENV]: "1",
          [RELEASE_REASON_ENV]: "release abc123 to epic",
        },
      }),
    ).toMatchObject({
      allowed: true,
      reason: "production release command: release abc123 to epic",
    });
  });

  it("allows non-production branch pushes", () => {
    const updates = parsePrePushUpdates(
      "refs/heads/feature/test abc123 refs/heads/feature/test def456\n",
    );

    expect(evaluatePrePushGuard({ updates, env: {} })).toMatchObject({
      allowed: true,
      reason: "no push targets epic",
    });
  });

  it("requires a concrete emergency bypass reason", () => {
    const updates = parsePrePushUpdates(
      "refs/heads/epic abc123 refs/heads/epic def456\n",
    );

    expect(
      evaluatePrePushGuard({
        updates,
        env: { [EMERGENCY_BYPASS_ENV]: "restore production deploy" },
      }),
    ).toMatchObject({
      allowed: true,
      reason: "emergency production push bypass: restore production deploy",
    });

    expect(
      evaluatePrePushGuard({
        updates,
        env: { [EMERGENCY_BYPASS_ENV]: " " },
      }),
    ).toMatchObject({ allowed: false });
  });
});
