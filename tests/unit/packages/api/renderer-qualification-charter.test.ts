import { describe, expect, it } from "vitest";

import {
  FIXTURE_ROLES,
  buildFixtureContestInput,
  fixtureCandidates,
  syntheticDigest,
} from "./renderer-qualification-test-fixture";
import {
  HELD_BACK_CASE_IDS,
  OPEN_CASE_IDS,
  PHASE_18_EVIDENCE_RULES,
  PHASE_18_OPERATIONAL_SUITES,
  type PHASE_18_ABSOLUTE_BUDGETS,
  PHASE_18_QUALIFICATION_GATES,
  RendererCharterValidationError,
  buildPhase18RendererContestInput,
  buildRendererQualificationManifest,
  canonicalizeQualificationValue,
  digestQualificationValue,
  freezeRendererQualificationCharter,
  validateRendererQualificationCharterInput,
  verifyRendererQualificationCharter,
  type FrozenRendererQualificationCharter,
  type Phase18ContestFreezeInput,
  type RendererQualificationCharterInput,
} from "../../../../packages/api/src/generated-documents/renderer-qualification";

function mutated(
  mutate: (input: RendererQualificationCharterInput) => void,
): RendererQualificationCharterInput {
  const input = structuredClone(buildFixtureContestInput());
  mutate(input);
  return input;
}

function issueCodes(input: RendererQualificationCharterInput): string[] {
  return validateRendererQualificationCharterInput(input).map(
    (item) => item.code,
  );
}

type CandidateLock = RendererQualificationCharterInput["candidates"][number];

function patchCandidate(
  input: RendererQualificationCharterInput,
  candidateId: CandidateLock["candidate_id"],
  patch: Record<string, unknown>,
): void {
  input.candidates = input.candidates.map((candidate) =>
    candidate.candidate_id === candidateId
      ? ({ ...candidate, ...patch } as CandidateLock)
      : candidate,
  );
}

function candidateIssueCodes(
  candidateId: CandidateLock["candidate_id"],
  patch: Record<string, unknown>,
): string[] {
  return issueCodes(
    mutated((input) => {
      patchCandidate(input, candidateId, patch);
    }),
  );
}

describe("canonicalizeQualificationValue", () => {
  it("orders keys by code unit so digests do not depend on the runtime locale", () => {
    // "a".localeCompare("B") is negative under locale collation but "a" sorts
    // after "B" by code unit. Pinning the code-unit result keeps the digest
    // identical across ICU builds and ambient locales.
    expect(canonicalizeQualificationValue({ a: 1, B: 2 })).toBe(
      '{"B":2,"a":1}',
    );
    expect(canonicalizeQualificationValue({ nested: { a: 1, B: 2 } })).toBe(
      '{"nested":{"B":2,"a":1}}',
    );
  });
});

