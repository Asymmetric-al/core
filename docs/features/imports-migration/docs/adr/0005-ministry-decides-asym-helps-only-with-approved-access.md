# ADR-IM-005: The ministry decides every switch step; Asym helps hands-on only through ministry-approved access

**Status:** Accepted 2026-11-02 — ratified by the founder in the Phase 30 grill (Q5). Record: `docs/features/imports-migration/grill/decision-log.md` §1 Q5; evidence and acceptance criteria `grill/q05-switch-operator/` (`q05-adversarial-review.md`). Amends ADR-IM-002's Approved-environment check (Q2 clause 6). Amended by ADR-IM-006 (2026-11-02, Practice runs and Practice copies). Amended by ADR-IM-019 (2026-11-04, Switch-lead notices delivered through Phase 17 staff notifications, needed before the first Switch). Amended by ADR-IM-020 (2026-11-04, Run the Switch is the Switch decision permission; narrowing needs it plus clearance; helper grants end-dated; Asym help sees only the Switch tab).

## Context

Q1–Q4 put every switch decision on the ministry, but nobody was named to do the work. Mid-market donor CRMs convert data with their own staff; low-cost tools are self-serve; no published data shows self-serve success rates. Phase 12 ratifies exactly one way for platform staff to act inside a tenant, an audited, purpose-bound, time-boxed Operator Tenant Grant, and says support, impersonation, `super_admin` and service role create no shortcut (Phase 12 `:483-487`, `:1552-1555`). None of it is built: today every staff subrole is a full Mission Control admin (`packages/auth/permissions.ts:38`), only an Asym-side role approves permission widenings (`packages/auth/capabilities/bundles.ts:92-93`), `super_admin` reads across tenants in RLS, and the open draft #2281 would give operators session-length, Asym-chosen access the ministry cannot see. Q2 classifies real exports as restricted by default.

## Decision

Every switch decision is made by a ministry member holding that decision's capability; a **Switch lead** designation (reassignable, grants nothing) receives notices and is accountable. One person may hold every capability; no Asym identity can decide. A ministry can complete a whole switch without Asym access; Asym's default help is coaching on the ministry's own screen with no recording, AI notes, remote control or file exchange. Helpers are ordinary members with preparation capabilities that end at Switch closed, added only once ministries can grant scoped, expiring access (O27). One restricted-data floor applies to everyone not cleared, helpers and Asym alike: content stays restricted until a cleared ministry member narrows it; source files enter only through a ministry member's upload. Asym hands-on help ("Asym help access", the Operator Tenant Grant for `switch_preparation`) is requested by a named, MFA-protected specialist for one Switch, approved by one eligible ministry member (no Asym path can approve or create that approver), lasts 7, 14 or 30 days or until Switch closed or revocation, covers preparation only, pauses running jobs when it ends, and attributes every action "{name} · Asym". Incident and legal access is a separate, logged, disclosed path; before the first real export, a live read-back confirms no `super_admin` or role-string escape on person, money, file or import tables. Asym monitors only through content-free telemetry; its relationship owner owns the Q3 and Q4 monitors with the Switch lead.

## Considered options

- **Ministry-only with coaching (A):** kept as the baseline, but rejected as the whole answer; once access is safe, hands-on help is the market norm and speeds the design partner.
- **Asym migration service (B):** rejected; needs an unbuilt operator plane, broad access to restricted data and staff Asym does not have.
- **Certified partners (D):** rejected for v1; no ecosystem exists.

## Consequences

- Owner requirements O26 (Operator Tenant Grant terms, agreed before #2281 merges) and O27 (ministry-administered scoped, expiring capabilities) on Phase 12; Phase 10 aliases must cover staged import content; F7 defines the capability map and narrowing step.
- The design partner's switch is planned on coaching alone; nothing is described as self-serve until a switch goes live with coaching only.
- Specialist hours become the scaling limit (monitor M-Q5-1).
