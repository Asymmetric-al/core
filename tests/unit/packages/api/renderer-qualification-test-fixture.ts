import { createHash } from "node:crypto";

import {
  HELD_BACK_CASE_IDS,
  OPEN_CASE_IDS,
  buildPhase18RendererContestInput,
} from "../../../../packages/api/src/generated-documents/renderer-qualification";

import type {
  HeldBackCaseId,
  OpenCaseId,
  Phase18ContestFreezeInput,
  QualificationRoles,
  RendererCandidateLock,
  RendererQualificationCharterInput,
} from "../../../../packages/api/src/generated-documents/renderer-qualification";

export function syntheticDigest(seed: string): string {
  return createHash("sha256").update(`synthetic:${seed}`).digest("hex");
}

export const FIXTURE_ROLES: QualificationRoles = {
  accountable_owner: "owner-blake",
  corpus_custodian: "custodian-quinn",
  candidate_operators: {
    "P18-R-P": "operator-prince",
    "P18-R-T": "operator-typst",
    "P18-R-C": "operator-control",
  },
  independent_reviewers: ["reviewer-avery", "reviewer-blair"],
  security_privacy_reviewer: "security-rowan",
  operations_reviewer: "operations-harper",
  records_legal_evidence_owner: "records-sloan",
  final_approver: "approver-emerson",
};

export function fixtureCandidates(): RendererCandidateLock[] {
  const shared = {
    fonts_assets_packages: [
      {
        name: "noto-sans",
        version: "2.013",
        license: "OFL-1.1",
        digest: syntheticDigest("noto-sans"),
      },
      {
        name: "corpus-assets",
        version: "1",
        license: "internal-synthetic",
        digest: syntheticDigest("corpus-assets"),
      },
    ],
    locale_data_version: "cldr-45",
    locale_data_digest: syntheticDigest("cldr-45"),
    finalizer: {
      name: "asym-final-byte-finalizer",
      version: "1",
      digest: syntheticDigest("finalizer-1"),
    },
  };

  return [
    {
      candidate_id: "P18-R-P",
      display_name: "Managed DocRaptor pipeline (Prince)",
      eligibility: "finalist",
      engine: "prince",
      engine_version: "15.1",
      pipeline: "docraptor-managed@10.1",
      adapter_commit: "1111111111111111111111111111111111111111",
      adapter_digest: syntheticDigest("adapter-prince"),
      dependency_lock_digest: syntheticDigest("deps-prince"),
      configuration_digest: syntheticDigest("config-prince"),
      network_filesystem_policy:
        "managed provider; no tenant network or filesystem access from documents",
      provider_settings: {
        pipeline: "10.1",
        javascript: "disabled",
        api_client_version: "docraptor-node@3.1.0",
        endpoint_region: "us-east-1",
        account_mode: "dedicated-managed",
        options_digest: syntheticDigest("docraptor-options"),
        retention_policy: "no-retention; artifacts purged on delivery",
        support_access: "break-glass only, audited, tenant-approved",
        dpa_subprocessor_evidence: "DPA-2026-014; subprocessor list v3",
      },
      ...shared,
    },
    {
      candidate_id: "P18-R-T",
      display_name: "Typst 0.15.1 (self-hosted sandbox)",
      eligibility: "finalist",
      engine: "typst",
      engine_version: "0.15.1",
      pipeline: "typst-cli@0.15.1",
      adapter_commit: "2222222222222222222222222222222222222222",
      adapter_digest: syntheticDigest("adapter-typst"),
      dependency_lock_digest: syntheticDigest("deps-typst"),
      configuration_digest: syntheticDigest("config-typst"),
      container_runtime: "distroless-container@sha256-fixture",
      os_libc: "debian12-glibc2.36",
      engine_binary_digest: syntheticDigest("typst-binary"),
      network_filesystem_policy:
        "killable no-network sandbox; vendored packages, fonts, and assets only",
      ...shared,
    },
    {
      candidate_id: "P18-R-C",
      display_name: "Pinned Playwright Chromium (comparison control)",
      eligibility: "comparison_control",
      engine: "chromium",
      engine_version: "playwright-1.49-chromium-131",
      pipeline: "playwright-print-to-pdf",
      adapter_commit: "3333333333333333333333333333333333333333",
      adapter_digest: syntheticDigest("adapter-chromium"),
      dependency_lock_digest: syntheticDigest("deps-chromium"),
      configuration_digest: syntheticDigest("config-chromium"),
      network_filesystem_policy: "no-network sandbox; comparison evidence only",
      ...shared,
    },
  ];
}

export function buildFixtureContestInput(
  overrides: Partial<Phase18ContestFreezeInput> = {},
): RendererQualificationCharterInput {
  const fixtures = Object.fromEntries(
    [...OPEN_CASE_IDS, ...HELD_BACK_CASE_IDS].map((caseId) => [
      caseId,
      {
        facts_digest: syntheticDigest(`facts-${caseId}`),
        document_digest: syntheticDigest(`document-${caseId}`),
      },
    ]),
  ) as Record<
    HeldBackCaseId | OpenCaseId,
    { facts_digest: string; document_digest: string }
  >;

  const sealed_expectations = Object.fromEntries(
    HELD_BACK_CASE_IDS.map((caseId) => [
      caseId,
      syntheticDigest(`sealed-${caseId}`),
    ]),
  ) as Record<HeldBackCaseId, string>;

  return buildPhase18RendererContestInput({
    charter_id: "p18-renderer-contest",
    charter_version: "1.0.0",
    frozen_at: "2026-07-22T12:00:00.000Z",
    roles: FIXTURE_ROLES,
    approvals: [
      {
        actor: "approver-emerson",
        role: "final_approver",
        approved_at: "2026-07-22T11:59:00.000Z",
        statement:
          "Charter approved for freeze before any candidate result exists.",
      },
    ],
    candidates: fixtureCandidates(),
    fixtures,
    sealed_expectations,
    held_back_seal: {
      custodian: "custodian-quinn",
      sealed_at: "2026-07-22T11:00:00.000Z",
      sealed_expectations_digest: syntheticDigest("all-held-back-expectations"),
      access_log: [
        {
          actor: "custodian-quinn",
          at: "2026-07-22T11:00:00.000Z",
          reason: "initial seal before candidate work",
        },
      ],
    },
    ...overrides,
  });
}