describe("freezeRendererQualificationCharter", () => {
  it("freezes a complete charter with exact candidates, corpus, gates, weights, and budgets", () => {
    const charter = freezeRendererQualificationCharter(
      buildFixtureContestInput(),
    );

    expect(charter.manifest_digest).toMatch(/^[0-9a-f]{64}$/);
    expect(charter.candidates.map((item) => item.candidate_id)).toEqual([
      "P18-R-C",
      "P18-R-P",
      "P18-R-T",
    ]);
    expect(charter.open_corpus.map((item) => item.case_id)).toEqual([
      ...OPEN_CASE_IDS,
    ]);
    expect(charter.held_back_corpus.map((item) => item.case_id)).toEqual([
      ...HELD_BACK_CASE_IDS,
    ]);
    expect(charter.gates).toHaveLength(12);
    expect(
      charter.score_dimensions.reduce((total, item) => total + item.weight, 0),
    ).toBe(100);
    expect(
      charter.score_dimensions.map((item) => item.weight).sort((a, b) => b - a),
    ).toEqual([20, 20, 20, 15, 10, 10, 5]);

    const manifest = buildRendererQualificationManifest(charter);
    expect(manifest.digest_algorithm).toBe("sha256");
    expect(manifest.manifest_digest).toBe(charter.manifest_digest);

    expect(verifyRendererQualificationCharter(charter)).toEqual({
      valid: true,
      failures: [],
    });
  });

  it("is append-only after freeze: frozen fields cannot be mutated", () => {
    const charter = freezeRendererQualificationCharter(
      buildFixtureContestInput(),
    );

    expect(() => {
      (charter as { charter_version: string }).charter_version = "2";
    }).toThrow(TypeError);
    expect(() => {
      (charter.budgets as unknown as unknown[]).push({});
    }).toThrow(TypeError);
  });

  it("digests identically for reordered order-insensitive collections", () => {
    const base = freezeRendererQualificationCharter(buildFixtureContestInput());

    const shuffled = structuredClone(buildFixtureContestInput());
    shuffled.candidates = [...shuffled.candidates]
      .reverse()
      .map((candidate) => ({
        ...candidate,
        fonts_assets_packages: [...candidate.fonts_assets_packages].reverse(),
      }));
    shuffled.open_corpus = [...shuffled.open_corpus].reverse();
    shuffled.held_back_corpus = [...shuffled.held_back_corpus].reverse();
    shuffled.gates = [...shuffled.gates].reverse();
    shuffled.budgets = [...shuffled.budgets].reverse();
    shuffled.validators = [...shuffled.validators].reverse();
    shuffled.score_dimensions = [...shuffled.score_dimensions].reverse();

    expect(freezeRendererQualificationCharter(shuffled).manifest_digest).toBe(
      base.manifest_digest,
    );
  });

  it("changes the digest for order-sensitive protocol changes and frozen-field changes", () => {
    const base = freezeRendererQualificationCharter(buildFixtureContestInput());

    // The custodian access log is a genuinely order-sensitive record; its
    // order participates in the digest. (Tie-break order is now pinned to the
    // protocol, so reordering it is a validation error, not a new version.)
    const digestWithAccessLog = (
      accessLog: RendererQualificationCharterInput["held_back_seal"]["access_log"],
    ) => {
      const input = structuredClone(buildFixtureContestInput());
      input.held_back_seal = { ...input.held_back_seal, access_log: accessLog };
      return freezeRendererQualificationCharter(input).manifest_digest;
    };

    const twoEntries = [
      ...structuredClone(buildFixtureContestInput()).held_back_seal.access_log,
      {
        actor: "custodian-quinn",
        at: "2026-07-22T11:30:00.000Z",
        reason: "re-verified the sealed digest",
      },
    ];
    const forward = digestWithAccessLog(twoEntries);

    // Appending changes the digest...
    expect(forward).not.toBe(base.manifest_digest);
    // ...and so does reordering the same entries, which is the actual
    // order-sensitivity claim. Asserting only the append would pass even if the
    // access log were canonicalized order-insensitively like the other
    // collections above.
    expect(digestWithAccessLog([...twoEntries].reverse())).not.toBe(forward);
  });

  it("names every protocol role, including operations and records/legal", () => {
    // The protocol's role table binds eight roles. Without these two a charter
    // could freeze with nobody accountable for load/recovery/cost evidence, or
    // for retention, font-license, and purpose prerequisites.
    for (const role of [
      "operations_reviewer",
      "records_legal_evidence_owner",
    ] as const) {
      expect(
        issueCodes(
          mutated((input) => {
            input.roles = { ...input.roles, [role]: "   " };
          }),
        ),
        role,
      ).toContain("role_missing");
    }
  });

  it("pins the self-hosted challenger's binary, container, and libc", () => {
    // Protocol, P18-R-T row: binary SHA-256, OS/container digest, and
    // libc/runtime are part of what must be frozen - "only the exact frozen
    // binary and sandbox qualify". Engine/version/pipeline strings alone would
    // let the one candidate whose runtime we own freeze unpinned.
    const withTypst = (patch: Record<string, unknown>) =>
      issueCodes(
        mutated((input) => {
          input.candidates = input.candidates.map((item) =>
            item.candidate_id === "P18-R-T" ? { ...item, ...patch } : item,
          );
        }),
      );

    expect(withTypst({ engine_binary_digest: undefined })).toContain(
      "candidate_lock_invalid",
    );
    expect(withTypst({ engine_binary_digest: "not-a-digest" })).toContain(
      "candidate_lock_invalid",
    );
    expect(withTypst({ container_runtime: "  " })).toContain(
      "candidate_lock_invalid",
    );
    expect(withTypst({ os_libc: "  " })).toContain("candidate_lock_invalid");

    // The managed candidate pins its engine through the provider, so it is not
    // held to the self-hosted binary requirement.
    expect(
      issueCodes(
        mutated((input) => {
          input.candidates = input.candidates.map((item) =>
            item.candidate_id === "P18-R-P"
              ? { ...item, engine_binary_digest: undefined }
              : item,
          );
        }),
      ),
    ).not.toContain("candidate_lock_invalid");
  });

  it("requires exact source-compiler and adapter-commit provenance for every candidate", () => {
    for (const candidateId of ["P18-R-P", "P18-R-T", "P18-R-C"] as const) {
      expect(
        candidateIssueCodes(candidateId, { source_compiler: undefined }),
        `${candidateId} source compiler`,
      ).toContain("provenance_missing");
      expect(
        candidateIssueCodes(candidateId, {
          source_compiler: {
            name: "document-source-compiler",
            version: "1.0.0",
            digest: "not-a-digest",
          },
        }),
        `${candidateId} source compiler digest`,
      ).toContain("provenance_missing");
      expect(
        candidateIssueCodes(candidateId, { adapter_commit: "main" }),
        `${candidateId} adapter commit`,
      ).toContain("provenance_missing");
      expect(
        candidateIssueCodes(candidateId, {
          adapter_commit: "a".repeat(64),
        }),
        `${candidateId} SHA-256-format Git object id`,
      ).not.toContain("provenance_missing");
    }
  });

  it("pins the Chromium control's browser, Playwright, and runtime independently", () => {
    for (const patch of [
      { playwright_version: " " },
      { playwright_version: "latest" },
      { browser_revision: " " },
      { browser_revision: "current" },
      { container_runtime: " " },
      { container_runtime: "latest" },
      { container_runtime: "containerd@^2.0.0" },
      { container_runtime: "containerd@2.x" },
      { container_runtime_digest: "not-a-digest" },
      { container_image_digest: "not-a-digest" },
      { engine_binary_digest: "not-a-digest" },
    ]) {
      expect(
        candidateIssueCodes("P18-R-C", patch),
        JSON.stringify(patch),
      ).toContain("candidate_lock_invalid");
    }
    expect(
      candidateIssueCodes("P18-R-C", {
        container_runtime: "containerd@2.0.0-beta.1",
      }),
    ).not.toContain("candidate_lock_invalid");
  });

  it("pins Typst distribution, container, and structural sandbox guarantees", () => {
    for (const patch of [
      { distribution_provenance_digest: "not-a-digest" },
      { container_image_digest: "not-a-digest" },
      { container_runtime: "sandbox-latest" },
      { container_runtime: "containerd@^2.0.0" },
      { container_runtime: "containerd@2.x" },
      { container_runtime_digest: "not-a-digest" },
      { os_libc: "whatever" },
      { os_libc: "glibc>=2.36" },
      {
        sandbox_policy: {
          killable: false,
          network_access: "denied",
          ambient_host_filesystem_access: "denied",
          inputs_pre_vendored: true,
        },
      },
      {
        sandbox_policy: {
          killable: true,
          network_access: "allowed",
          ambient_host_filesystem_access: "denied",
          inputs_pre_vendored: true,
        },
      },
      {
        sandbox_policy: {
          killable: true,
          network_access: "denied",
          ambient_host_filesystem_access: "allowed",
          inputs_pre_vendored: true,
        },
      },
      {
        sandbox_policy: {
          killable: true,
          network_access: "denied",
          ambient_host_filesystem_access: "denied",
          inputs_pre_vendored: false,
        },
      },
      { network_filesystem_policy: "network and host filesystem allowed" },
    ]) {
      expect(
        candidateIssueCodes("P18-R-T", patch),
        JSON.stringify(patch),
      ).toContain("candidate_lock_invalid");
    }
    expect(
      candidateIssueCodes("P18-R-T", {
        container_runtime: "containerd@2.0.0-beta.1",
      }),
    ).not.toContain("candidate_lock_invalid");
  });

  it("rejects a candidate operator recorded in the held-back access log", () => {
    // Protocol role table: candidate implementers must not "See held-back
    // expected results before candidate outputs are sealed". An operator in
    // this log is that leak, recorded in the charter's own evidence - and the
    // log was previously carried into the digest without ever being read.
    expect(
      issueCodes(
        mutated((input) => {
          input.held_back_seal = {
            ...input.held_back_seal,
            access_log: [
              ...input.held_back_seal.access_log,
              {
                actor: input.roles.candidate_operators["P18-R-T"],
                at: "2026-07-22T11:45:00.000Z",
                reason: "peeked at the sealed expectations",
              },
            ],
          };
        }),
      ),
    ).toContain("held_back_expectation_leaked");
  });

  it("rejects content addresses that are non-blank but malformed", () => {
    // A trim-only check treats "not-a-digest" as pinned, which makes the frozen
    // corpus and the candidate locks unverifiable while still freezing.
    expect(
      issueCodes(
        mutated((input) => {
          input.open_corpus = input.open_corpus.map((item, index) =>
            index === 0
              ? {
                  ...item,
                  fixture: { ...item.fixture, facts_digest: "not-a-digest" },
                }
              : item,
          );
        }),
      ),
    ).toContain("corpus_invalid");

    expect(
      issueCodes(
        mutated((input) => {
          input.held_back_seal = {
            ...input.held_back_seal,
            sealed_expectations_digest: "nope",
          };
        }),
      ),
    ).toContain("held_back_not_sealed");
  });

  it("requires a pinned font/asset entry to be identifiable and its approval to say something", () => {
    expect(
      issueCodes(
        mutated((input) => {
          input.candidates = input.candidates.map((item) =>
            item.candidate_id === "P18-R-P"
              ? {
                  ...item,
                  fonts_assets_packages: item.fonts_assets_packages.map(
                    (pin, index) =>
                      index === 0 ? { ...pin, name: "  ", version: "  " } : pin,
                  ),
                }
              : item,
          );
        }),
      ),
    ).toContain("provenance_missing");

    expect(
      issueCodes(
        mutated((input) => {
          input.approvals = input.approvals.map((entry) =>
            entry.actor === input.roles.final_approver
              ? { ...entry, statement: "   " }
              : entry,
          );
        }),
      ),
    ).toContain("approval_missing");
  });

  it("uses a unique canonical identity for every pinned font, asset, and package", () => {
    expect(
      candidateIssueCodes("P18-R-P", {
        fonts_assets_packages: [
          {
            artifact_id: " ",
            name: "noto-sans",
            version: "2.013",
            license: "OFL-1.1",
            digest: syntheticDigest("noto-sans-regular"),
          },
        ],
      }),
    ).toContain("provenance_missing");

    expect(
      candidateIssueCodes("P18-R-P", {
        fonts_assets_packages: [
          {
            artifact_id: " font/noto-sans/regular ",
            name: "noto-sans",
            version: "2.013",
            license: "OFL-1.1",
            digest: syntheticDigest("noto-sans-regular"),
          },
        ],
      }),
    ).toContain("provenance_missing");

    expect(
      candidateIssueCodes("P18-R-P", {
        fonts_assets_packages: [
          {
            artifact_id: "shared-artifact",
            name: "noto-sans",
            version: "2.013",
            license: "OFL-1.1",
            digest: syntheticDigest("noto-sans-regular"),
          },
          {
            artifact_id: "shared-artifact",
            name: "noto-sans",
            version: "2.013",
            license: "OFL-1.1",
            digest: syntheticDigest("noto-sans-bold"),
          },
        ],
      }),
    ).toContain("inventory_identity_conflict");

    const variants = mutated((input) => {
      patchCandidate(input, "P18-R-P", {
        fonts_assets_packages: [
          {
            artifact_id: "font/noto-sans/regular",
            name: "noto-sans",
            version: "2.013",
            license: "OFL-1.1",
            digest: syntheticDigest("noto-sans-regular"),
          },
          {
            artifact_id: "font/noto-sans/bold",
            name: "noto-sans",
            version: "2.013",
            license: "OFL-1.1",
            digest: syntheticDigest("noto-sans-bold"),
          },
        ],
      });
    });
    expect(() => freezeRendererQualificationCharter(variants)).not.toThrow();
  });

  it("requires an orderable charter version and a duplicate-free trigger set", () => {
    expect(
      issueCodes(
        mutated((input) => {
          input.charter_version = "draft";
        }),
      ),
    ).toContain("charter_incomplete");

    // A duplicated trigger keeps the sets equal, so a length check is what
    // catches it. It survives normalization and changes manifest_digest, and
    // the submission/remediation meters are scoped to that digest.
    expect(
      issueCodes(
        mutated((input) => {
          input.requalification_triggers = [
            ...input.requalification_triggers,
            input.requalification_triggers[0]!,
          ];
        }),
      ),
    ).toContain("protocol_fixed_field_changed");
  });

  it("reports a structurally malformed charter instead of throwing", () => {
    const charter = freezeRendererQualificationCharter(
      buildFixtureContestInput(),
    );
    const broken = structuredClone(charter) as unknown as Record<
      string,
      unknown
    >;
    delete broken.candidates;

    const result = verifyRendererQualificationCharter(
      broken as unknown as FrozenRendererQualificationCharter,
    );
    expect(result.valid).toBe(false);
    expect(result.failures.map((item) => item.code)).toContain(
      "structure_invalid",
    );
    expect(result.failures[0]?.detail).toContain("candidates");
  });

  it("freezes the pre-registered stop conditions", () => {
    // Protocol line 75: the frozen charter carries the "incident stop
    // conditions". Pre-registering them is what stops a leak, unequal tuning,
    // or compromised reviewer independence being reinterpreted after results
    // are inspected.
    const charter = freezeRendererQualificationCharter(
      buildFixtureContestInput(),
    );
    expect(charter.stop_conditions).toHaveLength(11);
    expect(charter.stop_conditions).toContain(
      "held-back expectations or fixture identities leak to candidate implementers before sealing",
    );

    expect(
      issueCodes(
        mutated((input) => {
          input.stop_conditions = input.stop_conditions.slice(1);
        }),
      ),
    ).toContain("protocol_fixed_field_changed");

    expect(
      issueCodes(
        mutated((input) => {
          input.stop_conditions = [];
        }),
      ),
    ).toContain("charter_incomplete");
  });

  it("freezes the evidence basis behind each scored dimension", () => {
    // The protocol's scoring table has an "Evidence considered after the hard
    // gates" column per category. Freezing only titles/anchors would let a
    // reviewer redefine what evidence justifies a score once results are
    // visible.
    const charter = freezeRendererQualificationCharter(
      buildFixtureContestInput(),
    );
    for (const dimension of charter.score_dimensions) {
      expect(dimension.evidence_basis.length).toBeGreaterThan(0);
    }

    expect(
      issueCodes(
        mutated((input) => {
          input.score_dimensions = input.score_dimensions.map((item, index) =>
            index === 0
              ? { ...item, evidence_basis: "whatever the reviewer likes" }
              : item,
          );
        }),
      ),
    ).toContain("protocol_fixed_field_changed");
  });

  it("pins the managed deployment and rejects smuggled charter fields", () => {
    // Protocol P18-R-P row: the managed candidate is only identified by its
    // API/client version, endpoint/region, account mode, options, retention,
    // support access and DPA evidence - "only the exact frozen managed
    // deployment qualifies".
    for (const key of [
      "api_client_version",
      "endpoint_region",
      "account_mode",
      "options_digest",
      "retention_policy",
      "support_access",
      "dpa_subprocessor_evidence",
    ]) {
      expect(
        issueCodes(
          mutated((input) => {
            input.candidates = input.candidates.map((item) =>
              item.candidate_id === "P18-R-P"
                ? {
                    ...item,
                    provider_settings: {
                      ...item.provider_settings,
                      [key]: " ",
                    },
                  }
                : item,
            );
          }),
        ),
        key,
      ).toContain("provenance_missing");
    }

    // normalize() spreads the input, so an unknown key would ride into the
    // manifest digest and still verify - authority this charter never granted.
    expect(
      issueCodes(
        mutated((input) => {
          (input as unknown as Record<string, unknown>).selected_renderer =
            "P18-R-T";
        }),
      ),
    ).toContain("charter_incomplete");
  });

  it("allows a fully reset, fully pinned self-hosted Prince candidate before results exist", () => {
    const managed = freezeRendererQualificationCharter(
      buildFixtureContestInput(),
    );
    const selfHosted = mutated((input) => {
      input.charter_id = "p18-renderer-contest-self-hosted-prince";
      input.charter_version = "1.0.0";
      input.frozen_at = "2026-07-23T12:00:00.000Z";
      input.held_back_corpus = input.held_back_corpus.map((item) => ({
        ...item,
        sealed_expectation_digest: syntheticDigest(
          `self-hosted-prince-${item.case_id}`,
        ),
      }));
      input.held_back_seal = {
        ...input.held_back_seal,
        sealed_at: "2026-07-23T11:00:00.000Z",
        sealed_expectations_digest: syntheticDigest(
          "self-hosted-prince-held-back-reset",
        ),
        access_log: [
          {
            actor: input.roles.corpus_custodian,
            at: "2026-07-23T11:00:00.000Z",
            reason: "resealed for the fresh self-hosted Prince charter",
          },
        ],
      };
      patchCandidate(input, "P18-R-P", {
        display_name: "Self-hosted Prince 15.1",
        deployment_mode: "self_hosted",
        pipeline: "prince-server@15.1",
        provider_settings: undefined,
        network_filesystem_policy: undefined,
        container_runtime: "containerd@2.0.0",
        container_runtime_digest: syntheticDigest("containerd-prince-runtime"),
        container_image_digest: syntheticDigest("prince-container"),
        os_libc: "debian12-glibc2.36",
        engine_binary_digest: syntheticDigest("prince-binary"),
        sandbox_policy: {
          killable: true,
          network_access: "denied",
          ambient_host_filesystem_access: "denied",
          inputs_pre_vendored: true,
        },
        substitution_reset: {
          superseded_charter_id: managed.charter_id,
          superseded_charter_version: managed.charter_version,
          superseded_manifest_digest: managed.manifest_digest,
          superseded_frozen_at: managed.frozen_at,
          superseded_held_back_seal_digest:
            managed.held_back_seal.sealed_expectations_digest,
          reason:
            "managed deployment failed the pre-run operating-evidence gate",
        },
      });
    });

    const reset = freezeRendererQualificationCharter(selfHosted);
    expect(reset.manifest_digest).not.toBe(managed.manifest_digest);
    expect(
      reset.candidates.find((item) => item.candidate_id === "P18-R-P"),
    ).toMatchObject({
      deployment_mode: "self_hosted",
      pipeline: "prince-server@15.1",
    });

    const withoutReset = structuredClone(selfHosted);
    patchCandidate(withoutReset, "P18-R-P", { substitution_reset: undefined });
    expect(issueCodes(withoutReset)).toContain("candidate_lock_invalid");

    const malformedReset = structuredClone(selfHosted);
    patchCandidate(malformedReset, "P18-R-P", { substitution_reset: {} });
    expect(() => issueCodes(malformedReset)).not.toThrow();
    expect(issueCodes(malformedReset)).toContain("candidate_lock_invalid");

    const reusedIdentity = structuredClone(selfHosted);
    const reusedPrince = reusedIdentity.candidates.find(
      (candidate) => candidate.candidate_id === "P18-R-P",
    ) as CandidateLock & {
      substitution_reset: { superseded_charter_id: string };
    };
    reusedPrince.substitution_reset.superseded_charter_id =
      reusedIdentity.charter_id;
    expect(issueCodes(reusedIdentity)).toContain("candidate_lock_invalid");

    const paddedReusedIdentity = structuredClone(selfHosted);
    const paddedReusedPrince = paddedReusedIdentity.candidates.find(
      (candidate) => candidate.candidate_id === "P18-R-P",
    ) as CandidateLock & {
      substitution_reset: { superseded_charter_id: string };
    };
    paddedReusedPrince.substitution_reset.superseded_charter_id = `${paddedReusedIdentity.charter_id} `;
    expect(issueCodes(paddedReusedIdentity)).toContain(
      "candidate_lock_invalid",
    );

    const paddedCurrentIdentity = structuredClone(selfHosted);
    paddedCurrentIdentity.charter_id = `${managed.charter_id} `;
    expect(issueCodes(paddedCurrentIdentity)).toContain(
      "candidate_lock_invalid",
    );

    for (const patch of [
      { engine_version: "latest" },
      { engine_version: "15.x" },
      { pipeline: "prince-latest" },
      { container_runtime: " " },
      { container_runtime: "latest" },
      { container_runtime: "containerd@^2.0.0" },
      { container_runtime: "containerd@2.x" },
      { container_runtime_digest: "not-a-digest" },
      { os_libc: " " },
      { os_libc: "whatever" },
      { os_libc: "glibc>=2.36" },
      { engine_binary_digest: "not-a-digest" },
      { container_image_digest: "not-a-digest" },
      {
        provider_settings: fixtureCandidates().find(
          (candidate) => candidate.candidate_id === "P18-R-P",
        )?.provider_settings,
      },
    ]) {
      const invalid = structuredClone(selfHosted);
      patchCandidate(invalid, "P18-R-P", patch);
      expect(issueCodes(invalid), JSON.stringify(patch)).toContain(
        "candidate_lock_invalid",
      );
    }

    const prereleaseRuntime = structuredClone(selfHosted);
    patchCandidate(prereleaseRuntime, "P18-R-P", {
      container_runtime: "containerd@2.0.0-beta.1",
    });
    expect(issueCodes(prereleaseRuntime)).not.toContain(
      "candidate_lock_invalid",
    );
  });

  it("freezes the durable boundaries each failure must be injected after", () => {
    // Protocol: the eight injections run "after each durable boundary".
    // Freezing only the injections lets a candidate inject all eight at one
    // convenient point and still claim the suite.
    const charter = freezeRendererQualificationCharter(
      buildFixtureContestInput(),
    );
    expect(
      charter.operational_suites.failure_matrix.durable_boundaries,
    ).toEqual(PHASE_18_OPERATIONAL_SUITES.failure_matrix.durable_boundaries);

    expect(
      issueCodes(
        mutated((input) => {
          input.operational_suites = {
            ...input.operational_suites,
            failure_matrix: {
              ...input.operational_suites.failure_matrix,
              durable_boundaries: [
                ...input.operational_suites.failure_matrix.durable_boundaries,
              ].reverse(),
            },
          };
        }),
      ),
    ).toContain("suite_invalid");
  });

  it("rejects wrong or missing candidates and versions", () => {
    expect(
      issueCodes(
        mutated((input) => {
          input.candidates = input.candidates.filter(
            (item) => item.candidate_id !== "P18-R-T",
          );
        }),
      ),
    ).toContain("candidate_register_invalid");

    expect(
      issueCodes(
        mutated((input) => {
          input.candidates = input.candidates.map((item) =>
            item.candidate_id === "P18-R-P"
              ? { ...item, engine_version: "15.2" }
              : item,
          );
        }),
      ),
    ).toContain("candidate_lock_invalid");

    expect(
      issueCodes(
        mutated((input) => {
          input.candidates = input.candidates.map((item) =>
            item.candidate_id === "P18-R-T"
              ? { ...item, engine_version: "0.16.0" }
              : item,
          );
        }),
      ),
    ).toContain("candidate_lock_invalid");

    // The control can never be promoted to a finalist.
    expect(
      issueCodes(
        mutated((input) => {
          input.candidates = input.candidates.map((item) =>
            item.candidate_id === "P18-R-C"
              ? { ...item, eligibility: "finalist" as const }
              : item,
          );
        }),
      ),
    ).toContain("candidate_lock_invalid");

    expect(
      issueCodes(
        mutated((input) => {
          input.candidates = input.candidates.map((item) =>
            item.candidate_id === "P18-R-P"
              ? { ...item, adapter_digest: " " }
              : item,
          );
        }),
      ),
    ).toContain("provenance_missing");
  });

  it("rejects an incomplete or leaking corpus", () => {
    expect(
      issueCodes(
        mutated((input) => {
          input.open_corpus = input.open_corpus.filter(
            (item) => item.case_id !== "O07",
          );
        }),
      ),
    ).toContain("corpus_incomplete");

    expect(
      issueCodes(
        mutated((input) => {
          input.held_back_corpus = input.held_back_corpus.filter(
            (item) => item.case_id !== "H11",
          );
        }),
      ),
    ).toContain("corpus_incomplete");

    // A held-back case carrying expected results is a leak, full stop.
    expect(
      issueCodes(
        mutated((input) => {
          input.held_back_corpus = input.held_back_corpus.map((item) =>
            item.case_id === "H06"
              ? {
                  ...item,
                  expected: {
                    protected_facts: ["leaked"],
                    layout_assertions: [],
                  },
                }
              : item,
          );
        }),
      ),
    ).toContain("held_back_expectation_leaked");

    expect(
      issueCodes(
        mutated((input) => {
          input.held_back_corpus = input.held_back_corpus.map((item) =>
            item.case_id === "H03"
              ? { ...item, sealed_expectation_digest: undefined }
              : item,
          );
        }),
      ),
    ).toContain("held_back_not_sealed");

    expect(
      issueCodes(
        mutated((input) => {
          input.held_back_seal = {
            ...input.held_back_seal,
            custodian: "operator-prince",
          };
        }),
      ),
    ).toContain("held_back_not_sealed");

    expect(
      issueCodes(
        mutated((input) => {
          input.held_back_seal = {
            ...input.held_back_seal,
            sealed_at: "2026-07-23T00:00:00.000Z",
          };
        }),
      ),
    ).toContain("held_back_not_sealed");

    expect(
      issueCodes(
        mutated((input) => {
          input.open_corpus = input.open_corpus.map((item) =>
            item.case_id === "O01"
              ? { ...item, title: "receipt for jane.donor@gmail.com" }
              : item,
          );
        }),
      ),
    ).toContain("corpus_not_synthetic");
  });

  it("rejects missing gates, wrong weights, and altered scoring rules", () => {
    expect(
      issueCodes(
        mutated((input) => {
          input.gates = input.gates.filter((item) => item.gate_id !== "G09");
        }),
      ),
    ).toContain("gates_incomplete");

    expect(
      issueCodes(
        mutated((input) => {
          input.score_dimensions = input.score_dimensions.map((item) =>
            item.dimension_id === "provider_portability"
              ? { ...item, weight: 10 }
              : item,
          );
        }),
      ),
    ).toContain("scoring_invalid");

    expect(
      issueCodes(
        mutated((input) => {
          input.score_dimensions = input.score_dimensions.filter(
            (item) => item.dimension_id !== "international_text",
          );
        }),
      ),
    ).toContain("scoring_invalid");

    expect(
      issueCodes(
        mutated((input) => {
          input.scoring_rules = {
            ...input.scoring_rules,
            material_lead_points: 1,
          };
        }),
      ),
    ).toContain("scoring_invalid");
  });

  it("rejects missing operational suites, unbounded budgets, and missing validators", () => {
    expect(
      issueCodes(
        mutated((input) => {
          input.operational_suites = {
            ...input.operational_suites,
            concurrency_staircase: { steps: [1, 5, 10, 25] },
          };
        }),
      ),
    ).toContain("suite_invalid");

    expect(
      issueCodes(
        mutated((input) => {
          input.operational_suites = {
            ...input.operational_suites,
            mixed_batch: {
              ...input.operational_suites.mixed_batch,
              poison_items: 0,
            },
          };
        }),
      ),
    ).toContain("suite_invalid");

    expect(
      issueCodes(
        mutated((input) => {
          input.operational_suites = {
            ...input.operational_suites,
            outage_recovery: {
              ...input.operational_suites.outage_recovery,
              outage_window_minutes: 60,
            },
          };
        }),
      ),
    ).toContain("suite_invalid");

    expect(
      issueCodes(
        mutated((input) => {
          input.budgets = input.budgets.filter(
            (item) => item.metric !== "max_cost_usd_per_thousand_documents",
          );
        }),
      ),
    ).toContain("budget_unbounded");

    expect(
      issueCodes(
        mutated((input) => {
          input.budgets = input.budgets.map((item) =>
            item.metric === "max_queue_age_seconds"
              ? { ...item, limit: Number.POSITIVE_INFINITY }
              : item,
          );
        }),
      ),
    ).toContain("budget_unbounded");

    expect(
      issueCodes(
        mutated((input) => {
          input.budgets = [
            ...input.budgets,
            {
              metric: "unregistered_metric",
              limit: 1,
              unit: "items",
              basis: "not part of the protocol",
            } as never,
          ];
        }),
      ),
    ).toContain("protocol_fixed_field_changed");

    expect(
      issueCodes(
        mutated((input) => {
          input.budgets = input.budgets.map((item) =>
            item.metric === "batch_completion_minutes"
              ? { ...item, limit: 120 }
              : item,
          );
        }),
      ),
    ).toContain("protocol_fixed_field_changed");

    expect(
      issueCodes(
        mutated((input) => {
          input.validators = input.validators.filter(
            (item) => item.category !== "pdf_a_machine",
          );
        }),
      ),
    ).toContain("validator_missing");
  });

  it("rejects role collisions and missing approvals the protocol forbids", () => {
    expect(
      issueCodes(
        mutated((input) => {
          input.roles = {
            ...input.roles,
            corpus_custodian: "operator-typst",
          };
        }),
      ),
    ).toContain("role_collision");

    expect(
      issueCodes(
        mutated((input) => {
          input.roles = {
            ...input.roles,
            accountable_owner: "operator-prince",
          };
        }),
      ),
    ).toContain("role_collision");

    expect(
      issueCodes(
        mutated((input) => {
          input.roles = {
            ...input.roles,
            independent_reviewers: ["reviewer-avery", "reviewer-avery"],
          };
        }),
      ),
    ).toContain("role_collision");

    expect(
      issueCodes(
        mutated((input) => {
          input.approvals = [];
        }),
      ),
    ).toContain("approval_missing");

    expect(
      issueCodes(
        mutated((input) => {
          input.approvals = input.approvals.map((approval) => ({
            ...approval,
            approved_at: "not-a-timestamp",
          }));
        }),
      ),
    ).toContain("approval_missing");

    expect(
      issueCodes(
        mutated((input) => {
          input.approvals = input.approvals.map((approval) => ({
            ...approval,
            approved_at: "2026-07-22T12:01:00.000Z",
          }));
        }),
      ),
    ).toContain("approval_missing");

    expect(
      issueCodes(
        mutated((input) => {
          input.remediation_policy = {
            ...input.remediation_policy,
            max_cycles: 3 as never,
          };
        }),
      ),
    ).toContain("charter_incomplete");

    expect(
      issueCodes(
        mutated((input) => {
          input.remediation_policy = {
            ...input.remediation_policy,
            max_hours_per_cycle: Number.POSITIVE_INFINITY,
          };
        }),
      ),
    ).toContain("charter_incomplete");

    expect(
      issueCodes(
        mutated((input) => {
          input.evidence_rules = {
            ...input.evidence_rules,
            retention_days: Number.NaN,
          };
        }),
      ),
    ).toContain("charter_incomplete");

    expect(
      issueCodes(
        mutated((input) => {
          input.evidence_rules = {
            ...PHASE_18_EVIDENCE_RULES,
            retention_owner: "short-retention-owner",
          };
        }),
      ),
    ).toContain("charter_incomplete");
  });

  it("throws a typed error carrying every issue when freezing an invalid charter", () => {
    const input = mutated((draft) => {
      draft.gates = [];
      draft.budgets = [];
    });

    try {
      freezeRendererQualificationCharter(input);
      expect.unreachable("invalid charter must not freeze");
    } catch (error) {
      expect(error).toBeInstanceOf(RendererCharterValidationError);
      const codes = (error as RendererCharterValidationError).issues.map(
        (item) => item.code,
      );
      expect(codes).toContain("gates_incomplete");
      expect(codes).toContain("budget_unbounded");
    }
  });
});

