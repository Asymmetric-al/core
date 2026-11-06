# ADR-IM-010: People first, households only from evidence

**Status:** Accepted 2026-11-02 — ratified by the founder in the Phase 30 grill (Q10). Record: `docs/features/imports-migration/grill/decision-log.md` §1 Q10; evidence `grill/q10-households/` (research r1–r2, `q10-adversarial-review.md`). Refines the Phase 30 glossary term Source Record Binding with a role.

## Context

**Ratified owner model:**

- Every person is a distinct Party with their own principal (P4, P9).
- A household is a grouping Party that never owns a gift, and a person belongs to zero or one active household (P7, #570).
- Each gift has exactly one legal donor. Statements go to each legal donor; nothing is combined by household (P7, P19).
- No merge is ever automatic (ADR-0216).

**What is installed:**

- One donor per email per tenant (`donors_tenant_email_normalized_uidx`). That email is also the claim key and the login (ADR-0214).
- The guest-gift matcher attaches a gift on any exact email (`donor-match.ts:117-125`).
- The duplicate scorer rates a shared email plus a shared phone as "high" (`duplicates.ts:58-95`).

**SiteStacker:**

- It stores one person per record, with a unique email.
- Households exist only as person columns, and every single person gets a household of one.
- Spouses are a relationship type; organizations are Groups. Groups also serve as committees.

**Vendors:**

- NPSP, Little Green Light, Planning Center, Bloomerang and Givebutter keep one person per record, with households grouping them.
- Their importers use explicit Person 1 / Person 2 or Household ID columns and never parse names.
- They match on source ID first, then email plus first name.

## Decision

1. **Couples, households and combined names**
   - Every source person becomes one Asym person.
   - Households and spouse links come only from explicit evidence: a shared source household ID, a source spouse relationship, or template Person 2, Household ID and relationship columns. Households of one are not created.
   - Imported household membership starts before the Switch Boundary with the date unknown. The head is the primary for mail and display only.
   - Combined names are flagged "may be two people" and never split by Asym. The ministry fixes them at the source, or staff rename the record and add the spouse after the switch.
2. **One email, one holder**
   - The holder is chosen in this order: the record the source tied the address to; the payer of an active legacy recurring gift; the source's primary person; the reviewer.
   - The other person is shown as sharing the mailbox, keeps the address as evidence, and is asked for their own address later.
   - Placeholder addresses become blank.
3. **Legal donors and organizations**
   - The source's gift owner stays the legal donor. Household-level template gifts use one ministry-chosen rule, primary person by default. Asym never creates a joint donor.
   - A Group becomes an organization only if it has gifts or the ministry marks it. The organization holds its gifts and links its contact person.
4. **Matching and bindings**
   - Matching uses source IDs first, then email plus first name. A shared-mailbox marker always sends the match to review. Same-household pairs are shown as likely spouses.
   - One source row binds several records by role.
5. **Gate:** no Switch is scheduled until Phase 4's matching fix (O47) is live.

## Considered options

- **The household is the donor (B).** Rejected. It contradicts the owner model and CRA's true-donor rule.
- **Automatic splitting and grouping (C).** Rejected. Name parsing loses surnames, and households built from shared addresses join roommates, adult children and ex-spouses.
- **Splitting names during import, holding children under Phase 10, and allowing shared emails now.** Rejected:
  - Splitting needs per-row judgement, and the gift owner is unknown.
  - Phase 10 has no rule for minors.
  - Shared emails conflict with the installed key, so the question is left to O48.

## Consequences

- **Owner requirements:**
  - **O47 (Phase 4):** email plus first-name matching, and spouses are not flagged as duplicates. This is a Switch gate.
  - **O48 (Phase 4/9):** shared contact emails and additional emails and phones.
  - **O49 (Phase 9/14):** imported household membership dates.
- **Discrepancy D32:** the installed email index counts merged donors.
- **Practice runs** show households, spouse links, organizations, shared mailboxes, combined names, placeholders and odd households, so the ministry fixes data at the source.
