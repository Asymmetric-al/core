<!-- Partner DRAFT for GitHub issue #419. Task list for the `add-eve-audit-tracer-bullet` OpenSpec change;
enters `Asymmetric-al/core` only via Asymmetric's OpenSpec workflow after sign-off. Acceptance and scope
grounded in [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md] and
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]. -->

## 1. Define the audit-tracer OpenSpec contract

- [ ] 1.1 Add the `eve-audit-tracer` capability via this change's spec delta
      (`specs/eve-audit-tracer/spec.md`), building on #417 and #418 without restating them
- [ ] 1.2 State the five requirements as spec: rich audit record with the required fields; accountable
      identity from verified context; redacted replay/debug package that never stores unsafe raw data;
      admin-inspectable audit history + high-quality decision summary; record-only, grants no new authority
- [ ] 1.3 Validate: `bunx @fission-ai/openspec@latest validate add-eve-audit-tracer-bullet --strict`

## 2. Record the provisional Eve design decision EVE-DESIGN-0003 (audit tracer bullet)

- [ ] 2.1 Author the decision under provisional Eve design label EVE-DESIGN-0003 in this change's `design.md`, traceable from ADR-0018 (#417) and EVE-DESIGN-0002 (#418)
- [ ] 2.2 At implementation time, promote the accepted decision into `docs/adr/` using the next available canonical number, then update all references.
- [ ] 2.3 Cross-link the resulting canonical ADR from the parent PRD and issue #419

## 3. Pin the audit-record field contract

- [ ] 3.1 State the required record fields at spec level: actor, initiator, identity mode, policy, action,
      target, result, model-role placeholder, evidence summary
- [ ] 3.2 State that the record must reconstruct who/what initiated, which tool or subagent ran, which model
      role and policy applied, what evidence was used, and what changed (US-32)
- [ ] 3.3 State that every field is written from verified app-owned context, never from prompt/model/tool
      claims, and that audit writes go to the governance store #418 governs

## 4. Pin identity, redaction, and decision-summary contracts

- [ ] 4.1 State the accountable-identity rules: admin identity for admin actions (US-6); service identity +
      initiator metadata for background jobs (US-7); bot actor + accountable human/trigger for GitHub actions
      (US-8); identity mode matches the #417 auth boundary and is not prompt/tool-selectable
- [ ] 4.2 State the redacted replay/debug package: metadata + redacted evidence summary only; never payment
      data, secrets, one-time codes, tenant PII, or raw model reasoning (US-33)
- [ ] 4.3 Require that redaction rules are represented in tests (implementation-plan acceptance)
- [ ] 4.4 State the decision-summary contract: high-quality summary of why Eve acted, no raw model reasoning
      or sensitive internals; audit history inspectable by an authorized admin (US-34)

## 5. Draw the boundaries with adjacent slices

- [ ] 5.1 State that #419 defines the audit-record and redacted-package **shape**; #424 owns retention,
      expiry, category overrides, and incident/legal holds for audit records and replay/debug artifacts
- [ ] 5.2 State that #418 owns the governance state/gate; #419 adds only the record that gated actions emit
- [ ] 5.3 State that #417 owns identity resolution, tenant isolation, and protected areas; #419 records the
      already-resolved identity mode, it does not define identity resolution

## 6. Acceptance checks (HITL)

- [ ] 6.1 Maintainer review of the audit-record field contract, redaction rules, and the no-new-authority
      boundary
- [ ] 6.2 Confirm the tracer proves one safe Eve-like action creates a rich audit record + redacted debug
      package metadata, with redaction rules represented in tests
- [ ] 6.3 Confirm no Supabase schema, admin UI, retention machinery, or runtime code is included in this
      change
- [ ] 6.4 Confirm the change is subordinate to #417, #418, OpenSpec, `AGENTS.md`, `docs/ai/*`, and existing
      CI gates
- [ ] 6.5 Human sign-off before the change is opened as a PR against `Asymmetric-al/core:develop`
