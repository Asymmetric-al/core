/**
 * Acceptance tests for GitHub issue #2066 — command-layer redaction (DC6).
 * Spec (rev 2, Blake-approved): {@link https://github.com/Asymmetric-al/core/issues/2066#issuecomment-6306182304}
 *
 * Detector fakes return a donor name, an email, a card-like number, a secret
 * token and an object key through `externalReferences`, the raw channel the
 * detector contract hands to the gate for redaction. None of those strings may
 * appear in captured stdout, captured stderr or the serialized proof.
 *
 * Scope of DC6 for `failure.message`, `inventoryFindings` and `detectorQuery`
 * (addendum https://github.com/Asymmetric-al/core/issues/2066#issuecomment-6306633299
 * item 2, clarified by addendum 2
 * https://github.com/Asymmetric-al/core/issues/2066#issuecomment-6306731198,
 * Samson 2026-10-20 7:47 PM PT): #2066 makes no product change, so these tests
 * cover exactly what the existing redactor already does in those fields.
 *
 * Existing redactor (develop @ 3d85897e):
 * `redactDiagnosticText()` in packages/api/src/document-cutover/redaction.ts,
 * applied by packages/api/src/document-cutover/assessment.ts to
 * `failure.message` only (an inspection's failure and a thrown detector
 * error). It redacts:
 *   - emails (`EMAIL_PATTERN`);
 *   - credential values introduced by `bearer`, `token`, `key`, `secret` or
 *     `password` followed by `=`, `:` or one whitespace (`BEARER_PATTERN`);
 *   - query strings (`?` up to the next whitespace or quote).
 * `inventoryFindings` and `detectorQuery` are copied verbatim, so nothing is
 * asserted about them. Plain-text names, card numbers, bare (un-keyed) tokens
 * and other values in these three fields belong to #2162 and are not asserted.
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */

import { describe, expect, it } from "vitest";

import {
  ACCEPTANCE_OWNER,
  LOCAL_TARGET_ENV,
  runCommand,
} from "./command-harness";
import {
  InMemoryDocumentCutoverProofStore,
  assessDocumentCutoverEnvironment,
  recordDocumentCutoverApproval,
} from "../../../../packages/api/src/document-cutover";
import {
  DocumentEnvironmentFixture,
  buildAssessmentInput,
  buildFixtureDetectors,
} from "../../packages/api/document-cutover-test-fixture";

import type { DocumentCutoverDetector } from "../../../../packages/api/src/document-cutover";

/** Synthetic values only — no real donor data. */
const DONOR_SURNAME = "Fakedonorova";
const DONOR_NAME = `Marguerite ${DONOR_SURNAME}`;
const DONOR_EMAIL = "marguerite.fakedonorova@example.org";
const CARD_NUMBER = "4111111111111111";
/**
 * Stripe-live-key-shaped fake, assembled at runtime so no provider-key-shaped
 * literal lives in source (GitHub push protection). Same value as before.
 */
const SECRET_TOKEN = ["sk", "live", "acceptance2066FAKEsecret0000"].join("_");
const OBJECT_KEY = `receipt-artifacts/acceptance-tenant/2026/${DONOR_SURNAME}-${CARD_NUMBER}.pdf`;

const FORBIDDEN = [
  DONOR_SURNAME,
  DONOR_EMAIL,
  CARD_NUMBER,
  SECRET_TOKEN,
  OBJECT_KEY,
];

function piiDetectors(): DocumentCutoverDetector[] {
  return buildFixtureDetectors(new DocumentEnvironmentFixture(), {
    external_reference: async () => ({
      completeness: "complete",
      detectorQuery: "acceptance external url census",
      relianceCounts: { externalReferences: 2 },
      externalReferences: [
        `https://files.example.test/receipts/${encodeURIComponent(DONOR_NAME)}/${CARD_NUMBER}.pdf?email=${encodeURIComponent(DONOR_EMAIL)}&token=${SECRET_TOKEN}`,
        OBJECT_KEY,
      ],
    }),
  });
}

function expectNoneOf(haystack: string, label: string): void {
  for (const value of FORBIDDEN) {
    expect(haystack, `${label} leaked ${value}`).not.toContain(value);
  }
}

