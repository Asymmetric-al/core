/**
 * Acceptance tests for GitHub issue #2067 addendum 4 — criterion 8 (m2): the
 * owner-role match is checked in the library approval (approval.ts), not only
 * in the CLI.
 * Addendum 4 (Blake-approved 2026-10-20 10:31 PM PT):
 * {@link https://github.com/Asymmetric-al/core/issues/2067#issuecomment-6308840307}
 *
 * Calls `recordDocumentCutoverApproval` directly with a clean, fresh
 * assessment. The control (allowlisted id, allowlisted role) records a clean
 * proof; the same call with the allowlisted id and a different role must be
 * rejected and record nothing.
 *
 * The spec does not pin how the library receives the allowlisted roles. Until
 * Scope rules, `authorization` carries the committed allowlist in each of
 * these shapes at once, and the implementation may read any one of them:
 * `allowedOwnerIds: string[]` (kept for no_go and older callers),
 * `owners: [{ id, role }]` (the allowlist.json shape),
 * `allowedOwners: [{ ownerId, ownerRole }]` (the proof `owner` shape).
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */

import { describe, expect, it } from "vitest";

import { allowlistedOwner, authorizationFor } from "./command-harness";
import {
  InMemoryDocumentCutoverProofStore,
  assessDocumentCutoverEnvironment,
  recordDocumentCutoverApproval,
} from "../../../../packages/api/src/document-cutover";
import {
  DocumentEnvironmentFixture,
  buildAssessmentInput,
} from "../../packages/api/document-cutover-test-fixture";

const COMPLETED_AT = new Date("2026-10-20T12:00:00.000Z");
const WRONG_ROLE = "acceptance_2067_wrong_role";

async function approve(ownerRole: string) {
  const assessment = await assessDocumentCutoverEnvironment(
    buildAssessmentInput(new DocumentEnvironmentFixture(), {
      now: () => COMPLETED_AT,
    }),
  );
  const owner = allowlistedOwner();
  const store = new InMemoryDocumentCutoverProofStore();
  const input = {
    assessment,
    owner: { ownerId: owner.id, ownerRole },
    approval: {
      approvalStatement: "Acceptance #2067 addendum 4 m2 owner role.",
      decision: "go",
    },
    authorization: authorizationFor([owner]),
    store,
    now: () => new Date(COMPLETED_AT.getTime() + 60_000),
  } as unknown as Parameters<typeof recordDocumentCutoverApproval>[0];
  let error: unknown = null;
  try {
    await recordDocumentCutoverApproval(input);
  } catch (caught) {
    error = caught;
  }
  return { error, stored: await store.list() };
}

describe("issue #2067 addendum 4 — criterion 8 (m2): the library checks the owner role", () => {
  it("control: the allowlisted owner id with the allowlisted role records one clean proof", async () => {
    const { error, stored } = await approve(allowlistedOwner().role);
    expect(error).toBeNull();
    expect(stored).toHaveLength(1);
    expect(stored[0]?.outcome).toBe("clean_preproduction_proof");
  });

  it("criterion 8: the allowlisted owner id with a wrong role is rejected by recordDocumentCutoverApproval and records nothing", async () => {
    expect(allowlistedOwner().role).not.toBe(WRONG_ROLE);
    const { error, stored } = await approve(WRONG_ROLE);
    expect(error).not.toBeNull();
    const { code, message } = error as { code?: unknown; message?: unknown };
    expect(
      code === "owner_unauthorized" ||
        (typeof message === "string" && /role/i.test(message)),
      `unexpected rejection: ${String(message)}`,
    ).toBe(true);
    expect(stored).toEqual([]);
  });
});
