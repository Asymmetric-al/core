# ADR-IM-009: Carry consent evidence across, with restrictions first

**Status:** Accepted 2026-11-02. Ratified by the founder in the Phase 30 grill (Q9).

- **Record:** `docs/features/imports-migration/grill/decision-log.md` §1 Q9.
- **Evidence and review:** `grill/q09-legacy-consent/` (research r1–r4, `q09-adversarial-review.md`).
- **Amends:** ADR-IM-001 (email lists, the "only writer" of consent, the pending-in-legacy list), ADR-IM-003 (consent columns) and ADR-IM-008 (deceased donors' legacy gifts).
- **Phase 28 newsletter adoption exception:** included, ruled by the founder as Phase 28 owner.

## Context

**What Asym has today.**

- **Opt-outs only.** Asym records only opt-outs (Phase 3).
- **Positive permission** exists only as:
  - a Phase 28 newsletter Join;
  - Phase 25 "owner-qualified prior permission";
  - SMS evidence for an exact number.
- **No place for other restrictions.** `email_suppressions` holds email blocks only, one unsubscribe per address. Nothing holds do-not-solicit, do-not-mail, do-not-call or deceased.

**What Phase 30 said before.**

- Q3 called imported consent columns "evidence only, never consent".
- Phase 25 R07 C10 (ratified) allows "semantically mapped, evidence-backed" adoption.

**What the law and industry practice show.**

- **Opt-outs and per-address proof.** US and Canadian law require opt-outs to be honoured within 10 business days. CASL s.13 and GDPR Art. 7(1) put proof of consent on the sender.
- **Canadian implied consent.** It runs 2 years from a gift, but only for registered charities (CASL s.10(13)(a)).
- **Asking by email.** An email asking for consent is itself marketing (ICO Flybe and Honda, 2017; CASL s.1(3)).
- **Migration failures.** Enforcement cases (Conservative Party, Reed, Porter Airlines) trace back to blocks lost when changing email platforms.
- **Mailbox providers.** Gmail and Yahoo expect unsubscribes honoured within 2 days and spam complaints below 0.1%.

**What the repo shows.**

- **No organization newsletter target.** Asym has none until Phase 32.
- **A sender that bypasses any hold.** A Phase 28 newsletter sender (#2117) is Ready and admits anyone with a membership.
- **Shared domain.** Optional mail and receipts share one sending domain.

## Decision

1. **Restrictions first.** Every restriction from the old system and the ministry's email tool commits before any permission, scoped by what the signal means:

   | Signal                        | What it blocks |
   | ----------------------------- | -------------- |
   | Do-not-contact, erasure       | The person     |
   | Do-not-solicit                | Appeals only   |
   | Email opt-out, complaint      | Optional email |
   | Unsubscribe from a named list | That list      |
   | Hard bounce or cleaned        | That address   |
   | Do-not-mail, do-not-call      | Post, phone    |
   - The stricter value always wins.
   - A blank grants nothing.
   - Only the person's own later action lifts a restriction.

2. **One disposition per list.** Each email list moves to Asym, stays in the ministry's email tool, or retires; it is never sent from both.
   - **Kept lists** exchange restrictions restrict-only: Asym opt-outs are applied there within 2 days, and the tool's unsubscribes come back at least every 4 weeks.
   - **Organization-wide lists** are kept or retired until Phase 32.
3. **Moved lists carry permissions only with evidence.**
   - **Who qualifies:** people on a list sent to within 12 months whose evidence meets their rule.
   - **US donors, and Canadian donors of registered charities:** list membership with its source is enough.
   - **UK/EU donors, and Canadian donors of non-registered ministries:** a dated opt-in record is required.
   - **What travels:** each adopted permission keeps its evidence and the Switch lead's attestation. The attestation never replaces the evidence.
   - **No requests:** nobody is emailed to ask for permission.
   - **No SMS:** no SMS permission carries over in v1.
4. **Missionary newsletters the ministry ran carry over the same way.**
   - They are labelled "Joined in {previous system}".
   - They send no confirmation.
   - Messages name "{missionary} on behalf of {ministry}".
5. **Adopted permissions start on hold.** They stay held until the purpose × channel check (#680) and every optional sender honour the hold. Sending then needs:
   - a separate subdomain;
   - a permission-reminder line in the first send;
   - warm-up with recent givers first;
   - one-click unsubscribe;
   - an automatic pause at 3% bounces or 0.1% complaints.
6. **Deceased** blocks the person as a recipient everywhere.
   - Their documents are held for the estate.
   - Their legacy gift goes on Q8's To-cancel list.
   - The record is never deleted or merged.
7. **Gates.** No Switch is scheduled without scoped restriction import (O41). Lists move only once adoption (O42, O43) is live; until then lists are kept or retired, so adoption never blocks a Switch.

## Considered options

- **Unsubscribes only, with everyone re-confirming (A).** Rejected:
  - re-permission loses most of a list;
  - the request email is itself unlawful for people without consent.
- **Trust the old system's flags (C).** Rejected:
  - there is no per-address proof;
  - it breaks C10.
- **"All channels if unknown," an emailed re-confirmation, and the CASL gift rule for every Canadian ministry.** Rejected respectively because they:
  - stop receipts;
  - break PECR and CASL;
  - misread s.10(13)(a).

## Consequences

**Owner requirements.**

- O41: scoped restriction import (Phase 3/6/12).
- O42: adopted permissions with basis, evidence and hold (#680).
- O43: the Phase 28 newsletter adoption exception, with #2117 honouring holds.
- O44: deceased lifecycle status (Phase 9).
- O45: optional-mail subdomain, warm-up, "on behalf of" naming and 2-day unsubscribe (Phase 17).
- O46: a home for organization-wide lists (Phase 32).

**Discrepancies.**

- D30: Phase 6 A9 versus #2351 on where imported blocks land.
- D31: #680's body is stale.

**Learning signal.** Retention of each moved list at 90 days is measured at the first switch.

**Counsel.** Counsel confirms:

- UK/EU reach;
- CASL "on behalf of" for missionaries;
- the position of non-registered Canadian ministries;
- Québec P-39.1;
- receipts after death;
- record retention.