/**
 * failure.message values of exactly the types redactDiagnosticText() covers
 * today. Synthetic values only. The whole message stays well under the
 * redactor's 500-character cap so truncation cannot hide a leak.
 */
const FAILURE_EMAIL = "acceptance.failure2066@example.org";
const FAILURE_TOKEN = "tok_acc2066_failure_A";
const FAILURE_BEARER = "brr_acc2066_failure_B";
const FAILURE_KEY = "key_acc2066_failure_C";
const FAILURE_SECRET = "sec_acc2066_failure_D";
const FAILURE_PASSWORD = "pwd_acc2066_failure_E";
const FAILURE_QUERY_VALUE = "qry_acc2066_failure_F";
const FAILURE_MARKER = "acceptance-2066-failure-marker";
const THROWN_MARKER = "acceptance-2066-thrown-marker";

const FAILURE_FORBIDDEN = [
  FAILURE_EMAIL,
  FAILURE_TOKEN,
  FAILURE_BEARER,
  FAILURE_KEY,
  FAILURE_SECRET,
  FAILURE_PASSWORD,
  FAILURE_QUERY_VALUE,
];

function sensitiveFailureMessage(marker: string): string {
  return [
    `${marker}: permission denied for ${FAILURE_EMAIL}`,
    `token=${FAILURE_TOKEN}`,
    `Authorization: Bearer ${FAILURE_BEARER}`,
    `api_key=${FAILURE_KEY}`,
    `secret:${FAILURE_SECRET}`,
    `password=${FAILURE_PASSWORD}`,
    `at https://db.example.test/rest/v1/rows?session=${FAILURE_QUERY_VALUE}`,
  ].join(" ");
}

const FAILING_TABLE = "gift_receipt_records";
const THROWING_TABLE = "contribution_receipt_snapshots";

/** One table reports an indeterminate failure, another throws. */
function failureMessageDetectors(): DocumentCutoverDetector[] {
  return buildFixtureDetectors(new DocumentEnvironmentFixture(), {
    database_table: async (table) => {
      if (table === THROWING_TABLE) {
        throw new Error(sensitiveFailureMessage(THROWN_MARKER));
      }
      return table === FAILING_TABLE
        ? {
            completeness: "indeterminate",
            detectorQuery: `acceptance census ${table}`,
            failure: {
              code: "permission_denied",
              message: sensitiveFailureMessage(FAILURE_MARKER),
            },
          }
        : {
            completeness: "complete",
            detectorQuery: `acceptance census ${table}`,
            relianceCounts: { rows: 0, tenants: 0 },
          };
    },
  });
}

function expectNoFailureValue(haystack: string, label: string): void {
  for (const value of FAILURE_FORBIDDEN) {
    expect(haystack, `${label} leaked ${value}`).not.toContain(value);
  }
}

