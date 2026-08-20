import { describe, expect, it } from "vitest";

import {
  buildFixtureContestInput,
  syntheticDigest,
} from "./renderer-qualification-test-fixture";
import {
  RendererCharterValidationError,
  freezeRendererQualificationCharter,
  validateRendererQualificationCharterInput,
  type RendererQualificationCharterInput,
} from "../../../../packages/api/src/generated-documents/renderer-qualification";

type ValidatorTool = RendererQualificationCharterInput["validators"][number] & {
  executable_digest?: string;
  configuration_digest?: string;
  assistive_technology_stacks?: AssistiveTechnologyStacks;
};

interface ContentAddressedComponent {
  name: string;
  version: string;
  digest: string;
}

interface AssistiveTechnologyStack {
  stack_id: "primary" | "secondary";
  viewer: ContentAddressedComponent;
  assistive_technology: ContentAddressedComponent;
  task_protocol: ContentAddressedComponent;
}

type AssistiveTechnologyStacks = [
  AssistiveTechnologyStack,
  AssistiveTechnologyStack,
];

interface ValidatorWarningPolicy {
  retain_all_warnings: boolean;
  adjudicate_warnings_individually: boolean;
  rule_override_requires_charter_reset_and_rerun: boolean;
  profile_declaration_is_not_a_pass: boolean;
}

type EvidenceRulesWithWarningPolicy =
  RendererQualificationCharterInput["evidence_rules"] & {
    validator_warning_policy?: ValidatorWarningPolicy;
  };

function issueCodes(input: RendererQualificationCharterInput): string[] {
  return validateRendererQualificationCharterInput(input).map(
    (item) => item.code,
  );
}

function mutableValidators(
  input: RendererQualificationCharterInput,
): ValidatorTool[] {
  return input.validators as ValidatorTool[];
}

function assistiveTechnologyTool(
  input: RendererQualificationCharterInput,
): ValidatorTool {
  const tool = mutableValidators(input).find(
    (candidate) => candidate.category === "assistive_technology",
  );
  if (!tool)
    throw new Error("Fixture is missing the assistive-technology tool");
  return tool;
}

