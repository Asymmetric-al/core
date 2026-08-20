import { describe, expect, it } from "vitest";

import { buildFixtureContestInput } from "./renderer-qualification-test-fixture";
import {
  QualificationHarnessError,
  RENDERER_QUALIFICATION_SERIALIZER_VERSION,
  buildRendererQualificationManifest,
  digestQualificationValue,
  freezeRendererQualificationCharter,
  loadCandidateWorkPacket,
  verifyRendererQualificationCharter,
  type FrozenRendererQualificationCharter,
} from "../../../../packages/api/src/generated-documents/renderer-qualification";

type MutableRecord = Record<string, unknown>;

function malformedCharter(
  mutate: (draft: MutableRecord) => void,
): FrozenRendererQualificationCharter {
  const charter = structuredClone(
    freezeRendererQualificationCharter(buildFixtureContestInput()),
  ) as unknown as MutableRecord;
  mutate(charter);
  return charter as unknown as FrozenRendererQualificationCharter;
}

describe("renderer qualification verification boundary", () => {
  it.each([
    [
      "a null candidate",
      (draft: MutableRecord) => {
        draft.candidates = [null];
      },
    ],
    [
      "an empty roles object",
      (draft: MutableRecord) => {
        draft.roles = {};
      },
    ],
    [
      "a candidate missing its finalizer",
      (draft: MutableRecord) => {
        const candidates = draft.candidates as MutableRecord[];
        delete candidates[0]!.finalizer;
      },
    ],
  ])("returns structure_invalid for %s", (_label, mutate) => {
    const charter = malformedCharter(mutate);

    expect(() => verifyRendererQualificationCharter(charter)).not.toThrow();

    const result = verifyRendererQualificationCharter(charter);
    expect(result.valid).toBe(false);
    expect(result.failures.map((failure) => failure.code)).toContain(
      "structure_invalid",
    );

    expect(() =>
      loadCandidateWorkPacket(charter, "P18-R-P", "operator-prince"),
    ).toThrow(QualificationHarnessError);
    try {
      loadCandidateWorkPacket(charter, "P18-R-P", "operator-prince");
      expect.unreachable("a malformed charter must fail closed");
    } catch (error) {
      expect((error as QualificationHarnessError).code).toBe("charter_invalid");
    }
  });

  it("binds serializer provenance into the frozen charter, digest, and manifest", () => {
    const charter = freezeRendererQualificationCharter(
      buildFixtureContestInput(),
    );
    const manifest = buildRendererQualificationManifest(charter);
    const {
      schema_version,
      serializer_version,
      manifest_digest,
      ...frozenFields
    } = charter;

    expect(serializer_version).toBe(RENDERER_QUALIFICATION_SERIALIZER_VERSION);
    expect(manifest.serializer_version).toBe(
      RENDERER_QUALIFICATION_SERIALIZER_VERSION,
    );
    expect(manifest_digest).toBe(
      digestQualificationValue({
        schema_version,
        serializer_version,
        charter: frozenFields,
      }),
    );
  });

  it("rejects an unsupported serializer version before verification", () => {
    const charter = malformedCharter((draft) => {
      draft.serializer_version = "999";
    });

    const result = verifyRendererQualificationCharter(charter);
    expect(result.valid).toBe(false);
    expect(result.failures.map((failure) => failure.code)).toContain(
      "serializer_version_unsupported",
    );
  });

  it("does not project a manifest from a charter that fails verification", () => {
    const charter = malformedCharter((draft) => {
      draft.charter_id = "tampered-charter-id";
    });

    expect(verifyRendererQualificationCharter(charter).valid).toBe(false);
    expect(() => buildRendererQualificationManifest(charter)).toThrow(
      /cannot be built from an invalid charter/i,
    );
  });
});
