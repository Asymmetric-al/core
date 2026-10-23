/**
 * Acceptance tests for GitHub issue #2068, done criterion 4.
 * Spec (rev 1, Blake-approved 2026-10-22 9:28 PM PT, decisions D1a and D2a):
 * {@link https://github.com/Asymmetric-al/core/issues/2068#issuecomment-6357332555}
 *
 * Criterion 4: "Availability is `dark` with cause `launch_gate_unmet` when any
 * one of the six gates is unmet, and `supported` when all are met. Tests
 * cover each gate."
 *
 * "Tests cover each gate" is read as: the In item 4 availability test names
 * each of the six gates literally (reported as an open question).
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */

import { describe, expect, it } from "vitest";

import {
  createFailClosedQualificationPort,
  resolvePurposeAvailability,
} from "../../../../packages/api/src/generated-documents/purpose-catalog";
import {
  AVAILABILITY_TEST_FILE,
  EXPECTED_GATES,
  PURPOSE_ID,
  readRepoFile,
} from "./catalog-scan";

import type { PurposeAvailabilityContext } from "../../../../packages/api/src/generated-documents/purpose-catalog";

function contextWith(
  gateStatus: Record<string, boolean>,
): PurposeAvailabilityContext {
  return {
    tenant_id: "00000000-0000-4000-8000-000000000001",
    // The new gate names are not in the base type yet; the cast keeps this
    // file compiling before and after the implementation.
    gate_status: gateStatus as PurposeAvailabilityContext["gate_status"],
    issuer_proof: {
      verified_us_issuer: false,
      active_ca_registered_charity_issuer: false,
    },
    registered_safe_data_views: [],
  };
}

const allMet = () =>
  Object.fromEntries(EXPECTED_GATES.map((gate) => [gate, true]));

describe("issue #2068 done criterion 4: all six gates met", () => {
  it('criterion 4: "`supported` when all are met"', async () => {
    const result = await resolvePurposeAvailability(
      { purpose_id: PURPOSE_ID, context: contextWith(allMet()) },
      createFailClosedQualificationPort(),
    );
    expect(result.state).toBe("supported");
    expect(result.causes).toEqual([]);
  });
});

describe("issue #2068 done criterion 4: any one gate unmet", () => {
  it.each(EXPECTED_GATES)(
    'criterion 4: "`dark` with cause `launch_gate_unmet`" when only %s is unmet',
    async (gate) => {
      for (const unmet of [false, undefined]) {
        const status: Record<string, boolean> = allMet();
        if (unmet === undefined) delete status[gate];
        else status[gate] = unmet;
        const result = await resolvePurposeAvailability(
          { purpose_id: PURPOSE_ID, context: contextWith(status) },
          createFailClosedQualificationPort(),
        );
        expect(result.state, `${gate} = ${String(unmet)}`).toBe("dark");
        expect(result.causes).toEqual([
          expect.objectContaining({ code: "launch_gate_unmet", gate }),
        ]);
      }
    },
  );
});

describe('issue #2068 done criterion 4: "Tests cover each gate"', () => {
  it("criterion 4: the availability test names each of the six gates", () => {
    const source = readRepoFile(AVAILABILITY_TEST_FILE);
    const missing = EXPECTED_GATES.filter((gate) => !source.includes(gate));
    expect(missing, `gates not named in ${AVAILABILITY_TEST_FILE}`).toEqual([]);
  });
});
