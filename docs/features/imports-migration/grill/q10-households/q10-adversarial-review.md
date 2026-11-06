# Q10 — Households, couples, shared emails and organizations: adversarial check of Option A

Founder answer (2026-11-02): **"A. People first, households only from evidence."** Decision as asked: `q10-decision-as-asked.md`.

**Evidence.**

- **Research:** `research/q10-r1-repo-households.md` (Asym owner model, email keys, legal donor, statements, SiteStacker household shape) and `research/q10-r2-external-households.md` (CRM household models, import patterns, shared emails, IRS and CRA naming, organizations, failure modes).
- **Re-verified directly on 2026-11-02:**
  - `donors_tenant_email_normalized_uidx` on `(tenant_id, email_normalized) WHERE email_normalized IS NOT NULL` (`supabase/migrations/20261024140000_identity_email_normalizer_and_donor_keys.sql:162-164`).
  - The guest-gift matcher attaches on any exact email match. Its guard "two+ records carry the same exact email" (`packages/api/src/public-giving/donor-match.ts:117-125`) cannot fire under that index.
  - The scorer gives email 70 plus phone 20, which reaches `high`/`link_candidate` (`packages/api/src/crm/mapping/duplicates.ts:58-95`).
  - Email normalization does not strip plus-tags (`docs/security/identity-email-normalization.md:23-24`).
  - Phase 10 (`phase-10-sensitive-data-safety.md`) has no rule for minors. It governs worker security levels and the publication firewall (C17).

