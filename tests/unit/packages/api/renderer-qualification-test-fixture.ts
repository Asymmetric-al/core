import { createHash } from "node:crypto";

import {
  HELD_BACK_CASE_IDS,
  OPEN_CASE_IDS,
  PHASE_18_VALIDATION_TOOLS,
  buildPhase18RendererContestInput,
  digestSyntheticCorpusFixtureManifest,
  digestSyntheticCorpusProof,
} from "../../../../packages/api/src/generated-documents/renderer-qualification";

import type {
  HeldBackCaseId,
  OpenCaseId,
  Phase18ContestFreezeInput,
  QualificationCaseId,
  QualificationRoles,
  RendererCandidateLock,
  RendererQualificationCharterInput,
  SyntheticCorpusProof,
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
        artifact_id: "font/noto-sans/regular",
        name: "noto-sans",
        version: "2.013",
        license: "OFL-1.1",
        digest: syntheticDigest("noto-sans"),
      },
      {
        artifact_id: "asset/corpus-bundle",
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
      deployment_mode: "managed",
      engine: "prince",
      engine_version: "15.1",
      pipeline: "docraptor-managed@10.1",
      adapter_commit: "1111111111111111111111111111111111111111",
      adapter_digest: syntheticDigest("adapter-prince"),
      dependency_lock_digest: syntheticDigest("deps-prince"),
      source_compiler: {
        name: "asym-document-source-compiler",
        version: "1.0.0",
        digest: syntheticDigest("source-compiler-prince"),
      },
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
      deployment_mode: "self_hosted",
      engine: "typst",
      engine_version: "0.15.1",
      pipeline: "typst-cli@0.15.1",
      adapter_commit: "2222222222222222222222222222222222222222",
      adapter_digest: syntheticDigest("adapter-typst"),
      dependency_lock_digest: syntheticDigest("deps-typst"),
      source_compiler: {
        name: "asym-document-source-compiler",
        version: "1.0.0",
        digest: syntheticDigest("source-compiler-typst"),
      },
      configuration_digest: syntheticDigest("config-typst"),
      container_runtime: "containerd@2.0.0",
      container_runtime_digest: syntheticDigest("containerd-typst-runtime"),
      container_image_digest: syntheticDigest("typst-container"),
      os_libc: "debian12-glibc2.36",
      engine_binary_digest: syntheticDigest("typst-binary"),
      distribution_provenance_digest: syntheticDigest(
        "typst-official-distribution",
      ),
      sandbox_policy: {
        killable: true,
        network_access: "denied",
        ambient_host_filesystem_access: "denied",
        inputs_pre_vendored: true,
      },
      ...shared,
    },
    {
      candidate_id: "P18-R-C",
      display_name: "Pinned Playwright Chromium (comparison control)",
      eligibility: "comparison_control",
      deployment_mode: "self_hosted",
      engine: "chromium",
      engine_version: "playwright-1.49-chromium-131",
      pipeline: "playwright-print-to-pdf",
      adapter_commit: "3333333333333333333333333333333333333333",
      adapter_digest: syntheticDigest("adapter-chromium"),
      dependency_lock_digest: syntheticDigest("deps-chromium"),
      source_compiler: {
        name: "asym-preview-source-compiler",
        version: "1.0.0",
        digest: syntheticDigest("source-compiler-chromium"),
      },
      configuration_digest: syntheticDigest("config-chromium"),
      playwright_version: "1.49.1",
      browser_revision: "chromium-131.0.6778.33-r1148",
      container_runtime: "containerd@2.0.0",
      container_runtime_digest: syntheticDigest("containerd-chromium-runtime"),
      container_image_digest: syntheticDigest("chromium-container"),
      engine_binary_digest: syntheticDigest("chromium-binary"),
      ...shared,
    },
  ];
}

export function buildFixtureSyntheticCorpusProof(
  fixtures: Phase18ContestFreezeInput["fixtures"],
): SyntheticCorpusProof {
  const fixture_manifest_digest = digestSyntheticCorpusFixtureManifest(
    (
      Object.entries(fixtures) as Array<
        [QualificationCaseId, { facts_digest: string; document_digest: string }]
      >
    ).map(([case_id, fixture]) => ({ case_id, ...fixture })),
  );
  const claims: Omit<SyntheticCorpusProof, "proof_digest"> = {
    proof_id: "phase-18-corpus-generation-proof",
    schema_version: "phase-18-synthetic-corpus-proof/v1",
    assurance: "synthetic_generation",
    fixture_manifest_digest,
    procedure: {
      id: "phase-18-synthetic-fixture-generator",
      version: "1.0.0",
      digest: syntheticDigest("synthetic-fixture-generator-1.0.0"),
    },
    generation_evidence_digest: syntheticDigest(
      "synthetic-corpus-generation-evidence",
    ),
    attested_by: FIXTURE_ROLES.corpus_custodian,
    attested_at: "2026-07-22T10:59:00.000Z",
  };

  return {
    ...claims,
    proof_digest: digestSyntheticCorpusProof(claims),
  };
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
    synthetic_corpus_proof: buildFixtureSyntheticCorpusProof(fixtures),
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
    validator_artifact_pins: Object.fromEntries(
      PHASE_18_VALIDATION_TOOLS.map((tool) => [
        tool.name,
        {
          executable_digest: syntheticDigest(
            `validator-executable-${tool.name}`,
          ),
          configuration_digest: syntheticDigest(
            `validator-configuration-${tool.name}`,
          ),
        },
      ]),
    ),
    assistive_technology_stacks: [
      {
        stack_id: "primary",
        viewer: {
          name: "Adobe Acrobat Reader",
          version: "2026.1.0",
          digest: syntheticDigest("at-primary-acrobat-reader"),
        },
        assistive_technology: {
          name: "NVDA",
          version: "2026.1.0",
          digest: syntheticDigest("at-primary-nvda"),
        },
        task_protocol: {
          name: "phase-18-assistive-technology-task-set",
          version: "1.0.0",
          digest: syntheticDigest("at-task-protocol"),
        },
      },
      {
        stack_id: "secondary",
        viewer: {
          name: "Microsoft Edge",
          version: "140.0.0",
          digest: syntheticDigest("at-secondary-edge"),
        },
        assistive_technology: {
          name: "Narrator",
          version: "11.0.0",
          digest: syntheticDigest("at-secondary-narrator"),
        },
        task_protocol: {
          name: "phase-18-assistive-technology-task-set",
          version: "1.0.0",
          digest: syntheticDigest("at-task-protocol"),
        },
      },
    ],
    ...overrides,
  });
}