describe("renderer qualification validator evidence contract", () => {
  it("freezes content-addressed validators and two exact assistive-technology stacks", () => {
    const input = buildFixtureContestInput();
    const charter = freezeRendererQualificationCharter(input);

    for (const tool of mutableValidators(charter)) {
      expect(tool.executable_digest).toMatch(/^[0-9a-f]{64}$/);
      expect(tool.configuration_digest).toMatch(/^[0-9a-f]{64}$/);
    }

    const stacks = assistiveTechnologyTool(charter).assistive_technology_stacks;
    expect(stacks?.map((stack) => stack.stack_id)).toEqual([
      "primary",
      "secondary",
    ]);
    for (const stack of stacks ?? []) {
      for (const component of [
        stack.viewer,
        stack.assistive_technology,
        stack.task_protocol,
      ]) {
        expect(component.name.trim()).not.toBe("");
        expect(component.version).not.toMatch(
          /latest|current|stable|next|\bx\b/i,
        );
        expect(component.digest).toMatch(/^[0-9a-f]{64}$/);
      }
    }

    const warningPolicy = (
      charter.evidence_rules as EvidenceRulesWithWarningPolicy
    ).validator_warning_policy;
    expect(warningPolicy).toEqual({
      retain_all_warnings: true,
      adjudicate_warnings_individually: true,
      rule_override_requires_charter_reset_and_rerun: true,
      profile_declaration_is_not_a_pass: true,
    });
  });

  it.each(["executable_digest", "configuration_digest"] as const)(
    "rejects a missing or malformed validator %s",
    (field) => {
      for (const invalidValue of [undefined, "not-a-sha256"] as const) {
        const input = structuredClone(buildFixtureContestInput());
        const tool = mutableValidators(input)[0];
        if (!tool) throw new Error("Fixture is missing validators");

        if (invalidValue === undefined) {
          delete tool[field];
        } else {
          tool[field] = invalidValue;
        }

        expect(issueCodes(input)).toContain("validator_provenance_invalid");
        expect(() => freezeRendererQualificationCharter(input)).toThrow(
          RendererCharterValidationError,
        );
      }
    },
  );

  it("rejects missing, floating, or non-independent assistive-technology stacks", () => {
    const missing = structuredClone(buildFixtureContestInput());
    delete assistiveTechnologyTool(missing).assistive_technology_stacks;
    expect(issueCodes(missing)).toContain("assistive_technology_stack_invalid");
    expect(() => freezeRendererQualificationCharter(missing)).toThrow(
      RendererCharterValidationError,
    );

    const floating = structuredClone(buildFixtureContestInput());
    const floatingStacks =
      assistiveTechnologyTool(floating).assistive_technology_stacks;
    if (!floatingStacks) throw new Error("Fixture is missing AT stacks");
    floatingStacks[1].viewer.version = "TBD-2026";
    expect(issueCodes(floating)).toContain(
      "assistive_technology_stack_invalid",
    );
    expect(() => freezeRendererQualificationCharter(floating)).toThrow(
      RendererCharterValidationError,
    );

    const duplicated = structuredClone(buildFixtureContestInput());
    const duplicatedStacks =
      assistiveTechnologyTool(duplicated).assistive_technology_stacks;
    if (!duplicatedStacks) throw new Error("Fixture is missing AT stacks");
    duplicatedStacks[1] = {
      ...structuredClone(duplicatedStacks[0]),
      stack_id: "secondary",
      viewer: {
        ...structuredClone(duplicatedStacks[0].viewer),
        name: duplicatedStacks[0].viewer.name.toLowerCase(),
        digest: syntheticDigest("duplicate-viewer-rebuild"),
      },
      assistive_technology: {
        ...structuredClone(duplicatedStacks[0].assistive_technology),
        name: duplicatedStacks[0].assistive_technology.name.toLowerCase(),
        digest: syntheticDigest("duplicate-at-rebuild"),
      },
    };
    expect(issueCodes(duplicated)).toContain(
      "assistive_technology_stack_invalid",
    );
    expect(() => freezeRendererQualificationCharter(duplicated)).toThrow(
      RendererCharterValidationError,
    );

    const deferredName = structuredClone(buildFixtureContestInput());
    const deferredStacks =
      assistiveTechnologyTool(deferredName).assistive_technology_stacks;
    if (!deferredStacks) throw new Error("Fixture is missing AT stacks");
    deferredStacks[1].viewer.name = "independently chosen viewer";
    expect(issueCodes(deferredName)).toContain(
      "assistive_technology_stack_invalid",
    );

    const malformedTuple = structuredClone(buildFixtureContestInput());
    assistiveTechnologyTool(malformedTuple).assistive_technology_stacks = [
      undefined,
      undefined,
    ] as unknown as AssistiveTechnologyStacks;
    expect(() => issueCodes(malformedTuple)).not.toThrow();
    expect(issueCodes(malformedTuple)).toContain(
      "assistive_technology_stack_invalid",
    );
    expect(() => freezeRendererQualificationCharter(malformedTuple)).toThrow(
      RendererCharterValidationError,
    );

    const divergentTasks = structuredClone(buildFixtureContestInput());
    const divergentStacks =
      assistiveTechnologyTool(divergentTasks).assistive_technology_stacks;
    if (!divergentStacks) throw new Error("Fixture is missing AT stacks");
    divergentStacks[1].task_protocol.digest = syntheticDigest(
      "different-secondary-task-protocol",
    );
    expect(issueCodes(divergentTasks)).toContain(
      "assistive_technology_stack_invalid",
    );
    expect(() => freezeRendererQualificationCharter(divergentTasks)).toThrow(
      RendererCharterValidationError,
    );
  });

  it("accepts a key-order-equivalent shared assistive task protocol", () => {
    const baseline = freezeRendererQualificationCharter(
      buildFixtureContestInput(),
    );
    const reordered = structuredClone(buildFixtureContestInput());
    const stacks =
      assistiveTechnologyTool(reordered).assistive_technology_stacks;
    if (!stacks) throw new Error("Fixture is missing AT stacks");
    const taskProtocol = stacks[0].task_protocol;
    stacks[1].task_protocol = {
      digest: taskProtocol.digest,
      name: taskProtocol.name,
      version: taskProtocol.version,
    };

    expect(freezeRendererQualificationCharter(reordered).manifest_digest).toBe(
      baseline.manifest_digest,
    );
  });

  it("binds validator bytes, configuration, and the secondary stack into the manifest digest", () => {
    const baseline = freezeRendererQualificationCharter(
      buildFixtureContestInput(),
    );

    const changedExecutable = structuredClone(buildFixtureContestInput());
    const firstTool = mutableValidators(changedExecutable)[0];
    if (!firstTool) throw new Error("Fixture is missing validators");
    firstTool.executable_digest = syntheticDigest("different-validator-binary");
    expect(
      freezeRendererQualificationCharter(changedExecutable).manifest_digest,
    ).not.toBe(baseline.manifest_digest);

    const changedConfiguration = structuredClone(buildFixtureContestInput());
    const configuredTool = mutableValidators(changedConfiguration)[0];
    if (!configuredTool) throw new Error("Fixture is missing validators");
    configuredTool.configuration_digest = syntheticDigest(
      "different-validator-configuration",
    );
    expect(
      freezeRendererQualificationCharter(changedConfiguration).manifest_digest,
    ).not.toBe(baseline.manifest_digest);

    const changedSecondaryStack = structuredClone(buildFixtureContestInput());
    const stacks = assistiveTechnologyTool(
      changedSecondaryStack,
    ).assistive_technology_stacks;
    if (!stacks) throw new Error("Fixture is missing AT stacks");
    stacks[1].viewer.version = "140.0.1";
    expect(
      freezeRendererQualificationCharter(changedSecondaryStack).manifest_digest,
    ).not.toBe(baseline.manifest_digest);
  });

  it("rejects a missing or permissive validator-warning policy", () => {
    const missing = structuredClone(buildFixtureContestInput());
    delete (missing.evidence_rules as EvidenceRulesWithWarningPolicy)
      .validator_warning_policy;
    expect(issueCodes(missing)).toContain("charter_incomplete");
    expect(() => freezeRendererQualificationCharter(missing)).toThrow(
      RendererCharterValidationError,
    );

    const fields: readonly (keyof ValidatorWarningPolicy)[] = [
      "retain_all_warnings",
      "adjudicate_warnings_individually",
      "rule_override_requires_charter_reset_and_rerun",
      "profile_declaration_is_not_a_pass",
    ];
    for (const field of fields) {
      const input = structuredClone(buildFixtureContestInput());
      const rules = input.evidence_rules as EvidenceRulesWithWarningPolicy;
      const policy = rules.validator_warning_policy;
      if (!policy) throw new Error("Fixture is missing the warning policy");
      policy[field] = false;

      expect(issueCodes(input)).toContain("protocol_fixed_field_changed");
      expect(() => freezeRendererQualificationCharter(input)).toThrow(
        RendererCharterValidationError,
      );
    }

    const policyException = structuredClone(buildFixtureContestInput());
    const policy = (
      policyException.evidence_rules as EvidenceRulesWithWarningPolicy
    ).validator_warning_policy;
    if (!policy) throw new Error("Fixture is missing the warning policy");
    Object.assign(policy, {
      suppression_allowed_for: ["PAC", "veraPDF"],
    });
    expect(issueCodes(policyException)).toContain(
      "protocol_fixed_field_changed",
    );
    expect(() => freezeRendererQualificationCharter(policyException)).toThrow(
      RendererCharterValidationError,
    );

    const evidenceException = structuredClone(buildFixtureContestInput());
    Object.assign(evidenceException.evidence_rules, {
      validator_warning_exceptions: ["comparison_control"],
    });
    expect(issueCodes(evidenceException)).toContain(
      "protocol_fixed_field_changed",
    );
    expect(() => freezeRendererQualificationCharter(evidenceException)).toThrow(
      RendererCharterValidationError,
    );
  });
});