**Disposition: accept with required amendments.** A is the industry pattern (NPSP, Little Green Light, Planning Center, Bloomerang, Givebutter). It also matches the ratified owner model: separate Parties, a household as a grouping that never owns a gift (#570), one legal donor per gift (P7), and statements per legal donor (P19). The check found six gaps: four would have hurt real couples or money truth, and two corrected the research.

## 1. Adversarial check

### What could go wrong

1. **A spouse's gift is recorded as the other spouse's, permanently.**
   - **Mechanism:** after a switch, the non-holder spouse who gives with the shared email is matched by email alone to the holder. The legal donor is frozen at acceptance and never changes on merge (C:1636-1640), so the wrong receipt and the wrong tax record stand. The matcher's own two-records guard can never fire, because the index allows only one row per email.
   - **Fix:** O47 (email needs first-name agreement, and a shared-mailbox marker always sends the match to review) is a Switch gate.
2. **Q8 can't reach the person who pays.** Q8 sends each move invitation to the payer of the legacy gift. If the shared address went to the other spouse, the payer would fall onto the mail-or-call list even though they read that mailbox.
   - **Fix:** the holder order puts the payer of an active legacy recurring gift second, right after "the record the source tied it to".
   - SiteStacker emails are already unique per person, so this bites mainly on template sources.
3. **Household totals look empty for history.** Phase 14 evaluates household recognition "against the gift date" using time-bounded membership (P14:1164-1180). A membership starting on the import date would show no household giving for any historic gift. Staff would see couples' combined history vanish, even though SiteStacker statements were per household.
   - **Fix:** imported membership starts "before the Switch Boundary, date unknown" (O49).
4. **A shared address is lost.** Under "one holder", the other spouse's copy of a real, deliverable address is dropped, so a later contact-points model can't restore it.
   - **Fix:** keep it as evidence and add it as a contact email once Phase 4/9 allow two people to share one (O48).
5. **Groups aren't organizations.** SiteStacker Groups include committees and teams (r07:105). Turning every Group into an organization Party creates fake donors.
   - **Fix:** a Group becomes an organization only if it has gifts or the ministry marks it as one. Others are listed for the ministry to classify.
6. **Combined-name records get stuck.** Phase 4/9 have merge but no "split". If the ministry doesn't fix a combined row at the source, staff need a way forward after the switch.
   - **Fix:** rename the person and add the spouse; the gifts stay with the original record, which is the true payer in most cases. Flags never block a Switch.
7. **Messy SiteStacker households:** no head or two heads, members at different addresses, adult children, ex-spouses.
   - **Fix:** create the household without a primary when the head is unclear, and list odd households in practice runs.
   - Membership can be ended later. No household is inferred, so roommates are never grouped by address.
8. **Placeholder and alias emails.**
   - **Placeholders** (`none@…`, the ministry's own address used as filler) must never become contact data, so they are blanked and listed.
   - **Aliases** (`john+mary@…`) are distinct deliverable addresses, since normalization keeps plus-tags. They stay with the record the source tied them to.

### Hidden assumptions

- **"People marked as children are held for review under Phase 10."** No owner basis: Phase 10 has no rule for minors. **Corrected:** children import as people like anyone else, with no new age rule. Restricted-tier workers' family links follow Phase 10 and C17. If the founder wants a minors rule, that is a separate owner question.
- **"SiteStacker exports spouse relationships."** Undocumented: only the Relationship Report is known (r1:189). Households still build from `household_id`, and missing spouse links show in practice runs.
- **"Person 1 / Person 2 means spouses."** Not always: it could be a parent and child, or partners. **Corrected:** the template adds a relationship column (spouse, partner or other). A spouse link is created only when the row says so.
- **"Imported legal donors affect receipts."** Mostly not. Imported gifts are Recorded outside Asym (Q4), so their legal donor drives history, Q8's payer and the "first gift" and "lapsed" signals, not receipts. The joint-name receipt risk applies only to future Asym gifts made by an unfixed combined record.

### Whole product

- **Q8:** the payer gets the move email (fix 2).
- **Q9:** a block on a shared mailbox lands on the holder. Under one-holder this is the same as address-level, so Q9 needs no change. A non-holder's person-level flags (such as do-not-contact) stay on that person.
- **Q4:** SiteStacker statements were per household and Asym's are per legal donor. Q4's "different total" sentence already covers this.
- **Phase 28 missionaries** see household grouping ("John & Mary Smith household") in their supporter view. That is a Phase 9 family panel, built from links this decision creates.
- **Phase 4 owns the post-switch duplicate queue.** Industry figures suggest 10–18% of records are duplicate candidates (thin evidence), so it must support bulk review. Same-household pairs never appear as duplicates.

### End-user experience

- **Donor couple:**
  - Both appear as separate people in one household. The spouse whose address it is gets emails as before.
  - The other spouse gets no email from Asym until they give their own address. They are asked when they next give or sign in. Postal statements and receipts for their own gifts still reach them.
  - Neither can claim the other's account (P4:491-493).
- **Ministry (Switch lead):** practice runs show, with examples:
  - counts of people, households, spouse links, organizations and contact links;
  - shared-mailbox pairs and which person holds the address;
  - flagged combined names;
  - blanked placeholders and odd households.

  Fixes happen in the old system before the final export. Nothing here blocks the Switch except unresolved shared-email holders, which the order resolves automatically.

- **Staff after the switch:**
  - A combined record is fixed by renaming it and adding the spouse.
  - Duplicates go to Phase 4's queue.
  - Each person shows "shares a mailbox with {name}" and any other emails from the old system.

### Modern best practice

| Part                                            | Verdict                                                                                                                                                                                                                                                                                    | Evidence                                                                                                               |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| People first; households from explicit evidence | **Matches**                                                                                                                                                                                                                                                                                | Bloomerang, Givebutter, Planning Center; NPSP/Nonprofit Cloud members; address-built households join roommates (r2 §6) |
| Never auto-split names                          | **Matches**                                                                                                                                                                                                                                                                                | CiviCRM/Wikimedia surname loss; no major importer splits names; NPSP Contact1/Contact2 and LGL #1/#2 columns           |
| One email holder                                | **Deviates by necessity.** CRMs allow a shared email on two records with a warning, but Asym's claim and login key is unique (ADR-0214; `donors` index). **Mitigated:** evidence is kept for a later contact point (O48), and portals keyed by email (DonorView, Stripe) work the same way | r2 §3                                                                                                                  |
| One hard-credit donor; spouse recognised        | **Matches**                                                                                                                                                                                                                                                                                | NPSP, LGL, Raiser's Edge, Bloomerang; CRA "true donor"                                                                 |
| Organizations hold gifts; contacts recognised   | **Matches**                                                                                                                                                                                                                                                                                | NPSP Account1; Virtuous; CRA business true donor                                                                       |
| Source ID first; email plus first name          | **Matches**                                                                                                                                                                                                                                                                                | LGL, NPSP, Planning Center                                                                                             |

### Repo fit

- **Supports:**
  - P9:330-338, :834 (Party kinds; spouse edge);
  - P7:236 (household a grouping, not an account);
  - #570 (zero or one active household; never a gift's donor);
  - P16:1182 (household commitments only with explicit intent);
  - `statement-operations.md:26-35` (no combined household statements);
  - P4:491-493 (distinct principals);
  - P28rel:385 ("Do not split couples");
  - ADR-0216 and C2.
- **Conflicts and gaps:**
  - The installed matcher and scorer (O47).
  - The installed email index counts merged donors, while P4:268 intended to exclude them (D32).
  - "Source-proved joint donor" is undefined (P7:46-49). Phase 30 never creates one.
  - No contact-points model exists yet (O48).
  - Imported household membership dates (O49).
- **Phase 30's own change:** the glossary term Source Record Binding gains a role (person 1, person 2, household, organization, contact), and a source household binds as its own record family.

### Adjusted recommendation

Keep A, amended as in §2. ★ marks changes from the decision as asked.

## 2. Corrected decision text

**Q10 — Households, couples, shared emails and organizations.** Option A, amended.

1. **People first.**
   - Every source person becomes one Asym person. No record is split, merged or grouped by inference.
   - Households and spouse links are built only from explicit source evidence:
     - a source household ID shared by two or more people;
     - a source spouse relationship;
     - the template's Person 2 or Household ID columns.
   - A shared address, email or surname only ever produces a suggestion.
   - Households of one are not created.
2. **Households.**
   - An imported household takes the source household name as its display name. The source head becomes its primary for mail and display only, never the legal donor.
   - A household with no head or two heads is created without a primary and listed for staff.
   - ★ Imported membership is recorded as starting before the Switch Boundary with the date unknown, so historic gifts show household recognition.
3. **Combined names are never split by Asym.**
   - A name such as "John & Mary Smith" in one name field imports as one person flagged "may be two people". Flags never block a Switch.
   - Practice runs list these records so the ministry can fix them in the old system before the final export.
   - ★ After the switch, staff fix one by renaming the person and adding the spouse; the gifts stay with the original record.
   - ★ The template offers Person 1 and Person 2 columns, plus a relationship column (spouse, partner or other). A spouse link is created only when the row says so.
4. **One email, one holder.** Asym allows each email on one person. When two source people share an address, it goes to the first of these that applies:
   - the person the source recorded it on;
   - ★ the payer of an active legacy recurring gift, so Q8 can reach them;
   - the source's primary person;
   - the reviewer's pick.

   **The other person:**
   - imports without that email;
   - is shown as "shares a mailbox with {name}";
   - is asked for their own address when they next give or sign in;
   - ★ has the shared address kept as evidence, added as their contact email once Phase 4/9 allow two people to share one (O48).

   **Other rules:**
   - Recognised placeholder addresses become blank and are listed.
   - A block on a shared mailbox applies to whoever holds it.

5. **One legal donor per gift.**
   - The source's gift owner stays the legal donor. Asym never re-attributes imported gifts.
   - Where a template source records gifts per household, the ministry chooses one rule at mapping: the household's primary person (the default) or "review each". Those rows wait until it does.
   - Phase 30 never creates a joint donor; the spouse is recognised through the household.
6. **Organizations.**
   - ★ A source group becomes an organization only if it has gifts or the ministry marks it as one. Other groups, such as committees and teams, are listed for the ministry to classify.
   - An organization and its contact person become an organization record, a person record and a contact link. The organization holds its gifts.
   - Organizations never join households.
   - When an organization and a person share an email, the person holds it unless the source recorded it only on the organization.
7. **Matching.**
   - Source IDs come first. An email match also needs the first name to agree, and a shared-mailbox marker always sends the match to review.
   - People in the same household are shown as "likely spouses", not duplicates.
   - Duplicates within a file are listed before commit. Real duplicates import as separate people and go to Phase 4's duplicate queue after commit, with no automatic merge.
8. **Bindings and evidence.**
   - One source row may bind to several Asym records by role: person 1, person 2, household, organization or contact. A source household binds as its own record family.
   - Additional emails and phones are kept as source evidence on the person until Asym has a place for them (O48).
   - ★ Household members recorded as children import as people like anyone else, and Phase 30 adds no age rule. Restricted-tier workers' family links follow Phase 10 (C17).
9. **Practice runs show** people, households, spouse links, organizations, contact links, shared-mailbox pairs and their holders, flagged combined names, blanked placeholders and odd households. The ministry fixes data at the source before the final export.
10. ★ **Gate.** No Switch is scheduled until O47 is live. Otherwise the first spouse to give in Asym with a shared email may be recorded, permanently, as the wrong legal donor.

**Acceptance criteria**

- AC1. Two SiteStacker people with one `household_id` produce one household with both as members. A household of one produces none.
- AC2. A source Spouse relationship produces one spouse link. No link is ever created from a shared address, email or surname.
- AC3. "John & Mary Smith" in one name field imports as one person flagged "may be two people", and the Switch is not blocked.
- AC4. Two template rows sharing an email: the holder follows the clause 4 order, the other imports without it and carries the marker plus the evidence, and no commit fails on the email index.
- AC5. The payer of an active legacy recurring gift holds the shared address and receives the Q8 invitation.
- AC6. A gift given in Asym with a shared address but the non-holder's first name goes to review, never attached.
- AC7. Same-household pairs never appear as duplicates. Within-file duplicates are listed before commit.
- AC8. A Group without gifts is listed for classification, not created as an organization.
- AC9. Household recognition for an imported couple includes historic gifts.
- AC10. Re-running a practice run binds every role on every row to the same targets.
- AC11. Placeholder addresses are blank and listed. Plus-tag aliases are kept as distinct addresses.

## 3. Monitors

| ID      | Signal                                                                                | Threshold                                          | Owner       | Response                                    |
| ------- | ------------------------------------------------------------------------------------- | -------------------------------------------------- | ----------- | ------------------------------------------- |
| M-Q10-1 | Commits failing on the email index                                                    | 0                                                  | Phase 30    | Block the run; fix the holder resolution    |
| M-Q10-2 | Gifts attached by email where the first name disagrees, or to a marked shared mailbox | 0                                                  | Phase 4     | Halt attachment; correct through review     |
| M-Q10-3 | Source households with two or more members versus Asym households created             | Equal                                              | Phase 30    | Reconciliation item before sign-off         |
| M-Q10-4 | Flagged combined-name records at the final export                                     | Learning signal; should fall between practice runs | Switch lead | Prompt fixes at the source                  |
| M-Q10-5 | Duplicate candidates per 1,000 people after the switch                                | Learning signal (expect 100–180)                   | Phase 4     | Size the review queue; recalibrate matching |

## 4. Owner requirements (proposed O47–O49) and discrepancy D32

- **O47** (Phase 4):
  - Guest-gift and import matching attach on email only when the first name also agrees and no shared-mailbox marker exists; otherwise the match goes to review.
  - Duplicate scoring shows same-household or shared-mailbox pairs as "likely spouses", not high-confidence duplicates.
  - "Not a duplicate" decisions are recorded and reversible.
  - This is a Switch gate.
- **O48** (Phase 4/9):
  - Decide whether two people may share a contact email while the claim and login key stays unique (contact points).
  - Give additional emails and phones a home.
  - Until then, one holder plus evidence.
- **O49** (Phase 9 with Phase 14):
  - Household Parties and memberships created by import, with membership starting "before {Switch Boundary}, date unknown" and counted for household recognition of historic gifts.
  - Households without a head are allowed.
  - The head is primary for mail and display only.
- **D32:** the installed `donors_tenant_email_normalized_uidx` counts merged donors (`identity-email-normalization.md:81-90`), while P4:268 intended a key that excludes them.

## 5. Rejected alternatives

| Alternative                                | Why rejected                                                                                                                              |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| B. The household is the donor              | Contradicts #570, P7 one legal donor, P4 distinct Parties and P19 per-donor statements. CRA requires the "true donor"                     |
| C. Automatic splitting and grouping        | CiviCRM/Wikimedia surname loss; address-built households join roommates, adult children and ex-spouses; heavy review load                 |
| Splitting combined names during import     | Needs reviewer judgement per row, and the gifts' owner is unknown. Fixing at the source, or renaming after the switch, keeps source truth |
| Holding children for review under Phase 10 | No owner basis (Phase 10 has no rule for minors)                                                                                          |
| Allowing the same email on two people now  | Conflicts with the installed key and the claim and login rule (ADR-0214). Left to O48                                                     |
