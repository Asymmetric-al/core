# Implementation tasks

## 1. Durable capability contract

- [x] 1.1 Define Eve as a governed autonomous operations capability before
      runtime implementation.
- [x] 1.2 Specify authority, execution identity, protected-area and production
      write limits, governance ownership, rollout, and verification behavior.
- [x] 1.3 Reconcile the capability with the canonical platform principles,
      instruction system, and Eve PRD.

## 2. Architecture decision

- [x] 2.1 Publish the accepted autonomy decision as
      `docs/adr/0018-governed-eve-autonomy.md`.
- [x] 2.2 Record work initiation, autonomous PR operation, strict auto-merge,
      production-write policy, identity, and governance guardrails.
- [x] 2.3 Document canonical ADR numbering so active OpenSpec designs do not
      reserve or collide with platform ADR numbers.

## 3. Rollout and verification

- [x] 3.1 Keep one app-owned release gate disabled by default through the
      phased #418–#437 implementation sequence.
- [x] 3.2 Require #437 launch verification and an authorized human action before
      activation.
- [x] 3.3 Define per-slice and final-launch verification outcomes.

## 4. Completion

- [x] 4.1 Validate this change strictly.
- [x] 4.2 Promote the accepted delta into
      `openspec/specs/eve-autonomous-operations/spec.md`.
- [x] 4.3 Update active downstream Eve changes to cite the durable spec and
      canonical ADR-0018.
