# Support Hub — Phase 26 documentation

The [published specification, AL-1656](https://github.com/Asymmetric-al/core/issues/1656), records all forty ratified decisions and amendments. This directory preserves the decision history; the formal package below is the current implementation contract. Specification readiness does not mean the feature has shipped.

## Current implementation contract

- [User stories, implementation and testing](../../prds/sitestacker-parity/phase-26-support-hub-conversation-management.md)
- [Current consolidated glossary](../../prds/sitestacker-parity/phase-26-support-hub-glossary.md)
- [Requirements A — D1–D13](../../prds/sitestacker-parity/phase-26-support-hub-requirements-a.md), [B — D14–D26](../../prds/sitestacker-parity/phase-26-support-hub-requirements-b.md), [C — D27–D40](../../prds/sitestacker-parity/phase-26-support-hub-requirements-c.md)
- [Complete source traceability](../../prds/sitestacker-parity/phase-26-support-hub-traceability.md) and [machine register](../../prds/sitestacker-parity/phase-26-support-hub-traceability.json)
- [OpenSpec proposal](../../../openspec/changes/add-support-hub-conversation-management/proposal.md), [design](../../../openspec/changes/add-support-hub-conversation-management/design.md), [observable requirements](../../../openspec/changes/add-support-hub-conversation-management/specs/support-hub/spec.md), and [future tasks](../../../openspec/changes/add-support-hub-conversation-management/tasks.md)
- [Publication evidence and proof limits](../../prds/sitestacker-parity/phase-26-support-hub-evidence.md)

## Decision history and authority

The [feature ADRs](docs/adr/), [original feature glossary](CONTEXT.md), and [grill records](grill/) retain their recorded chronology, including questions and alternatives that were later resolved. Earlier pending-stage or no-publication statements are historical. The current contract incorporates D27-C, D29-X01 and every accepted correction; it neither reopens those choices nor promotes historical evidence into shipped behavior.

Email Studio/P17 owns governed content, canonical authoring and whole-message preparation; P6 owns actual communication and recovery. Support, canonical intake and native CRM retain their distinct owners and permission boundaries. The formal requirements define these seams in full.

The [September 15 issue-publication record](phase26-spec-publication.md) describes that completed event. Its statements about no source commit/PR are dated evidence, not a restriction on this separately authorized documentation PR. Original-capture hashes in traceability identify the evidence as captured. The PR provenance record maps repository formatting to those original captures and the published issue without claiming product runtime proof.

## Historical model artifacts

The three Python reference-model files in `grill/` preserve finite, synthetic experiments from the recorded review. They are not application code, an integration test suite, or evidence that runtime behavior passed. They use their original output paths; D29 and D35 can overwrite adjacent captured JSON, and D34 retains an old workspace output path. Inspect or reproduce them in a separate scratch copy, not in the evidence directory. They are not registered with Core's CI or release tests. Their exact captured bytes remain part of the provenance record.

The two `.ts.txt` probe sources in the same archive are read-only historical evidence with original import/output locations, not runnable repository tests. They are linked from their original reviews and retain the source bytes for inspection.