describe("verifyRendererQualificationCharter", () => {
  function tamper(
    mutate: (charter: FrozenRendererQualificationCharter) => void,
  ): FrozenRendererQualificationCharter {
    const charter = structuredClone(
      freezeRendererQualificationCharter(buildFixtureContestInput()),
    );
    mutate(charter);
    return charter;
  }

  it("catches field, collection, fixture, and role tampering", () => {
    const mutations: Array<
      (charter: FrozenRendererQualificationCharter) => void
    > = [
      (charter) => {
        (charter.roles as { final_approver: string }).final_approver =
          "operator-prince";
      },
      (charter) => {
        (
          charter.open_corpus[0].fixture as { facts_digest: string }
        ).facts_digest = syntheticDigest("tampered");
      },
      (charter) => {
        (charter.gates[0] as { pass_rule: string }).pass_rule = "relaxed";
      },
      (charter) => {
        (charter.budgets[0] as { limit: number }).limit = 999_999;
      },
      (charter) => {
        (charter as { charter_version: string }).charter_version = "1.0.1";
      },
    ];

    for (const mutate of mutations) {
      const result = verifyRendererQualificationCharter(tamper(mutate));
      expect(result.valid).toBe(false);
      expect(result.failures.map((item) => item.code)).toContain(
        "digest_mismatch",
      );
    }
  });

  it("rejects a self-consistent charter that could never have legitimately frozen", async () => {
    const charter = structuredClone(
      freezeRendererQualificationCharter(buildFixtureContestInput()),
    );
    (charter as { gates: unknown }).gates = charter.gates.slice(0, 11);
    const { schema_version, manifest_digest: _old, ...frozenFields } = charter;
    (charter as { manifest_digest: string }).manifest_digest =
      digestQualificationValue({ schema_version, charter: frozenFields });

    const result = verifyRendererQualificationCharter(charter);
    expect(result.valid).toBe(false);
    expect(result.failures.map((item) => item.code)).toContain(
      "structure_invalid",
    );
  });

  it("rejects a self-consistent digest over non-normalized frozen fields", () => {
    const charter = structuredClone(
      freezeRendererQualificationCharter(buildFixtureContestInput()),
    );
    (charter as { budgets: typeof PHASE_18_ABSOLUTE_BUDGETS }).budgets = [
      ...charter.budgets,
    ].reverse();
    const { schema_version, manifest_digest: _old, ...frozenFields } = charter;
    (charter as { manifest_digest: string }).manifest_digest =
      digestQualificationValue({ schema_version, charter: frozenFields });

    const result = verifyRendererQualificationCharter(charter);
    expect(result.valid).toBe(false);
    expect(result.failures.map((item) => item.code)).toContain(
      "digest_mismatch",
    );
  });

  it("rejects unsupported schema versions", () => {
    const charter = tamper((draft) => {
      (draft as { schema_version: string }).schema_version = "999";
    });
    const result = verifyRendererQualificationCharter(charter);
    expect(result.valid).toBe(false);
    expect(result.failures.map((item) => item.code)).toContain(
      "schema_version_unsupported",
    );
  });
});

