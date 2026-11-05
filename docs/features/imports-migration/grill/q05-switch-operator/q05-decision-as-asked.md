# Q5 — Who runs a switch: decision as asked and chosen

Founder answer (2026-11-02): **"C. Ministry owns it; Asym may help hands-on with permission."** The founder then required a full adversarial review before recording (standard: not over-engineered, fully functional).

## Question as asked

Should a switch be ministry-owned and Asym-assisted (C), with the eight parts below? Alternatives: **A** ministry runs it and Asym only coaches (no data access); **B** Asym runs it end to end as a migration service (ministry signs off); **D** certified partners.

## Option C as proposed (eight parts)

1. **The ministry owns the switch.** A named ministry admin, the **Switch owner**, makes every decision: go/no-go, dispositions, attestations, reconciliation sign-off, committing money, decommission. Nobody outside the ministry can do these, including Asym. Data accuracy is the ministry's responsibility.
2. **Helpers are ordinary named members.** Ministry staff, or a volunteer or consultant the ministry adds to its account with a preparation-only role, may do the hands-on work (upload, mapping, practice runs, issue triage).
3. **Asym helps hands-on only through the ratified Operator Tenant Grant:** approved by a ministry admin; limited to one switch's preparation steps; ends at go-live or sooner after a period the ministry chooses (up to 30 days, renewable); revocable at any time; every action recorded under a distinct "Asym specialist" identity the ministry can see. Never through super_admin, a borrowed login, or a ministry membership.
4. **An Asym specialist can never:** commit, attest, sign off, send anything, change consent, download raw files, or see restricted missionary identities except as aliases. If a match needs the real identity, the ministry does that step.
5. **First switches:** the design partner's switch is Asym-assisted; if the grant is not built in time, Asym coaches in guided sessions while the ministry works. Once a profile is Supported, later switches are self-serve with optional help. The specialist logs where each switch needed help (feeds Q3's template-path monitor).
6. **What help covers:** mapping, practice runs, issue triage. Duplicate cleanup and contacting recurring donors stay with the ministry, using Asym's tools. Pricing and included hours are commercial terms outside discovery.
7. **No partner programme in v1.** Outside helpers are members the ministry invited.
8. **Q4's monitor M2** is owned by the Switch owner, with an Asym contact checking in after tax season (no data access needed).

Proposed new owner requirement **O26 (Phase 12):** grant approval by a ministry admin; "switch preparation" purpose and scope; expiry and revocation; distinct operator identity in audit and run records. Prerequisites named: remove the super_admin RLS shortcut (#668, #2295) before any Asym access to real data; background jobs must carry the initiating actor (#2311); Q2's data-processing terms must name Asym's possible access; Data Tools separates "prepare" from "decide" permissions (detail stays with F7).

## Context

- Ratified Q1–Q4: `grill/decision-log.md` §1; glossary `docs/features/imports-migration/CONTEXT.md`; ADRs `docs/features/imports-migration/docs/adr/0001-0004`.
- Research: `research/q05-r1-repo-operator-access.md` (Phase 12 Operator Tenant Grant ratified as a principal class but unbuilt and underspecified; super_admin cross-tenant RLS live today; no Data Tools capabilities; audit logs lack principal type; background jobs carry no actor), `research/q05-r2-external-operator-models.md` (mid-market vendors convert with their own staff; Lockbox/Access Approval pattern; customers own data accuracy).