describe("issue #2066 — DC6 failure.message redaction the existing redactor already does", () => {
  it("DC6: library — each failure.message has its emails, keyed credentials and query strings redacted", async () => {
    const assessment = await assessDocumentCutoverEnvironment(
      buildAssessmentInput(new DocumentEnvironmentFixture(), {
        detectors: failureMessageDetectors(),
      }),
    );
    const messages = assessment.evidence
      .filter((evidence) =>
        [FAILING_TABLE, THROWING_TABLE].includes(evidence.surfaceId),
      )
      .map((evidence) => evidence.failure?.message ?? "");

    expect(messages).toHaveLength(2);
    expect(messages.join("\n")).toContain(FAILURE_MARKER);
    expect(messages.join("\n")).toContain(THROWN_MARKER);
    for (const message of messages) expectNoFailureValue(message, "failure");
  });

  it("DC6: library — the recorded proof carries none of those values", async () => {
    const assessment = await assessDocumentCutoverEnvironment(
      buildAssessmentInput(new DocumentEnvironmentFixture(), {
        detectors: failureMessageDetectors(),
      }),
    );
    const proof = await recordDocumentCutoverApproval({
      assessment,
      owner: ACCEPTANCE_OWNER,
      approval: {
        approverId: "acceptance-approver",
        approvalStatement: "Acceptance #2066 failure redaction proof.",
        decision: "no_go",
      },
      attestation: {
        attestedBy: "acceptance-suite",
        attestationContext: "issue-2066",
      },
      store: new InMemoryDocumentCutoverProofStore(),
    });

    expect(JSON.stringify(proof)).toContain(FAILURE_MARKER);
    expectNoFailureValue(JSON.stringify(proof), "serialized proof");
  });

  it("DC6: command — stdout and stderr show the failure blockers without any of those values", async () => {
    const result = await runCommand({
      argv: [],
      env: LOCAL_TARGET_ENV,
      detectors: failureMessageDetectors(),
      store: new InMemoryDocumentCutoverProofStore(),
    });

    expect(result.exitCode).not.toBe(0);
    expect(result.stdout).toContain(`[${FAILING_TABLE}]`);
    expect(result.stdout).toContain(FAILURE_MARKER);
    expect(result.stdout).toContain(THROWN_MARKER);
    expectNoFailureValue(result.stdout, "stdout");
    expectNoFailureValue(result.stderr, "stderr");
  });

  it("DC6: command — a --decision no_go run leaks none of them to output or to any proof it records", async () => {
    const store = new InMemoryDocumentCutoverProofStore();
    const result = await runCommand({
      argv: [
        "--decision",
        "no_go",
        "--owner",
        ACCEPTANCE_OWNER.ownerId,
        "--owner-role",
        ACCEPTANCE_OWNER.ownerRole,
        "--statement",
        "Acceptance #2066 failure redaction run.",
      ],
      env: LOCAL_TARGET_ENV,
      detectors: failureMessageDetectors(),
      store,
    });

    expect(result.exitCode).not.toBe(0);
    expectNoFailureValue(result.stdout, "stdout");
    expectNoFailureValue(result.stderr, "stderr");
    for (const proof of await store.list()) {
      expectNoFailureValue(JSON.stringify(proof), "recorded proof");
    }
  });
});

describe("issue #2066 — DC6 redaction at the command layer", () => {
  it("DC6: stdout and stderr of an assess run contain no donor name, email, card-like number, secret or object key", async () => {
    const result = await runCommand({
      argv: [],
      env: LOCAL_TARGET_ENV,
      detectors: piiDetectors(),
      store: new InMemoryDocumentCutoverProofStore(),
    });

    expect(result.exitCode).not.toBe(0);
    // The run actually surfaced the blockers that carried the raw values.
    expect(result.stdout).toContain("[pdf_template_artifacts.external_urls]");
    expectNoneOf(result.stdout, "stdout");
    expectNoneOf(result.stderr, "stderr");
  });

  it("DC6: stdout and stderr of a --decision run contain none of them, nor does any proof the command records", async () => {
    const store = new InMemoryDocumentCutoverProofStore();
    const result = await runCommand({
      argv: [
        "--decision",
        "no_go",
        "--owner",
        ACCEPTANCE_OWNER.ownerId,
        "--owner-role",
        ACCEPTANCE_OWNER.ownerRole,
        "--statement",
        "Acceptance #2066 redaction run.",
      ],
      env: LOCAL_TARGET_ENV,
      detectors: piiDetectors(),
      store,
    });

    expect(result.exitCode).not.toBe(0);
    expectNoneOf(result.stdout, "stdout");
    expectNoneOf(result.stderr, "stderr");
    for (const proof of await store.list()) {
      expectNoneOf(JSON.stringify(proof), "recorded proof");
    }
  });

  it("DC6: the serialized proof for the same detector output contains none of them", async () => {
    const assessment = await assessDocumentCutoverEnvironment(
      buildAssessmentInput(new DocumentEnvironmentFixture(), {
        detectors: piiDetectors(),
      }),
    );
    const proof = await recordDocumentCutoverApproval({
      assessment,
      owner: ACCEPTANCE_OWNER,
      approval: {
        approverId: "acceptance-approver",
        approvalStatement: "Acceptance #2066 redaction proof.",
        decision: "no_go",
      },
      attestation: {
        attestedBy: "acceptance-suite",
        attestationContext: "issue-2066",
      },
      store: new InMemoryDocumentCutoverProofStore(),
    });

    expectNoneOf(JSON.stringify(proof), "serialized proof");
    expectNoneOf(JSON.stringify(proof, null, 2), "pretty serialized proof");
  });
});