describe("the harness surface", () => {
  it("contains no winner-selection or production-renderer code path and never treats missing evidence as pass", async () => {
    const moduleExports =
      await import("../../../../packages/api/src/generated-documents/renderer-qualification");
    const exportNames = Object.keys(moduleExports).map((name) =>
      name.toLowerCase(),
    );

    for (const forbidden of ["select", "winner", "activate", "production"]) {
      expect(
        exportNames.filter((name) => name.includes(forbidden)),
        `no export may ${forbidden}`,
      ).toEqual([]);
    }

    // The unknown-evidence rule is frozen into every charter.
    const charter = freezeRendererQualificationCharter(
      buildFixtureContestInput(),
    );
    expect(charter.unknown_evidence_rule).toBe("fails_affected_gate");
  });
});

describe("protocol-fixed fields are pinned at freeze", () => {
  it("rejects an altered hard-gate pass rule", () => {
    expect(
      issueCodes(
        mutated((input) => {
          input.gates = input.gates.map((gate) =>
            gate.gate_id === "G01"
              ? { ...gate, pass_rule: "always passes" }
              : gate,
          );
        }),
      ),
    ).toContain("protocol_fixed_field_changed");
  });

  it("rejects altered tie-break criteria", () => {
    expect(
      issueCodes(
        mutated((input) => {
          input.scoring_rules = {
            ...input.scoring_rules,
            tie_break_order: ["vibes", "coin flip", "incumbency"],
          };
        }),
      ),
    ).toContain("protocol_fixed_field_changed");
  });

  it("rejects a substituted frozen validator", () => {
    expect(
      issueCodes(
        mutated((input) => {
          input.validators = input.validators.map((tool) =>
            tool.name === "veraPDF" ? { ...tool, version: "9.9.9" } : tool,
          );
        }),
      ),
    ).toContain("protocol_fixed_field_changed");
  });

  it("rejects a reduced requalification-trigger set", () => {
    expect(
      issueCodes(
        mutated((input) => {
          input.requalification_triggers = [
            input.requalification_triggers[0] ?? "only one trigger",
          ];
        }),
      ),
    ).toContain("protocol_fixed_field_changed");
  });

  it("rejects extra failure-matrix injections beyond the frozen eight", () => {
    expect(
      issueCodes(
        mutated((input) => {
          input.operational_suites = {
            ...input.operational_suites,
            failure_matrix: {
              injections: [
                ...input.operational_suites.failure_matrix.injections,
                "surprise_injection",
              ],
            },
          };
        }),
      ),
    ).toContain("suite_invalid");
  });

  it("rejects duplicate or reordered order-sensitive operational suite entries", () => {
    expect(
      issueCodes(
        mutated((input) => {
          input.operational_suites = {
            ...input.operational_suites,
            repeatability: {
              ...input.operational_suites.repeatability,
              case_ids: [
                ...PHASE_18_OPERATIONAL_SUITES.repeatability.case_ids,
              ].reverse(),
            },
          };
        }),
      ),
    ).toContain("suite_invalid");

    expect(
      issueCodes(
        mutated((input) => {
          input.operational_suites = {
            ...input.operational_suites,
            failure_matrix: {
              injections: [
                ...input.operational_suites.failure_matrix.injections,
                input.operational_suites.failure_matrix.injections[0] ?? "",
              ],
            },
          };
        }),
      ),
    ).toContain("suite_invalid");

    expect(
      issueCodes(
        mutated((input) => {
          input.operational_suites = {
            ...input.operational_suites,
            failure_matrix: {
              injections: [
                ...input.operational_suites.failure_matrix.injections,
              ].reverse(),
            },
          };
        }),
      ),
    ).toContain("suite_invalid");
  });

  it("rejects duplicate hard gates and validators", () => {
    expect(
      issueCodes(
        mutated((input) => {
          const duplicate = input.gates[0];
          if (duplicate) input.gates = [...input.gates, duplicate];
        }),
      ),
    ).toContain("gates_incomplete");

    expect(
      issueCodes(
        mutated((input) => {
          const duplicate = input.validators[0];
          if (duplicate) input.validators = [...input.validators, duplicate];
        }),
      ),
    ).toContain("validator_missing");
  });

  it("rejects protocol-fixed corpus metadata and open-case expectations changes", () => {
    expect(
      issueCodes(
        mutated((input) => {
          input.open_corpus = input.open_corpus.map((item) =>
            item.case_id === "O01"
              ? {
                  ...item,
                  expected: {
                    protected_facts: ["different protected fact"],
                    layout_assertions: item.expected?.layout_assertions ?? [],
                  },
                }
              : item,
          );
        }),
      ),
    ).toContain("protocol_fixed_field_changed");

    expect(
      issueCodes(
        mutated((input) => {
          input.held_back_corpus = input.held_back_corpus.map((item) =>
            item.case_id === "H01"
              ? { ...item, title: "Different held-back case title" }
              : item,
          );
        }),
      ),
    ).toContain("protocol_fixed_field_changed");
  });

  it("pins the Typst pipeline and the Chromium control lock", () => {
    expect(
      issueCodes(
        mutated((input) => {
          input.candidates = input.candidates.map((item) =>
            item.candidate_id === "P18-R-T"
              ? { ...item, pipeline: "typst-anywhere@latest" }
              : item,
          );
        }),
      ),
    ).toContain("candidate_lock_invalid");

    expect(
      issueCodes(
        mutated((input) => {
          input.candidates = input.candidates.map((item) =>
            item.candidate_id === "P18-R-C"
              ? { ...item, pipeline: "puppeteer-freestyle" }
              : item,
          );
        }),
      ),
    ).toContain("candidate_lock_invalid");

    expect(
      issueCodes(
        mutated((input) => {
          input.candidates = input.candidates.map((item) =>
            item.candidate_id === "P18-R-C"
              ? { ...item, engine_version: " " }
              : item,
          );
        }),
      ),
    ).toContain("candidate_lock_invalid");
  });

  it("rejects a malformed held-back seal timestamp", () => {
    expect(
      issueCodes(
        mutated((input) => {
          input.held_back_seal = {
            ...input.held_back_seal,
            sealed_at: "not-a-timestamp",
          };
        }),
      ),
    ).toContain("held_back_not_sealed");
  });

  it("requires the final approval to be recorded in the final_approver role", () => {
    expect(
      issueCodes(
        mutated((input) => {
          input.approvals = input.approvals.map((approval) =>
            approval.actor === FIXTURE_ROLES.final_approver
              ? { ...approval, role: "independent_reviewer" }
              : approval,
          );
        }),
      ),
    ).toContain("approval_missing");
  });

  it("reports a missing fixture record as a typed validation issue, not a crash", () => {
    const fixtures = Object.fromEntries(
      [...OPEN_CASE_IDS, ...HELD_BACK_CASE_IDS].map((caseId) => [
        caseId,
        {
          facts_digest: syntheticDigest(`facts-${caseId}`),
          document_digest: syntheticDigest(`document-${caseId}`),
        },
      ]),
    );
    delete fixtures.O01;

    const sealed_expectations = Object.fromEntries(
      HELD_BACK_CASE_IDS.map((caseId) => [
        caseId,
        syntheticDigest(`sealed-${caseId}`),
      ]),
    );

    const incompleteInput = {
      charter_id: "p18-renderer-contest",
      charter_version: "1.0.0",
      frozen_at: "2026-07-22T12:00:00.000Z",
      roles: FIXTURE_ROLES,
      approvals: [
        {
          actor: FIXTURE_ROLES.final_approver,
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
        custodian: FIXTURE_ROLES.corpus_custodian,
        sealed_at: "2026-07-22T11:00:00.000Z",
        sealed_expectations_digest: syntheticDigest(
          "all-held-back-expectations",
        ),
        access_log: [
          {
            actor: FIXTURE_ROLES.corpus_custodian,
            at: "2026-07-22T11:00:00.000Z",
            reason: "initial seal before candidate work",
          },
        ],
      },
    } as Phase18ContestFreezeInput;

    let thrown: unknown;
    try {
      freezeRendererQualificationCharter(
        buildPhase18RendererContestInput(incompleteInput),
      );
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(RendererCharterValidationError);
    expect(
      (thrown as RendererCharterValidationError).issues.map(
        (issue) => issue.code,
      ),
    ).toContain("corpus_invalid");
  });

  it("keeps the protocol baseline immutable against in-place input mutation", () => {
    const input = buildFixtureContestInput();
    const baselineRule = PHASE_18_QUALIFICATION_GATES[0]?.pass_rule;
    expect(baselineRule).toBeTruthy();

    const firstGate = input.gates[0];
    expect(firstGate).toBeDefined();
    (firstGate as { pass_rule: string }).pass_rule = "always passes";

    expect(issueCodes(input)).toContain("protocol_fixed_field_changed");
    expect(PHASE_18_QUALIFICATION_GATES[0]?.pass_rule).toBe(baselineRule);

    expect(() => {
      (PHASE_18_QUALIFICATION_GATES[0] as { pass_rule: string }).pass_rule =
        "always passes";
    }).toThrow(TypeError);
  });
});
